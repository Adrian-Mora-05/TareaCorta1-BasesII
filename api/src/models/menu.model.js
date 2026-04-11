import mongoose from 'mongoose';

// Define la estructura de un documento menú en MongoDB
const menuSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  // Referencia al restaurante al que pertenece el menú
  // Equivale a la llave foránea id_restaurante en PostgreSQL
  id_restaurante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  ultima_actualizacion: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Menu', menuSchema);