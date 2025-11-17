import EmergenciaModel, { IEmergencia } from '../models/Emergencia';
import mongoose from 'mongoose';
import OrganizacaoEmergencia from '../models/OrganizacaoEmergencia';

export const emergenciaRepository = {
  create: (data: Partial<IEmergencia>) => EmergenciaModel.create(data),
  findAll: (filter = {}) =>
    EmergenciaModel.find(filter)
      .populate('id_endereco')                     // popula endereço
      .populate('id_usuario', '-senha'),
  findById: (id: string) =>
    // valida objectId
    EmergenciaModel.findById(new mongoose.Types.ObjectId(id))
      .populate('id_endereco')
      .populate('id_usuario', '-senha'),
  update: (id: string, data: Partial<IEmergencia>) =>
    EmergenciaModel.findByIdAndUpdate(id, data, { new: true }),
  delete: (id: string) => EmergenciaModel.findByIdAndDelete(id),
  linkEmergenciaOrganizacao: (emergencia_id: string, organizacao_id: String) => OrganizacaoEmergencia.create(emergencia_id, organizacao_id)
};
