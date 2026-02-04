# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-04

### Added
- Initial release of Matador
- Real-time queue monitoring with auto-discovery
- Job filtering by status (Completed, Failed, Active, Waiting, Delayed)
- Next scheduled job display with live countdown
- Modern, responsive UI built with React and shadcn/ui
- REST API endpoints for queues, jobs, and statistics
- Docker support with multi-stage builds
- Docker Compose configuration for easy deployment
- Comprehensive documentation and README

### Performance
- **99% faster API response times** through optimization
  - `/api/jobs`: 25,000ms → 238ms
  - `/api/queues`: 10,000ms → 115ms
  - `/api/stats`: 27,000ms → 238ms
- Parallel Redis calls for job fetching
- Queue discovery caching (5s TTL)
- Optimized job limit (30 per status)

### Architecture
- Modular backend service architecture:
  - `BullMQService` - Main facade orchestrator
  - `RedisConnectionService` - Connection management
  - `QueueDiscoveryService` - Queue auto-discovery with caching
  - `JobFetchingService` - Optimized parallel job fetching
  - `StatsService` - Aggregate statistics calculation

### Developer Experience
- TypeScript support throughout
- Vite for fast frontend builds
- Express backend with clean routing
- Comprehensive test setup
- Development and production Docker configurations

---

## Release Notes Template (for future releases)

### [Unreleased]

#### Added
- New features

#### Changed
- Changes in existing functionality

#### Deprecated
- Soon-to-be removed features

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security fixes
