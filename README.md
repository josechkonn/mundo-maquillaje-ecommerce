# Mundo Maquillaje — E-Commerce

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.5-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk)](https://openjdk.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://www.docker.com/)

Plataforma de comercio electrónico especializada en productos de belleza y maquillaje. Construida con una arquitectura moderna **full-stack**: backend robusto en **Spring Boot** y frontend reactivo en **React 19 + TypeScript**.

---

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Ejecución](#instalación-y-ejecución)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Docker](#docker)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Licencia](#licencia)

---

## Características

### Tienda Online (Cliente)
- Catálogo de productos con filtros avanzados, búsqueda y paginación.
- Variantes de producto (tamaño, color, tono) con selector visual.
- Carrito de compras persistente.
- Checkout completo con múltiples métodos de pago y envío.
- Gestión de direcciones de envío con ubicaciones jerárquicas (estado → municipio → ciudad → parroquia).
- Sistema de favoritos.
- Autenticación y autorización segura con JWT / OAuth2.
- Panel de cuenta del cliente: pedidos, perfil, cambio de contraseña.

### Panel de Administración
- Dashboard con métricas en tiempo real, gráficas de ventas y estadísticas.
- Gestión de productos, categorías, marcas, colecciones y banners.
- Administración de pedidos, estado de envíos y tracking de órdenes.
- Control de inventario, cajas registradoras y transacciones.
- Gestión de métodos de pago y envío.
- Códigos de descuento y cupones.
- Metas mensuales de ventas.
- Sincronización automática de tasas de cambio (BCV).
- Reportes exportables (Excel).
- Gestión de usuarios, roles y permisos granulares.

---

## Tecnologías

### Backend
| Tecnología | Uso |
|------------|-----|
| **Spring Boot 4.0.5** | Framework principal de la API REST |
| **Java 21** | Lenguaje y runtime |
| **Spring Data JPA** | Persistencia y acceso a datos |
| **Spring Security + OAuth2** | Autenticación y autorización |
| **PostgreSQL** | Base de datos relacional |
| **Lombok** | Reducción de boilerplate |
| **JSoup** | Web scraping (tasas BCV) |
| **Maven** | Gestión de dependencias y build |

### Frontend
| Tecnología | Uso |
|------------|-----|
| **React 19** | Biblioteca de UI |
| **TypeScript** | Tipado estático |
| **Vite** | Bundler y entorno de desarrollo |
| **Tailwind CSS** | Estilos utilitarios |
| **React Router v7** | Enrutamiento SPA |
| **Zustand** | Gestión de estado global |
| **React Hook Form + Zod** | Formularios y validación |
| **TipTap** | Editor de texto enriquecido |
| **Recharts** | Gráficas y visualización de datos |
| **Supabase** | Backend-as-a-Service (auth/storage) |
| **Vitest + Testing Library** | Tests unitarios |

---

## Arquitectura

```
┌─────────────────────────────────────────┐
│              Cliente (Browser)            │
│  React 19 · TypeScript · Tailwind CSS   │
└──────────────┬──────────────────────────┘
               │ REST / JSON
┌──────────────▼──────────────────────────┐
│              Backend (Java 21)            │
│  Spring Boot · Spring Security · JPA    │
│  OAuth2 Resource Server · PostgreSQL    │
└─────────────────────────────────────────┘
```

- La comunicación entre frontend y backend es **stateless** mediante API REST protegida con JWT.
- El backend implementa una arquitectura por capas: **Controllers → Services → Repositories → Entities**.
- El frontend utiliza una arquitectura basada en **feature folders**: páginas, componentes, hooks, stores y utilidades.

---

## Requisitos Previos

- **Java 21** (JDK)
- **Maven 3.9+**
- **Node.js 20+** y **npm**
- **PostgreSQL 15+**
- *(Opcional)* **Docker** y **Docker Compose**

---

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/mundo-maquillaje-ecommerce.git
cd mundo-maquillaje-ecommerce
```

### 2. Configurar la base de datos

Crea una base de datos en PostgreSQL y actualiza las credenciales en:
```properties
# backend/src/main/resources/application.properties (o application-dev.properties)
spring.datasource.url=jdbc:postgresql://localhost:5432/mundo_maquillaje
spring.datasource.username=tu_usuario
spring.datasource.password=tu_password
```

### Backend

```bash
cd backend

# Compilar y ejecutar tests
./mvnw clean verify

# Ejecutar en modo desarrollo
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

La API estará disponible en: `http://localhost:8080`

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### Docker

El proyecto incluye un `Dockerfile` para el backend.

```bash
# Construir imagen del backend
docker build -t mundo-maquillaje-backend .

# Ejecutar
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/mundo_maquillaje \
  -e SPRING_DATASOURCE_USERNAME=tu_usuario \
  -e SPRING_DATASOURCE_PASSWORD=tu_password \
  mundo-maquillaje-backend
```

---

## Variables de Entorno

### Backend

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | URL de conexión JDBC | `jdbc:postgresql://localhost:5432/mundo_maquillaje` |
| `SPRING_DATASOURCE_USERNAME` | Usuario de la base de datos | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña de la base de datos | `secret` |
| `SPRING_PROFILES_ACTIVE` | Perfil de Spring activo | `dev`, `prod` |

### Frontend

Crea un archivo `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

---

## Estructura del Proyecto

```
mundo-maquillaje-ecommerce/
├── backend/                    # API REST con Spring Boot
│   ├── src/
│   │   ├── main/java/mundo_maquillaje/ecommerce/
│   │   │   ├── Config/         # Configuraciones (Security, CORS, etc.)
│   │   │   ├── Controllers/    # Endpoints REST
│   │   │   ├── Services/       # Lógica de negocio
│   │   │   ├── Repositories/   # Acceso a datos (Spring Data JPA)
│   │   │   ├── DTO/            # Objetos de transferencia de datos
│   │   │   ├── Enums/          # Enumeraciones (Roles, Estados, etc.)
│   │   │   └── ...
│   │   └── test/               # Tests unitarios e integración
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/                   # Aplicación SPA con React
│   ├── src/
│   │   ├── components/         # Componentes reutilizables (UI, home, product, cart, auth, account, checkout)
│   │   ├── pages/              # Vistas por ruta (tienda + admin)
│   │   ├── layouts/            # Layouts (StoreLayout, AdminLayout, CheckoutLayout)
│   │   ├── routes/             # Definición de rutas y middlewares
│   │   ├── stores/             # Estado global con Zustand
│   │   ├── hooks/              # Custom hooks
│   │   ├── test/               # Tests con Vitest
│   │   └── main.tsx            # Punto de entrada
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── .gitignore
└── README.md
```

---

## Scripts Útiles

### Backend

| Comando | Descripción |
|---------|-------------|
| `./mvnw spring-boot:run` | Ejecutar la aplicación |
| `./mvnw test` | Ejecutar todos los tests |
| `./mvnw package -DskipTests` | Generar JAR sin tests |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con Vite |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualizar build de producción |
| `npm run test` | Ejecutar tests con Vitest |
| `npm run test:watch` | Ejecutar tests en modo watch |
| `npm run lint` | Ejecutar ESLint |

---

## Licencia

Este proyecto es privado y fue desarrollado para fines comerciales. Todos los derechos reservados.

---

> Desarrollado con ❤️ para el mundo de la belleza.
