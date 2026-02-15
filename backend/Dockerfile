FROM node:20-slim

# Install build dependencies for bcrypt (native module)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user for security
RUN groupadd --gid 1001 nodejs \
    && useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

ENV NODE_ENV=production

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Change ownership and switch to non-root user
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

# Health check uses PORT so it works when Render injects PORT at runtime (e.g. 10000)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const p = process.env.PORT || 3000; require('http').get('http://127.0.0.1:'+p+'/api/health', (r) => { let b=''; r.on('data', c=>b+=c); r.on('end', ()=> process.exit(r.statusCode===200 ? 0 : 1)); }).on('error', ()=> process.exit(1));"

CMD ["node", "server.js"]
