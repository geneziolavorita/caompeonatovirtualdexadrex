@echo off
echo ===== Recuperando netlify.toml simplificado =====
echo.

:: Criar um arquivo netlify.toml mínimo
echo Criando arquivo netlify.toml mínimo...
echo # Configuração básica do Netlify > netlify.toml.simple
echo [build] >> netlify.toml.simple
echo   command = "npm run build" >> netlify.toml.simple
echo   publish = ".next" >> netlify.toml.simple
echo. >> netlify.toml.simple
echo [build.environment] >> netlify.toml.simple
echo   NODE_VERSION = "18.20.8" >> netlify.toml.simple
echo   MONGODB_URI = "mongodb://geneziodelavor:FbC38pTH2g9Kln6D@cluster0-shard-00-00.ozrtc.mongodb.net:27017,cluster0-shard-00-01.ozrtc.mongodb.net:27017,cluster0-shard-00-02.ozrtc.mongodb.net:27017/?replicaSet=atlas-ez3inn-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0" >> netlify.toml.simple
echo   MONGODB_CONNECT_TIMEOUT = "30000" >> netlify.toml.simple
echo   MONGODB_SOCKET_TIMEOUT = "75000" >> netlify.toml.simple
echo. >> netlify.toml.simple
echo [[plugins]] >> netlify.toml.simple
echo   package = "@netlify/plugin-nextjs" >> netlify.toml.simple

:: Fazer backup do atual
echo Fazendo backup do arquivo atual...
copy netlify.toml netlify.toml.backup

:: Substituir o arquivo atual
echo Substituindo arquivo...
copy netlify.toml.simple netlify.toml
del netlify.toml.simple

echo.
echo ===== Recuperação concluída =====
echo Para atualizar o GitHub com esta versão simplificada, execute: git-push.bat
echo.

pause 