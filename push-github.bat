@echo off
echo ===== Enviando para o GitHub =====

git add .
git commit -m "Atualização do projeto"
git push

echo.
echo ===== Envio concluído =====
pause 