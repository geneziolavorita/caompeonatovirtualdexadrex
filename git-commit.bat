@echo off
echo ===== Realizando commit das alterações =====
echo.

:: Pegar a data e hora atual para mensagem do commit
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set ano=%datetime:~0,4%
set mes=%datetime:~4,2%
set dia=%datetime:~6,2%
set hora=%datetime:~8,2%
set minuto=%datetime:~10,2%

:: Mostrar status atual
git status

:: Adicionar todas as alterações
git add .

:: Perguntar se quer especificar uma mensagem personalizada
set /p mensagem_personalizada="Deseja especificar uma mensagem para o commit? (S/N): "
if /i "%mensagem_personalizada%"=="S" (
    set /p mensagem="Digite a mensagem do commit: "
) else (
    set mensagem=Atualização automática - %dia%/%mes%/%ano% %hora%:%minuto%
)

:: Realizar o commit com a mensagem
git commit -m "%mensagem%"

echo.
echo ===== Commit concluído =====
echo Para enviar as alterações para o GitHub, execute git-push.bat
echo.

pause 