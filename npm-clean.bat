@echo off
echo ===== Limpando cache e reinstalando dependencias =====
echo.

:: Parar qualquer processo do Next.js em execução
taskkill /f /im node.exe

:: Remover pastas de cache
echo Removendo pastas de cache...
rmdir /s /q .next
rmdir /s /q node_modules
del /q package-lock.json

:: Limpar cache do npm
echo Limpando cache do npm...
npm cache clean --force

:: Reinstalar dependências
echo Reinstalando dependências...
npm install

echo.
echo ===== Limpeza concluída =====
echo Para iniciar o servidor, execute: npm run dev
echo.

pause 