import { useState } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import FormularioSolicitud from './FormularioSolicitud';
import './App.css';

function App() {
  // Vistas: 'login' | 'admin' | 'postulante'
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
        <Login
          onLoginSuccess={handleLoginSuccess}
          onEnterPostulante={() => setCurrentView('postulante')}
        />
      )}

      {/* Solo se muestra si hay un usuario con sesión iniciada */}
      {currentView === 'admin' && currentUser && (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      )}

      {currentView === 'postulante' && (
        <FormularioSolicitud onBack={() => setCurrentView('login')} />
      )}
    </>
  );
}

export default App;