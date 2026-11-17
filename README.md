# Mundo Maquillaje – Ecommerce

Tienda online con panel de administración.

- **frontend/** – React 19 + TypeScript + Vite + Tailwind (deploy en Vercel)
- **backend/** – Spring Boot 4 (Java 21) + PostgreSQL/Supabase (deploy en Render, ver `render.yaml`)
- **\*.sql** (raíz y `backend/sql`) – scripts de esquema y semillas, ejecutar manualmente en Supabase

## Requisitos
Node 22+, JDK 21 (Lombok no compila con JDK 27), una base PostgreSQL y un proyecto Supabase.

## Frontend
```bash
cd frontend
cp .env.example .env   # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_PUBLIC, VITE_API_URL
npm ci
npm run dev
npm run lint && npm test && npm run build
```

## Backend
```bash
cd backend
cp .env.example .env.local   # DB_*, SUPABASE_JWT_SECRET, CORS_ALLOWED_ORIGINS
./mvnw spring-boot:run       # JAVA_HOME debe apuntar a JDK 21
./mvnw test
```
Por defecto `DDL_AUTO=validate`; usa `DDL_AUTO=update` solo en desarrollo local.
El test `EcommerceApplicationTests` solo corre si `DB_URL` está definida.

## Seguridad
Cada endpoint de administración debe llamar a `permissionService.requirePermission(...)`.
`SecurityConfig` solo exige autenticación; los roles se resuelven desde la tabla de perfiles.

## CI
`.github/workflows/ci.yml` corre lint, tests y build de ambos proyectos.
