import { Request, Response } from "express";
import generateToken from "../utils/generateToken";
import { usuarioRepository } from "../repositories/usuarioRepository";
import UsuarioModel from "../models/Usuario";
import OrganizacaoUsuario from "../models/OrganizacaoUsuario";
import Perfil from "../models/Perfil";
import { Types } from "mongoose";
import Organizacao from "../models/Organizacao";

export const userController = {
  async registerAdmin(req: Request, res: Response) {
    try {
      const { nome, email, senha, image } = req.body;

      // forçamos a tipagem como any/unknown tratado para evitar erro TS
      const adminPerfil = (await Perfil.findOne({ nome_perfil: "Admin" })
        .lean()
        .exec()) as any;
      if (!adminPerfil || !adminPerfil._id) {
        res.status(400).json({ message: "Admin profile not found" });
        return;
      }

      const userExists = await usuarioRepository.findByEmail(email);
      if (userExists) {
        res.status(400).json({ message: "Usuário já existe" });
        return;
      }

      // cast explícito para Types.ObjectId
      const perfilId = adminPerfil._id as Types.ObjectId;

      const user = await usuarioRepository.create({
        nome,
        email,
        senha,
        id_perfil: perfilId,
        image,
      });

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

      res.status(201).json({
        _id: user._id,
        username: user.nome,
        email: user.email,
        role: perfil,
        image: user.image,
        organizations,
        token: generateToken(user.id.toString()),
      });
    } catch (err) {
      console.error("Error in registerAdmin:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Registro de Voluntário
  async register(req: Request, res: Response) {
    const { nome, email, senha, image } = req.body;

    // Busca o perfil "voluntario"
    const voluntarioPerfil = await Perfil.findOne({
      nome_perfil: "Voluntario",
    });
    if (!voluntarioPerfil) {
      res.status(400).json({ message: "Voluntario profile not found" });
      return;
    }

    const userExists = await usuarioRepository.findByEmail(email);
    if (userExists) {
      res.status(400).json({ message: "Usuário já existe!" });
      return;
    }

    const user = await usuarioRepository.create({
      nome,
      email,
      senha,
      id_perfil: voluntarioPerfil._id as Types.ObjectId,
      image,
    });

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

    res.status(201).json({
      _id: user._id,
      username: user.nome,
      email: user.email,
      role: perfil,
      image: user.image,
      organizations,
      token: generateToken(user.id.toString()),
    });
  },

  // Login comum (todos os perfis)
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await usuarioRepository.findByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

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
        username: user.nome,
        email: user.email,
        role: perfil,
        image: user.image,
        organizations,
        token: generateToken(user.id.toString()),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Login exclusivo para Admin
  async loginAdmin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await usuarioRepository.findByEmail(email);

      if (!user)
        return res.status(401).json({ message: "Invalid email or password" });

      const isMatch = await user.matchPassword(password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid email or password" });

      const perfil = await Perfil.findById(user.id_perfil).lean().exec();
      if (!perfil || perfil.nome_perfil !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admin only." });
      }

      // 1) buscar links e extrair ids de organização
      const links = await OrganizacaoUsuario.find({ user_id: user._id })
        .select("organization_id")
        .lean()
        .exec();
      const orgIds = (links || [])
        .map((l: any) => l.organization_id)
        .filter(Boolean);

      if (orgIds.length === 0) {
        return res.json({
          _id: user._id,
          username: user.nome,
          email: user.email,
          role: perfil,
          image: user.image,
          organizations: [],
          token: generateToken(user.id.toString()),
        });
      }

      // 2) buscar organizações populadas (centros -> necessidades ; emergencias -> id_usuario, id_endereco)
      const populatedOrgs = await Organizacao.find({ _id: { $in: orgIds } })
        .populate({
          path: "centros", // virtual da Organizacao
          select: "nome telefone email address image id_centro createdAt",
          populate: {
            path: "necessidades", // virtual do Centro
            model: "Necessidade",
          },
        })
        .populate({
          path: "emergencias", // virtual da Organizacao
          model: "Emergencia",
          select:
            "titulo subtitulo descricao status data_inicio data_fim createdAt image id_endereco id_usuario",
          populate: [
            { path: "id_usuario", select: "-senha" },
            { path: "id_endereco" },
          ],
        })
        .lean() // opcional: remove overhead do mongoose; se virtuals não aparecerem, remova o .lean()
        .exec();

      // 3) manter ordem conforme orgIds (opcional)
      const orgMap = new Map(
        populatedOrgs.map((o: any) => [o._id.toString(), o]),
      );
      const orderedOrgs = orgIds
        .map((id: any) => orgMap.get(id.toString()))
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
          // inclui os relacionamentos populados
          centros: org.centros ?? [],
          emergencias: org.emergencias ?? [],
        }));

      // 4) responder
      res.json({
        _id: user._id,
        username: user.nome,
        email: user.email,
        role: perfil,
        image: user.image,
        organizations: orderedOrgs,
        token: generateToken(user.id.toString()),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  async getAllVoluntarios(req: Request, res: Response) {
    try {
      const voluntarioPerfil = await Perfil.findOne({
        nome_perfil: "Voluntario",
      }).lean();
      if (!voluntarioPerfil) {
        return res
          .status(404)
          .json({ error: "Perfil voluntario não encontrado" });
      }

      const allUsers = await UsuarioModel.find()
        .select("-senha")
        .populate({ path: "id_perfil", select: "nome_perfil descricao" })
        .lean();

      const users = allUsers.filter(
        (u: any) => u.id_perfil && u.id_perfil.nome_perfil === "Voluntario",
      );

      const userIds = users.map((u: any) => u._id);
      const allLinks = await OrganizacaoUsuario.find({
        user_id: { $in: userIds },
      })
        .populate<{ organization_id: any }>("organization_id")
        .lean()
        .exec();

      const orgsByUserId = allLinks.reduce((acc: any, link: any) => {
        const userId = link.user_id.toString();
        if (!acc[userId]) acc[userId] = [];
        if (link.organization_id) {
          acc[userId].push({
            _id: link.organization_id._id,
            name: link.organization_id.name,
            phone: link.organization_id.phone,
            email: link.organization_id.email,
            website: link.organization_id.website,
            short: link.organization_id.short,
            description: link.organization_id.description,
            logo: link.organization_id.logo,
            createdAt: link.organization_id.createdAt,
          });
        }
        return acc;
      }, {});

      const result = users.map((u: any) => ({
        _id: u._id,
        nome: u.nome,
        email: u.email,
        telefone: u.telefone,
        image: u.image,
        data_criacao: u.data_criacao,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        perfil: u.id_perfil,
        organizacoes: orgsByUserId[u._id.toString()] || [],
      }));

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao listar voluntários" });
    }
  },

  async getById(req: Request, res: Response) {
    const user = await usuarioRepository.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  },

  async linkUserOrganization(req: Request, res: Response) {
    const { userId, organizationId } = req.body;
    try {
      const updatedUser = await usuarioRepository.linkUserOrganization(
        userId,
        organizationId,
      );
      res.json(updatedUser);
    } catch (err: any) {
      res.status(500).json({
        message: err.message ?? "Erro ao vincular usuário à organização",
      });
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
        return res
          .status(400)
          .json({ message: "currentPassword and newPassword are required" });
      }

      const user = await UsuarioModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
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
