import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xadrex';

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

    const sanitizedUri = MONGODB_URI.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://$1:****@');
    console.log('Tentando conectar ao MongoDB:', sanitizedUri);

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
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default connectToDB; 