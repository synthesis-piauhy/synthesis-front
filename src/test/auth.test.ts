import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearSession, getSessionEpoch, loginWithPassword, logoutSession } from "@/services/auth";
import { request } from "@/services/api";

function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("sessão segura", () => {
  beforeEach(() => {
    clearSession();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("autentica com CSRF/cookie e remove tokens legados", async () => {
    localStorage.setItem("synthesis.accessToken", "legacy-access");
    localStorage.setItem("synthesis.refreshToken", "legacy-refresh");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "csrf-one" }))
      .mockResolvedValueOnce(jsonResponse({ detail: "Autenticado.", csrfToken: "csrf-two" }));
    vi.stubGlobal("fetch", fetchMock);

    await loginWithPassword("person@example.org", "secret");

    expect(localStorage.length).toBe(0);
    const login = fetchMock.mock.calls[1];
    expect(login[1]).toMatchObject({ method: "POST", credentials: "include", cache: "no-store" });
    expect(new Headers(login[1].headers).get("X-CSRFToken")).toBe("csrf-one");
  });

  it("envia cookies e CSRF nas mutações da API", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "csrf-value" }))
      .mockResolvedValueOnce(jsonResponse({ detail: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    await request("/resource", { method: "POST", body: "{}" });

    const call = fetchMock.mock.calls[1];
    expect(call[1]).toMatchObject({ credentials: "include", cache: "no-store" });
    expect(new Headers(call[1].headers).get("X-CSRFToken")).toBe("csrf-value");
    expect(new Headers(call[1].headers).has("Authorization")).toBe(false);
  });

  it("invalida respostas pendentes e o estado local ao sair", async () => {
    const before = getSessionEpoch();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ csrfToken: "csrf-value" }))
      .mockResolvedValueOnce(jsonResponse({ detail: "Sessão encerrada." }));
    vi.stubGlobal("fetch", fetchMock);

    await logoutSession();

    expect(getSessionEpoch()).toBeGreaterThan(before);
    expect(fetchMock.mock.calls[1][0]).toContain("/token/logout");
  });
});
