import mongoose from 'mongoose';

// Define la estructura de un pedido en MongoDB
const orderSchema = new mongoose.Schema({
  id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id_restaurante: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  descripcion: { type: String },
  precio_total: { type: Number },
  // Estado del pedido
  estado: { type: String, enum: ['solicitado', 'entregado', 'cancelado'], default: 'solicitado' },
  // Tipo de pedido
  tipo: { type: String, enum: ['comer aquí', 'para llevar'], required: true }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);