import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/solicitudes')
      .then((res) => res.json())
      .then((data) => setSolicitudes(data))
      .catch((err) => console.error('Error al cargar solicitudes:', err));
  }, []);

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h2>Dashboard de Reclutadores</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>Candidato</th>
            <th>Familia Cargo</th>
            <th>Cargo</th>
            <th>CV</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((s) => (
            <tr key={s._id}>
              <td>{s.nombreCandidato}</td>
              <td>{s.familiaCargo}</td>
              <td>{s.nombreCargo}</td>
              <td>
                <a href={s.cvArchivo} target="_blank" rel="noopener noreferrer">
                  Descargar CV 📄
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}