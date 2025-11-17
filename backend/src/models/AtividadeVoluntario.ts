import mongoose, { Schema, Document } from 'mongoose';

export interface IAtividadeVoluntario extends Document {
  id_atividade: mongoose.Types.ObjectId;
  id_usuario: mongoose.Types.ObjectId;
  data_inscricao?: Date;
  status?: string;
}

const AtividadeVoluntarioSchema = new Schema<IAtividadeVoluntario>(
  {
    id_atividade: { type: Schema.Types.ObjectId, ref: 'Atividade', required: true },
    id_usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    data_inscricao: { type: Date, default: Date.now },
    status: { type: String, default: 'inscrito' }
  },
  { timestamps: true }
);

export default mongoose.model<IAtividadeVoluntario>('AtividadeVoluntario', AtividadeVoluntarioSchema);
