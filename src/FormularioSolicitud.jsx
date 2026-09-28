import { useState } from 'react';

export default function FormularioSolicitud() {
  const [candidato, setCandidato] = useState({
    nombre: '',
    familiaCargo: 'TI / Informática',
    nombreCargo: '' // 👈 Agregado según pauta del proyecto
  });

  const [solicitudes, setSolicitudes] = useState([]);
  const [cargandoId, setCargandoId] = useState(null); // Estado para feedback de carga

  const handleSubmit = (e) => {
    e.preventDefault();

    const familiaFormateada = candidato.familiaCargo.split(' ')[0];
    const plantillaExcel = `Informe_Psicolaboral_${familiaFormateada}.xlsx`;
    const plantillaWord = `Pauta_Entrevista_${familiaFormateada}.docx`;

    // Formateo limpio para OneDrive
    const nombreLimpio = candidato.nombre.trim().replace(/\s+/g, '_');

    const nuevaSolicitud = {
      id: Date.now(),
      nombre: candidato.nombre.trim(),
      familiaCargo: candidato.familiaCargo,
      nombreCargo: candidato.nombreCargo.trim() || candidato.familiaCargo,
      carpetaOneDrive: `/Evaluaciones/${nombreLimpio}`,
      archivosGenerados: ['CV_Candidato.pdf', plantillaExcel, plantillaWord],
      estado: 'Carpeta Creada 📁',
      analisisCopilot: null,
      asistenteActivo: false,
      sugerenciasCopilot: []
    };

    setSolicitudes([...solicitudes, nuevaSolicitud]);
    setCandidato({ nombre: '', familiaCargo: 'TI / Informática', nombreCargo: '' });
  };

  // Simulación Etapa 2: Con tiempo de espera para simular Power Automate + Copilot
  const simularCopilotEtapa2 = (id) => {
    setCargandoId(id);

    setTimeout(() => {
      const analisisFalso = {
        fortalezas: 'Liderazgo técnico, buena comunicación y manejo de React.',
        debilidades: 'Poca experiencia con arquitecturas Serverless.',
        conclusion: 'Recomendado para el puesto.'
      };

      setSolicitudes(prev => prev.map(sol => {
        if (sol.id === id) {
          return {
            ...sol,
            estado: 'Informe Completado en Excel 🟢',
            analisisCopilot: analisisFalso
          };
        }
        return sol;
      }));

      setCargandoId(null);
    }, 1500); // 1.5 segundos de simulación
  };

  // Simulación Etapa 3: Activar Asistente Copilot durante la entrevista en vivo
  const alternarAsistenteEtapa3 = (id) => {
    setSolicitudes(solicitudes.map(sol => {
      if (sol.id === id) {
        return {
          ...sol,
          asistenteActivo: !sol.asistenteActivo,
          sugerenciasCopilot: [
            '❓ Copilot sugiere: "Pide un ejemplo real donde resolvió un conflicto de arquitectura en equipo."',
            '💡 Copilot orienta: "Profundizar en su experiencia gestionando proyectos con fechas límite ajustadas."'
          ]
        };
      }
      return sol;
    }));
  };

  return (
    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', fontFamily: 'sans-serif' }}>
      {/* Formulario de Entrada */}
      <form onSubmit={handleSubmit} style={{ border: '1px solid #444', padding: '20px', borderRadius: '8px', width: '320px', height: 'fit-content' }}>
        <h3 style={{ marginTop: 0 }}>Nueva Solicitud</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nombre Candidato:</label>
          <input
            type="text"
            value={candidato.nombre}
            onChange={(e) => setCandidato({...candidato, nombre: e.target.value})}
            required
            placeholder="Ej: Ana María Silva"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Familia de Cargo:</label>
          <select
            value={candidato.familiaCargo}
            onChange={(e) => setCandidato({...candidato, familiaCargo: e.target.value})}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="TI / Informática">TI / Informática</option>
            <option value="Operaciones">Operaciones</option>
            <option value="Ventas">Ventas</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nombre del Cargo:</label>
          <input
            type="text"
            value={candidato.nombreCargo}
            onChange={(e) => setCandidato({...candidato, nombreCargo: e.target.value})}
            placeholder="Ej: Desarrollador Frontend Senior"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
          Generar Carpeta y Documentos (Etapa 1)
        </button>
      </form>

      {/* Visualización del Proceso */}
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h3 style={{ marginTop: 0 }}>Gestor del Proceso Psicolaboral</h3>
        {solicitudes.length === 0 ? (
          <p style={{ color: '#aaa' }}>No hay solicitudes procesadas aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {solicitudes.map((sol) => (
              <div key={sol.id} style={{ border: '1px solid #555', padding: '15px', borderRadius: '8px', backgroundColor: '#1a1a1a' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#646cff' }}>📁 {sol.carpetaOneDrive}</h4>
                <p style={{ margin: '2px 0' }}><strong>Candidato:</strong> {sol.nombre}</p>
                <p style={{ margin: '2px 0' }}><strong>Cargo:</strong> {sol.nombreCargo} ({sol.familiaCargo})</p>
                <p style={{ margin: '2px 0', color: sol.analisisCopilot ? '#4caf50' : '#ffb74d' }}>
                  <strong>Estado:</strong> {sol.estado}
                </p>

                <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
                  <strong>Documentos clonados:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    {sol.archivosGenerados.map((archivo, index) => (
                      <li key={index}>📄 {archivo}</li>
                    ))}
                  </ul>
                </div>

                {/* Acciones de Automatización */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => alternarAsistenteEtapa3(sol.id)}
                    style={{ padding: '8px 12px', backgroundColor: sol.asistenteActivo ? '#7c3aed' : '#4b5563', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    🎙️ {sol.asistenteActivo ? 'Ocultar Copilot Entrevista' : 'Iniciar Asistente en Vivo (Etapa 3)'}
                  </button>

                  {!sol.analisisCopilot && (
                    <button
                      onClick={() => simularCopilotEtapa2(sol.id)}
                      disabled={cargandoId === sol.id}
                      style={{ padding: '8px 12px', backgroundColor: cargandoId === sol.id ? '#0369a1' : '#0284c7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      {cargandoId === sol.id ? '⏳ Transfiriendo datos a Excel...' : '🤖 Llenar Informe Excel con Copilot (Etapa 2)'}
                    </button>
                  )}
                </div>

                {/* Vista Etapa 3 */}
                {sol.asistenteActivo && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#2e1065', borderRadius: '6px', borderLeft: '4px solid #a855f7' }}>
                    <strong style={{ color: '#c084fc' }}>🤖 Agente Copilot (Acompañamiento en tiempo real):</strong>
                    <p style={{ fontSize: '0.85em', color: '#e9d5ff', margin: '4px 0 8px 0' }}>Transcribiendo entrevista de {sol.nombre}...</p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85em', color: '#f3e8ff' }}>
                      {sol.sugerenciasCopilot.map((sug, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{sug}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Vista Etapa 2 */}
                {sol.analisisCopilot && (
                  <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#262626', borderRadius: '6px', borderLeft: '4px solid #4caf50' }}>
                    <strong style={{ color: '#4caf50' }}>📊 Datos insertados en Excel vía Power Automate:</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85em' }}><strong>Fortalezas:</strong> {sol.analisisCopilot.fortalezas}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85em' }}><strong>Debilidades:</strong> {sol.analisisCopilot.debilidades}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85em' }}><strong>Resultado:</strong> {sol.analisisCopilot.conclusion}</p>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}