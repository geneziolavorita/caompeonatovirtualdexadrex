@echo off
echo ===================================
echo XADREX - Script de Atualização GitHub
echo ===================================

echo Verificando a conexão com MongoDB...
node scripts/check-mongodb-config.js
if %ERRORLEVEL% NEQ 0 (
  echo [AVISO] Verifique a configuração do MongoDB antes de continuar!
  pause
)

echo.
echo Adicionando todas as alterações...
git add .

echo.
echo Criando commit...
set /p MENSAGEM="Digite uma mensagem para o commit: "
git commit -m "%MENSAGEM%"

echo.
echo Enviando para o GitHub...
git push origin

echo.
echo Processo finalizado!
echo Pressione qualquer tecla para sair.
pause > nul 