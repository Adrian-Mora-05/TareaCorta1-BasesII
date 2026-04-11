import mongoose from 'mongoose';

// Define la estructura de un documento usuario en MongoDB
const userSchema = new mongoose.Schema({
  // Guarda el UUID de Keycloak para vincular ambos sistemas
  id_external_auth: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  // Solo puede ser admin o cliente
  rol: { type: String, enum: ['admin', 'cliente'], default: 'cliente' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);