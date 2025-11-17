import PerfilModel, { IPerfil } from '../models/Perfil';

export const perfilRepository = {
  create: (data: Partial<IPerfil>) => PerfilModel.create(data),
  findAll: (filter = {}) => PerfilModel.find(filter).lean(),
  findById: (id: string) => PerfilModel.findById(id),
  update: (id: string, data: Partial<IPerfil>) => PerfilModel.findByIdAndUpdate(id, data, { new: true }),
  delete: (id: string) => PerfilModel.findByIdAndDelete(id)
};
