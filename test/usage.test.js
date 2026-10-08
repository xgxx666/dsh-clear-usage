import test from 'node:test';
import assert from 'node:assert/strict';
import { fold, summarize, sample, validatePolicy, estimate } from '../lib/usage.js';
const time = new Date(2026,9,8,12).getTime();
const event = (usage, overrides={}) => ({type:'assistant/message',seq:1,time,data:{turn:0,step:0,usage,...overrides}});
const usage = (inputTokens=100,outputTokens=20) => ({inputTokens,outputTokens,cacheReadTokens:50});

test('缓存输入是独立桶，思考已包含在输出中',()=>{
  assert.equal(sample(event({...usage(),reasoningTokens:10})).total,170);
  assert.equal(summarize(fold([event(usage())]).entries).cacheRate,1/3);
});
test('同一次调用后来的用量覆盖旧值，不能重复累计',()=>{
  const result=fold([event(usage(80,10)),event(usage(100,20))]);
  assert.equal(result.entries.length,1);assert.equal(result.entries[0].total,170);
});
test('重试的调用分别累计',()=>{
  const result=fold([event(usage()),{type:'llm/retry-started',time,data:{turn:0,step:0}},event(usage(200,40))]);
  assert.equal(result.entries.length,2);assert.equal(summarize(result.entries).totals.total,460);
});
test('会话分支继承历史不进入全局消耗',()=>{
  const result=fold([event(usage()),event(usage(200,40),{turn:1})],1);
  assert.equal(result.entries.length,1);assert.equal(result.entries[0].turn,1);
});
test('流内最后一个 usage 样本作为结算值',()=>{
  const record=event(undefined,{stream:[{type:'chunk',chunk:{type:'usage',usage:usage(10,5)}},{type:'chunk',chunk:{type:'usage',usage:usage()}}]});
  assert.equal(sample(record).total,170);
});
test('不同连接下的同名模型分别统计',()=>{
  const entries=fold([event(usage(),{source:{provider:'local',model:'same'}}),event(usage(),{turn:1,source:{provider:'cloud',model:'same'}})]).entries;
  const summary=summarize(entries,{'local/same':{type:'local'},'cloud/same':{type:'api'}});
  assert.equal(summary.models.length,2);assert.equal(summary.apiRequests,1);assert.equal(summary.unpriced,1);
});
test('从原生 request/context 读取模型归属',()=>{
  const result=fold([{type:'request/context',time,data:{provider:'ninfer',model:'qwen'}},event(usage())]);
  assert.equal(result.entries[0].route,'ninfer/qwen');
});
test('本地模型始终不计算费用，未配置 API 单价不能当作零',()=>{
  const entry=sample(event(usage()));
  assert.equal(estimate(entry,{type:'local',input:10,output:10,cacheRead:10}),null);
  assert.equal(estimate(entry,{type:'api',currency:'CNY',input:1,output:2,cacheRead:null}),null);
  assert.equal(estimate(entry,{type:'api',currency:'CNY',input:0,output:0,cacheRead:0}).amount,0);
});
test('API 费用按不重叠 token 桶计算并明确标为预估',()=>{
  const result=estimate(sample(event(usage())),{type:'api',currency:'CNY',input:2,output:3,cacheRead:1});
  assert.deepEqual(result,{amount:0.00031,currency:'CNY',estimated:true});
});
test('缺失缓存字段时遵循 DSH 的零值口径并保留缺失标记',()=>{
  const result=summarize(fold([event({inputTokens:100,outputTokens:20})]).entries);
  assert.equal(result.cacheRate,0);assert.equal(result.totals.cacheReported,false);
});
test('混合调用按原生输入桶计算整体缓存命中率',()=>{
  const entries=fold([event(usage()),event({inputTokens:10000,outputTokens:20},{turn:1})]).entries;
  const result=summarize(entries);
  assert.equal(result.cacheRate,50/10150);assert.equal(result.totals.cacheUnreported,true);
});
test('管理列表删除可恢复，保留原有类型与兼容字段',()=>{
  const original={type:'local',currency:'CNY',input:1,output:2,cacheRead:null,cacheWrite:null};
  const deleted=validatePolicy({...original,hidden:true});
  assert.equal(deleted.hidden,true);assert.equal(deleted.type,'local');assert.equal(deleted.input,1);
  assert.deepEqual(validatePolicy({...deleted,hidden:false}),original);
  assert.throws(()=>validatePolicy({...original,hidden:'yes'}));
});
test('拒绝负数、非整数和无效单价',()=>{
  assert.equal(sample(event({inputTokens:-1,outputTokens:1})),null);
  assert.equal(sample(event({inputTokens:1.2,outputTokens:1})),null);
  assert.throws(()=>validatePolicy({type:'api',currency:'CNY',input:-1}));
});
test('时间和类型筛选不混入其他用量，币种分别累计',()=>{
  const entries=fold([event(usage(),{source:{provider:'a',model:'one'}}),event(usage(),{turn:1,source:{provider:'b',model:'two'}})]).entries;
  const policies={'a/one':{type:'api',currency:'CNY',input:1,output:1,cacheRead:1},'b/two':{type:'api',currency:'USD',input:1,output:1,cacheRead:1}};
  assert.equal(Object.keys(summarize(entries,policies).money).length,2);
  assert.equal(summarize(entries,policies,{since:time+1}).totals.total,0);
  assert.equal(summarize(entries,policies,{type:'local'}).totals.total,0);
});
