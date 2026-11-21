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
if(nav)nav.innerHTML=`<a href="index.html" class="${on('index.html')}">🧍 Body poses</a><a href="face.html" class="${on('face.html')}">🙂 Face breakdown</a><a href="image.html" class="${on('image.html')}">🖼️ Image pose</a>`;

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
})();
