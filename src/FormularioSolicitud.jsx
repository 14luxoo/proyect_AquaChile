import React, { useState } from 'react';
import logoAquaChile from './assets/AquaChile-Colour.png';

export default function FormularioSolicitud() {
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

const handleSubmit = async (e) => {
    e.preventDefault();

    // Crear FormData para enviar campos de texto y el archivo binario (CV) juntos
    const data = new FormData();
    data.append('nombreCandidato', formData.nombreCandidato);
    data.append('familiaCargo', formData.familiaCargo);
    data.append('nombreCargo', formData.nombreCargo);
    data.append('cvFile', formData.cvFile);

    try {
      const response = await fetch('http://localhost:5000/api/solicitudes', {
        method: 'POST',
        body: data, // Enviamos el FormData directamente sin Headers de JSON
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.mensaje);
        
        // Limpiar el formulario tras un envío exitoso
        setFormData({
          nombreCandidato: '',
          familiaCargo: '',
          nombreCargo: '',
          cvFile: null,
        });
      } else {
        alert('Hubo un error al procesar el envío.');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('No se pudo conectar con el servidor (Asegúrate de que node server.js esté corriendo).');
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        {/* Logo corporativo */}
        <div style={styles.logoContainer}>
          <img 
            src={logoAquaChile} 
            alt="Logo AquaChile" 
            style={styles.logo}
          />
        </div>

        <h2 style={styles.title}>Solicitud de Evaluación Psicolaboral</h2>
        <p style={styles.subtitle}>Ingresa los datos del candidato para iniciar el proceso</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre del Candidato</label>
            <input
              type="text"
              name="nombreCandidato"
              placeholder="Ej. Juan Pérez"
              value={formData.nombreCandidato}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Familia de Cargo</label>
            <select
              name="familiaCargo"
              value={formData.familiaCargo}
              onChange={handleInputChange}
              style={styles.input}
              required
            >
              <option value="">-- Selecciona una familia --</option>
              <option value="Operaciones">Operaciones</option>
              <option value="Administración">Administración</option>
              <option value="Jefaturas">Jefaturas / Liderazgo</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre del Cargo</label>
            <input
              type="text"
              name="nombreCargo"
              placeholder="Ej. Analista de Selección"
              value={formData.nombreCargo}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Curriculum Vitae (PDF / Word)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ ...styles.input, backgroundColor: '#f8fafc', color: '#2c3e50' }}
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            Enviar Solicitud
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    backgroundColor: '#f4f7f9', // Fondo claro uniforme para toda la pantalla
    minHeight: '100vh',
    width: '100vw',             // Cubre el 100% del ancho del navegador
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '520px',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    color: '#2c3e50',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '15px',
    paddingTop: '5px',
  },
  logo: {
    height: '140px',
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