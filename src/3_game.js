
/* ---------- audio ---------- */
let AC=null,MG=null,NB=null,muted=false;const lastS={};
try{muted=localStorage.getItem('sb_mute')==='1';}catch(e){}
function initAudio(){
  if(AC){if(AC.state==='suspended')AC.resume();return;}
  try{AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=muted?0:.45;MG.connect(AC.destination);
    NB=AC.createBuffer(1,AC.sampleRate*1.5|0,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}catch(e){AC=null;}
}
function tone(type,f1,f2,dur,vol,delay=0){const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f2),t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(MG);o.start(t);o.stop(t+dur+.02);}
function noise(dur,vol,f1,f2,delay=0){const t=AC.currentTime+delay,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NB;f.type='lowpass';
  f.frequency.setValueAtTime(f1,t);f.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(MG);s.start(t);s.stop(t+dur+.02);}
function sfx(k,arg){
  if(!AC||muted)return;const now=AC.currentTime,gap={lava:.09,shoot:.06,coin:.045,hit:.05,boom:.035,eshoot:.08,tick:.04}[k]||0;
  if(gap&&lastS[k]&&now-lastS[k]<gap)return;lastS[k]=now;
  try{switch(k){
    case'erupt':noise(1.4,.55,600,40);tone('sine',60,28,1.2,.25);noise(.5,.3,2500,200,.15);break;
    case'shock':noise(.6,.45,3500,90);tone('sine',200,40,.6,.2);break;
    case'hole':tone('sine',95,28,3,.18);noise(3,.12,500,60);break;
    case'swoosh':noise(.7,.12,4000,300);break;
    case'doom':tone('sine',320,70,1.4,.12);tone('triangle',160,50,1.4,.06);break;
    case'roar':noise(.9,.35,700,120);tone('sawtooth',120,60,.9,.1);break;
    case'lava':noise(.14,.07,900,250);tone('sine',70,45,.12,.04);break;
    case'shoot':tone('square',900-tier*80,180,.08,.035);if(tier>=3)tone('sawtooth',260,70,.1,.025);break;
    case'eshoot':tone('sawtooth',520,180,.14,.03);break;
    case'tick':noise(.05,.12,5000,1500);break;
    case'boom':noise(.25+arg*.2,.22+arg*.08,2400,60);tone('sine',120-arg*15,30,.3+arg*.15,.12);break;
    case'hit':noise(.18,.3,3000,200);tone('square',150,50,.2,.08);break;
    case'coin':tone('sine',1300+Math.random()*250,1900,.08,.05);tone('sine',2600,2600,.06,.025,.04);break;
    case'up':[523,659,784,1047,1319].forEach((f,i)=>tone('triangle',f,f,.22,.09,i*.08));break;
    case'wave':tone('triangle',440,880,.35,.06);tone('triangle',660,1320,.35,.04,.1);break;
    case'zap':noise(.7,.5,9000,200);tone('sawtooth',110,35,.7,.16);for(let i=0;i<5;i++)noise(.06,.35,10000,3000,.05+i*.09);break;
    case'die':noise(1.3,.5,1600,40);tone('sine',220,30,1.1,.2);break;
  }}catch(e){}
}

/* ---------- state ---------- */
let state='menu',player=null,asteroids=[],bullets=[],ebullets=[],enemies=[],coinsArr=[],parts=[],bolts=[];
let score=0,coins=0,tier=0,lives=3,wave=0,clearT=-1,enemyT=15,shake=0,flash=0,hurt=0,charge=1,time=0,overT=-1,hintT=0,driftX=0,driftY=0;
let best=0;try{best=+localStorage.getItem('sb_best')||0;coins=+localStorage.getItem('sb_coins')||0;}catch(e){}
function saveCoins(){try{localStorage.setItem('sb_coins',coins);}catch(e){}}
let autoFire=true,fireHeld=false,autoZap=true,stormT=0,stormTick=0;try{autoZap=localStorage.getItem('sb_autozap')!=='0';}catch(e){}const keys={};
const joy={id:null,bx:0,by:0,x:0,y:0};const JR=60;

function part(x,y,vx,vy,life,size,col,kind){if(parts.length>(kind==='goo'?950:750))return;parts.push({x,y,vx,vy,life,max:life,size,col,kind,rot:rand(0,TAU),vr:rand(-7,7)});}
function explode(x,y,r,col,k=1){
  part(x,y,0,0,.3,r*2.4,'#ffe2b0','glow');part(x,y,0,0,.6,r*1.5,'#ff8a3a','glow');
  const n=Math.min(42,(6+r/S*.5)*k|0);
  for(let i=0;i<n;i++){const a=rand(0,TAU),sp=rand(60,330)*S*k;part(x,y,Math.cos(a)*sp,Math.sin(a)*sp,rand(.25,.6),rand(1,2.2)*S,'#ffd27a','spark');}
  for(let i=0;i<n*.7;i++){const a=rand(0,TAU),sp=rand(20,140)*S;part(x+Math.cos(a)*r*.4,y+Math.sin(a)*r*.4,Math.cos(a)*sp,Math.sin(a)*sp,rand(.8,1.8),rand(1.5,4.5)*S*Math.sqrt(r/(30*S)),col,'debris');}
  for(let i=0;i<n*.45;i++)part(x+rand(-r,r)*.5,y+rand(-r,r)*.5,rand(-20,20)*S,rand(-20,20)*S,rand(.8,1.6),r*rand(.4,.8),shade(col,-30),'smoke');
}
function sparks(x,y,col,n=4){for(let i=0;i<n;i++){const a=rand(0,TAU),sp=rand(80,220)*S;part(x,y,Math.cos(a)*sp,Math.sin(a)*sp,rand(.15,.35),1.4*S,col,'spark');}part(x,y,0,0,.15,10*S,col,'glow');}
function dropCoins(x,y,total){total=Math.round(total);while(total>0){const v=total>=10?5:1;total-=v;const a=rand(0,TAU),sp=rand(20,110)*S;coinsArr.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,v,life:rand(9,11),sp:rand(0,TAU)});}}

function banner(t,s,col){const b=$('banner');$('bt').textContent=t;$('bs').textContent=s||'';b.style.setProperty('--bc',col||'#7fd0ff');b.classList.remove('show');void b.offsetWidth;b.classList.add('show');}
function setAcc(){const sp=specialOf(tier),d=specDef(sp);document.documentElement.style.setProperty('--acc',SHIPS[tier].acc);
  document.body.classList.toggle('t5',sp!=='none');document.body.classList.toggle('t6',sp==='lava');
  $('zap').firstElementChild.textContent=d.icon;$('azap').textContent='AUTO '+d.icon;
  if(tier===6){autoFire=!!DESIGN.autoFire;$('auto').classList.toggle('on',autoFire);setAutoZap(!!DESIGN.autoSpecial);}}

function pickType(){const pool=[['rock',5],['ice',3]];if(wave>=2)pool.push(['iron',3]);if(wave>=3)pool.push(['emerald',2]);if(wave>=4)pool.push(['gold',1.3]);if(wave>=6)pool.push(['void',1.6]);
  let tot=pool.reduce((s,p)=>s+p[1],0),r=Math.random()*tot;for(const p of pool){if((r-=p[1])<=0)return p[0];}return'rock';}
function spawnAst(type,size){
  let x,y,tries=0;const md=Math.min(W,H)*.38;
  do{x=rand(0,W);y=rand(0,H);if(Math.random()<.5)x=Math.random()<.5?-40*S:W+40*S;else y=Math.random()<.5?-40*S:H+40*S;tries++;}
  while(player&&player.alive&&Math.hypot(x-player.x,y-player.y)<md&&tries<20);
  const a=rand(0,TAU),sp=rand(22,52)*S*(1+Math.min(wave,15)*.06);
  asteroids.push(makeAsteroid(type,size,x,y,Math.cos(a)*sp,Math.sin(a)*sp));
}
function startWave(){wave++;const n=Math.min(2+wave,12);for(let i=0;i<n;i++)spawnAst(pickType(),3);banner('WAVE '+wave,wave===1?'Destroy asteroids · grab the coins':'');sfx('wave');}

function lavaSplash(x,y,n){for(let i=0;i<n;i++){const a=rand(0,TAU),sp=rand(40,160)*S;part(x,y,Math.cos(a)*sp,Math.sin(a)*sp,rand(.4,.9),rand(1.5,3.2)*S,'#ff7a1a','lava');}part(x,y,0,0,.25,20*S,'#ff6a10','glow');}
function hitAst(a,dmg,x,y){a.hp-=dmg;a.flash=1;sparks(x,y,shade(a.T.base,60),3);sfx('tick');if(a.hp<=0)destroyAst(a,true);}
function destroyAst(a,split){
  if(a.dead)return;a.dead=true;const r=a.R*S;
  explode(a.x,a.y,r,a.T.base,.8+a.size*.15);
  if(a.T.glow)part(a.x,a.y,0,0,.5,r*2.5,a.T.glow,'glow');
  dropCoins(a.x,a.y,a.T.coins*SIZES[a.size].coin*(split?1:{3:3.6,2:2,1:1}[a.size]));
  score+=Math.round(SIZES[a.size].score*a.T.score);sfx('boom',a.size);shake=Math.min(18,shake+a.size*2);
  if(split&&a.size>1)for(let i=0;i<2;i++){const an=rand(0,TAU),sp=rand(30,75)*S;
    asteroids.push(makeAsteroid(a.type,a.size-1,a.x+Math.cos(an)*r*.3,a.y+Math.sin(an)*r*.3,a.vx*.8+Math.cos(an)*sp,a.vy*.8+Math.sin(an)*sp));}
}

function newPlayer(){return{x:W/2,y:H/2,vx:0,vy:0,ang:-Math.PI/2,hp:SHIPS[tier].hp,inv:3,alive:true,respawn:0,fireT:0,thr:0};}
function newGame(){
  score=0;tier=0;while(tier<MAXT&&coins>=SHIPS[tier+1].cost)tier++;lives=3;wave=0;clearT=-1;overT=-1;charge=1;shake=0;flash=0;hurt=0;
  asteroids=[];bullets=[];ebullets=[];enemies=[];coinsArr=[];parts=[];bolts=[];enemyT=rand(14,20);hintT=7;stormT=0;streams=[];waves=[];holes=[];cut=null;document.body.classList.remove('cut');
  player=newPlayer();setAcc();startWave();if(tier>0)setTimeout(()=>banner(SHIPS[tier].name+' READY','Your coins carried over',SHIPS[tier].acc),2700);state='play';
  document.body.classList.add('playing');['menu','over','paused'].forEach(id=>$(id).classList.remove('show'));
}
function checkTier(){
  let up=false;while(tier<MAXT&&coins>=SHIPS[tier+1].cost){tier++;up=true;}
  if(!up)return;const sh=SHIPS[tier];setAcc();refreshDzBtns();buildLadder();
  if(tier===6){if(player)player.hp=sh.hp;banner('SHIP DESIGNER UNLOCKED','Build your own ship!','#00ffea');sfx('up');setTimeout(()=>{if(state==='play'||state==='paused')openDesigner();},1200);return;}
  if(player){player.hp=sh.hp;if(player.alive){for(let i=0;i<40;i++){const a=i/40*TAU;part(player.x,player.y,Math.cos(a)*260*S,Math.sin(a)*260*S,.6,8*S,sh.acc,'glow');}}}
  banner(sh.name+' UNLOCKED',tier===5?(document.body.classList.contains('touch')?'Tap 🌋 for a lava eruption · no recharge':'Press E for a lava eruption · no recharge'):tier===4?(document.body.classList.contains('touch')?'Tap ⚡ to unleash lightning':'Press E to unleash lightning'):sh.desc+' · hull repaired',sh.acc);sfx('up');
}
function fire(){
  const sh=SHIPS[tier],p=player,ca=Math.cos(p.ang),sa=Math.sin(p.ang),BS=640*S;
  if(sh.lava){for(const [da,o] of sh.pat){const a=p.ang+da+rand(-.05,.05),sp=BS*.66*rand(.9,1.1),x=p.x+(ca*sh.nose-sa*o)*S,y=p.y+(sa*sh.nose+ca*o)*S,life=rand(.95,1.25);
      bullets.push({x,y,vx:Math.cos(a)*sp+p.vx*.4,vy:Math.sin(a)*sp+p.vy*.4,life,max:life,dmg:sh.dmg,lava:1,r:rand(4,6.5),pierce:3,hits:[],spr:lavaSprs[Math.random()*4|0],rot:rand(0,TAU)});}
    part(p.x+ca*sh.nose*S,p.y+sa*sh.nose*S,p.vx,p.vy,.1,16*S,'#ff7a1a','glow');p.fireT=sh.fire;sfx('lava');return;}
  for(const [da,o] of sh.pat){const a=p.ang+da,x=p.x+(ca*sh.nose-sa*o)*S,y=p.y+(sa*sh.nose+ca*o)*S;
    bullets.push({x,y,vx:Math.cos(a)*BS+p.vx*.4,vy:Math.sin(a)*BS+p.vy*.4,life:1,dmg:sh.dmg,col:sh.bul});}
  part(p.x+ca*sh.nose*S,p.y+sa*sh.nose*S,p.vx,p.vy,.08,12*S,sh.bul,'glow');
  p.fireT=sh.fire;sfx('shoot');
}
function damagePlayer(n){
  const p=player;if(!p.alive||p.inv>0)return;p.hp-=n;p.inv=1.3;hurt=1;shake=Math.min(20,shake+8);sfx('hit');
  try{navigator.vibrate&&navigator.vibrate(40);}catch(e){}
  if(p.hp<=0){p.alive=false;lives--;p.respawn=1.3;explode(p.x,p.y,40*S,SHIPS[tier].hull,1.8);part(p.x,p.y,0,0,.8,120*S,SHIPS[tier].acc,'glow');shake=24;sfx('die');}
}
function strike(){
  const sp=specialOf(tier);
  if(state!=='play'||sp==='none'||stormT>0||holes.length||!player||!player.alive)return;
  if(sp==='lava'){erupt();return;}
  if(charge<1)return;
  if(sp==='shock'){shockwave();return;}
  if(sp==='hole'){blackHole();return;}
  charge=0;stormT=1.8;stormTick=0;stormKind='bolt';flashCol='200,185,255';const p=player;
  for(let i=0;i<50;i++){const a=i/50*TAU;part(p.x,p.y,Math.cos(a)*520*S,Math.sin(a)*520*S,.5,14*S,'#c9a8ff','glow');}
  flash=1;shake=26;sfx('zap');stormHit(30);
}
function stormHit(max){
  const p=player,R=Math.max(W,H)*.6;
  const tg=[...asteroids.filter(a=>!a.dead),...enemies.filter(e=>!e.dead)].map(o=>({o,d:Math.hypot(o.x-p.x,o.y-p.y)})).filter(t=>t.d<R).sort((a,b)=>a.d-b.d).slice(0,max);
  tg.forEach((t,i)=>{addBolt(p.x,p.y,t.o.x,t.o.y,i<10?1:.6);if(i>0&&i<14)addBolt(tg[i-1].o.x,tg[i-1].o.y,t.o.x,t.o.y,.5);
    if(t.o.R)destroyAst(t.o,false);else killEnemy(t.o);});
  for(let i=0;i<(tg.length?2:4);i++){const a=rand(0,TAU),L=R*rand(.3,.55);addBolt(p.x,p.y,p.x+Math.cos(a)*L,p.y+Math.sin(a)*L,.55);}
  ebullets.forEach(b=>{if(Math.hypot(b.x-p.x,b.y-p.y)<R)b.dead=1;});
}
let stormKind='bolt',flashCol='200,185,255',streams=[];
function erupt(){
  stormT=2.2;stormTick=0;stormKind='lava';flashCol='255,130,50';const p=player;
  for(let i=0;i<26;i++){const a=i/26*TAU+rand(-.1,.1),sp=rand(180,340)*S;part(p.x,p.y,Math.cos(a)*sp,Math.sin(a)*sp,rand(1,1.6),rand(7,14)*S,'#ff7a1a','goo');}
  part(p.x,p.y,0,0,.6,180*S,'#ff6a10','glow');part(p.x,p.y,0,0,.35,90*S,'#ffd060','glow');
  flash=.8;shake=26;sfx('erupt');lavaHit(26);
}
function lavaHit(max){
  const p=player,R=Math.max(W,H)*.6;
  const tg=[...asteroids.filter(a=>!a.dead&&!a.lavaT),...enemies.filter(e=>!e.dead&&!e.lavaT)].map(o=>({o,d:Math.hypot(o.x-p.x,o.y-p.y)})).filter(t=>t.d<R).sort((a,b)=>a.d-b.d).slice(0,max);
  for(const t of tg){t.o.lavaT=1;addStream(t.o,t.o.x,t.o.y);}
  for(let i=0;i<(tg.length?1:3);i++){const a=rand(0,TAU),L=R*rand(.25,.5);addStream(null,p.x+Math.cos(a)*L,p.y+Math.sin(a)*L);}
  ebullets.forEach(b=>{if(Math.hypot(b.x-p.x,b.y-p.y)<R)b.dead=1;});
}
function addStream(tg,ex,ey){const p=player,d=Math.hypot(ex-p.x,ey-p.y);
  streams.push({tg,sx:p.x,sy:p.y,ex,ey,t:0,u0:0,dur:clamp(d/(900*S),.12,.45),drain:rand(.9,1.3),w:rand(9,16)*S*(tg?1:.7),wob:rand(10,26)*S,ph:rand(0,TAU),hit:false});}
function gooSplash(x,y,n,big){for(let i=0;i<n;i++){const a=rand(0,TAU),sp=rand(50,260)*S;part(x,y,Math.cos(a)*sp,Math.sin(a)*sp,rand(.9,1.7),rand(4,big?15:10)*S,'#ff7a1a','goo');}
  part(x,y,0,0,.45,(big?90:50)*S,'#ff6a10','glow');for(let i=0;i<3;i++)part(x+rand(-15,15)*S,y+rand(-15,15)*S,rand(-15,15)*S,rand(-15,15)*S,rand(1.2,2),rand(18,34)*S,'#3a2a24','smoke');}
function updateStreams(dt){
  const p=player;
  for(const s of streams){
    if(!s.hit){if(p&&p.alive){s.sx=p.x;s.sy=p.y;}if(s.tg&&!s.tg.dead){s.ex=s.tg.x;s.ey=s.tg.y;}
      s.t+=dt/s.dur;if(s.t>=1){s.t=1;s.hit=true;const big=!!s.tg;
        if(s.tg&&!s.tg.dead){if(s.tg.R)destroyAst(s.tg,false);else killEnemy(s.tg);}gooSplash(s.ex,s.ey,big?14:6,big);if(Math.random()<.5)sfx('lava');}}
    else{s.u0+=dt/s.drain;if(s.u0>=1)s.dead=1;}
  }
  streams=streams.filter(s=>!s.dead);
}
function updateStorm(dt){
  if(stormT<=0)return;
  if(!player||!player.alive){stormT=0;return;}
  stormT-=dt;stormTick-=dt;
  if(stormKind==='lava'){if(stormTick<=0){stormTick=.14;lavaHit(6);shake=Math.max(shake,7);flash=Math.max(flash,.15);
      const p=player;for(let i=0;i<3;i++){const a=rand(0,TAU),sp=rand(120,300)*S;part(p.x,p.y,Math.cos(a)*sp,Math.sin(a)*sp,rand(.8,1.4),rand(5,11)*S,'#ff7a1a','goo');}
      if(Math.random()<.5)sfx('lava');}
    return;}
  if(stormTick<=0){stormTick=.13;stormHit(8);flash=Math.max(flash,.35);shake=Math.max(shake,8);if(Math.random()<.5)sfx('tick');
    if(AC&&!muted&&Math.random()<.4)try{noise(.08,.25,9000,2500);}catch(e){}}
}
function boltPts(x1,y1,x2,y2,depth){let pts=[[x1,y1],[x2,y2]],disp=Math.hypot(x2-x1,y2-y1)*.22;
  for(let d=0;d<depth;d++){const np=[pts[0]];for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i],dx=bx-ax,dy=by-ay,l=Math.hypot(dx,dy)||1,o=rand(-disp,disp);
    np.push([(ax+bx)/2-dy/l*o,(ay+by)/2+dx/l*o],[bx,by]);}pts=np;disp*=.55;}return pts;}
function addBolt(x1,y1,x2,y2,w){const pts=boltPts(x1,y1,x2,y2,6);bolts.push({pts,life:.5,max:.5,w});
  for(let k=0;k<2;k++){const i=1+(Math.random()*(pts.length-2)|0),[bx,by]=pts[i],a=Math.atan2(y2-y1,x2-x1)+rand(-1,1),L=Math.hypot(x2-x1,y2-y1)*rand(.15,.3);
    bolts.push({pts:boltPts(bx,by,bx+Math.cos(a)*L,by+Math.sin(a)*L,4),life:.4,max:.4,w:w*.5});}}

function spawnEnemy(){
  const hunter=wave>=3&&Math.random()<.45,side=Math.random()<.5;
  if(hunter){const e={kind:'hunter',x:side?-30*S:W+30*S,y:rand(.1,.9)*H,vx:0,vy:0,ang:side?0:Math.PI,hp:6+wave*.5,r:18,fireT:rand(1.5,2.5),age:0,flash:0};enemies.push(e);}
  else enemies.push({kind:'saucer',x:side?-30*S:W+30*S,y:rand(.15,.85)*H,vx:(side?1:-1)*rand(70,105)*S,vy:0,ph:rand(0,TAU),hp:4+wave*.3,r:22,fireT:rand(1,2),age:0,flash:0});
}
function killEnemy(e){if(e.dead)return;e.dead=true;explode(e.x,e.y,e.r*S*1.3,e.kind==='saucer'?'#9aa3b0':'#7a2a34',1.4);part(e.x,e.y,0,0,.5,70*S,'#ff9a50','glow');
  dropCoins(e.x,e.y,e.kind==='saucer'?8:12);score+=e.kind==='saucer'?200:350;sfx('boom',3);shake=Math.min(20,shake+7);}
