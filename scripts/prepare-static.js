// Script para preparar o ambiente para exportação estática
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

console.log('Preparando ambiente para exportação estática...');

// Garantir que a pasta out exista
const outDir = path.join(process.cwd(), 'out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
  console.log('Diretório de saída criado: ' + outDir);
}

// Remover pastas de API para evitar erros de build estático
const apiDirs = [
  path.join(process.cwd(), '.next/server/app/api'),
  path.join(process.cwd(), '.next/server/pages/api'),
  path.join(process.cwd(), '.next-static/server/app/api'),
  path.join(process.cwd(), '.next-static/server/pages/api')
];

apiDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      rimraf.sync(dir);
      console.log(`Diretório de API removido para compatibilidade com build estático: ${dir}`);
    } catch (e) {
      console.log(`Não foi possível remover ${dir}: ${e.message}`);
    }
  }
});

// Copiar fallback.html para out/index.html se um fallback não existir
const fallbackPath = path.join(process.cwd(), 'public', 'fallback.html');
const publicIndexPath = path.join(process.cwd(), 'public', 'index.html');
const outputIndexPath = path.join(outDir, 'index.html');

// Verificar se já existe um index.html em out
if (!fs.existsSync(outputIndexPath)) {
  // Verificar se existe um fallback.html em public
  if (fs.existsSync(fallbackPath)) {
    fs.copyFileSync(fallbackPath, outputIndexPath);
    console.log('Arquivo de fallback copiado para: ' + outputIndexPath);
  } else if (fs.existsSync(publicIndexPath)) {
    fs.copyFileSync(publicIndexPath, outputIndexPath);
    console.log('Arquivo index.html de public copiado para: ' + outputIndexPath);
  } else {
    // Criar um fallback simples
    const fallbackContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Campeonato Virtual de Xadrez</title>
        <style>
          body { font-family: Arial; padding: 20px; text-align: center; }
          h1 { color: #333; }
          p { color: #666; margin: 20px 0; }
          a { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Campeonato Virtual de Xadrez</h1>
        <p>Carregando aplicação...</p>
        <a href="/">Ir para a página inicial</a>
        <script>setTimeout(() => { window.location.href = '/'; }, 3000);</script>
      </body>
      </html>
    `;
    fs.writeFileSync(outputIndexPath, fallbackContent);
    console.log('Arquivo de fallback básico criado em: ' + outputIndexPath);
  }
}

// Criar arquivo _redirects para garantir que o SPA funcione corretamente
const redirectsPath = path.join(outDir, '_redirects');
fs.writeFileSync(redirectsPath, '/* /index.html 200');
console.log('Arquivo _redirects criado em: ' + redirectsPath);

// Criar pasta para player/[id]
const playerDir = path.join(outDir, 'player');
if (!fs.existsSync(playerDir)) {
  fs.mkdirSync(playerDir, { recursive: true });
  console.log('Diretório para jogadores criado: ' + playerDir);
}

// Criar pasta para leaderboard
const leaderboardDir = path.join(outDir, 'leaderboard');
if (!fs.existsSync(leaderboardDir)) {
  fs.mkdirSync(leaderboardDir, { recursive: true });
  console.log('Diretório para classificação criado: ' + leaderboardDir);
  
  // Criar um index.html para leaderboard
  const leaderboardIndexPath = path.join(leaderboardDir, 'index.html');
  if (!fs.existsSync(leaderboardIndexPath)) {
    fs.copyFileSync(outputIndexPath, leaderboardIndexPath);
    console.log('Arquivo fallback para leaderboard criado');
  }
}

// Criar arquivos de fallback para jogadores mockados que não foram gerados no build
const mockPlayerIds = ['mock-player-1', 'mock-player-2', 'mock-player-3'];
mockPlayerIds.forEach(playerId => {
  const playerHtmlPath = path.join(playerDir, `${playerId}.html`);
  
  if (!fs.existsSync(playerHtmlPath)) {
    // Criar um HTML simples para o jogador mock
    const playerHtmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Perfil do Jogador | Campeonato Virtual de Xadrez</title>
        <link rel="stylesheet" href="/_next/static/css/app.css">
      </head>
      <body>
        <div class="container mx-auto p-4">
          <h1 class="text-2xl font-bold mb-4">Perfil do Jogador</h1>
          <p>Carregando dados do jogador ${playerId}...</p>
          <div class="mt-4">
            <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Voltar para a página inicial
            </a>
          </div>
        </div>
        <script>
          // Redirecionar para a página com o app carregado
          window.location.href = "/player/${playerId}";
        </script>
      </body>
      </html>
    `;
    
    fs.writeFileSync(playerHtmlPath, playerHtmlContent);
    console.log(`Arquivo fallback para jogador mock criado: ${playerHtmlPath}`);
  }
});

// Verificar se o next.config.js está configurado para exportação estática
const configPath = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(configPath)) {
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Verificar se output: 'export' está presente
  if (!configContent.includes("output: 'export'")) {
    console.log('AVISO: next.config.js não está configurado para exportação estática!');
  } else {
    console.log('Configuração de next.config.js verificada: exportação estática está habilitada.');
  }
} else {
  console.log('AVISO: Arquivo next.config.js não encontrado!');
}

console.log('Preparação concluída com sucesso!'); 