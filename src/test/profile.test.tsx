import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import ProfilePage from "@/app/perfil/page";
import { api } from "@/services/api";
import type { User } from "@/types";

const updateUser = vi.fn();
const current: User = {
  id: "u1", name: "Ana Martins", email: "ana@example.com", area: "Agro",
  role: "gestor", active: true, avatarUrl: null,
};
vi.mock("@/app/providers", () => ({ useAuth: () => ({ user: current, updateUser }) }));
vi.mock("@/components/layout/AppShell", () => ({ AppShell: ({ children }: { children: ReactNode }) => children }));
vi.mock("next/image", () => ({ default: ({ alt }: { alt: string }) => <span aria-label={alt} /> }));
vi.mock("@/services/api", () => ({ api: { updateProfileName: vi.fn(), uploadProfileAvatar: vi.fn(), removeProfileAvatar: vi.fn() } }));

function mount() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><ProfilePage /></QueryClientProvider>);
}

beforeEach(() => {
  vi.mocked(api.updateProfileName).mockImplementation(async (name) => ({ ...current, name }));
  vi.mocked(api.uploadProfileAvatar).mockResolvedValue({ ...current, avatarUrl: "/api/files/avatar?v=new" });
  vi.mocked(api.removeProfileAvatar).mockResolvedValue({ ...current, avatarUrl: null });
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:preview") });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("Meu perfil", () => {
  it("exibe área e e-mail apenas para consulta e salva o nome", async () => {
    const user = userEvent.setup();
    mount();
    expect(screen.getByText("Agro")).toBeVisible();
    expect(screen.getByText("ana@example.com")).toBeVisible();
    expect(screen.queryByRole("textbox", { name: /área vigente/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /e-mail de login/i })).not.toBeInTheDocument();
    await user.clear(screen.getByRole("textbox", { name: "Nome" }));
    await user.type(screen.getByRole("textbox", { name: "Nome" }), "Ana Silva");
    await user.click(screen.getByRole("button", { name: "Salvar nome" }));
    await waitFor(() => expect(vi.mocked(api.updateProfileName).mock.calls[0]?.[0]).toBe("Ana Silva"));
    expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ name: "Ana Silva" }));
  });

  it("envia a foto selecionada ao serviço de perfil", async () => {
    const user = userEvent.setup();
    mount();
    const file = new File(["imagem"], "avatar.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Escolher foto de perfil"), { target: { files: [file] } });
    await user.click(screen.getByRole("button", { name: "Salvar foto" }));
    await waitFor(() => expect(vi.mocked(api.uploadProfileAvatar).mock.calls[0]?.[0]).toBe(file));
    expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ avatarUrl: "/api/files/avatar?v=new" }));
  });
});
