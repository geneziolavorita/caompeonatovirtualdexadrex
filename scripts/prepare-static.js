// Script para preparar o ambiente para exportação estática
const fs = require('fs');
const path = require('path');

console.log('Preparando ambiente para exportação estática...');

// Definir NODE_ENV para garantir que estamos em modo de produção
process.env.NODE_ENV = 'production';

// Função para remover diretório recursivamente (sem dependência externa)
function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  // Remover arquivos e subdiretórios
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Recursivamente remover subdiretórios
      removeDir(fullPath);
    } else {
      // Remover arquivos
      try {
        fs.unlinkSync(fullPath);
      } catch (e) {
        console.log(`Não foi possível remover o arquivo ${fullPath}: ${e.message}`);
      }
    }
  }
  
  // Remover o diretório vazio
  try {
    fs.rmdirSync(dir);
  } catch (e) {
    console.log(`Não foi possível remover o diretório ${dir}: ${e.message}`);
  }
}

// Garantir que a pasta out exista
const outDir = path.join(process.cwd(), 'out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
  console.log('Diretório de saída criado: ' + outDir);
}

// Criar arquivo _redirects para garantir que o SPA funcione corretamente
const redirectsPath = path.join(outDir, '_redirects');
fs.writeFileSync(redirectsPath, '/* /index.html 200');
console.log('Arquivo _redirects criado em: ' + redirectsPath);

// Criar um HTML de fallback simples para o index.html
const outputIndexPath = path.join(outDir, 'index.html');
if (!fs.existsSync(outputIndexPath)) {
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

// Copia o index.html para leaderboard/index.html
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