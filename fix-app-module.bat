@echo off
echo ===== Corrigindo erro de modulo no Next.js =====
echo.

:: Parar processos do Node.js
echo Finalizando processos do Node.js...
taskkill /f /im node.exe 2>nul

:: Remover pasta .next que contém os arquivos compilados
echo Removendo arquivos de cache...
rmdir /s /q .next 2>nul

:: Verificar versão do Next.js
echo Verificando versão do Next.js...
call npm list next

:: Ajustar configuração temporária
echo Criando configuração temporária...
echo /** @type {import('next').NextConfig} */ > next.config.temp.js
echo const nextConfig = { >> next.config.temp.js
echo   reactStrictMode: true >> next.config.temp.js
echo }; >> next.config.temp.js
echo module.exports = nextConfig; >> next.config.temp.js

:: Fazer backup da configuração atual
echo Fazendo backup da configuração atual...
copy next.config.js next.config.backup.js

:: Substituir pela configuração mínima
echo Substituindo pela configuração mínima...
copy next.config.temp.js next.config.js
del next.config.temp.js

:: Iniciar o servidor com a configuração mínima
echo.
echo ===== Configuração temporária concluída =====
echo Para iniciar o servidor com configuração mínima, execute: npm run dev -- --turbo=false
echo Após verificar que o servidor inicia corretamente, execute: copy next.config.backup.js next.config.js
echo.

pause 