@echo off
echo ===== Iniciando Next.js sem o Turbopack =====
echo.

:: Verificar se há processos do Node.js em execução e finalizá-los
echo Verificando processos do Node.js...
taskkill /f /im node.exe 2>nul

:: Limpar a tela
cls

:: Iniciar o Next.js com turbo desativado
echo Iniciando o servidor Next.js sem Turbopack...
echo Para encerrar o servidor, pressione Ctrl+C
echo.

npm run dev -- --turbo=false 