@echo off
echo ===================================
echo XADREX - Verificador de dependências
echo ===================================

echo Verificando dependências necessárias...
echo.

REM Verificar se o dotenv está instalado
echo Verificando dotenv...
npm list dotenv --depth=0 || (
  echo Instalando dotenv...
  npm install dotenv --save
)

REM Verificar se o uuid está instalado
echo Verificando uuid...
npm list uuid --depth=0 || (
  echo Instalando uuid...
  npm install uuid --save
)

REM Verificar se o react-hot-toast está instalado
echo Verificando react-hot-toast...
npm list react-hot-toast --depth=0 || (
  echo Instalando react-hot-toast...
  npm install react-hot-toast --save
)

REM Verificar se o mongoose está instalado
echo Verificando mongoose...
npm list mongoose --depth=0 || (
  echo Instalando mongoose...
  npm install mongoose --save
)

echo.
echo Todas as dependências foram verificadas.
echo Verificando a conexão com MongoDB...
node scripts/check-mongodb-config.js

echo.
echo Processo finalizado!
echo Pressione qualquer tecla para sair.
pause > nul 