import mongoose from 'mongoose';

export async function connectMongo(uri: string) {
  // opções padrão; Mongoose 7 já ajusta automaticamente a maioria
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000, 
    // useNewUrlParser: true, // não é mais necessário nas versões recentes
    // useUnifiedTopology: true,
  });
  console.log('✅ Mongoose connected');
  return mongoose;
}

export async function disconnectMongo() {
  await mongoose.disconnect();
  console.log('🛑 Mongoose disconnected');
}
