@echo off
setlocal enabledelayedexpansion

echo ===== Azure Network Security Group Port Checker =====
echo This script helps verify if ports 80 and 443 are accessible on your Azure VM.

set /p AZURE_VM_IP="Enter your Azure VM's IP address: "

echo.
echo Testing HTTP (port 80) accessibility...
powershell -Command "Test-NetConnection -ComputerName %AZURE_VM_IP% -Port 80 | Format-List"

echo.
echo Testing HTTPS (port 443) accessibility...
powershell -Command "Test-NetConnection -ComputerName %AZURE_VM_IP% -Port 443 | Format-List"

echo.
echo If both port tests show "TcpTestSucceeded : True", your ports are open.
echo If not, you need to:
echo 1. Open the Azure Portal
echo 2. Navigate to your VM's Network Security Group
echo 3. Add inbound security rules for ports 80 and 443
echo.
echo Remember: Port 80 must be open for Let's Encrypt certificate validation!
echo.
pause