import { pathToFileURL } from 'node:url';
import { fold, dashboardRows } from '../lib/usage.js';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const base = 'D:/DSH/DeepSeek Harness/resources/app.asar/dsh/node_modules/@deepseek-ai/';
const { Context } = await import(pathToFileURL(base + 'cordis/lib/index.js'));
const { default: Persistence } = await import(pathToFileURL(base + 'dsh-session-persistence-jsonl/lib/index.js'));
const ctx = new Context();
const backend = new Persistence(ctx, {root:'C:/Users/xgxx/.dsh/sessions',compression:'zstd'});
let totals=0,failed=0,unknown=0,missing=0;
const routes = new Set();
const allEntries=[];
let latestLocal=null;
let examplePrinted=false;
let cachePrinted=false;
for(const snapshot of await backend.list()) {
  let reader;
  try {
    reader=await backend.open(snapshot.header.id,'read');
    const {events}=await reader.read();
    const inherited=reader.inheritedEventCount ?? 0;
    const result=fold(events,inherited);
    allEntries.push(...result.entries);
    for(const entry of result.entries) {
      if((entry.provider.startsWith('ninfer')||entry.provider==='bonsai-q3-local')&&(!latestLocal||entry.time>latestLocal.time))latestLocal=entry;
    }
    totals+=result.entries.reduce((sum,entry)=>sum+entry.total,0);
    missing+=result.missing;
    unknown+=result.entries.filter(entry=>entry.provider==='unknown').length;
    for(const entry of result.entries)routes.add(entry.route);
    if(!examplePrinted&&result.entries.some(entry=>entry.provider==='unknown')) {
      for(const event of events.filter(event=>['model/selection','request/header','request/context'].includes(event.type)).slice(0,5)) {
        console.log(JSON.stringify({type:event.type,keys:Object.keys(event.data),provider:event.data.provider,model:event.data.model,headerKeys:event.data.header&&Object.keys(event.data.header),headerModel:event.data.header?.model,source:event.data.source}));
      }
      examplePrinted=true;
    }
    if(!cachePrinted&&events.some(event=>event.type==='request/context'&&event.data.provider?.startsWith('ninfer'))) {
      const event=events.find(event=>event.type==='assistant/message');
      console.log(JSON.stringify({type:'local-usage-fields',keys:Object.keys(event.data.usage||{}),usage:event.data.usage,source:event.data.source}));
      cachePrinted=true;
    }
  } catch(error) {
    failed++;
    if(failed<=3)console.log(JSON.stringify({type:'read-error',name:error.name,message:error.message}));
  } finally { await reader?.close(); }
}
console.log(JSON.stringify({totals,failed,unknown,missing,routes:[...routes]}));
if(latestLocal)console.log(JSON.stringify({type:'latest-local-cache',route:latestLocal.route,time:latestLocal.time,input:latestLocal.input,output:latestLocal.output,cacheRead:latestLocal.cacheRead,cacheFieldReported:latestLocal.cacheReported}));
let factory;
vm.runInNewContext(await fs.readFile(new URL('../client.js',import.meta.url),'utf8'),{window:{__ModuleLoader__:{load:entry=>{factory=entry.factory;}}}});
const {projectSnapshot}=factory(()=>({Component:class{},createElement(){}}));
const snapshot={rows:dashboardRows(allEntries),missing,failed,unsupported:failed,sessions:0,updatedAt:Date.now()};
const started=performance.now();
let last;
for(let i=0;i<500;i++)last=projectSnapshot(snapshot,{});
console.log(JSON.stringify({type:'snapshot-filter-check',entries:allEntries.length,rows:snapshot.rows.length,totalMatches:last.totals.total===totals,averageFilterMs:(performance.now()-started)/500}));
