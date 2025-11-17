import mongoose, { Schema, Document } from 'mongoose';

export interface IIntencaoDoacao extends Document {
  id_necessidade: mongoose.Types.ObjectId;
  id_usuario: mongoose.Types.ObjectId;
  data_intencao?: Date;
  quantidade?: number;
  status?: string;
}

const IntencaoDoacaoSchema = new Schema<IIntencaoDoacao>(
  {
    id_necessidade: { type: Schema.Types.ObjectId, ref: 'Necessidade', required: true },
    id_usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    data_intencao: { type: Date, default: Date.now },
    quantidade: Number,
    status: { type: String, default: 'pending' }
  },
  { timestamps: true }
);

export default mongoose.model<IIntencaoDoacao>('IntencaoDoacao', IntencaoDoacaoSchema);
