@echo off
setlocal enabledelayedexpansion

echo ===== LearnTrack Deployment to Azure VM =====

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

REM Build containers
echo Building Docker containers...
docker-compose build

REM Tag images for deployment
echo Tagging images for deployment...
FOR /F "tokens=*" %%i IN ('docker-compose config --services') DO (
  FOR /F "tokens=*" %%j IN ('docker images redesignedlearntrack-%%i:latest --format "{{.Repository}}"') DO (
    echo Found image: %%j
    docker tag %%j:latest learntrack-%%i:deploy
    echo Tagged as learntrack-%%i:deploy
  )
)

REM Save images to files
echo Saving images to files...
if not exist deploy mkdir deploy
FOR /F "tokens=*" %%i IN ('docker-compose config --services') DO (
  if "%%i" neq "db" (
    echo Saving learntrack-%%i:deploy...
    docker save -o deploy\learntrack-%%i.tar learntrack-%%i:deploy
  )
)

REM Create a special docker-compose for Azure deployment
echo Creating deployment docker-compose.yml...
(
echo version: '3.8'
echo services:
echo   backend:
echo     image: learntrack-backend:deploy
echo     ports:
echo       - "3000:3000"
echo     environment:
echo       - NODE_ENV=production
echo       - PORT=3000
echo       - DATABASE_URL=postgres://learntrack:learntrack@db:5432/learntrack
echo     depends_on:
echo       - db
echo     networks:
echo       - learntrack-network
echo     restart: unless-stopped
echo.
echo   frontend:
echo     image: learntrack-frontend:deploy
echo     ports:
echo       - "80:80"
echo       - "443:443"
echo     environment:
echo       - BACKEND_URL=http://backend:3000
echo     volumes:
echo       - ./certs:/etc/nginx/ssl
echo     depends_on:
echo       - backend
echo     networks:
echo       - learntrack-network
echo     restart: unless-stopped
echo.
echo   db:
echo     image: postgres:15-alpine
echo     restart: always
echo     environment:
echo       POSTGRES_USER: learntrack
echo       POSTGRES_PASSWORD: learntrack
echo       POSTGRES_DB: learntrack
echo     ports:
echo       - "5432:5432"
echo     volumes:
echo       - pgdata:/var/lib/postgresql/data
echo     networks:
echo       - learntrack-network
echo.
echo networks:
echo   learntrack-network:
echo     driver: bridge
echo.
echo volumes:
echo   pgdata:
) > deploy\docker-compose.yml

REM Create a deployment package
echo Creating deployment package...
if exist deploy\azure-deploy.zip del deploy\azure-deploy.zip
powershell Compress-Archive -Path "deploy\docker-compose.yml","certs\*","deploy\*.tar" -DestinationPath "deploy\azure-deploy.zip" -Force

echo ===== Deployment files prepared =====
echo.
echo The following deployment package has been created:
echo - deploy\azure-deploy.zip
echo.
echo Transfer this package to your Azure VM and extract it, then run:
echo 1. mkdir -p certs
echo 2. mv cert.pem key.pem certs/
echo 3. docker load -i learntrack-backend.tar
echo 4. docker load -i learntrack-frontend.tar
echo 5. docker-compose up -d
echo.
echo These containers will use the SSL certificates for HTTPS.
echo Make sure ports 80 and 443 are open in your Azure VM's Network Security Group.
echo.
pause