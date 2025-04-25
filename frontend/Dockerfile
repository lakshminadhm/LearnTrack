# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Create directory for certificates
RUN mkdir -p /etc/nginx/ssl

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Expose both HTTP and HTTPS ports
EXPOSE 80 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
