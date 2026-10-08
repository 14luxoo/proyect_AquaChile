import { useState } from 'react';
import logoAquaChile from '../assets/AquaChile-Colour.png';
import FormularioSolicitud from '../FormularioSolicitud';
import { ESTADOS, ROLES, permisosDe } from '../config';

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

const descargarCv = (cv) => {
  if (!cv?.data) return;
  const enlace = document.createElement('a');
  enlace.href = cv.data;
  enlace.download = cv.nombre || 'cv';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
};

export default function AdminDashboard({
  user,
  usuarios = [],
  solicitudes = [],
  onCreateUser,
  onNuevaSolicitud,
  onCambiarEstado,
  onLogout,
}) {
  // Lo que ve y puede hacer cada rol sale de la tabla PERMISOS (src/config.js).
  const { crearUsuarios, crearSolicitud, cambiarEstado } = permisosDe(user?.rol);

  // 'solicitudes' | 'nueva-solicitud' | 'crear-usuario'
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [mensaje, setMensaje] = useState('');
  const [errorForm, setErrorForm] = useState('');

  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    rol: ROLES.RECLUTADOR,
    password: '',
  });

  // Aunque el estado interno diga otra cosa, nadie ve una pestaña que su rol no permite.
  const tabsPermitidas = [
    'solicitudes',
    ...(crearSolicitud ? ['nueva-solicitud'] : []),
    ...(crearUsuarios ? ['crear-usuario'] : []),
  ];
  const tabVisible = tabsPermitidas.includes(activeTab) ? activeTab : 'solicitudes';

  const total = solicitudes.length;
  const pendientes = solicitudes.filter((s) => s.estado === 'Pendiente').length;
  const enRevision = solicitudes.filter((s) => s.estado === 'En Revisión').length;
  const enviados = solicitudes.filter((s) => s.estado === 'Informe enviado').length;

  const cambiarTab = (tab) => {
    setActiveTab(tab);
    setMensaje('');
    setErrorForm('');
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!crearUsuarios) return;

    // Aquí iría la llamada a tu backend para guardar el usuario.
    const resultado = onCreateUser?.(newUser);
    if (!resultado?.ok) {
      setMensaje('');
      setErrorForm(resultado?.error || 'No se pudo crear el usuario.');
      return;
    }

    setErrorForm('');
    setMensaje(`Usuario "${newUser.nombre}" creado con éxito.`);
    setNewUser({ nombre: '', email: '', rol: ROLES.RECLUTADOR, password: '' });
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
            className={`nav-item ${tabVisible === 'solicitudes' ? 'active' : ''}`}
            onClick={() => cambiarTab('solicitudes')}
          >
            <Icon>
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </Icon>
            Solicitudes de postulantes
          </button>

          {crearSolicitud && (
            <button
              type="button"
              className={`nav-item ${tabVisible === 'nueva-solicitud' ? 'active' : ''}`}
              onClick={() => cambiarTab('nueva-solicitud')}
            >
              <Icon>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M12 18v-6M9 15h6" />
              </Icon>
              Nueva solicitud
            </button>
          )}

          {crearUsuarios && (
            <button
              type="button"
              className={`nav-item ${tabVisible === 'crear-usuario' ? 'active' : ''}`}
              onClick={() => cambiarTab('crear-usuario')}
            >
              <Icon>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6M22 11h-6" />
              </Icon>
              Crear usuarios
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{(user?.nombre || user?.email || 'U')[0].toUpperCase()}</span>
            <div className="user-info">
              <strong>{user?.nombre || 'Usuario'}</strong>
              <span>{user?.rol} · {user?.email}</span>
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
        {tabVisible === 'solicitudes' && (
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
              <div className="stat-card">
                <span>Informes enviados</span>
                <strong>{enviados}</strong>
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
                      <th>Solicitante</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>CV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((item) => (
                      <tr key={item.id}>
                        <td className="strong">{item.candidato}</td>
                        <td>{item.familiaCargo}</td>
                        <td>{item.cargo}</td>
                        <td>{item.solicitante || '—'}</td>
                        <td>{item.fecha}</td>
                        <td>
                          {cambiarEstado ? (
                            <select
                              className="estado-select"
                              value={item.estado}
                              onChange={(e) => onCambiarEstado?.(item.id, e.target.value)}
                              aria-label={`Estado de ${item.candidato}`}
                            >
                              {ESTADOS.map((estado) => (
                                <option key={estado} value={estado}>
                                  {estado}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`badge badge-${claseEstado(item.estado)}`}>
                              {item.estado}
                            </span>
                          )}
                        </td>
                        <td>
                          {item.cv ? (
                            <button
                              type="button"
                              className="btn-download"
                              onClick={() => descargarCv(item.cv)}
                              title={item.cv.nombre}
                            >
                              <Icon>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <path d="M7 10l5 5 5-5M12 15V3" />
                              </Icon>
                              Descargar
                            </button>
                          ) : (
                            <span className="muted">Sin archivo</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {crearSolicitud && tabVisible === 'nueva-solicitud' && (
          <FormularioSolicitud onSubmitSolicitud={onNuevaSolicitud} />
        )}

        {crearUsuarios && tabVisible === 'crear-usuario' && (
          <>
            <header className="page-header">
              <h1>Crear usuarios</h1>
              <p className="muted">Otorga accesos a reclutadores, psicólogos y otros administradores.</p>
            </header>

            <section className="card form-card">
              {mensaje && (
                <div className="alert alert-success" role="status">
                  {mensaje}
                </div>
              )}
              {errorForm && (
                <div className="alert alert-error" role="alert">
                  {errorForm}
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
                    <option value={ROLES.RECLUTADOR}>Reclutador</option>
                    <option value={ROLES.PSICOLOGO}>Psicólogo</option>
                    <option value={ROLES.ADMIN}>Administrador</option>
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

            <section className="card table-card" style={{ marginTop: 24 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.email}>
                        <td className="strong">{u.nombre}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge badge-${claseEstado(u.rol)}`}>{u.rol}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}