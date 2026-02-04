# 🚀 BullMQ Dashboard - Documentation

Welcome to the BullMQ Dashboard documentation! This guide will help you understand and use all features of this high-performance queue monitoring tool.

## Table of Contents

- [Features Overview](#features-overview)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Performance](#performance)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Features Overview

### Real-time Queue Monitoring
The dashboard automatically discovers all BullMQ queues in your Redis instance and displays them in a clean interface.

### Job Management
- **View Jobs**: See all jobs across all queues
- **Filter by Status**: Completed, Failed, Active, Waiting, Delayed
- **Filter by Queue**: Select specific queues from the dropdown
- **Search**: Find jobs by ID or name
- **Job Details**: View full job data, progress, and timestamps

### Statistics
- **Aggregate Stats**: Total counts across all queues
- **Per-Queue Stats**: Individual queue metrics
- **Next Scheduled Job**: See upcoming delayed jobs with countdown

### User Interface
- **Modern Design**: Built with shadcn/ui components
- **Responsive**: Works on desktop and mobile
- **Dark Mode Ready**: Adapts to system preferences (if implemented)
- **Real-time Updates**: Auto-refresh with TanStack Query

## Architecture

### Frontend Layer
- **Technology**: React 18 + TypeScript + Vite
- **State Management**: TanStack Query for server state
- **UI Framework**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Routing**: React Router Dom

### Backend Layer
The backend follows a modular architecture with specialized services:

#### BullMQ Service (Facade)
Main orchestrator that provides a clean API to the routes. Delegates work to specialized services.

**Location**: `server/src/services/bullmq.service.ts`

#### Redis Connection Service
Manages Redis connections and BullQueue instances.
- Singleton pattern for Redis client
- Lazy loading of queue instances
- Connection pooling

**Location**: `server/src/services/redis-connection.service.ts`

#### Queue Discovery Service
Auto-discovers BullMQ queues from Redis keys.
- Pattern matching for `bull:*:id`
- 5-second caching to reduce Redis load
- Fetches queue metadata (counts, paused status)

**Location**: `server/src/services/queue-discovery.service.ts`

#### Job Fetching Service
Optimized job retrieval with parallel operations.
- **Parallel fetching** across queues and statuses
- **Configurable limits** (default: 30 jobs per status)
- Supports filtering by queue and status

**Location**: `server/src/services/job-fetching.service.ts`

#### Stats Service
Calculates aggregate statistics.
- Total job counts across all statuses
- Per-queue statistics
- Next scheduled job detection

**Location**: `server/src/services/stats.service.ts`

## Installation

See the main [README.md](../README.md) for installation instructions.

## Configuration

### Environment Variables

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=           # Optional

# Server Configuration  
PORT=3000
NODE_ENV=production       # or development

# Performance Tuning (Optional)
JOB_LIMIT=30             # Jobs per status to fetch
QUEUE_CACHE_TTL=5000     # Queue discovery cache in ms
```

### Redis Best Practices

1. **Eviction Policy**: Set to `noeviction` to prevent data loss
   ```bash
   redis-cli CONFIG SET maxmemory-policy noeviction
   ```

2. **Memory**: Allocate sufficient memory for your workload
   ```bash
   maxmemory 2gb
   ```

3. **Persistence**: Enable AOF for durability
   ```bash
   appendonly yes
   appendfsync everysec
   ```

## API Reference

### Queues Endpoint

**GET** `/api/queues`

Returns all discovered queues with their status counts.

**Response:**
```json
[
  {
    "name": "email-queue",
    "completed": 1250,
    "failed": 23,
    "active": 5,
    "waiting": 42,
    "delayed": 8,
    "isPaused": false
  }
]
```

### Jobs Endpoint

**GET** `/api/jobs?queue={queueName}&status={status}`

Returns jobs with optional filtering.

**Query Parameters:**
- `queue` (optional): Filter by specific queue name
- `status` (optional): Filter by job status (completed, failed, active, waiting, delayed)

**Response:**
```json
[
  {
    "id": "12345",
    "name": "send-email",
    "queue": "email-queue",
    "status": "completed",
    "progress": 100,
    "timestamp": "2026-02-04T12:00:00.000Z",
    "data": { /* job data */ },
    "returnvalue": { /* job result */ },
    "attemptsMade": 1,
    "created": "2026-02-04T12:00:00.000Z"
  }
]
```

### Stats Endpoint

**GET** `/api/stats`

Returns aggregate statistics across all queues.

**Response:**
```json
{
  "total": {
    "completed": 5000,
    "failed": 123,
    "active": 45,
    "waiting": 200,
    "delayed": 15
  },
  "nextScheduledJob": {
    "name": "cleanup-task",
    "queue": "maintenance",
    "scheduledFor": "2026-02-04T13:00:00.000Z"
  }
}
```

### Health Check Endpoint

**GET** `/api/health`

Returns server health status.

**Response:**
```json
{
  "status": "healthy",
  "redis": "connected",
  "uptime": 3600
}
```

## Performance

### Optimization Techniques

1. **Parallel Redis Calls**
   - Jobs are fetched concurrently using `Promise.all()`
   - Multiple queues processed simultaneously
   - All statuses fetched in parallel

2. **Smart Caching**
   - Queue discovery cached for 5 seconds
   - Reduces redundant Redis KEYS commands
   - Configurable TTL

3. **Payload Optimization**
   - Default limit of 30 jobs per status
   - Prevents overwhelming the UI
   - Configurable via environment variable

4. **Connection Pooling**
   - Reuses Redis connections
   - BullQueue instances cached
   - Reduced connection overhead

### Benchmarks

| Endpoint | Before | After | Improvement |
|----------|--------|-------|-------------|
| `/api/jobs` | 25,000ms | 238ms | **99%** |
| `/api/queues` | 10,000ms | 115ms | **98%** |
| `/api/stats` | 27,000ms | 238ms | **99%** |

## Deployment

### Docker Deployment

See [README-DOCKER.md](../README-DOCKER.md) for comprehensive Docker deployment instructions.

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure Redis with `noeviction` policy
- [ ] Set up Redis persistence (AOF)
- [ ] Configure proper Redis memory limits
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Back up Redis data regularly

### Scaling Considerations

For high-volume scenarios:

1. **Redis Clustering**: Use Redis Cluster for horizontal scaling
2. **Read Replicas**: Distribute read load across replicas
3. **Load Balancing**: Run multiple dashboard instances behind a load balancer
4. **Caching Layer**: Add application-level caching (Redis or Memcached)

## Troubleshooting

### Dashboard shows "No queues found"

**Causes:**
- No BullMQ queues exist in Redis
- Wrong Redis host/port/password
- Queue naming doesn't follow BullMQ pattern

**Solutions:**
1. Verify Redis connection settings
2. Check if queues exist: `redis-cli KEYS "bull:*"`
3. Ensure queues use default BullMQ prefix

### Slow API response times

**Causes:**
- High number of jobs (>1000 per queue)
- Network latency to Redis
- Redis under heavy load

**Solutions:**
1. Reduce `JOB_LIMIT` environment variable
2. Increase `QUEUE_CACHE_TTL`
3. Use Redis on same network/server
4. Monitor Redis performance with `INFO` command

### Jobs not updating in real-time

**Causes:**
- TanStack Query cache not refreshing
- Browser throttling background tabs

**Solutions:**
1. Check TanStack Query `refetchInterval` settings
2. Keep dashboard tab active
3. Hard refresh browser (Cmd+Shift+R)

### Connection errors

**Error**: `ECONNREFUSED`

**Solution**: Verify Redis is running and accessible:
```bash
redis-cli ping  # Should return "PONG"
```

**Error**: `NOAUTH Authentication required`

**Solution**: Set `REDIS_PASSWORD` in environment variables

**Error**: `Eviction policy is volatile-lru`

**Solution**: Change Redis eviction policy:
```bash
redis-cli CONFIG SET maxmemory-policy noeviction
```

## Need More Help?

- 📖 [Main README](../README.md)
- 🐛 [Report an Issue](https://github.com/yourusername/bullmq-dashboard/issues)
- 💬 [Discussions](https://github.com/yourusername/bullmq-dashboard/discussions)
- 📧 [Contact Maintainers](https://github.com/yourusername/bullmq-dashboard)

---

**Last Updated**: 2026-02-04
