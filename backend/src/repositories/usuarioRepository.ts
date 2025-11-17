import OrganizacaoUsuario from '../models/OrganizacaoUsuario';
import UsuarioModel, { IUsuario } from '../models/Usuario';

export const usuarioRepository = {
  create: (data: Partial<IUsuario>) => UsuarioModel.create(data),
  findAll: (filter = {}) => UsuarioModel.find(filter).select('-senha').lean(),
  findById: (id: string) => UsuarioModel.findById(id).select('-senha'),
  findByEmail: (email: string) => UsuarioModel.findOne({ email }),
  update: (id: string, data: Partial<IUsuario>) => UsuarioModel.findByIdAndUpdate(id, data, { new: true }),
  delete: (id: string) => UsuarioModel.findByIdAndDelete(id),
  linkUserOrganization: (user_id: string, organization_id: string) => OrganizacaoUsuario.create({user_id: user_id, organization_id: organization_id})
};
