
/* ---------- boss battles ---------- */
let boss=null,bossesOn=true,bossDefeated=null,Z=1.5;
try{bossesOn=localStorage.getItem('sb_boss')!=='0';}catch(e){}
const BOSSES=['bastion','phantom','hive','mirror','leviathan','titan'];
const BOSSNAME={bastion:'THE BASTION',phantom:'THE PHANTOM',hive:'THE HIVE QUEEN',mirror:'THE MIRROR',leviathan:'THE LEVIATHAN',titan:'THE GRAVITY TITAN'};
const BOSSCOL={bastion:'#ff7a2a',phantom:'#b06bff',hive:'#9dff4a',mirror:'#8ff0ff',leviathan:'#2fe0a0',titan:'#ff4a8a'};
const BOSSHP={bastion:.7,phantom:.4,hive:.6,mirror:.7,leviathan:1,titan:1.05};
function shipDPS(){const sh=SHIPS[tier],eff=sh.pat.reduce((s,p)=>s+(Math.abs(p[0])<=.13?1:.5),0);return eff*sh.dmg/sh.fire*(sh.lava?.75:1);}
function eshot(x,y,a,sp,col,size){ebullets.push({x,y,vx:Math.cos(a)*sp*S,vy:Math.sin(a)*sp*S,life:6,col,size});}
function aimAt(x,y){return player&&player.alive?Math.atan2(player.y-y,player.x-x):Math.PI/2;}
function bossDrift(b,dt,sp){b.mt-=dt;if(b.mt<=0){b.mt=rand(3,5);b.tx=rand(.22,.78)*W;b.ty=rand(.18,.42)*H;}b.x+=(b.tx-b.x)*dt*sp;b.y+=(b.ty-b.y)*dt*sp;}
function startBoss(){
  const idx=(wave/5-1)%6,cyc=Math.floor((wave/5-1)/6),type=BOSSES[idx];
  for(const e of enemies)part(e.x,e.y,0,0,.4,40*Z,'#ffffff','glow');enemies=[];ebullets=[];
  const max=Math.max(60,shipDPS()*30*(1+.3*cyc)*BOSSHP[type]);
  setTheme(BOSS_THEME);
  boss={type,name:BOSSNAME[type],col:BOSSCOL[type],x:W/2,y:-150*Z,tx:W/2,ty:H*.3,mt:3,hp:max,max,t:0,entering:2.2,flash:0,specCD:0,fireT:2.5,fireT2:3.5,cyc,dying:0,boomT:0};
  BT[type].init(boss);
  banner('⚠ WARNING ⚠',boss.name+' APPROACHES','#ff3355');sfx('siren');shake=10;
}
function bossDamage(n,x,y){const b=boss;if(!b||b.dying||b.entering>0)return;b.hp-=n;b.flash=1;
  if(Math.random()<.5)sparks(x,y,b.col,3);if(b.hp<=0){b.hp=0;b.dying=2.2;sfx('die');shake=16;}}
function bossBulletHit(bl){const b=boss;if(!b||b.dying||b.entering>0)return false;if(BT[b.type].hit(b,bl)){bl.dead=1;return true;}return false;}
function bossSpecial(kind){
  const b=boss;if(!b||b.dying||b.entering>0||b.specCD>0||!player)return;
  const ok=BT[b.type].special?BT[b.type].special(b,kind):true;
  if(kind==='lightning'){for(let i=0;i<3;i++)addBolt(player.x,player.y,b.x,b.y,1);}
  else if(kind==='lava'){for(let i=0;i<3;i++)addStream(null,b.x+rand(-30,30)*Z,b.y+rand(-30,30)*Z);}
  else part(b.x,b.y,0,0,.5,120*Z,kind==='hole'?'#b060ff':'#7fe8ff','glow');
  if(ok){b.specCD=6;bossDamage(b.max*.03,b.x,b.y);banner(b.name.replace('THE ','')+' HIT!','','#ffd060');}
}
function updateBoss(dt){
  const b=boss;if(!b)return;b.t+=dt;b.flash=Math.max(0,b.flash-dt*5);b.specCD=Math.max(0,b.specCD-dt);
  if(b.dying>0){b.dying-=dt;b.boomT-=dt;if(b.boomT<=0){b.boomT=.14;const a=rand(0,TAU),r=rand(0,70)*Z;explode(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r,rand(20,40)*Z,'#8a8070',1);sfx('boom',2);shake=Math.max(shake,8);}
    if(b.dying<=0){explode(b.x,b.y,110*Z,'#8a8070',2.2);part(b.x,b.y,0,0,.9,300*Z,b.col,'glow');flash=1;flashCol='255,240,220';shake=30;sfx('boom',3);
      dropCoins(b.x,b.y,120*(b.cyc+1));score+=5000*(b.cyc+1);bossDefeated=b.name;boss=null;}
    return;}
  if(b.entering>0){b.entering-=dt;b.y=lerp(-150*Z,b.ty,easeOut(clamp(1-b.entering/2.2,0,1)));BT[b.type].update(b,dt,true);return;}
  BT[b.type].update(b,dt,false);
  const p=player;if(p&&p.alive&&p.inv<=0&&BT[b.type].body(b,p.x,p.y,SHIPS[tier].r*Z)){damagePlayer(1);const a=Math.atan2(p.y-b.y,p.x-b.x);p.vx=Math.cos(a)*320*S;p.vy=Math.sin(a)*320*S;}
}
function drawBoss(){const b=boss;if(!b)return;
  if(b.dying>0&&((b.t*20)|0)%2)ctx.globalAlpha=.55;BT[b.type].draw(b);ctx.globalAlpha=1;
  if(b.flash>0){ctx.globalCompositeOperation='lighter';drawGlow('#ffffff',b.x,b.y,80*Z,b.flash*.35);ctx.globalCompositeOperation='source-over';}}
function hiveSh(b){return b.ovl<=0&&b.drones.some(d=>d.alive);}
function arcSeg(x,y,r0,r1,a0,a1){ctx.beginPath();ctx.arc(x,y,r1,a0,a1);ctx.arc(x,y,r0,a1,a0,true);ctx.closePath();}

const BT={
/* 1. BASTION: rotating ablative armor plates around a core */
bastion:{
  init(b){b.n=12;b.pmax=b.max*.012;b.plates=Array.from({length:b.n},()=>({hp:b.pmax,re:0}));b.rot=0;b.rs=.45;b.flip=5;},
  update(b,dt,ent){b.rot+=b.rs*dt;b.flip-=dt;if(b.flip<=0){b.flip=rand(4,6);b.rs=-Math.sign(b.rs)*rand(.35,.6)*(1+b.cyc*.15);}
    for(const pl of b.plates)if(pl.hp<=0){pl.re-=dt;if(pl.re<=0){pl.hp=b.pmax;pl.grow=1;}}
    if(ent)return;bossDrift(b,dt,.5);
    b.fireT-=dt;if(b.fireT<=0){b.fireT=2.4;for(let i=0;i<10;i++)eshot(b.x,b.y,b.rot+i/10*TAU,150,'#ff8a3a',12);sfx('eshoot');}
    b.fireT2-=dt;if(b.fireT2<=0){b.fireT2=1.5;const a=aimAt(b.x,b.y);for(const d of[-.18,0,.18])eshot(b.x,b.y,a+d,230,'#ffb050');}},
  hit(b,bl){const dx=bl.x-b.x,dy=bl.y-b.y,d=Math.hypot(dx,dy),R=66*Z,pw=11*Z;
    if(d<R+pw&&d>R-pw){let a=(Math.atan2(dy,dx)-b.rot)%TAU;if(a<0)a+=TAU;const pl=b.plates[Math.floor(a/(TAU/b.n))%b.n];
      if(pl.hp>0){pl.hp-=bl.dmg;sparks(bl.x,bl.y,'#c8d0dc',2);sfx('tick');if(pl.hp<=0){pl.re=7;explode(bl.x,bl.y,16*Z,'#7a8290',.6);}return true;}return false;}
    if(d<30*Z){bossDamage(bl.dmg,bl.x,bl.y);return true;}return false;},
  special(b){for(const pl of b.plates)if(pl.hp>0){pl.hp=0;pl.re=6;}explode(b.x,b.y,70*Z,'#7a8290',1.2);return false;},
  body(b,x,y,r){return Math.hypot(x-b.x,y-b.y)<77*Z+r;},
  draw(b){const R=66*Z,pw=11*Z,seg=TAU/b.n,pulse=.5+.5*Math.sin(b.t*5);
    ctx.globalCompositeOperation='lighter';drawGlow(b.col,b.x,b.y,90*Z,.35+.2*pulse);ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='#1a1c22';ctx.beginPath();ctx.arc(b.x,b.y,40*Z,0,TAU);ctx.fill();ctx.strokeStyle='#3a3e48';ctx.lineWidth=3*Z;ctx.stroke();
    for(let i=0;i<6;i++){const a=-b.rot*1.5+i/6*TAU;ctx.strokeStyle='#4a4e58';ctx.lineWidth=4*Z;ctx.beginPath();ctx.moveTo(b.x+Math.cos(a)*30*Z,b.y+Math.sin(a)*30*Z);ctx.lineTo(b.x+Math.cos(a)*R*.8,b.y+Math.sin(a)*R*.8);ctx.stroke();}
    let g=ctx.createRadialGradient(b.x-6*Z,b.y-6*Z,2*Z,b.x,b.y,30*Z);g.addColorStop(0,'#fff6d0');g.addColorStop(.35,'#ffb040');g.addColorStop(.75,'#e0401a');g.addColorStop(1,'#5a1008');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,(27+2*pulse)*Z,0,TAU);ctx.fill();
    b.plates.forEach((pl,i)=>{const a0=b.rot+i*seg+.04,a1=b.rot+(i+1)*seg-.04;
      if(pl.hp<=0){ctx.strokeStyle='rgba(255,140,60,.25)';ctx.lineWidth=1.2*Z;ctx.setLineDash([4*Z,4*Z]);arcSeg(b.x,b.y,R-pw,R+pw,a0,a1);ctx.stroke();ctx.setLineDash([]);return;}
      const k=pl.hp/b.pmax,gg=ctx.createRadialGradient(b.x,b.y,R-pw,b.x,b.y,R+pw);gg.addColorStop(0,'#5a626e');gg.addColorStop(.5,shade('#a8b2c0',-(1-k)*60));gg.addColorStop(1,'#3a404a');
      ctx.fillStyle=gg;arcSeg(b.x,b.y,R-pw,R+pw,a0,a1);ctx.fill();ctx.strokeStyle=k<.4?'#ff6a3a':'rgba(255,170,90,.8)';ctx.lineWidth=1.4*Z;ctx.stroke();
      if(pl.grow){pl.grow=Math.max(0,pl.grow-.05);ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,180,90,${(pl.grow*.6).toFixed(2)})`;arcSeg(b.x,b.y,R-pw,R+pw,a0,a1);ctx.fill();ctx.globalCompositeOperation='source-over';}});}
},
/* 2. PHANTOM: teleports, leaves decoys, only hittable while glowing */
phantom:{
  init(b){b.st='vis';b.stT=2.2;b.decoys=[];b.fade=1;b.shotT=.8;},
  update(b,dt,ent){if(ent){b.fade=1;return;}b.stT-=dt;
    if(b.st==='vis'){b.fade=1;b.shotT-=dt;if(b.shotT<=0){b.shotT=.75;eshot(b.x,b.y,aimAt(b.x,b.y),240,'#c890ff');sfx('eshoot');}
      if(b.stT<=0){b.st='fade';b.stT=.35;}}
    else if(b.st==='fade'){b.fade=b.stT/.35;if(b.stT<=0){b.st='gone';b.stT=.5;b.fade=0;b.decoys=[];}}
    else if(b.st==='gone'){if(b.stT<=0){const pos=()=>{let x,y,k=0;do{x=rand(.15,.85)*W;y=rand(.15,.6)*H;k++;}while(player&&Math.hypot(x-player.x,y-player.y)<170*Z&&k<20);return[x,y];};
        [b.x,b.y]=pos();b.decoys=Array.from({length:2+Math.min(b.cyc,2)},()=>{const [x,y]=pos();return{x,y,alive:true};});
        for(const o of [b,...b.decoys])for(let i=0;i<14;i++){const a=rand(0,TAU);part(o.x+Math.cos(a)*50*Z,o.y+Math.sin(a)*50*Z,-Math.cos(a)*150*Z,-Math.sin(a)*150*Z,.3,6*Z,b.col,'glow');}
        b.st='appear';b.stT=.35;}}
    else if(b.st==='appear'){b.fade=1-b.stT/.35;if(b.stT<=0){b.st='vis';b.stT=rand(1.5,1.9);
        for(const o of [b,...b.decoys.filter(d=>d.alive)]){const a=aimAt(o.x,o.y),n=o===b?5:3;for(let i=0;i<n;i++)eshot(o.x,o.y,a+(i-(n-1)/2)*.2,200,'#c890ff');}sfx('eshoot');}}},
  hit(b,bl){if(b.st!=='vis')return false;
    if(Math.hypot(bl.x-b.x,bl.y-b.y)<36*Z){bossDamage(bl.dmg,bl.x,bl.y);return true;}
    for(const d of b.decoys)if(d.alive&&Math.hypot(bl.x-d.x,bl.y-d.y)<36*Z){d.alive=false;explode(d.x,d.y,30*Z,'#5a3a8a',.8);for(let i=0;i<4;i++)eshot(d.x,d.y,i/4*TAU+.4,170,'#c890ff');return true;}
    return false;},
  special(b){if(b.st!=='vis'&&b.st!=='appear')return false;for(const d of b.decoys)if(d.alive){d.alive=false;explode(d.x,d.y,30*Z,'#5a3a8a',.8);}return true;},
  body(b,x,y,r){return(b.st==='vis')&&Math.hypot(x-b.x,y-b.y)<34*Z+r;},
  draw(b){if(b.fade<=0)return;const one=(x,y,real)=>{ctx.save();ctx.translate(x,y+Math.sin(b.t*3+x)*4*Z);ctx.scale(Z,Z);ctx.globalAlpha*=b.fade;
      if(b.st==='vis'){ctx.globalCompositeOperation='lighter';ctx.drawImage(glow(b.col),-70,-50,140,100);ctx.globalCompositeOperation='source-over';}
      const g=ctx.createLinearGradient(0,-30,0,30);g.addColorStop(0,'#6a4a9a');g.addColorStop(.6,'#2a1840');g.addColorStop(1,'#0e0618');ctx.fillStyle=g;
      ctx.beginPath();ctx.moveTo(0,-14);ctx.quadraticCurveTo(30,-30,62,-6+Math.sin(b.t*4)*6);ctx.quadraticCurveTo(34,4,18,22);ctx.lineTo(0,34);ctx.lineTo(-18,22);ctx.quadraticCurveTo(-34,4,-62,-6+Math.sin(b.t*4)*6);ctx.quadraticCurveTo(-30,-30,0,-14);ctx.fill();
      ctx.strokeStyle=hexA(b.col,.8);ctx.lineWidth=1.5;ctx.stroke();
      ctx.globalCompositeOperation='lighter';ctx.drawImage(glow('#ff60ff'),-14,-4,10,10);ctx.drawImage(glow('#ff60ff'),4,-4,10,10);ctx.globalCompositeOperation='source-over';
      ctx.restore();ctx.globalAlpha=1;};
    for(const d of b.decoys)if(d.alive)one(d.x,d.y,false);one(b.x,b.y,true);}
},
/* 3. HIVE QUEEN: shield is powered by drones; kill the drones to expose her */
hive:{
  init(b){b.dn=5+Math.min(b.cyc,2);b.drones=[];b.down=0;b.ovT=14;b.ovl=0;this.spawn(b);},
  spawn(b){b.drones=Array.from({length:b.dn},(_,i)=>({a:i/b.dn*TAU,r:rand(95,130),hp:b.max*.015,x:b.x,y:b.y,fire:rand(1.5,3.5),dive:0,alive:true}));},
  update(b,dt,ent){for(const d of b.drones){if(!d.alive)continue;d.a+=dt*(.5+b.cyc*.1);
      let tx=b.x+Math.cos(d.a)*d.r*Z,ty=b.y+Math.sin(d.a)*d.r*Z*.8;if(d.dive>0&&player){d.dive-=dt;tx=player.x;ty=player.y;}
      d.x+=(tx-d.x)*dt*(d.dive>0?1.6:3);d.y+=(ty-d.y)*dt*(d.dive>0?1.6:3);
      if(!ent){d.fire-=dt;if(d.fire<=0){d.fire=rand(2.2,3.4);if(Math.random()<.3)d.dive=1.2;else eshot(d.x,d.y,aimAt(d.x,d.y),210,'#b8ff6a',9);}}}
    if(ent)return;bossDrift(b,dt,.4);
    if(b.ovl>0)b.ovl-=dt;b.ovT-=dt;if(b.ovT<=0){b.ovT=14;if(b.drones.some(d=>d.alive)){b.ovl=3;banner('SHIELD OVERLOAD!','Hit the Queen now','#9dff4a');}}
    const alive=b.drones.some(d=>d.alive);
    if(!alive&&b.down<=0){b.down=5;banner('SHIELD DOWN!','Hit the Queen now','#9dff4a');}
    if(b.down>0){b.down-=dt;if(b.down<=0){this.spawn(b);for(const d of b.drones){d.x=b.x;d.y=b.y;}}}
    b.fireT-=dt;if(b.fireT<=0){const angry=b.down>0||b.ovl>0;b.fireT=angry?1.1:2;const a=aimAt(b.x,b.y),n=angry?5:3;for(let i=0;i<n;i++)eshot(b.x,b.y,a+(i-(n-1)/2)*.22,angry?220:170,'#b8ff6a',12);sfx('eshoot');}},
  hit(b,bl){for(const d of b.drones){if(!d.alive)continue;if(Math.hypot(bl.x-d.x,bl.y-d.y)<22*Z){d.hp-=bl.dmg;sparks(bl.x,bl.y,'#b8ff6a',2);if(d.hp<=0){d.alive=false;explode(d.x,d.y,18*Z,'#4a7a2a',.7);sfx('boom',1);}return true;}}
    const d=Math.hypot(bl.x-b.x,bl.y-b.y),shield=hiveSh(b);
    if(shield&&d<72*Z){sparks(bl.x,bl.y,'#c8ff9a',2);return true;}
    if(!shield&&d<44*Z){bossDamage(bl.dmg,bl.x,bl.y);return true;}return false;},
  special(b){const shielded=hiveSh(b);for(const d of b.drones)if(d.alive){d.alive=false;explode(d.x,d.y,18*Z,'#4a7a2a',.7);}return!shielded;},
  body(b,x,y,r){if(Math.hypot(x-b.x,y-b.y)<44*Z+r)return true;for(const d of b.drones)if(d.alive&&Math.hypot(x-d.x,y-d.y)<12*Z+r)return true;return false;},
  draw(b){const shield=hiveSh(b);ctx.globalCompositeOperation='lighter';
    if(shield)for(const d of b.drones)if(d.alive){ctx.strokeStyle='rgba(160,255,90,.35)';ctx.lineWidth=(2+Math.sin(b.t*10+d.a)*1)*Z;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    ctx.globalCompositeOperation='source-over';
    ctx.save();ctx.translate(b.x,b.y);ctx.scale(Z,Z);
    const fl=Math.sin(b.t*30)*.25;ctx.fillStyle='rgba(200,255,220,.22)';for(const s of[-1,1]){ctx.save();ctx.scale(s,1);ctx.rotate(-.5+fl);ctx.beginPath();ctx.ellipse(30,-14,34,12,-.3,0,TAU);ctx.fill();ctx.restore();}
    let g=ctx.createRadialGradient(-8,6,2,0,18,34);g.addColorStop(0,'#c8ff6a');g.addColorStop(.5,'#3a7a1a');g.addColorStop(1,'#10240a');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,20,22,30,0,0,TAU);ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(0,10+i*10,20-i*2,4,0,0,Math.PI);ctx.stroke();}
    g=ctx.createRadialGradient(-4,-12,1,0,-8,18);g.addColorStop(0,'#8acf5a');g.addColorStop(1,'#1a3a10');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,-8,16,14,0,0,TAU);ctx.fill();
    ctx.fillStyle='#2a4a18';ctx.beginPath();ctx.ellipse(0,-26,11,9,0,0,TAU);ctx.fill();
    ctx.globalCompositeOperation='lighter';ctx.drawImage(glow('#ff3030'),-10,-32,9,9);ctx.drawImage(glow('#ff3030'),1,-32,9,9);
    ctx.strokeStyle='#5a8a2a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-5,-33);ctx.quadraticCurveTo(-14,-48,-22,-46);ctx.moveTo(5,-33);ctx.quadraticCurveTo(14,-48,22,-46);ctx.stroke();
    if(shield){const pu=.5+.5*Math.sin(b.t*4);ctx.strokeStyle=`rgba(160,255,120,${(.35+.25*pu).toFixed(2)})`;ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=6;i++){const a=i/6*TAU+b.t*.3;i?ctx.lineTo(Math.cos(a)*72,Math.sin(a)*72):ctx.moveTo(Math.cos(a)*72,Math.sin(a)*72);}ctx.stroke();ctx.drawImage(glow('#7aff5a'),-80,-80,160,160);}
    else{ctx.drawImage(glow('#ff5050'),-60,-60,120,120);}
    ctx.globalCompositeOperation='source-over';ctx.restore();
    for(const d of b.drones){if(!d.alive)continue;ctx.save();ctx.translate(d.x,d.y);ctx.rotate(b.t*4+d.a);ctx.scale(Z,Z);ctx.fillStyle='#2a4a18';ctx.beginPath();ctx.ellipse(0,0,10,7,0,0,TAU);ctx.fill();
      ctx.fillStyle='rgba(200,255,200,.4)';ctx.beginPath();ctx.ellipse(-4,-7,7,3,-.4,0,TAU);ctx.ellipse(-4,7,7,3,.4,0,TAU);ctx.fill();
      ctx.globalCompositeOperation='lighter';ctx.drawImage(glow('#b8ff6a'),-8,-8,16,16);ctx.globalCompositeOperation='source-over';ctx.restore();}}
},
/* 4. MIRROR: reflective shield always turns to face you; hit it from behind */
mirror:{
  init(b){b.face=Math.PI/2;b.turn=1.15+b.cyc*.2;b.orb=rand(0,TAU);b.ring=4;b.flk=6;b.off=0;},
  update(b,dt,ent){if(b.off<=0)b.face+=clamp(angDiff(aimAt(b.x,b.y),b.face),-b.turn*dt,b.turn*dt);if(ent)return;
    b.flk-=dt;if(b.flk<=0){b.flk=6;b.off=1.6;sfx('tick');}if(b.off>0)b.off-=dt;
    b.orb+=dt*.35;const r=Math.min(W,H)*.22;b.x+=(W/2+Math.cos(b.orb)*r-b.x)*dt*.8;b.y+=(H*.42+Math.sin(b.orb)*r*.7-b.y)*dt*.8;
    b.fireT-=dt;if(b.fireT<=0){b.fireT=1.8;const a=aimAt(b.x,b.y);for(const d of[-.14,0,.14])eshot(b.x+Math.cos(b.face)*40*Z,b.y+Math.sin(b.face)*40*Z,a+d,230,'#8ff0ff');sfx('eshoot');}
    b.ring-=dt;if(b.ring<=0){b.ring=4.5;for(let i=0;i<12;i++)eshot(b.x,b.y,i/12*TAU+b.t,140,'#d0f8ff',10);}},
  hit(b,bl){const dx=bl.x-b.x,dy=bl.y-b.y,d=Math.hypot(dx,dy);
    if(b.off<=0&&d<74*Z&&d>46*Z&&Math.abs(angDiff(Math.atan2(dy,dx),b.face))<1.1){
      if(Math.random()<.35){const a=Math.atan2(-bl.vy,-bl.vx)+rand(-.25,.25);eshot(bl.x,bl.y,a,260,'#e8ffff',9);}
      part(bl.x,bl.y,0,0,.15,14*Z,'#e8ffff','glow');return true;}
    if(d<42*Z){bossDamage(bl.dmg,bl.x,bl.y);return true;}return false;},
  body(b,x,y,r){return Math.hypot(x-b.x,y-b.y)<42*Z+r;},
  draw(b){ctx.save();ctx.translate(b.x,b.y);ctx.scale(Z,Z);
    ctx.globalCompositeOperation='lighter';ctx.drawImage(glow(b.col),-70,-70,140,140);ctx.globalCompositeOperation='source-over';
    ctx.save();ctx.rotate(b.t*.6);const g=ctx.createLinearGradient(-40,-40,40,40);g.addColorStop(0,'#ffffff');g.addColorStop(.4,'#7fd8f0');g.addColorStop(1,'#1a3a5a');ctx.fillStyle=g;
    ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;i?ctx.lineTo(Math.cos(a)*40,Math.sin(a)*40):ctx.moveTo(Math.cos(a)*40,Math.sin(a)*40);}ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*40,Math.sin(a)*40);}ctx.stroke();ctx.restore();
    ctx.globalCompositeOperation='lighter';ctx.drawImage(glow('#ff4060'),-12,-12,24,24);ctx.globalCompositeOperation='source-over';
    ctx.rotate(b.face);const sg=ctx.createLinearGradient(0,-70,0,70),sh=(b.t*.8)%1;sg.addColorStop(0,'#6a7a8a');sg.addColorStop(clamp(sh-.1,0,1),'#cfe8f5');sg.addColorStop(sh,'#ffffff');sg.addColorStop(clamp(sh+.1,0,1),'#cfe8f5');sg.addColorStop(1,'#5a6a7a');
    if(b.off>0)ctx.globalAlpha=((b.t*18)|0)%2?.12:.3;
    ctx.fillStyle=sg;arcSeg(0,0,48,72,-1.1,1.1);ctx.fill();ctx.strokeStyle='#e8ffff';ctx.lineWidth=1.5;ctx.stroke();
    ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(140,240,255,.5)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,73,-1.1,1.1);ctx.stroke();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.restore();}
},
/* 5. LEVIATHAN: armored serpent, only the head can be hurt; gets faster as it loses segments */
leviathan:{
  init(b){b.N=14+Math.min(b.cyc*2,6);b.ang=Math.PI/2;b.trail=[];b.segs=[];b.lost=0;b.gap=24;b.segFire=2.6;},
  update(b,dt,ent){const alive=Math.max(3,Math.ceil(b.hp/b.max*b.N));if(alive<b.N-b.lost){const s=b.segs[b.segs.length-1];if(s)explode(s.x,s.y,22*Z,'#2a5a4a',.9);b.lost=b.N-alive;sfx('boom',2);}
    const spd=(150+b.lost*14+b.cyc*15)*S;
    if(!ent){const ta=aimAt(b.x,b.y)+Math.sin(b.t*1.3)*.9;b.ang+=clamp(angDiff(ta,b.ang),-1.7*dt,1.7*dt);b.x+=Math.cos(b.ang)*spd*dt;b.y+=Math.sin(b.ang)*spd*dt;wrap(b,30*Z);}
    b.trail.push([b.x,b.y]);if(b.trail.length>900)b.trail.shift();
    const n=b.N-b.lost,segs=[];let acc=0,need=b.gap*Z,i=b.trail.length-1;
    while(segs.length<n&&i>0){const [x1,y1]=b.trail[i],[x0,y0]=b.trail[i-1],d=Math.hypot(x1-x0,y1-y0);if(d<100*Z)acc+=d;if(acc>=need){segs.push({x:x0,y:y0,a:Math.atan2(y1-y0,x1-x0)});acc=0;}i--;}
    b.segs=segs;if(ent)return;
    b.fireT-=dt;if(b.fireT<=0){b.fireT=1.6;const a=aimAt(b.x,b.y);for(const d of[-.15,0,.15])eshot(b.x,b.y,a+d,240,'#6affc0');sfx('eshoot');}
    b.segFire-=dt;if(b.segFire<=0){b.segFire=2.6;for(let k=0;k<4&&segs.length;k++){const s=segs[(Math.random()*segs.length)|0];for(const sd of[-1,1])eshot(s.x,s.y,s.a+sd*Math.PI/2,160,'#3affa0',9);}}},
  hit(b,bl){if(Math.hypot(bl.x-b.x,bl.y-b.y)<26*Z){bossDamage(bl.dmg,bl.x,bl.y);return true;}
    for(const s of b.segs)if(Math.hypot(bl.x-s.x,bl.y-s.y)<17*Z){sparks(bl.x,bl.y,'#c0d0c8',2);return true;}return false;},
  body(b,x,y,r){if(Math.hypot(x-b.x,y-b.y)<24*Z+r)return true;for(const s of b.segs)if(Math.hypot(x-s.x,y-s.y)<15*Z+r)return true;return false;},
  draw(b){for(let i=b.segs.length-1;i>=0;i--){const s=b.segs[i],sz=(17-i/b.segs.length*5)*Z;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.a);
      const g=ctx.createRadialGradient(-sz*.3,-sz*.4,1,0,0,sz);g.addColorStop(0,'#7adcb0');g.addColorStop(.6,'#1e5a48');g.addColorStop(1,'#08201a');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,sz*1.1,sz,0,0,TAU);ctx.fill();
      ctx.fillStyle='#0e3a2e';for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(-sz*.3,sd*sz*.8);ctx.lineTo(0,sd*sz*1.45);ctx.lineTo(sz*.3,sd*sz*.8);ctx.fill();}
      ctx.strokeStyle='rgba(150,255,210,.35)';ctx.lineWidth=1.5*Z;ctx.beginPath();ctx.arc(0,0,sz*.75,-1.2,1.2);ctx.stroke();ctx.restore();}
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.ang);ctx.scale(Z,Z);
    ctx.globalCompositeOperation='lighter';ctx.drawImage(glow(b.col),-50,-40,100,80);ctx.globalCompositeOperation='source-over';
    const jaw=.25+.2*Math.sin(b.t*6);ctx.fillStyle='#14463a';for(const sd of[-1,1]){ctx.save();ctx.rotate(sd*jaw);ctx.beginPath();ctx.moveTo(4,sd*4);ctx.lineTo(40,sd*8);ctx.lineTo(10,sd*16);ctx.fill();ctx.restore();}
    const g=ctx.createRadialGradient(-6,-8,2,0,0,26);g.addColorStop(0,'#9affd0');g.addColorStop(.5,'#2a7a60');g.addColorStop(1,'#0a2a20');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,28,22,0,0,TAU);ctx.fill();
    ctx.globalCompositeOperation='lighter';ctx.drawImage(glow('#ffe040'),8,-14,12,12);ctx.drawImage(glow('#ffe040'),8,2,12,12);ctx.globalCompositeOperation='source-over';ctx.restore();}
},
/* 6. GRAVITY TITAN: pulls you in and bends your shots during gravity storms */
titan:{
  init(b){b.storm=false;b.sT=3.5;b.spin=0;b.spT=.12;},
  update(b,dt,ent){b.spin+=dt*(b.storm?2:1);if(ent)return;bossDrift(b,dt,.25);
    b.sT-=dt;if(b.sT<=0){b.storm=!b.storm;b.sT=b.storm?3:3.5;if(b.storm){banner('GRAVITY STORM!','','#ff4a8a');sfx('hole');}}
    const p=player;if(p&&p.alive){const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)||1,f=(b.storm?300:70)*S*(1+b.cyc*.15);p.vx+=dx/d*f*dt;p.vy+=dy/d*f*dt;}
    const R=330*Z,tw=(b.storm?2200:350)*S;for(const bl of bullets){const dx=bl.x-b.x,dy=bl.y-b.y,d=Math.hypot(dx,dy)||1;if(d<R&&d>58*Z){const k=(1-d/R);bl.vx+=-dy/d*tw*k*dt;bl.vy+=dx/d*tw*k*dt;}}
    if(!b.storm){b.spT-=dt;if(b.spT<=0){b.spT=.16;for(let i=0;i<2;i++)eshot(b.x,b.y,b.spin*1.6+i*Math.PI,150,'#ff6aa0',10);}}
    else{b.fireT-=dt;if(b.fireT<=0){b.fireT=1.1;eshot(b.x,b.y,aimAt(b.x,b.y),150,'#ff9a50',18);}}},
  hit(b,bl){if(Math.hypot(bl.x-b.x,bl.y-b.y)<56*Z){bossDamage(bl.dmg,bl.x,bl.y);return true;}return false;},
  body(b,x,y,r){return Math.hypot(x-b.x,y-b.y)<54*Z+r;},
  draw(b){const x=b.x,y=b.y,R=56*Z;ctx.globalCompositeOperation='lighter';drawGlow(b.col,x,y,R*3.2,b.storm?.45:.25);
    if(b.storm)for(let i=0;i<3;i++){const r=R*(3.4-((b.t*1.2+i/3)%1)*2.4);ctx.strokeStyle=`rgba(255,120,180,${(.25*(1-r/(R*3.4))).toFixed(3)})`;ctx.lineWidth=3*Z;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}
    ctx.globalCompositeOperation='source-over';
    const ring=(back)=>{ctx.save();ctx.translate(x,y);ctx.rotate(-.35);ctx.strokeStyle=back?'rgba(255,150,200,.35)':'rgba(255,180,220,.75)';ctx.lineWidth=5*Z;ctx.beginPath();ctx.ellipse(0,0,R*1.9,R*.45,0,back?Math.PI:0,back?TAU:Math.PI);ctx.stroke();
      ctx.lineWidth=2*Z;ctx.beginPath();ctx.ellipse(0,0,R*2.25,R*.55,0,back?Math.PI:0,back?TAU:Math.PI);ctx.stroke();ctx.restore();};
    ring(true);const g=ctx.createRadialGradient(x-R*.35,y-R*.35,R*.1,x,y,R);g.addColorStop(0,'#5a2040');g.addColorStop(.6,'#22081a');g.addColorStop(1,'#050206');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.fill();
    ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,90,150,${b.storm?.9:.55})`;ctx.lineWidth=2*Z;ctx.beginPath();
    for(let i=0;i<5;i++){let a=b.spin*.2+i*1.3,r=R*.2;ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);for(let k=0;k<4;k++){a+=.35;r+=R*.18;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}}ctx.stroke();ctx.globalCompositeOperation='source-over';ring(false);}
},
};
