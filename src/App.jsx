import React, { useState } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import FormularioSolicitud from './FormularioSolicitud';
import './App.css';

function App() {
  // Estados de vista: 'login' | 'admin' | 'postulante'
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  return (
    <>
      {currentView === 'login' && (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}

      {currentView === 'admin' && (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      )}

      {currentView === 'postulante' && (
        <FormularioSolicitud onBackToLogin={() => setCurrentView('login')} />
      )}
    </>
  );
}

export default App;