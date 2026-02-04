# Matador - Docker Deployment

A lightweight, standalone job queue monitoring dashboard that works with BullMQ and Redis.

## Quick Start with Docker

### Using Docker Compose (Recommended for Testing)

The easiest way to get started is with Docker Compose, which runs both the dashboard and Redis:

```bash
# Build and start both dashboard and Redis
docker-compose up --build

# Access the dashboard at http://localhost:3000
```

To stop:
```bash
docker-compose down
```

### Building the Docker Image

```bash
# Build the image
docker build -t bullmq-dashboard .

# Check image size
docker images bullmq-dashboard
```

### Running the Container

#### With Docker Compose Redis

```bash
# Start Redis first
docker-compose up redis -d

# Run dashboard connecting to compose Redis
docker run -p 3000:3000 \
  --network bullmq-dashboard-main_default \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  bullmq-dashboard
```

#### With External Redis

```bash
docker run -p 3000:3000 \
  -e REDIS_HOST=your-redis-host \
  -e REDIS_PORT=6379 \
  -e REDIS_PASSWORD=your-password \
  bullmq-dashboard
```

#### With Local Redis (Host Network)

```bash
# On Linux
docker run --network host \
  -e REDIS_HOST=localhost \
  bullmq-dashboard

# On Mac/Windows (use host.docker.internal)
docker run -p 3000:3000 \
  -e REDIS_HOST=host.docker.internal \
  bullmq-dashboard
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `REDIS_HOST` | Redis server hostname | `localhost` |
| `REDIS_PORT` | Redis server port | `6379` |
| `REDIS_PASSWORD` | Redis password (optional) | - |
| `AUTO_REFRESH_INTERVAL` | Dashboard refresh interval (ms) | `5000` |

## Local Development

### Prerequisites

- Node.js 18+
- Redis running locally or accessible remotely

### Setup

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Running Locally

```bash
# Terminal 1: Build and run backend server
cd server
npm run dev

# Terminal 2: Run frontend dev server (in another terminal)
npm run dev
```

Or run both frontend and backend together:

```bash
# Build frontend
npm run build

# Start backend (serves built frontend)
cd server
npm run dev
```

Access at `http://localhost:3000`

## Features

- **Real-time Monitoring**: Auto-refreshes every 5 seconds
- **Queue Overview**: View all BullMQ queues with job counts
- **Job Management**: Filter jobs by status, queue, and search
- **Job Details**: View complete job data, attempts, and error messages
- **Lightweight**: ~150-200MB Docker image
- **Standalone**: Single container with frontend and backend

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/queues` - List all queues with job counts
- `GET /api/jobs` - Get all jobs (supports `?queue=`, `?status=`, `?search=`)
- `GET /api/stats` - Get aggregate statistics
- `GET /api/jobs/:queue/:id` - Get specific job details

## Architecture

The application consists of:

1. **Frontend**: React + TypeScript + TailwindCSS + shadcn/ui
2. **Backend**: Express + BullMQ + IORedis
3. **Build**: Multi-stage Docker build for minimal image size

```
bullmq-dashboard/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── services/          # API client
│   └── ...
├── server/                 # Node.js backend
│   └── src/
│       ├── index.ts       # Express server
│       ├── bullmq.service.ts  # BullMQ integration
│       └── types.ts       # Shared types
└── Dockerfile             # Multi-stage build
```

## Troubleshooting

### Cannot connect to Redis

- Ensure Redis is running and accessible
- Check `REDIS_HOST` and `REDIS_PORT` environment variables
- For local Redis on Mac/Windows, use `host.docker.internal` as host

### Dashboard shows no queues

- Verify BullMQ queues exist in Redis
- Check Redis connection in browser console
- Use `/api/health` endpoint to verify backend connectivity

### Image size too large

Check the build:
```bash
docker images bullmq-dashboard
# Should be ~150-200MB
```

If larger, ensure `.dockerignore` is properly excluding `node_modules` and `dist`.

## Production Deployment

### Deploy to Docker Registry

```bash
# Tag for your registry
docker tag bullmq-dashboard your-registry.com/bullmq-dashboard:latest

# Push to registry
docker push your-registry.com/bullmq-dashboard:latest
```

### Run in Production

```bash
docker run -d \
  --name bullmq-dashboard \
  --restart unless-stopped \
  -p 3000:3000 \
  -e REDIS_HOST=prod-redis-host \
  -e REDIS_PORT=6379 \
  -e REDIS_PASSWORD=secret \
  your-registry.com/bullmq-dashboard:latest
```

## License

MIT
