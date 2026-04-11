import mongoose from 'mongoose';

// Define la estructura de un documento restaurante en MongoDB
// Equivale a la tabla restaurante en PostgreSQL
const restaurantSchema = new mongoose.Schema({
  // nombre es obligatorio, equivale a NOT NULL en SQL
  nombre: { type: String, required: true },
  // direccion y telefono son opcionales
  direccion: { type: String },
  telefono: { type: String }
}, {
  // Agrega automáticamente createdAt y updatedAt
  timestamps: true
});

export default mongoose.model('Restaurant', restaurantSchema);