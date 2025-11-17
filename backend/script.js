// scripts/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/tg_db";

async function main() {
  await mongoose.connect(MONGO, {});

  console.log("Connected to", MONGO);

  // quick helper to drop collection if exists
  async function dropIfExists(name) {
    const exists = await mongoose.connection.db
      .listCollections({ name })
      .hasNext();
    if (exists) {
      await mongoose.connection.db.dropCollection(name);
      console.log("Dropped collection", name);
    }
  }

  // Drop collections if present (safe for reruns)
  const toDrop = [
    "enderecos",
    "perfis",
    "usuarios",
    "organizacoes",
    "centros",
    "centros_administradores",
    "emergencias",
    "emergencias_centros",
    "postagens_demanda",
    "necessidades",
    "postagens_necessidades",
    "intencao_doacao",
    "atividades",
    "atividades_voluntario",
    "rotas_seguras",
  ];
  for (const c of toDrop) await dropIfExists(c);

  // Prepare fixed ObjectIds for references (makes data deterministic)
  const addr1 = new ObjectId("000000000000000000000101");
  const addr2 = new ObjectId("000000000000000000000102");
  const addr3 = new ObjectId("000000000000000000000201");

  const org1 = new ObjectId("000000000000000000000010");
  const org2 = new ObjectId("000000000000000000000011");

  const centro1 = new ObjectId("000000000000000000000001");
  const centro2 = new ObjectId("000000000000000000000002");
  const centro3 = new ObjectId("000000000000000000000003");

  const perfilAdmin = new ObjectId("000000000000000000000001");
  const perfilUser = new ObjectId("000000000000000000000002");

  const user1 = new ObjectId("000000000000000000000A01");
  const user2 = new ObjectId("000000000000000000000A02");

  const emerg1 = new ObjectId("0000000000000000000003E9"); // 1001
  const emerg2 = new ObjectId("0000000000000000000003EA"); // 1002

  const postagem1 = new ObjectId("000000000000000000000BB9"); // 3001

  const neces1 = new ObjectId("0000000000000000000007D1"); //2001
  const neces2 = new ObjectId("0000000000000000000007D2"); //2002
  const neces3 = new ObjectId("000000000000000000000BB9"); // placeholder

  // Create documents (payloads "prontos" como viriam da API)
  const enderecos = [
    {
      _id: addr1,
      id_endereco: 101,
      logradouro: "Av. Navegantes",
      numero: "123",
      complemento: "Próximo à praça",
      bairro: "Navegantes",
      cidade: "Porto Alegre",
      estado: "RS",
      pais: "Brasil",
      cep: "90000-000",
      latitude: -30.0123,
      longitude: -51.2,
    },
    {
      _id: addr2,
      id_endereco: 102,
      logradouro: "R. do Esporte",
      numero: "500",
      complemento: null,
      bairro: "Restinga",
      cidade: "Porto Alegre",
      estado: "RS",
      pais: "Brasil",
      cep: "91700-000",
      latitude: -30.11,
      longitude: -51.25,
    },
    {
      _id: addr3,
      id_endereco: 201,
      logradouro: "R. Exemplo",
      numero: "10",
      complemento: null,
      bairro: "Sapopemba",
      cidade: "São Paulo",
      estado: "SP",
      pais: "Brasil",
      cep: "08000-000",
      latitude: -23.5505,
      longitude: -46.6333,
    },
  ];

  const perfis = [
    {
      _id: perfilAdmin,
      id_perfil: 1,
      nome_perfil: "Administrador",
      descricao: "Admin",
    },
    {
      _id: perfilUser,
      id_perfil: 2,
      nome_perfil: "Cidadão",
      descricao: "Usuário comum",
    },
  ];

  const usuarios = [
    {
      _id: user1,
      id_usuario: 100,
      nome: "Admin Mock",
      email: "admin@mock.local",
      senha: "hashed-password-mock",
      telefone: "(51) 99999-0001",
      id_perfil: perfis[0]._id,
      id_endereco: addr1,
      data_criacao: new Date(),
    },
    {
      _id: user2,
      id_usuario: 101,
      nome: "Voluntario Mock",
      email: "voluntario@mock.local",
      senha: "hashed-password-mock",
      telefone: "(51) 99999-0002",
      id_perfil: perfis[1]._id,
      id_endereco: addr2,
      data_criacao: new Date(),
    },
  ];

  const organizacoes = [
    {
      _id: org1,
      id_organizacao: 10,
      nome: "ONG Porto Solidário",
      id_endereco: addr1,
      telefone: "(51) 3099-1122",
      descricao: "ONG focada em resposta a emergências climáticas em POA",
      email: "contato@portosolidario.org",
      site: "https://portosolidario.org",
      tipo: "ONG",
    },
    {
      _id: org2,
      id_organizacao: 11,
      nome: "Prefeitura POA - Defesa Civil",
      id_endereco: addr2,
      telefone: "(51) 4000-0000",
      descricao: "Órgão público de coordenação de ações emergenciais",
      email: "defesacivil@poa.gov.br",
      site: "https://poa.gov.br",
      tipo: "Pública",
    },
  ];

  const centros = [
    {
      _id: centro1,
      id_centro: 1,
      nome_centro: "Centro Comunitário Navegantes",
      id_organizacao: org1,
      id_endereco: addr1,
      descricao: "Local de acolhimento e distribuição de alimentos",
      telefone: "(51) 3345-8721",
      email: "centrocnavegantes@gmail.com",
    },
    {
      _id: centro2,
      id_centro: 2,
      nome_centro: "Ginásio da Restinga",
      id_organizacao: org2,
      id_endereco: addr2,
      descricao: "Ginásio adaptado para abrigar desalojados",
      telefone: "(51) 3267-4450",
      email: null,
    },
    {
      _id: centro3,
      id_centro: 3,
      nome_centro: "Cultural Sapopemba",
      id_organizacao: org2,
      id_endereco: addr3,
      descricao: "Centro cultural que recebe doações",
      telefone: "(11) 9999-0000",
      email: "sapopemba@prefeitura.sp.gov.br",
    },
  ];

  const centros_administradores = [
    {
      _id: new ObjectId(),
      id_centro_administrador: 9001,
      id_centro: centro1,
      id_usuario: user1,
      data_inicio: new Date(),
      status: "ativo",
    },
  ];

  const emergencias = [
    {
      _id: emerg1,
      id_emergencia: 1001,
      titulo: "Enchente em Porto Alegre",
      subtitulo: "Áreas centrais e periféricas afetadas",
      descricao:
        "Chuvas intensas causaram transbordamento de rios e alagamentos.",
      id_endereco: addr1,
      data_inicio: new Date("2025-10-02T02:00:00Z"),
      data_fim: null,
      urgencia: "alta",
      status: "ativa",
      id_usuario: user1,
    },
    {
      _id: emerg2,
      id_emergencia: 1002,
      titulo: "Deslizamento Zona Leste - SP",
      subtitulo: "Deslizamento atinge residências",
      descricao: "Deslizamento causado por chuva forte.",
      id_endereco: addr2,
      data_inicio: new Date("2025-09-30T23:00:00Z"),
      data_fim: null,
      urgencia: "alta",
      status: "ativa",
      id_usuario: user2,
    },
  ];

  const emergencias_centros = [
    {
      _id: new ObjectId(),
      id_emergencia_organizacao: 5001,
      id_emergencia: emerg1,
      id_centro: centro1,
    },
    {
      _id: new ObjectId(),
      id_emergencia_organizacao: 5002,
      id_emergencia: emerg1,
      id_centro: centro2,
    },
  ];

  const postagens_demanda = [
    {
      _id: postagem1,
      id_postagem: 3001,
      id_emergencia: emerg1,
      id_centro: centro1,
      titulo: "Kits de Higiene Urgentes 🧴",
      descricao:
        "As famílias precisam de 300 kits de higiene (sabonete, pasta, escova, absorventes).",
      data_criacao: new Date(),
      data_validade: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
      status: "ativa",
    },
  ];

  const necessidades = [
    {
      _id: neces1,
      id_necessidade: 2001,
      id_emergencia: emerg1,
      id_centro: centro1,
      nome_recurso: "Kits de Higiene Pessoal",
      descricao: "Sabonete, escova de dente, pasta, absorventes",
      tipo_voluntariado: "doacao",
      quantidade_necessaria: 300,
      quantidade_intencao: 12,
      status: "aberta",
    },
    {
      _id: neces2,
      id_necessidade: 2002,
      id_emergencia: emerg1,
      id_centro: centro1,
      nome_recurso: "Água potável (galões)",
      descricao: "Galões 20L para cozinha coletiva",
      tipo_voluntariado: "doacao",
      quantidade_necessaria: 50,
      quantidade_intencao: 5,
      status: "aberta",
    },
  ];

  const postagens_necessidades = [
    {
      _id: new ObjectId(),
      id_postagens_necessidades: 8001,
      id_mensagem: postagem1,
      id_necessidade: neces1,
    },
    {
      _id: new ObjectId(),
      id_postagens_necessidades: 8002,
      id_mensagem: postagem1,
      id_necessidade: neces2,
    },
  ];

  const intencao_doacao = [
    {
      _id: new ObjectId(),
      id_intencao: 7001,
      id_necessidade: neces1,
      id_usuario: user2,
      data_intencao: new Date(),
      quantidade: 2,
      status: "pendente",
    },
  ];

  const atividades = [
    {
      _id: new ObjectId(),
      id_atividade: 6001,
      titulo: "Mutirão de Limpeza",
      descricao: "Ação voluntária para limpeza de áreas atingidas.",
      id_centro: centro1,
      data_inicio: new Date(),
      data_fim: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
      urgencia: "media",
      status: "aberta",
      tipo_atividade: "voluntariado",
    },
  ];

  const atividades_voluntario = [
    {
      _id: new ObjectId(),
      id_atividade_voluntario: 9001,
      id_atividade: atividades[0]._id,
      id_usuario: user2,
      data_inscricao: new Date(),
      status: "inscrito",
    },
  ];

  const rotas_seguras = [
    {
      _id: new ObjectId(),
      id_rota: 4001,
      id_centro: centro1,
      id_emergencia: emerg1,
      ponto_inicio: "R. A",
      ponto_fim: "R. B",
      descricao: "Rota alternativa segura",
      tempo_estimado: "15m",
      distancia_estimado: "2km",
      status: "ativa",
    },
  ];

  // Insert into DB (collection names match DER)
  const db = mongoose.connection.db;
  await db.collection("enderecos").insertMany(enderecos);
  console.log("Inserted enderecos");

  await db.collection("perfis").insertMany(perfis);
  console.log("Inserted perfis");

  await db.collection("usuarios").insertMany(usuarios);
  console.log("Inserted usuarios");

  await db.collection("organizacoes").insertMany(organizacoes);
  console.log("Inserted organizacoes");

  await db.collection("centros").insertMany(centros);
  console.log("Inserted centros");

  await db
    .collection("centros_administradores")
    .insertMany(centros_administradores);
  console.log("Inserted centros_administradores");

  await db.collection("emergencias").insertMany(emergencias);
  console.log("Inserted emergencias");

  await db.collection("emergencias_centros").insertMany(emergencias_centros);
  console.log("Inserted emergencias_centros");

  await db.collection("postagens_demanda").insertMany(postagens_demanda);
  console.log("Inserted postagens_demanda");

  await db.collection("necessidades").insertMany(necessidades);
  console.log("Inserted necessidades");

  await db
    .collection("postagens_necessidades")
    .insertMany(postagens_necessidades);
  console.log("Inserted postagens_necessidades");

  await db.collection("intencao_doacao").insertMany(intencao_doacao);
  console.log("Inserted intencao_doacao");

  await db.collection("atividades").insertMany(atividades);
  console.log("Inserted atividades");

  await db
    .collection("atividades_voluntario")
    .insertMany(atividades_voluntario);
  console.log("Inserted atividades_voluntario");

  await db.collection("rotas_seguras").insertMany(rotas_seguras);
  console.log("Inserted rotas_seguras");

  console.log("Seeding complete ✅");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Error in seeding:", err);
  process.exit(1);
});
