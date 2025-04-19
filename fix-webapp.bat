@echo off
echo ===== Reparando a aplicação Next.js =====
echo.

:: Matar processos Next.js existentes
echo Finalizando processos Node.js...
taskkill /f /im node.exe 2>nul

:: Limpar a pasta .next
echo Limpando cache de desenvolvimento...
rmdir /s /q .next 2>nul
rmdir /s /q node_modules\.cache 2>nul

:: Verificar problemas de TypeScript
echo Verificando problemas de TypeScript...
npx tsc --noEmit

:: Corrigir problemas comuns
echo Gerando arquivo de declaração local...
echo // Arquivo de definição local para resolver problemas de tipagem > global.d.ts
echo declare module '*.svg' { >> global.d.ts
echo   const content: React.FC^<React.SVGAttributes^<SVGElement^>^>; >> global.d.ts
echo   export default content; >> global.d.ts
echo } >> global.d.ts
echo. >> global.d.ts
echo // Correção para tipagem do uuid >> global.d.ts
echo declare module 'uuid' { >> global.d.ts
echo   export function v4(): string; >> global.d.ts
echo } >> global.d.ts

:: Reiniciar e iniciar em modo de segurança
echo.
echo ===== Reparação concluída =====
echo.
echo Para iniciar o servidor em modo seguro, use o comando:
echo npm run dev -- --turbo=false
echo.

pause 