const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente do arquivo .env.local se existir
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('Carregando variáveis de ambiente de:', envPath);
  dotenv.config({ path: envPath });
} else {
  console.log('Arquivo .env.local não encontrado. Usando variáveis de ambiente padrão.');
  // Carregar .env se existir como fallback
  dotenv.config();
}

// Verificar as variáveis de ambiente relacionadas ao MongoDB
console.log('\n=== Verificação de Configuração do MongoDB ===\n');

// Verificar MONGODB_URI
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('❌ MONGODB_URI não está definida no ambiente');
  console.log('   Sugestão: Crie um arquivo .env.local com a variável MONGODB_URI');
} else {
  console.log('✅ MONGODB_URI está configurada');
  
  // Sanitizar URI para não mostrar senha
  const sanitizedUri = mongoURI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:****@');
  console.log(`   URI: ${sanitizedUri}`);
  
  // Verificar se é uma URI válida
  if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
    console.warn('⚠️ Formato de MONGODB_URI parece incorreto. Deve começar com mongodb:// ou mongodb+srv://');
  }
}

// Verificar MongoDB localmente
console.log('\n=== Verificação do MongoDB Local ===\n');

try {
  console.log('Verificando instalação do MongoDB...');
  const mongodOutput = execSync('mongod --version').toString();
  console.log('✅ MongoDB está instalado');
  console.log(`   ${mongodOutput.split('\n')[0]}`);
  
  // Tentar verificar se o serviço está rodando
  try {
    console.log('Verificando se o MongoDB está rodando...');
    // Esta chamada pode falhar se o MongoDB não estiver rodando
    const mongoStatus = execSync('curl -s http://localhost:27017').toString();
    if (mongoStatus.includes('looks like you are trying to access MongoDB')) {
      console.log('✅ MongoDB está rodando localmente na porta 27017');
    } else {
      console.log('✅ MongoDB está respondendo na porta 27017');
    }
  } catch (e) {
    console.error('❌ MongoDB não parece estar rodando localmente');
    console.log('   Sugestão: Inicie o serviço do MongoDB');
    if (process.platform === 'win32') {
      console.log('   Windows: net start MongoDB ou inicie via Serviços');
    } else if (process.platform === 'darwin') {
      console.log('   macOS: brew services start mongodb-community');
    } else {
      console.log('   Linux: sudo systemctl start mongod');
    }
  }
} catch (e) {
  console.error('❌ MongoDB não está instalado ou não está no PATH');
  console.log('   Sugestão: Instale o MongoDB ou configure um serviço MongoDB remoto');
}

// Verificar conexão usando o Node.js
console.log('\n=== Teste de Conexão com MongoDB ===\n');

// Executar o script de teste de conexão
console.log('Para testar a conexão com o MongoDB, execute:');
console.log('   node scripts/test-mongodb-connection.js');

// Instruções para GitHub
console.log('\n=== GitHub Actions ===\n');
const workflowPath = path.resolve(process.cwd(), '.github/workflows/main.yml');

if (fs.existsSync(workflowPath)) {
  console.log('✅ Arquivo de workflow do GitHub encontrado');
  
  // Ler o workflow para verificar se tem MONGODB_URI
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  if (workflowContent.includes('MONGODB_URI: ${{ secrets.MONGODB_URI }}')) {
    console.log('✅ MONGODB_URI está configurado no workflow GitHub Actions');
    console.log('   Certifique-se de adicionar o segredo MONGODB_URI nas configurações do repositório GitHub:');
    console.log('   1. Vá para Settings > Secrets and variables > Actions');
    console.log('   2. Adicione um novo repositório secret com o nome MONGODB_URI');
    console.log('   3. Valor deve ser sua string de conexão MongoDB completa');
  } else {
    console.warn('⚠️ MONGODB_URI não encontrado no workflow GitHub Actions');
  }
} else {
  console.warn('⚠️ Arquivo de workflow do GitHub não encontrado');
} 