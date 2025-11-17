import EnderecoModel, { IEndereco } from '../models/Endereco';
import { Types } from 'mongoose';

export const enderecoRepository = {
  create: (data: Partial<IEndereco>) => EnderecoModel.create(data),
  findAll: (filter = {}) => EnderecoModel.find(filter).lean(),
  findById: (id: string | Types.ObjectId) => EnderecoModel.findById(id).lean(),
  update: (id: string, data: Partial<IEndereco>) => EnderecoModel.findByIdAndUpdate(id, data, { new: true }),
  delete: (id: string) => EnderecoModel.findByIdAndDelete(id)
};
