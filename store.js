// Browser auto-save (IndexedDB) shared by all pages. Data stays on this device only.
(()=>{
const open=()=>new Promise((ok,no)=>{try{const r=indexedDB.open('pose-marker',1);r.onupgradeneeded=()=>r.result.createObjectStore('w');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}catch(e){no(e)}});
const run=(mode,fn)=>open().then(d=>new Promise((ok,no)=>{
  const t=d.transaction('w',mode);let q;
  try{q=fn(t.objectStore('w'))}catch(e){no(e);return}
  t.oncomplete=()=>ok(q?q.result:true);t.onerror=t.onabort=()=>no(t.error);
}));
const raw={
  put:(k,v)=>run('readwrite',s=>s.put(v,k)).then(()=>true,()=>false),
  get:k=>run('readonly',s=>s.get(k)).then(r=>r||null,()=>null),
  del:k=>run('readwrite',s=>s.delete(k)).then(()=>true,()=>false)
};
// ---- shared file library: a file uploaded on one page is available on every page ----
const renders=[],refresh=()=>renders.forEach(r=>r());
const libId=f=>`${f.name||'file'}|${f.size}|${f.lastModified||0}`;
async function libAdd(f){
  if(!f||!f.size)return null;
  const id=libId(f),idx=(await raw.get('lib:index'))||[];
  if(!idx.some(m=>m.id===id)){
    if(!(await raw.put('lib:item:'+id,{file:f}))){Store.badge('⚠️ Could not keep this file (storage full or blocked)');return null}
    idx.unshift({id,name:f.name||'file',type:f.type||'',size:f.size,t:Date.now()});
    await raw.put('lib:index',idx);
  }
  refresh();return id;
}
const libGet=async id=>{const r=await raw.get('lib:item:'+id);return r?r.file:null};
async function libDel(id){
  await raw.del('lib:item:'+id);
  await raw.put('lib:index',((await raw.get('lib:index'))||[]).filter(m=>m.id!==id));
  for(const [pg,kind] of [['index','video'],['face','video'],['image','img'],['faceimage','img']]){
    const r=await raw.get(pg+':'+kind);
    if(r&&r.lib===id){await raw.del(pg+':'+kind);await raw.del(pg+':state')}
  }
  refresh();
}
const isBig=k=>/:(video|img)$/.test(k);
const fmt=n=>n>1e9?(n/1e9).toFixed(1)+' GB':n>1e6?(n/1e6).toFixed(1)+' MB':Math.max(1,Math.round(n/1e3))+' KB';
window.Store={
  put:async(k,v)=>{if(isBig(k)&&v&&v.blob){const id=await libAdd(v.blob);return id?raw.put(k,{lib:id,name:v.name}):false}return raw.put(k,v)},
  get:async k=>{const r=await raw.get(k);if(r&&r.lib){const f=await libGet(r.lib);return f?{blob:f,name:r.name}:null}return r},
  del:raw.del,
  lib:{add:libAdd,get:libGet,del:libDel},
  // Fast frame scanner: downsizes each frame, and decodes the NEXT frame while the current one is analyzed
  async scan(v,times,cb){
    const sc=Math.min(1,512/Math.max(v.videoWidth,v.videoHeight)),W=Math.round(v.videoWidth*sc),H=Math.round(v.videoHeight*sc);
    const work=document.createElement('canvas');work.width=W;work.height=H;const wg=work.getContext('2d',{willReadFrequently:true});
    const tw=160,th=Math.round(tw*v.videoHeight/v.videoWidth);
    const seekP=t=>new Promise(r=>{
      t=Math.max(0,Math.min(t,(v.duration||0)-.001));if(Math.abs(v.currentTime-t)<.0005)return r();
      const h=()=>{clearTimeout(to);v.removeEventListener('seeked',h);r()},to=setTimeout(h,3000);
      v.addEventListener('seeked',h);v.currentTime=t});
    await seekP(times[0]);
    for(let i=0;i<times.length;i++){
      wg.drawImage(v,0,0,W,H);
      const t=document.createElement('canvas');t.width=tw;t.height=th;t.getContext('2d').drawImage(work,0,0,tw,th);
      const nx=i+1<times.length?seekP(times[i+1]):null;
      if(await cb(work,t,i)===false)return false;
      if(nx)await nx;
    }
    return true;
  },
  // recorded WebM files report an infinite length until the end is visited once
  fixDuration:v=>new Promise(ok=>{if(!v.src||isFinite(v.duration))return ok();const h=()=>{v.removeEventListener('timeupdate',h);v.currentTime=0;ok()};v.addEventListener('timeupdate',h);v.currentTime=1e101;setTimeout(ok,4000)}),
  library(kind,onPick){
    const d=document.createElement('div');d.className='card';d.id='lib';
    const c=document.querySelector('.card');c?c.after(d):document.body.append(d);
    const ok=m=>m.type.startsWith(kind+'/')||new RegExp(kind==='video'?'\\.(mp4|webm|mov|mkv|avi|m4v)$':'\\.(png|jpe?g|webp|gif|bmp|avif|heic)$','i').test(m.name);
    const render=async()=>{
      const all=(await raw.get('lib:index'))||[],list=all.filter(ok);
      d.innerHTML='';
      const head=document.createElement('div');head.className='row';
      const t=document.createElement('b');t.textContent='📁 My files';
      const u=document.createElement('span');u.style.cssText='font-size:12px;opacity:.7';
      head.append(t,u);d.append(head);
      if(navigator.storage&&navigator.storage.estimate)navigator.storage.estimate().then(e=>{u.textContent=`stored in this browser only · ${fmt(e.usage||0)} used`});
      const box=document.createElement('div');box.style.cssText='max-height:190px;overflow:auto;margin-top:8px';
      if(!list.length){const e=document.createElement('div');e.className='hint';e.textContent=`No ${kind}s stored yet. Anything you upload is kept here so you can open it again on any page.`;box.append(e)}
      for(const m of list){
        const r=document.createElement('div');r.className='libi';
        const n=document.createElement('span');n.textContent=`${kind==='video'?'🎬':'🖼️'} ${m.name} · ${fmt(m.size)}`;n.title=m.name;
        const o=document.createElement('button');o.textContent='▶ Open';
        o.onclick=async()=>{const f=await libGet(m.id);if(f)onPick(f);else{Store.badge('⚠️ That file is no longer stored');render()}};
        const x=document.createElement('button');x.textContent='🗑️ Delete';x.title='Delete this file and its saved work';
        x.onclick=async()=>{if(confirm(`Delete "${m.name}" and its saved work from this browser?`))await libDel(m.id)};
        r.append(n,o,x);box.append(r);
      }
      d.append(box);
      if(all.length){
        const z=document.createElement('button');z.textContent='🗑️ Delete ALL my files and saved work';z.style.marginTop='8px';
        z.onclick=async()=>{if(confirm('Delete every stored file and all saved work from this browser?')){await run('readwrite',s=>s.clear());refresh();Store.badge('🗑️ Everything deleted')}};
        d.append(z);
      }
    };
    renders.push(render);render();
  },
  badge(t){
    let b=document.getElementById('savebadge');
    if(!b){b=document.createElement('div');b.id='savebadge';document.body.append(b)}
    b.textContent=t;b.classList.remove('pulse');void b.offsetWidth;b.classList.add('pulse');
  },
  banner(text,onRestore,onDiscard){
    const d=document.createElement('div');d.className='card row';d.id='restore';
    const m=document.createElement('b');m.textContent=text;d.append(m);
    const mk=(l,fn,c)=>{const b=document.createElement('button');b.textContent=l;b.className=c||'';b.onclick=async()=>{d.remove();await fn()};d.append(b)};
    mk('↩️ Restore my work',onRestore,'p');mk('🗑️ Discard',onDiscard);
    const c=document.querySelector('.card');c?c.before(d):document.body.append(d);
  }
};
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch{}
})();
