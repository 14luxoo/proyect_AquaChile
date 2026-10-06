import { useState } from 'react';
import logoAquaChile from '../assets/AquaChile-Colour.png';

function Icon({ children }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const claseEstado = (estado) =>
  estado
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('solicitudes'); // 'solicitudes' | 'crear-usuario'
  const [mensaje, setMensaje] = useState('');

  const [solicitudes] = useState([
    {
      id: 1,
      candidato: 'Juan Pérez',
      familiaCargo: 'Jefaturas',
      cargo: 'Jefe de Planta',
      fecha: '2026-03-28',
      estado: 'Pendiente',
    },
    {
      id: 2,
      candidato: 'María González',
      familiaCargo: 'Operaciones',
      cargo: 'Operador de Recirculación',
      fecha: '2026-03-29',
      estado: 'En Revisión',
    },
  ]);

  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    rol: 'Evaluador',
    password: '',
  });

  const total = solicitudes.length;
  const pendientes = solicitudes.filter((s) => s.estado === 'Pendiente').length;
  const enRevision = solicitudes.filter((s) => s.estado === 'En Revisión').length;

  const cambiarTab = (tab) => {
    setActiveTab(tab);
    setMensaje('');
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    // Aquí iría la llamada a tu backend para guardar el usuario.
    setMensaje(`Usuario "${newUser.nombre}" creado con éxito.`);
    setNewUser({ nombre: '', email: '', rol: 'Evaluador', password: '' });
  };

  return (
    <div className="admin-layout">
      {/* Menú lateral: 3 secciones */}
      <aside className="sidebar">
        <div className="logo-crop">
          <img src={logoAquaChile} alt="AquaChile" />
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <button
            type="button"
            className={`nav-item ${activeTab === 'solicitudes' ? 'active' : ''}`}
            onClick={() => cambiarTab('solicitudes')}
          >
            <Icon>
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </Icon>
            Solicitudes de postulantes
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'crear-usuario' ? 'active' : ''}`}
            onClick={() => cambiarTab('crear-usuario')}
          >
            <Icon>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M19 8v6M22 11h-6" />
            </Icon>
            Crear usuarios
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{(user?.nombre || user?.email || 'U')[0].toUpperCase()}</span>
            <div className="user-info">
              <strong>{user?.nombre || 'Usuario'}</strong>
              <span>{user?.email}</span>
            </div>
          </div>

          <button type="button" className="nav-item logout" onClick={onLogout}>
            <Icon>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </Icon>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="admin-main">
        {activeTab === 'solicitudes' && (
          <>
            <header className="page-header">
              <h1>Solicitudes de postulantes</h1>
              <p className="muted">
                Listado de evaluaciones psicolaborales ingresadas en el sistema.
              </p>
            </header>

            <div className="stats">
              <div className="stat-card">
                <span>Total de solicitudes</span>
                <strong>{total}</strong>
              </div>
              <div className="stat-card">
                <span>Pendientes</span>
                <strong>{pendientes}</strong>
              </div>
              <div className="stat-card">
                <span>En revisión</span>
                <strong>{enRevision}</strong>
              </div>
            </div>

            <section className="card table-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Candidato</th>
                      <th>Familia de cargo</th>
                      <th>Cargo</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((item) => (
                      <tr key={item.id}>
                        <td className="strong">{item.candidato}</td>
                        <td>{item.familiaCargo}</td>
                        <td>{item.cargo}</td>
                        <td>{item.fecha}</td>
                        <td>
                          <span className={`badge badge-${claseEstado(item.estado)}`}>
                            {item.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === 'crear-usuario' && (
          <>
            <header className="page-header">
              <h1>Crear usuarios</h1>
              <p className="muted">Otorga accesos a evaluadores y personal interno.</p>
            </header>

            <section className="card form-card">
              {mensaje && (
                <div className="alert alert-success" role="status">
                  {mensaje}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="user-form">
                <div className="field">
                  <label htmlFor="nu-nombre">Nombre completo</label>
                  <input
                    id="nu-nombre"
                    type="text"
                    value={newUser.nombre}
                    onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="nu-email">Correo corporativo</label>
                  <input
                    id="nu-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="nu-rol">Rol de usuario</label>
                  <select
                    id="nu-rol"
                    value={newUser.rol}
                    onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                  >
                    <option value="Evaluador">Evaluador</option>
                    <option value="Administrador">Administrador</option>
                    <option value="RRHH">RRHH</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="nu-pass">Contraseña temporal</label>
                  <input
                    id="nu-pass"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Guardar usuario
                  </button>
                </div>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  );
}