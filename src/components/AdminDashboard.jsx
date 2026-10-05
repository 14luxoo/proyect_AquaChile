import React, { useState } from 'react';
import logoAquaChile from '../assets/AquaChile-Colour.png';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('solicitudes'); // 'solicitudes' | 'crear-usuario'

  const [solicitudes] = useState([
    {
      id: 1,
      candidato: 'Juan Pérez',
      familiaCargo: 'Jefaturas',
      cargo: 'Jefe de Planta',
      fecha: '2026-03-28',
      estado: 'Pendiente'
    },
    {
      id: 2,
      candidato: 'María González',
      familiaCargo: 'Operaciones',
      cargo: 'Operador de Recirculación',
      fecha: '2026-03-29',
      estado: 'En Revisión'
    }
  ]);

  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    rol: 'Evaluador',
    password: ''
  });

  const handleCreateUser = (e) => {
    e.preventDefault();
    alert(`Usuario ${newUser.nombre} creado con éxito.`);
    setNewUser({ nombre: '', email: '', rol: 'Evaluador', password: '' });
  };

  return (
    <div className="admin-dashboard">
      <header className="topbar">
        <div className="brand">
          <img src={logoAquaChile} alt="AquaChile" />
          <span>Panel de Administración</span>
        </div>

        <div className="user-actions">
          <span>{user?.email || 'Usuario'}</span>
          <button onClick={onLogout}>Cerrar Sesión</button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'solicitudes' ? 'active' : ''}
          onClick={() => setActiveTab('solicitudes')}
        >
          Visualizar Solicitudes de Postulantes
        </button>
        <button
          className={activeTab === 'crear-usuario' ? 'active' : ''}
          onClick={() => setActiveTab('crear-usuario')}
        >
          Crear Usuarios
        </button>
      </nav>

      <main className="content">
        {activeTab === 'solicitudes' && (
          <section className="panel">
            <h2>Solicitudes de Postulantes</h2>
            <p>Listado de evaluaciones psicolaborales ingresadas en el sistema.</p>

            {solicitudes.map((item) => (
              <div key={item.id} className="solicitud-card">
                <h3>{item.candidato}</h3>
                <p><strong>Familia de cargo:</strong> {item.familiaCargo}</p>
                <p><strong>Cargo:</strong> {item.cargo}</p>
                <p><strong>Fecha:</strong> {item.fecha}</p>
                <p><strong>Estado:</strong> {item.estado}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab === 'crear-usuario' && (
          <section className="panel">
            <h2>Crear Nuevo Usuario</h2>
            <p>Otorga accesos a evaluadores y personal interno.</p>

            <form onSubmit={handleCreateUser} className="user-form">
              <label>
                Nombre Completo
                <input
                  type="text"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                  required
                />
              </label>

              <label>
                Correo Corporativo
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </label>

              <label>
                Rol de Usuario
                <select
                  value={newUser.rol}
                  onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                >
                  <option value="Evaluador">Evaluador</option>
                  <option value="Administrador">Administrador</option>
                  <option value="RRHH">RRHH</option>
                </select>
              </label>

              <label>
                Contraseña Temporal
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </label>

              <button type="submit">Guardar Usuario</button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}