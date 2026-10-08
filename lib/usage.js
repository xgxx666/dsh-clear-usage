// Only accounting metadata is retained. Message text never leaves DSH.
export const empty = () => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0, requests: 0, cacheReported: false, cacheUnreported: false, cacheInputKnown: 0, cacheReadKnown: 0 });
const count = value => Number.isSafeInteger(value) && value >= 0;
export function sample(event) {
  if (!['assistant/message', 'assistant/attempt'].includes(event.type)) return null;
  let value = event.data?.usage;
  if (value === undefined) {
    const chunks = event.data?.stream;
    if (Array.isArray(chunks)) {
      for (let i = chunks.length - 1; i >= 0; i--) {
        if (chunks[i]?.type === 'chunk' && chunks[i].chunk?.type === 'usage') {
          value = chunks[i].chunk.usage;
          break;
        }
      }
    }
  }
  if (!value || !count(value.inputTokens) || !count(value.outputTokens)) return null;
  if (['cacheReadTokens', 'cacheWriteTokens'].some(key => value[key] !== undefined && !count(value[key]))) return null;
  const buckets = { input: value.inputTokens, output: value.outputTokens, cacheRead: value.cacheReadTokens ?? 0, cacheWrite: value.cacheWriteTokens ?? 0 };
  const total = Object.values(buckets).reduce((a, b) => a + b, 0);
  if (!count(total)) return null;
  // Reasoning tokens are part of output, so they must not be added again.
  const cacheReported = value.cacheReadTokens !== undefined;
  return { ...buckets, total, requests: 1, cacheReported, cacheUnreported: !cacheReported, cacheInputKnown: cacheReported ? buckets.input + buckets.cacheRead + buckets.cacheWrite : 0, cacheReadKnown: cacheReported ? buckets.cacheRead : 0 };
}
export function add(target, value) {
  for (const key of ['input', 'output', 'cacheRead', 'cacheWrite', 'total', 'requests', 'cacheInputKnown', 'cacheReadKnown']) target[key] += value[key];
  target.cacheReported ||= value.cacheReported;
  target.cacheUnreported ||= value.cacheUnreported;
  return target;
}
export function cacheRate(value) {
  const input = value.input + value.cacheRead + value.cacheWrite;
  return input > 0 ? value.cacheRead / input : null;
}
export function dashboardRows(entries, hourly = false) {
  const rows = new Map();
  for (const entry of entries) {
    const hour = hourly ? new Date(entry.time).getHours() : null;
    const key = JSON.stringify([entry.day, entry.route, hour]);
    if (!rows.has(key)) rows.set(key, { day: entry.day, ...(hourly ? { hour } : {}), route: entry.route, provider: entry.provider, model: entry.model, ...empty() });
    add(rows.get(key), entry);
  }
  return [...rows.values()];
}
export function dayKey(time) {
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function routeFrom(source) {
  return typeof source?.provider === 'string' && typeof source?.model === 'string' ? { provider: source.provider, model: source.model } : null;
}
export function fold(events, inheritedEventCount = 0) {
  let route = { provider: 'unknown', model: 'unknown' };
  const attempts = new Map();
  const slots = new Map();
  let missing = 0;
  for (let offset = 0; offset < events.length; offset++) {
    const event = events[offset];
    const data = event.data || {};
    if (event.type === 'model/selection') route = routeFrom(data) || route;
    if (event.type === 'request/header') route = routeFrom(data.header) || routeFrom(data) || route;
    if (event.type === 'request/context') route = routeFrom(data) || route;
    const step = `${data.turn}:${data.step}`;
    if (event.type === 'llm/retry-started') {
      attempts.set(step, (attempts.get(step) || 0) + 1);
      continue;
    }
    // Inherited history is context, not a newly paid model call.
    if (offset < inheritedEventCount || !['assistant/message', 'assistant/attempt'].includes(event.type)) continue;
    const usage = sample(event);
    if (!usage) { missing++; continue; }
    if (!count(data.turn) || !count(data.step)) { missing++; continue; }
    const settledRoute = routeFrom(data.source) || route;
    const time = typeof event.time === 'number' ? event.time : Date.parse(event.time);
    if (!Number.isFinite(time)) { missing++; continue; }
    slots.set(`${step}:${attempts.get(step) || 0}`, {
      ...settledRoute, route: `${settledRoute.provider}/${settledRoute.model}`,
      turn: data.turn, step: data.step, time, day: dayKey(time), ...usage,
    });
  }
  return { entries: [...slots.values()], missing };
}
export function validatePolicy(value) {
  if (!value || !['local', 'api', 'unknown'].includes(value.type)) throw new TypeError('请选择模型类型');
  if (!['CNY', 'USD'].includes(value.currency)) throw new TypeError('币种只支持人民币或美元');
  const result = { type: value.type, currency: value.currency };
  if (value.displayName !== undefined) {
    if (typeof value.displayName !== 'string' || value.displayName.length > 160) throw new TypeError('模型显示名称无效');
    const displayName = value.displayName.trim();
    if (displayName) result.displayName = displayName;
  }
  if (value.hidden !== undefined && typeof value.hidden !== 'boolean') throw new TypeError('模型删除状态无效');
  if (value.hidden === true) result.hidden = true;
  for (const key of ['input', 'output', 'cacheRead', 'cacheWrite']) {
    const price = value[key];
    if (price !== null && price !== undefined && (typeof price !== 'number' || !Number.isFinite(price) || price < 0 || price > 1e9)) throw new TypeError('单价必须为非负数字，未配置请留空');
    result[key] = price ?? null;
  }
  return result;
}
export function estimate(entry, policy) {
  if (!policy || policy.type !== 'api') return null;
  let amount = 0;
  for (const key of ['input', 'output', 'cacheRead', 'cacheWrite']) {
    if (entry[key] === 0) continue;
    if (typeof policy[key] !== 'number' || !Number.isFinite(policy[key])) return null;
    amount += entry[key] * policy[key];
  }
  return { amount: amount / 1e6, currency: policy.currency, estimated: true };
}
export function summarize(entries, policies = {}, { since = 0, until = Infinity, type = 'all', day = null } = {}) {
  const totals = empty();
  const models = new Map();
  const days = new Map();
  const money = {};
  let unpriced = 0;
  let apiRequests = 0;
  for (const entry of entries) {
    const policy = policies[entry.route];
    const modelType = policy?.type || 'unknown';
    if (entry.time < since || entry.time > until || (type !== 'all' && type !== modelType) || (day && entry.day !== day)) continue;
    add(totals, entry);
    if (!models.has(entry.route)) models.set(entry.route, { route: entry.route, provider: entry.provider, model: entry.model, displayName: policy?.displayName || entry.model, type: modelType, ...empty(), amounts: {}, unpriced: 0 });
    const model = models.get(entry.route);
    add(model, entry);
    if (!days.has(entry.day)) days.set(entry.day, { day: entry.day, ...empty() });
    add(days.get(entry.day), entry);
    if (modelType === 'api') {
      apiRequests++;
      const cost = estimate(entry, policy);
      if (cost) {
        money[cost.currency] = (money[cost.currency] || 0) + cost.amount;
        model.amounts[cost.currency] = (model.amounts[cost.currency] || 0) + cost.amount;
      } else { unpriced++; model.unpriced++; }
    }
  }
  return { totals, models: [...models.values()].sort((a,b) => b.total - a.total), days: [...days.values()].sort((a,b) => a.day.localeCompare(b.day)), money, unpriced, apiRequests, cacheRate: cacheRate(totals) };
}
