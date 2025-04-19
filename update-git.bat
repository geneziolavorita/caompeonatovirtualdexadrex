@echo off
echo ===== Atualizando o GitHub =====
echo.

:: Mostrar estado atual do git
git status

:: Obter data e hora para mensagem de commit automática
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set ano=%datetime:~0,4%
set mes=%datetime:~4,2%
set dia=%datetime:~6,2%
set hora=%datetime:~8,2%
set minuto=%datetime:~10,2%

:: Definir mensagem de commit padrão com timestamp
set mensagem_default=Correcao de problemas Next.js - %dia%/%mes%/%ano% %hora%:%minuto%

:: Adicionar alterações ao stage
git add .

:: Solicitar mensagem personalizada ou usar a padrão
set /p mensagem_personalizada="Mensagem do commit [%mensagem_default%]: "

:: Se a mensagem personalizada estiver vazia, usar a padrão
if "%mensagem_personalizada%"=="" (
    set mensagem=%mensagem_default%
) else (
    set mensagem=%mensagem_personalizada%
)

:: Realizar o commit
git commit -m "%mensagem%"

:: Enviar para o GitHub
git push

echo.
echo ===== GitHub atualizado com sucesso =====
echo.

pause 