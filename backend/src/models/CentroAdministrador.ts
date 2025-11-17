import mongoose, { Schema, Document } from 'mongoose';

export interface ICentroAdministrador extends Document {
  id_centro: mongoose.Types.ObjectId;
  id_usuario: mongoose.Types.ObjectId;
  data_inicio?: Date;
  status?: string;
}

const CentroAdministradorSchema = new Schema<ICentroAdministrador>(
  {
    id_centro: { type: Schema.Types.ObjectId, ref: 'Centro', required: true },
    id_usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    data_inicio: Date,
    status: { type: String, default: 'active' }
  },
  { timestamps: true }
);

export default mongoose.model<ICentroAdministrador>('CentroAdministrador', CentroAdministradorSchema);
