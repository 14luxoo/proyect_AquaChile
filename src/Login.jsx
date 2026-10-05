import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al iniciar sesión');
      }

      // Guardar token y datos del usuario en el navegador
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // 1. Si se pasó la función onLoginSuccess desde App.jsx, la ejecuta de forma segura
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(data.usuario);
      }

      // 2. Redirige automáticamente a la pantalla del Dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err.message || 'No se pudo conectar con el servidor.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#0f2b48', marginBottom: '20px' }}>Acceso a Reclutamiento</h2>
      
      {error && (
        <div style={{ backgroundColor: '#fed7d7', color: '#9b2c2c', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>Correo Electrónico</label>
          <input 
            type="email" 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@aquachile.cl"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>Contraseña</label>
          <input 
            type="password" 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="•••"
          />
        </div>

        <button 
          type="submit" 
          style={{ width: '100%', padding: '12px', backgroundColor: '#0f2b48', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}