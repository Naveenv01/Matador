# Multi-stage build for minimal image size

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY bun.lockb* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy frontend source
COPY . .

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/server

# Copy backend package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source
COPY server/src ./src
COPY server/tsconfig.json ./

# Install TypeScript for build
RUN npm install -D typescript

# Build backend
RUN npm run build

# Stage 3: Production Runtime
FROM node:18-alpine

WORKDIR /app

# Copy backend package files and install production dependencies
COPY --from=backend-builder /app/server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built backend (server code)
COPY --from=backend-builder /app/server/dist ./server

# Copy built frontend (React app)
COPY --from=frontend-builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server/index.js"]
