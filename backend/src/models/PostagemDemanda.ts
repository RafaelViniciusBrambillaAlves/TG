import mongoose, { Schema, Document } from 'mongoose';

export interface IPostagemDemanda extends Document {
  id_emergencia?: mongoose.Types.ObjectId;
  id_centro?: mongoose.Types.ObjectId;
  titulo?: string;
  descricao?: string;
  data_criacao?: Date;
  data_validade?: Date;
  status?: string;
}

const PostagemDemandaSchema = new Schema<IPostagemDemanda>(
  {
    id_emergencia: { type: Schema.Types.ObjectId, ref: 'Emergencia' },
    id_centro: { type: Schema.Types.ObjectId, ref: 'Centro' },
    titulo: String,
    descricao: String,
    data_criacao: { type: Date, default: Date.now },
    data_validade: Date,
    status: { type: String, default: 'active' }
  },
  { timestamps: true }
);

export default mongoose.model<IPostagemDemanda>('PostagemDemanda', PostagemDemandaSchema);
