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

export type ActivityInput = Omit<ActivityReport, "id" | "photos" | "createdAt" | "updatedAt"> & {
  photos: File[];
};

export type SynthesisApi = {
  getAuthenticatedUser(role?: string): Promise<User>;
  listAreas(): Promise<Area[]>;
  listUsers(): Promise<User[]>;
  listWeeklyCycles(): Promise<WeeklyCycle[]>;
  listActivityReports(filters?: Partial<Pick<ActivityReport, "area" | "managerId" | "cycleId">>): Promise<ActivityReport[]>;
  getActivityReport(id: string): Promise<ActivityReport | undefined>;
  createActivityReport(input: ActivityInput): Promise<ActivityReport>;
  updateOwnActivityReport(id: string, input: Partial<ActivityReport>): Promise<ActivityReport>;
  uploadPhotos(files: File[]): Promise<string[]>;
  getCollectionOverview(): Promise<CollectionOverview>;
  reopenCollection(reason: string, newDeadline: string): Promise<WeeklyCycle>;
  getPendingManagers(): Promise<User[]>;
  selectActivityReports(reportId: string, activityIds: string[]): Promise<WeeklyReport>;
  generateDraft(cycleId: string, activityIds: string[]): Promise<WeeklyReport>;
  updateReportCard(reportId: string, cardId: string, changes: Partial<ReportCard>): Promise<ReportCard>;
  reorderReportCards(reportId: string, sectionId: string, cardIds: string[]): Promise<WeeklyReport>;
  removeReportCard(reportId: string, cardId: string): Promise<WeeklyReport>;
  listWeeklyReports(): Promise<WeeklyReport[]>;
  getWeeklyReport(id: string): Promise<WeeklyReport | undefined>;
  listReportVersions(reportId: string): Promise<ReportVersion[]>;
  generatePdf(reportId: string): Promise<ReportVersion>;
  getPdfUrl(versionId: string): Promise<string>;
};

const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 80));
const clone = <T>(value: T): T => structuredClone(value);

let reports = clone(activityReports);
let weekly = clone(weeklyReports);

export const mockApi: SynthesisApi = {
  getAuthenticatedUser: async (role = "gestor") => {
    const user = users.find((item) => item.role === role) ?? users[0];
    return delay(clone(user));
  },
  listAreas: async () => delay(clone(areas)),
  listUsers: async () => delay(clone(users)),
  listWeeklyCycles: async () => delay(clone(cycles)),
  listActivityReports: async (filters) => {
    const filtered = reports.filter((report) =>
      Object.entries(filters ?? {}).every(([key, value]) => !value || report[key as keyof ActivityReport] === value),
    );
    return delay(clone(filtered));
  },
  getActivityReport: async (id) => delay(clone(reports.find((item) => item.id === id))),
  createActivityReport: async (input) => {
    const created: ActivityReport = {
      ...input,
      id: `a${reports.length + 1}`,
      photos: input.photos.map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        url: "/placeholders/foto-3.svg",
        name: file.name,
        isMain: index === 0,
        alt: file.name,
      })),
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
  uploadPhotos: async (files) => delay(files.map((file) => file.name)),
  getCollectionOverview: async () => delay(clone(overview)),
  reopenCollection: async (_reason, newDeadline) => delay({ ...cycles[0], status: "reaberta", deadline: newDeadline }),
  getPendingManagers: async () => delay(clone(overview.pendingManagers)),
  selectActivityReports: async (reportId, activityIds) => {
    weekly = weekly.map((report) => (report.id === reportId ? { ...report, selectedActivityIds: activityIds, status: "em_selecao" } : report));
    return delay(clone(weekly.find((report) => report.id === reportId) ?? weekly[0]));
  },
  generateDraft: async (cycleId, activityIds) => {
    const selected = reports.filter((report) => activityIds.includes(report.id));
    const draft: WeeklyReport = {
      id: `r${weekly.length + 1}`,
      cycleId,
      status: "rascunho",
      selectedActivityIds: activityIds,
      sections: areas
        .map((area, sectionIndex) => ({
          id: `draft-section-${sectionIndex}`,
          area,
          title: area,
          order: sectionIndex,
          cards: selected
            .filter((report) => report.area === area)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((report, order) => ({
              id: `draft-card-${report.id}`,
              activityReportId: report.id,
              editorialTitle: report.title,
              editorialSummary: report.summary,
              editorialResult: report.result,
              selectedPhotoId: report.photos.find((photo) => photo.isMain)?.id ?? report.photos[0].id,
              area,
              originalDate: report.date,
              order,
              removed: false,
            })),
        }))
        .filter((section) => section.cards.length > 0),
      versions: [],
      updatedAt: new Date().toISOString(),
    };
    weekly = [draft, ...weekly];
    return delay(clone(draft));
  },
  updateReportCard: async (reportId, cardId, changes) => {
    let updatedCard: ReportCard | undefined;
    weekly = weekly.map((report) => {
      if (report.id !== reportId) return report;
      return {
        ...report,
        status: "em_edicao",
        sections: report.sections.map((section) => ({
          ...section,
          cards: section.cards.map((card) => {
            if (card.id !== cardId) return card;
            updatedCard = { ...card, ...changes };
            return updatedCard;
          }),
        })),
      };
    });
    if (!updatedCard) throw new Error("Card não encontrado.");
    return delay(clone(updatedCard));
  },
  reorderReportCards: async (reportId, sectionId, cardIds) => {
    weekly = weekly.map((report) => {
      if (report.id !== reportId) return report;
      return {
        ...report,
        sections: report.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return { ...section, cards: cardIds.map((id, order) => ({ ...section.cards.find((card) => card.id === id)!, order })) };
        }),
      };
    });
    return delay(clone(weekly.find((report) => report.id === reportId) ?? weekly[0]));
  },
  removeReportCard: async (reportId, cardId) => {
    weekly = weekly.map((report) =>
      report.id === reportId
        ? { ...report, sections: report.sections.map((section) => ({ ...section, cards: section.cards.map((card) => (card.id === cardId ? { ...card, removed: true } : card)) })) }
        : report,
    );
    return delay(clone(weekly.find((report) => report.id === reportId) ?? weekly[0]));
  },
  listWeeklyReports: async () => delay(clone(weekly)),
  getWeeklyReport: async (id) => delay(clone(weekly.find((report) => report.id === id))),
  listReportVersions: async (reportId) => delay(clone(weekly.find((report) => report.id === reportId)?.versions ?? [])),
  generatePdf: async (reportId) => {
    const generatedBy = "u7";
    let version: ReportVersion | undefined;
    weekly = weekly.map((report) => {
      if (report.id !== reportId) return report;
      version = {
        id: `v${report.versions.length + 1}-${Date.now()}`,
        version: report.versions.length + 1,
        generatedAt: new Date().toISOString(),
        generatedBy,
        pdfUrl: `/relatorios/${report.id}`,
      };
      return { ...report, status: "pdf_gerado", versions: [...report.versions, version] };
    });
    if (!version) throw new Error("Relatório não encontrado.");
    return delay(clone(version));
  },
  getPdfUrl: async (versionId) => delay(`/pdf/${versionId}.pdf`),
};

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "mock";
export const api: SynthesisApi = mockApi;
