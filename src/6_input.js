
/* ---------- input ---------- */
function setTouch(){document.body.classList.add('touch');}
if(window.matchMedia&&matchMedia('(pointer:coarse)').matches)setTouch();
cvs.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse')setTouch();
  if(state!=='play'||joy.id!==null)return;
  joy.id=e.pointerId;joy.bx=joy.x=e.clientX;joy.by=joy.y=e.clientY;try{cvs.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();
});
cvs.addEventListener('pointermove',e=>{if(e.pointerId!==joy.id)return;joy.x=e.clientX;joy.y=e.clientY;
  const dx=joy.x-joy.bx,dy=joy.y-joy.by,d=Math.hypot(dx,dy),m=JR*1.25;if(d>m){joy.bx=joy.x-dx/d*m;joy.by=joy.y-dy/d*m;}});
const endJoy=e=>{if(e.pointerId===joy.id)joy.id=null;};
cvs.addEventListener('pointerup',endJoy);cvs.addEventListener('pointercancel',endJoy);cvs.addEventListener('lostpointercapture',endJoy);

const fireBtn=$('fire');
fireBtn.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();fireHeld=true;fireBtn.classList.add('on');try{fireBtn.setPointerCapture(e.pointerId);}catch(_){}});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>fireBtn.addEventListener(ev,()=>{fireHeld=false;fireBtn.classList.remove('on');}));
$('auto').addEventListener('pointerdown',e=>{e.preventDefault();autoFire=!autoFire;$('auto').classList.toggle('on',autoFire);});
$('zap').addEventListener('pointerdown',e=>{e.preventDefault();strike();});
function setAutoZap(v){autoZap=v;$('azap').classList.toggle('on',v);try{localStorage.setItem('sb_autozap',v?'1':'0');}catch(e){}}
$('azap').addEventListener('pointerdown',e=>{e.preventDefault();setAutoZap(!autoZap);});setAutoZap(autoZap);
let resetFrom=null;
function askReset(from){resetFrom=from;$('confirm').classList.add('show');}
$('resetBtn').addEventListener('click',()=>askReset('menu'));
$('resetBtn2').addEventListener('click',()=>askReset('paused'));
$('resetNo').addEventListener('click',()=>$('confirm').classList.remove('show'));
$('resetYes').addEventListener('click',()=>{
  try{['sb_coins','sb_best','sb_autozap'].forEach(k=>localStorage.removeItem(k));}catch(e){}
  coins=0;best=0;tier=0;score=0;wave=0;stormT=0;charge=1;setAutoZap(true);setAcc();
  enemies=[];bullets=[];ebullets=[];coinsArr=[];bolts=[];player=null;
  $('bestTxt').textContent='';$('confirm').classList.remove('show');['paused','over'].forEach(id=>$(id).classList.remove('show'));
  state='menu';document.body.classList.remove('playing');$('menu').classList.add('show');
  banner('PROGRESS RESET','Back to the Sparrow','#ff8a8a');
});
$('pause').addEventListener('click',()=>togglePause());
function setMute(m){muted=m;$('mute').textContent=m?'✕':'♪';$('mute').style.opacity=m?.5:1;if(MG)MG.gain.value=m?0:.45;try{localStorage.setItem('sb_mute',m?'1':'0');}catch(e){}}
$('mute').addEventListener('click',()=>{initAudio();setMute(!muted);});setMute(muted);
function togglePause(){if(state==='play'){state='paused';fireHeld=false;joy.id=null;$('paused').classList.add('show');}else if(state==='paused'){state='play';$('paused').classList.remove('show');}}
$('play').addEventListener('click',()=>{initAudio();newGame();});
$('again').addEventListener('click',()=>{initAudio();newGame();});
$('resume').addEventListener('click',()=>togglePause());
$('restart').addEventListener('click',()=>{initAudio();newGame();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')togglePause();});

const KM={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',Space:'fire',KeyJ:'fire'};
window.addEventListener('keydown',e=>{
  if(KM[e.code]){keys[KM[e.code]]=true;e.preventDefault();}
  if(e.code==='KeyE'||e.code==='KeyL'||e.code==='ShiftLeft'||e.code==='ShiftRight')strike();
  if(e.code==='KeyP'||e.code==='Escape')togglePause();
  if(e.code==='KeyZ'){setAutoZap(!autoZap);if(state==='play'&&tier===4)banner('AUTO LIGHTNING '+(autoZap?'ON':'OFF'),'','#c8a8ff');}
  if(e.code==='Enter'&&(state==='menu'||state==='over')){initAudio();newGame();}
});
window.addEventListener('keyup',e=>{if(KM[e.code])keys[KM[e.code]]=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;fireHeld=false;});
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('dblclick',e=>e.preventDefault());
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('touchmove',e=>{if(!e.target.closest('.ov'))e.preventDefault();},{passive:false});

/* ---------- boot ---------- */
resize();
(function ladder(){const L=$('ladder');SHIPS.forEach((sh,i)=>{const d=document.createElement('div'),c=document.createElement('canvas');c.width=c.height=120;
  const g=c.getContext('2d'),k=88/(sh.nose-sh.tail+18);g.translate(60,62);g.rotate(-Math.PI/2);g.scale(k,k);g.translate(-(sh.nose+sh.tail)/2,0);drawShip(g,i,.6,1);
  d.appendChild(c);d.insertAdjacentHTML('beforeend',`<b style="color:${sh.acc}">${sh.name}</b><small>${i?'◉ '+sh.cost:'START'}</small>`);L.appendChild(d);});})();
if(best)$('bestTxt').textContent='Best score: '+best.toLocaleString();
for(let i=0;i<7;i++){const t=['rock','ice','iron','emerald','gold','void','rock'][i],a=rand(0,TAU),sp=rand(10,30)*S;asteroids.push(makeAsteroid(t,1+(i%3),rand(0,W),rand(0,H),Math.cos(a)*sp,Math.sin(a)*sp));}
let last=performance.now();
function frame(t){requestAnimationFrame(frame);let dt=(t-last)/1000;last=t;if(dt>.05)dt=.05;if(dt<0)dt=0;
  try{if(state!=='paused')update(dt);render();hud();}catch(err){console.error(err);}}
requestAnimationFrame(frame);
</script>
</body>
</html>
