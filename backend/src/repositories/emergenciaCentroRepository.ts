import EmergenciaCentroModel, { IEmergenciaCentro } from '../models/EmergenciaCentro';

export const emergenciaCentroRepository = {
  create: (data: Partial<IEmergenciaCentro>) => EmergenciaCentroModel.create(data),
  findAll: (filter = {}) => EmergenciaCentroModel.find(filter).populate('id_emergencia id_centro').lean(),
  findByEmergencia: (emergenciaId: string) => EmergenciaCentroModel.find({ id_emergencia: emergenciaId }).lean(),
  findByCentro: (centroId: string) => EmergenciaCentroModel.find({ id_centro: centroId }).lean(),
  delete: (id: string) => EmergenciaCentroModel.findByIdAndDelete(id)
};
