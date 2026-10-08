import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { fold, dashboardRows, summarize, dayKey } from '../lib/usage.js';

let factory;
vm.runInNewContext(await fs.readFile(new URL('../client.js', import.meta.url), 'utf8'), {
  window: { __ModuleLoader__: { load: entry => { factory = entry.factory; } } },
});
const { projectSnapshot, createSnapshotCache } = factory(() => ({ Component: class {}, createElement() {} }));
const plain = value => JSON.parse(JSON.stringify(value));
const midnight = new Date(2026, 9, 8).getTime();
const events = [
  { type:'assistant/message',seq:0,time:midnight-3600000,data:{turn:0,step:0,source:{provider:'cloud',model:'same'},usage:{inputTokens:100,outputTokens:20,cacheReadTokens:50}} },
  { type:'assistant/message',seq:1,time:midnight+3600000,data:{turn:1,step:0,source:{provider:'local',model:'same'},usage:{inputTokens:200,outputTokens:40}} },
  { type:'assistant/message',seq:2,time:midnight+7200000,data:{turn:2,step:0,source:{provider:'cloud',model:'same'},usage:{inputTokens:300,outputTokens:60,cacheReadTokens:100}} },
  { type:'assistant/message',seq:3,time:midnight+10800000,data:{turn:3,step:0,source:{provider:'cloud',model:'same'},usage:{inputTokens:400,outputTokens:80,cacheReadTokens:200}} },
];
const entries = fold(events).entries;
const policies = {'local/same':{type:'local'},'cloud/same':{type:'api'}};
const snapshot = {rows:dashboardRows(entries),hourlyRows:dashboardRows(entries.filter(entry=>entry.day==='2026-10-08'),true),hourlyDay:'2026-10-08',policies,missing:0,failed:0,unsupported:0,sessions:2,updatedAt:1};
const tokenModel = model => ({route:model.route,type:model.type,total:model.total,input:model.input,output:model.output,cacheRead:model.cacheRead,cacheWrite:model.cacheWrite});

test('按天和连接合并，保留全部已记录 token',()=>{
  assert.equal(snapshot.rows.length,3);
  assert.equal(snapshot.rows.reduce((sum,row)=>sum+row.total,0),entries.reduce((sum,entry)=>sum+entry.total,0));
});
test('每小时图补齐 24 小时，与当天总量和模型筛选保持一致',()=>{
  for(const type of ['all','local','api']) {
    const actual=plain(projectSnapshot(snapshot,policies,{type,since:midnight,hourlyDay:'2026-10-08'}));
    assert.equal(actual.hours.length,24);
    assert.equal(actual.hours.reduce((sum,row)=>sum+row.total,0),actual.totals.total);
    assert.equal(actual.hours.reduce((sum,row)=>sum+row.requests,0),actual.totals.requests);
    assert.equal(actual.hours[0].total,0);assert.equal(actual.hours[23].total,0);
  }
  const all=projectSnapshot(snapshot,policies,{since:midnight,hourlyDay:'2026-10-08'});
  assert.equal(all.hours[1].total,240);assert.equal(all.hours[2].total,460);assert.equal(all.hours[3].total,680);
  const next={...policies,'local/same':{type:'api'}};
  assert.equal(projectSnapshot(snapshot,next,{type:'local',since:midnight,hourlyDay:'2026-10-08'}).hours[1].total,0);
  assert.equal(projectSnapshot(snapshot,next,{type:'api',since:midnight,hourlyDay:'2026-10-08'}).hours[1].total,240);
});
test('小时归档使用本地结算时间，不混入前后两天或重复调用更新',()=>{
  const hourlyEntries=fold([
    {...events[0],time:midnight-1,data:{...events[0].data,turn:0}},
    {...events[1],time:midnight,data:{...events[1].data,turn:1}},
    {...events[2],time:midnight+3600000-1,data:{...events[2].data,turn:2}},
    {...events[2],time:midnight+1800000,data:{...events[2].data,turn:5}},
    {...events[3],time:midnight+86400000-1,data:{...events[3].data,turn:3}},
    {...events[3],time:midnight+86400000-1,data:{...events[3].data,turn:3,usage:{inputTokens:400,outputTokens:90,cacheReadTokens:200,cacheWriteTokens:10}}},
    {...events[3],time:midnight+86400000,data:{...events[3].data,turn:4}},
  ]).entries;
  const hourlySnapshot={...snapshot,rows:dashboardRows(hourlyEntries),hourlyRows:dashboardRows(hourlyEntries,true)};
  const actual=projectSnapshot(hourlySnapshot,policies,{since:midnight,until:midnight+86400000-1,hourlyDay:'2026-10-08'});
  assert.equal(actual.hours[0].total,1160);assert.equal(actual.hours[23].total,700);
  const merged=hourlySnapshot.hourlyRows.filter(row=>row.day==='2026-10-08'&&row.hour===0&&row.route==='cloud/same');
  assert.equal(merged.length,1);assert.equal(merged[0].requests,2);assert.equal(merged[0].total,920);
  assert.equal(actual.hours[23].requests,1);assert.equal(actual.hours[23].cacheWrite,10);
  assert.equal(actual.hours.reduce((sum,row)=>sum+row.total,0),actual.totals.total);
});
test('旧版本或跨午夜的小时快照明确不可用，不显示假的零值图',()=>{
  assert.equal(projectSnapshot({...snapshot,hourlyRows:undefined},policies,{hourlyDay:'2026-10-08'}).hours,null);
  assert.equal(projectSnapshot(snapshot,policies,{hourlyDay:'2026-10-09'}).hours,null);
  assert.equal(projectSnapshot(snapshot,policies).hours,null);
});
test('即时筛选与原来的完整日志汇总一致',()=>{
  for(const type of ['all','local','api']) {
    for(const filter of [{type},{type,since:midnight},{type,day:'2026-10-07'}]) {
      const expected=summarize(entries,policies,filter);
      const actual=plain(projectSnapshot(snapshot,policies,filter));
      assert.deepEqual(actual.totals,expected.totals);
      assert.deepEqual(actual.models.map(tokenModel),expected.models.map(tokenModel));
      assert.deepEqual(actual.days,expected.days);
      assert.equal(actual.cacheRate,expected.cacheRate);
    }
  }
});
test('用量列表优先显示自定义名称，未设置时回退到原模型名',()=>{
  const namedPolicies={...policies,'local/same':{type:'local',displayName:'Qwen 本地模型'}};
  const actual=plain(projectSnapshot(snapshot,namedPolicies));
  assert.equal(actual.models.find(model=>model.route==='local/same').displayName,'Qwen 本地模型');
  assert.equal(actual.models.find(model=>model.route==='cloud/same').displayName,'same');
});
test('类型修改只重算快照，不需要重新读取日志',()=>{
  const next={...policies,'local/same':{type:'api'}};
  assert.equal(projectSnapshot(snapshot,policies,{type:'local'}).totals.total,240);
  assert.equal(projectSnapshot(snapshot,next,{type:'local'}).totals.total,0);
  assert.equal(projectSnapshot(snapshot,next,{type:'api'}).totals.total,summarize(entries).totals.total);
});
test('快速来回切换不会污染其他筛选的数据',()=>{
  const before=JSON.stringify(snapshot);
  const all=plain(projectSnapshot(snapshot,policies));
  for(let i=0;i<20;i++) {
    projectSnapshot(snapshot,policies,{type:'local',since:midnight});
    projectSnapshot(snapshot,policies,{type:'api',day:'2026-10-07'});
  }
  assert.deepEqual(plain(projectSnapshot(snapshot,policies)),all);
  assert.equal(JSON.stringify(snapshot),before);
});
test('选中某日时仍保留该类型的完整热力图数据',()=>{
  const selected=projectSnapshot(snapshot,policies,{type:'api',day:'2026-10-08'});
  assert.equal(selected.days.length,1);
  assert.equal(selected.heatmap.length,2);
});
test('自定义日期包含开始日和结束日，不能混入其他日期',()=>{
  const filter={since:midnight-86400000,until:midnight-1};
  const actual=projectSnapshot(snapshot,policies,filter);
  const expected=summarize(entries,policies,filter);
  assert.equal(actual.totals.total,expected.totals.total);
  assert.equal(actual.days.length,1);assert.equal(actual.days[0].day,'2026-10-07');
  assert.equal(projectSnapshot(snapshot,policies,{since:midnight+86400000}).totals.total,0);
});
test('删除管理项不会抹掉历史 token',()=>{
  const hidden={...policies,'cloud/same':{type:'api',hidden:true}};
  assert.equal(projectSnapshot(snapshot,hidden).totals.total,projectSnapshot(snapshot,policies).totals.total);
  assert.equal(projectSnapshot(snapshot,hidden).models.length,2);
});
test('重复打开保留快照且复用正在进行的读取',async()=>{
  const responses=[];
  const cache=createSnapshotCache(()=>new Promise((resolve,reject)=>responses.push({resolve,reject})));
  const first=cache.load();
  assert.equal(cache.load(),first);
  await Promise.resolve();
  assert.equal(responses.length,1);
  responses.shift().resolve(snapshot);
  await first;
  assert.equal(cache.value,snapshot);
  const refresh=cache.load();
  assert.equal(cache.value,snapshot);
  await Promise.resolve();
  const updated={...snapshot,updatedAt:2};
  responses.shift().resolve(updated);
  await refresh;
  assert.equal(cache.value,updated);
});
test('后台更新不会覆盖刚保存的类型和名称，读取失败仍保留快照',async()=>{
  const responses=[];
  const cache=createSnapshotCache(()=>new Promise((resolve,reject)=>responses.push({resolve,reject})));
  const first=cache.load();
  await Promise.resolve();
  responses.shift().resolve(snapshot);
  await first;
  const refresh=cache.load();
  await Promise.resolve();
  cache.savePolicies({...policies,'local/same':{type:'api',displayName:'刚保存的名称'}});
  responses.shift().resolve({...snapshot,policies:{...policies,'new/model':{type:'api'}},updatedAt:2});
  await refresh;
  assert.deepEqual(plain(cache.value.policies['local/same']),{type:'api',displayName:'刚保存的名称'});
  assert.equal(cache.value.policies['new/model'].type,'api');
  const retained=cache.value;
  const failed=cache.load();
  await Promise.resolve();
  responses.shift().reject(new Error('暂时断开'));
  await assert.rejects(failed,/暂时断开/);
  assert.equal(cache.value,retained);
});
const previousHome=process.env.DSH_HOME;
process.env.DSH_HOME=path.join(path.dirname(fileURLToPath(import.meta.url)),'unused-snapshot-test-home');
let apply;
try { ({apply}=await import('../index.js?snapshot-test')); }
finally { if(previousHome===undefined)delete process.env.DSH_HOME;else process.env.DSH_HOME=previousHome; }

test('实际宿主快照接口只查询一次会话目录，并且不返回消息正文',async()=>{
  let service,listCalls=0,readCalls=0,disposed=0;
  const today=new Date();today.setHours(0,0,0,0);
  const ownEvents=events.map(event=>({...event,time:event.time-midnight+today.getTime(),data:{...event.data,message:{content:[{type:'text',text:'secret fixture content'}]}}}));
  const ctx={
    sessions:{get:id=>id==='one'?{seq:ownEvents.length}:undefined},
    sessionPersistence:{stat:async()=>{throw new Error('实时会话不应查询磁盘');}},
    sessionQuery:{
      listSessions:async()=>{listCalls++;return [{header:{id:'one'}}];},
      observeSession:async()=>{readCalls++;return {events:ownEvents,inheritedEventCount:0,cursor:ownEvents.length-1,[Symbol.dispose]:()=>{disposed++;}};},
    },
    reflect:{provide:(_key,value)=>{service=value;}},
    typert:{register:contribution=>{assert.ok(contribution.invocations.some(item=>item.method==='snapshot'));return ()=>{};}},
    effect:()=>{},
  };
  await apply(ctx);
  const result=await service.snapshot();
  assert.equal(listCalls,1);assert.equal(readCalls,1);assert.equal(disposed,1);
  assert.equal(result.rows.length,3);
  assert.equal(result.rows.reduce((sum,row)=>sum+row.total,0),summarize(entries).totals.total);
  assert.equal(result.hourlyDay,dayKey(result.updatedAt));
  assert.equal(result.hourlyRows.length,3);
  assert.equal(result.hourlyRows.every(row=>row.day===result.hourlyDay),true);
  assert.equal(result.hourlyRows.reduce((sum,row)=>sum+row.total,0),1380);
  assert.equal(JSON.stringify(result).includes('secret fixture content'),false);
  for(const type of ['all','local','api'])projectSnapshot(result,policies,{type});
  assert.equal(listCalls,1);assert.equal(readCalls,1);
});
test('历史读取最多并行四个会话，并保留失败提示和版本缓存',async()=>{
  let service,active=0,peak=0,reads=0,disposed=0;
  const records=Array.from({length:9},(_,id)=>({header:{id:String(id)}}));
  const revisions=new Map(records.map(record=>[record.header.id,1]));
  const ctx={
    sessions:{get:()=>undefined},
    sessionPersistence:{stat:async id=>({revision:revisions.get(id)})},
    sessionQuery:{
      listSessions:async()=>records,
      observeSession:async id=>{
        reads++;active++;peak=Math.max(peak,active);
        const revision=revisions.get(id);
        await new Promise(resolve=>setTimeout(resolve,10));
        active--;
        if(id==='8')throw Object.assign(new Error('旧格式'),{name:'SessionFormatUnsupportedError'});
        return {revision,events:[{...events[0],data:{...events[0].data,source:{provider:'parallel',model:id},usage:{inputTokens:revision*100,outputTokens:20}}}],inheritedEventCount:0,[Symbol.dispose]:()=>{disposed++;}};
      },
    },
    reflect:{provide:(_key,value)=>{service=value;}},
    typert:{register:()=>()=>{}},effect:()=>{},
  };
  await apply(ctx);
  const first=await service.snapshot();
  assert.ok(peak>1&&peak<=4);
  assert.equal(first.sessions,9);assert.equal(first.failed,1);assert.equal(first.unsupported,1);
  assert.equal(first.rows.reduce((sum,row)=>sum+row.total,0),960);
  assert.equal(reads,9);assert.equal(disposed,8);
  const cached=await service.snapshot();
  assert.deepEqual(cached.rows,first.rows);
  assert.equal(reads,10);
  revisions.set('0',2);
  const updated=await service.snapshot();
  assert.equal(updated.rows.reduce((sum,row)=>sum+row.total,0),1060);
  assert.equal(reads,12);assert.equal(disposed,9);
});
