import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppHeader } from "@/components/layout/AppHeader";
import { api } from "@/services/api";

const push = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push }) }));
vi.mock("@/app/providers", () => ({ useAuth: () => ({ user: { id: "u1", name: "Ana", email: "ana@example.com" } }) }));
vi.mock("@/services/api", () => ({ api: { listNotifications: vi.fn(), markNotificationRead: vi.fn(), markAllNotificationsRead: vi.fn() } }));

let read = false;
const item = {
  id: "n1", userId: "u1", kind: "prazo" as const,
  message: "O prazo termina amanhã.", href: "/relatos/novo", createdAt: "2026-09-20T12:00:00-03:00",
};

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><AppHeader onMenuOpen={vi.fn()} /></QueryClientProvider>);
}

beforeEach(() => {
  read = false;
  vi.mocked(api.listNotifications).mockImplementation(async () => ({ items: [{ ...item, read }], unreadCount: read ? 0 : 1 }));
  vi.mocked(api.markNotificationRead).mockImplementation(async () => { read = true; return { ...item, read }; });
  vi.mocked(api.markAllNotificationsRead).mockImplementation(async () => { read = true; });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("sino de notificações", () => {
  it("mostra aviso não lido e abre o destino ao selecioná-lo", async () => {
    const user = userEvent.setup();
    mount();
    const bell = await screen.findByRole("button", { name: "Notificações, 1 não lidas" });
    await user.click(bell);
    expect(screen.getByText("O prazo termina amanhã.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /O prazo termina amanhã/ }));
    await waitFor(() => expect(vi.mocked(api.markNotificationRead).mock.calls[0]?.[0]).toBe("n1"));
    expect(push).toHaveBeenCalledWith("/relatos/novo");
  });

  it("marca todas como lidas e atualiza o contador", async () => {
    const user = userEvent.setup();
    mount();
    await user.click(await screen.findByRole("button", { name: "Notificações, 1 não lidas" }));
    await user.click(screen.getByRole("button", { name: "Marcar todas como lidas" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Notificações" })).toBeVisible());
    expect(screen.getByText("Tudo em dia")).toBeVisible();
  });
});
