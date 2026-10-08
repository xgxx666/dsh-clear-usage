import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fold, summarize, validatePolicy, dashboardRows, dayKey } from './lib/usage.js';

const PACKAGE = 'dsh-clear-usage';
const SERVICE = 'clearUsage';
const NAMESPACE = 'clearUsage';
const settingsFile = path.join(process.env.DSH_HOME || path.join(os.homedir(), '.dsh'), PACKAGE, 'models.json');
const codec = name => ({ mode: 'strict', typeSymbol: `${PACKAGE}#${name}`, create: () => ({ parse: value => value }) });
const parameter = (name, optional = false) => ({ name, wire: name, source: 'json', codec: codec(name), acceptsUndefined: optional });
const descriptor = (method, parameters) => ({ id: `${PACKAGE}#${NAMESPACE}/${method}`, service: SERVICE, namespace: NAMESPACE, method, invocation: { kind: 'direct' }, parameters, result: codec('Result') });
const descriptors = [descriptor('summary', [parameter('filter', true)]), descriptor('snapshot', []), descriptor('session', [parameter('id')]), descriptor('policies', []), descriptor('savePolicy', [parameter('route'), parameter('policy')])];

class UsageService {
  constructor(ctx) { this.ctx = ctx; this.cache = new Map(); this.models = {}; this.defaults = {}; this.writeQueue = Promise.resolve(); }
  async init() {
    try {
      const saved = JSON.parse(await fs.readFile(settingsFile, 'utf8'));
      for (const [route, policy] of Object.entries(saved)) this.models[route] = validatePolicy(policy);
    } catch (error) { if (error.code !== 'ENOENT') throw new Error('用量统计的模型配置无法读取，请检查 models.json', { cause: error }); }
  }
  async policies() { return { ...this.defaults, ...this.models }; }
  async savePolicy(route, policy) {
    if (typeof route !== 'string' || !route.includes('/') || route.length > 512 || ['__proto__', 'constructor', 'prototype'].includes(route)) throw new TypeError('模型标识无效');
    const accepted = validatePolicy(policy);
    const write = async () => {
      const next = { ...this.models, [route]: accepted };
      await fs.mkdir(path.dirname(settingsFile), { recursive: true });
      const temporary = `${settingsFile}.${process.pid}.tmp`;
      await fs.writeFile(temporary, JSON.stringify(next, null, 2), { mode: 0o600 });
      await fs.rename(temporary, settingsFile);
      this.models = next;
      return this.policies();
    };
    const pending = this.writeQueue.then(write);
    this.writeQueue = pending.catch(() => {});
    return pending;
  }
  async read(id) {
    if (typeof id !== 'string' || id.length > 512) throw new TypeError('会话标识无效');
    const live = this.ctx.sessions.get(id);
    const stored = live ? null : await this.ctx.sessionPersistence.stat(id);
    const revision = live ? `live:${live.seq}` : stored?.revision;
    const cached = this.cache.get(id);
    if (cached && revision !== undefined && cached.revision === revision) return cached.value;
    const observation = await this.ctx.sessionQuery.observeSession(id, { projectionMode: 'none' });
    try {
      const value = fold(observation.events, observation.inheritedEventCount);
      // These routes belong to DSH's shipped DeepSeek cloud adapters.
      // Custom connections remain unclassified until the user confirms them.
      for (const entry of value.entries) {
        if (['deepseek-account', 'deepseek-official', 'deepseek-api-key'].includes(entry.provider)) {
          this.defaults[entry.route] = {type:'api',currency:'CNY',input:null,output:null,cacheRead:null,cacheWrite:null};
        }
      }
      this.cache.set(id, { revision: live ? `live:${observation.cursor + 1}` : observation.revision, value });
      return value;
    } finally { observation[Symbol.dispose](); }
  }
  async session(id) {
    const value = await this.read(id);
    return { ...summarize(value.entries, await this.policies()), missing: value.missing };
  }
  async collect() {
    const records = await this.ctx.sessionQuery.listSessions();
    const entries = [];
    let missing = 0;
    let failed = 0;
    let unsupported = 0;
    const results = new Array(records.length);
    let next = 0;
    const worker = async () => {
      while (next < records.length) {
        const index = next++;
        const record = records[index];
        const id = record.header?.id ?? record.session?.id ?? record.id;
        try { results[index] = await this.read(id); }
        catch (error) {
          failed++;
          for(let cause=error,depth=0;cause&&depth<6;cause=cause.cause,depth++) {
            if(cause.name==='SessionFormatUnsupportedError'||cause.name==='SessionFormatUnsupportedMigrationError') { unsupported++; break; }
          }
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, records.length) }, worker));
    for (const result of results) {
      if (result) { entries.push(...result.entries); missing += result.missing; }
    }
    return { entries, missing, failed, unsupported, sessions: records.length, updatedAt: Date.now() };
  }
  async snapshot() {
    const { entries, ...status } = await this.collect();
    const hourlyDay = dayKey(status.updatedAt);
    return { rows: dashboardRows(entries), hourlyRows: dashboardRows(entries.filter(entry=>entry.day===hourlyDay), true), hourlyDay, policies: await this.policies(), ...status };
  }
  async summary(filter = {}) {
    if (!filter || typeof filter !== 'object' || Array.isArray(filter)) throw new TypeError('筛选条件无效');
    const accepted = { type: ['all', 'local', 'api'].includes(filter.type) ? filter.type : 'all' };
    if (Number.isFinite(filter.since) && filter.since >= 0) accepted.since = filter.since;
    if (Number.isFinite(filter.until) && filter.until >= 0) accepted.until = filter.until;
    if (typeof filter.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(filter.day)) accepted.day = filter.day;
    const { entries, ...status } = await this.collect();
    const policies = await this.policies();
    return { ...summarize(entries, policies, accepted), heatmap: summarize(entries, policies, { type: accepted.type }).days, ...status };
  }
}

export const inject = ['sessionQuery', 'sessions', 'sessionPersistence', 'typert'];
export async function apply(ctx) {
  const service = new UsageService(ctx);
  await service.init();
  service.typertRemote = Object.freeze({ service, serviceKey: SERVICE, namespace: NAMESPACE });
  ctx.reflect.provide(SERVICE, service);
  const unregister = ctx.typert.register({ package: PACKAGE, face: 'host', schemas: [], model: { services: [], events: [], objects: [] }, invocations: descriptors });
  ctx.effect(() => () => { unregister(); service.cache.clear(); }, 'clear-usage: remote');
}
