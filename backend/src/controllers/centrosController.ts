import { Request, Response } from 'express';
import { emergenciaRepository } from '../repositories/emergenciaRepository';
import { perfilRepository } from '../repositories/perfilRepository';
import { centroRepository } from '../repositories/centroRepository';

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
  }
};
