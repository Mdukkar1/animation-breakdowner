// Browser auto-save (IndexedDB) shared by all pages. Data stays on this device only.
(()=>{
const open=()=>new Promise((ok,no)=>{try{const r=indexedDB.open('pose-marker',1);r.onupgradeneeded=()=>r.result.createObjectStore('w');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}catch(e){no(e)}});
const run=(mode,fn)=>open().then(d=>new Promise((ok,no)=>{
  const t=d.transaction('w',mode);let q;
  try{q=fn(t.objectStore('w'))}catch(e){no(e);return}
  t.oncomplete=()=>ok(q?q.result:true);t.onerror=t.onabort=()=>no(t.error);
}));
window.Store={
  put:(k,v)=>run('readwrite',s=>s.put(v,k)).then(()=>true,()=>false),
  get:k=>run('readonly',s=>s.get(k)).then(r=>r||null,()=>null),
  del:k=>run('readwrite',s=>s.delete(k)).then(()=>true,()=>false),
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
