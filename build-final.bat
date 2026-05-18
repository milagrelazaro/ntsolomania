@echo off
echo ========================================
echo  Ntxuva - Build Final APK
echo ========================================
echo.

cd /d c:\iProjects\NtxuvaGame

echo Limpando cache e builds anteriores...
rd /s /q .expo 2>nul
rd /s /q node_modules\.cache 2>nul

echo.
echo Iniciando build com configuracoes otimizadas...
eas build --platform android --profile preview --clear-cache --non-interactive

echo.
echo ========================================
echo Build iniciado!
echo Acompanhe em: https://expo.dev/accounts/sixmc/projects/ntxuva-game/builds
echo ========================================
echo.
echo Se falhar novamente, tente:
echo 1. Verificar logs detalhados no link acima
echo 2. Procurar por erros especificos do Gradle
echo 3. Verificar se todas as dependencias estao corretas
echo.
pause
