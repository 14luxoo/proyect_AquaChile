import Login from '../components/Login';
import { render, escribir, click, act } from './render';

const usuarios = [
  { email: 'admin@aquachile.cl', password: 'admin123', nombre: 'Admin', rol: 'Administrador' },
];

describe('Login', () => {
  let vista;
  let onLoginSuccess;
  let onEnterPostulante;

  beforeEach(() => {
    onLoginSuccess = jasmine.createSpy('onLoginSuccess');
    onEnterPostulante = jasmine.createSpy('onEnterPostulante');
    vista = render(
      <Login
        usuarios={usuarios}
        onLoginSuccess={onLoginSuccess}
        onEnterPostulante={onEnterPostulante}
      />
    );
  });

  afterEach(() => vista.limpiar());

  const enviar = (email, password) => {
    escribir(vista.contenedor.querySelector('#email'), email);
    escribir(vista.contenedor.querySelector('#password'), password);
    act(() => vista.contenedor.querySelector('form').requestSubmit());
  };

  it('muestra un error con credenciales incorrectas', () => {
    enviar('admin@aquachile.cl', 'malaclave');
    expect(vista.contenedor.textContent).toContain('Correo o contraseña incorrectos.');
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it('inicia sesión con credenciales correctas y no entrega la contraseña', () => {
    enviar('ADMIN@aquachile.cl', 'admin123');
    expect(onLoginSuccess).toHaveBeenCalledWith({
      email: 'admin@aquachile.cl',
      nombre: 'Admin',
      rol: 'Administrador',
    });
  });

  it('el botón Mostrar deja ver la contraseña', () => {
    const input = vista.contenedor.querySelector('#password');
    expect(input.type).toBe('password');
    click(vista.contenedor.querySelector('.toggle-password'));
    expect(input.type).toBe('text');
  });

  it('el botón sin cuenta llama a onEnterPostulante', () => {
    click(vista.contenedor.querySelector('.btn-blue'));
    expect(onEnterPostulante).toHaveBeenCalledTimes(1);
  });
});
