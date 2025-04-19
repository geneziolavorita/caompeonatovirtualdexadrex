@echo off
echo ===================================
echo XADREX - Inicialização da Aplicação
echo ===================================

REM Verificar se o MongoDB está configurado
echo Verificando a configuração do MongoDB...
node scripts/check-mongodb-config.js
if %ERRORLEVEL% NEQ 0 (
  echo [AVISO] Configuração do MongoDB parece incompleta.
  echo         Criando arquivo .env.local padrão...
  
  echo # Configuração do MongoDB > .env.local
  echo MONGODB_URI=mongodb://localhost:27017/xadrex >> .env.local
  echo MONGODB_URI_FALLBACK=mongodb://localhost:27017/xadrex >> .env.local
  echo NODE_ENV=development >> .env.local
  echo NEXT_PUBLIC_APP_URL=http://localhost:3000 >> .env.local
  echo. >> .env.local
  echo # Configurações de timeout do MongoDB (em milissegundos) >> .env.local
  echo MONGODB_CONNECT_TIMEOUT=30000 >> .env.local
  echo MONGODB_SOCKET_TIMEOUT=75000 >> .env.local
  
  echo [INFO] Arquivo .env.local criado com configuração padrão.
  echo        Se você precisar de uma configuração diferente, edite este arquivo.
  echo.
)

REM Verificar dependências
echo Verificando se todas as dependências estão instaladas...
call check-dependencies.bat

REM Limpar o cache do Next.js
echo Limpando o cache do Next.js...
if exist .next\cache rmdir /s /q .next\cache
mkdir .next\cache

REM Iniciar o servidor de desenvolvimento
echo.
echo Iniciando servidor de desenvolvimento com opções otimizadas...
echo.
npm run dev -- --turbo=false

echo.
echo Pressione qualquer tecla para sair.
pause > nul 