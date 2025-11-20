import { Request, Response } from "express";
import { Publicidade } from "../models/Publicidade";
import CentroModel from "../models/Centro"
import NecessidadeModel from "../models/Necessidade";
import UsuarioModel from "../models/Usuario";

export const publicidadeController = {
  async getAll(req: Request, res: Response) {
    try {
      const publicidades = await Publicidade.find()
        .sort({ data_criacao: -1 }) // opcional
        .populate({
          path: "necessidades"
        })
        .populate("usuario", "-senha")
      return res.json(publicidades);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar publicidades' });
    }
  },


  async getById(req: Request, res: Response) {
    const publicidade = await Publicidade.findOne({ id_postagem: req.params.id });
    if (!publicidade) return res.status(404).json({ message: "Publicidade não encontrada" });
    res.json(publicidade);
  },

  async create(req: Request, res: Response) {
    try {
      const necessidadeIds = [];
      if (req.body.necessidades) {
        for (const n of req.body.necessidades) {
          const necessidade = await NecessidadeModel.create(n);
          necessidadeIds.push(necessidade._id);
        }
      }

      // 2. Cria Centro (se fornecido)
      let centroIds = [];
      if (req.body.necessidades) {
        for (const n of req.body.necessidades) {
          const centro = await CentroModel.create(n);
          centroIds.push(centro._id);
        }
      }

      // 3. Cria Publicidade referenciando IDs
      const payload = {
        id_emergencia: req.body.id_emergencia,
        id_centro: req.body.id_centro,
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        data_criacao: req.body.data_criacao,
        data_validade: req.body.data_validade,
        status: req.body.status,
        timeLabel: req.body.timeLabel,
        centro: centroIds,
        necessidades: necessidadeIds,
        usuario: req.body.usuario_id,
        image: req.body.image
      };

      const created = await Publicidade.create(payload);

      // 4. Popula para retornar
      const populated = await Publicidade.findById(created._id)
        .populate("centro")
        .populate("necessidades")

      return res.status(201).json(populated);
    } catch (err: any) {
      console.error("erro ao criar publicidade", err);
      return res.status(500).json({ error: err.message, errors: err.errors ?? null });
    }
  },

  async update(req: Request, res: Response) {
    console.log(req.body)
    console.log(req.params)
    try {
      const updateData = {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        data_validade: req.body.data_validade,
        status: req.body.status,
        timeLabel: req.body.timeLabel,
        image: req.body.image
      };

      const publicidade = await Publicidade.findOneAndUpdate({ _id: req.params._id }, updateData);
      return res.json(publicidade);
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

  async remove(req: Request, res: Response) {
    console.log(req.params)
    try {
      const result = await Publicidade.findOneAndDelete({ _id: req.params._id });
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
