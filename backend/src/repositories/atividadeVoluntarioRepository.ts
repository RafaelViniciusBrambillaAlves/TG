import AtividadeVoluntarioModel, { IAtividadeVoluntario } from '../models/AtividadeVoluntario';

export const atividadeVoluntarioRepository = {
  create: (data: Partial<IAtividadeVoluntario>) => AtividadeVoluntarioModel.create(data),
  findAll: (filter = {}) => AtividadeVoluntarioModel.find(filter).populate('id_atividade id_usuario').lean(),
  findByAtividade: (atividadeId: string) => AtividadeVoluntarioModel.find({ id_atividade: atividadeId }).lean(),
  findByUsuario: (usuarioId: string) => AtividadeVoluntarioModel.find({ id_usuario: usuarioId }).lean(),
  update: (id: string, data: Partial<IAtividadeVoluntario>) => AtividadeVoluntarioModel.findByIdAndUpdate(id, data, { new: true }),
  delete: (id: string) => AtividadeVoluntarioModel.findByIdAndDelete(id)
};
