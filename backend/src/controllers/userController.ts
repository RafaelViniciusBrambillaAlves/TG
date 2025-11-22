import { Request, Response } from 'express';
import generateToken from '../utils/generateToken';
import { usuarioRepository } from '../repositories/usuarioRepository';
import UsuarioModel from '../models/Usuario';
import OrganizacaoUsuario from '../models/OrganizacaoUsuario';
import Perfil from '../models/Perfil';

export const userController = {
  // Registro
  async register(req: Request, res: Response) {
    const { nome, email, senha, id_perfil, image } = req.body;
    const userExists = await usuarioRepository.findByEmail(email);
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    const user = await usuarioRepository.create({ nome, email, senha, id_perfil: id_perfil, image });
    const [links, perfil] = await Promise.all([
        OrganizacaoUsuario.find({ user_id: user._id })
          .populate<{ organization_id: any }>('organization_id')
          .lean()
          .exec(),
        Perfil.findById(user.id_perfil).lean().exec()
      ]);
      const organizations = (links || [])
        .map((l: any) => l.organization_id)
        .filter(Boolean)
        .map((org: any) => ({
          _id: org._id,
          name: org.name,
          phone: org.phone,
          email: org.email,
          website: org.website,
          short: org.short,
          description: org.description,
          logo: org.logo,
          createdAt: org.createdAt
        }));

    res.status(201).json({
      _id: user._id,
      username: user.nome,
      email: user.email,
      role: perfil,
      image: user.image,
      organizations,
      token: generateToken(user.id.toString())
    });
  },

  // Login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await usuarioRepository.findByEmail(email);

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const [links, perfil] = await Promise.all([
        OrganizacaoUsuario.find({ user_id: user._id })
          .populate<{ organization_id: any }>('organization_id')
          .lean()
          .exec(),
        Perfil.findById(user.id_perfil).lean().exec()
      ]);
      const organizations = (links || [])
        .map((l: any) => l.organization_id)
        .filter(Boolean)
        .map((org: any) => ({
          _id: org._id,
          name: org.name,
          phone: org.phone,
          email: org.email,
          website: org.website,
          short: org.short,
          description: org.description,
          logo: org.logo,
          createdAt: org.createdAt
        }));

      res.json({
        _id: user._id,
        username: user.nome,
        email: user.email,
        role: perfil,
        image: user.image,
        organizations,
        token: generateToken(user.id.toString())
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Listar todos
  async getAllVoluntarios(req: Request, res: Response) {
    try {
      const users = await UsuarioModel.find()
        .select('-senha') // opcional: não retornar senha
        .populate({ path: 'id_perfil', select: 'nome_perfil descricao' })
        .lean();

      const result = users.map(u => ({
        ...u,
        perfil: u.id_perfil,
        id_perfil: undefined,
      }));

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao listar voluntários' });
    }
  },
  // Buscar por ID
  async getById(req: Request, res: Response) {
    const user = await usuarioRepository.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  },

  async linkUserOrganization(req: Request, res: Response) {
    const { userId, organizationId } = req.body;
    try {
      const updatedUser = await usuarioRepository.linkUserOrganization(userId, organizationId);
      res.json(updatedUser);
    } catch (err: any) {
      res.status(500).json({ message: err.message ?? 'Erro ao vincular usuário à organização' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { nome, email, telefone, bio, image } = req.body;

      const user = await UsuarioModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // atualiza campos permitidos
      if (nome !== undefined) user.nome = nome;
      if (email !== undefined) user.email = email;
      if (telefone !== undefined) user.telefone = telefone;
      if (image !== undefined) user.image = image;

      await user.save(); // gatilha pre('save') se senha foi alterada

      // popula organizações e perfil para retorno, seguindo padrão das outras rotas
      const [links, perfil] = await Promise.all([
        OrganizacaoUsuario.find({ user_id: user._id })
          .populate<{ organization_id: any }>("organization_id")
          .lean()
          .exec(),
        Perfil.findById(user.id_perfil).lean().exec(),
      ]);

      const organizations = (links || [])
        .map((l: any) => l.organization_id)
        .filter(Boolean)
        .map((org: any) => ({
          _id: org._id,
          name: org.name,
          phone: org.phone,
          email: org.email,
          website: org.website,
          short: org.short,
          description: org.description,
          logo: org.logo,
          createdAt: org.createdAt,
        }));

      res.json({
        _id: user._id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        role: perfil,
        avatarUrl: user.image,
        organizations,
      });
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Alterar senha (PUT /api/v1/usuarios/:id/password)
  async changePassword(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "currentPassword and newPassword are required" });
      }

      const user = await UsuarioModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      user.senha = newPassword; // pre('save') fará hash
      await user.save();

      res.json({ message: "Password updated" });
    } catch (err) {
      console.error("Error changing password:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
};
