@echo off
echo ===== Criando configuração mínima do Next.js =====
echo.

:: Criar arquivo de configuração mínima
echo Criando arquivo de configuração mínima...
echo /** @type {import('next').NextConfig} */ > next.config.js.min
echo. >> next.config.js.min
echo const nextConfig = {}; >> next.config.js.min
echo. >> next.config.js.min
echo module.exports = nextConfig; >> next.config.js.min

:: Fazer backup da configuração atual
echo Fazendo backup da configuração atual...
copy next.config.js next.config.js.backup

:: Substituir pelo arquivo mínimo
echo Substituindo arquivo de configuração...
copy next.config.js.min next.config.js
del next.config.js.min

echo.
echo ===== Configuração mínima criada =====
echo Para atualizar o GitHub com esta configuração, execute: git-push.bat
echo Para iniciar o servidor, execute: npm run dev -- --turbo=false
echo.

pause 