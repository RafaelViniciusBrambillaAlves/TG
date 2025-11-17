import mongoose, { Schema, Document } from 'mongoose';

export interface IEndereco extends Document {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
}

const EnderecoSchema = new Schema<IEndereco>(
  {
    logradouro: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: String,
    pais: String,
    cep: String,
    latitude: Number,
    longitude: Number
  },
  { timestamps: true }
);

export default mongoose.model<IEndereco>('Endereco', EnderecoSchema);
