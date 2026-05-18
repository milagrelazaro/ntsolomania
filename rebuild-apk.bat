@echo off
echo ========================================
echo  Ntxuva - Rebuild APK (Tentativa 2)
echo ========================================
echo.

cd /d c:\iProjects\NtxuvaGame

echo Iniciando build APK...
eas build --platform android --profile preview --clear-cache

echo.
echo ========================================
echo Build iniciado!
echo Acompanhe em: https://expo.dev/accounts/sixmc/projects/ntxuva-game/builds
echo ========================================
pause
