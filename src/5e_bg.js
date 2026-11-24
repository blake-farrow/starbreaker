
/* ---------- sector backgrounds ---------- */
const THEMES=[
 {name:'HOME ORBIT',top:'#03040c',bot:'#070314',neb:[[40,60,150],[100,40,140],[20,110,130],[60,40,160]],star:'225,235,255',planet:{kind:'earth',r:.14,x:.82,y:.22}},
 {name:'CRIMSON NEBULA',top:'#0a0205',bot:'#170409',neb:[[180,30,55],[220,90,40],[140,20,100],[100,10,30]],star:'255,225,220',planet:{kind:'mars',r:.11,x:.2,y:.24}},
 {name:'EMERALD DRIFT',top:'#010806',bot:'#03120d',neb:[[20,150,95],[30,110,150],[100,170,60],[10,60,50]],star:'220,255,235',planet:{kind:'ice',r:.08,x:.8,y:.72},moon:true},
 {name:"SATURN'S REACH",top:'#080604',bot:'#140b04',neb:[[160,115,50],[120,75,30],[70,55,100]],star:'255,245,225',planet:{kind:'gas',r:.16,x:.74,y:.28,rings:true}},
 {name:'FROZEN BELT',top:'#02060e',bot:'#07111e',neb:[[60,120,210],[150,200,245],[40,60,140]],star:'230,245,255',planet:{kind:'ice',r:.15,x:.18,y:.8},dust:true},
 {name:'GALACTIC CORE',top:'#05030c',bot:'#0b0613',neb:[[130,75,180],[210,160,120],[60,60,150]],star:'255,245,240',galaxy:true},
 {name:'INFERNO SECTOR',top:'#0d0402',bot:'#1a0802',neb:[[230,95,20],[190,45,10],[130,30,70],[255,150,40]],star:'255,230,200',planet:{kind:'lava',r:.15,x:.82,y:.76}},
 {name:'THE VOID',top:'#010103',bot:'#040209',neb:[[45,25,80],[25,20,45]],star:'200,210,255',hole:true},
];
const BOSS_THEME={name:'DANGER ZONE',top:'#0d0104',bot:'#1c0209',neb:[[210,20,45],[130,10,70],[255,70,40],[90,0,20]],star:'255,210,210',planet:{kind:'lava',r:.22,x:.86,y:.88},boss:true};
let curTheme=THEMES[0],bgPrev=null,bgFadeAt=-9,starCol='225,235,255',shooters=[];
function setTheme(th){if(th===curTheme&&bg)return;bgPrev=bg;bgFadeAt=time;curTheme=th;starCol=th.star;bg=makeBG(th);}
function buildBG(){bgPrev=null;starCol=curTheme.star;bg=makeBG(curTheme);}
function planetArt(g,x,y,r,kind,rnd){
  const C={earth:['#1e4a8a','rgba(130,190,255,.5)'],mars:['#a84a26','rgba(255,150,110,.35)'],ice:['#a9d4ec','rgba(200,240,255,.5)'],gas:['#c89a5a','rgba(255,220,160,.35)'],lava:['#2a0a04','rgba(255,110,40,.55)']}[kind];
  let gr=g.createRadialGradient(x,y,r*.9,x,y,r*1.35);gr.addColorStop(0,C[1]);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r*1.35,0,TAU);g.fill();
  g.save();g.beginPath();g.arc(x,y,r,0,TAU);g.clip();g.fillStyle=C[0];g.fillRect(x-r,y-r,r*2,r*2);
  if(kind==='earth'){for(let i=0;i<9;i++){g.fillStyle=rnd()<.5?'#3d7a3a':'#9a8458';g.beginPath();g.ellipse(x+(rnd()-.5)*r*1.6,y+(rnd()-.5)*r*1.6,r*(.15+rnd()*.3),r*(.08+rnd()*.18),rnd()*3,0,TAU);g.fill();}
    g.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<12;i++){g.beginPath();g.ellipse(x+(rnd()-.5)*r*2,y+(rnd()-.5)*r*2,r*(.2+rnd()*.35),r*.05,-.3,0,TAU);g.fill();}}
  if(kind==='mars'){for(let i=0;i<14;i++){g.fillStyle=`rgba(${rnd()<.5?'60,20,10':'220,140,90'},${(.15+rnd()*.25).toFixed(2)})`;g.beginPath();g.ellipse(x+(rnd()-.5)*r*1.8,y+(rnd()-.5)*r*1.8,r*(.1+rnd()*.35),r*(.06+rnd()*.2),rnd()*3,0,TAU);g.fill();}
    for(let i=0;i<10;i++){const cx=x+(rnd()-.5)*r*1.6,cy=y+(rnd()-.5)*r*1.6,cr=r*(.03+rnd()*.08);g.fillStyle='rgba(40,10,5,.35)';g.beginPath();g.arc(cx,cy,cr,0,TAU);g.fill();g.strokeStyle='rgba(255,190,150,.25)';g.lineWidth=cr*.3;g.beginPath();g.arc(cx,cy,cr,-.5,2);g.stroke();}}
  if(kind==='ice'){g.strokeStyle='rgba(60,120,170,.45)';g.lineWidth=Math.max(1,r*.015);for(let i=0;i<16;i++){let cx=x+(rnd()-.5)*r*2,cy=y+(rnd()-.5)*r*2;g.beginPath();g.moveTo(cx,cy);for(let k=0;k<5;k++){cx+=(rnd()-.5)*r*.4;cy+=(rnd()-.5)*r*.4;g.lineTo(cx,cy);}g.stroke();}
    g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<6;i++){g.beginPath();g.arc(x+(rnd()-.5)*r*1.6,y+(rnd()-.5)*r*1.6,r*(.1+rnd()*.25),0,TAU);g.fill();}}
  if(kind==='gas'){const cols=['#e8cf9a','#b07a40','#d8a868','#8a5a30','#f0dcb0','#c08850'];for(let i=0;i<16;i++){g.fillStyle=cols[i%cols.length];g.globalAlpha=.55;g.fillRect(x-r,y-r+i*r/8,r*2,r/8*(.6+rnd()*.8));}g.globalAlpha=1;
    g.fillStyle='rgba(200,90,50,.6)';g.beginPath();g.ellipse(x+r*.3,y+r*.25,r*.16,r*.09,0,0,TAU);g.fill();}
  if(kind==='lava'){g.globalCompositeOperation='lighter';g.lineCap='round';for(let i=0;i<22;i++){let cx=x+(rnd()-.5)*r*2,cy=y+(rnd()-.5)*r*2;g.strokeStyle=`rgba(255,${(90+rnd()*90)|0},20,${(.5+rnd()*.4).toFixed(2)})`;g.lineWidth=Math.max(1,r*(.01+rnd()*.025));
      g.beginPath();g.moveTo(cx,cy);for(let k=0;k<5;k++){cx+=(rnd()-.5)*r*.35;cy+=(rnd()-.5)*r*.35;g.lineTo(cx,cy);}g.stroke();}g.globalCompositeOperation='source-over';}
  gr=g.createRadialGradient(x-r*.45,y-r*.45,r*.05,x,y,r*1.05);gr.addColorStop(0,'rgba(255,255,255,.16)');gr.addColorStop(.45,'rgba(0,0,0,0)');gr.addColorStop(.8,'rgba(0,0,8,.72)');gr.addColorStop(1,'rgba(0,0,8,.96)');
  g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);g.restore();
}
function makeBG(th){
  const q=Math.min(DPR,1.5),BW=Math.ceil(W*1.1),BH=Math.ceil(H*1.1),c=document.createElement('canvas');c.width=Math.ceil(BW*q);c.height=Math.ceil(BH*q);
  const g=c.getContext('2d');g.scale(q,q);const rnd=seeded(THEMES.indexOf(th)*977+13),M=Math.max(BW,BH);
  let gr=g.createLinearGradient(0,0,BW,BH);gr.addColorStop(0,th.top);gr.addColorStop(1,th.bot);g.fillStyle=gr;g.fillRect(0,0,BW,BH);
  g.globalCompositeOperation='lighter';
  for(let i=0;i<16;i++){const x=rnd()*BW,y=rnd()*BH,rad=(.12+rnd()*.38)*M,c3=th.neb[i%th.neb.length].join(','),a=(.05+rnd()*.1)*(i<6?1.4:1);
    gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,`rgba(${c3},${a.toFixed(3)})`);gr.addColorStop(.45,`rgba(${c3},${(a*.4).toFixed(3)})`);gr.addColorStop(1,`rgba(${c3},0)`);g.fillStyle=gr;g.fillRect(0,0,BW,BH);}
  g.globalCompositeOperation='source-over';
  for(let i=0;i<7;i++){const x=rnd()*BW,y=rnd()*BH,rad=(.08+rnd()*.2)*M;gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,'rgba(0,0,0,.35)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,BW,BH);}
  for(let i=0;i<BW*BH/650;i++){const b=rnd();g.fillStyle=`rgba(${th.star},${(b*b*.5).toFixed(2)})`;const s=b>.97?1.4:.7;g.fillRect(rnd()*BW,rnd()*BH,s,s);}
  g.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const x=rnd()*BW,y=rnd()*BH,s=2+rnd()*3;gr=g.createRadialGradient(x,y,0,x,y,s*3);gr.addColorStop(0,`rgba(${th.star},.9)`);gr.addColorStop(1,`rgba(${th.star},0)`);g.fillStyle=gr;g.fillRect(x-s*3,y-s*3,s*6,s*6);
    g.strokeStyle=`rgba(${th.star},.35)`;g.lineWidth=.6;g.beginPath();g.moveTo(x-s*4,y);g.lineTo(x+s*4,y);g.moveTo(x,y-s*4);g.lineTo(x,y+s*4);g.stroke();}
  g.globalCompositeOperation='source-over';
  if(th.galaxy){const cx=BW*.62,cy=BH*.32,R=Math.min(BW,BH)*.38;g.globalCompositeOperation='lighter';
    gr=g.createRadialGradient(cx,cy,0,cx,cy,R*.35);gr.addColorStop(0,'rgba(255,240,210,.9)');gr.addColorStop(.3,'rgba(255,200,150,.35)');gr.addColorStop(1,'rgba(200,150,255,0)');g.fillStyle=gr;g.fillRect(cx-R,cy-R,R*2,R*2);
    for(let arm=0;arm<3;arm++)for(let i=0;i<500;i++){const t=i/500,a=arm*TAU/3+t*5.5+(rnd()-.5)*.35,r=t*R+(rnd()-.5)*R*.08,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.42;
      g.fillStyle=rnd()<.7?`rgba(200,180,255,${(.25*(1-t)+.05).toFixed(2)})`:`rgba(255,220,180,${(.4*(1-t)+.05).toFixed(2)})`;const s=.6+rnd()*1.6;g.fillRect(x,y,s,s);}
    g.globalCompositeOperation='source-over';}
  if(th.hole){const cx=BW*.7,cy=BH*.3,R=Math.min(BW,BH)*.09;g.globalCompositeOperation='lighter';
    gr=g.createRadialGradient(cx,cy,R*.8,cx,cy,R*3.5);gr.addColorStop(0,'rgba(255,170,90,.35)');gr.addColorStop(1,'rgba(150,80,255,0)');g.fillStyle=gr;g.fillRect(cx-R*4,cy-R*4,R*8,R*8);
    for(let i=0;i<5;i++){g.strokeStyle=i%2?'rgba(255,190,120,.5)':'rgba(255,120,60,.45)';g.lineWidth=R*(.12-i*.015);g.beginPath();g.ellipse(cx,cy,R*(1.9+i*.25),R*(.38+i*.05),-.2,0,TAU);g.stroke();}
    g.globalCompositeOperation='source-over';g.fillStyle='#000';g.beginPath();g.arc(cx,cy,R,0,TAU);g.fill();
    g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,220,170,.8)';g.lineWidth=R*.06;g.beginPath();g.arc(cx,cy,R*1.03,0,TAU);g.stroke();
    g.strokeStyle='rgba(255,150,80,.6)';g.lineWidth=R*.12;g.beginPath();g.ellipse(cx,cy,R*1.9,R*.38,-.2,Math.PI*1.05,Math.PI*1.95,true);g.stroke();g.globalCompositeOperation='source-over';}
  if(th.dust){g.save();g.translate(BW*.5,BH*.55);g.rotate(-.35);for(let i=0;i<900;i++){const x=(rnd()-.5)*BW*1.4,y=(rnd()+rnd()+rnd()-1.5)*BH*.06,s=.6+rnd()*2.2;g.fillStyle=`rgba(${(150+rnd()*60)|0},${(160+rnd()*60)|0},${(180+rnd()*60)|0},${(.15+rnd()*.35).toFixed(2)})`;g.fillRect(x,y,s,s*.8);}g.restore();}
  if(th.planet){const P=th.planet,r=Math.min(BW,BH)*P.r,x=BW*P.x,y=BH*P.y;
    const ring=(front)=>{g.save();g.translate(x,y);g.rotate(-.35);for(let i=0;i<6;i++){g.strokeStyle=`rgba(${i%2?'230,210,170':'200,170,120'},${(.45-i*.05).toFixed(2)})`;g.lineWidth=r*(.06+i*.01);g.beginPath();g.ellipse(0,0,r*(1.45+i*.12),r*(.32+i*.03),0,front?0:Math.PI,front?Math.PI:TAU);g.stroke();}g.restore();};
    if(P.rings)ring(false);planetArt(g,x,y,r,P.kind,rnd);if(P.rings)ring(true);
    if(th.moon)planetArt(g,x-r*2.4,y-r*1.5,r*.28,'mars',rnd);}
  return c;
}
function drawBackground(dt){
  const p=player&&player.alive?player:null,ox=-W*.05+(p?(W/2-p.x)*.03:Math.sin(time*.05)*W*.015),oy=-H*.05+(p?(H/2-p.y)*.03:0);
  if(bg)ctx.drawImage(bg,ox,oy,W*1.1,H*1.1);
  const fa=1-(time-bgFadeAt)/1.6;if(bgPrev&&fa>0){ctx.globalAlpha=fa;ctx.drawImage(bgPrev,ox,oy,W*1.1,H*1.1);ctx.globalAlpha=1;}else bgPrev=null;
  if(Math.random()<.006&&shooters.length<2){const a=rand(.3,.9)+(Math.random()<.5?0:Math.PI*.5);shooters.push({x:rand(0,W),y:rand(0,H*.5),vx:Math.cos(a)*900,vy:Math.sin(a)*500,life:.7});}
  ctx.globalCompositeOperation='lighter';
  for(const s of shooters){s.life-=1/60;s.x+=s.vx/60;s.y+=s.vy/60;const g=ctx.createLinearGradient(s.x,s.y,s.x-s.vx*.12,s.y-s.vy*.12);g.addColorStop(0,`rgba(${starCol},${Math.max(0,s.life).toFixed(2)})`);g.addColorStop(1,`rgba(${starCol},0)`);
    ctx.strokeStyle=g;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x-s.vx*.12,s.y-s.vy*.12);ctx.stroke();}
  shooters=shooters.filter(s=>s.life>0);
  if(curTheme.boss){const pu=.5+.5*Math.sin(time*2.5),gr=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);gr.addColorStop(0,'rgba(255,0,40,0)');gr.addColorStop(1,`rgba(255,20,50,${(.1+.12*pu).toFixed(3)})`);ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);}
  ctx.globalCompositeOperation='source-over';
}
