/**
 * Script para verificar a instalação do MongoDB e fornecer instruções de instalação
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Verificar se o MongoDB está instalado
async function checkMongoDBInstalled() {
  return new Promise((resolve) => {
    exec('mongod --version', (error) => {
      if (error) {
        console.log('❌ MongoDB não parece estar instalado ou não está no PATH');
        resolve(false);
      } else {
        console.log('✅ MongoDB está instalado');
        resolve(true);
      }
    });
  });
}

// Verificar se o MongoDB está rodando
async function checkMongoDBRunning() {
  return new Promise((resolve) => {
    // Tentativa de conexão local na porta padrão
    exec('curl -s http://localhost:27017', (error, stdout) => {
      if (error || !stdout) {
        console.log('❌ MongoDB não está rodando');
        resolve(false);
      } else {
        console.log('✅ MongoDB está rodando na porta 27017');
        resolve(true);
      }
    });
  });
}

// Verificar configurações do arquivo .env.local
function checkEnvConfig() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    
    if (!fs.existsSync(envPath)) {
      console.log('❌ Arquivo .env.local não encontrado');
      return false;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const mongoUriLine = envContent.split('\n').find(line => line.startsWith('MONGODB_URI='));
    
    if (!mongoUriLine) {
      console.log('❌ MONGODB_URI não encontrado no arquivo .env.local');
      return false;
    }
    
    console.log('✅ Arquivo .env.local contém configuração do MongoDB');
    console.log(`   ${mongoUriLine}`);
    return true;
  } catch (error) {
    console.error('Erro ao verificar .env.local:', error.message);
    return false;
  }
}

// Fornecer instruções de instalação
function provideInstallationInstructions() {
  console.log('\n=== INSTRUÇÕES PARA INSTALAÇÃO DO MONGODB ===');
  
  console.log('\n1. Windows:');
  console.log('   - Baixe o MongoDB Community Server: https://www.mongodb.com/try/download/community');
  console.log('   - Execute o instalador e siga as instruções');
  console.log('   - Certifique-se de marcar "Add MongoDB to PATH" durante a instalação');
  
  console.log('\n2. macOS (usando Homebrew):');
  console.log('   - Execute: brew tap mongodb/brew');
  console.log('   - Execute: brew install mongodb-community');
  console.log('   - Inicie o serviço: brew services start mongodb-community');
  
  console.log('\n3. Linux (Ubuntu):');
  console.log('   - Execute: sudo apt update');
  console.log('   - Execute: sudo apt install -y mongodb');
  console.log('   - Inicie o serviço: sudo systemctl start mongodb');
  
  console.log('\nAlternativa: MongoDB Atlas (Nuvem):');
  console.log('1. Crie uma conta em https://www.mongodb.com/cloud/atlas/register');
  console.log('2. Crie um cluster gratuito');
  console.log('3. Configure o Network Access para permitir conexões do seu IP');
  console.log('4. Crie um usuário em Database Access');
  console.log('5. Obtenha a string de conexão e atualize o arquivo .env.local:');
  console.log('   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/xadrex?retryWrites=true&w=majority');
}

// Função principal
async function main() {
  console.log('=== VERIFICAÇÃO DO MONGODB ===\n');
  
  const isInstalled = await checkMongoDBInstalled();
  let isRunning = false;
  
  if (isInstalled) {
    isRunning = await checkMongoDBRunning();
  }
  
  const envConfigured = checkEnvConfig();
  
  console.log('\n=== RESUMO ===');
  console.log(`MongoDB Instalado: ${isInstalled ? 'Sim' : 'Não'}`);
  console.log(`MongoDB Rodando: ${isRunning ? 'Sim' : 'Não'}`);
  console.log(`Configuração .env: ${envConfigured ? 'Ok' : 'Problema'}`);
  
  if (!isInstalled || !isRunning) {
    provideInstallationInstructions();
    
    rl.question('\nDeseja usar o MongoDB Atlas ao invés da instalação local? (s/n): ', (answer) => {
      if (answer.toLowerCase() === 's') {
        console.log('\nÓtimo! Siga as instruções para MongoDB Atlas acima.');
        console.log('Depois de configurar, atualize o arquivo .env.local com sua string de conexão.');
      } else {
        console.log('\nSiga as instruções de instalação local acima.');
        if (isInstalled && !isRunning) {
          console.log('\nPara iniciar o MongoDB:');
          console.log('Windows: Inicie via Serviços ou execute "mongod" no terminal');
          console.log('macOS: brew services start mongodb-community');
          console.log('Linux: sudo systemctl start mongodb');
        }
      }
      
      console.log('\nDepois de configurar o MongoDB, reinicie o servidor Next.js com:');
      console.log('npm run dev');
      
      rl.close();
    });
  } else {
    console.log('\n✅ MongoDB está configurado corretamente!');
    rl.close();
  }
}

main(); 