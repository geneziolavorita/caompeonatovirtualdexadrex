@echo off
echo ===== Limpeza completa do Next.js =====
echo.

:: Verificar e finalizar processos do Node.js
echo Finalizando processos do Node.js...
taskkill /f /im node.exe 2>nul

:: Remover diretórios de cache
echo Removendo diretórios de cache...
rmdir /s /q .next 2>nul
rmdir /s /q node_modules 2>nul
del /q package-lock.json 2>nul

:: Limpar cache do npm
echo Limpando cache do npm...
npm cache clean --force

:: Limpar arquivos temporários de build
echo Limpando arquivos temporários...
del /s /q *.lock 2>nul
del /s /q .eslintcache 2>nul

:: Reinstalar dependências
echo Reinstalando dependências...
npm install

:: Verificar instalação do Next.js
echo Verificando instalação do Next.js...
npm list next

echo.
echo ===== Limpeza concluída =====
echo Para iniciar o servidor, execute: npm run dev -- --turbo=false
echo.

pause 