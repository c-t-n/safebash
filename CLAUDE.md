# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SafeBash is a web application for analyzing, storing, and making trustable app installations via bash scripts using `curl | sh` commands. The project helps users verify the safety of bash scripts before executing them.

**Tech Stack:**
- **Language**: TypeScript (100%)
- **Backend**: NestJS
- **Frontend**: React with Vite
- **Architecture**: Monorepo using npm workspaces

## Monorepo Structure

```
safebash/
├── apps/
│   ├── backend/          # NestJS API (@safebash/backend)
│   └── frontend/         # React app (@safebash/frontend)
└── packages/             # Shared packages (future)
```

## Development Commands

### Installation
```bash
npm install              # Install all dependencies (root + workspaces)
```

### Development
```bash
# Run both frontend and backend in parallel
npm run dev

# Run backend only
npm run backend:dev      # Starts on http://localhost:3001

# Run frontend only
npm run frontend:dev     # Starts on http://localhost:5173
```

### Building
```bash
# Build all workspaces
npm run build

# Build specific workspace
npm run backend:build
npm run frontend:build
```

### Testing
```bash
# Run tests in all workspaces
npm test

# Run tests in specific workspace
npm test -w @safebash/backend
npm test -w @safebash/frontend
```

### Linting & Formatting
```bash
npm run lint             # Lint all workspaces
npm run format           # Format all files with Prettier
```

### Working with Workspaces
```bash
# Run any command in a specific workspace
npm run <script> -w @safebash/backend
npm run <script> -w @safebash/frontend

# Install a dependency in a workspace
npm install <package> -w @safebash/backend
npm install <package> -w @safebash/frontend
```

### Docker Development Environment
```bash
# Start both services with Docker Compose
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild containers
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Docker Services:**
- **backend**: NestJS API on port 3001
- **frontend**: React app on port 5173
- Both services have hot-reload enabled via volume mounts
- Services communicate via `safebash-network` bridge network

**Requirements:**
- Docker and Docker Compose installed
- Copy `.env.example` files before starting:
  ```bash
  cp apps/backend/.env.example apps/backend/.env
  ```

## Backend Architecture (NestJS)

**Location**: `apps/backend/`

### Module Structure
- **AppModule**: Root module with health check endpoint
- **ScriptsModule**: Core functionality for script management and analysis
  - `ScriptsController`: REST endpoints for script operations
  - `ScriptsService`: Business logic for script storage (in-memory Map)
  - `AnalysisService`: Bash script security analysis
  - `dto/`: Data Transfer Objects with validation
    - `CreateScriptDto`: Validates script upload requests
    - `ScriptResponseDto`: Standardized script response format

### Data Storage
- **In-Memory Storage**: Scripts stored in a Map with UUID keys
- **UUID Generation**: Uses Node.js `crypto.randomUUID()` for unique IDs
- **Validation**: Automatic request validation using `class-validator`
  - Required fields: `name`, `content`
  - Optional fields: `description`, `url`
  - URL validation for optional `url` field

### API Endpoints
Base URL: `http://localhost:3001/api`

**Health Check:**
- `GET /api/health` - Health check endpoint

**Script Management:**
- `GET /api/scripts` - List all stored scripts
- `GET /api/scripts/:id` - Get a single script by ID
- `POST /api/scripts` - Upload a new bash script
  - Body: `{ name: string, content: string, description?: string, url?: string }`
  - Returns: Script object with generated UUID
- `DELETE /api/scripts/:id` - Delete a script by ID

**Script Analysis:**
- `POST /api/scripts/analyze` - Analyze a bash script from URL
  - Body: `{ url: string }`

### Configuration
- Environment variables: Copy `apps/backend/.env.example` to `apps/backend/.env`
- Default port: 3001
- CORS enabled for frontend (http://localhost:5173)

## Frontend Architecture (React + Vite)

**Location**: `apps/frontend/`

### Directory Structure
- `src/pages/` - Page components (HomePage, AnalyzePage)
- `src/components/` - Reusable UI components
- `src/services/` - API client and business logic

### API Integration
- API calls use `/api` prefix, proxied to backend via Vite dev server
- API service located at `src/services/api.ts`

### Routing
- `/` - Home page
- `/analyze` - Script analysis page

### Configuration
- Vite dev server port: 5173
- API proxy configured in `vite.config.ts` to forward `/api/*` to backend

## Key Design Patterns

### Backend Patterns
1. **Dependency Injection**: NestJS uses constructor-based DI for all services
2. **Module Organization**: Feature-based modules (Scripts, Analysis)
3. **Service Layer Pattern**: Controllers delegate to services for business logic
4. **Interface Segregation**: TypeScript interfaces for data contracts

### Frontend Patterns
1. **Component Composition**: Functional components with hooks
2. **Client-side Routing**: React Router for SPA navigation
3. **Service Layer**: API calls abstracted in `services/` directory
4. **Type Safety**: TypeScript for all components and services

## Core Business Logic

### Script Analysis Flow
1. User submits script URL via frontend
2. Frontend calls `POST /api/scripts/analyze`
3. `AnalysisService` fetches and analyzes the script content
4. Analysis returns trust score, risks, warnings, and safe patterns
5. Results displayed to user

**Note**: The analysis logic in `AnalysisService` is currently a placeholder. Future implementation will include:
- Fetching script content from URL
- Pattern matching for dangerous commands
- Trust score calculation based on risk factors
- Detection of common malicious patterns

## TypeScript Configuration

- **Backend**: CommonJS modules, decorators enabled for NestJS
- **Frontend**: ESNext modules, React JSX transform
- Both use strict type checking with null checks enabled

## Adding New Features

### Adding a Backend Module
1. Create module directory: `apps/backend/src/<module-name>/`
2. Create files: `<module>.module.ts`, `<module>.controller.ts`, `<module>.service.ts`
3. Import module in `AppModule`
4. Follow NestJS module pattern with `@Module()` decorator

### Adding a Frontend Page
1. Create component: `apps/frontend/src/pages/<PageName>.tsx`
2. Add route in `App.tsx`
3. Create API service methods in `services/api.ts` if needed

### Adding Shared Code
- Place shared utilities in `packages/` directory
- Update workspace configuration to include the package
- Import using workspace protocol: `@safebash/<package-name>`

## Environment Setup

### Backend Environment Variables
Required variables (see `apps/backend/.env.example`):
- `NODE_ENV`: development/production
- `PORT`: API server port (default: 3001)
- `CORS_ORIGIN`: Allowed frontend origin
- `DATABASE_URL`: PostgreSQL connection (future)
- `JWT_SECRET`: Authentication secret (future)

### Frontend Environment Variables
Optional variables (see `apps/frontend/.env.example`):
- `VITE_API_URL`: Override API base URL

## Testing Strategy

### Backend Testing
- Framework: Jest
- Run: `npm test -w @safebash/backend`
- Watch mode: `npm run test:watch -w @safebash/backend`
- Coverage: `npm run test:cov -w @safebash/backend`

### Frontend Testing
- Framework: Vitest
- Run: `npm test -w @safebash/frontend`

## Important Notes

1. **API Proxy**: In development, Vite proxies `/api/*` requests to the backend. In production, ensure proper API URL configuration.

2. **Workspace Commands**: Always use `-w` flag or workspace-specific scripts to avoid running commands in wrong context.

3. **TypeScript Compilation**: Backend uses `tsc` via NestJS CLI, frontend uses Vite's built-in TypeScript handling.

4. **Port Conflicts**: Backend (3001) and frontend (5173) must not conflict with other services.

5. **CORS Configuration**: Update `CORS_ORIGIN` in backend if frontend URL changes.

6. **Docker Development**: Use `docker-compose up` for containerized development. Hot-reload is enabled via volume mounts. Ensure `.env` files are configured before starting containers.
