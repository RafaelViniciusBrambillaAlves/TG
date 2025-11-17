import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencia extends Document {
  titulo: string;
  subtitulo?: string | null;
  descricao?: string | null;
  id_endereco?: mongoose.Types.ObjectId | null;
  data_inicio?: Date | null;
  data_fim?: Date | null;
  urgencia?: string | null;
  status?: string | null;
  id_usuario?: mongoose.Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
  cep?: String;
  numero?: number;
  address?: string;
  authorName?: string;
  orgId?: string;
  image?: string;
}

const EmergenciaSchema = new Schema<IEmergencia>(
  {
    titulo: { type: String, required: true },
    subtitulo: { type: String },
    descricao: { type: String },
    id_endereco: { type: Schema.Types.ObjectId, ref: 'Endereco' },
    data_inicio: { type: Date },
    data_fim: { type: Date },
    urgencia: { type: String },
    status: { type: String, default: 'ativa' },
    id_usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    cep: {type: Schema.Types.String},
    numero: {type: Schema.Types.Number},
    address: {type: Schema.Types.String},
    orgId:  { type: Schema.Types.ObjectId, ref: 'Organizacao' },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IEmergencia>('Emergencia', EmergenciaSchema);
