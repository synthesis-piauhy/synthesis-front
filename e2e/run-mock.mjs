import { spawn } from "node:child_process";
import { get } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const common = { ...process.env, NO_PROXY: "127.0.0.1,localhost", no_proxy: "127.0.0.1,localhost" };
const next = spawn("npm", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", "3100"], {
  cwd: frontend,
  env: { ...common, NEXT_E2E: "1", NEXT_PUBLIC_API_URL: "mock", NEXT_PUBLIC_MOCK_ROLE: "gerente" },
  stdio: "inherit",
});

function stop() {
  if (!next.killed) next.kill("SIGTERM");
}

function waitFor(url, timeoutMs = 120_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (next.exitCode !== null) return reject(new Error(`O frontend encerrou antes de responder em ${url}.`));
      const request = get(url, (response) => {
        response.resume();
        if ((response.statusCode ?? 500) < 500) return resolve();
        retry();
      });
      request.setTimeout(1_000, () => request.destroy());
      request.on("error", retry);
    };
    const retry = () => {
      if (Date.now() - started >= timeoutMs) return reject(new Error(`Timeout aguardando ${url}.`));
      setTimeout(attempt, 250);
    };
    attempt();
  });
}

process.once("SIGINT", () => { stop(); process.exit(130); });
process.once("SIGTERM", () => { stop(); process.exit(143); });

let exitCode = 1;
try {
  await waitFor("http://127.0.0.1:3100/login");
  const playwright = spawn(
    path.resolve(frontend, "node_modules/.bin/playwright"),
    ["test", "--config=playwright.config.ts"],
    { cwd: frontend, env: common, stdio: "inherit" },
  );
  exitCode = await new Promise((resolve) => playwright.once("exit", (code) => resolve(code ?? 1)));
} finally {
  stop();
}

process.exit(exitCode);
