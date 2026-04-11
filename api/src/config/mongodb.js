import mongoose from 'mongoose';
import 'dotenv/config';

// URL de conexión leída desde las variables de entorno
const MONGO_URL = process.env.MONGO_URL;

// Conecta la aplicación a MongoDB
export async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Conectado a MongoDB correctamente');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    // Si no puede conectar detiene la aplicación
    process.exit(1);
  }
}