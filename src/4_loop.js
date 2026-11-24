
/* ---------- update ---------- */
function updatePlayer(dt){
  const p=player,sh=SHIPS[tier];
  if(!p.alive){p.respawn-=dt;if(p.respawn<=0&&!p.cutQ){p.cutQ=true;playCut('lose',()=>{p.cutQ=false;
      if(lives>0)Object.assign(p,{x:W/2,y:H/2,vx:0,vy:0,ang:-Math.PI/2,alive:true,inv:3,hp:SHIPS[tier].hp});else gameOver();});}return;}
  p.inv=Math.max(0,p.inv-dt);
  let thr=keys.up?1:0;p.ang+=((keys.right?1:0)-(keys.left?1:0))*4.4*dt;
  if(joy.id!==null){const dx=joy.x-joy.bx,dy=joy.y-joy.by,m=Math.min(1,Math.hypot(dx,dy)/JR);
    if(m>.15){const d=angDiff(Math.atan2(dy,dx),p.ang);p.ang+=clamp(d,-9*dt,9*dt);thr=Math.max(thr,clamp((m-.3)/.6,0,1)*(Math.abs(d)<1.2?1:.3));}}
  p.thr=thr;const ca=Math.cos(p.ang),sa=Math.sin(p.ang);
  p.vx+=ca*sh.thrust*S*thr*dt;p.vy+=sa*sh.thrust*S*thr*dt;
  const dr=Math.pow(.6,dt);p.vx*=dr;p.vy*=dr;
  const sp=Math.hypot(p.vx,p.vy),mx=sh.max*S;if(sp>mx){p.vx*=mx/sp;p.vy*=mx/sp;}
  p.x+=p.vx*dt;p.y+=p.vy*dt;wrap(p,20*S);
  if(thr>0)for(const e of sh.eng)if(Math.random()<thr*.9){const ex=p.x+(ca*e[0]-sa*e[1])*S,ey=p.y+(sa*e[0]+ca*e[1])*S,s=rand(60,130)*S;
    part(ex,ey,-ca*s+p.vx*.3+rand(-15,15)*S,-sa*s+p.vy*.3+rand(-15,15)*S,rand(.15,.3),6*S,sh.acc,'glow');}
  if(p.hp<=2&&Math.random()<dt*10)part(p.x,p.y,rand(-20,20)*S,rand(-20,20)*S,1,8*S,'#555555','smoke');
  p.fireT-=dt;if((fireHeld||keys.fire||(autoFire&&(document.body.classList.contains('touch')||tier===6)))&&p.fireT<=0)fire();
  const pr=sh.r*S;
  if(p.inv<=0)for(const a of asteroids){if(a.dead)continue;const dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy)||1;
    if(d<a.R*S*.85+pr){damagePlayer(1);hitAst(a,3,p.x-dx/d*pr,p.y-dy/d*pr);p.vx=dx/d*200*S;p.vy=dy/d*200*S;a.vx-=dx/d*30*S;a.vy-=dy/d*30*S;break;}}
}
function updateEnemies(dt){
  const p=player;
  for(const e of enemies){if(e.dead)continue;e.age+=dt;e.flash=Math.max(0,e.flash-dt*6);
    if(e.burn>0){e.burn-=dt;e.hp-=3.5*dt;if(Math.random()<dt*14)part(e.x,e.y,rand(-30,30)*S,rand(-30,30)*S,.5,1.4*S,'#ffa030','spark');if(e.hp<=0){killEnemy(e);continue;}}
    if(e.kind==='saucer'){e.vy=Math.sin(time*1.7+e.ph)*60*S;e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.y<-30)e.y+=H+60;if(e.y>H+30)e.y-=H+60;
      if(e.age>3&&(e.x<-60*S||e.x>W+60*S)){e.dead=true;continue;}}
    else{const ta=p&&p.alive?Math.atan2(p.y-e.y,p.x-e.x):e.ang+Math.sin(time)*.5;e.ang+=clamp(angDiff(ta,e.ang),-2.6*dt,2.6*dt);
      const d=p?Math.hypot(p.x-e.x,p.y-e.y):999,want=d>200*S?1:-.4;e.vx+=Math.cos(e.ang)*want*220*S*dt;e.vy+=Math.sin(e.ang)*want*220*S*dt;
      const dr=Math.pow(.5,dt);e.vx*=dr;e.vy*=dr;const sp=Math.hypot(e.vx,e.vy),mx=170*S;if(sp>mx){e.vx*=mx/sp;e.vy*=mx/sp;}
      e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.age>2)wrap(e,30*S);
      if(Math.random()<dt*20)part(e.x-Math.cos(e.ang)*14*S,e.y-Math.sin(e.ang)*14*S,-Math.cos(e.ang)*80*S,-Math.sin(e.ang)*80*S,.2,5*S,'#ff5040','glow');}
    e.fireT-=dt;
    if(e.fireT<=0&&p&&p.alive&&e.x>0&&e.x<W&&e.y>0&&e.y<H){const err=e.kind==='saucer'?.28:.12,a=Math.atan2(p.y-e.y,p.x-e.x)+rand(-err,err),bs=270*S;
      ebullets.push({x:e.x,y:e.y,vx:Math.cos(a)*bs,vy:Math.sin(a)*bs,life:3});sfx('eshoot');
      e.fireT=(e.kind==='saucer'?rand(1.5,2.4):rand(1.1,1.7))-Math.min(wave*.04,.5);}
    if(p&&p.alive&&p.inv<=0&&Math.hypot(p.x-e.x,p.y-e.y)<(e.r+SHIPS[tier].r)*S){damagePlayer(1);e.hp-=3;e.flash=1;if(e.hp<=0)killEnemy(e);}
  }
}
function update(dt){
  time+=dt;const p=player;
  if(state==='play'){
    updatePlayer(dt);hintT-=dt;
    updateStorm(dt);updateStreams(dt);updateSpecials(dt);const SP=specialOf(tier),RC=specDef(SP).rech;if(SP==='lava')charge=1;
    if(RC>0&&charge<1&&stormT<=0&&!holes.length)charge=Math.min(1,charge+dt/RC);
    if(autoZap&&SP!=='none'&&charge>=1&&stormT<=0&&!holes.length&&player.alive&&player.inv<2.5&&(asteroids.length||enemies.length))strike();
    enemyT-=dt;if(enemyT<=0){if(enemies.filter(e=>!e.dead).length<1+Math.floor(wave/3))spawnEnemy();enemyT=Math.max(6,rand(13,19)-wave*.8);}
    updateEnemies(dt);
    if(clearT<0&&asteroids.length===0&&p.alive){clearT=cutsOn?1.1:2.6;const bonus=wave*100;score+=bonus;
      for(const c of coinsArr){coins+=c.v;score+=10*c.v;}if(coinsArr.length){coinsArr=[];saveCoins();sfx('coin');checkTier();}
      if(!cutsOn)banner('WAVE CLEARED','+'+bonus+' bonus','#7fffd0');}
    if(clearT>=0){clearT-=dt;if(clearT<0){if(p.alive)playCut('win',startWave);else startWave();}}
    if(overT>=0){overT-=dt;if(overT<0)gameOver();}
  }
  for(const a of asteroids){a.x+=a.vx*dt;a.y+=a.vy*dt;a.rot+=a.vr*dt;a.flash=Math.max(0,a.flash-dt*6);wrap(a,a.R*S);
    if(a.burn>0&&!a.dead){a.burn-=dt;a.hp-=3.5*dt;const r=a.R*S;if(Math.random()<dt*16)part(a.x+rand(-.6,.6)*r,a.y+rand(-.6,.6)*r,rand(-25,25)*S,rand(-25,25)*S,rand(.4,.8),1.5*S,'#ffa030','spark');
      if(Math.random()<dt*5)part(a.x+rand(-.5,.5)*r,a.y+rand(-.5,.5)*r,rand(-10,10)*S,rand(-10,10)*S,1.2,r*.35,'#3a2a24','smoke');if(a.hp<=0)destroyAst(a,true);}}
  for(const b of bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0){b.dead=1;continue;}wrap(b,0);
    if(b.lava){b.rot+=dt*4;if(Math.random()<dt*10)part(b.x,b.y,b.vx*.1,b.vy*.1,rand(.3,.6),rand(1,2)*S,'#ff7a1a','lava');}
    for(let i=0;i<asteroids.length;i++){const a=asteroids[i];if(a.dead||(b.lava&&b.hits.includes(a)))continue;const r=a.R*S*.92+(b.lava?b.r*S:0),dx=b.x-a.x,dy=b.y-a.y;
      if(dx*dx+dy*dy<r*r){if(b.lava){b.hits.push(a);a.burn=1.8;lavaSplash(b.x,b.y,3);if(--b.pierce<=0)b.dead=1;b.vx*=.75;b.vy*=.75;}else b.dead=1;hitAst(a,b.dmg,b.x,b.y);break;}}
    if(!b.dead)for(const e of enemies){if(e.dead||(b.lava&&b.hits.includes(e)))continue;const r=e.r*S+(b.lava?b.r*S:0);if(Math.hypot(b.x-e.x,b.y-e.y)<r){
      if(b.lava){b.hits.push(e);e.burn=1.8;lavaSplash(b.x,b.y,3);if(--b.pierce<=0)b.dead=1;}else b.dead=1;
      e.hp-=b.dmg;e.flash=1;sparks(b.x,b.y,'#ffd0a0',4);sfx('tick');if(e.hp<=0)killEnemy(e);break;}}}
  for(const b of ebullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0||b.x<-20||b.x>W+20||b.y<-20||b.y>H+20){b.dead=1;continue;}
    if(p&&p.alive&&Math.hypot(b.x-p.x,b.y-p.y)<(SHIPS[tier].r+3)*S){if(p.inv<=0){b.dead=1;damagePlayer(1);sparks(b.x,b.y,'#ff6050',6);}continue;}
    for(const a of asteroids)if(!a.dead&&Math.hypot(b.x-a.x,b.y-a.y)<a.R*S*.9){b.dead=1;sparks(b.x,b.y,'#ff6050',3);break;}}
  const sh=SHIPS[tier];
  for(const c of coinsArr){c.life-=dt;c.sp+=dt*6;if(c.life<=0){c.dead=1;continue;}const dr=Math.pow(.25,dt);c.vx*=dr;c.vy*=dr;
    if(p&&p.alive&&state==='play'){const dx=p.x-c.x,dy=p.y-c.y,d=Math.hypot(dx,dy)||1,mg=sh.mag*S;
      if(d<mg){const f=(1-d/mg)*1800*S+300*S;c.vx+=dx/d*f*dt;c.vy+=dy/d*f*dt;}
      if(d<(sh.r+8)*S){c.dead=1;coins+=c.v;saveCoins();score+=10*c.v;sfx('coin');part(c.x,c.y,0,0,.25,14*S,'#ffcf4a','glow');checkTier();}}
    c.x+=c.vx*dt;c.y+=c.vy*dt;wrap(c,5);}
  for(const q of parts){q.life-=dt;if(q.life<=0){q.dead=1;continue;}const dr=Math.pow(q.kind==='smoke'?.35:q.kind==='goo'?.3:.6,dt);if(q.kind==='goo'&&Math.random()<dt*4)part(q.x,q.y,q.vx*.2,q.vy*.2,rand(.4,.8),q.size*.35,'#ff7a1a','lava');q.vx*=dr;q.vy*=dr;q.x+=q.vx*dt;q.y+=q.vy*dt;q.rot+=q.vr*dt;}
  for(const b of bolts){b.life-=dt;if(b.life<=0)b.dead=1;}
  asteroids=asteroids.filter(o=>!o.dead);bullets=bullets.filter(o=>!o.dead);ebullets=ebullets.filter(o=>!o.dead);enemies=enemies.filter(o=>!o.dead);
  coinsArr=coinsArr.filter(o=>!o.dead);parts=parts.filter(o=>!o.dead);bolts=bolts.filter(o=>!o.dead);
  shake=Math.max(0,shake-dt*40);flash=Math.max(0,flash-dt*2.2);hurt=Math.max(0,hurt-dt*2);
  driftX+=(p&&p.alive?p.vx:14*S)*dt;driftY+=(p&&p.alive?p.vy:6*S)*dt;
}
function gameOver(){state='over';saveCoins();document.body.classList.remove('playing');
  if(score>best){best=score;try{localStorage.setItem('sb_best',best);}catch(e){}}
  $('ostats').innerHTML=`Score <b>${score.toLocaleString()}</b><br>Wave <b>${wave}</b> · Ship <b>${SHIPS[tier].name}</b><br>Coins kept <b>◉ ${coins}</b><br>Best <b>${best.toLocaleString()}</b>`;$('over').classList.add('show');}

/* ---------- background ---------- */
let bg=null;const stars=[];for(let i=0;i<260;i++)stars.push({x:Math.random(),y:Math.random(),l:i%3,b:rand(.3,1),tw:rand(1,4),s:Math.random()<.06?2:1});
function seeded(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function buildBG(){
  bg=document.createElement('canvas');bg.width=Math.ceil(W);bg.height=Math.ceil(H);const g=bg.getContext('2d'),r=seeded(7);
  const base=g.createLinearGradient(0,0,W,H);base.addColorStop(0,'#03040c');base.addColorStop(1,'#070314');g.fillStyle=base;g.fillRect(0,0,W,H);
  g.globalCompositeOperation='lighter';const cols=[[40,60,150],[100,40,140],[20,110,130],[140,40,90],[60,40,160]],M=Math.max(W,H);
  for(let i=0;i<9;i++){const x=r()*W,y=r()*H,rad=(.25+r()*.45)*M,c=cols[i%5].join(','),gr=g.createRadialGradient(x,y,0,x,y,rad);
    gr.addColorStop(0,`rgba(${c},.14)`);gr.addColorStop(.5,`rgba(${c},.05)`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(0,0,W,H);}
  g.globalCompositeOperation='source-over';
  for(let i=0;i<W*H/700;i++){g.fillStyle=`rgba(255,255,255,${(r()*.22).toFixed(2)})`;g.fillRect(r()*W,r()*H,.7,.7);}
  const pr=Math.min(W,H)*.13,px=W*.84,py=H*.2;
  let gr=g.createRadialGradient(px,py,pr*.9,px,py,pr*1.4);gr.addColorStop(0,'rgba(120,170,255,.28)');gr.addColorStop(1,'rgba(120,170,255,0)');g.fillStyle=gr;g.beginPath();g.arc(px,py,pr*1.4,0,TAU);g.fill();
  g.save();g.beginPath();g.arc(px,py,pr,0,TAU);g.clip();g.fillStyle='#3a4c6e';g.fillRect(px-pr,py-pr,pr*2,pr*2);
  for(let i=0;i<14;i++){g.fillStyle=`rgba(${r()<.5?'200,210,240':'20,30,60'},${(r()*.25).toFixed(2)})`;g.beginPath();g.ellipse(px,py-pr+r()*pr*2,pr*1.3,pr*r()*.12+1,-.25,0,TAU);g.fill();}
  gr=g.createRadialGradient(px-pr*.45,py-pr*.45,pr*.05,px,py,pr*1.05);gr.addColorStop(0,'rgba(255,255,255,.18)');gr.addColorStop(.45,'rgba(0,0,0,0)');gr.addColorStop(.8,'rgba(0,0,8,.75)');gr.addColorStop(1,'rgba(0,0,8,.97)');
  g.fillStyle=gr;g.fillRect(px-pr,py-pr,pr*2,pr*2);g.restore();
}
