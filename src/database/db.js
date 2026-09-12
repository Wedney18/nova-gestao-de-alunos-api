import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://wedneysantos_db_user:TauXRZQSnlAqDSPE@cluster0.x9sw2lq.mongodb.net/?appName=Cluster0'

mongoose.connection.on('error', (err) => {
  console.error('Erro de conexão com o MongoDB:', err.message);
});

await mongoose.connect(MONGODB_URI);

console.log(`MongoDB conectado em ${MONGODB_URI}`);

export default mongoose;
