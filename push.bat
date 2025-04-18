@echo off
echo Enviando alteracoes para o GitHub...
echo.

git add .
git commit -m "Atualizacao do projeto de xadrez: %date% %time%"
git push

echo.
echo Alteracoes enviadas com sucesso!
echo Pressione qualquer tecla para sair...
pause > nul 