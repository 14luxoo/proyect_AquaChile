// Configuración central del portal: roles, permisos, familias de cargo y estados.

export const ROLES = {
  ADMIN: 'Administrador',
  RECLUTADOR: 'Reclutador', // analista de reclutamiento: solicita las evaluaciones
  PSICOLOGO: 'Psicólogo', // realiza la evaluación y avanza el estado
};

// Qué puede hacer cada rol. Para cambiar un permiso, edita solo esta tabla.
// - crearUsuarios: ver la sección "Crear usuarios".
// - cambiarEstado: cambiar el estado de una solicitud (queda registrado en el historial).
// - verHistorial: ver el historial de cambios de estado.
// Las solicitudes ya no se crean desde el panel: se envían desde el formulario público (RUTA_POSTULAR).
export const PERMISOS = {
  [ROLES.ADMIN]: { crearUsuarios: true, cambiarEstado: true, verHistorial: true },
  [ROLES.RECLUTADOR]: { crearUsuarios: false, cambiarEstado: false, verHistorial: false },
  [ROLES.PSICOLOGO]: { crearUsuarios: false, cambiarEstado: true, verHistorial: false },
};

export const permisosDe = (rol) =>
  PERMISOS[rol] || { crearUsuarios: false, cambiarEstado: false, verHistorial: false };

// Dirección (hash) de la vista pública del formulario. Ej.: https://tu-sitio.cl/#/postular
export const RUTA_POSTULAR = '#/postular';

// EDITAR: reemplaza por las familias de cargo reales. Deben coincidir con las que
// usa tu flujo de Power Automate para elegir la plantilla (Excel y Word).
export const FAMILIAS_CARGO = [
  'Jefaturas',
  'Operaciones',
  'Administrativos',
  'Profesionales y técnicos',
];

// Estados por los que avanza una solicitud. Toda solicitud nueva entra como "Pendiente".
export const ESTADOS = ['Pendiente', 'En Revisión', 'Aprobado', 'Rechazado'];

// Estados antiguos que se convierten automáticamente al cargar datos ya guardados.
export const ESTADOS_ANTIGUOS = { 'Informe enviado': 'Aprobado' };

// Currículum: solo PDF.
export const MAX_CV_BYTES = 2 * 1024 * 1024; // 2 MB (el almacenamiento de la demo es limitado)

// URL del disparador HTTP de Power Automate (ver .env.example).
// Si está vacía, la solicitud solo se guarda en la página.
export const WEBHOOK_URL = import.meta.env.VITE_SOLICITUDES_WEBHOOK_URL || '';
