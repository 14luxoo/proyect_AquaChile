const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'aquachile_secreto_super_seguro';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nwbyvysesifjmtedkhcy.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_secret_Lzo7E7nOzKgRhamDIQEmQQ_6Nmf8yRM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false
  }
});

// 2. MULTER (Memoria RAM)
const upload = multer({ storage: multer.memoryStorage() });

// --- RUTAS DE AUTENTICACIÓN ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nombre } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ email, password: hashedPassword, nombre, rol: 'reclutador' }])
      .select();

    if (error) {
      return res.status(400).json({ mensaje: 'Error al registrar usuario', error: error.message });
    }

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: data[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email);

    if (error || !usuarios || usuarios.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = usuarios[0];
    const esValida = await bcrypt.compare(password, usuario.password);

    if (!esValida) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
      SECRET_KEY,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: { nombre: usuario.nombre, email: usuario.email }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
});

// --- RUTAS DE SOLICITUDES DE CANDIDATOS ---

// --- RUTAS DE SOLICITUDES DE CANDIDATOS ---

app.post('/api/solicitudes', upload.single('cvFile'), async (req, res) => {
  try {
    const { nombreCandidato, familiaCargo, nombreCargo } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ mensaje: 'Es necesario adjuntar un archivo CV.' });
    }

    // A. Sanitizar y definir el nombre único del archivo
    const ext = file.originalname.split('.').pop();
    const fileName = `${Date.now()}_cv.${ext}`;

    // B. Subir directamente vía REST API a Supabase Storage (Bypass del SDK)
    const storageEndpoint = `https://nwbyvysesifjmtedkhcy.supabase.co/storage/v1/object/cvs/${fileName}`;
    
    const uploadResponse = await fetch(storageEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': file.mimetype || 'application/octet-stream',
        'x-upsert': 'true'
      },
      body: file.buffer
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Error directo en Supabase Storage API:', errorText);
      return res.status(500).json({ mensaje: 'Error al subir el CV al almacenamiento.', detalle: errorText });
    }

    // C. Construir la URL pública del archivo
    const cvUrl = `https://nwbyvysesifjmtedkhcy.supabase.co/storage/v1/object/public/cvs/${fileName}`;

    // D. Insertar el registro en la base de datos PostgreSQL mediante el SDK
    const { data, error: dbError } = await supabase
      .from('solicitudes')
      .insert([
        {
          nombre_candidato: nombreCandidato,
          familia_cargo: familiaCargo,
          nombre_cargo: nombreCargo,
          cv_url: cvUrl
        }
      ])
      .select();

    if (dbError) {
      console.error('Error al insertar en DB:', dbError);
      return res.status(500).json({ mensaje: 'Error al guardar la solicitud en la base de datos.', error: dbError.message });
    }

    console.log('¡ÉXITO TOTAL! Solicitud registrada:', data[0]);

    res.status(201).json({
      mensaje: '¡Solicitud y CV guardados exitosamente!',
      data: data[0]
    });

  } catch (error) {
    console.error('Error general:', error);
    res.status(500).json({ mensaje: 'Error al procesar la solicitud.' });
  }
});

app.get('/api/solicitudes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('solicitudes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const solicitudesFormateadas = data.map(item => ({
      _id: item.id,
      nombreCandidato: item.nombre_candidato,
      familiaCargo: item.familia_cargo,
      nombreCargo: item.nombre_cargo,
      cvArchivo: item.cv_url
    }));

    res.status(200).json(solicitudesFormateadas);
  } catch (error) {
    console.error('Error al consultar Supabase:', error);
    res.status(500).json({ mensaje: 'Error al obtener las solicitudes.' });
  }
});

// --- VERIFICAR Y CREAR USUARIO ADMIN INICIAL ---
const crearAdminInicial = async () => {
  try {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', 'admin@aquachile.cl');

    if (!data || data.length === 0) {
      const hashedPassword = await bcrypt.hash('123', 10);
      await supabase.from('usuarios').insert([
        {
          email: 'admin@aquachile.cl',
          password: hashedPassword,
          nombre: 'Psicólogo Reclutador',
          rol: 'reclutador'
        }
      ]);
      console.log('Usuario inicial admin@aquachile.cl listo.');
    }
  } catch (err) {
    console.log('Aviso: Asegúrate de ejecutar los scripts SQL en Supabase.');
  }
};

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  crearAdminInicial();
});