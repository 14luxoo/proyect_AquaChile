import { useMemo, useState } from 'react';
import logoAquaChile from '../assets/AquaChile-Colour.png';
import Icon from './Icon';
import EstadoBadge from './EstadoBadge';
import { claseEstado } from '../estados';
import { ESTADOS, ROLES, RUTA_POSTULAR, permisosDe } from '../config';

const descargarCv = (cv) => {
  if (!cv?.data) return;
  const enlace = document.createElement('a');
  enlace.href = cv.data;
  enlace.download = cv.nombre || 'cv.pdf';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
};

const formatearFechaHora = (iso) =>
  new Date(iso).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Evita que Excel interprete una celda como fórmula (=, +, -, @).
const celdaCsv = (valor) => {
  const texto = String(valor ?? '');
  const seguro = /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
  return `"${seguro.replace(/"/g, '""')}"`;
};

const exportarHistorialCsv = (historial) => {
  const filas = [
    ['Fecha', 'Candidato', 'Estado anterior', 'Estado nuevo', 'Modificado por', 'Correo', 'Rol'],
    ...historial.map((h) => [
      formatearFechaHora(h.fecha), h.candidato, h.desde, h.hacia, h.porNombre, h.porEmail, h.porRol,
    ]),
  ];
  const csv = '\uFEFF' + filas.map((f) => f.map(celdaCsv).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `historial-aquachile-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
};

const claseRol = (rol = '') =>
  rol.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');

const enlaceFormulario = () =>
  `${window.location.origin}${window.location.pathname}${RUTA_POSTULAR}`;

export default function AdminDashboard({
  user,
  usuarios = [],
  solicitudes = [],
  historial = [],
  onCreateUser,
  onCambiarEstado,
  onLogout,
}) {
  // Lo que ve y puede hacer cada rol sale de la tabla PERMISOS (src/config.js).
  const { crearUsuarios, cambiarEstado, verHistorial } = permisosDe(user?.rol);

  // 'solicitudes' | 'historial' | 'crear-usuario'
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [mensaje, setMensaje] = useState('');
  const [errorForm, setErrorForm] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [enlaceCopiado, setEnlaceCopiado] = useState(false);

  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    rol: ROLES.RECLUTADOR,
    password: '',
  });

  // Aunque el estado interno diga otra cosa, nadie ve una pestaña que su rol no permite.
  const tabsPermitidas = [
    'solicitudes',
    ...(verHistorial ? ['historial'] : []),
    ...(crearUsuarios ? ['crear-usuario'] : []),
  ];
  const tabVisible = tabsPermitidas.includes(activeTab) ? activeTab : 'solicitudes';

  const total = solicitudes.length;
  const conteo = (estado) => solicitudes.filter((s) => s.estado === estado).length;

  const solicitudesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return solicitudes.filter(
      (s) =>
        (filtroEstado === 'Todos' || s.estado === filtroEstado) &&
        (!q ||
          [s.candidato, s.cargo, s.familiaCargo, s.solicitante]
            .filter(Boolean)
            .some((campo) => campo.toLowerCase().includes(q)))
    );
  }, [solicitudes, busqueda, filtroEstado]);

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(enlaceFormulario());
      setEnlaceCopiado(true);
      setTimeout(() => setEnlaceCopiado(false), 2200);
    } catch {
      window.prompt('Copia este enlace:', enlaceFormulario());
    }
  };

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

          {verHistorial && (
            <button
              type="button"
              className={`nav-item ${tabVisible === 'historial' ? 'active' : ''}`}
              onClick={() => cambiarTab('historial')}
            >
              <Icon>
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5M12 7v5l3 2" />
              </Icon>
              Historial de cambios
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
          <button type="button" className="nav-item copiar-enlace" onClick={copiarEnlace}>
            <Icon>
              <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
              <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
            </Icon>
            {enlaceCopiado ? '¡Enlace copiado!' : 'Copiar enlace del formulario'}
          </button>

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
              {ESTADOS.map((estado) => (
                <div key={estado} className={`stat-card stat-${claseEstado(estado)}`}>
                  <span>{estado}</span>
                  <strong>{conteo(estado)}</strong>
                </div>
              ))}
            </div>

            <div className="filtros">
              <input
                type="search"
                className="buscador"
                placeholder="Buscar por candidato, cargo o solicitante…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar solicitudes"
              />
              <div className="chips" role="group" aria-label="Filtrar por estado">
                {['Todos', ...ESTADOS].map((estado) => (
                  <button
                    key={estado}
                    type="button"
                    className={`chip ${filtroEstado === estado ? 'active' : ''} chip-${
                      estado === 'Todos' ? 'todos' : claseEstado(estado)
                    }`}
                    onClick={() => setFiltroEstado(estado)}
                    aria-pressed={filtroEstado === estado}
                  >
                    {estado}
                  </button>
                ))}
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
                    {solicitudesFiltradas.map((item) => (
                      <tr key={item.id}>
                        <td className="strong">{item.candidato}</td>
                        <td>{item.familiaCargo}</td>
                        <td>{item.cargo}</td>
                        <td>{item.solicitante || '—'}</td>
                        <td>{item.fecha}</td>
                        <td>
                          <div className="estado-cell">
                            <EstadoBadge estado={item.estado} />
                            {cambiarEstado && (
                              <select
                                className="estado-select"
                                value={item.estado}
                                onChange={(e) => onCambiarEstado?.(item.id, e.target.value)}
                                aria-label={`Cambiar estado de ${item.candidato}`}
                              >
                                {ESTADOS.map((estado) => (
                                  <option key={estado} value={estado}>
                                    {estado}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
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
                    {solicitudesFiltradas.length === 0 && (
                      <tr>
                        <td colSpan={7} className="vacio">
                          No hay solicitudes que coincidan con el filtro.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {verHistorial && tabVisible === 'historial' && (
          <>
            <header className="page-header page-header-row">
              <div>
                <h1>Historial de cambios</h1>
                <p className="muted">
                  Registro de quién cambió el estado de cada solicitud, con su correo y rol.
                </p>
              </div>
              <button
                type="button"
                className="btn-download"
                onClick={() => exportarHistorialCsv(historial)}
                disabled={historial.length === 0}
              >
                <Icon>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M7 10l5 5 5-5M12 15V3" />
                </Icon>
                Exportar CSV
              </button>
            </header>

            <section className="card table-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha y hora</th>
                      <th>Candidato</th>
                      <th>Cambio de estado</th>
                      <th>Modificado por</th>
                      <th>Correo</th>
                      <th>Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((h) => (
                      <tr key={h.id}>
                        <td>{formatearFechaHora(h.fecha)}</td>
                        <td className="strong">{h.candidato}</td>
                        <td>
                          <div className="cambio-estado">
                            <EstadoBadge estado={h.desde} />
                            <span className="flecha" aria-label="a">→</span>
                            <EstadoBadge estado={h.hacia} />
                          </div>
                        </td>
                        <td>{h.porNombre}</td>
                        <td>{h.porEmail}</td>
                        <td>
                          <span className={`badge badge-${claseRol(h.porRol)}`}>{h.porRol}</span>
                        </td>
                      </tr>
                    ))}
                    {historial.length === 0 && (
                      <tr>
                        <td colSpan={6} className="vacio">
                          Aún no hay cambios de estado registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
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
                          <span className={`badge badge-${claseRol(u.rol)}`}>{u.rol}</span>
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