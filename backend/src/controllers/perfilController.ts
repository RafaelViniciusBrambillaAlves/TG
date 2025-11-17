import { Request, Response } from 'express';
import { emergenciaRepository } from '../repositories/emergenciaRepository';
import { perfilRepository } from '../repositories/perfilRepository';

// Controller com CRUD: create / getAll / getById / update / delete
export const perfilController = {
  // Create
  async create(req: Request, res: Response) {
    try {
      const { nome_perfil, descricao } = req.body;


      const created = await perfilRepository.create({
        nome_perfil,
        descricao
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
      const list = await perfilRepository.findAll();
      res.json(list);
    } catch (err: any) {
      console.error('Error fetching emergencias:', err);
      res.status(500).json({ message: err.message ?? 'Erro ao listar perfil' });
    }
  }
};
