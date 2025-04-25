#!/bin/bash

# Create directory for certificates if it doesn't exist
mkdir -p certs

# Check if OpenSSL is installed
if ! command -v openssl &> /dev/null; then
    echo "OpenSSL not found. Please install OpenSSL to continue."
    exit 1
fi

# Two options for certificates:
echo "Choose an option for SSL certificates:"
echo "1) Generate self-signed certificate (for testing)"
echo "2) Use Let's Encrypt for a trusted certificate (requires domain name)"
read -p "Enter your choice (1 or 2): " CERT_CHOICE

if [ "$CERT_CHOICE" == "1" ]; then
    # Generate self-signed certificate
    echo "Generating self-signed certificate..."
    
    # Ask for domain or IP
    read -p "Enter your domain or IP address: " DOMAIN_OR_IP
    
    # Generate private key and certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout certs/key.pem \
      -out certs/cert.pem \
      -subj "/CN=$DOMAIN_OR_IP" \
      -addext "subjectAltName=DNS:$DOMAIN_OR_IP,IP:$DOMAIN_OR_IP"
    
    # Set proper permissions
    chmod 644 certs/cert.pem
    chmod 644 certs/key.pem
    
    echo "Self-signed certificate generated successfully."
    echo "Note: Browsers will show a warning with self-signed certificates."
    
elif [ "$CERT_CHOICE" == "2" ]; then
    # Let's Encrypt certificate
    if ! command -v certbot &> /dev/null; then
        echo "Certbot not found. Installing Certbot..."
        sudo apt-get update
        sudo apt-get install -y certbot
    fi
    
    # Get domain name
    read -p "Enter your domain name (e.g., example.com): " DOMAIN
    
    # Prompt for email address
    read -p "Enter your email address for certificate notifications: " EMAIL
    
    # Make sure port 80 is free by stopping all services that might be using it
    echo "Stopping any containers that might be using port 80..."
    sudo systemctl stop apache2 2>/dev/null || true
    sudo systemctl stop nginx 2>/dev/null || true
    
    # Stop all Docker containers
    echo "Stopping all Docker containers..."
    docker stop $(docker ps -aq) 2>/dev/null || true
    
    # Ensure that no process is using port 80
    PORT_80_PID=$(sudo lsof -ti:80 2>/dev/null)
    if [ ! -z "$PORT_80_PID" ]; then
        echo "Killing processes using port 80..."
        sudo kill -9 $PORT_80_PID
    fi
    
    # Double check no process is using port 80
    PORT_80_PID=$(sudo lsof -ti:80 2>/dev/null)
    if [ ! -z "$PORT_80_PID" ]; then
        echo "ERROR: Port 80 is still in use. Please manually stop any service using port 80 and try again."
        exit 1
    fi
    
    echo "Port 80 is now free. Proceeding with certificate request..."
    
    # Obtain SSL certificate using Certbot in standalone mode
    echo "Obtaining SSL certificate for $DOMAIN..."
    sudo certbot certonly --standalone -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    # Check if certificate was obtained successfully
    if [ $? -eq 0 ]; then
        echo "Certificate obtained successfully!"
        
        # Copy certificates to the local certs directory
        echo "Copying certificates to local directory..."
        sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem certs/cert.pem
        sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem certs/key.pem
        
        # Set proper permissions
        sudo chmod 644 certs/cert.pem
        sudo chmod 644 certs/key.pem
        
        echo "Certificates copied to certs directory."
    else
        echo "Failed to obtain certificate. Please check your domain configuration and try again."
        echo "Make sure your domain points to this server's IP address and port 80 is accessible from the internet."
        exit 1
    fi
else
    echo "Invalid choice. Exiting."
    exit 1
fi

echo "Certificate setup complete. You can now start your containers."
echo "Run: docker-compose up -d"