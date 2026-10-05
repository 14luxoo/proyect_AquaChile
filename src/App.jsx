import { BrowserRouter, Routes, Route } from "react-router-dom";
import FormularioSolicitud from './FormularioSolicitud'; // tu formulario actual
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormularioSolicitud />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;