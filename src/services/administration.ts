import { request } from "./api";

export type AdminValue = string | number | boolean | string[] | null;
export type AdminOption = { value: string; label: string };
export type AdminField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  help: string;
  maxLength: number | null;
  options: AdminOption[];
};
export type AdminResource = {
  key: string;
  title: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  fields: AdminField[];
  columns: AdminOption[];
  detailFields: AdminOption[];
  count: number;
};
export type AdminRecord = {
  id: string;
  label: string;
  values: Record<string, AdminValue>;
  display: Record<string, unknown>;
  files: Record<string, string>;
  canEdit: boolean;
  canDelete: boolean;
};
export type AdminList = { items: AdminRecord[]; total: number; page: number; pageSize: number };

export const adminRoutes: Record<string, string> = {
  users: "usuarios", areas: "areas", cycles: "prazos", groups: "grupos", permissions: "permissoes",
  activities: "relatos", photos: "fotos", reports: "relatorios", sections: "secoes", cards: "cards",
  versions: "versoes", audit: "auditoria",
};
export const adminDescriptions: Record<string, string> = {
  users: "Cadastre pessoas, defina perfis e áreas e atualize senhas e acessos.",
  areas: "Organize as áreas e mantenha os cadastros ativos ou inativos.",
  cycles: "Crie ciclos, ajuste datas, encerre a coleta ou reabra com justificativa.",
  groups: "Organize grupos e suas permissões de acesso ao Django Admin.",
  permissions: "Consulte as permissões técnicas disponíveis para atribuição a usuários e grupos.",
  activities: "Consulte os relatos originais, autores, áreas e ciclos.",
  photos: "Consulte as imagens enviadas e os relatos aos quais pertencem.",
  reports: "Acompanhe o relatório mosaico que reúne os relatos selecionados em uma única entrega.",
  sections: "Consulte a organização dos relatórios por área.",
  cards: "Consulte os textos editoriais, a ordem e os cards retirados.",
  versions: "Acesse os PDFs e os dados de cada versão gerada.",
  audit: "Acompanhe quem realizou cada operação e quando ela ocorreu.",
};
const path = (resource: string, id?: string) =>
  `/administration/${encodeURIComponent(resource)}${id ? `/${encodeURIComponent(id)}` : ""}`;

export const administration = {
  resources: () => request<AdminResource[]>("/administration/resources"),
  list: (resource: string, q = "", page = 1) =>
    request<AdminList>(`${path(resource)}?${new URLSearchParams({ q, page: String(page) })}`),
  get: (resource: string, id: string) => request<AdminRecord>(path(resource, id)),
  save: (resource: string, values: Record<string, AdminValue>, id?: string) =>
    request<AdminRecord>(path(resource, id), { method: id ? "PUT" : "POST", body: JSON.stringify({ values }) }),
  remove: (resource: string, id: string) => request<{ detail: string }>(path(resource, id), { method: "DELETE" }),
};
