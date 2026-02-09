# Maxturnos - Sistema de Gestión de Turnos

Sistema multi-tenant para gestión de turnos y reservas.

## Estructura del Proyecto

```
turnos/
├── backend/          # API Backend (Node.js/Express/MongoDB)
│   ├── server.js
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env
│   └── package.json
└── frontend/         # Frontend (React)
    ├── src/
    ├── public/
    └── package.json
```

## Instalación

### Instalar todas las dependencias

```bash
npm run install:all
```

O instalar por separado:

```bash
# Backend
npm run install:backend

# Frontend
npm run install:frontend
```

## Configuración

### Backend

1. Crea un archivo `.env` en `backend/` (puedes copiar `backend/.env.example`)
2. Configura las variables de entorno (ver `backend/README.md`)

## Ejecución

### Desarrollo

**Opción 1: Dos terminales separadas**

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm start
```

**Opción 2: Una sola terminal (requiere `concurrently`)**
```bash
npm install
npm run dev
```

### Producción

```bash
npm run build
npm run server
```

## URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- API Base: `http://localhost:5000/api`

## Documentación

- `backend/README.md` - Configuración detallada del backend
