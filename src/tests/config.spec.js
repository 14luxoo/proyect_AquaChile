import { permisosDe, ROLES, ESTADOS } from '../config';

describe('config: permisosDe', () => {
  it('el Administrador tiene todos los permisos', () => {
    expect(permisosDe(ROLES.ADMIN)).toEqual({
      crearUsuarios: true,
      crearSolicitud: true,
      cambiarEstado: true,
    });
  });

  it('el Reclutador solo puede crear solicitudes', () => {
    const p = permisosDe(ROLES.RECLUTADOR);
    expect(p.crearSolicitud).toBeTrue();
    expect(p.crearUsuarios).toBeFalse();
    expect(p.cambiarEstado).toBeFalse();
  });

  it('un rol desconocido no tiene ningún permiso', () => {
    expect(permisosDe('Hacker')).toEqual({
      crearUsuarios: false,
      crearSolicitud: false,
      cambiarEstado: false,
    });
  });

  it('el primer estado de una solicitud es Pendiente', () => {
    expect(ESTADOS[0]).toBe('Pendiente');
  });
});
