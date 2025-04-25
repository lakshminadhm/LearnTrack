@echo off
setlocal enabledelayedexpansion

REM Create directory for certificates if it doesn't exist
if not exist certs mkdir certs

echo ===== SSL Certificate Setup for Both Local Testing and Azure Deployment =====
echo.
echo Choose an option for SSL certificates:
echo 1^) Generate self-signed certificate ^(for testing only - browsers will show warnings^)
echo 2^) Use domain with Let's Encrypt certificate ^(trusted, requires domain name^)
echo 3^) Import existing certificate files ^(if you already have trusted certificates^)
echo.
set /p CERT_CHOICE="Enter your choice (1, 2, or 3): "

if "%CERT_CHOICE%"=="1" (
    REM Check if OpenSSL is available
    where openssl >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo OpenSSL not found. Please install OpenSSL to continue.
        echo You can download it from https://slproweb.com/products/Win32OpenSSL.html
        exit /b 1
    )

    REM Generate self-signed certificate
    echo Generating self-signed certificate...
    
    REM Ask for domain or IP
    set /p DOMAIN_OR_IP="Enter your domain or VM IP address: "
    
    REM Generate private key and certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 ^
        -keyout certs\key.pem ^
        -out certs\cert.pem ^
        -subj "/CN=%DOMAIN_OR_IP%" ^
        -addext "subjectAltName=DNS:%DOMAIN_OR_IP%,IP:%DOMAIN_OR_IP%"
    
    echo Self-signed certificate generated successfully.
    echo Note: Browsers will show a warning with self-signed certificates.
    
) else if "%CERT_CHOICE%"=="2" (
    echo.
    echo For Let's Encrypt certificates, you need to:
    echo 1. Have a domain name pointing to your Azure VM IP
    echo 2. Connect to your Azure VM and run commands there
    echo.
    echo Run these commands on your Azure VM:
    echo sudo apt-get update
    echo sudo apt-get install -y certbot
    echo sudo certbot certonly --standalone -d yourdomain.com
    echo.
    echo Then copy the certificate files to your development machine:
    echo scp user@vm-ip:/etc/letsencrypt/live/yourdomain.com/fullchain.pem ./certs/cert.pem
    echo scp user@vm-ip:/etc/letsencrypt/live/yourdomain.com/privkey.pem ./certs/key.pem
    echo.
    set /p CONTINUE="Do you have these files now? (Y/N): "
    
    if /i "!CONTINUE!"=="Y" (
        goto :import_cert
    ) else (
        echo Please obtain the certificate files and run this script again.
        exit /b 0
    )
) else if "%CERT_CHOICE%"=="3" (
    :import_cert
    REM Import existing certificate
    set /p CERT_PATH="Enter the path to your certificate file (fullchain.pem): "
    set /p KEY_PATH="Enter the path to your private key file (privkey.pem): "
    
    copy "%CERT_PATH%" certs\cert.pem
    copy "%KEY_PATH%" certs\key.pem
    
    echo Certificate files copied to certs directory.
) else (
    echo Invalid choice. Exiting.
    exit /b 1
)

echo.
echo ===== Certificate Setup Complete =====
echo.
echo Your certificates are in the 'certs' folder and will be used for:
echo 1. Local testing with HTTPS
echo 2. Deployment to Azure VM
echo.
echo Remember to:
echo - Include the certs folder when deploying to Azure VM
echo - Ensure ports 80 and 443 are open in your Azure VM's Network Security Group
echo.
pause