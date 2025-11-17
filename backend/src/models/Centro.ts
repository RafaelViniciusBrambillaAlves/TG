// src/models/Centro.ts
import mongoose, { Schema, Types, model } from "mongoose";

export interface ICentro extends Document {
  id_centro?: number;
  orgId: Types.ObjectId
  nome: string
  telefone?: string;
  email?: string | null;
  description: string;
  address: string
  image: string
}

const CentroSchema = new Schema(
  {
    nome: String,
    telefone: String,
    email: String,
    description: String,
    address: String,
    image: String,
    orgId: { type: Schema.Types.ObjectId, ref: "Organizacao" },
    id_centro: Number,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },   // importante para incluir virtuals no JSON
    toObject: { virtuals: true },
  }
);

// Virtual: necessidades que apontam para esse centro (Necessidade.centerId === _id)
CentroSchema.virtual("necessidades", {
  ref: "Necessidade",       // deve bater com model("Necessidade", ...)
  localField: "_id",
  foreignField: "centerId",
  justOne: false,
});

export default mongoose.model("Centro", CentroSchema);
