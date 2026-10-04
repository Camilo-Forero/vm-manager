# IFX Cloud Virtual Machine Manager (Full-Stack SPA)

A high-performance, modern Single Page Application (SPA) for managing Virtual Machines (VMs) built with **React (TypeScript)** and **Tailwind CSS** on the frontend, and **Node.js (Express) + Socket.io** with **SQLite (Drizzle ORM)** on the backend. Fully containerized with **Docker** and **Docker Compose**.

---

## 🚀 Key Features

### 🖥️ Frontend (React, TypeScript & Tailwind CSS)
- **Modern UI & Dark Mode**: Sleek glassmorphism aesthetic with native light and dark mode toggling via sun/moon icons (persistent in localStorage).
- **Universal Header/Menu**: Consistent top navigation bar featuring the "Main Page" tab, dark mode toggle, user role badge, and secure logout.
- **Data Visualization**: Dedicated `Chart.js` panel displaying aggregate active VM resource allocation (CPU cores, RAM, and Disk) with real-time stats.
- **Role-Based Access Control (RBAC)**:
  - **Administrator**: Full CRUD permissions (create, edit, delete, start/stop VMs).
  - **Client**: Read-only access where creation, modification, and deletion buttons are **completely hidden** (not just disabled).
- **Optimistic UI & Feedback**: Immediate UI response on CRUD actions with automatic rollback on error, skeleton loaders, and interactive toast notifications.
- **Real-Time WebSockets**: Instant synchronization across connected clients using `Socket.io` with subtle flash highlight animations when VMs are updated or created.

### ⚙️ Backend (Node.js, Express & WebSockets)
- **Secure Authentication**:
  - JWT tokens are stored securely in `HttpOnly`, `SameSite=Lax`, and `Secure` (in production) cookies (never exposed to `localStorage`).
  - `POST /login`: Validates credentials, sets HttpOnly cookie, and returns user profile & role.
  - `POST /logout` & `GET /api/auth/me`: Session management.
- **RESTful Endpoints**:
  - `GET /api/vms` / `GET /vms`: List all VMs (Admin & Client).
  - `POST /api/vms` / `POST /login`: Auth and VM management.
  - `PUT /api/vms/{id}` / `DELETE /api/vms/{id}`: Admin operations.
- **Database & Migrations**:
  - SQLite database stored in root `DB/` folder with migration scripts in `DB/Migrations/`.
  - Drizzle ORM for type-safe database access.

---

## 🔑 Pre-configured Test Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@mail.com` | `123` | Full CRUD, Start/Stop VMs |
| **Client** | `client@mail.com` | `123` | Read-only (Creation/Edition/Deletion hidden) |

---

## 🛠️ Local Deployment Guide

### Option 1: Running with Docker Compose (Recommended)
To avoid any Docker Desktop host path sharing errors (`"path is not shared from the host"`), this project uses a **named Docker volume** (`db_data`) paired with image build-time packaging of the `DB` folder.

Simply run:
```bash
docker compose up --build
```
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

### Option 2: Running Locally Without Docker

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run db:seed
   npm run dev
   ```
   *(Backend runs on `http://localhost:5000`)*

2. **Start Frontend (in a separate terminal)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *(Frontend runs on `http://localhost:3000`)*

---

## 📐 Architecture & Technical Decisions

### Architecture Diagram

```mermaid
graph TD
    Client[React SPA Frontend] -->|HTTP / REST & Cookies| API[Express Backend API]
    Client -->|WebSocket / Socket.io| WS[WebSocket Server]
    API -->|Drizzle ORM| DB[(SQLite Database DB/database.sqlite)]
    WS -->|Broadcast vm:created / updated / deleted| Client
```

### Folder Structure
- `DB/`: Contains `DB/Migrations/0000_initial.sql`, `DB/schema.prisma`, and SQLite database.
- `backend/`: Express server, controllers, routes, auth middleware, and Dockerfile.
- `frontend/`: React Vite SPA components (`Navbar`, `ResourcesChart`, `VmCard`, `VmModal`), context providers, and Dockerfile with Nginx reverse proxy.

---

## 📝 Bitácora de IA (AI Journal)

### 1. ¿Qué herramientas de IA utilizaste?
- Gemini (via Zed AI Agent) para diseñar y redactar la arquitectura completa del proyecto, generar la estructura del monorepo, escribir la lógica backend (Express, JWT HttpOnly cookies, Socket.io, Drizzle ORM con sql.js), y construir la SPA en React TypeScript con Tailwind CSS y Chart.js.

### 2. ¿Для qué partes delegaste el trabajo pesado y dónde tuviste que intervenir?
- **Delegado**: Generación inicial de la estructura de carpetas, componentes de UI con Tailwind, configuración de Chart.js, manejo de Socket.io tanto en el servidor como en el cliente, y plantillas de Dockerfile / Docker Compose.
- **Intervención humana/guía**: Ajuste de los adaptadores de SQLite a WebAssembly (`sql.js`) para evitar problemas de compilación nativa C++ en entornos contenedores, validación estricta de los permisos de rol de cliente (ocultando completamente los botones de acción), y solución de las restricciones de recursos / file sharing de Docker Desktop mediante el uso de volúmenes nombrados de Docker (`named volumes`) combinados con copias en el build-time.

### 3. Muestra 1 o 2 prompts clave utilizados:
- *Prompt 1 (Docker Volume Fix)*: "Fix Docker Desktop path sharing error 'The path is not shared from the host' by updating docker-compose.yml to use a named Docker volume for SQLite while keeping DB migrations packaged in the backend image."
- *Prompt 2 (Frontend RBAC & Optimistic UI)*: "Create a React TypeScript VM management dashboard with Tailwind CSS. If user role is 'Client', completely hide (don't just disable) create, edit, and delete buttons. Implement Optimistic UI updates when toggling VM status or performing CRUD actions."
