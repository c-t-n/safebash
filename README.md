# SafeBash

SafeBash is a web application designed to analyze, store, and make trustable app installations via bash scripts using `curl | sh` commands. It helps users verify the safety and security of bash scripts before executing them in their terminal.

## Features

- **Script Analysis**: Analyze bash scripts for potential security risks
- **Trust Scoring**: Calculate trust scores based on script content analysis
- **Risk Detection**: Identify dangerous patterns and commands
- **Script Repository**: Store and manage analyzed scripts
- **Web Interface**: User-friendly React interface for script analysis

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Frontend**: React with Vite and TypeScript
- **Architecture**: Monorepo using npm workspaces

## Getting Started

### Prerequisites

**Option 1: Local Development**
- Node.js >= 18.0.0
- npm >= 9.0.0

**Option 2: Docker Development**
- Docker
- Docker Compose

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd safebash

# Install all dependencies
npm install
```

### Environment Setup

1. **Backend configuration**:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   # Edit apps/backend/.env with your configuration
   ```

2. **Frontend configuration** (optional):
   ```bash
   cp apps/frontend/.env.example apps/frontend/.env
   ```

### Running the Application

```bash
# Run both frontend and backend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

### Running with Docker

Alternatively, you can use Docker Compose to run the development environment:

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

The application will be available at the same URLs as above.

### Development

```bash
# Run backend only
npm run backend:dev

# Run frontend only
npm run frontend:dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
safebash/
├── apps/
│   ├── backend/          # NestJS API application
│   │   ├── src/
│   │   │   ├── scripts/  # Script analysis module
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── frontend/         # React application
│       ├── src/
│       │   ├── pages/    # Page components
│       │   ├── services/ # API clients
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── package.json
│
├── packages/             # Shared packages (future)
├── package.json          # Root package.json
└── CLAUDE.md            # Claude Code documentation
```

## API Documentation

### Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/scripts` - List all analyzed scripts
- `GET /api/scripts/:id` - Get a specific script
- `POST /api/scripts/analyze` - Analyze a bash script from URL

### Example: Analyze a Script

```bash
curl -X POST http://localhost:3001/api/scripts/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/install.sh"}'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

[Add your license here]

## Security

If you discover a security vulnerability, please email [your-email] instead of using the issue tracker.
