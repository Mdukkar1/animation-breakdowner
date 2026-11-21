// Adds icons, tooltips, tabs, tips, particle bursts and a progress bar to both pages.
(()=>{
const $=id=>document.getElementById(id);
const M={
 go:['🎬','Analyze','Find key poses and breakdowns automatically'],cancel:['✋','Cancel','Stop the analysis'],
 pf:['⏪','Prev frame','Step back one frame (←)'],nf:['⏩','Next frame','Step forward one frame (→)'],
 pm:['⏮️','Prev marker','Jump to the previous marker ( [ )'],nm:['⏭️','Next marker','Jump to the next marker ( ] )'],
 ak:['🔑','Key here','Mark this frame as a KEY (K)'],ab:['⚡','Breakdown here','Mark this frame as a BREAKDOWN (B)'],
 rm:['🗑️','Remove marker','Remove the marker on this frame (X)'],ud:['↩️','Undo','Undo the last marker change (Z)'],
 ex:['📦','Export JSON','Download the markers as a JSON file'],csv:['📊','Export CSV','Download as a spreadsheet file'],
 sheet:['🖼️','Contact sheet','Download one picture with all marked frames'],cp:['📋','Copy timecodes','Copy marker times to the clipboard'],
 zip:['🗜️','Frames ZIP','Download every marked frame as PNG, drawings included'],
 uz:['↩️','Undo drawing','Remove your last pen stroke or text'],cl:['🧽','Clear frame','Remove all drawings on this frame']};
M.k2=M.ak;M.b2=M.ab;M.r2=M.rm;
for(const [id,[i,t,h]] of Object.entries(M)){const b=$(id);if(b){b.innerHTML=`<span class="ic">${i}</span>${t}`;b.title=h}}

const tool=$('tool');
if(tool)for(const o of tool.options)o.textContent=({'':'🚫 Off',pen:'✏️ Pen',text:'🔤 Text',erase:'🧽 Eraser'})[o.value]||o.textContent;
for(const [id,ic] of Object.entries({gh:'👻',lp:'🔁',sk:$('gh')?'🦴':'🎭'})){
  const c=$(id);if(c){const s=document.createElement('span');s.textContent=ic;c.parentNode.insertBefore(s,c)}}

const pg=location.pathname.split('/').pop()||'index.html',on=p=>pg===p?'on':'',nav=document.querySelector('nav');
if(nav)nav.innerHTML=`<a href="index.html" class="${on('index.html')}">🧍 Body poses</a><a href="face.html" class="${on('face.html')}">🙂 Face breakdown</a><a href="image.html" class="${on('image.html')}">🖼️ Image pose</a><a href="faceimage.html" class="${on('faceimage.html')}">😀 Face image</a>`;

const tips=['Key poses tell the story. Breakdowns tell how it moves.','Fewer, stronger keys read better than many weak ones.','Slow playback to 0.25× to find the real timing.','Wide spacing between frames feels fast. Tight spacing feels slow.','Good breakdowns decide the arc between two keys.','Press K or B to drop a marker without leaving the keyboard.'];
const sub=document.querySelector('p.sub'),tip=document.createElement('div');tip.className='tip';
if(sub){sub.after(tip);let n=0;const show=()=>{tip.style.animation='none';void tip.offsetWidth;tip.style.animation='';tip.textContent='💡 '+tips[n++%tips.length]};show();setInterval(show,7000)}

const burst=(el,e)=>{
  const r=el.getBoundingClientRect();
  for(let i=0;i<9;i++){
    const s=document.createElement('span'),a=Math.random()*6.28,d=40+Math.random()*60;
    s.className='sp';s.textContent=e;s.style.left=r.left+r.width/2+'px';s.style.top=r.top+r.height/2+'px';
    s.style.setProperty('--x',Math.cos(a)*d+'px');s.style.setProperty('--y',Math.sin(a)*d-30+'px');s.style.setProperty('--r',(Math.random()*360-180)+'deg');
    document.body.append(s);setTimeout(()=>s.remove(),900);
  }
};
const BE={ak:'🔑',k2:'🔑',ab:'⚡',b2:'⚡',go:'🎬',ex:'✨',csv:'✨',zip:'✨',sheet:'✨',cp:'📋',rm:'💨',r2:'💨'};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&BE[b.id]&&!b.disabled)burst(b,BE[b.id])});
document.addEventListener('keydown',e=>{
  if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;
  const id={k:'ak',b:'ab',x:'rm'}[e.key.toLowerCase()];
  if(id&&$(id)&&!$(id).disabled)burst($(id),BE[id]);
});

const st=$('st');
if(st){
  const pb=document.createElement('div');pb.id='pbar';pb.innerHTML='<i></i>';st.closest('.card').append(pb);
  new MutationObserver(()=>{
    const t=st.textContent,m=t.match(/(\d+)\/(\d+)/),on=m&&/^(Analyzing|Exporting)/.test(t);
    pb.classList.toggle('on',!!on);
    if(on)pb.firstChild.style.width=(m[1]/m[2]*100)+'%';
    else{st.classList.remove('flash');void st.offsetWidth;st.classList.add('flash')}
  }).observe(st,{childList:true,characterData:true,subtree:true});
}

// ---- v3: mascot, spotlight, steps, confetti, themes, help ----
const calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
document.querySelectorAll('.card').forEach((c,i)=>c.style.animationDelay=i*70+'ms');
document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.card');if(c){const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}});

if(!calm&&matchMedia('(pointer:fine)').matches){
  const m=document.createElement('div');m.id='mascot';document.body.append(m);
  let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y,vx=0,vy=0;
  addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY});
  (function f(){vx+=(tx-x)*.08;vy+=(ty-y)*.08;vx*=.72;vy*=.72;x+=vx;y+=vy;
    const sp=Math.min(Math.hypot(vx,vy),30),a=Math.atan2(vy,vx)*180/Math.PI;
    m.style.transform=`translate(${x}px,${y}px) rotate(${a}deg) scale(${1+sp/35},${1-sp/70})`;requestAnimationFrame(f)})();
}

const confetti=()=>{if(calm)return;for(let i=0;i<70;i++){const s=document.createElement('i');s.className='cf';
  s.style.left=Math.random()*100+'vw';s.style.background=`hsl(${Math.random()*360} 90% 60%)`;
  s.style.setProperty('--dx',(Math.random()*240-120)+'px');s.style.setProperty('--rt',Math.random()*720+'deg');
  s.style.animationDuration=1.6+Math.random()*1.4+'s';s.style.animationDelay=Math.random()*.3+'s';
  document.body.append(s);setTimeout(()=>s.remove(),3500)}};
const h1=document.querySelector('h1');if(h1)h1.onclick=confetti;

// workflow steps
const steps=document.createElement('div');steps.id='steps';
const SD=[['📂','Upload',()=>$('file')&&$('file').click()],['🎬','Analyze',()=>{const b=$('go');if(b&&!b.disabled)b.click()}],
  ['✏️','Edit and annotate',()=>($('tl')||$('cv')).scrollIntoView({behavior:'smooth',block:'center'})],
  ['📦','Export',()=>($('ex')||$('e1')).scrollIntoView({behavior:'smooth',block:'center'})]];
SD.forEach(([ic,t,fn],i)=>{const d=document.createElement('div');d.className='step';d.tabIndex=0;d.setAttribute('role','button');
  d.innerHTML=`<b>${ic}</b>${t}`;d.onclick=fn;d.onkeydown=e=>{if(e.key==='Enter')fn()};steps.append(d)});
(tip.isConnected?tip:document.querySelector('nav')).after(steps);
const setStep=n=>[...steps.children].forEach((d,i)=>{d.classList.toggle('done',i<n);d.classList.toggle('cur',i===n);d.firstChild.textContent=i<n?'✔':SD[i][0]});
setStep(0);
const stepFor=t=>/^(Done|Pose found)/.test(t)?2:/^Exported/.test(t)?3:/^(Analyzing|Exporting|Finding|Ready|Image loaded|No )/.test(t)?1:0;
let was=false;
if(st)new MutationObserver(()=>{const t=st.textContent,n=stepFor(t);setStep(n);const ok=n===2;if(ok&&!was)confetti();was=ok}).observe(st,{childList:true,characterData:true,subtree:true});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&['ex','csv','sheet','zip','e1','e2','e3'].includes(b.id)&&!b.disabled)setStep(3)});

// colour themes (remembered)
const th=document.createElement('div');th.id='themes';
const HU=[0,55,150,215,290];let saved=0;try{saved=+localStorage.getItem('hue')||0}catch{}
const setHue=h=>{document.documentElement.style.setProperty('--hue',h+'deg');[...th.children].forEach((c,i)=>c.classList.toggle('on',HU[i]===h));try{localStorage.setItem('hue',h)}catch{}};
HU.forEach(h=>{const i=document.createElement('i');i.title='Colour theme';i.style.filter=`hue-rotate(${h}deg)`;i.onclick=()=>setHue(h);th.append(i)});
document.body.append(th);setHue(HU.includes(saved)?saved:0);

// help panel
const HELP={'index.html':[['Space','Play or pause'],['← →','Step one frame'],['[  ]','Previous or next marker'],['K','Add a key pose'],['I  O','Set cut start and end'],['B','Add a breakdown'],['X','Remove marker'],['Z','Undo'],['P  T  E','Pen, text, eraser'],['Esc','Stop drawing'],['?','Show this help']],
 'face.html':[['Space','Play or pause'],['← →','Step one frame'],['[  ]','Previous or next marker'],['K','Add a key expression'],['B','Add a breakdown'],['X','Remove marker'],['Z','Undo'],['?','Show this help']],
 'faceimage.html':[['Ctrl+V','Paste a photo'],['Drop','Drag a photo onto the top box'],['Draw','Pick Pen, Text or Eraser, then click the photo'],['?','Show this help']],
 'image.html':[['Ctrl+V','Paste an image'],['Drop','Drag an image onto the top box'],['Draw','Pick Pen, Text or Eraser, then click the picture'],['?','Show this help']]};
const hp=document.createElement('div');hp.id='help';
hp.innerHTML='<div><h2>⌨️ Shortcuts and help</h2>'+(HELP[pg]||HELP['index.html']).map(([k,t])=>`<p><kbd>${k}</kbd>${t}</p>`).join('')+'<p style="opacity:.7;margin-top:12px">Tip: click the steps at the top to jump around. Click the title for a surprise.</p></div>';
const hb=document.createElement('button');hb.id='helpb';hb.title='Help and shortcuts (?)';hb.textContent='?';
const tog=o=>hp.classList.toggle('on',o);
hb.onclick=()=>tog(true);hp.onclick=e=>{if(e.target===hp)tog(false)};
document.body.append(hb,hp);
document.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='?')tog(!hp.classList.contains('on'));else if(e.key==='Escape')tog(false)});
})();
