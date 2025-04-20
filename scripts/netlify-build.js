// Script para preparar o ambiente para build no Netlify
const fs = require('fs');
const path = require('path');

console.log('Preparando ambiente para build no Netlify...');

// Criar arquivo .env.local se não existir
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  const envContent = `
MONGODB_URI=${process.env.MONGODB_URI || ''}
NEXT_PUBLIC_API_URL=${process.env.NEXT_PUBLIC_API_URL || ''}
`;
  fs.writeFileSync(envPath, envContent.trim());
  console.log('Arquivo .env.local criado.');
} else {
  console.log('Arquivo .env.local já existe.');
}

// Garantir que a pasta out exista
const outDir = path.join(process.cwd(), 'out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
  console.log('Diretório de saída criado: ' + outDir);
}

// Garantir que a pasta public exista
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('Diretório public criado: ' + publicDir);
}

// Criar arquivo fallback.html na pasta public se não existir
const fallbackPath = path.join(publicDir, 'fallback.html');
if (!fs.existsSync(fallbackPath)) {
  const fallbackContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>XADREX - Carregando...</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
      color: #333;
    }
    .loader {
      border: 8px solid #f3f3f3;
      border-top: 8px solid #3498db;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    .container {
      text-align: center;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="loader"></div>
    <h1>XADREX</h1>
    <p>Carregando o aplicativo...</p>
  </div>
  <script>
    // Redirecionar para a página inicial após o carregamento
    window.location.href = '/';
  </script>
</body>
</html>
`;
  fs.writeFileSync(fallbackPath, fallbackContent.trim());
  console.log('Arquivo fallback.html criado em: ' + fallbackPath);
}

// Criar arquivo index.html na pasta public se não existir
const indexPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  fs.copyFileSync(fallbackPath, indexPath);
  console.log('Arquivo index.html criado em: ' + indexPath);
}

// Criar arquivo leaderboard.html na pasta public se não existir
const leaderboardPath = path.join(publicDir, 'leaderboard.html');
if (!fs.existsSync(leaderboardPath)) {
  fs.copyFileSync(fallbackPath, leaderboardPath);
  console.log('Arquivo leaderboard.html criado em: ' + leaderboardPath);
}

// Copiar fallback.html para out/index.html para garantir que sempre exista um fallback
const outputIndexPath = path.join(outDir, 'index.html');
if (fs.existsSync(fallbackPath)) {
  fs.copyFileSync(fallbackPath, outputIndexPath);
  console.log('Arquivo fallback.html copiado para: ' + outputIndexPath);
}

// Criar arquivo _redirects para garantir que o SPA funcione corretamente
const redirectsPath = path.join(outDir, '_redirects');
fs.writeFileSync(redirectsPath, `
/leaderboard /leaderboard.html 200
/* /index.html 200
`);
console.log('Arquivo _redirects criado em: ' + redirectsPath);

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

console.log('Preparação para build no Netlify concluída com sucesso!'); 