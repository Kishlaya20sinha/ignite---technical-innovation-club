@echo off
echo Starting Ignite App...

:: Start Frontend
start "Ignite Client" cmd /k "npm run dev"

:: Start Server
cd server
start "Ignite Server" cmd /k "npm run dev"

echo Both services started!
