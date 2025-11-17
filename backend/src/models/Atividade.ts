import mongoose, { Schema, Document } from 'mongoose';

export interface IAtividade extends Document {
  titulo: string;
  descricao?: string;
  id_centro?: mongoose.Types.ObjectId;
  data_inicio?: Date;
  data_fim?: Date;
  urgencia?: string;
  status?: string;
  tipo_atividade?: string;
}

const AtividadeSchema = new Schema<IAtividade>(
  {
    titulo: { type: String, required: true },
    descricao: String,
    id_centro: { type: Schema.Types.ObjectId, ref: 'Centro' },
    data_inicio: Date,
    data_fim: Date,
    urgencia: String,
    status: { type: String, default: 'open' },
    tipo_atividade: String
  },
  { timestamps: true }
);

export default mongoose.model<IAtividade>('Atividade', AtividadeSchema);
