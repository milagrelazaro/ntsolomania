@echo off
echo ========================================
echo  Ntxuva - Build APK para Android
echo ========================================
echo.

cd /d c:\iProjects\NtxuvaGame

echo Passo 1: Verificando login no Expo...
eas whoami
if errorlevel 1 (
    echo.
    echo Nao esta logado. Fazendo login...
    eas login
)

echo.
echo Passo 2: Configurando projeto EAS...
eas build:configure

echo.
echo Passo 3: Iniciando build APK (preview)...
eas build --platform android --profile preview

echo.
echo ========================================
echo Build iniciado!
echo Acompanhe em: https://expo.dev/accounts/sixmc/projects/ntxuva-game/builds
echo ========================================
pause
