#!/bin/bash

# Script to renew SSL certificates and restart containers

# Stopping containers to free up port 80
echo "Stopping containers to free up port 80..."
docker-compose down

# Renew certificates
echo "Renewing SSL certificates..."
certbot renew

# Check if renewal was successful
if [ $? -eq 0 ]; then
    echo "Certificate renewal attempt completed."
    
    # Get domain name
    DOMAIN=$(ls /etc/letsencrypt/live | grep -v README)
    
    # Copy new certificates to the local certs directory
    echo "Copying new certificates to local directory..."
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem certs/cert.pem
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem certs/key.pem
    
    # Set proper permissions
    chmod 644 certs/cert.pem
    chmod 644 certs/key.pem
fi

# Restart containers
echo "Restarting containers..."
docker-compose up -d

echo "Certificate renewal process completed."