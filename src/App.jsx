import FormularioSolicitud from './FormularioSolicitud'
import './App.css'

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Sistema de Evaluación Psicolaboral</h1>
      <hr />
      <FormularioSolicitud />
    </div>
  )
}