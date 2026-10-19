// Ayudante para montar componentes React en el DOM real del navegador de Karma.
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

export function render(elemento) {
  const contenedor = document.createElement('div');
  document.body.appendChild(contenedor);
  const root = createRoot(contenedor);
  act(() => root.render(elemento));

  return {
    contenedor,
    limpiar() {
      act(() => root.unmount());
      contenedor.remove();
    },
  };
}

// Cambia el valor de un input controlado por React y dispara el evento.
export function escribir(input, valor) {
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set;
  act(() => {
    setter.call(input, valor);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

export function click(elemento) {
  act(() => elemento.click());
}

export { act };
