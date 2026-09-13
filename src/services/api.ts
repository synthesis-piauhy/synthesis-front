import type {
  ActivityReport,
  Area,
  CollectionOverview,
  ReportCard,
  ReportVersion,
  User,
  WeeklyCycle,
  WeeklyReport,
} from "@/types";
import { activityReports, areas, cycles, overview, users, weeklyReports } from "./mock-data";
import { apiBaseUrl, clearSession, getCsrfToken, getSessionEpoch } from "./auth";

export type ActivityInput = Omit<ActivityReport, "id" | "templateVersion" | "photos" | "createdAt" | "updatedAt"> & {
  photos: File[];
};

export type WeeklyCycleInput = Pick<WeeklyCycle, "label" | "startsAt" | "endsAt" | "deadline">;

export type SynthesisApi = {
  health(): Promise<{ detail: string }>;
  getAuthenticatedUser(role?: string): Promise<User>;
  listAreas(): Promise<Area[]>;
  listUsers(): Promise<User[]>;
  listWeeklyCycles(): Promise<WeeklyCycle[]>;
  createWeeklyCycle(input: WeeklyCycleInput): Promise<WeeklyCycle>;
  closeWeeklyCycle(cycleId: string): Promise<WeeklyCycle>;
  updateWeeklyCycleDeadline(cycleId: string, deadline: string): Promise<WeeklyCycle>;
  listActivityReports(filters?: Partial<Pick<ActivityReport, "area" | "managerId" | "cycleId">>): Promise<ActivityReport[]>;
  getActivityReport(id: string): Promise<ActivityReport | undefined>;
  createActivityReport(input: ActivityInput): Promise<ActivityReport>;
  updateOwnActivityReport(id: string, input: Partial<ActivityReport>): Promise<ActivityReport>;
  getCollectionOverview(): Promise<CollectionOverview>;
  reopenCollection(cycleId: string, reason: string, newDeadline: string): Promise<WeeklyCycle>;
  getPendingManagers(): Promise<User[]>;
  generateDraft(cycleId: string, activityIds: string[]): Promise<WeeklyReport>;
  updateWeeklyReport(reportId: string, changes: Pick<WeeklyReport, "executiveSummary">): Promise<WeeklyReport>;
  updateReportSection(reportId: string, sectionId: string, executiveSummary: string): Promise<WeeklyReport>;
  updateReportCard(reportId: string, cardId: string, changes: Partial<ReportCard>): Promise<ReportCard>;
  reorderReportCards(reportId: string, sectionId: string, cardIds: string[]): Promise<WeeklyReport>;
  removeReportCard(reportId: string, cardId: string): Promise<WeeklyReport>;
  restoreReportCard(reportId: string, cardId: string): Promise<WeeklyReport>;
  reopenReportSelection(reportId: string): Promise<WeeklyReport>;
  cancelWeeklyReport(reportId: string): Promise<void>;
  listWeeklyReports(): Promise<WeeklyReport[]>;
  getWeeklyReport(id: string): Promise<WeeklyReport | undefined>;
  listReportVersions(reportId: string): Promise<ReportVersion[]>;
  generatePdf(reportId: string): Promise<ReportVersion>;
  getPdfUrl(versionId: string): Promise<string>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type Page<T> = { items: T[]; total: number; page: number; pageSize: number };

function errorMessage(payload: unknown) {
  if (payload && typeof payload === "object" && "detail" in payload) {
    if (typeof payload.detail === "string") return payload.detail;
    if (Array.isArray(payload.detail)) {
      const messages = payload.detail
        .map((item) => item && typeof item === "object" && "msg" in item ? String(item.msg) : "")
        .filter(Boolean);
      if (messages.length) return messages.join(" ");
    }
  }
  if (typeof payload === "string" && payload.trim()) return payload;
  return "Não foi possível concluir a solicitação.";
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const epoch = getSessionEpoch();
  const headers = new Headers(init.headers);
  if (!["GET", "HEAD", "OPTIONS"].includes(init.method ?? "GET")) headers.set("X-CSRFToken", await getCsrfToken());
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers, credentials: "include", cache: "no-store" });
  } catch {
    throw new ApiError("Não foi possível conectar ao backend. Confirme se a API está em execução.", 0);
  }
  if (epoch !== getSessionEpoch()) throw new ApiError("A sessão foi encerrada.", 401);
  if (response.status === 401) {
    clearSession();
    if (typeof window !== "undefined") window.dispatchEvent(new Event("synthesis:unauthorized"));
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!response.ok) throw new ApiError(errorMessage(payload), response.status);
  return payload as T;
}

const queryString = (filters?: Record<string, string | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(filters ?? {}).forEach(([key, value]) => value && params.set(key, value));
  const value = params.toString();
  return value ? `?${value}` : "";
};

async function listAll<T>(path: string) {
  const separator = path.includes("?") ? "&" : "?";
  const first = await request<Page<T>>(`${path}${separator}page=1&pageSize=100`);
  const items = [...first.items];
  for (let page = 2; items.length < first.total; page += 1) {
    const next = await request<Page<T>>(`${path}${separator}page=${page}&pageSize=100`);
    items.push(...next.items);
    if (!next.items.length) break;
  }
  return items;
}

export const httpApi: SynthesisApi = {
  health: () => request<{ detail: string }>("/health"),
  getAuthenticatedUser: () => request<User>("/me"),
  listAreas: () => request<Area[]>("/areas"),
  listUsers: () => listAll<User>("/users"),
  listWeeklyCycles: () => listAll<WeeklyCycle>("/cycles"),
  createWeeklyCycle: (input) => request<WeeklyCycle>("/cycles", { method: "POST", body: JSON.stringify(input) }),
  closeWeeklyCycle: (cycleId) => request<WeeklyCycle>(`/cycles/${cycleId}/close`, { method: "POST" }),
  updateWeeklyCycleDeadline: (cycleId, deadline) => request<WeeklyCycle>(`/cycles/${cycleId}/deadline`, {
    method: "PATCH",
    body: JSON.stringify({ deadline }),
  }),
  listActivityReports: (filters) => listAll<ActivityReport>(`/activity-reports${queryString(filters)}`),
  getActivityReport: async (id) => {
    try {
      return await request<ActivityReport>(`/activity-reports/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return undefined;
      throw error;
    }
  },
  createActivityReport: (input) => {
    const body = new FormData();
    body.set("templateKey", input.templateKey);
    body.set("title", input.title);
    body.set("date", input.date);
    body.set("location", input.location);
    body.set("summary", input.summary);
    body.set("result", input.result);
    body.set("beneficiaries", input.beneficiaries);
    body.set("evidence", input.evidence);
    body.set("nextStep", input.nextStep);
    body.set("internalNotes", input.internalNotes);
    body.set("cycleId", input.cycleId);
    input.photos.forEach((photo) => body.append("photos", photo));
    return request<ActivityReport>("/activity-reports", { method: "POST", body });
  },
  updateOwnActivityReport: (id, input) => {
    const allowed = ["title", "date", "location", "summary", "result", "beneficiaries", "evidence", "nextStep", "internalNotes"] as const;
    const body = Object.fromEntries(allowed.filter((key) => input[key] !== undefined).map((key) => [key, input[key]]));
    return request<ActivityReport>(`/activity-reports/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  },
  getCollectionOverview: () => request<CollectionOverview>("/collection/overview"),
  reopenCollection: (cycleId, reason, newDeadline) => {
    return request<WeeklyCycle>(`/cycles/${cycleId}/reopen`, {
      method: "POST",
      body: JSON.stringify({ reason, newDeadline }),
    });
  },
  getPendingManagers: () => request<User[]>("/collection/pending-managers"),
  generateDraft: (cycleId, activityIds) =>
    request<WeeklyReport>("/weekly-reports/draft", {
      method: "POST",
      body: JSON.stringify({ cycleId, activityIds }),
    }),
  updateWeeklyReport: (reportId, changes) =>
    request<WeeklyReport>(`/weekly-reports/${reportId}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  updateReportSection: (reportId, sectionId, executiveSummary) =>
    request<WeeklyReport>(`/weekly-reports/${reportId}/sections/${sectionId}`, {
      method: "PATCH",
      body: JSON.stringify({ executiveSummary }),
    }),
  updateReportCard: (reportId, cardId, changes) => {
    const allowed = ["editorialTitle", "editorialSummary", "editorialResult", "editorialEvidence", "editorialNextStep", "executiveClassification", "needsDecision", "decisionRequest", "nextStepOwner", "nextStepDueDate", "selectedPhotoId"] as const;
    const body = Object.fromEntries(allowed.filter((key) => changes[key] !== undefined).map((key) => [key, changes[key]]));
    return request<ReportCard>(`/weekly-reports/${reportId}/cards/${cardId}`, { method: "PATCH", body: JSON.stringify(body) });
  },
  reorderReportCards: (reportId, sectionId, cardIds) =>
    request<WeeklyReport>(`/weekly-reports/${reportId}/sections/${sectionId}/reorder`, {
      method: "POST",
      body: JSON.stringify({ cardIds }),
    }),
  removeReportCard: (reportId, cardId) => request<WeeklyReport>(`/weekly-reports/${reportId}/cards/${cardId}`, { method: "DELETE" }),
  restoreReportCard: (reportId, cardId) => request<WeeklyReport>(`/weekly-reports/${reportId}/cards/${cardId}/restore`, { method: "POST" }),
  reopenReportSelection: (reportId) => request<WeeklyReport>(`/weekly-reports/${reportId}/selection/reopen`, { method: "POST" }),
  cancelWeeklyReport: async (reportId) => {
    await request<{ detail: string }>(`/weekly-reports/${reportId}`, { method: "DELETE" });
  },
  listWeeklyReports: () => listAll<WeeklyReport>("/weekly-reports"),
  getWeeklyReport: async (id) => {
    try {
      return await request<WeeklyReport>(`/weekly-reports/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return undefined;
      throw error;
    }
  },
  listReportVersions: (reportId) => listAll<ReportVersion>(`/weekly-reports/${reportId}/versions`),
  generatePdf: (reportId) => request<ReportVersion>(`/weekly-reports/${reportId}/versions`, { method: "POST" }),
  getPdfUrl: (versionId) => request<string>(`/weekly-reports/versions/${versionId}/url`),
};

const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 80));
const clone = <T>(value: T): T => structuredClone(value);

let reports = clone(activityReports);
let weekly = clone(weeklyReports);
let cycleRecords = clone(cycles);

export const mockApi: SynthesisApi = {
  health: async () => delay({ detail: "ok" }),
  getAuthenticatedUser: async (role = process.env.NEXT_PUBLIC_MOCK_ROLE ?? "gestor") => delay(clone(users.find((item) => item.role === role) ?? users[0])),
  listAreas: async () => delay(clone(areas)),
  listUsers: async () => delay(clone(users)),
  listWeeklyCycles: async () => delay(clone(cycleRecords)),
  createWeeklyCycle: async (input) => {
    if (cycleRecords.some((cycle) => cycle.status === "aberta" || cycle.status === "reaberta")) throw new Error("Encerre o ciclo ativo antes de abrir um novo.");
    const created: WeeklyCycle = { id: `c${Date.now()}`, ...input, status: "aberta" };
    cycleRecords = [created, ...cycleRecords];
    return delay(clone(created));
  },
  closeWeeklyCycle: async (cycleId) => {
    cycleRecords = cycleRecords.map((cycle) => cycle.id === cycleId ? { ...cycle, status: "encerrada" } : cycle);
    const updated = cycleRecords.find((cycle) => cycle.id === cycleId);
    if (!updated) throw new Error("Ciclo não encontrado.");
    return delay(clone(updated));
  },
  updateWeeklyCycleDeadline: async (cycleId, deadline) => {
    cycleRecords = cycleRecords.map((cycle) => cycle.id === cycleId ? { ...cycle, deadline } : cycle);
    const updated = cycleRecords.find((cycle) => cycle.id === cycleId);
    if (!updated) throw new Error("Ciclo não encontrado.");
    return delay(clone(updated));
  },
  listActivityReports: async (filters) => delay(clone(reports.filter((report) => Object.entries(filters ?? {}).every(([key, value]) => !value || report[key as keyof ActivityReport] === value)))),
  getActivityReport: async (id) => delay(clone(reports.find((item) => item.id === id))),
  createActivityReport: async (input) => {
    const created: ActivityReport = {
      ...input,
      id: `a${reports.length + 1}`,
      templateVersion: 1,
      photos: input.photos.map((file, index) => ({ id: `new-${Date.now()}-${index}`, url: "/placeholders/foto-3.svg", name: file.name, isMain: index === 0, alt: file.name })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reports = [created, ...reports];
    return delay(clone(created));
  },
  updateOwnActivityReport: async (id, input) => {
    reports = reports.map((report) => (report.id === id ? { ...report, ...input, updatedAt: new Date().toISOString() } : report));
    const updated = reports.find((report) => report.id === id);
    if (!updated) throw new Error("Relato não encontrado.");
    return delay(clone(updated));
  },
  getCollectionOverview: async () => delay(clone(overview)),
  reopenCollection: async (cycleId, _reason, newDeadline) => {
    cycleRecords = cycleRecords.map((cycle) => cycle.id === cycleId ? { ...cycle, status: "reaberta", deadline: newDeadline } : cycle);
    const updated = cycleRecords.find((cycle) => cycle.id === cycleId);
    if (!updated) throw new Error("Ciclo não encontrado.");
    return delay(clone(updated));
  },
  getPendingManagers: async () => delay(clone(overview.pendingManagers)),
  generateDraft: async (cycleId, activityIds) => {
    const selected = reports.filter((report) => activityIds.includes(report.id));
    const existing = weekly.find((report) => report.cycleId === cycleId);
    const replacing = existing?.status === "em_selecao" ? existing : undefined;
    const draft: WeeklyReport = {
      id: replacing?.id ?? `r${Date.now()}`,
      cycleId,
      status: "rascunho",
      executiveSummary: `A semana reúne ${selected.length} ${selected.length === 1 ? "iniciativa" : "iniciativas"} de ${new Set(selected.map((item) => item.area)).size} ${new Set(selected.map((item) => item.area)).size === 1 ? "área" : "áreas"}, com foco nos resultados e próximos passos apresentados a seguir.`,
      selectedActivityIds: activityIds,
      sections: areas.map((area, sectionIndex) => ({
        id: `draft-section-${sectionIndex}`,
        area,
        title: area,
        executiveSummary: "",
        order: sectionIndex,
        cards: selected.filter((report) => report.area === area).sort((a, b) => a.date.localeCompare(b.date)).map((report, order) => ({
          id: `draft-card-${report.id}`,
          activityReportId: report.id,
          editorialTitle: report.title,
          editorialSummary: report.summary,
          editorialResult: report.result,
          editorialEvidence: report.evidence,
          editorialNextStep: report.nextStep,
          executiveClassification: "informativo" as const,
          needsDecision: false,
          decisionRequest: "",
          nextStepOwner: "",
          nextStepDueDate: null,
          selectedPhotoId: report.photos.find((photo) => photo.isMain)?.id ?? report.photos[0].id,
          area,
          originalDate: report.date,
          originalLocation: report.location,
          originalBeneficiaries: report.beneficiaries,
          originalManagerName: users.find((user) => user.id === report.managerId)?.name ?? "Gestor responsável",
          order,
          removed: false,
        })),
      })).filter((section) => section.cards.length > 0),
      versions: replacing?.versions ?? [],
      updatedAt: new Date().toISOString(),
    };
    weekly = replacing ? weekly.map((report) => report.id === replacing.id ? draft : report) : [draft, ...weekly];
    return delay(clone(draft));
  },
  updateWeeklyReport: async (reportId, changes) => {
    weekly = weekly.map((report) => report.id === reportId ? { ...report, ...changes, status: "em_edicao", updatedAt: new Date().toISOString() } : report);
    const updated = weekly.find((report) => report.id === reportId);
    if (!updated) throw new Error("Relatório não encontrado.");
    return delay(clone(updated));
  },
  updateReportSection: async (reportId, sectionId, executiveSummary) => {
    weekly = weekly.map((report) => report.id !== reportId ? report : ({
      ...report,
      status: "em_edicao",
      updatedAt: new Date().toISOString(),
      sections: report.sections.map((section) => section.id === sectionId ? { ...section, executiveSummary } : section),
    }));
    const updated = weekly.find((report) => report.id === reportId);
    if (!updated) throw new Error("Relatório não encontrado.");
    return delay(clone(updated));
  },
  updateReportCard: async (reportId, cardId, changes) => {
    let updatedCard: ReportCard | undefined;
    weekly = weekly.map((report) => report.id !== reportId ? report : ({ ...report, status: "em_edicao", sections: report.sections.map((section) => ({ ...section, cards: section.cards.map((card) => {
      if (card.id !== cardId) return card;
      updatedCard = { ...card, ...changes };
      return updatedCard;
    }) })) }));
    if (!updatedCard) throw new Error("Card não encontrado.");
    return delay(clone(updatedCard));
  },
  reorderReportCards: async (reportId, sectionId, cardIds) => {
    weekly = weekly.map((report) => report.id !== reportId ? report : ({ ...report, sections: report.sections.map((section) => section.id !== sectionId ? section : ({ ...section, cards: cardIds.map((id, order) => ({ ...section.cards.find((card) => card.id === id)!, order })) })) }));
    return delay(clone(weekly.find((report) => report.id === reportId) ?? weekly[0]));
  },
  removeReportCard: async (reportId, cardId) => {
    weekly = weekly.map((report) => report.id !== reportId ? report : ({ ...report, sections: report.sections.map((section) => ({ ...section, cards: section.cards.map((card) => card.id === cardId ? { ...card, removed: true } : card) })) }));
    return delay(clone(weekly.find((report) => report.id === reportId) ?? weekly[0]));
  },
  restoreReportCard: async (reportId, cardId) => {
    weekly = weekly.map((report) => report.id !== reportId ? report : ({ ...report, sections: report.sections.map((section) => ({ ...section, cards: section.cards.map((card) => card.id === cardId ? { ...card, removed: false } : card) })) }));
    return delay(clone(weekly.find((report) => report.id === reportId) ?? weekly[0]));
  },
  reopenReportSelection: async (reportId) => {
    const report = weekly.find((item) => item.id === reportId);
    if (!report) throw new Error("Relatório não encontrado.");
    if (report.versions.length) throw new Error("A seleção não pode ser reaberta depois da primeira versão do PDF.");
    report.status = "em_selecao";
    return delay(clone(report));
  },
  cancelWeeklyReport: async (reportId) => {
    const report = weekly.find((item) => item.id === reportId);
    if (!report) throw new Error("Relatório não encontrado.");
    if (report.versions.length) throw new Error("Um relatório publicado não pode ser cancelado.");
    weekly = weekly.filter((item) => item.id !== reportId);
    await delay(undefined);
  },
  listWeeklyReports: async () => delay(clone(weekly)),
  getWeeklyReport: async (id) => delay(clone(weekly.find((report) => report.id === id))),
  listReportVersions: async (reportId) => delay(clone(weekly.find((report) => report.id === reportId)?.versions ?? [])),
  generatePdf: async (reportId) => {
    const report = weekly.find((item) => item.id === reportId);
    if (!report) throw new Error("Relatório não encontrado.");
    const version: ReportVersion = { id: `v${report.versions.length + 1}-${Date.now()}`, version: report.versions.length + 1, generatedAt: new Date().toISOString(), generatedBy: "u7", pdfUrl: `/relatorios/${report.id}` };
    report.status = "pdf_gerado";
    report.versions.push(version);
    return delay(clone(version));
  },
  getPdfUrl: async (versionId) => delay(`/pdf/${versionId}.pdf`),
};

export const api: SynthesisApi = process.env.NEXT_PUBLIC_API_URL === "mock" ? mockApi : httpApi;
export { apiBaseUrl };
