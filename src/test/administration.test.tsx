import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { administration, type AdminRecord, type AdminResource } from "@/services/administration";

vi.mock("@/app/providers", () => ({ useAuth: () => ({ role: "admin" }) }));
vi.mock("@/components/layout/AppShell", () => ({ AppShell: ({ children }: { children: ReactNode }) => children }));
vi.mock("@/components/RoleGuard", () => ({ RoleGuard: ({ children }: { children: ReactNode }) => children }));
vi.mock("@/services/administration", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/services/administration")>();
  return { ...original, administration: { resources: vi.fn(), list: vi.fn(), get: vi.fn(), save: vi.fn(), remove: vi.fn() } };
});

const field = (name: string, label: string, type = "text", required = true) => ({ name, label, type, required, help: "", maxLength: null, options: [] });
const resource: AdminResource = {
  key: "users", title: "Usuários", canCreate: true, canEdit: true, canDelete: true, count: 1,
  fields: [field("name", "Nome"), field("email", "E-mail", "email"), field("active", "Ativo", "checkbox", false), field("password", "Senha", "password", false)],
  columns: [{ value: "name", label: "Nome" }], detailFields: [{ value: "name", label: "Nome" }],
};
const record: AdminRecord = {
  id: "user-1", label: "Maria", values: { name: "Maria", email: "maria@example.com", active: true },
  display: { name: "Maria" }, files: {}, canEdit: true, canDelete: true,
};

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><AdminResourcePage resourceKey="users" /></QueryClientProvider>);
}

beforeEach(() => {
  vi.mocked(administration.resources).mockResolvedValue([resource]);
  vi.mocked(administration.list).mockResolvedValue({ items: [record], total: 1, page: 1, pageSize: 25 });
  vi.mocked(administration.get).mockResolvedValue(record);
  vi.mocked(administration.save).mockResolvedValue(record);
});
afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe("Administração", () => {
  it("edita um usuário preservando a senha quando o campo fica vazio", async () => {
    const user = userEvent.setup();
    mount();
    await user.click(await screen.findByRole("button", { name: "Editar Maria" }));
    const name = await screen.findByLabelText("Nome *");
    expect(screen.getByLabelText("Senha")).toHaveValue("");
    await user.clear(name);
    await user.type(name, "Maria Silva");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(administration.save).toHaveBeenCalledWith("users", { name: "Maria Silva", email: "maria@example.com", active: true, password: "" }, "user-1"));
    expect(await screen.findByRole("status")).toHaveTextContent("Cadastro salvo");
  });

  it("exige senha na criação e mostra erros de validação sem fechar o formulário", async () => {
    vi.mocked(administration.save).mockRejectedValue(new Error("E-mail já cadastrado."));
    const user = userEvent.setup();
    mount();
    await user.click(await screen.findByRole("button", { name: "Novo cadastro" }));
    expect(screen.getByLabelText("Senha *")).toBeRequired();
    await user.type(screen.getByLabelText("Nome *"), "João");
    await user.type(screen.getByLabelText("E-mail *"), "joao@example.com");
    await user.type(screen.getByLabelText("Senha *"), "Senha-segura-824!");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail já cadastrado");
    expect(screen.getByLabelText("Nome *")).toHaveValue("João");
  });

  it("só exclui após confirmação e apresenta o bloqueio de vínculos", async () => {
    vi.mocked(administration.remove).mockRejectedValue(new Error("Registro em uso. Preserve o histórico."));
    const user = userEvent.setup();
    mount();
    await user.click(await screen.findByRole("button", { name: "Excluir Maria" }));
    expect(administration.remove).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /^Excluir$/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Registro em uso");
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("consulta registros sem apresentar ações de escrita quando não autorizadas", async () => {
    vi.mocked(administration.resources).mockResolvedValue([{ ...resource, canCreate: false, canEdit: false, canDelete: false }]);
    vi.mocked(administration.list).mockResolvedValue({ items: [{ ...record, canEdit: false, canDelete: false }], total: 1, page: 1, pageSize: 25 });
    mount();
    expect(await screen.findByRole("button", { name: "Ver Maria" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Novo cadastro" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar Maria" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir Maria" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar Usuários" }), { target: { value: "Maria" } });
    fireEvent.click(screen.getByRole("button", { name: /^Buscar$/ }));
    await waitFor(() => expect(administration.list).toHaveBeenCalledWith("users", "Maria", 1));
  });
});
