import { Request, Response } from 'express';
import { emergenciaRepository } from '../repositories/emergenciaRepository';
import { perfilRepository } from '../repositories/perfilRepository';
import { centroRepository } from '../repositories/centroRepository';
import Centro from '../models/Centro';

export const centrosController = {
  // Create
  async create(req: Request, res: Response) {
    try {
      const {
        orgId,
        nome,
        telefone,
        email,
        description,
        address,
        image,
    } = req.body;


      const created = await centroRepository.create({
        orgId,
        nome,
        telefone,
        email,
        description,
        address,
        image
      });

      res.status(201).json(created);
    } catch (err: any) {
      console.error('Error creating emergencia:', err);
      res.status(500).json({ message: err.message ?? 'Erro ao criar emergência' });
    }
  },

  // List all
  async getAll(_req: Request, res: Response) {
    try {
      const list = await centroRepository.findAll();
      res.json(list);
    } catch (err: any) {
      console.error('Error fetching centros:', err);
      res.status(500).json({ message: err.message ?? 'Erro ao listar centros' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const updateData = {
        address: req.body.address,
        email: req.body.email,
        phone: req.body.phone,
        nome: req.body.nome,
        description: req.body.description,
        image: req.body.image,
        orgId: req.body.orgId,
        telefone: req.body.telefone,
      };
      const centro = await Centro.findOneAndUpdate({ _id: req.params._id }, updateData);
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
      const result = await Centro.findOneAndDelete({ _id: req.params._id });
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
