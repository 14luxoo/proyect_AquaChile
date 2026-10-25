import { useState } from 'react';
import { FAMILIAS_CARGO, MAX_CV_BYTES } from './config';

const leerComoDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });

// Un PDF real empieza con la firma "%PDF-". Así no basta con renombrar un .docx a .pdf.
const esPdfReal = async (file) => {
  const inicio = await file.slice(0, 5).text();
  return inicio === '%PDF-';
};

const estadoInicial = {
  solicitante: '',
  solicitanteEmail: '',
  nombreCandidato: '',
  familiaCargo: '',
  nombreCargo: '',
  cvFile: null,
};

// Formulario de nueva solicitud. Es público: no requiere iniciar sesión.
export default function FormularioSolicitud({ onSubmitSolicitud }) {
  const [formData, setFormData] = useState(estadoInicial);
  const [enviado, setEnviado] = useState(null); // { codigo } cuando se envió con éxito
  const [enviando, setEnviando] = useState(false);
  const [formKey, setFormKey] = useState(0); // permite limpiar el input de archivo
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const rechazarArchivo = (input, mensaje) => {
    setError(mensaje);
    input.value = '';
    setFormData((prev) => ({ ...prev, cvFile: null }));
  };

  const handleFileChange = async (e) => {
    const input = e.target;
    const file = input.files[0] || null;
    setError('');

    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        rechazarArchivo(input, 'El currículum debe ser un archivo PDF (.pdf). No se aceptan archivos Word.');
        return;
      }
      if (file.size > MAX_CV_BYTES) {
        rechazarArchivo(input, `El currículum no puede superar los ${MAX_CV_BYTES / 1024 / 1024} MB.`);
        return;
      }
      if (!(await esPdfReal(file))) {
        rechazarArchivo(input, 'El archivo no es un PDF válido. Expórtalo como PDF desde tu editor.');
        return;
      }
    }

    setFormData((prev) => ({ ...prev, cvFile: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;

    if (!formData.cvFile) {
      setError('Adjunta el currículum en formato PDF.');
      return;
    }

    setError('');
    setAviso('');
    setEnviado(null);
    setEnviando(true);

    try {
      // Convertimos el archivo a data URL para poder guardarlo y descargarlo después.
      const cv = {
        nombre: formData.cvFile.name,
        tipo: 'application/pdf',
        data: await leerComoDataUrl(formData.cvFile),
      };

      const resultado = await onSubmitSolicitud?.({ ...formData, cv });
      if (resultado && !resultado.ok) {
        setError(resultado.error);
        return;
      }

      setAviso(resultado?.aviso || '');
      setEnviado({ codigo: resultado?.codigo });
      setFormData(estadoInicial);
      setFormKey((k) => k + 1);
    } catch (err) {
      setError(err.message || 'No se pudo enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <section className="card solicitud-card-form confirmacion" role="status">
        <div className="confirmacion-icono" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h1>¡Solicitud enviada con éxito!</h1>
        <p className="muted center">
          Recibimos tu solicitud y el equipo de Reclutamiento y Selección la revisará.
        </p>
        {enviado.codigo && (
          <p className="codigo-solicitud">
            N.º de solicitud <strong>{enviado.codigo}</strong>
          </p>
        )}
        {aviso && (
          <div className="alert alert-warning" role="alert">
            {aviso}
          </div>
        )}
        <button type="button" className="btn btn-primary" onClick={() => setEnviado(null)}>
          Enviar otra solicitud
        </button>
      </section>
    );
  }

  return (
    <section className="card solicitud-card-form">
      <h1>Solicitud de evaluación psicolaboral</h1>
      <p className="muted center">
        Completa los datos del candidato y adjunta su currículum en PDF.
      </p>

      {error && (
        <div className="alert alert-error" role="alert" style={{ marginTop: 18, marginBottom: 0 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} key={formKey}>
        <fieldset className="form-grupo">
          <legend>Quién solicita</legend>
          <div className="field">
            <label htmlFor="solicitante">Tu nombre</label>
            <input
              id="solicitante"
              type="text"
              name="solicitante"
              value={formData.solicitante}
              onChange={handleInputChange}
              placeholder="Nombre y apellido"
              autoComplete="name"
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
              autoComplete="email"
              required
            />
          </div>
        </fieldset>

        <fieldset className="form-grupo">
          <legend>Datos del candidato</legend>
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
            <label htmlFor="cvFile">Curriculum Vitae (solo PDF, máx. {MAX_CV_BYTES / 1024 / 1024} MB)</label>
            <input
              id="cvFile"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="file-input"
              required
            />
          </div>
        </fieldset>

        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </form>
    </section>
  );
}
