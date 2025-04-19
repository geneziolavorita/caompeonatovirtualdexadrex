import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI_FALLBACK || 'mongodb://localhost:27017/xadrex';

/**
 * Variável global para armazenar a conexão do MongoDB
 * Isso evita conexões repetidas durante o hot-reloading
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Conecta ao MongoDB usando configurações otimizadas
 * Reutiliza a conexão se já existir
 */
export async function connectToDB() {
  if (cached.conn) {
    return { db: cached.conn.db, client: cached.conn.client };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxIdleTimeMS: 60000,
      socketTimeoutMS: process.env.MONGODB_SOCKET_TIMEOUT ? parseInt(process.env.MONGODB_SOCKET_TIMEOUT) : 30000,
      connectTimeoutMS: process.env.MONGODB_CONNECT_TIMEOUT ? parseInt(process.env.MONGODB_CONNECT_TIMEOUT) : 10000,
      serverSelectionTimeoutMS: 10000,
    };

    // Log sanitizado para não expor credenciais
    const sanitizedUri = MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:****@');
    console.log('Tentando conectar ao MongoDB:', sanitizedUri);

    // Se não houver URI, logar erro mas não lançar exceção
    if (!MONGODB_URI) {
      console.error("ALERTA: MONGODB_URI não definida no ambiente. Verifique seu arquivo .env.local");
      console.error("Tentando usar conexão padrão com banco de dados local");
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Conectado ao MongoDB com sucesso');
        return { 
          db: mongoose.connection.db, 
          client: mongoose.connection 
        };
      })
      .catch((err) => {
        console.error('Erro ao conectar ao MongoDB:', err);
        cached.promise = null;
        // Em vez de lançar erro, retornar objeto indicando falha
        return { 
          db: null, 
          client: null,
          error: err,
          connectionFailed: true 
        };
      });
  }

  try {
    cached.conn = await cached.promise;
    
    // Se a conexão falhou, tentar usar fallback
    if (cached.conn.connectionFailed) {
      console.error("Falha na conexão principal com MongoDB. Verifique suas credenciais e conexão de rede.");
      return cached.conn;
    }
    
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error("Erro crítico na conexão com MongoDB:", e);
    return { db: null, client: null, error: e, connectionFailed: true };
  }
}

export default connectToDB; 