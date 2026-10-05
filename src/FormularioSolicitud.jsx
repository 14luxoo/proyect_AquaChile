import React, { useState } from 'react';
import logoAquaChile from './assets/AquaChile-Colour.png';

export default function FormularioSolicitud({ onBack }) {
  const [formData, setFormData] = useState({
    nombreCandidato: '',
    familiaCargo: '',
    nombreCargo: '',
    cvFile: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      cvFile: e.target.files[0],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos enviados:', formData);
    alert('¡Solicitud enviada con éxito!');
  };

  return (
    <div style={styles.pageContainer}>
      {onBack && (
        <button type="button" style={styles.backButton} onClick={onBack}>
          ← Volver al inicio
        </button>
      )}

      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <img src={logoAquaChile} alt="AquaChile" style={styles.logo} />
        </div>

        <h2 style={styles.title}>Solicitud de Evaluación Psicolaboral</h2>
        <p style={styles.subtitle}>Ingresa los datos del candidato para iniciar el proceso</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="nombreCandidato" style={styles.label}>Nombre del Candidato</label>
            <input
              id="nombreCandidato"
              type="text"
              name="nombreCandidato"
              value={formData.nombreCandidato}
              onChange={handleInputChange}
              placeholder="Nombre del candidato"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="familiaCargo" style={styles.label}>Familia de Cargo</label>
            <input
              id="familiaCargo"
              type="text"
              name="familiaCargo"
              value={formData.familiaCargo}
              onChange={handleInputChange}
              placeholder="Familia de cargo"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="nombreCargo" style={styles.label}>Nombre del Cargo</label>
            <input
              id="nombreCargo"
              type="text"
              name="nombreCargo"
              value={formData.nombreCargo}
              onChange={handleInputChange}
              placeholder="Nombre del cargo"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="cvFile" style={styles.label}>Curriculum Vitae (PDF / Word)</label>
            <input
              id="cvFile"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>Enviar Solicitud</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
pageContainer: {
backgroundColor: '#f4f7f9',
minHeight: '100vh',
width: '100vw',
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
padding: '20px',
boxSizing: 'border-box',
fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
},
card: {
position: 'relative',
backgroundColor: '#ffffff',
width: '100%',
maxWidth: '520px',
padding: '30px',
borderRadius: '12px',
boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
color: '#2c3e50',
},
backButton: {
background: 'none',
border: 'none',
color: '#1e3a5f',
fontSize: '14px',
fontWeight: '600',
cursor: 'pointer',
padding: '0',
marginBottom: '10px',
},
logoContainer: {
textAlign: 'center',
marginBottom: '15px',
paddingTop: '5px',
},
logo: {
height: '110px',
width: 'auto',
maxWidth: '100%',
objectFit: 'contain',
},
title: {
color: '#1e3a5f',
fontSize: '22px',
marginBottom: '6px',
textAlign: 'center',
fontWeight: '700',
},
subtitle: {
color: '#7f8c8d',
fontSize: '14px',
textAlign: 'center',
marginBottom: '25px',
},
formGroup: {
marginBottom: '18px',
display: 'flex',
flexDirection: 'column',
textAlign: 'left',
},
label: {
fontWeight: '600',
fontSize: '14px',
marginBottom: '6px',
color: '#2c3e50',
},
input: {
padding: '12px 14px',
borderRadius: '6px',
border: '1px solid #dcdfe6',
backgroundColor: '#ffffff',
color: '#2c3e50',
fontSize: '14px',
outline: 'none',
boxSizing: 'border-box',
width: '100%',
},
button: {
width: '100%',
padding: '14px',
backgroundColor: '#1e3a5f',
color: '#ffffff',
border: 'none',
borderRadius: '6px',
fontSize: '16px',
fontWeight: '600',
cursor: 'pointer',
marginTop: '10px',
},
};