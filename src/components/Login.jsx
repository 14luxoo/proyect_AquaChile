import { useState } from 'react';
import logoAquaChile from '../assets/AquaChile-Colour.png';
import HeroIlustracion from './HeroIlustracion';

export default function Login({ usuarios, onLoginSuccess, onEnterPostulante }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // DEMO: reemplazar por la validación contra tu backend / base de datos.
    const usuario = usuarios.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );

    if (!usuario) {
      setError('Correo o contraseña incorrectos.');
      return;
    }

    setError('');
    onLoginSuccess({ email: usuario.email, nombre: usuario.nombre, rol: usuario.rol });
  };

  return (
    <div className="login-page">
      {/* Columna izquierda: marca */}
      <section className="brand-column">
        <div className="logo-crop logo-chip">
          <img src={logoAquaChile} alt="AquaChile" />
        </div>

        <div className="brand-illustration">
          <HeroIlustracion />
        </div>

        <div className="brand-text">
          <h2>Portal de Gestión y Selección</h2>
          <p>Alimentando el futuro de forma sostenible e innovadora.</p>
        </div>

        <small className="brand-footer">© AquaChile. Todos los derechos reservados.</small>
      </section>

      {/* Columna derecha: inicio de sesión */}
      <section className="form-column">
        <div className="form-box">
          <h1>Iniciar sesión</h1>
          <p className="muted">Ingresa tus credenciales corporativas</p>

          <form onSubmit={handleSubmit} noValidate={false}>
            <div className="field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@aquachile.cl"
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary">
              Ingresar
            </button>
          </form>

          <div className="divider">
            <span>o</span>
          </div>

          <button type="button" className="btn btn-blue" onClick={onEnterPostulante}>
            Enviar solicitud sin cuenta
          </button>
          <p className="hint">Puedes enviar una solicitud rápida sin iniciar sesión.</p>
        </div>
      </section>
    </div>
  );
}