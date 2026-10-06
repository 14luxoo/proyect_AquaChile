import { useState } from 'react';
import logoAquaChile from './assets/AquaChile-Colour.png';

const estadoInicial = {
  nombreCandidato: '',
  familiaCargo: '',
  nombreCargo: '',
  cvFile: null,
};

export default function FormularioSolicitud({ onBack }) {
  const [formData, setFormData] = useState(estadoInicial);
  const [enviado, setEnviado] = useState(false);
  const [formKey, setFormKey] = useState(0); // permite limpiar el input de archivo

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, cvFile: e.target.files[0] || null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos enviados:', formData);
    setEnviado(true);
    setFormData(estadoInicial);
    setFormKey((k) => k + 1);
  };

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

          {enviado && (
            <div className="alert alert-success" role="status">
              ¡Solicitud enviada con éxito!
            </div>
          )}

          <form onSubmit={handleSubmit} key={formKey}>
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
              <input
                id="familiaCargo"
                type="text"
                name="familiaCargo"
                value={formData.familiaCargo}
                onChange={handleInputChange}
                placeholder="Familia de cargo"
                required
              />
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

            <button type="submit" className="btn btn-primary">
              Enviar solicitud
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}