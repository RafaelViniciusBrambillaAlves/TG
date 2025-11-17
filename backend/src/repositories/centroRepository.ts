import CentroModel, { ICentro } from '../models/Centro';

export const centroRepository = {
  create: (data: Partial<ICentro>) => CentroModel.create(data),
  findAll: (filter = {}) => CentroModel.find(filter).lean(),
  findById: (id: string) => CentroModel.findById(id).populate('id_endereco id_organizacao'),
  findByOrganizacao: (orgId: string) => CentroModel.find({ id_organizacao: orgId }).lean(),
  update: (id: string, data: Partial<ICentro>) => CentroModel.findByIdAndUpdate(id, data, { new: true }),
  delete: (id: string) => CentroModel.findByIdAndDelete(id)
};
