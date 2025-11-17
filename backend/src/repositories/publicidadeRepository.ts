import { Publicidade } from "../models/Publicidade";

export const publicidadeRepository = {
  async create(data: any) {
    return await Publicidade.create(data);
  },

  async getAll() {
    return await Publicidade.find();
  },

  async getById(id: string) {
    return await Publicidade.findById(id);
  },

  async update(id: string, data: any) {
    return await Publicidade.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id: string) {
    return await Publicidade.findByIdAndDelete(id);
  },
};
