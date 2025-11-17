import IntencaoDoacaoModel, { IIntencaoDoacao } from '../models/IntencaoDoacao';

export const intencaoDoacaoRepository = {
  create: (data: Partial<IIntencaoDoacao>) => IntencaoDoacaoModel.create(data),
  findAll: (filter = {}) => IntencaoDoacaoModel.find(filter).populate('id_necessidade id_usuario').lean(),
  findByNecessidade: (necessidadeId: string) => IntencaoDoacaoModel.find({ id_necessidade: necessidadeId }).lean(),
  findByUsuario: (usuarioId: string) => IntencaoDoacaoModel.find({ id_usuario: usuarioId }).lean(),
  update: (id: string, data: Partial<IIntencaoDoacao>) => IntencaoDoacaoModel.findByIdAndUpdate(id, data, { new: true }),
  delete: (id: string) => IntencaoDoacaoModel.findByIdAndDelete(id)
};
