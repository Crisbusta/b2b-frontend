# B2B Marketplace — Frontend

Interfaz web para una plataforma B2B de abastecimiento industrial. Compradores crean solicitudes de cotización (RFQ), comparan ofertas de proveedores y acceden a una vitrina de catálogo. Proveedores reciben invitaciones y envían cotizaciones.

## Stack

- **React 18** + **TypeScript**
- **Vite 5** — dev server con proxy hacia la API
- **React Router v6** — navegación SPA
- **CSS propio** — sin librerías UI externas, design system con variables CSS

## Estructura

```
frontend/
├── index.html
├── vite.config.ts                  # Proxy /api → http://api:8080
├── src/
│   ├── main.tsx
│   ├── App.tsx                     # Rutas principales
│   ├── index.css                   # Design system (variables, componentes CSS)
│   ├── api/
│   │   └── client.ts               # Wrappers fetch hacia /api/v1
│   ├── types/
│   │   └── dto.ts                  # Tipos TypeScript alineados con el backend
│   ├── components/
│   │   ├── Layout.tsx              # Nav + outlet
│   │   └── RFQCompareTable.tsx     # Tabla comparativa de cotizaciones
│   └── pages/
│       ├── LoginMock.tsx           # Login simulado (elige empresa y rol)
│       ├── Dashboard.tsx           # Resumen de actividad
│       ├── RFQList.tsx             # Lista de RFQs
│       ├── RFQDetail.tsx           # Detalle + comparación de quotes
│       ├── RFQCreate.tsx           # Crear nueva RFQ desde template
│       ├── QuoteCreate.tsx         # Proveedor: responder a una RFQ
│       └── CatalogPage.tsx         # Vitrina de proveedores con contacto
└── Dockerfile
```

## Rutas

| Ruta | Página | Acceso |
|---|---|---|
| `/login` | Login mock | Público |
| `/` | Dashboard | Autenticado |
| `/rfqs` | Lista de RFQs | Autenticado |
| `/rfqs/new` | Crear RFQ | Comprador |
| `/rfqs/:id` | Detalle + comparar | Autenticado |
| `/rfqs/:id/quote` | Cotizar | Proveedor |
| `/catalog` | Vitrina de proveedores | Público |

## Autenticación (mock)

El login simulado guarda la empresa y rol seleccionados en `localStorage`. Cada request al backend incluye automáticamente los headers:

- `X-Tenant-Company-Id`
- `X-Mock-User-Role`

## Design system

Variables CSS principales definidas en `index.css`:

| Variable | Valor |
|---|---|
| `--primary` | `#1B3A6B` (navy) |
| `--accent` | `#E8520A` (naranja) |
| `--font-sans` | Inter (Google Fonts) |

Clases de componentes: `.btn`, `.card`, `.badge`, `.stat-card`, `.vitrina-card`, `.catalog-card`, `.filter-tabs`, `.form-input`, `.table-container`, `.nav-link`, `.step-circle`.

Todos los iconos son SVG inline con `currentColor` — sin dependencias externas.

## Correr localmente

### Con Docker Compose (recomendado)

Desde la raíz del monorepo:

```bash
docker compose up --build
```

Frontend disponible en `http://localhost:3000`.

### Sin Docker

```bash
cd frontend
npm install
npm run dev
```

Requiere que el backend esté corriendo en `http://localhost:8080` (o ajustar el proxy en `vite.config.ts`).

### Build de producción

```bash
npm run build
```

Los archivos estáticos quedan en `dist/`.

## Variables de entorno

No se requieren variables de entorno para desarrollo. El proxy de Vite redirige `/api` al backend automáticamente.

## Próximos pasos

- [ ] Formulario de contacto conectado a `POST /api/v1/contacts`
- [ ] Notificaciones en tiempo real (WebSocket o polling)
- [ ] Autenticación real con JWT
- [ ] Tests con Vitest
