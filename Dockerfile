# Build stage
FROM node:22-bookworm AS builder

# Install build dependencies for mediasoup
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files for caching dependencies
COPY server/package.json server/package-lock.json /app/

# Install dependencies
RUN npm ci --ignore-scripts

# Copy the rest of the server code
COPY server /app/

# Rebuild native modules (e.g., mediasoup worker)
RUN npm rebuild

# Build TypeScript
RUN npm run typescript:build

# Copy example config
RUN cp config.example.mjs config.mjs

# Prune dev dependencies for production
RUN npm prune --production

# Runtime stage
FROM node:22-slim

WORKDIR /app

# Copy built app from builder
COPY --from=builder /app /app

# Link the package to create executable
RUN npm link

# Expose the default HTTP port (adjust based on config)
EXPOSE 4443

# Run the server
CMD ["mediasoup-demo-server"]
