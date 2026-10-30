// ==========================================
// 1. IMPORTACIONES
// ==========================================
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// 2. CONFIGURACIÓN Y VARIABLES DE ENTORNO
// ==========================================
dotenv.config();

const { SUPABASE_URL, SUPABASE_KEY, JWT_SECRET } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY || !JWT_SECRET) {
  console.error(
    'Faltan variables en el .env: SUPABASE_URL, SUPABASE_KEY y JWT_SECRET son obligatorias.'
  );
  process.exit(1);
}

const app = express();

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174'
)
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origen no permitido por CORS'));
    },
  })
);
app.use(express.json());

// ==========================================
// 3. CONEXIÓN A SUPABASE
// ==========================================
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TIPOS_PERMITIDOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    if (TIPOS_PERMITIDOS.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Solo se permiten archivos PDF o Word (.doc, .docx).'));
  },
});

const ESTADOS_VALIDOS = ['Pendiente', 'En Revisión', 'Aprobado', 'Rechazado'];
const ROLES_ADMIN = ['admin', 'administrador'];
const esAdmin = (rol) => ROLES_ADMIN.includes(String(rol || '').trim().toLowerCase());

// ==========================================
// 4. MIDDLEWARES DE SEGURIDAD
// ==========================================

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada.' });
  }
}

function requireAdmin(req, res, next) {
  if (!esAdmin(req.user?.rol)) {
    return res.status(403).json({ error: 'No tienes permisos para esta acción.' });
  }
  return next();
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
});

const solicitudLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Has enviado demasiadas solicitudes. Intenta más tarde.' },
});

// ==========================================
// 5. RUTAS PÚBLICAS
// ==========================================

app.get('/', (req, res) => {
  res.send('API Backend AquaChile funcionando correctamente');
});

// POST: Enviar solicitud
app.post(
  '/api/solicitudes',
  solicitudLimiter,
  upload.single('cv'),
  async (req, res) => {
    try {
      const { nombreCandidato, familiaCargo, nombreCargo } = req.body;
      const file = req.file;

      if (!nombreCandidato || !familiaCargo || !nombreCargo) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
      }

      let cvUrl = null;

      if (file) {
        const cleanFileName = file.originalname
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9.-]/g, '_');

        const fileName = `${Date.now()}_${cleanFileName}`;

        const { error: storageError } = await supabase.storage
          .from('cvs')
          .upload(fileName, file.buffer, { contentType: file.mimetype });

        if (storageError) throw storageError;

        const { data: publicUrlData } = supabase.storage
          .from('cvs')
          .getPublicUrl(fileName);

        cvUrl = publicUrlData.publicUrl;
      }

      const { data: nuevaSolicitud, error } = await supabase
        .from('solicitudes')
        .insert([
          {
            nombre_candidato: String(nombreCandidato).trim(),
            familia_cargo: String(familiaCargo).trim(),
            nombre_cargo: String(nombreCargo).trim(),
            cv_url: cvUrl,
            estado: 'Pendiente',
          },
        ])
        .select('id')
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        codigo: nuevaSolicitud?.id,
        message: 'Solicitud enviada con éxito',
      });
    } catch (error) {
      console.error('Error al guardar solicitud:', error);
      return res.status(500).json({ error: 'No se pudo guardar la solicitud.' });
    }
  }
);

// POST: Login
app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const cleanPassword = password ? String(password) : '';

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.error('Error de Supabase en login:', error.message);
      return res.status(500).json({ error: 'Error al consultar la base de datos.' });
    }

    if (!usuario) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const guardada = String(usuario.password);
    const estaCifrada = /^\$2[aby]\$/.test(guardada);

    let valida = false;
    if (estaCifrada) {
      valida = await bcrypt.compare(cleanPassword, guardada);
    } else {
      valida = guardada.trim() === cleanPassword.trim();
      if (valida) {
        const nuevoHash = await bcrypt.hash(cleanPassword.trim(), 10);
        await supabase
          .from('usuarios')
          .update({ password: nuevoHash })
          .eq('id', usuario.id);
      }
    }

    if (!valida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    if (!esAdmin(usuario.rol)) {
      return res
        .status(403)
        .json({ error: 'No tienes permisos para acceder al panel.' });
    }

    const payload = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre || 'Administrador',
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    return res.status(200).json({ success: true, token, usuario: payload });
  } catch (err) {
    console.error('Error en el servidor durante el login:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ==========================================
// 6. RUTAS PROTEGIDAS
// ==========================================

app.get('/api/me', requireAuth, requireAdmin, (req, res) => {
  const { id, email, nombre, rol } = req.user;
  res.status(200).json({ usuario: { id, email, nombre, rol } });
});

app.get('/api/solicitudes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('solicitudes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: 'No se pudieron obtener las solicitudes.' });
  }
});

app.get('/api/historial', requireAuth, requireAdmin, async (req, res) => {
  try {
    const limite = Math.min(parseInt(req.query.limit, 10) || 200, 500);

    let consulta = supabase
      .from('historial_cambios')
      .select(
        'id, solicitud_id, estado_anterior, estado_nuevo, created_at, solicitudes(nombre_candidato, nombre_cargo), usuarios(nombre, email)'
      )
      .order('created_at', { ascending: false })
      .limit(limite);

    if (req.query.solicitud_id) {
      consulta = consulta.eq('solicitud_id', req.query.solicitud_id);
    }

    const { data, error } = await consulta;

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'No se pudo obtener el historial.' });
  }
});

app.patch(
  '/api/solicitudes/:id/estado',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        error: `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}.`,
      });
    }

    try {
      const { data: actual } = await supabase
        .from('solicitudes')
        .select('estado')
        .eq('id', id)
        .maybeSingle();
      const estadoAnterior = actual?.estado || 'Pendiente';

      const { data: previo } = await supabase
        .from('historial_cambios')
        .select('id')
        .eq('solicitud_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data, error } = await supabase
        .from('solicitudes')
        .update({ estado })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error Supabase al actualizar estado:', error.message);
        return res.status(400).json({ error: 'No se pudo actualizar el estado.' });
      }

      if (data?.length && estadoAnterior !== estado) {
        try {
          const { data: ultimo } = await supabase
            .from('historial_cambios')
            .select('id, usuario_id')
            .eq('solicitud_id', id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (ultimo && ultimo.id !== previo?.id) {
            if (!ultimo.usuario_id) {
              await supabase
                .from('historial_cambios')
                .update({ usuario_id: req.user.id })
                .eq('id', ultimo.id);
            }
          } else {
            await supabase.from('historial_cambios').insert([
              {
                solicitud_id: id,
                usuario_id: req.user.id,
                estado_anterior: estadoAnterior,
                estado_nuevo: estado,
              },
            ]);
          }
        } catch (histError) {
          console.error('Error al registrar historial:', histError);
        }
      }

      res
        .status(200)
        .json({ success: true, message: 'Estado actualizado correctamente', data });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({ error: 'Error interno al actualizar el estado' });
    }
  }
);

app.post('/api/usuarios', requireAuth, requireAdmin, async (req, res) => {
  const { nombre, email, rol, password } = req.body;

  if (!nombre || !email || !rol || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  if (String(password).length < 8) {
    return res
      .status(400)
      .json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  try {
    const passwordHash = await bcrypt.hash(String(password), 10);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre: String(nombre).trim(),
          email: String(email).trim().toLowerCase(),
          rol: String(rol).trim(),
          password: passwordHash,
        },
      ])
      .select('id, nombre, email, rol');

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Ya existe un usuario con ese correo.' });
      }
      throw error;
    }

    res.status(200).json({ success: true, message: 'Usuario creado con éxito', data });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'No se pudo crear el usuario.' });
  }
});

// ==========================================
// 7. MANEJO DE ERRORES (Sintaxis corregida)
// ==========================================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const mensaje =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'El archivo supera el máximo de 5 MB.'
        : err.message;
    return res.status(400).json({ error: mensaje });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  return next();
});

// ==========================================
// 8. INICIALIZACIÓN
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});