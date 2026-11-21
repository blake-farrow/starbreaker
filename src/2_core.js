'use strict';
const $=id=>document.getElementById(id);
const cvs=$('c'),ctx=cvs.getContext('2d');
const TAU=Math.PI*2;
let W=0,H=0,DPR=1,S=1;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const angDiff=(a,b)=>{let d=(a-b)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d;};
function hexRGB(h){const n=parseInt(h.slice(1),16);return[n>>16,(n>>8)&255,n&255];}
function hexA(h,a){const c=hexRGB(h);return`rgba(${c[0]},${c[1]},${c[2]},${a})`;}
function shade(h,amt){const c=hexRGB(h).map(v=>clamp(Math.round(v+amt),0,255));return'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');}
function wrap(o,m){if(o.x<-m)o.x+=W+2*m;else if(o.x>W+m)o.x-=W+2*m;if(o.y<-m)o.y+=H+2*m;else if(o.y>H+m)o.y-=H+2*m;}

/* ---------- glow sprites ---------- */
const glowCache={};
function glow(col){
  if(glowCache[col])return glowCache[col];
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  const gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.18,col);gr.addColorStop(.5,hexA(col,.3));gr.addColorStop(1,hexA(col,0));
  g.fillStyle=gr;g.fillRect(0,0,64,64);return glowCache[col]=c;
}
function drawGlow(col,x,y,r,a){ctx.globalAlpha=a;ctx.drawImage(glow(col),x-r,y-r,r*2,r*2);ctx.globalAlpha=1;}
const coinSpr=(()=>{const c=document.createElement('canvas');c.width=c.height=40;const g=c.getContext('2d');
  let gr=g.createRadialGradient(15,14,1,20,20,19);gr.addColorStop(0,'#fff8d0');gr.addColorStop(.45,'#f5c03a');gr.addColorStop(1,'#7a4c04');
  g.fillStyle=gr;g.beginPath();g.arc(20,20,18,0,TAU);g.fill();
  g.strokeStyle='rgba(255,235,160,.9)';g.lineWidth=2;g.beginPath();g.arc(20,20,12,0,TAU);g.stroke();
  g.strokeStyle='rgba(90,50,0,.7)';g.lineWidth=1.5;g.beginPath();g.arc(20,20,18,0,TAU);g.stroke();return c;})();

/* ---------- ships ---------- */
const SHIPS=[
 {name:'SPARROW',cost:0,fire:.30,dmg:1,hp:3,thrust:330,max:290,hull:'#8d99a8',acc:'#5fd0ff',bul:'#6fd8ff',mag:70,
  half:[[20,0],[6,-4],[-11,-12],[-14,-12],[-8,-4],[-10,0]],eng:[[-9,0]],pat:[[0,0]],desc:'Basic blaster'},
 {name:'FALCON',cost:40,fire:.22,dmg:1,hp:4,thrust:360,max:310,hull:'#c4d0dc',acc:'#4fffb0',bul:'#6fffc0',mag:95,
  half:[[24,0],[10,-4],[-2,-6],[-10,-16],[-15,-16],[-11,-6],[-13,0]],eng:[[-12,-3],[-12,3]],pat:[[0,-5],[0,5]],desc:'Twin cannons'},
 {name:'HAWK',cost:120,fire:.18,dmg:1.5,hp:5,thrust:390,max:330,hull:'#7d828c',acc:'#ffa640',bul:'#ffb85a',mag:120,
  half:[[28,0],[14,-4],[2,-7],[-6,-20],[-12,-21],[-10,-8],[-16,-7],[-16,0]],eng:[[-15,-4],[-15,4]],pat:[[-.12,0],[0,0],[.12,0]],desc:'Spread shot'},
 {name:'RAPTOR',cost:280,fire:.14,dmg:2,hp:6,thrust:420,max:350,hull:'#4a4e58',acc:'#ff4d6d',bul:'#ff6f8a',mag:150,
  half:[[30,0],[16,-5],[0,-9],[-10,-24],[-18,-25],[-14,-10],[-19,-8],[-19,0]],eng:[[-18,-5],[-18,5]],pat:[[-.22,0],[-.1,0],[0,0],[.1,0],[.22,0]],desc:'5-way barrage'},
 {name:'TEMPEST',cost:550,fire:.11,dmg:2.5,hp:8,thrust:450,max:370,hull:'#3a3266',acc:'#b48cff',bul:'#c9a8ff',mag:190,
  half:[[34,0],[20,-5],[6,-9],[-4,-14],[-14,-27],[-22,-28],[-17,-12],[-23,-9],[-21,0]],eng:[[-22,-6],[-22,0],[-22,6]],pat:[[-.24,0],[-.12,0],[0,-4],[0,4],[.12,0],[.24,0]],desc:'Storm lightning'},
];
SHIPS.forEach(sh=>{let span=0,tip=sh.half[0];for(const p of sh.half)if(-p[1]>span){span=-p[1];tip=p;}sh.span=span;sh.tip=tip;sh.nose=sh.half[0][0];sh.tail=sh.half[sh.half.length-1][0];sh.r=(sh.nose+span)*.3;});

function shipPath(g,h){g.beginPath();g.moveTo(h[0][0],h[0][1]);for(let i=1;i<h.length;i++)g.lineTo(h[i][0],h[i][1]);for(let i=h.length-1;i>=0;i--)g.lineTo(h[i][0],-h[i][1]);g.closePath();}
function drawShip(g,t,thr,tm){
  const sh=SHIPS[t],h=sh.half,nose=sh.nose,span=sh.span,tip=sh.tip,tail=sh.tail;
  if(thr>0){g.globalCompositeOperation='lighter';
    for(const e of sh.eng){const L=(8+thr*18)*(.8+Math.random()*.35);g.globalAlpha=.95;
      g.drawImage(glow(sh.acc),e[0]-L*1.7,e[1]-5,L*1.9,10);g.drawImage(glow('#ffffff'),e[0]-L*.75,e[1]-2.4,L*.85,4.8);}
    g.globalAlpha=1;g.globalCompositeOperation='source-over';}
  shipPath(g,h);
  const gr=g.createLinearGradient(0,-span,0,span);gr.addColorStop(0,shade(sh.hull,70));gr.addColorStop(.5,sh.hull);gr.addColorStop(1,shade(sh.hull,-75));
  g.fillStyle=gr;g.fill();
  const gx=g.createLinearGradient(nose,0,tail,0);gx.addColorStop(0,'rgba(255,255,255,.25)');gx.addColorStop(.55,'rgba(0,0,0,0)');gx.addColorStop(1,'rgba(0,0,0,.4)');
  g.fillStyle=gx;g.fill();
  g.lineJoin='round';g.lineWidth=.9;g.strokeStyle='rgba(5,8,14,.9)';g.stroke();
  g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=.6;g.beginPath();g.moveTo(nose*.55,0);g.lineTo(tail,0);
  for(const s of[-1,1]){g.moveTo(tip[0]*.4,s*span*.35);g.lineTo(tail*.85,s*span*.3);}g.stroke();
  g.strokeStyle=sh.acc;g.lineWidth=1.5;g.globalAlpha=.9;g.beginPath();
  for(const s of[-1,1]){g.moveTo(nose*.2,s*span*.18);g.lineTo(tip[0]*.85,s*span*.8);}g.stroke();g.globalAlpha=1;
  g.fillStyle='#14171d';for(const e of sh.eng)g.fillRect(e[0]-2,e[1]-2,3.5,4);
  g.globalCompositeOperation='lighter';
  for(const e of sh.eng){g.globalAlpha=.45+thr*.55;g.drawImage(glow(sh.acc),e[0]-5,e[1]-5,10,10);}
  const bl=(Math.sin(tm*6)+1)/2;g.globalAlpha=.3+.7*bl;
  g.drawImage(glow('#ff3b3b'),tip[0]-4,tip[1]-4,8,8);g.drawImage(glow('#3bff7a'),tip[0]-4,-tip[1]-4,8,8);
  if(t===4){const pl=.6+.4*Math.sin(tm*9);g.globalAlpha=pl;
    g.drawImage(glow(sh.acc),tip[0]-9,tip[1]-9,18,18);g.drawImage(glow(sh.acc),tip[0]-9,-tip[1]-9,18,18);g.globalAlpha=1;
    if(Math.random()<.35){g.strokeStyle='#e6dcff';g.lineWidth=.8;g.beginPath();let x=tip[0],y=tip[1];g.moveTo(x,y);
      for(let i=1;i<=6;i++){x=tip[0]+(nose*.3-tip[0])*i/6+rand(-3,3);y=tip[1]*(1-i/6)+rand(-3,3);g.lineTo(x,y);}g.stroke();}}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
  const cx=nose*.38,rx=Math.max(4,nose*.2),ry=3.2;
  const cg=g.createRadialGradient(cx+rx*.3,-1.2,.5,cx,0,rx);cg.addColorStop(0,'#f2fdff');cg.addColorStop(.35,'#69c8ef');cg.addColorStop(1,'#08202e');
  g.fillStyle=cg;g.beginPath();g.ellipse(cx,0,rx,ry,0,0,TAU);g.fill();g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=.6;g.stroke();
}

/* ---------- asteroids ---------- */
const ATYPES={
 rock:{base:'#7a7068',hp:1,coins:1,score:1,tex:'rock'},
 ice:{base:'#9ec4dc',hp:.75,coins:2,score:1.2,tex:'ice'},
 iron:{base:'#8a4a32',hp:2,coins:2,score:1.5,tex:'metal'},
 emerald:{base:'#2f8a62',hp:1.6,coins:3,score:2,tex:'crystal'},
 gold:{base:'#c49a3c',hp:2.6,coins:6,score:3,tex:'metal'},
 void:{base:'#5b3590',hp:3.5,coins:8,score:4,tex:'void',glow:'#b060ff'},
};
const SIZES={3:{R:60,hp:3,score:20,coin:3},2:{R:35,hp:2,score:50,coin:2},1:{R:19,hp:1,score:100,coin:1}};

function makeAsteroid(type,size,x,y,vx,vy){
  const T=ATYPES[type],Z=SIZES[size],pts=[];
  if(T.tex==='crystal'){const n=9+(Math.random()*4|0);for(let i=0;i<n;i++){const a=(i+rand(-.25,.25))/n*TAU,r=rand(.78,1.1);pts.push([Math.cos(a)*r,Math.sin(a)*r]);}}
  else{const n=size===3?30:size===2?24:18,k1=2+(Math.random()*3|0),k2=4+(Math.random()*4|0),p1=rand(0,TAU),p2=rand(0,TAU);
    for(let i=0;i<n;i++){const a=i/n*TAU,r=1+.13*Math.sin(k1*a+p1)+.07*Math.sin(k2*a+p2)+rand(-.06,.06);pts.push([Math.cos(a)*r,Math.sin(a)*r]);}}
  const a={type,size,T,R:Z.R*rand(.9,1.1),x,y,vx,vy,rot:rand(0,TAU),vr:rand(-.7,.7)/size,pts,flash:0};
  a.hp=a.maxHp=Z.hp*T.hp;a.P=a.R*1.3*DPR;a.spr=astSprite(a);return a;
}
function astSprite(a){
  const P=a.P,C=Math.ceil(P*2.5),c=document.createElement('canvas');c.width=c.height=C;
  const g=c.getContext('2d'),T=a.T,[br,bgc,bb]=hexRGB(T.base),cl=v=>clamp(v|0,0,255);
  g.translate(C/2,C/2);
  const path=()=>{g.beginPath();a.pts.forEach((p,i)=>i?g.lineTo(p[0]*P,p[1]*P):g.moveTo(p[0]*P,p[1]*P));g.closePath();};
  path();g.save();g.clip();
  g.fillStyle=T.base;g.fillRect(-C/2,-C/2,C,C);
  for(let i=0;i<36;i++){const x=rand(-P,P),y=rand(-P,P),rr=rand(.1,.45)*P,d=rand(-45,40),col=`rgba(${cl(br+d)},${cl(bgc+d)},${cl(bb+d)},`;
    const gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,col+'.55)');gr.addColorStop(1,col+'0)');g.fillStyle=gr;g.fillRect(x-rr,y-rr,rr*2,rr*2);}
  const gn=Math.min(2200,P*P*.2|0);
  for(let i=0;i<gn;i++){const v=Math.random()<.5?0:255;g.fillStyle=`rgba(${v},${v},${v},${rand(.03,.13).toFixed(2)})`;const s=rand(.5,1.7)*DPR;g.fillRect(rand(-P,P),rand(-P,P),s,s);}
  if(T.tex==='rock'||T.tex==='metal'||T.tex==='void'){
    const n=(T.tex==='metal'?1:2)*a.size+(Math.random()*3|0);
    for(let i=0;i<n;i++){const ang=rand(0,TAU),d=rand(0,.7)*P,cx=Math.cos(ang)*d,cy=Math.sin(ang)*d,cr=rand(.08,.26)*P;
      const gr=g.createRadialGradient(cx-cr*.25,cy-cr*.25,0,cx,cy,cr);gr.addColorStop(0,'rgba(0,0,0,.5)');gr.addColorStop(.75,'rgba(0,0,0,.25)');gr.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle=gr;g.beginPath();g.arc(cx,cy,cr,0,TAU);g.fill();
      g.lineWidth=cr*.18;g.strokeStyle='rgba(255,255,255,.16)';g.beginPath();g.arc(cx,cy,cr*.85,-.3,Math.PI*.75);g.stroke();
      g.strokeStyle='rgba(0,0,0,.28)';g.beginPath();g.arc(cx,cy,cr*.85,Math.PI*.95,Math.PI*1.6);g.stroke();}}
  if(T.tex==='metal'){
    for(let i=0;i<12;i++){g.strokeStyle=`rgba(255,240,210,${rand(.05,.2).toFixed(2)})`;g.lineWidth=rand(1,4)*DPR;const an=rand(0,TAU),x=rand(-P,P),y=rand(-P,P),L=rand(.4,1.2)*P;
      g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(an)*L,y+Math.sin(an)*L);g.stroke();}
    for(let i=0;i<25;i++){g.fillStyle=`rgba(255,250,220,${rand(.4,.9).toFixed(2)})`;const s=rand(.8,2)*DPR;g.fillRect(rand(-P,P),rand(-P,P),s,s);}}
  if(T.tex==='ice'){
    for(let i=0;i<10;i++){const x=rand(-P,P),y=rand(-P,P),rr=rand(.15,.4)*P,gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,'rgba(255,255,255,.3)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x-rr,y-rr,rr*2,rr*2);}
    g.strokeStyle='rgba(235,250,255,.45)';g.lineWidth=1*DPR;
    for(let i=0;i<6;i++){let x=rand(-P,P)*.7,y=rand(-P,P)*.7;g.beginPath();g.moveTo(x,y);for(let k=0;k<6;k++){x+=rand(-.2,.2)*P;y+=rand(-.2,.2)*P;g.lineTo(x,y);}g.stroke();}}
  if(T.tex==='crystal'){
    for(let i=0;i<16;i++){const x=rand(-P,P)*.8,y=rand(-P,P)*.8,s=rand(.2,.6)*P;g.fillStyle=Math.random()<.5?`rgba(200,255,225,${rand(.05,.22).toFixed(2)})`:`rgba(0,20,10,${rand(.08,.3).toFixed(2)})`;
      g.beginPath();g.moveTo(x,y);g.lineTo(x+rand(-s,s),y+rand(-s,s));g.lineTo(x+rand(-s,s),y+rand(-s,s));g.closePath();g.fill();}
    g.strokeStyle='rgba(190,255,220,.5)';g.lineWidth=1*DPR;g.beginPath();a.pts.forEach(p=>{g.moveTo(0,0);g.lineTo(p[0]*P*.9,p[1]*P*.9);});g.stroke();}
  if(T.tex==='void'){g.globalCompositeOperation='lighter';
    for(let i=0;i<6;i++){let x=rand(-P,P)*.6,y=rand(-P,P)*.6;const pts=[[x,y]];for(let k=0;k<7;k++){x+=rand(-.22,.22)*P;y+=rand(-.22,.22)*P;pts.push([x,y]);}
      for(const [w,c] of [[5*DPR,'rgba(150,70,255,.22)'],[1.6*DPR,'rgba(225,160,255,.75)']]){g.lineWidth=w;g.strokeStyle=c;g.beginPath();pts.forEach((p,j)=>j?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();}}
    g.globalCompositeOperation='source-over';}
  g.restore();
  path();g.lineWidth=1.5*DPR;g.strokeStyle='rgba(0,0,0,.55)';g.stroke();
  return c;
}
function drawAst(a){
  const r=a.R*S,k=r/a.P,C=a.spr.width*k;
  if(a.T.glow){ctx.globalCompositeOperation='lighter';drawGlow(a.T.glow,a.x,a.y,r*2.1,.32+.08*Math.sin(time*3+a.R));ctx.globalCompositeOperation='source-over';}
  ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.rot);ctx.drawImage(a.spr,-C/2,-C/2,C,C);ctx.restore();
  const cs=Math.cos(a.rot),sn=Math.sin(a.rot);ctx.beginPath();
  a.pts.forEach((p,i)=>{const px=p[0]*r,py=p[1]*r,x=a.x+px*cs-py*sn,y=a.y+px*sn+py*cs;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();
  const lx=a.x-r*.5,ly=a.y-r*.55,gr=ctx.createRadialGradient(lx,ly,r*.05,a.x+r*.1,a.y+r*.1,r*1.45);
  gr.addColorStop(0,'rgba(255,250,235,.24)');gr.addColorStop(.35,'rgba(255,250,235,0)');gr.addColorStop(.62,'rgba(0,0,10,.28)');gr.addColorStop(1,'rgba(0,0,12,.93)');
  ctx.fillStyle=gr;ctx.fill();
  if(a.flash>0){ctx.fillStyle=`rgba(255,255,255,${(a.flash*.55).toFixed(2)})`;ctx.fill();}
  if(a.T.tex==='ice'||a.T.tex==='metal'||a.T.tex==='crystal'){ctx.globalCompositeOperation='lighter';drawGlow('#ffffff',lx+r*.2,ly+r*.2,r*.45,.16);ctx.globalCompositeOperation='source-over';}
}
