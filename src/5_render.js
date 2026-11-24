
/* ---------- render ---------- */
function drawSaucer(e){
  ctx.save();ctx.translate(e.x,e.y);ctx.scale(S,S);
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35;ctx.drawImage(glow('#ff4060'),-30,-14,60,40);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  let gr=ctx.createRadialGradient(-2,-14,1,0,-6,12);gr.addColorStop(0,'#e8fdff');gr.addColorStop(.4,'#4fb8d8');gr.addColorStop(1,'#0b2a3a');
  ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(0,-4,11,10,0,Math.PI,0);ctx.fill();
  gr=ctx.createLinearGradient(0,-8,0,8);gr.addColorStop(0,'#eef1f6');gr.addColorStop(.45,'#8a93a2');gr.addColorStop(1,'#20242c');
  ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(0,0,24,7.5,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.7)';ctx.lineWidth=.8;ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.ellipse(0,-1,20,4,0,Math.PI*.1,Math.PI*.9);ctx.stroke();
  ctx.globalCompositeOperation='lighter';
  for(let i=0;i<6;i++){const a=time*2+i/6*TAU,x=Math.cos(a)*19,on=Math.sin(a)>0;if(!on)continue;ctx.drawImage(glow(i%2?'#ff4040':'#ffb030'),x-4,1,8,8);}
  if(e.flash>0){ctx.globalAlpha=e.flash;ctx.drawImage(glow('#ffffff'),-26,-14,52,28);ctx.globalAlpha=1;}
  ctx.globalCompositeOperation='source-over';ctx.restore();
}
function drawHunter(e){
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.ang);ctx.scale(S,S);
  const h=[[18,0],[4,-5],[-6,-15],[-12,-15],[-7,-4],[-12,-3],[-12,0]];shipPath(ctx,h);
  const gr=ctx.createLinearGradient(0,-15,0,15);gr.addColorStop(0,'#8a3040');gr.addColorStop(.5,'#4a141e');gr.addColorStop(1,'#1a050a');
  ctx.fillStyle=gr;ctx.fill();ctx.strokeStyle='rgba(0,0,0,.8)';ctx.lineWidth=.8;ctx.stroke();
  ctx.strokeStyle='#ff3040';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(2,-3);ctx.lineTo(-9,-12);ctx.moveTo(2,3);ctx.lineTo(-9,12);ctx.stroke();
  ctx.globalCompositeOperation='lighter';ctx.drawImage(glow('#ff2030'),2,-4,8,8);ctx.drawImage(glow('#ff6040'),-17,-5,10,10);
  if(e.flash>0){ctx.globalAlpha=e.flash;ctx.drawImage(glow('#ffffff'),-20,-16,40,32);ctx.globalAlpha=1;}
  ctx.globalCompositeOperation='source-over';ctx.restore();
}
function render(){
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  if(bg)ctx.drawImage(bg,0,0,W,H);
  const F=[.02,.05,.1];
  for(const s of stars){const f=F[s.l],x=((s.x*W-driftX*f)%W+W)%W,y=((s.y*H-driftY*f)%H+H)%H,a=s.b*(.65+.35*Math.sin(time*s.tw+s.x*50));
    ctx.fillStyle=`rgba(225,235,255,${a.toFixed(2)})`;const z=(s.l*.45+.7)*s.s;ctx.fillRect(x,y,z,z);
    if(s.s>1){ctx.globalCompositeOperation='lighter';drawGlow('#9fc0ff',x+1,y+1,5,a*.5);ctx.globalCompositeOperation='source-over';}}
  ctx.save();if(shake>0)ctx.translate(rand(-1,1)*shake*.6,rand(-1,1)*shake*.6);
  for(const c of coinsArr){if(c.life<2&&((time*10)|0)%2)continue;const big=c.v>1?1.5:1,r=8*S*big;
    ctx.globalCompositeOperation='lighter';drawGlow('#ffb830',c.x,c.y,r*2.2,.45);ctx.globalCompositeOperation='source-over';
    const w=Math.max(.2,Math.abs(Math.cos(c.sp)));ctx.drawImage(coinSpr,c.x-r*w,c.y-r,r*2*w,r*2);}
  for(const a of asteroids)drawAst(a);
  for(const e of enemies)e.kind==='saucer'?drawSaucer(e):drawHunter(e);
  for(const b of bullets){if(!b.lava)continue;const f=b.life/b.max,r=b.r*S,an=Math.atan2(b.vy,b.vx);
    ctx.globalCompositeOperation='lighter';drawGlow('#ff5a10',b.x,b.y,r*3.2,.25+.35*f);ctx.globalCompositeOperation='source-over';
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(an);ctx.globalAlpha=Math.min(1,f*2.5);ctx.drawImage(b.spr,-r*1.6,-r,r*3,r*2);
    if(f<.5){ctx.globalAlpha=(.5-f)*1.4;ctx.fillStyle='#2a0c06';ctx.beginPath();ctx.ellipse(-r*.1,0,r*1.45,r*.95,0,0,TAU);ctx.fill();}
    ctx.restore();ctx.globalAlpha=1;}
  ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  for(const b of bullets){if(b.lava)continue;ctx.strokeStyle=b.col;ctx.lineWidth=3*S;ctx.beginPath();ctx.moveTo(b.x-b.vx*.025,b.y-b.vy*.025);ctx.lineTo(b.x,b.y);ctx.stroke();
    ctx.strokeStyle='#ffffff';ctx.lineWidth=1.2*S;ctx.stroke();drawGlow(b.col,b.x,b.y,9*S,.8);}
  for(const b of ebullets){drawGlow('#ff4030',b.x,b.y,11*S,.9);drawGlow('#ffffff',b.x,b.y,4*S,.9);}
  ctx.globalCompositeOperation='source-over';
  renderSpecials();
  const p=player;
  if(p&&p.alive&&(state==='play'||state==='paused')){
    const sh=SHIPS[tier];
    if(!(p.inv>0&&((time*12)|0)%3===0)){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.ang);ctx.scale(S,S);drawShip(ctx,tier,p.thr,time);ctx.restore();}
    if(p.inv>0){ctx.globalCompositeOperation='lighter';const rr=(sh.nose+8)*S;drawGlow(sh.acc,p.x,p.y,rr*1.3,.18);
      ctx.strokeStyle=hexA(sh.acc,.35+.2*Math.sin(time*10));ctx.lineWidth=1.5*S;ctx.beginPath();ctx.arc(p.x,p.y,rr,0,TAU);ctx.stroke();ctx.globalCompositeOperation='source-over';}
  }
  for(const q of parts)if(q.kind==='smoke'){const f=q.life/q.max,s=q.size*(1+(1-f)*1.3);ctx.fillStyle=hexA(q.col,(.28*f).toFixed(3));ctx.beginPath();ctx.arc(q.x,q.y,s,0,TAU);ctx.fill();}
  for(const s of streams){const n=14,dx=s.ex-s.sx,dy=s.ey-s.sy,L=Math.hypot(dx,dy)||1,px=-dy/L,py=dx/L,u1=s.t,pts=[];
    for(let i=0;i<=n;i++){const u=s.u0+(u1-s.u0)*i/n,w=Math.sin(u*Math.PI)*s.wob*Math.sin(u*7+s.ph+time*5);pts.push([s.sx+dx*u+px*w,s.sy+dy*u+py*w]);}
    const heat=s.hit?clamp(1-s.u0*1.3,0,1):1,fade=s.hit?clamp((1-s.u0)*2,0,1):1;
    ctx.lineCap='round';ctx.lineJoin='round';
    ctx.globalCompositeOperation='lighter';for(let i=0;i<=n;i+=4)drawGlow('#ff5a10',pts[i][0],pts[i][1],s.w*2.4,.35*fade);ctx.globalCompositeOperation='source-over';
    for(const [wf,c,a] of [[1,'#3a0c04',fade],[.78,'#b42808',fade],[.52,'#ff7a12',heat],[.24,'#ffe38a',heat*heat]]){if(a<=0.01)continue;ctx.globalAlpha=a;ctx.strokeStyle=c;ctx.lineWidth=s.w*wf;
      ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();}
    if(!s.hit){const h=pts[n],r=s.w*1.1;ctx.globalAlpha=1;ctx.drawImage(lavaSprs[1],h[0]-r,h[1]-r,r*2,r*2);}
    ctx.globalAlpha=1;}
  for(const q of parts)if(q.kind==='goo'){const f=q.life/q.max,sp=Math.hypot(q.vx,q.vy),st=1+Math.min(1.3,sp/(160*S)),s=q.size*(.55+.45*f),an=Math.atan2(q.vy,q.vx);
    ctx.save();ctx.translate(q.x,q.y);ctx.rotate(an);ctx.globalAlpha=Math.min(1,f*2);ctx.drawImage(lavaSprs[(q.rot*10|0)&3],-s*st,-s,s*2*st,s*2);
    if(f<.55){ctx.globalAlpha=Math.min(.85,(.55-f)*1.8);ctx.fillStyle='#2a0c06';ctx.beginPath();ctx.ellipse(0,0,s*st*.92,s*.9,0,0,TAU);ctx.fill();}ctx.restore();}
  ctx.globalAlpha=1;
  for(const q of parts)if(q.kind==='lava'){const f=q.life/q.max,s=q.size*(.6+.4*f);ctx.globalAlpha=Math.min(1,f*1.6);ctx.drawImage(lavaSprs[0],q.x-s,q.y-s,s*2,s*2);}
  ctx.globalAlpha=1;
  for(const q of parts)if(q.kind==='debris'){const f=Math.min(1,q.life/q.max*2);ctx.globalAlpha=f;ctx.fillStyle=q.col;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);
    ctx.beginPath();ctx.moveTo(q.size,0);ctx.lineTo(-q.size*.6,q.size*.7);ctx.lineTo(-q.size*.4,-q.size*.8);ctx.closePath();ctx.fill();ctx.restore();}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='lighter';
  for(const q of parts){const f=q.life/q.max;
    if(q.kind==='glow')drawGlow(q.col,q.x,q.y,q.size*(.5+.5*f),f);
    else if(q.kind==='lava')drawGlow('#ff5a10',q.x,q.y,q.size*2.2,f*.5);
    else if(q.kind==='goo')drawGlow('#ff5a10',q.x,q.y,q.size*2.6,f*.45);
    else if(q.kind==='spark'){ctx.globalAlpha=f;ctx.strokeStyle=q.col;ctx.lineWidth=q.size;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x-q.vx*.04,q.y-q.vy*.04);ctx.stroke();ctx.globalAlpha=1;}}
  ctx.lineJoin='round';
  for(const b of bolts){const f=b.life/b.max,fl=.6+.4*Math.random();
    for(const [w,c,a] of [[12,'#7a5cff',.14],[4.5,'#b8a4ff',.55],[1.6,'#ffffff',1]]){ctx.globalAlpha=a*f*fl;ctx.strokeStyle=c;ctx.lineWidth=w*S*b.w;ctx.beginPath();
      b.pts.forEach((pt,i)=>i?ctx.lineTo(pt[0],pt[1]):ctx.moveTo(pt[0],pt[1]));ctx.stroke();}}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.restore();
  if(flash>0){ctx.fillStyle=`rgba(${flashCol},${(flash*.4).toFixed(3)})`;ctx.fillRect(0,0,W,H);}
  if(hurt>0){const gr=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);gr.addColorStop(0,'rgba(255,0,40,0)');gr.addColorStop(1,`rgba(255,0,40,${(hurt*.45).toFixed(3)})`);ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);}
  if(state==='play'){
    if(joy.id!==null){ctx.fillStyle='rgba(255,255,255,.07)';ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(joy.bx,joy.by,JR,0,TAU);ctx.fill();ctx.stroke();
      const dx=joy.x-joy.bx,dy=joy.y-joy.by,d=Math.hypot(dx,dy),m=Math.min(d,JR),kx=joy.bx+(d?dx/d*m:0),ky=joy.by+(d?dy/d*m:0);
      ctx.fillStyle=hexA(SHIPS[tier].acc,.4);ctx.beginPath();ctx.arc(kx,ky,24,0,TAU);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.5)';ctx.stroke();}
    else if(hintT>0&&document.body.classList.contains('touch')){const a=Math.min(1,hintT)*.6,x=W*.25,y=H*.8;ctx.globalAlpha=a;ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.setLineDash([6,6]);
      ctx.beginPath();ctx.arc(x,y,JR,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#fff';ctx.font='600 15px Rajdhani,sans-serif';ctx.textAlign='center';ctx.fillText('DRAG ANYWHERE TO FLY',x,y-JR-12);
      ctx.beginPath();ctx.arc(x+Math.cos(time*2)*30,y+Math.sin(time*2)*30,16,0,TAU);ctx.fill();ctx.globalAlpha=1;}
  }
}

/* ---------- HUD ---------- */
const hc={};const hset=(k,el,v,prop='textContent')=>{if(hc[k]!==v){hc[k]=v;el[prop]=v;}};
function hud(){
  if(state!=='play'&&state!=='paused')return;
  const sh=SHIPS[tier],nx=SHIPS[tier+1];
  hset('s',$('score'),score.toLocaleString());hset('w',$('wave'),'WAVE '+wave);hset('c',$('coins'),String(coins));
  hset('n',$('shipname'),nx?`${sh.name} › ${nx.name} @ ${nx.cost}`:`${sh.name} · MAX`);
  const xp=nx?clamp((coins-sh.cost)/(nx.cost-sh.cost),0,1):1;if(hc.xp!==xp){hc.xp=xp;$('xpbar').firstElementChild.style.width=(xp*100)+'%';}
  const hp=player?clamp(player.hp/sh.hp,0,1):0;if(hc.hp!==hp){hc.hp=hp;$('hpbar').firstElementChild.style.width=(hp*100)+'%';$('hpbar').classList.toggle('low',hp<=.34);}
  if(hc.l!==lives){hc.l=lives;$('lives').innerHTML='<i class="life"></i>'.repeat(Math.max(0,lives));}
  const z=$('zap');if(hc.z!==charge){hc.z=charge;z.style.setProperty('--p',charge);z.classList.toggle('ready',charge>=1);}
}

/* ---------- sizing ---------- */
function resize(){
  const oW=W,oH=H;W=window.innerWidth;H=window.innerHeight;DPR=Math.min(window.devicePixelRatio||1,2);
  cvs.width=Math.round(W*DPR);cvs.height=Math.round(H*DPR);S=clamp(Math.min(W,H)/560,.68,1.3);
  if(oW&&(oW!==W||oH!==H)){const sx=W/oW,sy=H/oH;for(const L of [asteroids,enemies,coinsArr,bullets,ebullets,parts])for(const o of L){o.x*=sx;o.y*=sy;}
    if(player){player.x*=sx;player.y*=sy;}joy.id=null;}
  buildBG();
}
window.addEventListener('resize',resize);
if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);
window.addEventListener('orientationchange',()=>setTimeout(resize,250));
