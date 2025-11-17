import mongoose, { Schema, Document } from 'mongoose';

export interface IPerfil extends Document {
  nome_perfil: string;
  descricao?: string;
}

const PerfilSchema = new Schema<IPerfil>(
  {
    nome_perfil: { type: String, required: true },
    descricao: String
  },
  { timestamps: true }
);

export default mongoose.model<IPerfil>('Perfil', PerfilSchema);
