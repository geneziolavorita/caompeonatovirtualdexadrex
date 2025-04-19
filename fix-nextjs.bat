@echo off
echo ===== Corrigindo problemas do Next.js =====
echo.

:: Parar qualquer processo do Next.js em execução
taskkill /f /im node.exe 2>nul

:: Remover pastas de cache
echo Removendo cache do Next.js...
rmdir /s /q .next 2>nul

:: Limpar cache do Next.js
echo Limpando cache do npm...
npm cache clean --force
npm cache verify

:: Reinstalar apenas a dependência next
echo Reinstalando o Next.js...
npm remove next
npm install next@latest

echo.
echo ===== Correção concluída =====
echo Para iniciar o servidor, execute: npm run dev -- --turbo=false
echo.

pause 