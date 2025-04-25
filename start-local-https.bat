@echo off
setlocal enabledelayedexpansion

echo ===== LearnTrack Local HTTPS Testing =====

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Docker is not running. Please start Docker Desktop.
    exit /b 1
)

REM Setup SSL certificates if not already done
if not exist certs\cert.pem (
    echo SSL certificates not found. Setting up SSL certificates first...
    call setup-ssl.bat
    
    REM Check if certificates were created successfully
    if not exist certs\cert.pem (
        echo SSL certificate setup failed. Exiting...
        exit /b 1
    )
)

REM Stop any running containers first
echo Stopping any running containers...
docker-compose down

REM Build and start containers for local testing with HTTPS
echo Building and starting containers with HTTPS support...
docker-compose up --build -d

echo ===== Local HTTPS environment started =====
echo.
echo Your application is now running locally with HTTPS!
echo.
echo Access your application at: https://localhost:443
echo.
echo Notes:
echo - If using self-signed certificates, browsers will show a security warning
echo - You can proceed past this warning for testing purposes
echo - The same certificates will be used when deploying to Azure VM
echo.
echo To view logs:
echo docker-compose logs -f
echo.
pause