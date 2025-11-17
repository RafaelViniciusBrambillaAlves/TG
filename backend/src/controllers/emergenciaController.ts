import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { emergenciaRepository } from '../repositories/emergenciaRepository';
import Emergencia from '../models/Emergencia';
import Usuario from '../models/Usuario';
import OrganizacaoUsuario from '../models/OrganizacaoUsuario';

// Controller com CRUD: create / getAll / getById / update / delete
export const emergenciaController = {
  // Create
  async create(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
      }

      const decoded: any = jwt.decode(token);
      const userId = decoded?.id;

      const {
        titulo,
        subtitulo,
        descricao,
        id_endereco,
        data_inicio,
        data_fim,
        urgencia,
        status,
        cep,
        numero,
        address,
        image
      } = req.body;

      if (!titulo) {
        return res.status(400).json({ message: 'O campo "titulo" é obrigatório' });
      }

      // Busca a organização do usuário
      const orgLinks = await OrganizacaoUsuario.find({ user_id: userId })
        .populate<{ organization_id: any }>('organization_id')
        .lean()
        .exec();

      // Verifica se o usuário tem pelo menos uma organização vinculada
      if (!orgLinks.length) {
        return res.status(400).json({ message: 'Usuário não possui organização vinculada' });
      }

      // Pega a primeira organização (ou mapeia várias se quiser permitir múltiplas)
      const organization = orgLinks[0].organization_id;
      const organizationId = organization?._id;

      const created = await emergenciaRepository.create({
        titulo,
        subtitulo,
        descricao,
        id_endereco,
        data_inicio,
        data_fim,
        urgencia,
        status,
        id_usuario: userId,
        orgId: organizationId,
        cep,
        numero,
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
      const list = await emergenciaRepository.findAll().populate('id_usuario', '-senha').populate('id_endereco');
      res.json(list);
    } catch (err: any) {
      console.error('Error fetching emergencias:', err);
      res.status(500).json({ message: err.message ?? 'Erro ao listar emergências' });
    }
  },

  // Get by id
  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const emergencia = await emergenciaRepository.findById(id);
      if (!emergencia) {
        res.status(404).json({ message: 'Emergência não encontrada' });
        return;
      }
      res.json(emergencia);
    } catch (err: any) {
      console.error('Error fetching emergencia by id:', err);
      res.status(400).json({ message: err.message ?? 'Erro ao buscar emergência' });
    }
  },

  // Update
  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const updates = req.body;
      const updated = await emergenciaRepository.update(id, updates);
      if (!updated) {
        res.status(404).json({ message: 'Emergência não encontrada' });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      console.error('Error updating emergencia:', err);
      res.status(400).json({ message: err.message ?? 'Erro ao atualizar emergência' });
    }
  },

  // Delete
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const deleted = await emergenciaRepository.delete(id);
      if (!deleted) {
        res.status(404).json({ message: 'Emergência não encontrada' });
        return;
      }
      res.json({ message: 'Emergência removida com sucesso' });
    } catch (err: any) {
      console.error('Error deleting emergencia:', err);
      res.status(400).json({ message: err.message ?? 'Erro ao deletar emergência' });
    }
  },
};
