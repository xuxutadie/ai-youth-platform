@echo off
echo Installing MongoDB using Chocolatey...
choco install mongodb -y
echo MongoDB installation completed.
echo Starting MongoDB service...
net start MongoDB
echo MongoDB service started.
pause