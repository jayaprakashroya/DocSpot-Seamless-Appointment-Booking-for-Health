@echo off
echo.
echo 🏥 MediConnect Backend Server Startup Script
echo ========================================
echo.

REM Check if in backend directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Are you in the backend directory?
    pause
    exit /b 1
)
echo ✅ Backend directory correct

echo.
echo 📦 Checking dependencies...
if not exist "node_modules" (
    echo 📥 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🔐 Checking .env file...
if not exist ".env" (
    echo ⚠️  .env file not found. Creating one...
    (
        echo PORT=5000
        echo MONGO_URI=mongodb://localhost:27017/mediconnect
        echo JWT_SECRET=change_this_secret
        echo FRONTEND_ORIGIN=http://localhost:3000
        echo NODE_ENV=development
    ) > .env
    echo ✅ .env file created with default values
    echo ⚠️  Make sure to update MONGO_URI if needed
) else (
    echo ✅ .env file exists
)

echo.
echo 🚀 Starting MediConnect Backend Server...
echo ========================================
echo.
echo Server starting on http://localhost:5000
echo API endpoint: http://localhost:5000/api
echo Health check: http://localhost:5000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

timeout /t 2 /nobreak

REM Run the server
if exist "package.json" (
    for /f "tokens=*" %%i in ('findstr "\"dev\"" package.json') do (
        call npm run dev
        goto end
    )
    call npm start
    goto end
)

:end
pause
