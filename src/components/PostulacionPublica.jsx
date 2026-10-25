import logoAquaChile from '../assets/AquaChile-Colour.png';
import FormularioSolicitud from '../FormularioSolicitud';

// Vista pública (no requiere sesión): solo contiene el formulario de solicitud.
// Se abre con el enlace  <sitio>/#/postular
export default function PostulacionPublica({ onNuevaSolicitud }) {
  return (
    <div className="form-page">
      <div className="form-card-wrap">
        <div className="logo-crop logo-center">
          <img src={logoAquaChile} alt="AquaChile" />
        </div>
        <FormularioSolicitud onSubmitSolicitud={onNuevaSolicitud} />
        <small className="public-footer">© AquaChile. Todos los derechos reservados.</small>
      </div>
    </div>
  );
}
