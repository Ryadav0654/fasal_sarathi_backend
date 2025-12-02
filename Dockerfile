# ---- STAGE 1: Builder ----
FROM node:18-bullseye AS builder

WORKDIR /app

# Install Node.js dependencies
COPY package*.json ./
RUN npm ci --only=production

# ---- STAGE 2: Production ----
FROM node:18-slim AS production

ENV NODE_ENV=production

WORKDIR /app

# Copy dependencies and code from the builder stage
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

# Switch to the non-root 'node' user
USER node

# Expose the application port
EXPOSE 8080

# The command to run the application
CMD ["npm", "start"]
