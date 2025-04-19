import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xadrex';
const CONNECT_TIMEOUT = parseInt(process.env.MONGODB_CONNECT_TIMEOUT || '30000', 10);
const SOCKET_TIMEOUT = parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '75000', 10);

// Variável global para armazenar a conexão
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('Usando conexão existente com MongoDB');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: CONNECT_TIMEOUT, // 30 segundos
      socketTimeoutMS: SOCKET_TIMEOUT, // 75 segundos
      family: 4, // Força IPv4
      serverSelectionTimeoutMS: 20000, // 20 segundos
      maxPoolSize: 10, // Limita o número de conexões simultâneas
      retryWrites: true,
      retryReads: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Remover senha da string de conexão para o log
    const sanitizedUri = MONGODB_URI.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://$1:****@');
    console.log('Tentando conectar ao MongoDB:', sanitizedUri);

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Conectado ao MongoDB com sucesso');
        
        // Evento para detectar desconexões
        mongoose.connection.on('disconnected', () => {
          console.warn('Conexão com MongoDB foi perdida');
          console.log('Tentando reconectar...');
          setTimeout(() => {
            cached.conn = null;
            cached.promise = null;
            dbConnect(); // Tenta reconectar
          }, 5000);
        });

        // Evento para detectar erro na conexão
        mongoose.connection.on('error', (err) => {
          console.error('Erro na conexão com MongoDB:', err);
          console.log('Tentando reconectar após erro...');
          setTimeout(() => {
            cached.conn = null; 
            cached.promise = null;
            dbConnect(); // Tenta reconectar
          }, 5000);
        });

        return mongoose;
      })
      .catch((err) => {
        console.error('Erro ao conectar ao MongoDB:', err);
        // Limpar o cache para permitir nova tentativa
        cached.promise = null;
        // Tenta reconectar automaticamente após 5 segundos
        setTimeout(() => {
          console.log('Tentando reconectar após falha...');
          dbConnect();
        }, 5000);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    console.error('Falha ao estabelecer conexão com MongoDB:', e);
    // Se houver erro, limpar o cache para permitir nova tentativa na próxima chamada
    cached.promise = null;
    throw new Error(`Não foi possível conectar ao MongoDB: ${e.message}`);
  }
}

export default dbConnect; 