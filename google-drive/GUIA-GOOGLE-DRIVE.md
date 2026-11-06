# Guardar los CV en Google Drive

Resultado final en tu Drive:

```
Mi unidad
└── Solicitudes
    └── Pedro Soto
        └── CV - Pedro Soto - 2026-10-25.pdf
```

> **Google One vs. Drive:** Google One es solo el plan de almacenamiento. Los archivos se guardan en
> Google Drive, en la cuenta de Google que cree el script, y usan el espacio de esa cuenta.
> Usa una cuenta corporativa o una cuenta dedicada (no una personal).

## 1. Crear el script (5 min)

1. Entra a <https://script.google.com> con la cuenta que será dueña de los archivos.
2. **Nuevo proyecto** y ponle de nombre `Solicitudes AquaChile`.
3. Borra el contenido del editor y pega todo el archivo `Code.gs` de esta carpeta. Guarda (Ctrl + S).

## 2. Dar permisos

1. En el menú de funciones del editor elige **`autorizar`** y pulsa **Ejecutar**.
2. Google pedirá permisos para usar Drive: **Revisar permisos → tu cuenta → Avanzado → Ir a Solicitudes AquaChile → Permitir**.
   (La advertencia de "app no verificada" es normal: el script es tuyo.)
3. Revisa tu Drive: ya existe la carpeta **Solicitudes**.

## 3. Publicar como aplicación web

1. **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. **Ejecutar como:** *Yo*.
   **Quién tiene acceso:** *Cualquier usuario* (necesario para que el formulario público pueda enviar).
4. **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).
5. Pega esa URL en el navegador: debe mostrar `{"ok":true,"servicio":"Solicitudes AquaChile"}`.

## 4. Conectar el backend

La URL del script se guarda en el **backend** (así no queda expuesta en el navegador).

1. Abre `backend-AquaChile/.env` y agrega la línea:

   ```
   GOOGLE_DRIVE_WEBHOOK_URL=https://script.google.com/macros/s/XXXXXXXX/exec
   ```
2. Reinicia el backend (`node server.js`).
3. Abre `/postular`, envía una solicitud de prueba y revisa **Solicitudes → nombre del candidato** en tu Drive.

El CV se sigue guardando también en Supabase; Drive es una copia adicional. Si Drive falla, la solicitud igual
queda registrada y el postulante ve un aviso. El motivo del error aparece en la consola del backend.

## Notas

- Si el mismo candidato postula dos veces, se reutiliza su carpeta y se agrega el nuevo CV (no se pisa el anterior si cambia la fecha; si es el mismo día, Drive guarda ambos archivos).
- El script rechaza archivos que no sean PDF reales y los mayores a 5 MB (ajustable en `MAX_BYTES`).
- Si cambias `Code.gs` después: **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva versión**. La URL se mantiene.
- La URL del script es pública (así funciona un formulario sin login). Cualquiera que la conozca podría subir PDFs a esa carpeta; no la publiques fuera de la web.
- Si aparece el aviso "no se pudo copiar el currículum a Google Drive", mira la consola del backend y revisa en Apps Script → **Ejecuciones**.
