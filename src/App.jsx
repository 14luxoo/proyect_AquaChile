import { useEffect, useState } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import FormularioSolicitud from './FormularioSolicitud';
import { ESTADOS, ROLES, WEBHOOK_URL, permisosDe } from './config';
import './App.css';

// DEMO: reemplazar por tu backend / base de datos.
const USUARIOS_INICIALES = [
  {
    email: 'admin@aquachile.cl',
    password: 'admin123',
    nombre: 'Administrador',
    rol: ROLES.ADMIN,
  },
];

const SOLICITUDES_INICIALES = [
  {
    id: 1,
    candidato: 'Juan Pérez',
    familiaCargo: 'Jefaturas',
    cargo: 'Jefe de Planta',
    fecha: '2026-03-28',
    estado: 'Pendiente',
  },
  {
    id: 2,
    candidato: 'María González',
    familiaCargo: 'Operaciones',
    cargo: 'Operador de Recirculación',
    fecha: '2026-03-29',
    estado: 'En Revisión',
  },
];

// Estado persistido en localStorage (solo para la demo, sin backend).
function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [key, value]);

  return [value, setValue];
}

// Envía la solicitud al flujo de Power Automate (disparador HTTP).
// El flujo recibe este JSON:
// {
//   idSolicitud, fecha,
//   solicitante: { nombre, email },
//   candidato, familiaCargo, cargo,
//   cv: { nombre, tipo, contenidoBase64 } | null
// }
async function enviarAFlujo(solicitud) {
  const cv = solicitud.cv
    ? {
        nombre: solicitud.cv.nombre,
        tipo: solicitud.cv.tipo,
        contenidoBase64: solicitud.cv.data.split(',')[1],
      }
    : null;

  const respuesta = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idSolicitud: solicitud.id,
      fecha: solicitud.fecha,
      solicitante: { nombre: solicitud.solicitante, email: solicitud.solicitanteEmail },
      candidato: solicitud.candidato,
      familiaCargo: solicitud.familiaCargo,
      cargo: solicitud.cargo,
      cv,
    }),
  });

  if (!respuesta.ok) throw new Error(`El flujo respondió ${respuesta.status}`);
}

function App() {
  // Vistas: 'login' | 'admin' | 'postulante' (envío público, sin cuenta)
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [usuarios, setUsuarios] = usePersistentState('aquachile_usuarios', USUARIOS_INICIALES);
  const [solicitudes, setSolicitudes] = usePersistentState(
    'aquachile_solicitudes',
    SOLICITUDES_INICIALES
  );

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  // Solo un administrador puede crear usuarios (se valida aquí también, no solo en la UI).
  const handleCreateUser = (nuevo) => {
    if (!permisosDe(currentUser?.rol).crearUsuarios) {
      return { ok: false, error: 'No tienes permisos para crear usuarios.' };
    }
    if (!Object.values(ROLES).includes(nuevo.rol)) {
      return { ok: false, error: 'Rol no válido.' };
    }
    const email = nuevo.email.trim().toLowerCase();
    if (usuarios.some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, error: 'Ya existe un usuario con ese correo.' };
    }
    setUsuarios((prev) => [...prev, { ...nuevo, email, nombre: nuevo.nombre.trim() }]);
    return { ok: true };
  };

  // Crea una solicitud. Puede venir de un usuario con sesión (se toma su nombre y correo)
  // o del formulario público sin cuenta (el solicitante escribe su nombre y correo).
  const handleNuevaSolicitud = async (datos) => {
    // Con sesión iniciada se exige el permiso del rol; sin sesión es el envío público.
    if (currentUser && !permisosDe(currentUser.rol).crearSolicitud) {
      return { ok: false, error: 'No tienes permisos para crear solicitudes.' };
    }

    const solicitante = currentUser ? currentUser.nombre : (datos.solicitanteNombre || '').trim();
    const solicitanteEmail = currentUser
      ? currentUser.email
      : (datos.solicitanteEmail || '').trim().toLowerCase();

    if (!solicitante || !solicitanteEmail) {
      return { ok: false, error: 'Ingresa tu nombre y correo para enviar la solicitud.' };
    }

    const nueva = {
      id: Date.now(),
      candidato: datos.nombreCandidato.trim(),
      familiaCargo: datos.familiaCargo,
      cargo: datos.nombreCargo.trim(),
      fecha: new Date().toISOString().slice(0, 10),
      estado: ESTADOS[0],
      solicitante,
      solicitanteEmail,
      cv: datos.cv || null, // { nombre, tipo, data (data URL) }
    };

    // Comprobamos que cabe en localStorage antes de aceptar la solicitud.
    try {
      localStorage.setItem('aquachile_solicitudes', JSON.stringify([...solicitudes, nueva]));
    } catch {
      return {
        ok: false,
        error: 'No hay espacio para guardar el CV. Prueba con un archivo más liviano.',
      };
    }

    setSolicitudes((prev) => [...prev, nueva]);

    // Si hay un flujo configurado, se le entrega la solicitud.
    let aviso = '';
    if (WEBHOOK_URL) {
      try {
        await enviarAFlujo(nueva);
      } catch (err) {
        console.error(err);
        aviso = 'La solicitud se guardó, pero no se pudo enviar al flujo de Power Automate.';
      }
    }

    return { ok: true, aviso };
  };

  // Solo roles con permiso (Administrador y Psicólogo) pueden avanzar el estado.
  const handleCambiarEstado = (id, estado) => {
    if (!permisosDe(currentUser?.rol).cambiarEstado || !ESTADOS.includes(estado)) return;
    setSolicitudes((prev) => prev.map((s) => (s.id === id ? { ...s, estado } : s)));
  };

  return (
    <>
      {currentView === 'login' && (
        <Login
          usuarios={usuarios}
          onLoginSuccess={handleLoginSuccess}
          onEnterPostulante={() => setCurrentView('postulante')}
        />
      )}

      {/* Envío rápido sin cuenta */}
      {currentView === 'postulante' && (
        <FormularioSolicitud
          publico
          onSubmitSolicitud={handleNuevaSolicitud}
          onBack={() => setCurrentView('login')}
        />
      )}

      {/* Solo se muestra si hay un usuario con sesión iniciada */}
      {currentView === 'admin' && currentUser && (
        <AdminDashboard
          user={currentUser}
          usuarios={usuarios}
          solicitudes={solicitudes}
          onCreateUser={handleCreateUser}
          onNuevaSolicitud={handleNuevaSolicitud}
          onCambiarEstado={handleCambiarEstado}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
