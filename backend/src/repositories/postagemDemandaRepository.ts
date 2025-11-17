import PostagemDemandaModel, { IPostagemDemanda } from '../models/PostagemDemanda';

export const postagemDemandaRepository = {
  create: (data: Partial<IPostagemDemanda>) => PostagemDemandaModel.create(data),
  findAll: (filter = {}) => PostagemDemandaModel.find(filter).populate('id_emergencia id_centro').lean(),
  findById: (id: string) => PostagemDemandaModel.findById(id).populate('id_emergencia id_centro'),
  findByEmergencia: (emergenciaId: string) => PostagemDemandaModel.find({ id_emergencia: emergenciaId }).lean(),
  update: (id: string, data: Partial<IPostagemDemanda>) => PostagemDemandaModel.findByIdAndUpdate(id, data, { new: true }),
  delete: (id: string) => PostagemDemandaModel.findByIdAndDelete(id)
};
