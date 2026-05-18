@echo off
echo ========================================
echo  Ntxuva - Build APK v3 (CORRIGIDO)
echo ========================================
echo.

cd /d c:\iProjects\NtxuvaGame

echo Limpando cache...
rd /s /q .expo 2>nul
rd /s /q node_modules\.cache 2>nul

echo.
echo Correcoes aplicadas:
echo - Adicionado colors.xml com splashscreen_background
echo - Configurado splash screen no app.json
echo - Android SDK 34 configurado
echo.

echo Iniciando build...
eas build --platform android --profile preview --clear-cache

echo.
echo ========================================
echo Build iniciado!
echo Acompanhe em: https://expo.dev/accounts/sixmc/projects/ntxuva-game/builds
echo ========================================
pause
