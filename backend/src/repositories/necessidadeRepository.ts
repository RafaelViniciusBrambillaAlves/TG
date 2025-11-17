import NecessidadeModel, { INecessidade } from '../models/Necessidade';

export const necessidadeRepository = {
  create: (data: Partial<INecessidade>) => NecessidadeModel.create(data),
  findAll: (filter = {}) => NecessidadeModel.find(filter),
  findById: (id: string) => NecessidadeModel.findById(id).populate('id_emergencia id_centro'),
  findByEmergencia: (emergenciaId: string) => NecessidadeModel.find({ id_emergencia: emergenciaId }).lean(),
  update: (id: string, data: Partial<INecessidade>) => NecessidadeModel.findByIdAndUpdate(id, data, { new: true }),
  delete: (id: string) => NecessidadeModel.findByIdAndDelete(id),
};
