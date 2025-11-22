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
  },

  async update(req: Request, res: Response) {
    try {
      const updateData = {
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        quantity: req.body.quantity,
        status: req.body.status,
        centerId: req.body.centerId,
        emergencyId: req.body.emergencyId,
        quantidade_necessaria: req.body.quantidade_necessaria,
        quantidade_atingida: req.body.quantidade_atingida,
        image: req.body.image
      };

      const centro = await NecessidadeModel.findOneAndUpdate({ _id: req.params._id }, updateData);
      return res.json(centro);
    } catch (err: any) {
      if (err.message === 'Publicidade não encontrada') {
        return res.status(404).json({ message: err.message });
      }
      console.error("Erro ao atualizar parcialmente publicidade:", err);
      return res.status(500).json({
        error: "Erro ao atualizar parcialmente publicidade",
        message: err.message
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const result = await NecessidadeModel.findOneAndDelete({ _id: req.params._id });
      return res.json(result);
    } catch (err: any) {
      console.log(err)
      if (err.message === 'Publicidade não encontrada') {
        return res.status(404).json({ message: err.message });
      }
      console.error("Erro ao remover publicidade:", err);
      return res.status(500).json({
        error: "Erro ao remover publicidade",
        message: err.message
      });
    }
  },
};
