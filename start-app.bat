@echo off
echo ========================================
echo    STARTING E-COMMERCE APPLICATION
echo ========================================
echo.
echo This will start both server and client
echo Server: http://localhost:5000
echo Client: http://localhost:3000
echo.
echo Admin Login:
echo Email: admin@example.com
echo Password: admin123
echo.
echo Product Creation: /admin/products/create
echo.
pause
echo.
echo Starting server and client...
echo.
cd server
start "E-Commerce Server" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul
cd ../client
start "E-Commerce Client" cmd /k "npm start"
echo.
echo ✅ Application started!
echo.
echo Server running on: http://localhost:5000
echo Client running on: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul