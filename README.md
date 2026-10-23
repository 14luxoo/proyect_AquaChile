🐟 Plataforma de Reclutamiento y Selección - AquaChile
Sistema full-stack desarrollado para la gestión integral de postulaciones laborales, almacenamiento de curriculum vitae, administración de candidatos y trazabilidad de evaluaciones psicolaborales.

🏗️ Arquitectura del Proyecto
El repositorio está organizado en una estructura monorepo que separa la lógica de negocio (Backend) de la interfaz gráfica (Frontend):

proyect_AquaChile/
├── backend-AquaChile/    # Servidor REST API (Node.js/Express + Supabase Client)
└── frontend-AquaChile/   # Aplicación SPA (React + Vite)
🛠️ Tech Stack
Frontend: React, React Router DOM, Vite, CSS3.

Backend: Node.js, Express.js.

Base de Datos & Storage: Supabase (PostgreSQL) para la persistencia de usuarios, solicitudes e historial de cambios.

Autenticación & Sesión: Login con persistencia local mediante localStorage.

💡 Funcionalidades Principales
Portal Público de Postulación (/postular):

Formulario para candidatos con carga de CV y datos personales.

Envío directo a la base de datos sin requerir autenticación.

Panel Administrativo (/admin):

Visualización del listado de postulantes y métricas generales.

Gestión de estados de postulación (Pendiente, En Revisión, Aprobado, Rechazado).

Módulo para creación e ingreso de nuevos usuarios administrativos.

Sistema de Auditoría e Historial (historial_cambios):

Trazabilidad automática de cambios de estado vinculando el identificador único (usuario_id) del reclutador que ejecuta la modificación.

🚀 Instrucciones de Ejecución
Para ejecutar la aplicación en entorno local, debes levantar el backend y frontend en terminales independientes:

1. Levantar el Backend
   Bash
   cd backend-AquaChile
   npm install
   node server.js
   El servidor escuchará por defecto en http://localhost:5000.

2. Levantar el Frontend
   Bash
   cd frontend-AquaChile
   npm install
   npm run dev
   Accede desde tu navegador a: http://localhost:5173

🔐 Credenciales de Acceso (Entorno Local)
Correo electrónico: admin@aquachile.cl

Contraseña: 123456