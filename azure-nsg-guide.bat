@echo off
setlocal enabledelayedexpansion

echo ===== Azure Security Group Configuration Guide =====
echo.
echo The Let's Encrypt validation is failing because port 80 is blocked on your Azure VM.
echo Follow these steps to open port 80 in your Azure Network Security Group:
echo.
echo 1. Log in to the Azure Portal (https://portal.azure.com)
echo 2. Navigate to your Virtual Machine
echo 3. Click on "Networking" in the left sidebar
echo 4. Look for "Inbound port rules" section
echo 5. Click "Add inbound port rule"
echo 6. Fill in these details:
echo    - Source: Any
echo    - Source port ranges: *
echo    - Destination: Any
echo    - Destination port ranges: 80
echo    - Protocol: TCP
echo    - Action: Allow
echo    - Priority: 1000 (or any available number)
echo    - Name: Allow-HTTP
echo 7. Click "Add" to save the rule
echo.
echo After adding the rule, run the port checker to verify port 80 is accessible:
echo.
echo   check-azure-ports.bat
echo.
echo Once port 80 is confirmed open, try the certificate setup again:
echo.
echo   sudo bash azure-ssl-setup.sh
echo.
pause