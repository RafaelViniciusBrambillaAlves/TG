import express from 'express';
import dotenv from 'dotenv';
import { connectMongo, disconnectMongo } from './db/mongoose';
import cors from 'cors';
import router from './routes/index';
import listEndpoints from 'express-list-endpoints';

import './models/Usuario';
import './models/Endereco';
import './models/Emergencia'; 
import { connectToMongo } from './db/connectMongoDB';

dotenv.config();
const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081'],
  credentials: true
}));
app.use(express.json()); // necessário para req.body JSON
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
// mount das rotas (base path)
app.use('/api/v1', router);

async function start() {
  const mongoUri = process.env.MONGO_URI!;
  if (!mongoUri) throw new Error('MONGO_URI not set');

  await connectMongo(mongoUri);
  await connectToMongo(mongoUri, 'test');


  const server = app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });

  // graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down…');
    server.close();
    await disconnectMongo();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch(err => {
  console.error('Failed to start app:', err);
  process.exit(1);
});
console.log('🔍 Rotas registradas:');
console.table(listEndpoints(app));