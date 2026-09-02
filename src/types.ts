export type UserRole = "gestor" | "gerente" | "admin";

export type Area =
  | "Agro"
  | "Gastronomia"
  | "Indústria e Móveis"
  | "Moda"
  | "Educação"
  | "Jornadas Empresariais";

export type CollectionStatus = "aberta" | "encerrada" | "reaberta";
export type ReportStatus = "nao_iniciado" | "em_selecao" | "rascunho" | "em_edicao" | "pdf_gerado";

export type User = {
  id: string;
  name: string;
  email: string;
  area: Area | null;
  role: UserRole;
  active: boolean;
};

export type WeeklyCycle = {
  id: string;
  label: string;
  startsAt: string;
  endsAt: string;
  deadline: string;
  status: CollectionStatus;
};

export type ActivityPhoto = {
  id: string;
  url: string;
  name: string;
  isMain: boolean;
  alt: string;
};

export type ActivityReport = {
  id: string;
  title: string;
  date: string;
  location: string;
  summary: string;
  result: string;
  beneficiaries: string;
  area: Area;
  managerId: string;
  cycleId: string;
  photos: ActivityPhoto[];
  createdAt: string;
  updatedAt: string;
};

export type ReportCard = {
  id: string;
  activityReportId: string;
  editorialTitle: string;
  editorialSummary: string;
  editorialResult: string;
  selectedPhotoId: string;
  area: Area;
  originalDate: string;
  order: number;
  removed: boolean;
};

export type ReportSection = {
  id: string;
  area: Area;
  title: string;
  order: number;
  cards: ReportCard[];
};

export type ReportVersion = {
  id: string;
  version: number;
  generatedAt: string;
  generatedBy: string;
  pdfUrl: string;
};

export type WeeklyReport = {
  id: string;
  cycleId: string;
  status: ReportStatus;
  selectedActivityIds: string[];
  sections: ReportSection[];
  versions: ReportVersion[];
  updatedAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  createdAt: string;
};

export type CollectionOverview = {
  cycle: WeeklyCycle;
  submittedManagers: User[];
  pendingManagers: User[];
  totalReports: number;
  reportStatus: ReportStatus;
};
