import { Request, Response } from 'express';
import { emergenciaRepository } from '../repositories/emergenciaRepository';
import { perfilRepository } from '../repositories/perfilRepository';
import { necessidadeRepository } from '../repositories/necessidadeRepository';
import NecessidadeModel from '../models/Necessidade';

// Controller com CRUD: create / getAll / getById / update / delete
export const necessidadesController = {
  // Create
  async create(req: Request, res: Response) {
    try {
      const { title, description, type, quantity, status, centerId, emergencyId, quantidade_necessaria, quantidade_atingida, image } = req.body;

      const created = await necessidadeRepository.create({
        title,
        description,
        type,
        quantity,
        status,
        centerId,
        emergencyId,
        quantidade_necessaria,
        quantidade_atingida,
        interest: [],
        image
      });

      res.status(201).json(created);
    } catch (err: any) {
      console.error('Error creating necessidade:', err);
      res.status(500).json({ message: err.message ?? 'Erro ao criar necessidade' });
    }
  },

  // List all
  async getAll(_req: Request, res: Response) {
    try {
      const list = await NecessidadeModel.find()
        .populate('emergencyId')
        .populate('centerId')
        .sort({ createdAt: -1 });
      res.json(list);
    } catch (err: any) {
      console.error('Error fetching necessidades:', err);
      res.status(500).json({ message: err.message ?? 'Erro ao listar necessidades' });
    }
  },


  async ajudar(req: Request, res: Response) {
    try {
      const { _id } = req.params;
      const { userId } = req.body;

      const updated = await NecessidadeModel.findByIdAndUpdate(
        _id,
        { $addToSet: { interest: userId } },
        { new: true, strictPopulate: false }
      );

      if (!updated) {
        return res.status(404).json({ message: 'Necessidade não encontrada' });
      }

      res.json(updated);
    } catch (err: any) {
      console.error('Error updating necessidade:', err);
      res.status(500).json({ message: err.message ?? 'Erro ao atualizar necessidade' });
    }
  }

};
