
/* ---------- cutscenes ---------- */
let cut=null,cutsOn=true,CU=1,GY=0;try{cutsOn=localStorage.getItem('sb_cuts')!=='0';}catch(e){}
const easeIn=t=>t*t,easeOut=t=>1-(1-t)*(1-t),lerp=(a,b,t)=>a+(b-a)*t;
function bez(p0,p1,p2,p3,t){const u=1-t;return[u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]];}
const WIN_T=['THE SPARROW STRIKES!','THE FALCON STRIKES!','THE HAWK STRIKES!','THE RAPTOR STRIKES!','THE TEMPEST STRIKES!','VESUVIUS ERUPTS!'];
const LOSE_T=['SPARROW DOWN','FALCON DOWN','HAWK DOWN','RAPTOR EXTINCT','THE TEMPEST BREAKS','VESUVIUS HAS FALLEN'];
const BIRDS=[
 {body:'#8a5a34',belly:'#eadcc0',wing:'#6b4226',head:'#7a4a2a',beak:'#3a2a1a',span:24,tail:1,size:1.2,tailc:'#5a3820'},
 {body:'#5d6b7c',belly:'#f2ebe0',wing:'#3c4757',head:'#262c36',beak:'#e8b830',hook:1,span:40,tail:.8,size:1.4,tailc:'#3c4757'},
 {body:'#8a4a22',belly:'#f2e2c8',wing:'#5a3418',head:'#6a3a1a',beak:'#2a2a2a',hook:1,span:46,tail:1.25,size:1.55,tailc:'#c0562a'},
];
const PIGEON={body:'#8a92a0',belly:'#b8bfcc',wing:'#6f7888',head:'#5a6478',beak:'#d0a080',span:28,tail:.9,size:1.05,tailc:'#5f6878'};

function playCut(kind,onEnd){
  if(!cutsOn){onEnd&&onEnd();return;}
  cut={kind,t:0,dt:0,dur:kind==='win'?4.6:4.2,tier,onEnd,p:[],bolts:[],shake:0,flash:0,flags:{},wave,bonus:wave*100,lives,ast:makeAsteroid('rock',3,0,0,0,0)};
  fireHeld=false;joy.id=null;document.body.classList.add('cut');sfx(kind==='win'?'swoosh':'doom');
}
function endCut(){if(!cut)return;const f=cut.onEnd;cut=null;document.body.classList.remove('cut');f&&f();}
const at=(k,t)=>{if(cut.t>=t&&!cut.flags[k]){cut.flags[k]=1;return true;}return false;};
function cp(o){if(cut.p.length<600)cut.p.push(Object.assign({vx:0,vy:0,grav:0,drag:.5,rot:rand(0,TAU),vr:rand(-4,4),ph:rand(0,TAU),max:o.life},o));}
function updateCut(dt){
  cut.t+=dt;cut.dt=dt;cut.shake=Math.max(0,cut.shake-dt*30);cut.flash=Math.max(0,cut.flash-dt*2.2);
  for(const q of cut.p){q.life-=dt;q.vy+=q.grav*dt;const dr=Math.pow(q.drag,dt);q.vx*=dr;q.vy*=dr;
    if(q.kind==='feather')q.vx+=Math.sin(cut.t*3+q.ph)*60*CU*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.rot+=q.vr*dt;}
  cut.p=cut.p.filter(q=>q.life>0);
  for(const b of cut.bolts)b.life-=dt;cut.bolts=cut.bolts.filter(b=>b.life>0);
  if(cut.t>=cut.dur)endCut();
}
/* effects */
function puff(x,y,n,col,sz){for(let i=0;i<n;i++){const a=rand(0,TAU),sp=rand(20,140)*CU;cp({kind:'dust',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.6-20*CU,life:rand(.8,1.6),size:rand(.5,1)*sz,col});}}
function feathers(x,y,n,cols){for(let i=0;i<n;i++){const a=rand(0,TAU),sp=rand(40,200)*CU;cp({kind:'feather',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,grav:60*CU,drag:.3,life:rand(1.6,2.6),size:rand(4,8)*CU,col:cols[i%cols.length]});}}
function cboom(x,y,sz){cp({kind:'glow',x,y,life:.5,size:sz*2.5,col:'#ffd8a0'});cp({kind:'glow',x,y,life:.8,size:sz*1.6,col:'#ff7a2a'});
  for(let i=0;i<26;i++){const a=rand(0,TAU),sp=rand(80,380)*CU;cp({kind:'spark',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rand(.3,.7),size:2*CU,col:'#ffd27a'});}
  for(let i=0;i<14;i++){const a=rand(0,TAU),sp=rand(40,200)*CU;cp({kind:'debris',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,grav:300*CU,life:rand(1,1.8),size:rand(2,5)*CU,col:'#8a93a2'});}
  for(let i=0;i<8;i++)cp({kind:'smoke',x:x+rand(-1,1)*sz*.4,y:y+rand(-1,1)*sz*.4,vx:rand(-20,20)*CU,vy:rand(-40,-10)*CU,life:rand(1.2,2),size:sz*rand(.4,.8),col:'#3a3530'});}
function lavaBlob(x,y,vx,vy,sz){cp({kind:'lava',x,y,vx,vy,grav:420*CU,drag:.85,life:rand(1.2,2),size:sz});}
function addCutBolt(x1,y1,x2,y2,w){cut.bolts.push({pts:boltPts(x1,y1,x2,y2,6),life:.35,max:.35,w});
  const pts=cut.bolts[cut.bolts.length-1].pts;for(let k=0;k<2;k++){const i=1+(Math.random()*(pts.length-2)|0),[bx,by]=pts[i],a=Math.atan2(y2-y1,x2-x1)+rand(-1,1),L=Math.hypot(x2-x1,y2-y1)*rand(.15,.3);
    cut.bolts.push({pts:boltPts(bx,by,bx+Math.cos(a)*L,by+Math.sin(a)*L,4),life:.3,max:.3,w:w*.5});}}

/* backdrops */
function hills(col,base,amp,f,ph){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,H);for(let i=0;i<=40;i++){const x=i/40*W;ctx.lineTo(x,H*base-Math.sin(x/W*f+ph)*H*amp-Math.sin(x/W*f*2.3+ph*1.7)*H*amp*.4);}ctx.lineTo(W,H);ctx.closePath();ctx.fill();}
function skyDay(red){
  let g=ctx.createLinearGradient(0,0,0,GY);g.addColorStop(0,'#2f5f9e');g.addColorStop(.55,'#86aed6');g.addColorStop(1,'#f7c98b');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='lighter';drawGlow('#ffd890',W*.78,H*.3,90*CU,.55);ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='#fff4d8';ctx.beginPath();ctx.arc(W*.78,H*.3,16*CU,0,TAU);ctx.fill();
  hills('#7d93b4',.66,.035,5,1);hills('#5b7f58',.71,.03,7,3);
  g=ctx.createLinearGradient(0,GY-10*CU,0,H);g.addColorStop(0,'#4d7a3e');g.addColorStop(1,'#1f3a1c');ctx.fillStyle=g;ctx.fillRect(0,GY-6*CU,W,H);
  ctx.strokeStyle='#3c6a30';ctx.lineWidth=1.5*CU;ctx.beginPath();for(let i=0;i<50;i++){const x=(i*73.13)%W,h=rand(4,9)*CU;ctx.moveTo(x,GY-4*CU);ctx.lineTo(x+rand(-3,3)*CU,GY-4*CU-h);}ctx.stroke();
  if(red>0){ctx.fillStyle=`rgba(255,70,20,${(red*.38).toFixed(3)})`;ctx.fillRect(0,0,W,H);}
}
function skyStorm(){let g=ctx.createLinearGradient(0,0,0,GY);g.addColorStop(0,'#0c0f1a');g.addColorStop(1,'#323c52');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  hills('#232a3a',.68,.04,5,1);hills('#1a2030',.72,.03,7,2);ctx.fillStyle='#121820';ctx.fillRect(0,GY-6*CU,W,H);}
function skyDusk(){let g=ctx.createLinearGradient(0,0,0,GY);g.addColorStop(0,'#160a20');g.addColorStop(.5,'#4a1a34');g.addColorStop(1,'#e0703a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  hills('#3a1a30',.7,.03,6,2);ctx.fillStyle='#24120e';ctx.fillRect(0,GY-6*CU,W,H);}
function cloud(x,y,s,col,a){ctx.globalAlpha=a;ctx.fillStyle=col;ctx.beginPath();for(const [dx,dy,r] of [[0,0,1],[-1.1,.25,.75],[1.1,.2,.8],[-.5,-.45,.7],[.55,-.4,.65],[0,.35,.85]]){ctx.moveTo(x+dx*s+r*s,y+dy*s);ctx.arc(x+dx*s,y+dy*s,r*s,0,TAU);}ctx.fill();ctx.globalAlpha=1;}
function rain(n,a){ctx.strokeStyle=`rgba(170,190,230,${a})`;ctx.lineWidth=1*CU;ctx.beginPath();for(let i=0;i<n;i++){const x=((i*97.31+cut.t*W*.25)%(W*1.2))-W*.1,y=((i*53.7+cut.t*H*1.4)%H);ctx.moveTo(x,y);ctx.lineTo(x-6*CU,y+18*CU);}ctx.stroke();}

/* actors */
function wingP(flap,col,span){ctx.save();ctx.translate(-2,-3);ctx.rotate(-flap);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(4,0);ctx.quadraticCurveTo(-span*.3,-span*.95,-span*.95,-span*.55);ctx.lineTo(-span*.55,-span*.2);ctx.lineTo(-12,3);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=.8;ctx.beginPath();for(let i=1;i<4;i++){ctx.moveTo(-span*.25*i,-span*.18*i);ctx.lineTo(-span*.25*i-4,-span*.18*i+5);}ctx.stroke();ctx.restore();}
function drawBird(x,y,s,ang,flap,c,dead,flip){
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(s,flip?-s:s);
  ctx.fillStyle=c.tailc;ctx.beginPath();ctx.moveTo(-12,-1);ctx.lineTo(-30,-6*c.tail);ctx.lineTo(-31,0);ctx.lineTo(-30,6*c.tail);ctx.closePath();ctx.fill();
  wingP(flap+.35,shade(c.wing,-30),c.span);
  const g=ctx.createLinearGradient(0,-9,0,9);g.addColorStop(0,shade(c.body,30));g.addColorStop(1,shade(c.body,-30));ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,18,9,0,0,TAU);ctx.fill();
  ctx.fillStyle=c.belly;ctx.beginPath();ctx.ellipse(3,3.5,12,4.5,0,0,TAU);ctx.fill();
  ctx.fillStyle=c.head;ctx.beginPath();ctx.arc(15,-4,7.5,0,TAU);ctx.fill();
  ctx.fillStyle=c.beak;ctx.beginPath();ctx.moveTo(21,-7);if(c.hook){ctx.quadraticCurveTo(29,-7,28,-1);ctx.lineTo(22,-2);}else{ctx.lineTo(29,-4);ctx.lineTo(21,-1.5);}ctx.closePath();ctx.fill();
  if(dead){ctx.strokeStyle='#111';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(15,-8);ctx.lineTo(19,-4);ctx.moveTo(19,-8);ctx.lineTo(15,-4);ctx.stroke();}
  else{ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(17,-6,2.4,0,TAU);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(17.6,-6,1.4,0,TAU);ctx.fill();}
  ctx.strokeStyle='#c8a040';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(2,13);ctx.moveTo(4,8);ctx.lineTo(6,13);ctx.stroke();
  wingP(flap,c.wing,c.span);ctx.restore();
}
function drawBug(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.strokeStyle='#1a1a10';ctx.lineWidth=1;ctx.beginPath();for(let i=-1;i<=1;i++){ctx.moveTo(i*3,0);ctx.lineTo(i*4-1,4+Math.sin(cut.t*20+i));}ctx.stroke();
  const g=ctx.createRadialGradient(-1,-3,0,0,-1,7);g.addColorStop(0,'#8af08a');g.addColorStop(1,'#1d5a2a');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,-1,6.5,4.2,0,0,TAU);ctx.fill();
  ctx.fillStyle='#152015';ctx.beginPath();ctx.arc(6.5,-1,2.4,0,TAU);ctx.fill();ctx.strokeStyle='#0d2a10';ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(0,3);ctx.moveTo(8,-2);ctx.lineTo(11,-5);ctx.stroke();ctx.restore();}
function drawMouse(x,y,s,rot){ctx.save();ctx.translate(x,y);ctx.rotate(rot||0);ctx.scale(s,s);ctx.strokeStyle='#c8a0a0';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-8,-1);ctx.quadraticCurveTo(-16,-3+Math.sin(cut.t*6)*2,-21,1);ctx.stroke();
  ctx.fillStyle='#9a8a80';ctx.beginPath();ctx.ellipse(0,-3,9,5.5,0,0,TAU);ctx.fill();ctx.beginPath();ctx.ellipse(8,-5,4.5,3.5,.3,0,TAU);ctx.fill();
  ctx.fillStyle='#e0b0b0';ctx.beginPath();ctx.arc(6,-9,2.7,0,TAU);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(10,-6,1,0,TAU);ctx.fill();ctx.fillStyle='#e8a0a0';ctx.beginPath();ctx.arc(12.6,-4.4,.9,0,TAU);ctx.fill();ctx.restore();}
function drawDino(x,y,s,o){
  ctx.save();ctx.translate(x,y);ctx.rotate(o.ang||0);ctx.scale(s,s);
  const col=o.col||'#7a6a3a',dk=shade(col,-45),lt=shade(col,40);
  const leg=(ph,back)=>{const a=Math.sin(ph)*.7;ctx.save();ctx.translate(2,5);ctx.rotate(a);ctx.strokeStyle=back?dk:col;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(5,13);ctx.stroke();ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(5,13);ctx.lineTo(-1,23);ctx.lineTo(7,24);ctx.stroke();
    ctx.strokeStyle='#e8e0d0';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(1,22);ctx.quadraticCurveTo(0,17,3,16);ctx.stroke();ctx.restore();};
  leg((o.run||0)+Math.PI,1);
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-14,-6);ctx.quadraticCurveTo(-35,-12+Math.sin((o.run||0)*.5)*3,-60,-15);ctx.lineTo(-57,-11);ctx.quadraticCurveTo(-33,-1,-14,6);ctx.closePath();ctx.fill();
  const g=ctx.createLinearGradient(0,-11,0,11);g.addColorStop(0,lt);g.addColorStop(.5,col);g.addColorStop(1,dk);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,20,11,-.1,0,TAU);ctx.fill();
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(11,-7);ctx.lineTo(21,-17);ctx.lineTo(28,-12);ctx.lineTo(15,3);ctx.closePath();ctx.fill();
  ctx.save();ctx.translate(23,-13);ctx.rotate(o.jaw||0);ctx.fillStyle=dk;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(19,-1);ctx.lineTo(17,3);ctx.lineTo(0,4);ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(5+i*3.5,-.5);ctx.lineTo(6.5+i*3.5,-3);ctx.lineTo(8+i*3.5,-.5);ctx.fill();}ctx.restore();
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(19,-18);ctx.quadraticCurveTo(28,-27,43,-19);ctx.lineTo(43,-15);ctx.lineTo(22,-12);ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(28+i*3.5,-15);ctx.lineTo(29.5+i*3.5,-12);ctx.lineTo(31+i*3.5,-15);ctx.fill();}
  if(o.dead){ctx.strokeStyle='#111';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(29,-22);ctx.lineTo(33,-18);ctx.moveTo(33,-22);ctx.lineTo(29,-18);ctx.stroke();}
  else{ctx.fillStyle='#ffd23a';ctx.beginPath();ctx.arc(31,-20,2.3,0,TAU);ctx.fill();ctx.fillStyle='#111';ctx.fillRect(30.6,-22,1,4);}
  ctx.strokeStyle=dk;ctx.lineWidth=2;ctx.beginPath();for(let i=-2;i<=2;i++){ctx.moveTo(i*5-2,-10);ctx.lineTo(i*5+1,-4);}ctx.stroke();
  ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(18,7);ctx.lineTo(22,6);ctx.stroke();
  leg(o.run||0,0);ctx.restore();
}
function drawSaucerAt(x,y,k){ctx.save();ctx.translate(x,y);ctx.scale(k/S,k/S);drawSaucer({x:0,y:0,flash:0});ctx.restore();}
function drawMeteor(x,y,r,vx,vy){const L=Math.hypot(vx,vy)||1,dx=vx/L,dy=vy/L;ctx.globalCompositeOperation='lighter';
  for(let i=9;i>=0;i--){const k=i/9;drawGlow(i<3?'#ffd080':'#ff6a20',x-dx*r*k*5,y-dy*r*k*5,r*(1.7-k*1),.55*(1-k)+.12);}ctx.globalCompositeOperation='source-over';
  const a=cut.ast,sz=a.spr.width*r/a.P;ctx.save();ctx.translate(x,y);ctx.rotate(cut.t*2);ctx.drawImage(a.spr,-sz/2,-sz/2,sz,sz);ctx.restore();}
function drawBolts(){ctx.globalCompositeOperation='lighter';ctx.lineJoin='round';
  for(const b of cut.bolts){const f=b.life/b.max,fl=.6+.4*Math.random();for(const [w,c,a] of [[14,'#7a5cff',.16],[5,'#b8a4ff',.6],[2,'#ffffff',1]]){ctx.globalAlpha=a*f*fl;ctx.strokeStyle=c;ctx.lineWidth=w*CU*b.w;ctx.beginPath();b.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
function lavaStroke(pts,w,heat){ctx.lineCap='round';ctx.lineJoin='round';
  for(const [wf,c,a] of [[1,'#2a0a04',1],[.75,'#b42808',1],[.5,'#ff7a12',heat],[.22,'#ffe38a',heat*heat]]){if(a<=.01)continue;ctx.globalAlpha=a;ctx.strokeStyle=c;ctx.lineWidth=w*wf;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}ctx.globalAlpha=1;}

/* ----- scenes ----- */
function birdWin(t){
  const c=BIRDS[cut.tier],s=CU*c.size,tc=1.9;skyDay(0);
  const preyAt=tt=>cut.tier===1?[lerp(W*1.05,W*.32,Math.min(1,tt/3)),H*.45+Math.sin(tt*6)*5*CU]:[W*.64,GY-(cut.tier===0?4:2)*CU];
  const C=preyAt(tc);
  const drawPrey=(x,y,carried)=>{if(cut.tier===0)drawBug(x,y,CU*1.6);else if(cut.tier===1)drawBird(x,y,CU*1.05,carried?.6:0,carried?.2:Math.sin(t*14)*.8,PIGEON,carried,true);else drawMouse(x,y,CU*1.5,carried?.8:0);};
  let pos,ang,flap;
  if(t<tc){const u=Math.min(1,t/tc),k=easeIn(u)*.65+u*.35;pos=bez([-.15*W,.1*H],[.25*W,0],[C[0]-.3*W,C[1]-.06*H],[C[0],C[1]-8*s],k);
    const p2=bez([-.15*W,.1*H],[.25*W,0],[C[0]-.3*W,C[1]-.06*H],[C[0],C[1]-8*s],Math.min(1,k+.02));ang=Math.atan2(p2[1]-pos[1],p2[0]-pos[0]);
    flap=u<.45?Math.sin(t*14)*.8:-.35;const pp=preyAt(t);drawPrey(pp[0],pp[1],false);
    if(u>.45){ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=1.5*CU;ctx.beginPath();for(let i=0;i<4;i++){const o=(i-1.5)*8*CU;ctx.moveTo(pos[0]-Math.cos(ang)*30*s-Math.sin(ang)*o,pos[1]-Math.sin(ang)*30*s+Math.cos(ang)*o);ctx.lineTo(pos[0]-Math.cos(ang)*(60+i*8)*s-Math.sin(ang)*o,pos[1]-Math.sin(ang)*(60+i*8)*s+Math.cos(ang)*o);}ctx.stroke();}
  }else{
    if(at('catch',tc)){puff(C[0],C[1],10,'#d8c8a8',14*CU);if(cut.tier===1)feathers(C[0],C[1],10,['#c0c6d2','#8a92a0']);cut.shake=8;sfx('boom',1);}
    const u=Math.min(1,(t-tc)/1.6),k=easeIn(u)*.6+u*.4,P=[[C[0],C[1]-8*s],[C[0]+.25*W,C[1]+.02*H],[.85*W,.35*H],[1.25*W,-.05*H]];
    pos=bez(...P,k);const p2=bez(...P,Math.min(1,k+.02));ang=Math.atan2(p2[1]-pos[1],p2[0]-pos[0]);flap=Math.sin(t*16)*.9;
    drawPrey(pos[0]+Math.cos(ang+1.4)*12*s,pos[1]+Math.sin(ang+1.4)*12*s,true);
  }
  drawBird(pos[0],pos[1],s,ang,flap,c,false);
}
function birdLose(t){
  const c=BIRDS[cut.tier],s=CU*c.size,ti=1.6,bp=tt=>[lerp(-.15*W,.5*W,Math.min(1,tt/ti)),H*.42+Math.sin(tt*3)*8*CU];
  const I=bp(ti),A0=[1.25*W,-.25*H],red=t<ti?clamp((t-.3)/1.2,0,1):clamp(1-(t-ti)/1.2,0,1);skyDay(red);
  if(t<ti){const p=bp(t);drawBird(p[0],p[1],s,Math.sin(t*3)*.08,Math.sin(t*12)*.85,c,false);
    if(t>.3){const u=easeIn((t-.3)/(ti-.3)),x=lerp(A0[0],I[0],u),y=lerp(A0[1],I[1],u);drawMeteor(x,y,26*CU,I[0]-A0[0],I[1]-A0[1]);}}
  else{
    if(at('hit',ti)){cut.flash=.9;cut.shake=16;feathers(I[0],I[1],26,[c.body,c.wing,c.belly]);cboom(I[0],I[1],40*CU);sfx('boom',3);}
    const dt2=t-ti,x=I[0]+dt2*60*CU,y=I[1]+.5*H*1.3*dt2*dt2;drawBird(x,y,s,dt2*7,0,c,true);
    const u=dt2/.6;if(u<1)drawMeteor(lerp(I[0],I[0]-(A0[0]-I[0])*.6,u),lerp(I[1],I[1]-(A0[1]-I[1])*.6,u),26*CU,I[0]-A0[0],I[1]-A0[1]);
  }
}
function dinoWin(t){
  skyDay(0);const s=CU*1.7,fy=GY-26*s,px=W*.7;
  if(t<2.15){drawDino(px,GY-10*CU,CU*.6,{col:'#5aa040',jaw:Math.max(0,Math.sin(t*10))*.3,run:0});}
  else if(at('pounce',2.15)){puff(px,GY-6*CU,16,'#b8a080',22*CU);cut.shake=14;sfx('boom',2);cp({kind:'glow',x:px,y:GY-10*CU,life:.3,size:60*CU,col:'#fff0c0'});}
  let x,y,o={run:0,jaw:0,ang:0};
  if(t<1.1){x=lerp(-.25*W,.18*W,t/1.1);y=fy;o.run=t*12;}
  else if(t<1.5){x=.18*W;y=fy+3*CU;o.ang=.08;}
  else if(t<2.15){const u=(t-1.5)/.65;x=lerp(.18*W,px-16*s,u);y=fy-Math.sin(u*Math.PI)*H*.2;o.ang=lerp(-.35,.25,u);o.run=1.2;}
  else{x=px-16*s;y=fy;if(t>2.5){o.jaw=.5+Math.sin(t*30)*.05;o.ang=-.15;if(at('roar',2.5))sfx('roar');
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=2*CU;for(let i=0;i<3;i++){const r=((t*60+i*25)%75)*CU+10*CU;ctx.beginPath();ctx.arc(x+44*s,y-20*s,r,-.6,.6);ctx.stroke();}}}
  drawDino(x,y,s,o);
}
function dinoLose(t){
  const ti=1.7,red=t<ti?clamp((t-.2)/1.4,0,1):clamp(1-(t-ti-.4)/1.5,0,1);skyDay(red);
  const s=CU*1.7,fy=GY-26*s,dx=W*.32,I=[W*.74,GY-6*CU],A0=[1.1*W,-.3*H];
  if(t<ti){const u=easeIn(clamp((t-.2)/(ti-.2),0,1));drawDino(dx,fy,s,{jaw:t>.8?.35:Math.max(0,Math.sin(t*4))*.1,ang:t>.8?-.12:0});
    if(t>.2)drawMeteor(lerp(A0[0],I[0],u),lerp(A0[1],I[1],u),34*CU,I[0]-A0[0],I[1]-A0[1]);}
  else{if(at('hit',ti)){cut.flash=1;cut.shake=26;cboom(I[0],I[1],90*CU);puff(I[0],I[1],40,'#9a8a70',40*CU);sfx('boom',3);sfx('die');}
    const u=clamp((t-ti)/.7,0,1);drawDino(dx-easeOut(u)*50*CU,lerp(fy,GY-13*s,u)-Math.sin(u*Math.PI)*45*CU,s,{ang:-easeOut(u)*Math.PI,dead:true});
    const r=(t-ti)*W*.9;ctx.strokeStyle=`rgba(255,220,180,${clamp(.6-(t-ti)*.5,0,1)})`;ctx.lineWidth=4*CU;ctx.beginPath();ctx.ellipse(I[0],I[1],r,r*.25,0,0,TAU);ctx.stroke();
    ctx.globalCompositeOperation='lighter';drawGlow('#ff6a20',I[0],I[1],60*CU,clamp(1-(t-ti)/2,0,1));ctx.globalCompositeOperation='source-over';}
}
const CLOUDS=[[.1,.14,1],[.3,.1,1.2],[.52,.15,1.1],[.74,.1,1.25],[.92,.16,1],[.2,.22,.8],[.66,.23,.9]];
function stormClouds(t,spread,alpha,y0){for(const [cx,cy,sc] of CLOUDS){const ox=(cx-.5)*spread*W,x=cx*W+ox+Math.sin(t*.7+cx*9)*6*CU,y=lerp(y0,cy*H,1)+Math.cos(t+cx*5)*3*CU;
  cloud(x,y,42*CU*sc*(1+spread*.6),'#3a4152',alpha);cloud(x+6*CU,y-6*CU,34*CU*sc*(1+spread*.6),'#4e5668',alpha*.9);}}
function stormWin(t){
  skyStorm();const sx=W*.5,sy=H*.5+Math.sin(t*2)*6*CU,cy=lerp(-.25*H,0,easeOut(Math.min(1,t/.9)));
  ctx.save();ctx.translate(0,cy);stormClouds(t,0,1,0);ctx.restore();rain(90,.35);
  if(at('f1',1.0)){addCutBolt(W*.2,H*.15,W*.38,H*.18,.6);cut.flash=.3;}
  if(at('f2',1.25)){addCutBolt(W*.7,H*.14,W*.84,H*.2,.6);cut.flash=.3;sfx('tick');}
  if(at('strike',1.7)){addCutBolt(W*.48,H*.17,sx,sy,1.3);addCutBolt(W*.48,H*.17,sx,sy,1);cut.flash=1;cut.shake=12;sfx('zap');}
  if(at('boom',1.85)){cboom(sx,sy,60*CU);sfx('boom',3);cut.shake=18;}
  if(at('ground',2.5)){addCutBolt(W*.75,H*.18,W*.8,GY,1);cut.flash=.6;sfx('zap');}
  if(t<1.85)drawSaucerAt(sx,sy,1.7*CU);
  drawBolts();
}
function stormLose(t){
  const ti=1.5,k=t<ti?0:clamp((t-ti)/1.8,0,1);
  skyStorm();if(k>0){ctx.globalAlpha=k;skyDay(0);ctx.globalAlpha=1;}
  if(k>.2){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(k-.2)*.35;ctx.fillStyle='#fff2c0';for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(W*.78,H*.3);ctx.lineTo(W*(.1+i*.2),H);ctx.lineTo(W*(.16+i*.2),H);ctx.closePath();ctx.fill();}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
  stormClouds(t,easeOut(k)*1.4,1-k,0);if(t<ti+.3)rain(90,.35*(1-clamp((t-ti)/.3,0,1)));
  if(at('fl',.6)){addCutBolt(W*.3,H*.15,W*.5,H*.2,.6);cut.flash=.25;}
  const I=[W*.5,H*.18],A0=[-.2*W,-.4*H];
  if(t>.3&&t<ti){const u=easeIn((t-.3)/(ti-.3));drawMeteor(lerp(A0[0],I[0],u),lerp(A0[1],I[1],u),40*CU,I[0]-A0[0],I[1]-A0[1]);}
  if(at('hit',ti)){cut.flash=1;cut.shake=22;cboom(I[0],I[1],80*CU);for(let i=0;i<30;i++){const a=rand(0,TAU),sp=rand(120,400)*CU;cp({kind:'dust',x:I[0],y:I[1],vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rand(1,1.8),size:rand(20,40)*CU,col:'#5a6274',drag:.35});}sfx('boom',3);sfx('die');}
  drawBolts();
}
function volcPath(cx,h){const peak=GY-h*H*.42,cw=W*.05,bw=Math.min(W*.42,H*.55);ctx.beginPath();ctx.moveTo(cx-bw,GY);ctx.quadraticCurveTo(cx-bw*.35,GY-h*H*.12,cx-cw,peak);
  ctx.lineTo(cx-cw*.4,peak+4*CU);ctx.lineTo(cx+cw*.4,peak+4*CU);ctx.lineTo(cx+cw,peak);ctx.quadraticCurveTo(cx+bw*.35,GY-h*H*.12,cx+bw,GY);ctx.closePath();return{peak,bw,cw};}
function drawVolcano(cx,h,glowA,flowL,heat,cracks){
  const v=volcPath(cx,h),g=ctx.createLinearGradient(0,v.peak,0,GY);g.addColorStop(0,'#5a3a2e');g.addColorStop(1,'#1c100c');ctx.fillStyle=g;ctx.fill();
  ctx.save();volcPath(cx,h);ctx.clip();const sg=ctx.createLinearGradient(cx-v.bw,0,cx+v.bw,0);sg.addColorStop(0,'rgba(0,0,0,.45)');sg.addColorStop(.5,'rgba(0,0,0,0)');sg.addColorStop(1,'rgba(255,170,110,.1)');ctx.fillStyle=sg;ctx.fillRect(cx-v.bw,v.peak,v.bw*2,GY-v.peak);
  if(cracks>0){ctx.strokeStyle=`rgba(10,4,2,${cracks})`;ctx.lineWidth=2.5*CU;ctx.beginPath();for(let i=0;i<5;i++){let x=cx+(i-2)*v.cw*1.4,y=v.peak+8*CU;ctx.moveTo(x,y);for(let k=0;k<6;k++){x+=((i*37+k*13)%11-5)*CU*2;y+=(GY-v.peak)/8;ctx.lineTo(x,y);}}ctx.stroke();}
  if(flowL>0)for(const side of[-1,1]){const P=[[cx+side*v.cw*.5,v.peak+3*CU],[cx+side*v.bw*.3,GY-h*H*.15],[cx+side*v.bw*.62,GY-2*CU]],pts=[];
    for(let i=0;i<=20*flowL;i++){const u=i/20,a=(1-u)*(1-u),b=2*(1-u)*u,c=u*u;pts.push([a*P[0][0]+b*P[1][0]+c*P[2][0]+Math.sin(u*14+side)*4*CU,a*P[0][1]+b*P[1][1]+c*P[2][1]]);}
    if(pts.length>1)lavaStroke(pts,9*CU,heat);}
  ctx.restore();
  if(glowA>0){ctx.globalCompositeOperation='lighter';drawGlow('#ff6a10',cx,v.peak,60*CU,glowA*.8);drawGlow('#ffd060',cx,v.peak,22*CU,glowA);ctx.globalCompositeOperation='source-over';}
  return v;
}
function volcWin(t){
  skyDusk();const cx=W*.6,te=1.4;
  if(t>.5&&t<te)cut.shake=Math.max(cut.shake,3);
  const v=drawVolcano(cx,1,t<te?.35+.2*Math.sin(t*8):1,t<te?0:clamp((t-te)/1.4,0,1),1,0),top=[cx,v.peak];
  if(t>.5&&Math.random()<cut.dt*8)cp({kind:'smoke',x:cx+rand(-8,8)*CU,y:v.peak,vx:rand(-10,10)*CU,vy:rand(-60,-30)*CU,life:rand(1.8,2.6),size:rand(14,24)*CU,col:'#2e2624',drag:.8});
  if(at('erupt',te)){cut.flash=.8;cut.shake=18;sfx('erupt');cp({kind:'glow',x:cx,y:v.peak,life:.7,size:160*CU,col:'#ff6a10'});}
  if(t>te&&t<te+1.3)for(let i=0;i<3;i++)lavaBlob(cx+rand(-6,6)*CU,v.peak,rand(-140,140)*CU,rand(-520,-300)*CU,rand(4,9)*CU);
  const sx=lerp(-.15*W,.24*W,clamp(t/1.6,0,1)),sy=H*.28+Math.sin(t*2)*5*CU,tb=1.65,th=2.25;
  if(t<th)drawSaucerAt(sx,sy,1.5*CU);
  if(t>tb&&t<th){const u=(t-tb)/(th-tb),SX=.24*W,SY=H*.28,x=lerp(top[0],SX,u),y=lerp(top[1],SY,u)-Math.sin(u*Math.PI)*H*.18,r=12*CU;
    ctx.globalCompositeOperation='lighter';drawGlow('#ff5a10',x,y,r*3,.7);ctx.globalCompositeOperation='source-over';ctx.drawImage(lavaSprs[2],x-r,y-r,r*2,r*2);
    if(Math.random()<.6)lavaBlob(x,y,rand(-30,30)*CU,rand(-30,30)*CU,rand(2,4)*CU);}
  if(at('kill',th)){cboom(.24*W,H*.28,60*CU);for(let i=0;i<14;i++)lavaBlob(.24*W,H*.28,rand(-200,200)*CU,rand(-260,40)*CU,rand(3,7)*CU);sfx('boom',3);cut.shake=16;}
}
function volcLose(t){
  skyDusk();const cx=W*.6,ti=1.5,u=clamp((t-ti)/.9,0,1),h=1-easeOut(u)*.45,heat=t<ti?.6:clamp(.6-(t-ti)*.5,0,1);
  const red=t<ti?clamp((t-.2)/1.2,0,1)*.6:0;
  const v=drawVolcano(cx,h,t<ti?.4+.15*Math.sin(t*6):clamp(.5-(t-ti)*.4,0,1),.75,heat,u);
  if(red>0){ctx.fillStyle=`rgba(255,70,20,${(red*.3).toFixed(3)})`;ctx.fillRect(0,0,W,H);}
  if(t<ti&&Math.random()<cut.dt*5)cp({kind:'smoke',x:cx,y:v.peak,vx:rand(-8,8)*CU,vy:rand(-40,-20)*CU,life:2,size:rand(10,18)*CU,col:'#2e2624',drag:.8});
  const I=[cx,GY-H*.42],A0=[-.25*W,-.35*H];
  if(t>.2&&t<ti){const k=easeIn((t-.2)/(ti-.2));drawMeteor(lerp(A0[0],I[0],k),lerp(A0[1],I[1],k),46*CU,I[0]-A0[0],I[1]-A0[1]);}
  if(at('hit',ti)){cut.flash=1;cut.shake=28;cboom(I[0],I[1],110*CU);sfx('boom',3);sfx('die');
    for(let i=0;i<24;i++){const a=rand(-Math.PI,0),sp=rand(120,420)*CU;cp({kind:'debris',x:I[0],y:I[1],vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,grav:500*CU,life:rand(1.2,2),size:rand(4,10)*CU,col:'#4a3028'});}
    for(let i=0;i<30;i++)cp({kind:'smoke',x:I[0]+rand(-60,60)*CU,y:I[1]+rand(-20,60)*CU,vx:rand(-60,60)*CU,vy:rand(-50,10)*CU,life:rand(1.8,2.6),size:rand(24,44)*CU,col:'#3a302c',drag:.6});}
}

/* particles + frame */
function drawCutParts(){
  for(const q of cut.p){const f=q.life/q.max;
    if(q.kind==='dust'||q.kind==='smoke'){ctx.fillStyle=hexA(q.col,((q.kind==='dust'?.5:.6)*Math.min(1,f*1.5)).toFixed(3));ctx.beginPath();ctx.arc(q.x,q.y,q.size*(1+(1-f)*(q.kind==='smoke'?1.4:.8)),0,TAU);ctx.fill();}
    else if(q.kind==='feather'){ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot*.3+Math.sin(cut.t*4+q.ph)*.7);ctx.globalAlpha=Math.min(1,f*2);ctx.fillStyle=q.col;ctx.beginPath();ctx.ellipse(0,0,q.size,q.size*.32,0,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=.6*CU;ctx.beginPath();ctx.moveTo(-q.size*1.2,0);ctx.lineTo(q.size,0);ctx.stroke();ctx.restore();ctx.globalAlpha=1;}
    else if(q.kind==='debris'){ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);ctx.globalAlpha=Math.min(1,f*2);ctx.fillStyle=q.col;ctx.beginPath();ctx.moveTo(q.size,0);ctx.lineTo(-q.size*.6,q.size*.7);ctx.lineTo(-q.size*.4,-q.size*.8);ctx.closePath();ctx.fill();ctx.restore();ctx.globalAlpha=1;}
    else if(q.kind==='lava'){const s=q.size*(.6+.4*f);ctx.globalCompositeOperation='lighter';drawGlow('#ff5a10',q.x,q.y,s*2.6,f*.5);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.min(1,f*2);ctx.drawImage(lavaSprs[(q.ph*10|0)&3],q.x-s,q.y-s,s*2,s*2);
      if(f<.45){ctx.globalAlpha=(.45-f)*1.8;ctx.fillStyle='#2a0c06';ctx.beginPath();ctx.arc(q.x,q.y,s*.9,0,TAU);ctx.fill();}ctx.globalAlpha=1;}}
  ctx.globalCompositeOperation='lighter';
  for(const q of cut.p){const f=q.life/q.max;
    if(q.kind==='glow')drawGlow(q.col,q.x,q.y,q.size*(.5+.5*f),f);
    else if(q.kind==='spark'){ctx.globalAlpha=f;ctx.strokeStyle=q.col;ctx.lineWidth=q.size;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x-q.vx*.04,q.y-q.vy*.04);ctx.stroke();ctx.globalAlpha=1;}}
  ctx.globalCompositeOperation='source-over';
}
function cutTitle(txt,sub,t0,col){
  if(cut.t<t0)return;const a=Math.min(1,(cut.t-t0)/.3),fs=Math.min(W*.085,46);
  ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';ctx.font=`900 ${fs}px Orbitron, sans-serif`;
  const w=ctx.measureText(txt).width,fit=Math.min(1,W*.9/w),sc=(1+.35*(1-easeOut(a)))*fit;
  ctx.translate(W/2,H*.11+fs+10);ctx.scale(sc,sc);ctx.shadowColor=col;ctx.shadowBlur=22;ctx.fillStyle='#fff';ctx.fillText(txt,0,0);ctx.shadowBlur=0;
  if(sub){ctx.font=`700 ${Math.min(W*.05,20)}px Rajdhani, sans-serif`;ctx.fillStyle='#e8eeff';ctx.fillText(sub,0,fs*.85);}ctx.restore();
}
function renderCut(){
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  CU=Math.min(W,H)/400;GY=H*.78;const T=cut.tier,win=cut.kind==='win',t=cut.t;
  ctx.save();if(cut.shake>0)ctx.translate(rand(-1,1)*cut.shake*CU,rand(-1,1)*cut.shake*CU);
  if(T<=2)win?birdWin(t):birdLose(t);else if(T===3)win?dinoWin(t):dinoLose(t);else if(T===4)win?stormWin(t):stormLose(t);else win?volcWin(t):volcLose(t);
  drawCutParts();ctx.restore();
  if(cut.flash>0){ctx.fillStyle=`rgba(255,250,235,${(cut.flash*.7).toFixed(3)})`;ctx.fillRect(0,0,W,H);}
  const col=SHIPS[T].acc;
  if(win){cutTitle(WIN_T[T],`WAVE ${cut.wave} CLEARED · +${cut.bonus}`,2.4,col);if(at('fan',2.4))sfx('up');}
  else cutTitle(LOSE_T[T],cut.lives>0?`${cut.lives} ${cut.lives===1?'ship':'ships'} left`:'GAME OVER',2.3,'#ff4060');
  const bh=H*.09*clamp(Math.min(t/.4,(cut.dur-t)/.4),0,1);ctx.fillStyle='#000';ctx.fillRect(0,0,W,bh);ctx.fillRect(0,H-bh,W,bh);
  if(t>.5){ctx.globalAlpha=.55;ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font=`600 ${Math.max(11,Math.min(W*.035,14))}px Rajdhani, sans-serif`;ctx.fillText('TAP TO SKIP',W/2,H-bh*.4);ctx.globalAlpha=1;}
  const fade=Math.max(0,1-t/.35,1-(cut.dur-t)/.35);if(fade>0){ctx.fillStyle=`rgba(0,0,0,${fade.toFixed(3)})`;ctx.fillRect(0,0,W,H);}
}
/* === STARBREAKER CINEMATIC ADDON: BEGIN === */
/* Starbreaker cinematic cutscene enhancement, v1.0
 * Appended to src/5b_cutscene.js by install_cutscenes.py.
 * Original procedural scenes, input, titles and localStorage are retained.
 */
(() => {
  const SB_NAMES = ['sparrow', 'falcon', 'hawk', 'raptor', 'tempest', 'vesuvius'];
  const SB_MEDIA = Object.create(null);
  const SB_END_DUR = { win: 4.6, lose: 4.2 };
  // Most clips were cut from a montage and padded with blurred side bars: crop them off.
  const SB_CROP = { sparrow_win: 0, falcon_win: 0 };
  const sbCropFor = n => (n in SB_CROP ? SB_CROP[n] : .155);
  const SB_BASE_PLAY = playCut;
  const SB_BASE_RENDER = renderCut;
  const SB_BASE_END = endCut;

  for (const ship of SB_NAMES) for (const kind of ['win', 'lose']) {
    const name = ship + '_' + kind;
    const media = { video: null, ready: false, missing: false, image: null, imageReady: false };
    SB_MEDIA[name] = media;
    // Browsers preload video at their discretion, especially on mobile.
    try {
      const video = document.createElement('video');
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.preload = 'auto';
      video.loop = false;
      video.addEventListener('canplaythrough', () => { media.ready = true; });
      video.addEventListener('error', () => { media.missing = true; media.ready = false; });
      video.src = 'assets/cutscenes/' + name + '.mp4';
      media.video = video;
      video.load();
    } catch (e) { media.missing = true; }
    // Independent still fallback, more attractive than a blank frame if autoplay
    // fails; the original procedural cutscene remains a final fallback.
    try {
      const image = new Image();
      image.onload = () => { media.imageReady = true; };
      image.onerror = () => { media.imageReady = false; };
      image.src = 'assets/cutscenes/' + name + '.webp';
      media.image = image;
    } catch (e) { /* procedural fallback */ }
  }

  playCut = function(kind, onEnd) {
    SB_BASE_PLAY(kind, onEnd);
    if (!cut || kind !== cut.kind || !cutsOn) return;
    const media = SB_MEDIA[SB_NAMES[cut.tier] + '_' + kind];
    if (!media) return;
    // Preserve the original timer unless the actual movie starts successfully.
    cut.sbCinematic = media;
    cut.sbName = SB_NAMES[cut.tier] + '_' + kind;
    cut.sbFilmEnabled = false;
    cut.sbFilmFailed = false;
    cut.sbBaseDur = cut.dur;
    if (!media.ready || media.missing || !media.video) return;
    const video = media.video;
    try {
      video.pause();
      video.currentTime = 0;
      cut.video = video;
      if (Number.isFinite(video.duration) && video.duration > 0)
        cut.dur = Math.min(video.duration, 6);
      const thisCut = cut;
      const promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(() => {
          if (cut === thisCut) thisCut.sbFilmEnabled = true;
        }).catch(() => {
          if (cut === thisCut) {
            thisCut.video = null;
            thisCut.sbFilmFailed = true;
            thisCut.dur = thisCut.sbBaseDur;
          }
        });
      } else {
        cut.sbFilmEnabled = !video.paused;
      }
    } catch (e) {
      cut.video = null;
      cut.sbFilmFailed = true;
      cut.dur = cut.sbBaseDur;
    }
  };

  endCut = function() {
    // Called by the game's normal timer and skip handlers, so either path
    // closes the clip without touching coins, lives or transition callbacks.
    if (cut && cut.video) {
      try { cut.video.pause(); } catch (e) { /* safe on Safari */ }
    }
    return SB_BASE_END();
  };

  function sbCover(source, isStill) {
    const sw = source.videoWidth || source.naturalWidth || source.width;
    const sh = source.videoHeight || source.naturalHeight || source.height;
    if (!sw || !sh || !W || !H) return false;
    const u = Math.max(0, Math.min(1, cut.t / Math.max(.1, cut.dur)));
    // A slight second-stage Ken Burns move animates still images if MP4
    // loading/autoplay is unavailable. MP4 clips already contain camera motion.
    const zoom = isStill ? 1.012 + .048 * (u * u * (3 - 2*u)) : 1;
    const cx = sw * sbCropFor(cut.sbName || ''), cw = sw - 2 * cx;
    const scale = Math.max(W / cw, H / sh) * zoom;
    const dw = cw * scale, dh = sh * scale;
    const drift = isStill ? (u - .5) * Math.min(W, H) * .020 : 0;
    ctx.drawImage(source, cx, 0, cw, sh, (W - dw) / 2 + drift, (H - dh) / 2, dw, dh);
    return true;
  }

  function sbAtmosphere() {
    // Cinematic edge falloff; leaves the center action vivid for portrait crop.
    const rad = Math.max(W, H) * .72;
    const g = ctx.createRadialGradient(W * .5, H * .49, Math.min(W, H) * .12,
                                       W * .5, H * .49, rad);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,3,13,.43)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // A brief non-graphic flash around the impact/capture beat. Never
    // changes the picture beyond the canvas cutscene layer.
    const u = cut.t / Math.max(.1, cut.dur);
    const beat = cut.kind === 'lose' ? .39 : (cut.tier >= 4 ? .46 : .38);
    const strength = cut.kind === 'lose' ? .52 : (cut.tier >= 4 ? .34 : .12);
    const a = strength * Math.exp(-Math.pow((u - beat) / .042, 2));
    if (a > .001) {
      ctx.fillStyle = 'rgba(255,242,216,' + a.toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  renderCut = function() {
    if (!cut) return;
    const media = cut.sbCinematic;
    let source = null, isStill = false;
    if (cut.video && !cut.video.paused && !cut.video.ended && cut.video.readyState >= 2)
      source = cut.video;
    else if (media && media.imageReady && media.image) {
      source = media.image;
      isStill = true;
    }
    if (!source) return SB_BASE_RENDER();

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.save();
    let drawn = false;
    try { drawn = sbCover(source, isStill); } catch (e) { drawn = false; }
    if (!drawn) { ctx.restore(); return SB_BASE_RENDER(); }
    sbAtmosphere();
    ctx.restore();

    if (cut.flash > 0) {
      ctx.fillStyle = 'rgba(255,250,235,' + (cut.flash * .7).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
    }
    const T = cut.tier, win = cut.kind === 'win', t = cut.t;
    const col = SHIPS[T].acc;
    const titleAt = cut.dur * .60;
    if (win) {
      cutTitle(WIN_T[T], 'WAVE ' + cut.wave + ' CLEARED \u00b7 +' + cut.bonus, titleAt, col);
      if (at('fan', titleAt)) sfx('up');
    } else {
      cutTitle(LOSE_T[T], cut.lives > 0
        ? cut.lives + ' ' + (cut.lives === 1 ? 'ship' : 'ships') + ' left'
        : 'GAME OVER', titleAt, '#ff4060');
    }
    const clamp01 = x => Math.max(0, Math.min(1, x));
    const bh = H * .09 * clamp01(Math.min(t / .4, (cut.dur - t) / .4));
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, bh);
    ctx.fillRect(0, H - bh, W, bh);
    if (t > .5) {
      ctx.globalAlpha = .55;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = '600 ' + Math.max(11, Math.min(W * .035, 14)) + 'px Rajdhani, sans-serif';
      ctx.fillText('TAP TO SKIP', W / 2, H - bh * .4);
      ctx.globalAlpha = 1;
    }
    const fade = Math.max(0, 1 - t / .35, 1 - (cut.dur - t) / .35);
    if (fade > 0) {
      ctx.fillStyle = 'rgba(0,0,0,' + fade.toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
    }
  };
})();
/* === STARBREAKER CINEMATIC ADDON: END === */
