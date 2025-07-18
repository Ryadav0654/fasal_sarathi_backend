# ---- STAGE 1: Builder ----
FROM node:18-bullseye AS builder

RUN apt-get update && apt-get install -y python3 python3-pip python3-venv --no-install-recommends && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create and activate Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js dependencies
COPY package*.json ./
RUN npm ci --only=production


# ---- STAGE 2: Production ----
FROM node:18-slim AS production

ENV NODE_ENV=production

# --- START OF FIX ---
# Install the core Python runtime needed by the virtual environment.
# Do this as root before changing user.
RUN apt-get update && apt-get install -y python3 --no-install-recommends && apt-get clean && rm -rf /var/lib/apt/lists/*
# --- END OF FIX ---

WORKDIR /app

# Copy dependencies and code from the builder stage, setting ownership to the existing 'node' user.
COPY --from=builder --chown=node:node /opt/venv /opt/venv
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

# Add the virtual environment's bin to the path
ENV PATH="/opt/venv/bin:$PATH"

# Switch to the non-root 'node' user
USER node

# Expose the application port
EXPOSE 8080

# The command to run the application
CMD ["npm", "start"]