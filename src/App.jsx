import { useEffect, useState } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import PostulacionPublica from './components/PostulacionPublica';
import { ESTADOS, ESTADOS_ANTIGUOS, ROLES, RUTA_POSTULAR, WEBHOOK_URL, permisosDe } from './config';
import './App.css';

// Prioriza la URL del archivo .env.local; si no existe, usa la de config.js
const API_WEBHOOK_URL = import.meta.env.VITE_APPS_SCRIPT_URL || WEBHOOK_URL;

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
function usePersistentState(key, initialValue, migrate = (v) => v) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? migrate(JSON.parse(saved)) : initialValue;
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

// Envía la solicitud al flujo de Google Apps Script / Power Automate.
async function enviarAFlujo(solicitud) {
  const cv = solicitud.cv
    ? {
        nombre: solicitud.cv.nombre,
        tipo: solicitud.cv.tipo,
        contenidoBase64: solicitud.cv.data.split(',')[1],
      }
    : null;

  // Se envía como text/plain para evitar el preflight CORS (OPTIONS) en Google Apps Script
  const respuesta = await fetch(API_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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

  // El script de Google Drive responde { ok: true | false, error }.
  const resultado = await respuesta.json().catch(() => null);
  if (resultado && resultado.ok === false) {
    throw new Error(resultado.error || 'El flujo rechazó la solicitud.');
  }
}

// Vista según la dirección: "#/postular" abre el formulario público; el resto, el login.
const esRutaPublica = (hash) => hash.startsWith(RUTA_POSTULAR);

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [hash, setHash] = useState(() => window.location.hash);
  const [usuarios, setUsuarios] = usePersistentState('aquachile_usuarios', USUARIOS_INICIALES);
  const [solicitudes, setSolicitudes] = usePersistentState(
    'aquachile_solicitudes',
    SOLICITUDES_INICIALES,
    (lista) =>
      lista.map((s) => (ESTADOS_ANTIGUOS[s.estado] ? { ...s, estado: ESTADOS_ANTIGUOS[s.estado] } : s))
  );
  const [historial, setHistorial] = usePersistentState('aquachile_historial', []);

  useEffect(() => {
    const alCambiarHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', alCambiarHash);
    return () => window.removeEventListener('hashchange', alCambiarHash);
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

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

  const handleNuevaSolicitud = async (datos) => {
    const cv = datos.cv || null;
    if (!cv || !cv.data?.startsWith('data:application/pdf')) {
      return { ok: false, error: 'El currículum debe ser un archivo PDF.' };
    }

    const id = Date.now();
    const nueva = {
      id,
      candidato: datos.nombreCandidato.trim(),
      familiaCargo: datos.familiaCargo,
      cargo: datos.nombreCargo.trim(),
      fecha: new Date().toISOString().slice(0, 10),
      estado: ESTADOS[0],
      solicitante: datos.solicitante.trim(),
      solicitanteEmail: datos.solicitanteEmail.trim().toLowerCase(),
      cv,
    };

    try {
      localStorage.setItem('aquachile_solicitudes', JSON.stringify([...solicitudes, nueva]));
    } catch {
      return {
        ok: false,
        error: 'No hay espacio para guardar el CV. Prueba con un archivo más liviano.',
      };
    }

    setSolicitudes((prev) => [...prev, nueva]);

    let aviso = '';
    if (API_WEBHOOK_URL) {
      try {
        await enviarAFlujo(nueva);
      } catch (err) {
        console.error(err);
        aviso = 'La solicitud se guardó, pero no se pudo enviar el currículum a la carpeta de solicitudes.';
      }
    }

    return { ok: true, aviso, codigo: `AQ-${String(id).slice(-6)}` };
  };

  const handleCambiarEstado = (id, estado) => {
    if (!permisosDe(currentUser?.rol).cambiarEstado || !ESTADOS.includes(estado)) return;

    const solicitud = solicitudes.find((s) => s.id === id);
    if (!solicitud || solicitud.estado === estado) return;

    setSolicitudes((prev) => prev.map((s) => (s.id === id ? { ...s, estado } : s)));
    setHistorial((prev) => [
      {
        id: `${Date.now()}-${id}`,
        solicitudId: id,
        candidato: solicitud.candidato,
        desde: solicitud.estado,
        hacia: estado,
        porNombre: currentUser.nombre,
        porEmail: currentUser.email,
        porRol: currentUser.rol,
        fecha: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  if (esRutaPublica(hash)) {
    return <PostulacionPublica onNuevaSolicitud={handleNuevaSolicitud} />;
  }

  return (
    <>
      {currentView === 'login' && (
        <Login usuarios={usuarios} onLoginSuccess={handleLoginSuccess} />
      )}

      {currentView === 'admin' && currentUser && (
        <AdminDashboard
          user={currentUser}
          usuarios={usuarios}
          solicitudes={solicitudes}
          historial={historial}
          onCreateUser={handleCreateUser}
          onCambiarEstado={handleCambiarEstado}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;