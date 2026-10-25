import Icon from './Icon';
import { claseEstado } from '../estados';

// Un ícono y un color propios por estado, para distinguirlos de un vistazo.
const META = {
  Pendiente: {
    clase: 'pendiente',
    icono: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
  },
  'En Revisión': {
    clase: 'en-revision',
    icono: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  Aprobado: {
    clase: 'aprobado',
    icono: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
  },
  Rechazado: {
    clase: 'rechazado',
    icono: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6M9 9l6 6" />
      </>
    ),
  },
};

export default function EstadoBadge({ estado }) {
  const meta = META[estado] || META.Pendiente;
  const clase = claseEstado(estado);
  return (
    <span className={`badge badge-estado badge-${clase}`}>
      <Icon className="icon icon-estado">{meta.icono}</Icon>
      {estado}
    </span>
  );
}
