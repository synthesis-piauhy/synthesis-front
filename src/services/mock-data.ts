import type {
  ActivityReport,
  Area,
  AuditEvent,
  CollectionOverview,
  Notification,
  User,
  WeeklyCycle,
  WeeklyReport,
} from "@/types";

export const areas: Area[] = [
  "Agro",
  "Gastronomia",
  "Indústria e Móveis",
  "Moda",
  "Educação",
  "Jornadas Empresariais",
];

export const users: User[] = [
  { id: "u1", name: "Ana Martins", email: "ana@synthesis.local", area: "Agro", role: "gestor", active: true },
  { id: "u2", name: "Bruno Rocha", email: "bruno@synthesis.local", area: "Gastronomia", role: "gestor", active: true },
  { id: "u3", name: "Carla Nunes", email: "carla@synthesis.local", area: "Indústria e Móveis", role: "gestor", active: true },
  { id: "u4", name: "Daniela Costa", email: "daniela@synthesis.local", area: "Moda", role: "gestor", active: true },
  { id: "u5", name: "Elisa Prado", email: "elisa@synthesis.local", area: "Educação", role: "gestor", active: true },
  { id: "u6", name: "Fabio Lima", email: "fabio@synthesis.local", area: "Jornadas Empresariais", role: "gestor", active: true },
  { id: "u7", name: "Marina Alves", email: "marina@synthesis.local", area: "Educação", role: "gerente", active: true },
  { id: "u8", name: "Rafael Torres", email: "rafael@synthesis.local", area: "Jornadas Empresariais", role: "admin", active: true },
];

export const cycles: WeeklyCycle[] = [
  {
    id: "c1",
    label: "17 a 21 de agosto de 2026",
    startsAt: "2026-08-17",
    endsAt: "2026-08-21",
    deadline: "2026-08-21T18:00:00-03:00",
    status: "aberta",
  },
  {
    id: "c2",
    label: "10 a 14 de agosto de 2026",
    startsAt: "2026-08-10",
    endsAt: "2026-08-14",
    deadline: "2026-08-14T18:00:00-03:00",
    status: "encerrada",
  },
  {
    id: "c3",
    label: "03 a 07 de agosto de 2026",
    startsAt: "2026-08-03",
    endsAt: "2026-08-07",
    deadline: "2026-08-08T12:00:00-03:00",
    status: "reaberta",
  },
];

const photo = (id: string, index: number, name: string, isMain = false) => ({
  id,
  url: `/placeholders/foto-${index}.svg`,
  name,
  isMain,
  alt: name,
});

export const activityReports: ActivityReport[] = [
  {
    id: "a1",
    title: "Visita técnica a produtores rurais",
    date: "2026-08-17",
    location: "Zona rural",
    summary: "Acompanhamento de pequenas propriedades para registrar demandas de manejo e comercialização.",
    result: "Produtores alinharam ajustes de armazenamento e definiram próximos registros de produção.",
    beneficiaries: "18 produtores rurais",
    area: "Agro",
    managerId: "u1",
    cycleId: "c1",
    photos: [photo("p1", 1, "Equipe em visita técnica", true), photo("p2", 2, "Registro de produção")],
    createdAt: "2026-08-17T15:00:00-03:00",
    updatedAt: "2026-08-17T15:00:00-03:00",
  },
  {
    id: "a2",
    title: "Oficina de boas práticas para restaurantes",
    date: "2026-08-18",
    location: "Centro de capacitação",
    summary: "Encontro prático sobre organização de cozinha, atendimento e padronização de processos.",
    result: "Participantes revisaram rotinas de higiene e criaram uma lista de melhorias imediatas.",
    beneficiaries: "24 empreendedores de alimentação",
    area: "Gastronomia",
    managerId: "u2",
    cycleId: "c1",
    photos: [photo("p3", 3, "Oficina de gastronomia", true)],
    createdAt: "2026-08-18T16:00:00-03:00",
    updatedAt: "2026-08-18T16:00:00-03:00",
  },
  {
    id: "a3",
    title: "Consultoria para indústria moveleira",
    date: "2026-08-19",
    location: "Distrito industrial",
    summary: "Diagnóstico de fluxo produtivo em oficina de móveis sob medida.",
    result: "A empresa identificou gargalos no corte e passou a registrar desperdícios por lote.",
    beneficiaries: "1 empresa e 12 colaboradores",
    area: "Indústria e Móveis",
    managerId: "u3",
    cycleId: "c1",
    photos: [photo("p4", 4, "Ambiente de consultoria", true), photo("p5", 5, "Detalhe de materiais")],
    createdAt: "2026-08-19T11:00:00-03:00",
    updatedAt: "2026-08-19T11:00:00-03:00",
  },
  {
    id: "a4",
    title: "Encontro de empreendedoras da moda",
    date: "2026-08-20",
    location: "Auditório central",
    summary: "Roda de conversa sobre precificação, apresentação de coleções e canais de venda.",
    result: "O grupo saiu com propostas de vitrine colaborativa e agenda de mentoria coletiva.",
    beneficiaries: "32 empreendedoras",
    area: "Moda",
    managerId: "u4",
    cycleId: "c1",
    photos: [photo("p6", 6, "Encontro de moda", true)],
    createdAt: "2026-08-20T17:00:00-03:00",
    updatedAt: "2026-08-20T17:00:00-03:00",
  },
  {
    id: "a5",
    title: "Formação de professores empreendedores",
    date: "2026-08-11",
    location: "Escola de formação",
    summary: "Atividade sobre projetos pedagógicos conectados a problemas locais.",
    result: "Professores estruturaram propostas de aprendizagem com aplicação comunitária.",
    beneficiaries: "27 professores",
    area: "Educação",
    managerId: "u5",
    cycleId: "c2",
    photos: [photo("p7", 2, "Formação de professores", true)],
    createdAt: "2026-08-11T10:00:00-03:00",
    updatedAt: "2026-08-11T10:00:00-03:00",
  },
  {
    id: "a6",
    title: "Jornada de capacitação empresarial",
    date: "2026-08-12",
    location: "Sala multiuso",
    summary: "Capacitação sobre organização financeira para pequenos negócios.",
    result: "Empreendedores criaram planilhas simples de custos e agenda de revisão mensal.",
    beneficiaries: "36 participantes",
    area: "Jornadas Empresariais",
    managerId: "u6",
    cycleId: "c2",
    photos: [photo("p8", 1, "Jornada empresarial", true), photo("p9", 4, "Dinâmica em grupo")],
    createdAt: "2026-08-12T14:00:00-03:00",
    updatedAt: "2026-08-12T14:00:00-03:00",
  },
];

export const weeklyReports: WeeklyReport[] = [
  {
    id: "r1",
    cycleId: "c1",
    status: "em_edicao",
    selectedActivityIds: ["a1", "a2", "a3", "a4"],
    sections: areas.slice(0, 4).map((area, areaIndex) => ({
      id: `s${areaIndex + 1}`,
      area,
      title: area,
      order: areaIndex,
      cards: activityReports
        .filter((activity) => activity.area === area && activity.cycleId === "c1")
        .map((activity, order) => ({
          id: `card-${activity.id}`,
          activityReportId: activity.id,
          editorialTitle: activity.title,
          editorialSummary: activity.summary,
          editorialResult: activity.result,
          selectedPhotoId: activity.photos.find((item) => item.isMain)?.id ?? activity.photos[0].id,
          area: activity.area,
          originalDate: activity.date,
          order,
          removed: false,
        })),
    })),
    versions: [],
    updatedAt: "2026-08-21T12:00:00-03:00",
  },
  {
    id: "r2",
    cycleId: "c2",
    status: "pdf_gerado",
    selectedActivityIds: ["a5", "a6"],
    sections: [],
    versions: [
      { id: "v1", version: 1, generatedAt: "2026-08-15T10:00:00-03:00", generatedBy: "u7", pdfUrl: "/relatorios/r2" },
      { id: "v2", version: 2, generatedAt: "2026-08-15T15:30:00-03:00", generatedBy: "u7", pdfUrl: "/relatorios/r2" },
    ],
    updatedAt: "2026-08-15T15:30:00-03:00",
  },
];

export const overview: CollectionOverview = {
  cycle: cycles[0],
  submittedManagers: users.filter((user) => ["u1", "u2", "u3", "u4"].includes(user.id)),
  pendingManagers: users.filter((user) => ["u5", "u6"].includes(user.id)),
  totalReports: 4,
  reportStatus: "em_edicao",
};

export const notifications: Notification[] = [
  { id: "n1", userId: "u7", message: "Há gestores pendentes na coleta atual.", read: false, createdAt: "2026-08-20T09:00:00-03:00" },
];

export const auditEvents: AuditEvent[] = [
  { id: "e1", actorId: "u7", action: "Gerou versão 2 do relatório", entity: "r2", createdAt: "2026-08-15T15:30:00-03:00" },
];
