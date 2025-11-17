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
  interestCount?: number;
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
    emergencyId: { type: String, required: false },
    interestCount: { type: Number, required: false },
  },
  { timestamps: true },
);

export const NecessidadeModel = model<INecessidade>(
  "Necessidade",
  necessidadeSchema,
);
export default NecessidadeModel;
