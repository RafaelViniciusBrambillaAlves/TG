import { Emergencia } from "@/hooks/getEmergencias";

// app/mocks.ts
export type Post = {
  _id?: string;
  id_emergencia?: string;
  id_centro?: string;
  titulo?: string;
  descricao?: string;
  data_criacao?: Date;
  data_validade?: Date;
  status?: string;
  image?: string;
  timeLabel?: string;
  centro?: any[]; // referência
  necessidades?: any[]; // referência para múltiplas necessidades
  usuario?: any;
};

export const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    authorPersonName: "Mariana Oliveira",
    authorAvatar: "https://i.pravatar.cc/80?img=12",
    authorOrgId: "o1",
    title: "Campanha de Inverno 2025",
    description:
      "Estamos arrecadando roupas e cobertores para famílias em regiões afetadas. Doe e compartilhe com sua rede!",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgZyGIpceLLLkeB2Ex1jDe_2MvDd3eExaeZw&s",
    createdAt: "2025-01-10T08:00:00.000Z",
    saved: false,
    sharedCount: 12,
    // legacy:
    authorName: "ONG Ajuda Já",
  },
  {
    id: "p2",
    authorPersonName: "Carlos Almeida",
    authorAvatar: "https://i.pravatar.cc/80?img=30",
    authorOrgId: "o2",
    title: "Mutirão de Limpeza",
    description:
      "Encontro no sábado às 09:00 — traga luvas e disposição! Vamos cuidar do nosso bairro.",
    createdAt: "2024-12-30T09:00:00.000Z",
    saved: true,
    sharedCount: 4,
    authorName: "Centro Comunidade Sol",
  },
];

/* ONGs: entidade organizacional separada */
export type ONG = {
  _id?: string;
  id: string;
  name: string;
  short?: string;
  description?: string;
  phone?: string;
  email?: string;
  logo?: string;
  website?: string;
};

export const MOCK_ONGS: ONG[] = [
  {
    id: "o1",
    name: "Abrigo Esperança1",
    short: "Abrigo Esperanç1a",
    description: "Acolhimento temporário e distribuição de itens emergenciais.",
    phone: "+55 21 91234-5678",
    email: "ajuda@abrigoesperanca.org",
    logo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=60&auto=format&fit=crop",
    website: "https://abrigoesperanca.example.org",
  },
  {
    id: "o2",
    name: "Centro Comunitário Sol",
    short: "Centro Sol",
    description:
      "Atividades comunitárias, abrigo e coordenação de voluntários.",
    phone: "+55 11 98765-4321",
    email: "contato@centrosol.org",
    logo: "https://i.pravatar.cc/80?img=30",
    website: "https://centrosol.example.org",
  },
  {
    id: "o3",
    name: "Centro de Doações Vida",
    short: "Vida Doações",
    description: "Recebimento, triagem e distribuição de doações locais.",
    phone: "+55 31 99876-5432",
    email: "info@vidadoacoes.org",
    logo: "https://i.pravatar.cc/80?img=66",
    website: "https://vidadoacoes.example.org",
  },
  {
    id: "o4",
    name: "Minha ONG Exemplo",
    short: "Minha ONG",
    description: "Ações sociais focadas em crianças e famílias vulneráveis.",
    phone: "+55 11 99999-0000",
    email: "contato@minhaong.org",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9w9esuiNKFyR18nOe8A-1DzT9ewLn8C5k0A&s",
    website: "https://minhaong.example.org",
  },
];

/* CENTERS */
export type Center = {
  id: string;
  orgId?: string; // referencia para a ONG dona desse centro
  nome: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  image?: string;
};

export const MOCK_CENTERS: Center[] = [
  // 🟢 ONG o1 — Abrigo Esperança
  {
    id: "c1",
    orgId: "o1",
    name: "Abrigo Esperança - Unidade Central",
    description:
      "Acolhimento temporário para famílias afetadas por emergências.",
    phone: "+55 21 91234-5678",
    email: "contato@abrigoesperanca.org",
    address: "Rua Esperança, 100 — Centro, Rio de Janeiro - RJ",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=60&auto=format&fit=crop",
  },
  {
    id: "c2",
    orgId: "o1",
    name: "Abrigo Esperança - Zona Norte",
    description: "Distribuição de alimentos e roupas para comunidades locais.",
    phone: "+55 21 99888-1234",
    email: "zona.norte@abrigoesperanca.org",
    address: "Av. dos Andradas, 420 — Zona Norte, Rio de Janeiro - RJ",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=60&auto=format&fit=crop",
  },

  // 🟢 ONG o2 — Centro Comunitário Sol
  {
    id: "c3",
    orgId: "o2",
    name: "Centro Sol - Sede Leste",
    description:
      "Espaço de convivência e oficinas de capacitação profissional.",
    phone: "+55 11 98765-4321",
    email: "contato@centrosol.org",
    address: "Rua Aurora, 55 — São Mateus, São Paulo - SP",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=60&auto=format&fit=crop",
  },
  {
    id: "c4",
    orgId: "o2",
    name: "Centro Sol - Jardim Luz",
    description: "Atendimento a famílias e apoio psicossocial.",
    phone: "+55 11 98888-2222",
    email: "jardimluz@centrosol.org",
    address: "Rua do Sol, 300 — Jardim Luz, São Paulo - SP",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=60&auto=format&fit=crop",
  },

  // 🟢 ONG o3 — Centro de Doações Vida
  {
    id: "c5",
    orgId: "o3",
    name: "Vida Doações - Unidade Central",
    description: "Triagem e armazenamento de doações de alimentos e roupas.",
    phone: "+55 31 99876-5432",
    email: "info@vidadoacoes.org",
    address: "Av. Contorno, 900 — Centro, Belo Horizonte - MG",
    image:
      "https://images.unsplash.com/photo-1576765607924-b9c9b4e5b39c?w=800&q=60&auto=format&fit=crop",
  },
  {
    id: "c6",
    orgId: "o3",
    name: "Vida Doações - Norte",
    description: "Apoio emergencial a famílias em situação de vulnerabilidade.",
    phone: "+55 31 97777-1111",
    email: "norte@vidadoacoes.org",
    address: "Rua Primavera, 145 — Pampulha, Belo Horizonte - MG",
    image:
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=60&auto=format&fit=crop",
  },

  // 🟢 ONG o4 — Minha ONG Exemplo
  {
    id: "c7",
    orgId: "o4",
    name: "Centro Comunitário Minha ONG 1",
    description: "Atividades comunitárias, cursos e apoio social.",
    phone: "+55 11 98765-4321",
    email: "contato@minhaong.org",
    address: "Av. das Flores, 123 — Centro, São Paulo - SP",
    image:
      "https://s2.glbimg.com/LV3rOj_SBbGk3icxrDJa42C_sZU=/smart/e.glbimg.com/og/ed/f/original/2021/06/16/galpaocasa1_231-768x512.jpg",
  },
  {
    id: "c8",
    orgId: "o4",
    name: "Centro Comunitário Minha ONG 2",
    description:
      "Apoio emergencial e pernoite para famílias em vulnerabilidade.",
    phone: "+55 21 91234-5678",
    email: "ajuda@minhaong.org",
    address: "Rua das Américas, 456 — Tijuca, Rio de Janeiro - RJ",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=60&auto=format&fit=crop",
  },
  {
    id: "c9",
    orgId: "o4",
    name: "Centro Comunitário Minha ONG 3",
    description: "Recebimento e distribuição de doações locais.",
    phone: "+55 31 99876-5432",
    email: "info@minhaong.org",
    address: "Av. Afonso Pena, 789 — Centro, Belo Horizonte - MG",
    image:
      "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=800&q=60&auto=format&fit=crop",
  },
];

/* Emergências */
export type Emergency = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  address?: string;
  status?: "Aberta" | "Em andamento" | "Fechada";
  createdAt: string;
  authorName?: string;
  helpingOrgs?: string[]; // lista de ids de ONG (ex: ['o1','o2'])
};

export const MOCK_EMERGENCIES: Emergency[] = [
  {
    id: "e1",
    title: "Inundação na Rua das Flores",
    subtitle: "Necessidade de voluntários e doações",
    description:
      "Alagamento em vários pontos do bairro após forte chuva. Precisamos de ajuda com alimentos não perecíveis, cobertores e apoio na limpeza.",
    image:
      "https://s5.static.brasilescola.uol.com.br/be/2024/05/pessoas-andando-pelas-ruas-da-cidade-em-um-contexto-de-inundacao-com-agua-proximo-ao-quadril.jpg",
    address: "Rua das Flores, 120 — Bairro Central",
    status: "Aberta",
    createdAt: "2025-02-18T12:00:00.000Z",
    authorName: "ONG Ajuda Já",
    helpingOrgs: ["o1", "o2"],
  },
  {
    id: "e2",
    title: "Incêndio em galpão",
    subtitle: "Equipe de resgate no local",
    description:
      "Pequeno incêndio em depósito. Necessário apoio para acolhimento temporário das famílias afetadas e doações de roupas.",
    image:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=60&auto=format&fit=crop",
    address: "Av. Industrial, 450 — Distrito Industrial",
    status: "Em andamento",
    createdAt: "2025-02-16T09:00:00.000Z",
    authorName: "Você (test)",
    helpingOrgs: ["o4", "o3"],
  },
  {
    id: "e3",
    title: "Vítimas de desabamento",
    subtitle: "Ajuda médica e abrigo",
    description:
      "Pequeno desabamento residencial. Procuramos doações e voluntários com treinamento em primeiros socorros.",
    address: "Trav. do Sol, 21 — Vila Nova",
    status: "Aberta",
    createdAt: "2025-02-12T08:00:00.000Z",
    authorName: "Comunidade Local",
    helpingOrgs: ["o4"],
  },
];

/* NEEDS (necessidades) */
export type Need = {
  _id?: string;
  title: string;
  description: string;
  type: "Doação" | "Voluntário" | "Serviço" | "Outro";
  quantity?: string;
  status: "Aberta" | "Parcial" | "Atendida";
  centerId: string;
  emergencyId: Emergencia;
  createdAt: string;
  image: string;
  interestCount?: number;
  interest: Array<string>;
};

export const MOCK_NEEDS: Need[] = [
  {
    _id: "n1",
    title: "Roupas de frio (adulto)",
    description: "Casacos e cobertores para famílias afetadas pela enchente.",
    type: "Doação",
    quantity: "100 unidades",
    status: "Aberta",
    centerId: "c1",
    emergencyId: "e1",
    createdAt: "2025-02-18T12:20:00.000Z",
    interestCount: 14,
  },
  {
    _id: "n2",
    title: "Voluntários para limpeza",
    description: "Equipe para ajudar na triagem e limpeza do local.",
    type: "Voluntário",
    quantity: "20 pessoas",
    status: "Parcial",
    centerId: "c2",
    emergencyId: "e1",
    createdAt: "2025-02-18T12:30:00.000Z",
    interestCount: 6,
  },
  {
    _id: "n3",
    title: "Mantas e cobertores",
    description: "Doação prioritária para abrigos temporários.",
    type: "Doação",
    quantity: "200 unidades",
    status: "Aberta",
    centerId: "c3",
    emergencyId: undefined,
    createdAt: "2025-02-12T10:00:00.000Z",
    interestCount: 2,
  },
  {
    _id: "n4",
    title: "Alimentos não perecíveis",
    description: "Arroz, feijão e enlatados para famílias atendidas.",
    type: "Doação",
    quantity: "50 cestas",
    status: "Aberta",
    centerId: "c7",
    emergencyId: undefined,
    createdAt: "2025-10-24T10:00:00.000Z",
    interestCount: 3,
  },
  {
    _id: "n5",
    title: "Voluntários para apoio escolar",
    description: "Ajudar crianças com reforço escolar no centro comunitário.",
    type: "Voluntário",
    quantity: "10 pessoas",
    status: "Aberta",
    centerId: "c8",
    emergencyId: undefined,
    createdAt: "2025-10-24T10:30:00.000Z",
    interestCount: 2,
  },
  {
    _id: "n6",
    title: "Materiais de higiene",
    description: "Sabonetes, shampoo, absorventes para famílias atendidas.",
    type: "Doação",
    quantity: "100 unidades",
    status: "Aberta",
    centerId: "c9",
    emergencyId: undefined,
    createdAt: "2025-10-24T11:00:00.000Z",
    interestCount: 1,
  },
];

/* VOLUNTÁRIOS */
export type Volunteer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  birthDate?: string;
  interestArea?: string;
};

export const MOCK_VOLUNTEERS: Volunteer[] = [
  {
    id: "v1",
    name: "Ana Silva",
    email: "ana.silva@example.org",
    phone: "+55 11 91234-5678",
    address: "Rua das Laranjeiras, 45 — São Paulo, SP",
    avatar: "https://i.pravatar.cc/80?img=5",
    birthDate: "1995-03-12",
    interestArea: "Educação",
  },
  {
    id: "v2",
    name: "Carlos Souza",
    email: "carlos.souza@example.org",
    phone: "+55 21 99876-5432",
    address: "Av. Brasil, 100 — Rio de Janeiro, RJ",
    avatar: "https://i.pravatar.cc/80?img=15",
    birthDate: "1990-07-25",
    interestArea: "Saúde",
  },
  {
    id: "v3",
    name: "Beatriz Lima",
    email: "beatriz.lima@example.org",
    avatar: "https://i.pravatar.cc/80?img=20",
    interestArea: "Apoio Social",
  },
];
