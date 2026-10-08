// Configuración central del portal: roles, permisos, familias de cargo y estados.

export const ROLES = {
  ADMIN: 'Administrador',
  RECLUTADOR: 'Reclutador', // analista de reclutamiento: solicita las evaluaciones
  PSICOLOGO: 'Psicólogo', // realiza la evaluación y avanza el estado
};

// Qué puede hacer cada rol. Para cambiar un permiso, edita solo esta tabla.
export const PERMISOS = {
  [ROLES.ADMIN]: { crearUsuarios: true, crearSolicitud: true, cambiarEstado: true },
  [ROLES.RECLUTADOR]: { crearUsuarios: false, crearSolicitud: true, cambiarEstado: false },
  [ROLES.PSICOLOGO]: { crearUsuarios: false, crearSolicitud: false, cambiarEstado: true },
};

export const permisosDe = (rol) =>
  PERMISOS[rol] || { crearUsuarios: false, crearSolicitud: false, cambiarEstado: false };

// EDITAR: reemplaza por las familias de cargo reales. Deben coincidir con las que
// usa tu flujo de Power Automate para elegir la plantilla (Excel y Word).
export const FAMILIAS_CARGO = [
  'Jefaturas',
  'Operaciones',
  'Administrativos',
  'Profesionales y técnicos',
];

// Estados por los que avanza una solicitud.
export const ESTADOS = ['Pendiente', 'En Revisión', 'Informe enviado'];

// URL del disparador HTTP de Power Automate (ver .env.example).
// Si está vacía, la solicitud solo se guarda en la página.
export const WEBHOOK_URL = import.meta.env.VITE_SOLICITUDES_WEBHOOK_URL || '';
