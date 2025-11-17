import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergenciaCentro extends Document {
  id_emergencia: mongoose.Types.ObjectId;
  id_centro: mongoose.Types.ObjectId;
}

const EmergenciaCentroSchema = new Schema<IEmergenciaCentro>(
  {
    id_emergencia: { type: Schema.Types.ObjectId, ref: 'Emergencia', required: true },
    id_centro: { type: Schema.Types.ObjectId, ref: 'Centro', required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IEmergenciaCentro>('EmergenciaCentro', EmergenciaCentroSchema);
