import CentroAdministradorModel, { ICentroAdministrador } from '../models/CentroAdministrador';

export const centroAdministradorRepository = {
  create: (data: Partial<ICentroAdministrador>) => CentroAdministradorModel.create(data),
  findAll: (filter = {}) => CentroAdministradorModel.find(filter).populate('id_centro id_usuario').lean(),
  findByCentro: (centroId: string) => CentroAdministradorModel.find({ id_centro: centroId }).lean(),
  findByUsuario: (usuarioId: string) => CentroAdministradorModel.find({ id_usuario: usuarioId }).lean(),
  update: (id: string, data: Partial<ICentroAdministrador>) => CentroAdministradorModel.findByIdAndUpdate(id, data, { new: true }),
  delete: (id: string) => CentroAdministradorModel.findByIdAndDelete(id)
};
