import { Request, Response } from 'express';
import { emergenciaRepository } from '../repositories/emergenciaRepository';
import { perfilRepository } from '../repositories/perfilRepository';
import { organizacaoRepository } from '../repositories/organizacaoRepository';

// Controller com CRUD: create / getAll / getById / update / delete
export const organizacaoController = {
  // Create
  async create(req: Request, res: Response) {
    try {
      const { 
        name,
        short,
        description,
        phone,
        email,
        logo,
        website
       } = req.body;

      const created = await organizacaoRepository.create({
        name,
        short,
        description,
        phone,
        email,
        logo,
        website
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
      const list = await organizacaoRepository.findAll()
        .populate({
          path: "centros",                    // virtual da Organizacao
          select: "nome telefone email address image id_centro createdAt",
          populate: {
            path: "necessidades",             // virtual do Centro
            model: "Necessidade",
          },
        })
        .populate({
          path: "emergencias",                // virtual da Organizacao
          model: "Emergencia",
          select: "titulo subtitulo descricao status data_inicio data_fim createdAt image id_endereco id_usuario",
          populate: [
            { path: "id_usuario", select: "-senha" },
            { path: "id_endereco" },
          ],
        });
      res.json(list);
    } catch (err: any) {
      console.error('Error fetching emergencias:', err);
      res.status(500).json({ message: err.message ?? 'Erro ao listar perfil' });
    }
  }
};
