// 1. IMPORTACIONES DE LIBRERÍAS
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 2. CONFIGURACIÓN INICIAL Y VARIABLES DE ENTORNO
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 3. CONEXIÓN A SUPABASE
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configurar Multer para recibir archivos en memoria antes de subirlos a Supabase
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true); // Acepta el archivo
    } else {
      cb(new Error('Formato no válido. Solo se permiten archivos PDF.')); // Rechaza el archivo
    }
  }
});

// ==========================================
// 4. RUTAS DE LA API
// ==========================================

// Ruta de prueba para verificar que el backend funciona
app.get('/', (req, res) => {
  res.send('API Backend AquaChile funcionando correctamente');
});

// GET: Listar todas las solicitudes para el Dashboard
app.get('/api/solicitudes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('solicitudes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Registrar nueva postulación / solicitud
app.post('/api/solicitudes', upload.single('cv'), async (req, res) => {
  try {
    const { nombreCandidato, familiaCargo, nombreCargo } = req.body;
    const file = req.file;

    let cvUrl = null;

    // Si el candidato adjuntó un archivo
    if (file) {
      // Sanitizar el nombre del archivo
      const cleanFileName = file.originalname
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.-]/g, '_');

      const fileName = `${Date.now()}_${cleanFileName}`;

      // Subir archivo al Bucket 'cvs' de Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('cvs')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (storageError) throw storageError;

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('cvs')
        .getPublicUrl(fileName);

      cvUrl = publicUrlData.publicUrl;
    }

    // Insertar registro en la tabla 'solicitudes'
    const { data, error } = await supabase
      .from('solicitudes')
      .insert([
        {
          nombre_candidato: nombreCandidato,
          familia_cargo: familiaCargo,
          nombre_cargo: nombreCargo,
          cv_url: cvUrl,
          estado: 'Pendiente' // Estado por defecto
        },
      ])
      .select();

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Solicitud enviada con éxito', data });
  } catch (error) {
    console.error('Error al guardar solicitud:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH: Actualizar el estado de una solicitud y guardar en el historial
app.patch('/api/solicitudes/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado, usuarioId } = req.body; // Recibimos el estado nuevo y el ID del admin

  if (!estado) {
    return res.status(400).json({ error: 'El campo estado es requerido.' });
  }

  try {
    // 1. Consultar el estado actual antes de actualizar
    const { data: solicitudActual, error: fetchError } = await supabase
      .from('solicitudes')
      .select('estado')
      .eq('id', id)
      .single();

    if (fetchError || !solicitudActual) {
      return res.status(404).json({ error: 'Solicitud no encontrada.' });
    }

    const estadoAnterior = solicitudActual.estado;

    // 2. Actualizar el estado en la tabla 'solicitudes'
    const { data: solicitudActualizada, error: updateError } = await supabase
      .from('solicitudes')
      .update({ estado })
      .eq('id', id)
      .select();

    if (updateError) throw updateError;

    // 3. Registrar el movimiento en la tabla 'historial_cambios'
    const { error: historialError } = await supabase
      .from('historial_cambios')
      .insert([
        {
          solicitud_id: id,
          usuario_id: usuarioId || null, // ID del administrador que hizo el cambio
          estado_anterior: estadoAnterior,
          estado_nuevo: estado,
        },
      ]);

    if (historialError) {
      console.error('Error al guardar en el historial:', historialError);
      // No frenamos la respuesta si falla el historial, pero lo registramos en consola
    }

    res.status(200).json({
      success: true,
      message: 'Estado actualizado e historial registrado correctamente',
      data: solicitudActualizada,
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error interno al actualizar el estado' });
  }
});

// POST: Iniciar Sesión (Login)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPassword = password ? String(password).trim() : '';

    console.log('Intento de login con:', { cleanEmail, cleanPassword });

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.error('Error de Supabase en login:', error);
      return res.status(500).json({ error: 'Error al consultar la base de datos.' });
    }

    if (!usuario) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    if (String(usuario.password).trim() !== cleanPassword) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    console.log('Login exitoso para:', usuario.email);

    return res.status(200).json({
      success: true,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre || 'Administrador',
        rol: usuario.rol,
      },
    });
  } catch (err) {
    console.error('Error en el servidor durante el login:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST: Registrar nuevos usuarios
app.post('/api/usuarios', async (req, res) => {
  const { nombre, email, rol, password } = req.body;

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre,
          email: email.toLowerCase().trim(),
          rol,
          password,
        },
      ])
      .select();

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Usuario creado con éxito', data });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Obtener el historial de cambios (incluyendo datos del usuario y solicitud)
app.get('/api/historial', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('historial_cambios')
      .select(`
        id,
        estado_anterior,
        estado_nuevo,
        created_at,
        solicitudes ( id, nombre_candidato, nombre_cargo ),
        usuarios ( id, nombre, email, rol )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. INICIALIZACIÓN DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});