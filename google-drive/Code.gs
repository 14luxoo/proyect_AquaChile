/**
 * AquaChile · Recepción de solicitudes en Google Drive
 *
 * Recibe cada solicitud enviada desde el formulario web y guarda el CV así:
 *
 *   Mi unidad
 *   └── Solicitudes
 *       └── <Nombre del candidato>
 *           └── CV - <Nombre del candidato> - <fecha>.pdf
 *
 * Guía de instalación: GUIA-GOOGLE-DRIVE.md (en esta misma carpeta).
 */

// ----- Configuración -------------------------------------------------------
const CARPETA_RAIZ = 'Solicitudes'; // carpeta principal dentro de "Mi unidad"
const MAX_BYTES = 5 * 1024 * 1024;  // tamaño máximo del CV (5 MB)
// ---------------------------------------------------------------------------

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Evita que dos envíos simultáneos creen la misma carpeta dos veces.
    lock.waitLock(20000);

    const datos = JSON.parse(e.postData.contents);
    const candidato = limpiarNombre(datos.candidato);

    if (!datos.cv || !datos.cv.contenidoBase64) {
      throw new Error('La solicitud no trae currículum.');
    }

    const bytes = Utilities.base64Decode(datos.cv.contenidoBase64);
    if (bytes.length > MAX_BYTES) {
      throw new Error('El currículum supera el tamaño máximo permitido.');
    }
    if (!esPdf(bytes)) {
      throw new Error('El currículum debe ser un PDF válido.');
    }

    const raiz = obtenerOCrearCarpeta(DriveApp.getRootFolder(), CARPETA_RAIZ);
    const carpeta = obtenerOCrearCarpeta(raiz, candidato);

    const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const nombreArchivo = 'CV - ' + candidato + ' - ' + fecha + '.pdf';
    const archivo = carpeta.createFile(Utilities.newBlob(bytes, 'application/pdf', nombreArchivo));

    archivo.setDescription(
      [
        'Solicitud N.º ' + datos.idSolicitud,
        'Cargo: ' + (datos.cargo || '') + ' (' + (datos.familiaCargo || '') + ')',
        'Solicitante: ' + ((datos.solicitante && datos.solicitante.nombre) || '') +
          ' <' + ((datos.solicitante && datos.solicitante.email) || '') + '>',
      ].join('\n')
    );

    return respuesta({ ok: true, carpetaUrl: carpeta.getUrl(), archivoUrl: archivo.getUrl() });
  } catch (err) {
    return respuesta({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

// Abrir la URL del script en el navegador permite comprobar que está activo.
function doGet() {
  return respuesta({ ok: true, servicio: 'Solicitudes AquaChile' });
}

// Ejecútala UNA vez desde el editor para conceder los permisos de Drive
// y crear la carpeta "Solicitudes" de antemano.
function autorizar() {
  const raiz = obtenerOCrearCarpeta(DriveApp.getRootFolder(), CARPETA_RAIZ);
  Logger.log('Listo. Carpeta: ' + raiz.getUrl());
}

// ----- Utilidades ----------------------------------------------------------

function respuesta(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// Un PDF real empieza con "%PDF" (0x25 0x50 0x44 0x46).
function esPdf(bytes) {
  return bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

function obtenerOCrearCarpeta(padre, nombre) {
  const existentes = padre.getFoldersByName(nombre);
  return existentes.hasNext() ? existentes.next() : padre.createFolder(nombre);
}

// Deja un nombre seguro para Drive: sin caracteres especiales y con largo acotado.
function limpiarNombre(texto) {
  const limpio = String(texto || '')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return limpio || 'Sin nombre';
}
