export const apiBaseUrl = (process.env.NODE_ENV === "production"
  ? "/api"
  : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api")).replace(/\/$/, "");

let csrfToken = "";
let sessionEpoch = 0;

export function getSessionEpoch() { return sessionEpoch; }

export function clearSession() {
  sessionEpoch += 1;
  csrfToken = "";
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("synthesis.accessToken");
    window.localStorage.removeItem("synthesis.refreshToken");
  }
}

export async function getCsrfToken() {
  if (process.env.NEXT_PUBLIC_API_URL === "mock") return "mock-csrf-token";
  const cookie = typeof document !== "undefined"
    ? document.cookie.split("; ").find((item) => item.startsWith("csrftoken="))?.slice(10) : undefined;
  if (cookie) return decodeURIComponent(cookie);
  if (csrfToken) return csrfToken;
  const response = await fetch(`${apiBaseUrl}/token/csrf`, { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error("Não foi possível iniciar uma sessão segura.");
  const data = await response.json() as { csrfToken: string };
  csrfToken = data.csrfToken;
  return csrfToken;
}

async function sessionRequest(path: string, body: Record<string, string> = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST", credentials: "include", cache: "no-store",
    headers: { "Content-Type": "application/json", "X-CSRFToken": await getCsrfToken() },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null) as { detail?: string; csrfToken?: string } | null;
  if (!response.ok) throw new Error(payload?.detail ?? "Não foi possível concluir a autenticação.");
  if (payload?.csrfToken) csrfToken = payload.csrfToken;
}

export async function loginWithPassword(email: string, password: string) {
  clearSession();
  if (process.env.NEXT_PUBLIC_API_URL === "mock") return;
  await sessionRequest("/token/pair", { email, password });
}

export async function logoutSession(all = false) {
  // Invalidate pending UI reads immediately, including those from before logout.
  clearSession();
  if (process.env.NEXT_PUBLIC_API_URL === "mock") return;
  try {
    await sessionRequest(all ? "/token/logout-all" : "/token/logout");
  } catch {
    throw new Error("Não foi possível confirmar a saída no servidor. Conecte-se e tente sair novamente.");
  }
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel("synthesis-session");
    channel.postMessage("logout");
    channel.close();
  }
}
