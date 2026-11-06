import 'dotenv/config';

const url = (process.env.GOOGLE_DRIVE_WEBHOOK_URL || '').trim();
console.log('URL cargada desde .env:', url ? url.slice(0, 60) + '…' : 'VACÍA (el .env no se está leyendo)');
if (!url) process.exit(1);

const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

const r = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify({
    idSolicitud: 'PRUEBA',
    candidato: 'Prueba Conexion',
    cargo: 'Test',
    familiaCargo: 'Test',
    cv: { nombre: 'prueba.pdf', tipo: 'application/pdf', contenidoBase64: pdf.toString('base64') },
  }),
});

console.log('Estado HTTP:', r.status);
console.log('Respuesta:', (await r.text()).slice(0, 400));