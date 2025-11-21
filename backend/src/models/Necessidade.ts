// src/models/Necessidade.ts
import { Schema, model, Document, Types } from "mongoose";

export interface INecessidade extends Document {
  title: string;
  description: string;
  type: "Doação" | "Voluntário" | "Serviço" | "Outro";
  quantity?: string;
  status: "Aberta" | "Parcial" | "Atendida";
  centerId: Types.ObjectId;
  quantidade_necessaria: string;
  quantidade_atingida: string;
  emergencyId?: string;
  image?: string;
  interest: Array<string>;
}

export const necessidadeSchema = new Schema<INecessidade>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["Doação", "Voluntário", "Serviço", "Outro"],
      required: true,
    },
    quantity: { type: String, required: false },
    quantidade_necessaria: { type: String, required: false },
    quantidade_atingida: { type: String, required: false },
    status: {
      type: String,
      enum: ["Aberta", "Parcial", "Atendida"],
      required: true,
    },
    centerId: { type: Schema.Types.ObjectId, ref: "Centro" },
    interest: { type: [String], required: true, default: [] },
    emergencyId: { type: Schema.Types.ObjectId, ref: "Emergencia" },
    image: { type: String, required: false },
  },
  { timestamps: true },
);

export const NecessidadeModel = model<INecessidade>(
  "Necessidade",
  necessidadeSchema,
);
export default NecessidadeModel;
