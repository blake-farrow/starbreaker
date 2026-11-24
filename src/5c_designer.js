
/* ---------- custom ship designer ---------- */
const BTYPES=[
 {id:'blue',label:'Ion',from:'Sparrow',col:'#6fd8ff'},
 {id:'green',label:'Twin',from:'Falcon',col:'#6fffc0'},
 {id:'orange',label:'Flak',from:'Hawk',col:'#ffb85a'},
 {id:'red',label:'Pulse',from:'Raptor',col:'#ff6f8a'},
 {id:'purple',label:'Plasma',from:'Tempest',col:'#c9a8ff'},
 {id:'lava',label:'Lava',from:'Vesuvius',col:'#ff8a30',lava:true},
];
const SPECIALS=[
 {id:'none',label:'None',icon:'✖',rech:0,col:'#9fb0cc'},
 {id:'lightning',label:'Lightning',icon:'⚡',rech:7,col:'#c8a8ff'},
 {id:'lava',label:'Lava Eruption',icon:'🌋',rech:0,col:'#ff8a30'},
 {id:'shock',label:'Shockwave',icon:'💥',rech:5,col:'#7fe8ff'},
 {id:'hole',label:'Black Hole',icon:'🌀',rech:8,col:'#b060ff'},
];
const HULLS=['#8d99a8','#c4d0dc','#3a3266','#1d2b4a','#2b1d18','#4a1d2a','#1f3d2a','#202024','#6a2a8a','#b0402a','#c49a3c'];
const GLOWS=['#5fd0ff','#4fffb0','#ffa640','#ff4d6d','#b48cff','#ff6a1a','#ffe14a','#ff5ad8','#ffffff','#00ffea'];
const DESIGN_DEFAULT={name:'MY SHIP',base:4,hull:'#1d2b4a',acc:'#00ffea',shots:5,bullet:'purple',special:'shock',autoFire:true,autoSpecial:true};
let DESIGN=Object.assign({},DESIGN_DEFAULT);
try{const d=JSON.parse(localStorage.getItem('sb_design')||'null');if(d&&typeof d==='object')DESIGN=Object.assign({},DESIGN_DEFAULT,d);}catch(e){}
function saveDesign(){try{localStorage.setItem('sb_design',JSON.stringify(DESIGN));}catch(e){}}
const specDef=id=>SPECIALS.find(s=>s.id===id)||SPECIALS[0];
function specialOf(t){return(SHIPS[t]&&SHIPS[t].special)||'none';}
function genPat(n){n=clamp(n|0,1,6);if(n===1)return[[0,0]];const sp=Math.min(.3,.07*(n-1));return Array.from({length:n},(_,i)=>{const u=i/(n-1)*2-1;return[u*sp,u*4];});}
function makeShipFromDesign(d){
  const b=SHIPS[clamp(d.base|0,0,5)],bt=BTYPES.find(x=>x.id===d.bullet)||BTYPES[4];
  const sh={name:(d.name||'MY SHIP').toUpperCase().slice(0,12),cost:11000,custom:true,special:d.special,half:b.half,eng:b.eng,hull:d.hull,acc:d.acc,bul:bt.col,lava:!!bt.lava,
    dmg:bt.lava?2.5:3,fire:bt.lava?.065:.1,hp:14,thrust:480,max:390,mag:260,pat:genPat(d.shots),desc:'Your own design'};
  shipGeom(sh);return sh;
}
function applyDesign(){SHIPS[6]=makeShipFromDesign(DESIGN);if(tier===6){setAcc();}}

/* ----- new specials: shockwave + black hole ----- */
let waves=[],holes=[];
function shockwave(){
  charge=0;const p=player,R=Math.max(W,H)*.8;waves.push({x:p.x,y:p.y,r:0,R,col:SHIPS[tier].acc,hit:new Set()});
  flash=.5;flashCol='160,235,255';shake=22;sfx('shock');bossSpecial('shock');
  for(let i=0;i<40;i++){const a=i/40*TAU;part(p.x,p.y,Math.cos(a)*620*S,Math.sin(a)*620*S,.45,12*S,SHIPS[tier].acc,'glow');}
}
function blackHole(){
  charge=0;const p=player,d=170*S;holes.push({x:clamp(p.x+Math.cos(p.ang)*d,40,W-40),y:clamp(p.y+Math.sin(p.ang)*d,60,H-60),t:0,life:3.4,R:Math.max(W,H)*.65});
  flash=.3;flashCol='120,60,200';sfx('hole');bossSpecial('hole');
}
function updateSpecials(dt){
  for(const w of waves){w.r+=dt*w.R/.7;
    for(const o of [...asteroids,...enemies]){if(o.dead||w.hit.has(o))continue;if(Math.hypot(o.x-w.x,o.y-w.y)<w.r){w.hit.add(o);
      part(o.x,o.y,0,0,.3,40*S,w.col,'glow');if(o.R)destroyAst(o,false);else killEnemy(o);}}
    for(const b of ebullets)if(Math.hypot(b.x-w.x,b.y-w.y)<w.r)b.dead=1;
    if(w.r>=w.R)w.dead=1;}
  waves=waves.filter(w=>!w.dead);
  for(const h of holes){h.t+=dt;const k=Math.min(1,h.t/.35,(h.life-h.t)/.35),core=(20+16*k)*S;
    for(const o of [...asteroids,...enemies]){if(o.dead)continue;const dx=h.x-o.x,dy=h.y-o.y,d=Math.hypot(dx,dy)||1;if(d>h.R)continue;
      const f=((1-d/h.R)*1300+160)*S*k;o.vx+=(dx/d*f-dy/d*f*.55)*dt;o.vy+=(dy/d*f+dx/d*f*.55)*dt;
      const sp=Math.hypot(o.vx,o.vy),mx=520*S;if(sp>mx){o.vx*=mx/sp;o.vy*=mx/sp;}
      if(o.R&&!o.dead)o.rot+=dt*4;
      if(d<core+(o.R?o.R*S*.45:o.r*S*.5)){part(h.x,h.y,0,0,.3,50*S,'#b060ff','glow');if(o.R)destroyAst(o,false);else killEnemy(o);}}
    for(const b of ebullets){const d=Math.hypot(h.x-b.x,h.y-b.y);if(d<h.R*.6){b.vx+=(h.x-b.x)/d*900*S*dt;b.vy+=(h.y-b.y)/d*900*S*dt;}if(d<core)b.dead=1;}
    if(Math.random()<dt*30){const a=rand(0,TAU),r=rand(.4,1)*120*S*k;part(h.x+Math.cos(a)*r,h.y+Math.sin(a)*r,-Math.sin(a)*240*S-Math.cos(a)*90*S,Math.cos(a)*240*S-Math.sin(a)*90*S,.5,5*S,Math.random()<.5?'#b060ff':'#ff9a50','glow');}
    if(h.t>=h.life){h.dead=1;part(h.x,h.y,0,0,.5,120*S,'#d0a0ff','glow');shake=Math.max(shake,10);sfx('boom',2);}}
  holes=holes.filter(h=>!h.dead);
}
function renderSpecials(){
  ctx.globalCompositeOperation='lighter';
  for(const w of waves){const f=1-w.r/w.R;ctx.strokeStyle=hexA(w.col,(.75*f).toFixed(3));ctx.lineWidth=16*S*f+2;ctx.beginPath();ctx.arc(w.x,w.y,w.r,0,TAU);ctx.stroke();
    ctx.strokeStyle=`rgba(255,255,255,${(.8*f).toFixed(3)})`;ctx.lineWidth=2.5*S;ctx.beginPath();ctx.arc(w.x,w.y,w.r,0,TAU);ctx.stroke();
    ctx.strokeStyle=hexA(w.col,(.3*f).toFixed(3));ctx.lineWidth=6*S;ctx.beginPath();ctx.arc(w.x,w.y,w.r*.82,0,TAU);ctx.stroke();}
  for(const h of holes){const k=Math.min(1,h.t/.35,(h.life-h.t)/.35),rr=(34+22*k)*S;
    drawGlow('#7a30ff',h.x,h.y,rr*4,.35*k);drawGlow('#ff8a40',h.x,h.y,rr*2.2,.25*k);
    for(let i=0;i<4;i++){ctx.strokeStyle=i%2?`rgba(255,160,80,${(.55*k).toFixed(3)})`:`rgba(190,120,255,${(.6*k).toFixed(3)})`;ctx.lineWidth=(5-i)*S;
      const a0=time*(4-i*.6)+i*1.7;ctx.beginPath();ctx.ellipse(h.x,h.y,rr*(1.25+i*.28),rr*(.55+i*.12),.4,a0,a0+Math.PI*1.2);ctx.stroke();}}
  ctx.globalCompositeOperation='source-over';
  for(const h of holes){const k=Math.min(1,h.t/.35,(h.life-h.t)/.35),rr=(34+22*k)*S,g=ctx.createRadialGradient(h.x,h.y,0,h.x,h.y,rr);
    g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.62,'rgba(0,0,0,1)');g.addColorStop(.8,`rgba(30,10,50,${(.8*k).toFixed(3)})`);g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(h.x,h.y,rr,0,TAU);ctx.fill();
    ctx.strokeStyle=`rgba(255,200,140,${(.7*k).toFixed(3)})`;ctx.lineWidth=1.5*S;ctx.beginPath();ctx.arc(h.x,h.y,rr*.66,0,TAU);ctx.stroke();}
}

/* ----- designer UI ----- */
let dzDraft=null,dzPrev=null,dzOpen=false;
function refreshDzBtns(){const ok=coins>=11000;for(const id of ['dzBtnMenu','dzBtnPause']){const b=$(id);if(b)b.style.display=ok?'':'none';}}
function openDesigner(){
  dzDraft=JSON.parse(JSON.stringify(DESIGN));dzPrev=state;if(state==='play')state='paused';fireHeld=false;joy.id=null;
  $('dzName').value=dzDraft.name;$('designer').classList.add('show');dzOpen=true;buildDz();requestAnimationFrame(dzLoop);
}
function closeDesigner(save){
  if(save){dzDraft.name=(($('dzName').value||'').trim().toUpperCase()||'MY SHIP').slice(0,12);DESIGN=dzDraft;saveDesign();applyDesign();buildLadder();
    if(tier===6){banner(SHIPS[6].name+' READY','Your design is flying',SHIPS[6].acc);if(player&&player.alive)player.hp=SHIPS[6].hp;}}
  $('designer').classList.remove('show');dzOpen=false;if(dzPrev==='play'&&state==='paused'&&!$('paused').classList.contains('show'))state='play';
}
function chip(html,on,fn){const b=document.createElement('button');b.className='chip'+(on?' on':'');b.innerHTML=html;b.addEventListener('click',()=>{fn();buildDz();});return b;}
function miniShip(i,d){const c=document.createElement('canvas');c.width=c.height=68;const g=c.getContext('2d'),sh=Object.assign({},SHIPS[i],{hull:d.hull,acc:d.acc,special:'none'}),k=50/(sh.nose-sh.tail+18);
  g.translate(34,35);g.rotate(-Math.PI/2);g.scale(k,k);g.translate(-(sh.nose+sh.tail)/2,0);drawShip(g,i,.5,1,sh);return c;}
function buildDz(){
  const d=dzDraft;document.getElementById('designer').style.setProperty('--acc',d.acc);
  const shape=$('dzShape');shape.innerHTML='';SHIPS.slice(0,6).forEach((s,i)=>{const b=chip('',d.base===i,()=>d.base=i);b.classList.add('shape');b.appendChild(miniShip(i,d));b.insertAdjacentHTML('beforeend',`<span>${s.name[0]+s.name.slice(1).toLowerCase()}</span>`);shape.appendChild(b);});
  for(const [id,list,key] of [['dzHull',HULLS,'hull'],['dzAcc',GLOWS,'acc']]){const el=$(id);el.innerHTML='';
    list.forEach(c=>{const b=document.createElement('button');b.style.background=c;if(d[key]===c)b.className='on';b.setAttribute('aria-label',c);b.addEventListener('click',()=>{d[key]=c;buildDz();});el.appendChild(b);});
    const inp=document.createElement('input');inp.type='color';inp.value=d[key];inp.title='Pick any color';inp.addEventListener('input',()=>{d[key]=inp.value;document.getElementById('designer').style.setProperty('--acc',d.acc);});inp.addEventListener('change',()=>buildDz());el.appendChild(inp);}
  $('dzShots').value=d.shots;$('dzShotsV').textContent=d.shots;
  const bl=$('dzBullet');bl.innerHTML='';BTYPES.forEach(b=>bl.appendChild(chip(`<i style="background:${b.col};box-shadow:0 0 8px ${b.col}"></i>${b.label} <small>(${b.from})</small>`,d.bullet===b.id,()=>d.bullet=b.id)));
  const sp=$('dzSpecial');sp.innerHTML='';SPECIALS.forEach(s=>sp.appendChild(chip(`${s.icon} ${s.label}${s.rech?` <small>${s.rech}s</small>`:s.id==='lava'?' <small>no recharge</small>':''}`,d.special===s.id,()=>d.special=s.id)));
  $('dzAutoF').textContent='AUTO-FIRE: '+(d.autoFire?'ON':'OFF');$('dzAutoF').classList.toggle('on',d.autoFire);
  $('dzAutoS').textContent='AUTO SPECIAL: '+(d.special==='none'?'—':d.autoSpecial?'ON':'OFF');$('dzAutoS').classList.toggle('on',d.autoSpecial&&d.special!=='none');
}
function dzLoop(ts){
  if(!dzOpen)return;requestAnimationFrame(dzLoop);
  const c=$('dzPrev'),w=c.clientWidth,h=c.clientHeight;if(!w)return;if(c.width!==Math.round(w*DPR)){c.width=Math.round(w*DPR);c.height=Math.round(h*DPR);}
  const g=c.getContext('2d'),tm=ts/1000,d=dzDraft,sh=makeShipFromDesign(d);g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,w,h);
  g.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<50;i++){const x=((i*97.3-tm*30*(1+i%3))%w+w)%w,y=(i*53.7)%h;g.fillRect(x,y,i%7?1:2,i%7?1:2);}
  const sc=Math.min(h/90,w/150),sx=w*.3,sy=h*.5+Math.sin(tm*2)*4;
  g.globalCompositeOperation='lighter';
  for(let k=0;k<6;k++){const u=((tm*1.6+k/6)%1);for(const [da,o] of sh.pat){const x=sx+(sh.nose+u*w/sc*1.1)*sc,y=sy+(o+Math.tan(da)*u*w/sc)*sc;if(x>w+10)continue;
    if(sh.lava){g.globalCompositeOperation='source-over';const r=4*sc;g.drawImage(lavaSprs[k&3],x-r*1.5,y-r,r*3,r*2);g.globalCompositeOperation='lighter';}
    else{g.globalAlpha=.9;g.drawImage(glow(sh.bul),x-7*sc,y-3*sc,14*sc,6*sc);g.globalAlpha=1;}}}
  g.globalCompositeOperation='source-over';
  g.save();g.translate(sx,sy);g.scale(sc,sc);drawShip(g,6,.7,tm,sh);g.restore();
  const sd=specDef(d.special);g.font=`700 13px Orbitron, sans-serif`;g.textAlign='left';g.fillStyle=sd.col;g.fillText(sd.icon+' '+sd.label.toUpperCase(),10,h-10);
  g.textAlign='right';g.fillStyle='#fff';g.fillText((($('dzName').value||'MY SHIP').toUpperCase()).slice(0,12),w-10,20);
}

/* ----- custom ship cutscenes ----- */
function spaceBg(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#03040c');g.addColorStop(1,'#0b0820');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='lighter';drawGlow('#5a3aa8',W*.3,H*.35,Math.max(W,H)*.5,.3);drawGlow('#1a6a8a',W*.75,H*.6,Math.max(W,H)*.45,.25);ctx.globalCompositeOperation='source-over';
  for(let i=0;i<140;i++){const x=((i*97.31-cut.t*20*(1+i%3))%W+W)%W,y=(i*53.71)%H;ctx.fillStyle=`rgba(230,240,255,${(.3+(i%5)*.14).toFixed(2)})`;ctx.fillRect(x,y,i%9?1:2,i%9?1:2);}
  const pr=Math.max(W,H)*.6,px=W*.5,py=H+pr*.62;let g2=ctx.createRadialGradient(px,py,pr*.95,px,py,pr*1.1);g2.addColorStop(0,'rgba(90,170,255,.45)');g2.addColorStop(1,'rgba(90,170,255,0)');ctx.fillStyle=g2;ctx.beginPath();ctx.arc(px,py,pr*1.1,0,TAU);ctx.fill();
  g2=ctx.createRadialGradient(px-pr*.3,py-pr*.6,pr*.1,px,py,pr);g2.addColorStop(0,'#3a7ac0');g2.addColorStop(.5,'#1d3f6e');g2.addColorStop(1,'#050a18');ctx.fillStyle=g2;ctx.beginPath();ctx.arc(px,py,pr,0,TAU);ctx.fill();}
function drawRock(x,y,r,rot){const a=cut.ast,sz=a.spr.width*r/a.P;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.drawImage(a.spr,-sz/2,-sz/2,sz,sz);ctx.restore();
  const g=ctx.createRadialGradient(x-r*.5,y-r*.5,r*.1,x,y,r*1.2);g.addColorStop(0,'rgba(255,250,235,.15)');g.addColorStop(.6,'rgba(0,0,10,.2)');g.addColorStop(1,'rgba(0,0,10,.85)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*.98,0,TAU);ctx.fill();}
function bigShip(x,y,ang,sc,thr,roll){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(sc,sc*(roll===undefined?1:Math.cos(roll)));drawShip(ctx,6,thr,cut.t);ctx.restore();}
function customWin(t){
  spaceBg();const sh=SHIPS[6],A=[W*.74,H*.36],sc=CU*2.1,sp=sh.special,tb=2.0;
  let x,y,ang=0,roll;
  if(t<1){const u=easeOut(t);x=lerp(-.25*W,.26*W,u);y=lerp(H*.75,H*.5,u);ang=lerp(-.5,Math.atan2(A[1]-H*.5,A[0]-.26*W),u);}
  else if(t<2.2){x=.26*W;y=H*.5+Math.sin(t*3)*4*CU;ang=Math.atan2(A[1]-y,A[0]-x);}
  else{const u=easeIn(clamp((t-2.2)/1.3,0,1));x=lerp(.26*W,1.25*W,u);y=lerp(H*.5,H*.12,u);ang=Math.atan2(-H*.38,W)*.8;roll=(t-2.2)*7;}
  const hole=sp==='hole'&&t>1.5,holeK=hole?clamp((t-1.5)/.5,0,1):0;
  if(t<tb){const rr=46*CU*(1-holeK*.9);if(rr>1)drawRock(A[0]+(hole?Math.sin(t*20)*3*CU*holeK:0),A[1],rr,t*.6+holeK*8);}
  if(t>1&&t<tb){const nx=x+Math.cos(ang)*sh.nose*sc,ny=y+Math.sin(ang)*sh.nose*sc,L=Math.hypot(A[0]-nx,A[1]-ny);
    for(let k=0;k<5;k++){const u=((t-1)*2.4+k/5)%1;for(const [da,o] of sh.pat){const a=ang+da*(1-u),px=nx+Math.cos(a)*L*u-Math.sin(ang)*o*sc*(1-u),py=ny+Math.sin(a)*L*u+Math.cos(ang)*o*sc*(1-u);
      if(sh.lava){const r=5*CU;ctx.drawImage(lavaSprs[k&3],px-r*1.5,py-r,r*3,r*2);}else{ctx.globalCompositeOperation='lighter';drawGlow(sh.bul,px,py,9*CU,.9);ctx.globalCompositeOperation='source-over';}}}
    if(Math.random()<.3)cp({kind:'spark',x:A[0]+rand(-20,20)*CU,y:A[1]+rand(-20,20)*CU,vx:rand(-200,200)*CU,vy:rand(-200,200)*CU,life:.3,size:2*CU,col:sh.bul});}
  if(at('special',1.6)){if(sp==='lightning'){addCutBolt(x,y,A[0],A[1],1.2);addCutBolt(x,y,A[0],A[1],.8);sfx('zap');cut.flash=.5;}
    else if(sp==='lava'){for(let i=0;i<16;i++)lavaBlob(A[0],A[1],rand(-260,260)*CU,rand(-300,100)*CU,rand(4,9)*CU);sfx('erupt');}
    else if(sp==='shock'){cut.ring={x,y,t0:1.6};sfx('shock');}
    else if(sp==='hole'){sfx('hole');}}
  if(cut.ring){const u=(t-cut.ring.t0)/.6;if(u<1){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=hexA(sh.acc,(.8*(1-u)).toFixed(3));ctx.lineWidth=14*CU*(1-u)+2;ctx.beginPath();ctx.arc(cut.ring.x,cut.ring.y,u*W,0,TAU);ctx.stroke();ctx.globalCompositeOperation='source-over';}}
  if(hole&&t<2.6){const k=Math.min(1,(t-1.5)/.3,(2.6-t)/.3),rr=40*CU*k;ctx.globalCompositeOperation='lighter';drawGlow('#7a30ff',A[0],A[1],rr*4,.4*k);
    for(let i=0;i<3;i++){ctx.strokeStyle=i%2?'rgba(255,160,80,.6)':'rgba(190,120,255,.7)';ctx.lineWidth=(4-i)*CU;const a0=t*(5-i)+i*2;ctx.beginPath();ctx.ellipse(A[0],A[1],rr*(1.3+i*.3),rr*(.55+i*.12),.4,a0,a0+3.6);ctx.stroke();}
    ctx.globalCompositeOperation='source-over';ctx.fillStyle='#000';ctx.beginPath();ctx.arc(A[0],A[1],rr*.65,0,TAU);ctx.fill();}
  if(at('boom',tb)){if(!hole)cboom(A[0],A[1],70*CU);else cp({kind:'glow',x:A[0],y:A[1],life:.5,size:90*CU,col:'#d0a0ff'});
    for(let i=0;i<12;i++){const a=rand(0,TAU),s2=rand(60,260)*CU;cp({kind:'debris',x:A[0],y:A[1],vx:Math.cos(a)*s2,vy:Math.sin(a)*s2,life:rand(1,1.8),size:rand(4,9)*CU,col:'#7a7068'});}cut.shake=14;sfx('boom',3);}
  drawBolts();bigShip(x,y,ang,sc,t<1||t>2.2?1:.4,roll);
}
function customLose(t){
  spaceBg();const sh=SHIPS[6],sc=CU*2.1,ti=1.5,P=[W*.48,H*.48];
  if(t<ti){const u=easeOut(t/ti);bigShip(lerp(-.2*W,P[0],u),P[1]+Math.sin(t*3)*5*CU,Math.sin(t*2)*.05,sc,1);
    if(t>.3){const k=easeIn((t-.3)/(ti-.3)),A0=[1.2*W,-.3*H];drawMeteor(lerp(A0[0],P[0],k),lerp(A0[1],P[1],k),40*CU,P[0]-A0[0],P[1]-A0[1]);}}
  else{if(at('hit',ti)){cut.flash=1;cut.shake=22;cboom(P[0],P[1],70*CU);for(let i=0;i<16;i++){const a=rand(0,TAU),s2=rand(80,300)*CU;cp({kind:'debris',x:P[0],y:P[1],vx:Math.cos(a)*s2,vy:Math.sin(a)*s2,life:rand(1.2,2),size:rand(4,10)*CU,col:sh.hull});}sfx('boom',3);sfx('die');}
    const d=t-ti;if(d<.9){const x=P[0]+d*140*CU,y=P[1]+d*d*160*CU;ctx.globalAlpha=(Math.floor(t*14)%2)?1:.6;bigShip(x,y,d*6,sc*(1-d*.45),0);ctx.globalAlpha=1;
      if(Math.random()<.6)cp({kind:'smoke',x,y,vx:rand(-20,20)*CU,vy:rand(-20,20)*CU,life:1.2,size:rand(10,18)*CU,col:'#3a3530'});
      if(Math.random()<.5)cp({kind:'spark',x,y,vx:rand(-200,200)*CU,vy:rand(-200,200)*CU,life:.3,size:2*CU,col:'#ffd27a'});}
    if(at('boom2',ti+.9)){const x=P[0]+.9*140*CU,y=P[1]+.81*160*CU;cboom(x,y,90*CU);cut.shake=18;sfx('boom',3);cut.flash=.6;}}
}
