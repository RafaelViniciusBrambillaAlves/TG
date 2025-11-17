import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IPublicidade extends Document {
  id_emergencia?: mongoose.Types.ObjectId;
  id_centro?: Types.ObjectId;
  titulo?: string;
  descricao?: string;
  data_criacao?: Date;
  data_validade?: Date;
  status?: string;
  timeLabel?: string;
  centro?: Types.ObjectId[]; // referência
  necessidades?: Types.ObjectId[]; // referência para múltiplas necessidades\
  usuario?: Types.ObjectId;
}

const publicidadeSchema = new Schema<IPublicidade>({
  id_emergencia: { type: Schema.Types.ObjectId, ref: "Emergencia" },
  id_centro: Number,
  titulo: String,
  descricao: String,
  data_criacao: { type: Date, default: Date.now },
  data_validade: Date,
  status: String,
  timeLabel: String,
  centro: [{ type: Schema.Types.ObjectId, ref: "Centro" }],
  necessidades: [{ type: Schema.Types.ObjectId, ref: "Necessidade" }],
  usuario: { type: Schema.Types.ObjectId, ref: "Usuario" },
});

export const Publicidade = model<IPublicidade>("Publicidade", publicidadeSchema);
export default Publicidade;
