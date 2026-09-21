import { spawn, spawnSync } from "node:child_process";
import { get } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backend = path.resolve(frontend, "../synthesis-back");
const processes = [];
const composeArgs = ["compose", "-f", "compose.acceptance.yaml"];

function start(command, args, options) {
  const child = spawn(command, args, { ...options, stdio: "inherit" });
  processes.push(child);
  return child;
}

function stop() {
  for (const child of processes) {
    if (!child.killed) child.kill("SIGTERM");
  }
}

function stopDatabase() {
  spawnSync("docker", [...composeArgs, "down", "--remove-orphans"], {
    cwd: backend,
    env: process.env,
    stdio: "inherit",
  });
}

function waitFor(url, child, timeoutMs = 120_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (child.exitCode !== null) {
        reject(new Error(`O servidor encerrou antes de responder em ${url}.`));
        return;
      }
      const request = get(url, (response) => {
        response.resume();
        if ((response.statusCode ?? 500) < 500) {
          resolve();
          return;
        }
        retry();
      });
      request.setTimeout(1_000, () => request.destroy());
      request.on("error", retry);
    };
    const retry = () => {
      if (Date.now() - started >= timeoutMs) {
        reject(new Error(`Timeout aguardando ${url}.`));
        return;
      }
      setTimeout(attempt, 250);
    };
    attempt();
  });
}

process.once("SIGINT", () => { stop(); stopDatabase(); process.exit(130); });
process.once("SIGTERM", () => { stop(); stopDatabase(); process.exit(143); });

const common = { ...process.env, NO_PROXY: "127.0.0.1,localhost", no_proxy: "127.0.0.1,localhost" };
const database = spawnSync("docker", [...composeArgs, "up", "--detach", "--wait"], {
  cwd: backend,
  env: common,
  stdio: "inherit",
});
if (database.status !== 0) {
  stopDatabase();
  process.exit(database.status ?? 1);
}
const django = start(
  "uv",
  ["run", "python", "manage.py", "run_mvp_acceptance_server", "127.0.0.1:8001", "--noreload"],
  {
    cwd: backend,
    env: {
      ...common,
      APP_ENV: "test",
      ALLOW_MVP_ACCEPTANCE_RESET: "true",
      ALLOWED_HOSTS: "127.0.0.1,localhost",
      CORS_ALLOWED_ORIGINS: "http://127.0.0.1:3101",
      DATABASE_URL: "postgresql://synthesis_acceptance:acceptance-only-password@127.0.0.1:5434/synthesis_mvp_e2e",
      MEDIA_ROOT: "/tmp/synthesis-mvp-e2e-media",
      PUBLIC_ORIGIN: "http://127.0.0.1:3101",
      UV_CACHE_DIR: "/tmp/synthesis-mvp-e2e-uv-cache",
    },
  },
);
const next = start("npm", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", "3101"], {
  cwd: frontend,
  env: {
    ...common,
    NEXT_E2E: "1",
    NEXT_API_PROXY_TARGET: "http://127.0.0.1:8001",
    NEXT_PUBLIC_API_URL: "/api",
  },
});

let exitCode = 1;
try {
  await Promise.all([
    waitFor("http://127.0.0.1:8001/api/health", django),
    waitFor("http://127.0.0.1:3101/login", next),
  ]);
  const playwright = start(
    path.resolve(frontend, "node_modules/.bin/playwright"),
    ["test", "--config=playwright.integration.config.ts"],
    { cwd: frontend, env: common },
  );
  exitCode = await new Promise((resolve) => playwright.once("exit", (code) => resolve(code ?? 1)));
} finally {
  stop();
  stopDatabase();
}

process.exit(exitCode);
