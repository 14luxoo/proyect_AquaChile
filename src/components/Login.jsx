import React, { useState } from 'react';
import logoAquaChile from '../assets/AquaChile-Colour.png';
import heroImg from '../assets/hero.png';

export default function Login({ onLoginSuccess, onEnterPostulante }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLoginSuccess({ email });
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="brand-column">
          <img src={logoAquaChile} alt="AquaChile" className="logo" />
          <img src={heroImg} alt="AquaChile hero" className="hero-image" />
          <h2>Portal de Gestión y Selección</h2>
          <p>Alimentando el futuro de forma sostenible e innovadora.</p>
        </div>

        <div className="form-column">
          <h2>Iniciar Sesión</h2>
          <p>Ingresa tus credenciales corporativas</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Ingresar</button>
          </form>

          <div className="divider">o</div>

          <button type="button" onClick={onEnterPostulante}>
            Entrar como postulante
          </button>
        </div>
      </div>
    </div>
  );
}