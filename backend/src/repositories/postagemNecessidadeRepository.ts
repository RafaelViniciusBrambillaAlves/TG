import PostagemNecessidadeModel, { IPostagemNecessidade } from '../models/PostagemNecessidade';

export const postagemNecessidadeRepository = {
  create: (data: Partial<IPostagemNecessidade>) => PostagemNecessidadeModel.create(data),
  findAll: (filter = {}) => PostagemNecessidadeModel.find(filter).populate('id_mensagem id_necessidade').lean(),
  findByMensagem: (mensagemId: string) => PostagemNecessidadeModel.find({ id_mensagem: mensagemId }).lean(),
  delete: (id: string) => PostagemNecessidadeModel.findByIdAndDelete(id)
};
