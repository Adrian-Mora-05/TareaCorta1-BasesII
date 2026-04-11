import mongoose from 'mongoose';

// Define la estructura de una reservación en MongoDB
const reservationSchema = new mongoose.Schema({
  // Referencias a otros documentos
  id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id_restaurante: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  // fecha_hora guarda cuándo es la reserva
  fecha_hora: { type: Date, required: true },
  duracion: { type: Number, required: true },
  cant_personas: { type: Number, required: true },
  // Estado puede ser reservada o cancelada
  estado: { type: String, enum: ['reservada', 'cancelada'], default: 'reservada' }
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);