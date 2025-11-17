import { Request, Response } from 'express';
import { emergenciaRepository } from '../repositories/emergenciaRepository';
import { perfilRepository } from '../repositories/perfilRepository';
import { necessidadeRepository } from '../repositories/necessidadeRepository';

// Controller com CRUD: create / getAll / getById / update / delete
export const necessidadesController = {
  // Create
  async create(req: Request, res: Response) {
    try {
      const { title, description, type, quantity, status, centerId, emergencyId, interestCount, quantidade_necessaria, quantidade_atingida } = req.body;

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
        interestCount
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
      const list = await necessidadeRepository.findAll();
      res.json(list);
    } catch (err: any) {
      console.error('Error fetching necessidades:', err);
      res.status(500).json({ message: err.message ?? 'Erro ao listar necessidades' });
    }
  },
};
