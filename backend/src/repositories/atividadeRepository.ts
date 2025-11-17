import AtividadeModel, { IAtividade } from '../models/Atividade';

export const atividadeRepository = {
  create: (data: Partial<IAtividade>) => AtividadeModel.create(data),
  findAll: (filter = {}) => AtividadeModel.find(filter).populate('id_centro').lean(),
  findById: (id: string) => AtividadeModel.findById(id).populate('id_centro'),
  findByCentro: (centroId: string) => AtividadeModel.find({ id_centro: centroId }).lean(),
  update: (id: string, data: Partial<IAtividade>) => AtividadeModel.findByIdAndUpdate(id, data, { new: true }),
  delete: (id: string) => AtividadeModel.findByIdAndDelete(id)
};
