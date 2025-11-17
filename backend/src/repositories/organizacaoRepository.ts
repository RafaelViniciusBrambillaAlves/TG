import OrganizacaoModel, { IOrganizacao } from '../models/Organizacao';

export const organizacaoRepository = {
  create: (data: Partial<IOrganizacao>) => OrganizacaoModel.create(data),
  findAll: (filter = {}) => OrganizacaoModel.find(filter).lean(),
  findById: (id: string) => OrganizacaoModel.findById(id),
  findByEndereco: (enderecoId: string) => OrganizacaoModel.find({ id_endereco: enderecoId }).lean(),
  update: (id: string, data: Partial<IOrganizacao>) => OrganizacaoModel.findByIdAndUpdate(id, data, { new: true }),
  delete: (id: string) => OrganizacaoModel.findByIdAndDelete(id)
};
