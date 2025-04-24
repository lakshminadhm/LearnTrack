FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY shared/ ./shared/
COPY backend/ ./backend/

# Build the application
RUN cd shared && npm run build
RUN cd backend && npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

ENV SUPABASE_URL=https://xvrvttmfxxatwvnugumy.supabase.co
ENV SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cnZ0dG1meHhhdHd2bnVndW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjgxNTcsImV4cCI6MjA2MDc0NDE1N30.UkPiGQyLz7La8_E0N0p78gSb_2htxli_-OG5inWRWsI

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "/app/backend/dist/backend/src/index.js"]