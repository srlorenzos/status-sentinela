// status-sentinela: testa cada site de sites.json e grava docs/status.json com o estado atual,
// o histórico das últimas checagens e a disponibilidade (uptime) de cada um.
// Roda no GitHub Actions a cada hora; também funciona localmente: `node check.mjs`.
import { readFile, writeFile } from 'node:fs/promises';

const HISTORY = 168;      // 7 dias de checagens de hora em hora
const TIMEOUT_MS = 10000;
const SLOW_MS = 2500;

const sites = JSON.parse(await readFile(new URL('./sites.json', import.meta.url), 'utf8'));
const statusFile = new URL('./docs/status.json', import.meta.url);
let previous = { sites: [] };
try { previous = JSON.parse(await readFile(statusFile, 'utf8')); } catch { /* primeira execução */ }

async function probe(url) {
  const t0 = performance.now();
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'user-agent': 'status-sentinela (+https://github.com/srlorenzos/status-sentinela)' } });
    const ms = Math.round(performance.now() - t0);
    const up = res.status < 500 && res.status !== 404;
    return { up, code: res.status, ms, slow: up && ms > SLOW_MS };
  } catch (e) {
    return { up: false, code: 0, ms: Math.round(performance.now() - t0), slow: false, erro: e.name === 'TimeoutError' ? 'tempo esgotado' : e.message };
  }
}

const now = new Date().toISOString();
const out = [];
for (const s of sites) {
  const r = await probe(s.url);
  const old = previous.sites.find((p) => p.url === s.url);
  const historico = [...(old?.historico ?? []), { t: now, up: r.up, ms: r.ms }].slice(-HISTORY);
  const uptime = Math.round((historico.filter((h) => h.up).length / historico.length) * 1000) / 10;
  out.push({ ...s, ...r, uptime, historico });
  console.log(`${r.up ? 'ON ' : 'OFF'} ${String(r.ms).padStart(5)} ms  ${r.code}  ${s.nome}`);
}

const doc = { atualizado: now, todosNoAr: out.every((s) => s.up), sites: out };
await writeFile(statusFile, JSON.stringify(doc, null, 2) + '\n');
if (!doc.todosNoAr) process.exitCode = 0; // fora do ar não quebra o workflow: o estado fica registrado na página
