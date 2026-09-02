const ACCESS_TOKEN_KEY = "synthesis.accessToken";
const REFRESH_TOKEN_KEY = "synthesis.refreshToken";

export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

type TokenPair = {
  access: string;
  refresh: string;
};

function storage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function getAccessToken() {
  return storage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export async function verifyAccessToken() {
  const token = getAccessToken();
  if (!token) return false;
  const response = await fetch(`${apiBaseUrl}/token/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return response.ok;
}

export function hasSession() {
  return Boolean(storage()?.getItem(REFRESH_TOKEN_KEY));
}

export function clearSession() {
  storage()?.removeItem(ACCESS_TOKEN_KEY);
  storage()?.removeItem(REFRESH_TOKEN_KEY);
}

function storeTokens(tokens: TokenPair) {
  storage()?.setItem(ACCESS_TOKEN_KEY, tokens.access);
  storage()?.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
}

async function tokenRequest(path: string, body: Record<string, string>) {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Não foi possível conectar ao backend. Confirme se a API está em execução.");
  }
  const payload = (await response.json().catch(() => null)) as (Partial<TokenPair> & { detail?: string }) | null;
  if (!response.ok || !payload?.access) {
    throw new Error(payload?.detail ?? "Não foi possível autenticar. Confira o e-mail e a senha.");
  }
  return payload;
}

export async function loginWithPassword(email: string, password: string) {
  const tokens = await tokenRequest("/token/pair", { email, password });
  if (!tokens.refresh) throw new Error("A API não devolveu o token de renovação.");
  storeTokens(tokens as TokenPair);
}

let refreshRequest: Promise<string> | null = null;

export async function refreshSession() {
  if (refreshRequest) return refreshRequest;
  const refresh = storage()?.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) throw new Error("Sessão não encontrada.");

  refreshRequest = tokenRequest("/token/refresh", { refresh })
    .then((tokens) => {
      storeTokens({ access: tokens.access!, refresh: tokens.refresh ?? refresh });
      return tokens.access!;
    })
    .catch((error) => {
      clearSession();
      throw error;
    })
    .finally(() => {
      refreshRequest = null;
    });
  return refreshRequest;
}
