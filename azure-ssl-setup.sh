#!/bin/bash
# Script for obtaining Let's Encrypt certificates on Azure VM
# This script aggressively ensures port 80 is free for certificate validation

# Create directory for certificates if it doesn't exist
mkdir -p certs

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "This script needs to be run as root or with sudo."
    exit 1
fi

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Certbot not found. Installing Certbot..."
    apt-get update
    apt-get install -y certbot
fi

# Get domain name
read -p "Enter your domain name (e.g., learntrack.eastus2.cloudapp.azure.com): " DOMAIN

# Prompt for email address
read -p "Enter your email address for certificate notifications: " EMAIL

echo "==============================================="
echo "Preparing environment for certificate issuance"
echo "==============================================="

# Stop all web servers
echo "Stopping web servers..."
systemctl stop apache2 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true

# Stop all Docker containers
echo "Stopping all Docker containers..."
docker-compose down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true

# Find and kill any process using port 80
echo "Checking for processes using port 80..."
PORT_80_PID=$(lsof -ti:80 2>/dev/null)
if [ ! -z "$PORT_80_PID" ]; then
    echo "Found processes using port 80, terminating them..."
    kill -9 $PORT_80_PID
fi

# Double check no process is using port 80
sleep 2
PORT_80_PID=$(lsof -ti:80 2>/dev/null)
if [ ! -z "$PORT_80_PID" ]; then
    echo "ERROR: Could not free port 80. Please manually stop the following processes and try again:"
    lsof -i:80
    exit 1
fi

# Test if port 80 is truly free
echo "Testing if port 80 is free..."
if ! nc -z localhost 80 >/dev/null 2>&1; then
    echo "Port 80 is free. Proceeding with certificate request..."
else
    echo "ERROR: Port 80 is still being used by something not detected with lsof."
    echo "Please ensure port 80 is completely free before continuing."
    exit 1
fi

# Check if the domain is properly resolving to this server
echo "Checking DNS resolution for $DOMAIN..."
DOMAIN_IP=$(dig +short $DOMAIN)
MY_IP=$(curl -s http://checkip.amazonaws.com/)

echo "Your domain ($DOMAIN) resolves to: $DOMAIN_IP"
echo "This server's public IP is: $MY_IP"

if [ "$DOMAIN_IP" != "$MY_IP" ]; then
    echo "WARNING: Your domain does not appear to resolve to this server's IP!"
    echo "This may cause the certificate validation to fail."
    read -p "Continue anyway? (y/n): " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
        echo "Exiting. Please update your DNS settings and try again."
        exit 1
    fi
fi

# Open port 80 in Azure Network Security Group if needed
echo "Ensuring port 80 is open in Azure NSG..."
echo "Note: If you haven't installed the Azure CLI, you should manually verify port 80 is open"
echo "in your Network Security Group on the Azure Portal."

if command -v az &> /dev/null; then
    echo "Azure CLI is installed, but we'll let you verify the NSG rules manually."
    echo "Please confirm port 80 is open in your Azure Network Security Group."
    read -p "Is port 80 open in your Azure NSG? (y/n): " PORT_OPEN
    if [[ ! "$PORT_OPEN" =~ ^[Yy]$ ]]; then
        echo "Please open port 80 in your Azure NSG and then continue."
        read -p "Press Enter once you've opened port 80..." DUMMY
    fi
else
    echo "Azure CLI not installed. Please manually verify port 80 is open in your NSG."
    read -p "Is port 80 open in your Azure NSG? (y/n): " PORT_OPEN
    if [[ ! "$PORT_OPEN" =~ ^[Yy]$ ]]; then
        echo "Please open port 80 in your Azure NSG and then continue."
        read -p "Press Enter once you've opened port 80..." DUMMY
    fi
fi

echo "==============================================="
echo "Starting certificate issuance process"
echo "==============================================="

# Obtain SSL certificate using Certbot in standalone mode
echo "Obtaining SSL certificate for $DOMAIN..."
certbot certonly --standalone -d $DOMAIN --email $EMAIL --agree-tos --non-interactive

# Check if certificate was obtained successfully
if [ $? -eq 0 ]; then
    echo "Certificate obtained successfully!"
    
    # Copy certificates to the local certs directory
    echo "Copying certificates to local directory..."
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem certs/cert.pem
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem certs/key.pem
    
    # Set proper permissions
    chmod 644 certs/cert.pem
    chmod 644 certs/key.pem
    
    echo "Certificates copied to certs directory."
    
    # Setup auto-renewal cron job if it doesn't exist
    if ! crontab -l | grep -q 'certbot renew'; then
        echo "Setting up certificate auto-renewal..."
        (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $(pwd)/certs/cert.pem && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $(pwd)/certs/key.pem") | crontab -
        echo "Auto-renewal configured."
    fi
    
    echo "==============================================="
    echo "Certificate setup complete!"
    echo "==============================================="
    echo "You can now start your containers with: docker-compose up -d"
else
    echo "Failed to obtain certificate. Please check the error message above."
    echo "Common issues:"
    echo "1. Port 80 is still in use or blocked"
    echo "2. Your domain does not resolve to this server's IP address"
    echo "3. Network connectivity issues"
    echo "4. Azure NSG not allowing inbound traffic on port 80"
    exit 1
fi