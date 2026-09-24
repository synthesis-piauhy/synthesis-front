import { expect, test, type Browser, type Page } from "@playwright/test";

const API = "/api";
const PASSWORD = "Mvp-acceptance-749!";
const OTHER_ACTIVITY_ID = "00000000-0000-0000-0000-000000000401";
const ADMIN_ID = "00000000-0000-0000-0000-000000000204";
const image = {
  name: "aceite.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  ),
};

type ApiResult<T> = { status: number; body: T; contentType: string };

async function api<T>(page: Page, path: string, method = "GET", body?: unknown): Promise<ApiResult<T>> {
  return page.evaluate(async ({ apiUrl, path, method, body }) => {
    const csrf = document.cookie
      .split("; ")
      .find((item) => item.startsWith("csrftoken="))
      ?.slice("csrftoken=".length);
    const response = await fetch(`${apiUrl}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(csrf ? { "X-CSRFToken": decodeURIComponent(csrf) } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    return { status: response.status, body: payload, contentType };
  }, { apiUrl: API, path, method, body });
}

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/");
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

async function newSession(browser: Browser, email: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page, email);
  return { context, page };
}

test.describe.serial("aceite integrado do MVP", () => {
  let ownActivityId = "";
  let reportId = "";
  let firstVersionId = "";

  test("gestor autentica, envia e edita o próprio relato sem acessar objetos alheios", async ({ browser }) => {
    const { context, page } = await newSession(browser, "gestor.mvp@example.test");

    await expect(page.getByText("Gestor MVP", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Nova atividade" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Administração" })).toHaveCount(0);

    await page.goto(`/relatos/${OTHER_ACTIVITY_ID}`);
    await expect(page.getByText("Relato não encontrado ou indisponível para este usuário.")).toBeVisible();
    expect((await api(page, "/weekly-reports")).status).toBe(403);

    await page.goto("/relatos/novo");
    await page.getByRole("link", { name: /Ação ou evento realizado/ }).click();
    await page.getByLabel("Que tipo de ação foi realizada?").selectOption("Oficina");
    await page.getByLabel("Qual foi o tema ou nome da ação?").fill("plano de ação da área");
    await page.getByLabel("Quem participou ou foi beneficiado?").fill("participantes da área");
    await page.getByLabel("Quantas pessoas participaram?").fill("20");
    await page.getByLabel("O que os participantes conseguiram fazer ou receber?").fill("concluíram o plano de ação da próxima etapa");
    await page.locator("#activity-title").fill("Oficina integrada do MVP");
    await page.getByLabel("Local").fill("Sala de formação");
    await page.getByText("Adicionar evidência, próximo passo ou informações de apoio (opcional)").click();
    await page.getByLabel(/Evidência do resultado/).fill("20 planos concluídos");

    const uploads = page.locator('input[type="file"]');
    await uploads.nth(0).setInputFiles({
      name: "conteudo-ativo.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("<script>alert('xss')</script>"),
    });
    await page.getByRole("button", { name: "Salvar atividade" }).click();
    await expect(page.getByText("O arquivo não contém uma imagem válida.")).toBeVisible();

    await uploads.nth(0).setInputFiles(image);
    await uploads.nth(1).setInputFiles({ ...image, name: "aceite-adicional.png" });
    await page.getByRole("button", { name: "Salvar atividade" }).click();
    await expect(page).toHaveURL(/\/relatos\/[0-9a-f-]{36}$/);
    await expect(page.getByRole("heading", { name: "Oficina integrada do MVP", level: 2 })).toBeVisible();
    ownActivityId = new URL(page.url()).pathname.split("/").at(-1) ?? "";
    expect(ownActivityId).not.toBe("");
    const photo = page.getByRole("img", { name: "aceite.png" });
    await expect(photo).toHaveAttribute("src", /\/api\/files\/photos\/[0-9a-f-]{36}$/);
    await expect.poll(() => photo.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);

    await page.getByRole("button", { name: "Editar meu relato" }).click();
    await expect(page.getByLabel("Qual foi o tema ou nome da ação?")).toHaveValue("plano de ação da área");
    await page.getByLabel("Título da atividade").fill("Oficina integrada revisada");
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await expect(page.getByRole("heading", { name: "Oficina integrada revisada" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: "Oficina integrada revisada" })).toBeVisible();
    const secondTab = await context.newPage();
    await secondTab.goto("/");
    await expect(secondTab.getByText("Gestor MVP", { exact: true }).first()).toBeVisible();
    await logout(page);
    await secondTab.reload();
    await expect(secondTab).toHaveURL(/\/login$/);
    await context.close();
  });

  test("gerente seleciona, edita, reordena e publica duas versões imutáveis", async ({ browser }) => {
    const { context, page } = await newSession(browser, "gerente.mvp@example.test");

    await page.goto("/relatorio-semanal/selecao");
    await expect(page.getByRole("heading", { name: "Seleção editorial", level: 2 })).toBeVisible();
    await page.getByRole("button", { name: "Selecionar todos da área" }).click();
    await page.getByRole("button", { name: /Gerar rascunho com 2 atividades/ }).click();
    await expect(page.getByRole("heading", { name: "Editor do relatório executivo", level: 2 })).toBeVisible();
    reportId = new URL(page.url()).pathname.split("/").at(-2) ?? "";

    const original = await api<{ sections: Array<{ id: string; cards: Array<{ id: string }> }> }>(page, `/weekly-reports/${reportId}`);
    expect(original.status).toBe(200);
    const section = original.body.sections[0];
    expect(section.cards).toHaveLength(2);
    const reversedIds = section.cards.map((card) => card.id).reverse();
    const reordered = await api<{ sections: Array<{ cards: Array<{ id: string }> }> }>(
      page,
      `/weekly-reports/${reportId}/sections/${section.id}/reorder`,
      "POST",
      { cardIds: reversedIds },
    );
    expect(reordered.status).toBe(200);
    expect(reordered.body.sections[0].cards.map((card) => card.id)).toEqual(reversedIds);

    await page.getByRole("button", { name: /Informativo Oficina integrada revisada/ }).click();
    await page.getByLabel("Título editorial").fill("Oficina validada no aceite integrado");
    await page.getByLabel("Título editorial").blur();
    await expect(page.getByText("Alterações salvas")).toBeVisible();
    await page.getByLabel("Foto principal do card").selectOption({ label: "aceite-adicional.png" });
    await expect(page.getByText("Alterações salvas")).toBeVisible();

    await page.getByRole("button", { name: "Retirar do relatório" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Confirmar" }).click();
    await expect(page.getByText("Retirados (1)")).toBeVisible();
    await page.getByRole("button", { name: "Restaurar card" }).click();
    await expect(page.getByText("Retirados (1)")).toHaveCount(0);

    await page.getByRole("button", { name: "Gerar nova versão" }).click();
    await expect(page.getByText("Versão 1 disponível.")).toBeVisible();
    const versionsAfterFirst = await api<{ items: Array<{ id: string; version: number }> }>(page, `/weekly-reports/${reportId}/versions?page=1&pageSize=100`);
    firstVersionId = versionsAfterFirst.body.items[0].id;
    await page.getByRole("button", { name: "Voltar ao editor" }).click();
    await page.getByRole("button", { name: "Gerar nova versão" }).click();
    await expect(page.getByText("Versão 2 disponível.")).toBeVisible();

    const versions = await api<{ items: Array<{ id: string; version: number }> }>(page, `/weekly-reports/${reportId}/versions?page=1&pageSize=100`);
    expect(versions.body.items.map((item) => item.version)).toEqual([1, 2]);
    expect(versions.body.items[0].id).toBe(firstVersionId);
    const pdfUrl = await api<string>(page, `/weekly-reports/versions/${firstVersionId}/url`);
    expect(pdfUrl.status).toBe(200);
    expect(pdfUrl.body).toBe(`/api/files/versions/${firstVersionId}`);
    const browserPdf = await page.evaluate(async (url) => {
      const response = await fetch(url, { credentials: "include" });
      return { status: response.status, contentType: response.headers.get("content-type") };
    }, pdfUrl.body);
    expect(browserPdf.status).toBe(200);
    expect(browserPdf.contentType).toContain("application/pdf");
    const privatePdf = await api<string>(page, `/files/versions/${firstVersionId}`);
    expect(privatePdf.status).toBe(200);
    expect(privatePdf.contentType).toContain("application/pdf");

    await page.getByRole("button", { name: "Voltar ao editor" }).click();
    await page.goto("/ciclos");
    await page.getByRole("button", { name: "Encerrar coleta" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Confirmar" }).click();
    await expect(page.getByRole("status")).toContainText("Coleta encerrada");
    await logout(page);
    await context.close();

    const anonymous = await browser.newContext({ baseURL: "http://127.0.0.1:3101" });
    const denied = await anonymous.request.get(`${API}/files/versions/${firstVersionId}`);
    expect(denied.status()).toBe(401);
    await anonymous.close();
  });

  test("gestor não edita ciclo encerrado e administrador executa CRUD com auditoria", async ({ browser }) => {
    const managerSession = await newSession(browser, "gestor.mvp@example.test");
    await managerSession.page.goto(`/relatos/${ownActivityId}`);
    await expect(managerSession.page.getByText("Este ciclo está encerrado.")).toBeVisible();
    await expect(managerSession.page.getByRole("button", { name: "Editar meu relato" })).toHaveCount(0);
    await managerSession.context.close();

    const { context, page } = await newSession(browser, "admin.mvp@example.test");
    await page.goto("/administracao/usuarios");
    await expect(page.getByRole("heading", { name: "Usuários", level: 2 })).toBeVisible();
    await page.getByRole("button", { name: "Novo cadastro" }).click();
    const create = page.getByRole("dialog");
    await create.getByLabel(/^Nome/).fill("Usuário criado no aceite");
    await create.getByLabel(/^E-mail/).fill("novo.mvp@example.test");
    await create.getByLabel(/^Perfil/).selectOption("gestor");
    await create.getByLabel(/^Área/).selectOption({ label: "Educação" });
    await create.getByLabel(/^Senha/).fill("Nova-senha-segura-862!");
    await create.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByRole("status")).toHaveText("Cadastro salvo com sucesso.");
    await expect(page.getByText("Usuário criado no aceite")).toBeVisible();

    await page.getByRole("button", { name: "Editar Administrador MVP" }).click();
    const edit = page.getByRole("dialog");
    await edit.getByLabel("Ativo").uncheck();
    await edit.getByRole("button", { name: "Salvar" }).click();
    await expect(edit.getByRole("alert")).toContainText("Você não pode desativar");
    await edit.getByRole("button", { name: "Cancelar" }).click();

    const selfDelete = await api<{ detail: string }>(page, `/administration/users/${ADMIN_ID}`, "DELETE");
    expect(selfDelete.status).toBe(409);

    await page.goto("/administracao/auditoria");
    await expect(page.getByRole("heading", { name: "Auditoria", level: 2 })).toBeVisible();
    await expect(page.getByText("admin.users.created")).toBeVisible();
    await logout(page);
    await context.close();
  });
});
