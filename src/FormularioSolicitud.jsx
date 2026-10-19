import { useState } from 'react';
import logoAquaChile from './assets/AquaChile-Colour.png';
import { FAMILIAS_CARGO } from './config';

const MAX_CV_BYTES = 2 * 1024 * 1024; // 2 MB (el almacenamiento de la demo es limitado)
const EXTENSIONES_VALIDAS = ['pdf', 'doc', 'docx'];

const leerComoDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });

const estadoInicial = {
  solicitanteNombre: '',
  solicitanteEmail: '',
  nombreCandidato: '',
  familiaCargo: '',
  nombreCargo: '',
  cvFile: null,
};

// Formulario de solicitud. Dos modos:
//  - dentro del panel (usuarios con sesión): se toma el solicitante de la sesión.
//  - `publico`: página independiente, sin cuenta; el solicitante escribe su nombre y correo.
export default function FormularioSolicitud({ onSubmitSolicitud, publico = false, onBack }) {
  const [formData, setFormData] = useState(estadoInicial);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [formKey, setFormKey] = useState(0); // permite limpiar el input de archivo
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setError('');

    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!EXTENSIONES_VALIDAS.includes(ext)) {
        setError('El CV debe ser un archivo PDF o Word (.pdf, .doc, .docx).');
        e.target.value = '';
        setFormData((prev) => ({ ...prev, cvFile: null }));
        return;
      }
      if (file.size > MAX_CV_BYTES) {
        setError('El CV no puede superar los 2 MB.');
        e.target.value = '';
        setFormData((prev) => ({ ...prev, cvFile: null }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, cvFile: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;

    setError('');
    setAviso('');
    setEnviado(false);
    setEnviando(true);

    try {
      // Convertimos el archivo a data URL para poder guardarlo y descargarlo después.
      let cv = null;
      if (formData.cvFile) {
        cv = {
          nombre: formData.cvFile.name,
          tipo: formData.cvFile.type || 'application/octet-stream',
          data: await leerComoDataUrl(formData.cvFile),
        };
      }

      const resultado = await onSubmitSolicitud?.({ ...formData, cv });
      if (resultado && !resultado.ok) {
        setError(resultado.error);
        return;
      }

      setAviso(resultado?.aviso || '');
      setEnviado(true);
      setFormData(estadoInicial);
      setFormKey((k) => k + 1);
    } catch (err) {
      setError(err.message || 'No se pudo enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  const alertas = (
    <>
      {enviado && (
        <div className="alert alert-success" role="status">
          ¡Solicitud enviada con éxito!
        </div>
      )}
      {aviso && (
        <div className="alert alert-warning" role="alert">
          {aviso}
        </div>
      )}
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
    </>
  );

  const formulario = (
        <form onSubmit={handleSubmit} key={formKey}>
          {publico && (
            <>
              <div className="field">
                <label htmlFor="solicitanteNombre">Tu nombre</label>
                <input
                  id="solicitanteNombre"
                  type="text"
                  name="solicitanteNombre"
                  value={formData.solicitanteNombre}
                  onChange={handleInputChange}
                  placeholder="Nombre de quien solicita"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="solicitanteEmail">Tu correo</label>
                <input
                  id="solicitanteEmail"
                  type="email"
                  name="solicitanteEmail"
                  value={formData.solicitanteEmail}
                  onChange={handleInputChange}
                  placeholder="nombre@aquachile.cl"
                  required
                />
              </div>
            </>
          )}

          <div className="field">
            <label htmlFor="nombreCandidato">Nombre del candidato</label>
            <input
              id="nombreCandidato"
              type="text"
              name="nombreCandidato"
              value={formData.nombreCandidato}
              onChange={handleInputChange}
              placeholder="Nombre del candidato"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="familiaCargo">Familia de cargo</label>
            <select
              id="familiaCargo"
              name="familiaCargo"
              value={formData.familiaCargo}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Selecciona una familia de cargo
              </option>
              {FAMILIAS_CARGO.map((familia) => (
                <option key={familia} value={familia}>
                  {familia}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="nombreCargo">Nombre del cargo</label>
            <input
              id="nombreCargo"
              type="text"
              name="nombreCargo"
              value={formData.nombreCargo}
              onChange={handleInputChange}
              placeholder="Nombre del cargo"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="cvFile">Curriculum Vitae (PDF / Word)</label>
            <input
              id="cvFile"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar solicitud'}
          </button>
        </form>
  );

  // Modo público: página completa, sin panel ni cuenta.
  if (publico) {
    return (
      <div className="form-page">
        <div className="form-card-wrap">
          {onBack && (
            <button type="button" className="back-link" onClick={onBack}>
              ← Volver al inicio
            </button>
          )}

          <div className="card solicitud-card-form">
            <div className="logo-crop logo-center">
              <img src={logoAquaChile} alt="AquaChile" />
            </div>

            <h1>Solicitud de Evaluación Psicolaboral</h1>
            <p className="muted center">
              Ingresa los datos del candidato para iniciar el proceso
            </p>

            {alertas}
            {formulario}
          </div>
        </div>
      </div>
    );
  }

  // Modo panel: dentro del dashboard, con sesión iniciada.
  return (
    <>
      <header className="page-header">
        <h1>Nueva solicitud de evaluación</h1>
        <p className="muted">
          Ingresa los datos del candidato para iniciar el proceso psicolaboral.
        </p>
      </header>

      <section className="card form-card solicitud-form-card">
        {alertas}
        {formulario}
      </section>
    </>
  );
}
