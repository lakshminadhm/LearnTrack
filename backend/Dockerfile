FROM node:18-alpine

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm install --production=false

# Copy application code
COPY shared/ ./shared/
COPY backend/ ./backend/

# Build the application
RUN npm run build --workspace=shared
RUN npm run build --workspace=backend

# Remove development dependencies
RUN npm prune --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "backend/dist/index.js"]