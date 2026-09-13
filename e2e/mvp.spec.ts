import { expect, test } from "@playwright/test";

test("gerente recupera a edição, publica, entrega e abre o próximo ciclo", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/relatorio-semanal");

  await expect(page.getByRole("heading", { name: "Mosaico semanal", level: 2 })).toBeVisible();
  await page.getByRole("button", { name: "Reabrir seleção" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Confirmar" }).click();

  await expect(page.getByText("Seleção reaberta", { exact: true })).toBeVisible();
  for (const title of [
    "Visita técnica a produtores rurais",
    "Consultoria para indústria moveleira",
    "Encontro de empreendedoras da moda",
  ]) {
    await page.getByRole("checkbox", { name: `Selecionar ${title}` }).uncheck();
  }
  await page.getByRole("button", { name: "Atualizar rascunho com 1 atividades" }).click();

  await expect(page.getByRole("heading", { name: "Editor do relatório executivo", level: 2 })).toBeVisible();
  await page.getByRole("button", { name: /^Informativo Oficina de boas práticas para restaurantes/ }).click();
  await page.getByRole("button", { name: "Retirar do relatório" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Retirados (1)")).toBeVisible();
  await page.getByRole("button", { name: "Restaurar card" }).click();
  await expect(page.getByText("Retirados (1)")).not.toBeVisible();

  await page.getByRole("button", { name: "Gerar nova versão" }).click();
  await expect(page.getByText("Versão 1 disponível.")).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao editor" }).click();
  await page.getByRole("link", { name: "Histórico e PDFs" }).click();
  await page.getByRole("link", { name: "Visualizar" }).click();

  await expect(page.getByRole("heading", { name: "Entrega manual do MVP" })).toBeVisible();
  await page.getByRole("button", { name: "Copiar mensagem" }).click();
  await expect(page.getByRole("button", { name: "Mensagem copiada" })).toBeVisible();

  await page.getByRole("link", { name: "Ciclos semanais" }).click();
  await page.getByRole("button", { name: "Encerrar coleta" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Coleta encerrada. Os relatos permanecem disponíveis para seleção editorial.")).toBeVisible();

  await page.getByRole("button", { name: "Abrir novo ciclo" }).click();
  await page.getByLabel("Nome do ciclo").fill("14 a 18 de setembro de 2026");
  await page.getByLabel("Início").fill("2026-09-14");
  await page.getByLabel("Fim").fill("2026-09-18");
  await page.getByLabel("Prazo para envio").fill("2026-09-18T18:00");
  await page.getByRole("dialog").getByRole("button", { name: "Abrir ciclo" }).click();

  await expect(page.getByText("Novo ciclo aberto com sucesso.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "14 a 18 de setembro de 2026" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir novo ciclo" })).toBeDisabled();
});
