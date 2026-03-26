# Treevü - Early Wage Access Platform

Una plataforma moderna de acceso anticipado de salarios (EWA) con IA, dashboard para empleados y panel de control para empresas.

## Características

- **App de Empleados**
  - Autenticación segura con Supabase
  - Dashboard con salario devengado y disponible
  - Solicitud de adelanto de hasta 50% del salario
  - Historial de transacciones
  - Centro de educación financiera con XP

- **Dashboard de Empresas**
  - Visualización de KPIs del equipo
  - Gestión de solicitudes de adelanto
  - Análisis de bienestar financiero
  - Predicciones de demanda (próximamente)

- **Backend**
  - API REST con autenticación
  - Bases de datos seguras con RLS
  - Validaciones de negocio

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Auth**: Supabase Auth
- **ML**: Python FastAPI (próximamente)

## Setup

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Configura variables de entorno:
   ```bash
   cp .env.example .env.local
   # Agrega tus credenciales de Supabase
   ```

4. Ejecuta la aplicación: `npm run dev`

## Base de Datos

Accede a Supabase y ejecuta los scripts SQL en `scripts/` en este orden:
1. `001_create_schema.sql` - Crea todas las tablas
2. `002_create_profile_trigger.sql` - Crea triggers
3. `003_seed_data.sql` - Datos de prueba (opcional)

## Rutas Principales

- `/` - Landing page
- `/auth/login` - Login
- `/auth/sign-up` - Registro
- `/dashboard` - Dashboard del empleado
- `/request-ewa` - Solicitar adelanto
- `/history` - Historial de transacciones
- `/education` - Centro de educación
- `/employer` - Landing de empresas
- `/employer/dashboard` - Dashboard de empresa

## API Endpoints

- `POST /api/ewa-requests` - Crear solicitud de adelanto
- `GET /api/ewa-requests` - Obtener solicitudes del usuario
- `GET /api/transactions` - Historial de transacciones
- `POST /api/transactions` - Crear transacción
- `GET /api/profile` - Obtener perfil
- `PUT /api/profile` - Actualizar perfil
- `POST /api/education` - Completar módulo educativo
- `PUT /api/employer/ewa-requests/[id]` - Aprobar/rechazar solicitud (empresa)

## Próximos Pasos

- [ ] Integración con modelos ML para predicciones
- [ ] Webhook para Yape/Plin
- [ ] Sistema de notificaciones
- [ ] Dashboard de analytics avanzado
- [ ] Integración con sistemas de nómina
- [ ] Tests automatizados

## Contribuir

Por favor crea un PR con tus cambios y asegúrate que todos los tests pasen.

## Licencia

Proprietario - Treevü Inc.
