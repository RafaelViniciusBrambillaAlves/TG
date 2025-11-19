import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUsuario extends Document {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  id_perfil: Types.ObjectId;
  id_endereco?: mongoose.Types.ObjectId;
  data_criacao?: Date;
  matchPassword(plain: string): Promise<boolean>;
  image?: string;
}

const UsuarioSchema = new Schema<IUsuario>(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    telefone: String,
    id_perfil: { type: Schema.Types.ObjectId, ref: 'Perfil' },
    id_endereco: { type: Schema.Types.ObjectId, ref: 'Endereco' },
    data_criacao: { type: Date, default: Date.now },
    image: String,
  },
  { timestamps: true }
);

UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

UsuarioSchema.methods.matchPassword = function (plain: string) {
  return bcrypt.compare(plain, this.senha);
};

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);
