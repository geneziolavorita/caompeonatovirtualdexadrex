// Script para testar a conexão com MongoDB
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
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

async function testConnection() {
  console.log('=== Teste de Conexão com MongoDB ===\n');
  
  // Obter a URI do MongoDB das variáveis de ambiente
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URI_FALLBACK || 'mongodb://localhost:27017/xadrex';
  
  if (!uri) {
    console.error('❌ MONGODB_URI não está definida no ambiente');
    process.exit(1);
  }
  
  // Sanitizar URI para não mostrar senha
  const sanitizedUri = uri.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:****@');
  console.log(`🔄 Tentando conectar a: ${sanitizedUri}`);
  
  try {
    // Configurações da conexão
    const options = {
      bufferCommands: false,
      maxIdleTimeMS: 60000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000
    };
    
    // Tentar conectar
    console.log('Conectando...');
    
    const connection = await mongoose.connect(uri, options);
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar bancos de dados disponíveis
    const admin = connection.connection.db.admin();
    const dbInfo = await admin.listDatabases();
    
    console.log('\n📊 Bancos de dados disponíveis:');
    dbInfo.databases.forEach(db => {
      console.log(`   - ${db.name} (${Math.round(db.sizeOnDisk / 1024 / 1024 * 100) / 100} MB)`);
    });
    
    // Verificar se o banco xadrex existe
    const xadrexDB = dbInfo.databases.find(db => db.name === 'xadrex');
    if (xadrexDB) {
      console.log('\n✅ Banco de dados "xadrex" encontrado!');
      
      // Verificar coleções no banco xadrex
      const collections = await connection.connection.db.listCollections().toArray();
      
      console.log('\n📋 Coleções no banco "xadrex":');
      if (collections.length === 0) {
        console.log('   Nenhuma coleção encontrada.');
      } else {
        collections.forEach(collection => {
          console.log(`   - ${collection.name}`);
        });
      }
      
      // Verificar se a coleção players existe
      const playersCollection = collections.find(c => c.name === 'players');
      if (playersCollection) {
        // Contar documentos na coleção players
        const count = await connection.connection.db.collection('players').countDocuments();
        console.log(`\n✅ Coleção "players" encontrada com ${count} documento(s)`);
      } else {
        console.log('\n❌ Coleção "players" não encontrada');
      }
    } else {
      console.log('\n❌ Banco de dados "xadrex" não encontrado');
      console.log('   O banco será criado automaticamente quando dados forem inseridos');
    }
    
    // Desconectar
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    console.log('\nSugestões para resolver o problema:');
    console.log('1. Verifique se o serviço MongoDB está rodando');
    console.log('2. Verifique se a URI está correta no arquivo .env.local');
    console.log('3. Verifique se as credenciais são válidas');
    console.log('4. Verifique se o seu IP está na lista de IPs permitidos (para MongoDB Atlas)');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\nErro específico: Conexão recusada');
      console.log('- O servidor MongoDB não está rodando ou a porta está bloqueada');
      console.log('- Inicie o serviço MongoDB local ou corrija a URI remota');
    }
    
    if (error.message.includes('authentication failed')) {
      console.log('\nErro específico: Falha na autenticação');
      console.log('- Usuário ou senha incorretos na URI de conexão');
    }
    
    process.exit(1);
  }
}

// Executar o teste
testConnection().catch(err => {
  console.error('Erro não tratado:', err);
  process.exit(1);
}); 