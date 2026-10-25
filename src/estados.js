// Clase CSS de cada estado (badge-<clase>, stat-<clase>, chip-<clase>).
const CLASES = {
  Pendiente: 'pendiente',
  'En Revisión': 'en-revision',
  Aprobado: 'aprobado',
  Rechazado: 'rechazado',
};

export const claseEstado = (estado) => CLASES[estado] || 'pendiente';
