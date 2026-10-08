window.__ModuleLoader__.load({
  id: 'dsh-clear-usage',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const PACKAGE = 'dsh-clear-usage';
    const codec = name => ({ mode: 'strict', typeSymbol: `${PACKAGE}#${name}`, create: () => ({ parse: value => value }) });
    const param = (name, optional = false) => ({ name, wire: name, source: 'json', codec: codec(name), acceptsUndefined: optional });
    const endpoint = (method, parameters) => ({ id: `${PACKAGE}#clearUsage/${method}`, service: 'clearUsage', namespace: 'clearUsage', method, invocation: { kind: 'direct' }, parameters, result: codec('Result') });
    const contribution = { package: PACKAGE, descriptors: [endpoint('snapshot', []), endpoint('savePolicy', [param('route'), param('policy')])] };
    const zh = {
      nav: '用量统计', title: '用量统计', token: 'Token 用量', cache: '缓存命中', input: '未缓存输入', output: '输出', read: '缓存读取', write: '缓存写入', unavailable: '暂无数据',
      today: '今天', month: '本月', allTime: '全部', custom: '自定义', all: '全部模型', local: '本地模型', api: 'API 模型', unknown: '待设置类型',
      loading: '正在读取用量…', updating: '正在更新用量…', error: '读取失败，请重试', refresh: '刷新', total: '消耗 token',
      heat: 'Token 活动', models: '模型用量', share: '占比', empty: '这段时间没有已记录的用量',
      types: '模型类型', typeHint: '类型用于筛选，点击自动保存；可设置显示名称。用量列表中“待设置类型”可点选后跳转到对应模型。删除只移出管理列表，历史用量保留。', unknownShort: '待确认', localShort: '本地', apiShort: 'API', saving: '保存中…', saved: '已保存', delete: '删除', restore: '恢复', removed: '已删除的模型', displayName: '显示名称', chooseType: '点击选择本地或 API',
      startDate: '开始日期', endDate: '结束日期', query: '查询', invalidDates: '请选择有效日期，结束日期不能早于开始日期。',
      modelType: '模型类型',
      missing: '部分记录未提供可用的 token 数据，已记录用量可能不完整', failed: '部分会话读取失败，当前结果不完整',
      clearDay: '取消日期筛选', filters: '筛选用量',
      nativeStats: '采用 DSH 原生统计口径', oldRecords: '部分旧格式会话暂不支持读取', recorded: '显示已记录的用量',
    };
    const CSS = `
      .cu-root{color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1.5;--cu-ink:var(--dsw-alias-brand-primary);--cu-chart:#2385e8;--cu-bg:var(--dsw-alias-bg-base)}
      .cu-root *{box-sizing:border-box}.cu-root button,.cu-root input,.cu-root select{font:inherit;color:inherit}
      .cu-root button{cursor:pointer}.cu-root button:disabled{cursor:default;opacity:.5}
      .cu-root button:focus-visible,.cu-root select:focus-visible,.cu-root input:focus-visible{outline:2px solid var(--cu-ink);outline-offset:2px}
      .cu-note{font-size:11px;color:var(--dsw-alias-label-secondary);margin:8px 0 0}
      .cu-page{padding:4px;max-width:940px;margin:0 auto}.cu-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px}.cu-title{margin:0;font-size:18px;font-weight:600}.cu-button{border:1px solid var(--dsw-alias-border-l1);background:var(--cu-bg);border-radius:8px;padding:5px 10px}
      .cu-top-actions{display:flex;align-items:center;gap:8px}
      .cu-filters{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px}.cu-tabs{display:flex;gap:3px;padding:3px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-2)}.cu-tabs button{background:transparent;border:0;border-radius:7px;padding:6px 12px;font-weight:600;color:var(--dsw-alias-label-secondary)}.cu-tabs button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.cu-tabs button[aria-pressed=true]{background:#176fc1;color:#fff;box-shadow:0 2px 5px #176fc126}
      .cu-date-range{display:flex;gap:9px;align-items:flex-end;flex-wrap:wrap;margin-bottom:18px}.cu-date-range label{flex:1;min-width:135px;font-size:11px;color:var(--dsw-alias-label-secondary)}.cu-date-range input{display:block;width:100%;margin-top:5px;padding:7px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--cu-bg);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px}.cu-date-range .cu-button{padding:7px 12px}
      .cu-filter{position:relative}.cu-filter-trigger{display:flex;align-items:center;justify-content:space-between;gap:16px;min-width:116px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--cu-bg);padding:7px 11px;font-size:12px;line-height:1.4}.cu-filter-trigger:hover,.cu-filter-trigger[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}.cu-filter-arrow{color:var(--dsw-alias-label-secondary);transition:transform .15s}.cu-filter-trigger[aria-expanded=true] .cu-filter-arrow{transform:rotate(180deg)}
      .cu-filter-menu{position:absolute;right:0;top:calc(100% + 7px);z-index:20;width:172px;padding:5px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--cu-bg);box-shadow:0 8px 24px color-mix(in srgb,var(--dsw-alias-label-primary) 13%,transparent)}.cu-filter-option{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:9px 10px;border:0;border-radius:7px;background:transparent;text-align:left;font-size:12px;line-height:1.4}.cu-filter-option[aria-selected=true]{font-weight:600}.cu-filter-option:hover,.cu-filter-option:focus-visible{background:var(--dsw-alias-interactive-bg-hover);outline:none!important}.cu-filter-check{width:15px;height:15px;color:var(--cu-ink)}
      .cu-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:0 0 22px}.cu-card{padding:17px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px}.cu-label{font-size:12px;color:var(--dsw-alias-label-secondary)}.cu-value{font-size:25px;font-weight:600;margin-top:6px;letter-spacing:-.5px;font-variant-numeric:tabular-nums}.cu-value small{font-size:12px;font-weight:400;letter-spacing:0}
      .cu-section{border-top:1px solid var(--dsw-alias-border-l1);padding:20px 0}.cu-section-title{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:14px}.cu-section h3{margin:0;font-size:13px;font-weight:600}.cu-muted{color:var(--dsw-alias-label-secondary);font-size:12px}
      .cu-calendar-scroll{max-width:100%;overflow-x:auto;padding:2px 1px 5px}.cu-heat{display:grid;gap:2px;width:max-content}.cu-week{display:grid;grid-template-rows:repeat(7,9px);gap:2px}.cu-day{aspect-ratio:1;border:0;border-radius:3px;padding:0;background:var(--dsw-alias-border-l1);min-width:0;position:relative}.cu-day[data-level="1"]{background:color-mix(in srgb,var(--cu-chart) 18%,var(--cu-bg))}.cu-day[data-level="2"]{background:color-mix(in srgb,var(--cu-chart) 38%,var(--cu-bg))}.cu-day[data-level="3"]{background:color-mix(in srgb,var(--cu-chart) 65%,var(--cu-bg))}.cu-day[data-level="4"]{background:var(--cu-chart)}.cu-day[aria-pressed=true]{outline:2px solid var(--dsw-alias-label-primary);outline-offset:1px}.cu-day:disabled{visibility:hidden;opacity:1}
      .cu-months{display:grid;gap:2px;width:max-content;font-size:10px;color:var(--dsw-alias-label-secondary);margin-bottom:5px}.cu-month-label{white-space:nowrap}
      .cu-heat-tooltip{position:fixed;z-index:1400;transform:translate(-50%,-100%);border-radius:12px;padding:9px 13px;background:#18191c;color:#fff;box-shadow:0 4px 14px #0002;font-size:12px;line-height:1.45;pointer-events:none;white-space:nowrap}.cu-heat-tooltip strong{display:block;font-size:13px;font-weight:600}.cu-heat-tooltip span{display:block;color:#ffffffb3}
      .cu-ring-tooltip{position:fixed;z-index:1400;transform:translate(-50%,-100%);max-width:min(280px,calc(100vw - 24px));border-radius:12px;padding:9px 13px;background:#18191c;color:#fff;box-shadow:0 4px 14px #0002;font-size:12px;line-height:1.45;pointer-events:none;overflow-wrap:anywhere}.cu-ring-tooltip strong{display:block;font-size:13px;font-weight:600}.cu-ring-tooltip span{display:block;color:#ffffffb3}
      .cu-calendar-scroll::-webkit-scrollbar{height:5px}.cu-calendar-scroll::-webkit-scrollbar-thumb{border-radius:5px;background:var(--dsw-alias-border-l2)}
      .cu-breakdown{display:grid;gap:22px}.cu-ring{width:190px;height:190px;margin:4px auto 0;display:grid;place-items:center;position:relative;flex-shrink:0}.cu-ring-chart{display:block;width:190px;height:190px}.cu-ring-center{z-index:1;position:absolute;text-align:center;font-size:23px;font-weight:600}.cu-ring-center small{display:block;font-size:12px;font-weight:400;color:var(--dsw-alias-label-secondary);margin-top:4px}
      .cu-model-list{display:grid}.cu-model-row{border-bottom:1px solid var(--dsw-alias-border-l1);padding:12px 0}.cu-model-row:last-child{border-bottom:0}.cu-model-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:start}.cu-model-name{font-size:12px;font-weight:500;line-height:1.5;overflow-wrap:anywhere}.cu-model-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--cu-model-color);margin-right:8px}.cu-model-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:6px 0 0 16px}.cu-model-number{text-align:right;font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}.cu-model-number small{font-size:10px;font-weight:400;color:var(--dsw-alias-label-secondary);margin-left:4px}.cu-model-badge{font-size:10px;line-height:1.5;border:1px solid var(--dsw-alias-border-l1);border-radius:5px;padding:2px 6px;background:var(--dsw-alias-bg-layer-2);white-space:nowrap}.cu-model-share{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
      .cu-model-type-link{color:var(--cu-ink);cursor:pointer}.cu-model-type-link:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover)}
      .cu-types summary{cursor:pointer;font-size:12px;font-weight:500}.cu-type-list{margin-top:12px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:0 12px}.cu-type-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding:13px 0;border-bottom:1px solid var(--dsw-alias-border-l1);scroll-margin:28px}.cu-type-row:last-child{border-bottom:0}.cu-type-name{font-size:12px;font-weight:500;line-height:1.5;overflow-wrap:anywhere}.cu-type-display-name{display:flex;flex-direction:column;gap:3px;width:min(100%,300px);margin-top:7px;font-size:10px;color:var(--dsw-alias-label-secondary)}.cu-display-name-input{width:100%;padding:4px 7px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--cu-bg);font-size:11px}.cu-type-options{display:flex;gap:3px;padding:3px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-2)}.cu-type-options button{border:0;border-radius:6px;background:transparent;padding:5px 8px;font-size:11px;line-height:1.4;color:var(--dsw-alias-label-secondary)}.cu-type-options button[aria-pressed=true]{background:var(--cu-bg);color:var(--dsw-alias-label-primary);font-weight:600;box-shadow:0 1px 4px color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent)}.cu-type-status{font-size:10px;text-align:right;color:var(--dsw-alias-label-secondary);margin-top:4px}.cu-warning{color:var(--dsw-alias-state-error-primary);font-size:12px;margin:10px 0}
      .cu-type-controls{display:flex;align-items:center;gap:8px}.cu-type-delete{border:0;border-radius:6px;padding:6px;background:transparent;font-size:11px;color:var(--dsw-alias-label-secondary)!important}.cu-type-delete:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-state-error-primary)!important}.cu-removed{margin-top:15px}.cu-removed summary{color:var(--dsw-alias-label-secondary)}
      @media(max-width:580px){.cu-breakdown{grid-template-columns:1fr}.cu-ring{margin:0 auto}.cu-top{margin-bottom:16px}.cu-value{font-size:22px}}
    `;
    const number = value => Number.isFinite(value) ? value.toLocaleString('zh-CN') : '—';
    const compact = value => value >= 1e8 ? `${(value / 1e8).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}亿` : value >= 1e4 ? `${(value / 1e4).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}万` : number(value);
    const percent = value => {
      if(value === null || !Number.isFinite(value)) return null;
      let digits=1;
      while(value<1&&Number((value*100).toFixed(digits))===100&&digits<6)digits++;
      return `${value===0||value===1?Math.round(value*100):(value*100).toFixed(digits)}%`;
    };
    const dateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const startOf = range => { const date = new Date(); if (range === 'allTime') return 0; date.setHours(0,0,0,0); if (range === 'month') date.setDate(1); return date.getTime(); };
    function projectSnapshot(snapshot, policies, {type='all',since=0,until=Infinity,day=null}={}) {
      const zero = ()=>({input:0,output:0,cacheRead:0,cacheWrite:0,total:0,requests:0,cacheReported:false,cacheUnreported:false,cacheInputKnown:0,cacheReadKnown:0});
      const add = (target,row)=>{
        for(const key of ['input','output','cacheRead','cacheWrite','total','requests','cacheInputKnown','cacheReadKnown'])target[key]+=row[key];
        target.cacheReported ||= row.cacheReported;target.cacheUnreported ||= row.cacheUnreported;
      };
      const totals=zero(),models=new Map(),days=new Map(),heatmap=new Map();
      const firstDay=since>0?dateKey(new Date(since)):null;
      const lastDay=Number.isFinite(until)?dateKey(new Date(until)):null;
      for(const row of snapshot.rows) {
        const modelType=policies[row.route]?.type||'unknown';
        if(type!=='all'&&modelType!==type)continue;
        if(!heatmap.has(row.day))heatmap.set(row.day,{day:row.day,...zero()});
        add(heatmap.get(row.day),row);
        if(day?row.day!==day:(firstDay&&row.day<firstDay)||(lastDay&&row.day>lastDay))continue;
        add(totals,row);
        if(!models.has(row.route))models.set(row.route,{route:row.route,provider:row.provider,model:row.model,displayName:policies[row.route]?.displayName||row.model,type:modelType,...zero()});
        add(models.get(row.route),row);
        if(!days.has(row.day))days.set(row.day,{day:row.day,...zero()});
        add(days.get(row.day),row);
      }
      const ordered = values=>[...values.values()].sort((a,b)=>a.day.localeCompare(b.day));
      const input=totals.input+totals.cacheRead+totals.cacheWrite;
      return {totals,models:[...models.values()].sort((a,b)=>b.total-a.total),days:ordered(days),heatmap:ordered(heatmap),cacheRate:input>0?totals.cacheRead/input:null,missing:snapshot.missing,failed:snapshot.failed,unsupported:snapshot.unsupported,sessions:snapshot.sessions,updatedAt:snapshot.updatedAt};
    }
    function createSnapshotCache(load) {
      let value = null, pending = null, policyRevision = 0;
      return {
        get value() { return value; },
        load() {
          if (pending) return pending;
          const revision = policyRevision;
          pending = Promise.resolve().then(load).then(result=>{
            value = revision !== policyRevision && value ? {...result,policies:{...result.policies,...value.policies}} : result;
            return value;
          }).finally(()=>{pending=null;});
          return pending;
        },
        savePolicies(policies) {
          policyRevision++;
          if (value) value = {...value,policies};
        },
      };
    }
    function unwrap(result) {
      if (result?.ok === false) throw new Error(result.error?.message || '用量接口调用失败');
      return result?.ok === true ? result.value : result;
    }
    class Boundary extends React.Component {
      constructor(props) { super(props); this.state = { error: false }; }
      static getDerivedStateFromError() { return { error: true }; }
      componentDidCatch(error) { console.error('[dsh-clear-usage]', error); }
      render() { return this.state.error ? h('span', { className: 'cu-muted' }, '用量统计暂不可用') : this.props.children; }
    }
    function apply(ctx) {
      let api;
      let resolveReady;
      const remoteReady = new Promise(resolve => { resolveReady = resolve; });
      const invoke = async (method, ...args) => {
        if(!api) {
          let timeout;
          try { await Promise.race([remoteReady,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('用量接口尚未就绪')),10000);})]); }
          finally { clearTimeout(timeout); }
        }
        if (!api) throw new Error('用量接口未连接');
        return unwrap(await api[method](...args));
      };
      const snapshotCache = createSnapshotCache(()=>invoke('snapshot'));
      ctx.effect(() => ctx.locale.register(PACKAGE, { zh }), 'clear-usage: locale');
      ctx.effect(() => {
        let gone = false;
        let dispose;
        ctx.remote.$mount(contribution).then(unmount => {
          if (gone) { unmount(); return; }
          dispose = unmount;
          ctx.inject(['remote.clearUsage'], remoteCtx => {
            api = remoteCtx.remote.clearUsage;
            resolveReady();
            remoteCtx.effect(() => () => { api = undefined; }, 'clear-usage: service');
          });
        }).catch(error => console.error('[dsh-clear-usage] 接口挂载失败', error));
        return () => { gone = true; dispose?.(); };
      }, 'clear-usage: mount');

      function Heatmap({ days, selectedDay, selectDay, t, startDay=null, endDay=null }) {
        const [hover,setHover] = React.useState(null);
        const calendarRef = React.useRef(null);
        React.useLayoutEffect(()=>{
          const calendar=calendarRef.current;
          if(calendar)calendar.scrollLeft=calendar.scrollWidth;
        },[]);
        const now = new Date(); now.setHours(0,0,0,0);
        const parseDay = value => { const [year,month,date]=value.split('-').map(Number); return new Date(year,month-1,date); };
        const start = startDay ? parseDay(startDay) : new Date(now);
        if(!startDay)start.setDate(start.getDate()-364);
        start.setDate(start.getDate() - (start.getDay()+6)%7);
        const weekCount = endDay ? (()=>{const end=parseDay(endDay);end.setDate(end.getDate()+6-(end.getDay()+6)%7);return Math.floor((Date.UTC(end.getFullYear(),end.getMonth(),end.getDate())-Date.UTC(start.getFullYear(),start.getMonth(),start.getDate()))/604800000)+1;})() : 53;
        const values = new Map(days.map(day=>[day.day,day.total]));
        const nonzero = days.filter(day=>day.total>0).map(day=>day.total).sort((a,b)=>a-b);
        const cut = [0.25,0.5,0.75].map(q=>nonzero[Math.floor((nonzero.length-1)*q)]||0);
        const level = value=>value===0?0:value===nonzero.at(-1)?4:value<=cut[0]?1:value<=cut[1]?2:value<=cut[2]?3:4;
        const months = [];
        const weeks = Array.from({length:weekCount},(_,week)=> {
          const cells = Array.from({length:7},(_,weekday)=> {
            const date = new Date(start); date.setDate(start.getDate()+week*7+weekday);
            const day = dateKey(date); const value = values.get(day)||0;
            if(date.getDate()===1||week===0&&weekday===0)months.push({week,label:`${date.getMonth()+1}月`});
            const show = event => {
              const rect = event.currentTarget.getBoundingClientRect();
              setHover({day,date:`${date.getMonth()+1}月${date.getDate()}日`,value,left:Math.max(80,Math.min(window.innerWidth-80,rect.left+rect.width/2)),top:rect.top-8});
            };
            return h('button',{key:day,type:'button',className:'cu-day','data-level':level(value),'aria-pressed':selectedDay===day,'aria-label':`${day} · ${number(value)} token`,'aria-describedby':hover?.day===day?'cu-heat-tooltip':undefined,disabled:date>now||(startDay&&day<startDay)||(endDay&&day>endDay),onMouseEnter:show,onMouseLeave:()=>setHover(null),onFocus:show,onBlur:()=>setHover(null),onClick:()=>{setHover(null);selectDay(selectedDay===day?null:day);}});
          });
          return h('div',{className:'cu-week',key:week},cells);
        });
        return h('section',{className:'cu-section'},h('div',{className:'cu-section-title'},h('h3',null,t('heat'))),
          h('div',{className:'cu-calendar-scroll',ref:calendarRef},
          h('div',{className:'cu-months',style:{gridTemplateColumns:`repeat(${weekCount}, 9px)`}},months.map(({week,label},i)=>h('span',{key:i,className:'cu-month-label',style:{gridColumn:week+1}},label))),
          h('div',{className:'cu-heat',style:{gridTemplateColumns:`repeat(${weekCount}, 9px)`}},weeks),
          ),
          hover&&h('div',{id:'cu-heat-tooltip',className:'cu-heat-tooltip',role:'tooltip',style:{left:hover.left,top:hover.top}},h('strong',null,hover.date),h('span',null,`${compact(hover.value)} 个 Token`)),
        );
      }
      function ModelPolicy({ model, policy, saved, t, removed=false }) {
        const [type,setType] = React.useState(policy?.type||model.type);
        const [displayName,setDisplayName] = React.useState(policy?.displayName||'');
        const [status,setStatus] = React.useState('');
        const [busy,setBusy] = React.useState(false);
        const save = async nextType => {
          if(nextType===type||busy)return;
          const previous = type;
          setType(nextType);
          setBusy(true);setStatus('');
          // Preserve legacy stored fields while editing only the connection type.
          const next = {...(policy||{currency:'CNY',input:null,output:null,cacheRead:null,cacheWrite:null}),type:nextType};
          try { const policies = await invoke('savePolicy',model.route,next); saved(policies);setStatus(t('saved')); }
          catch(error){setType(previous);setStatus(error.message);}
          finally{setBusy(false);}
        };
        const setHidden = async hidden=>{
          if(busy)return;
          setBusy(true);setStatus('');
          const next={...(policy||{currency:'CNY',input:null,output:null,cacheRead:null,cacheWrite:null}),type,hidden};
          try { saved(await invoke('savePolicy',model.route,next)); }
          catch(error){setStatus(error.message);}
          finally{setBusy(false);}
        };
        const saveDisplayName = async ()=>{
          const nextName=displayName.trim();
          const previous=policy?.displayName||'';
          if(nextName===previous||busy)return;
          setBusy(true);setStatus('');
          const next={...(policy||{currency:'CNY',input:null,output:null,cacheRead:null,cacheWrite:null}),type};
          if(nextName)next.displayName=nextName;else delete next.displayName;
          try {
            const nextPolicies=await invoke('savePolicy',model.route,next);
            if((nextPolicies[model.route]?.displayName||'')!==nextName)throw new Error('显示名称尚未保存，请重启 DSH 后重试');
            saved(nextPolicies);setStatus(t('saved'));
          }
          catch(error){setDisplayName(previous);setStatus(error.message);}
          finally{setBusy(false);}
        };
        return h('div',{className:'cu-type-row',id:`cu-model-type-${encodeURIComponent(model.route)}`},h('div',null,h('div',{className:'cu-type-name'},model.displayName||model.model),
            h('label',{className:'cu-type-display-name'},t('displayName'),h('input',{type:'text',className:'cu-display-name-input',value:displayName,placeholder:model.model,maxLength:160,disabled:busy,'aria-label':`${model.displayName||model.model} ${t('displayName')}`,onChange:event=>setDisplayName(event.target.value),onBlur:saveDisplayName,onKeyDown:event=>{if(event.key==='Enter')event.currentTarget.blur();}}))),
          h('div',null,removed?h('button',{type:'button',className:'cu-button','aria-label':`${t('restore')} ${model.model}`,disabled:busy,onClick:()=>setHidden(false)},t('restore')):
            h('div',{className:'cu-type-controls'},h('div',{className:'cu-type-options',role:'group','aria-label':`${model.displayName||model.model} ${t('modelType')}`},['unknown','local','api'].map(key=>h('button',{key,type:'button','data-model-type':key,'aria-pressed':type===key,'aria-label':`${model.displayName||model.model}：${t(key)}`,disabled:busy,onClick:()=>save(key)},t(`${key}Short`)))),h('button',{type:'button',className:'cu-type-delete','aria-label':`${t('delete')} ${model.displayName||model.model}`,disabled:busy,onClick:()=>setHidden(true)},t('delete'))),
            (busy||status)&&h('div',{className:'cu-type-status',role:'status'},busy?t('saving'):status)),
        );
      }
      function ModelFilter({ value, onChange, t }) {
        const keys = ['all','local','api'];
        const [open,setOpen] = React.useState(false);
        const [active,setActive] = React.useState(0);
        const root = React.useRef(null);
        const trigger = React.useRef(null);
        const options = React.useRef([]);
        const id = React.useId();
        React.useLayoutEffect(()=>{if(open)options.current[active]?.focus({preventScroll:true});},[open]);
        React.useEffect(()=>{
          if(!open)return;
          const outside = event=>{if(!root.current?.contains(event.target))setOpen(false);};
          document.addEventListener('pointerdown',outside,true);
          return ()=>document.removeEventListener('pointerdown',outside,true);
        },[open]);
        const show = ()=>{setActive(keys.indexOf(value));setOpen(true);};
        const close = ()=>{setOpen(false);trigger.current?.focus({preventScroll:true});};
        const choose = key=>{onChange(key);close();};
        const keyboard = event=>{
          if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();close();return;}
          if(event.key==='Tab'){setOpen(false);return;}
          if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
            event.preventDefault();event.stopPropagation();
            if(!open){show();return;}
            const next = event.key==='Home'?0:event.key==='End'?keys.length-1:(active+(event.key==='ArrowDown'?1:-1)+keys.length)%keys.length;
            setActive(next);options.current[next]?.focus({preventScroll:true});
          }else if(open&&(event.key==='Enter'||event.key===' ')){
            event.preventDefault();event.stopPropagation();choose(keys[active]);
          }
        };
        return h('div',{className:'cu-filter',ref:root,onKeyDown:keyboard,onBlur:event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false);}},
          h('button',{type:'button',className:'cu-filter-trigger',ref:trigger,role:'combobox','aria-label':`${t('modelType')}：${t(value)}`,'aria-expanded':open,'aria-haspopup':'listbox','aria-controls':id,onClick:()=>open?close():show()},t(value),
            h('svg',{className:'cu-filter-arrow',width:14,height:14,viewBox:'0 0 16 16',fill:'none','aria-hidden':true},h('path',{d:'m4 6 4 4 4-4',stroke:'currentColor',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'}))),
          open&&h('div',{className:'cu-filter-menu',id,role:'listbox','aria-label':t('modelType')},keys.map((key,index)=>h('button',{type:'button',key,className:'cu-filter-option',role:'option','aria-selected':key===value,tabIndex:active===index?0:-1,ref:node=>{options.current[index]=node;},onFocus:()=>setActive(index),onClick:()=>choose(key)},t(key),
            key===value?h('svg',{className:'cu-filter-check',viewBox:'0 0 16 16',fill:'none','aria-hidden':true},h('path',{d:'m3 8 3 3 7-7',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round',strokeLinejoin:'round'})):h('span',{className:'cu-filter-check','aria-hidden':true})))),
        );
      }
      function Settings({t}) {
        const [range,setRange] = React.useState('month');
        const [type,setType] = React.useState('all');
        const [day,setDay] = React.useState(null);
        const [dates,setDates] = React.useState(()=>({start:dateKey(new Date(startOf('month'))),end:dateKey(new Date())}));
        const [appliedDates,setAppliedDates] = React.useState(dates);
        const [dateError,setDateError] = React.useState('');
        const [snapshot,setSnapshot] = React.useState(()=>snapshotCache.value);
        const [policies,setPolicies] = React.useState(()=>snapshotCache.value?.policies||{});
        const [error,setError] = React.useState('');
        const [loading,setLoading] = React.useState(true);
        const [revision,setRevision] = React.useState(0);
        const [hoverModel,setHoverModel] = React.useState(null);
        React.useEffect(()=> {
          let current = true;
          setLoading(true);setError('');
          snapshotCache.load().then(result=>{
            if(!current)return;setSnapshot(result);setPolicies(result.policies);
          }).catch(problem=>{if(current)setError(problem.message||t('error'));}).finally(()=>{if(current)setLoading(false);});
          return ()=>{current=false;};
        },[revision]);
        const since=range==='custom'?new Date(`${appliedDates.start}T00:00:00`).getTime():startOf(range);
        const until=range==='custom'?new Date(`${appliedDates.end}T23:59:59.999`).getTime():Infinity;
        const data = React.useMemo(()=>snapshot?projectSnapshot(snapshot,policies,{type,since,until,day}):null,[snapshot,policies,type,since,until,day]);
        const allCatalog = React.useMemo(()=>snapshot?projectSnapshot(snapshot,policies).models:[],[snapshot,policies]);
        const catalog=allCatalog.filter(model=>!policies[model.route]?.hidden);
        const removedCatalog=allCatalog.filter(model=>policies[model.route]?.hidden);
        const queryDates=()=>{
          if(!dates.start||!dates.end||dates.start>dates.end){setDateError(t('invalidDates'));return;}
          setDateError('');setAppliedDates({...dates});setRange('custom');setDay(null);
        };
        const refresh = ()=>setRevision(value=>value+1);
        const savedPolicies = next=>{snapshotCache.savePolicies(next);setPolicies(next);};
        const jumpToType = route=>{
          const section=document.getElementById('cu-model-types');
          const row=document.getElementById(`cu-model-type-${encodeURIComponent(route)}`);
          if(!section||!row)return;
          section.open=true;
          const removed=row.closest('.cu-removed');
          if(removed)removed.open=true;
          requestAnimationFrame(()=>{
            row.scrollIntoView({behavior:'smooth',block:'center'});
            row.querySelector('[data-model-type="local"]')?.focus({preventScroll:true});
          });
        };
        const series = index=>['#2385e8','#56b4c7','#8367d8','#df9973','#6d98b8'][index%5];
        const shown = data?.models||[];
        const circumference = 2*Math.PI*84;
        let offset = 0;
        const arcs = shown.slice(0,5).map((model,index)=>{
          const length = data.totals.total?model.total/data.totals.total*circumference:0;
          const arc = h('circle',{key:model.route,cx:100,cy:100,r:84,fill:'none',stroke:series(index),strokeWidth:26,strokeDasharray:`${length} ${circumference-length}`,strokeDashoffset:-offset,transform:'rotate(-90 100 100)',style:{cursor:'pointer',pointerEvents:'stroke'},onMouseEnter:event=>{const rect=event.currentTarget.getBoundingClientRect();setHoverModel({model,left:rect.left+rect.width/2,top:rect.top-8});},onMouseLeave:()=>setHoverModel(null)},h('title',null,`${model.model} · ${number(model.total)} token`));
          offset+=length;
          return arc;
        });
        const card = (label,value,sub) => h('div',{className:'cu-card',key:label},h('div',{className:'cu-label'},label),h('div',{className:'cu-value'},value),sub&&h('div',{className:'cu-note'},sub));
        return h('main',{className:'cu-root cu-page'},h('style',null,CSS),
          h('div',{className:'cu-top'},h('h2',{className:'cu-title'},t('title')),h('div',{className:'cu-top-actions'},loading&&data&&h('span',{className:'cu-muted',role:'status'},t('updating')),h('button',{type:'button',className:'cu-button',onClick:refresh,disabled:loading},t('refresh')))),
          h('div',{className:'cu-filters','aria-label':t('filters')},h('div',{className:'cu-tabs'},['today','month','allTime','custom'].map(key=>h('button',{type:'button',key,'aria-pressed':range===key&&!day,onClick:()=>{setRange(key);setDay(null);}},t(key)))),
            h(ModelFilter,{value:type,onChange:setType,t})),
          range==='custom'&&h('div',{className:'cu-date-range'},h('label',null,t('startDate'),h('input',{type:'date',value:dates.start,onChange:event=>setDates(value=>({...value,start:event.target.value}))})),h('label',null,t('endDate'),h('input',{type:'date',value:dates.end,onChange:event=>setDates(value=>({...value,end:event.target.value}))})),h('button',{type:'button',className:'cu-button',onClick:queryDates},t('query'))),
          range==='custom'&&dateError&&h('p',{className:'cu-warning',role:'alert'},dateError),
          day&&h('div',{className:'cu-section-title'},h('span',{className:'cu-muted'},day),h('button',{type:'button',className:'cu-button',onClick:()=>setDay(null)},t('clearDay'))),
          error&&h('p',{className:'cu-warning',role:'alert'},error),loading&&!data&&h('p',{className:'cu-muted',role:'status'},t('loading')),
          data&&h(React.Fragment,null,
            h('div',{className:'cu-summary'},card(t('total'),compact(data.totals.total),`${t('input')} ${compact(data.totals.input)} · ${t('output')} ${compact(data.totals.output)}`),card(t('cache'),percent(data.cacheRate)||'0%',t('nativeStats'))),
            data.unsupported>0&&h('p',{className:'cu-note'},`${t('oldRecords')}（${data.unsupported} 个），${t('recorded')}。`),
            data.failed>data.unsupported&&h('p',{className:'cu-warning'},t('failed')),
            data.missing>0&&h('p',{className:'cu-note'},t('missing')),
            h(Heatmap,{key:range==='custom'?`${range}:${appliedDates.start}:${appliedDates.end}`:range,days:data.heatmap.filter(item=>(since===0||item.day>=dateKey(new Date(since)))&&(!Number.isFinite(until)||item.day<=dateKey(new Date(until)))),selectedDay:day,selectDay:setDay,t,startDay:range==='custom'?appliedDates.start:null,endDay:range==='custom'?appliedDates.end:null}),
            h('section',{className:'cu-section'},h('div',{className:'cu-section-title'},h('h3',null,t('models'))),shown.length===0?h('p',{className:'cu-muted'},t('empty')):
              h('div',{className:'cu-breakdown'},h('div',{className:'cu-ring',role:'img','aria-label':t('models')},h('svg',{className:'cu-ring-chart',viewBox:'0 0 200 200','aria-hidden':true},h('circle',{cx:100,cy:100,r:84,fill:'none',stroke:'var(--dsw-alias-border-l2)',strokeWidth:26}),arcs),h('div',{className:'cu-ring-center'},compact(data.totals.total),h('small',null,'token'))),
                hoverModel&&h('div',{className:'cu-ring-tooltip',role:'tooltip',style:{left:hoverModel.left,top:hoverModel.top}},h('strong',null,hoverModel.model.displayName||hoverModel.model.model),h('span',null,`${compact(hoverModel.model.total)} token · ${t('share')} ${(hoverModel.model.total/data.totals.total*100).toFixed(1)}%`)),
                h('div',{className:'cu-model-list'},shown.map((model,index)=>h('article',{className:'cu-model-row',key:model.route,style:{'--cu-model-color':index<5?series(index):'var(--dsw-alias-border-l2)'}},
                  h('div',{className:'cu-model-head'},h('div',{className:'cu-model-name'},h('span',{className:'cu-model-dot','aria-hidden':true}),model.displayName||model.model),h('div',{className:'cu-model-number'},compact(model.total),h('small',null,'token'))),
                  h('div',{className:'cu-model-meta'},model.type==='unknown'?h('button',{type:'button',className:'cu-model-badge cu-model-type-link','aria-label':`${model.displayName||model.model}：${t('chooseType')}`,title:t('chooseType'),onClick:()=>jumpToType(model.route)},t(model.type)):h('span',{className:'cu-model-badge'},t(model.type)),h('span',{className:'cu-model-share'},`${t('share')} ${(model.total/data.totals.total*100).toFixed(1)}%`)),
                ))))),
          ),
          h('details',{className:'cu-section cu-types',id:'cu-model-types'},h('summary',null,t('types')),h('p',{className:'cu-note'},t('typeHint')),h('div',{className:'cu-type-list'},catalog.map(model=>h(ModelPolicy,{key:model.route,model,policy:policies[model.route],t,saved:savedPolicies}))),
            removedCatalog.length>0&&h('details',{className:'cu-removed'},h('summary',null,`${t('removed')}（${removedCatalog.length}）`),h('div',{className:'cu-type-list'},removedCatalog.map(model=>h(ModelPolicy,{key:model.route,model,policy:policies[model.route],t,saved:savedPolicies,removed:true}))))),
        );
      }
      const guarded = Component => props=>h(Boundary,null,h(Component,props));
      ctx.slots.inject('settings.section',()=>ctx.slots.register({name:'settings.section',id:PACKAGE,order:55,locale:PACKAGE,label:()=>ctx.locale.bind(PACKAGE)('nav')},guarded(Settings)));
    }
    return { inject:['slots','locale','remote'],apply,projectSnapshot,createSnapshotCache };
  },
});
