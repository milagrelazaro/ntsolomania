@echo off
echo ========================================
echo  Ntxuva - Build APK v2 (Simplificado)
echo ========================================
echo.

cd /d c:\iProjects\NtxuvaGame

echo Limpando cache...
rd /s /q .expo 2>nul
rd /s /q node_modules\.cache 2>nul

echo.
echo Configuracoes aplicadas:
echo - Android SDK 34
echo - Min SDK 23
echo - Build simplificado (sem customizacoes)
echo.

echo Iniciando build...
eas build --platform android --profile preview --clear-cache

echo.
echo ========================================
echo Build iniciado!
echo.
echo Se falhar novamente:
echo 1. Acesse: https://expo.dev/accounts/sixmc/projects/ntxuva-game/builds
echo 2. Clique no build que falhou
echo 3. Expanda "Run gradlew"
echo 4. Procure por linhas com "ERROR" ou "FAILURE"
echo 5. Copie a mensagem de erro completa
echo.
pause
