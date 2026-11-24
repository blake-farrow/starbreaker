
/* ---------- input ---------- */
function setTouch(){document.body.classList.add('touch');}
if(window.matchMedia&&matchMedia('(pointer:coarse)').matches)setTouch();
cvs.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse')setTouch();
  if(cut){e.preventDefault();if(cut.t>.5)endCut();return;}
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
function setCuts(v){cutsOn=v;for(const id of ['cutsBtn','cutsBtn2'])$(id).textContent='CUTSCENES: '+(v?'ON':'OFF');try{localStorage.setItem('sb_cuts',v?'1':'0');}catch(e){}}
function setBoss(v){bossesOn=v;for(const id of ['bossBtn','bossBtn2'])$(id).textContent='BOSS BATTLES: '+(v?'ON':'OFF');try{localStorage.setItem('sb_boss',v?'1':'0');}catch(e){}}
$('bossBtn').addEventListener('click',()=>setBoss(!bossesOn));$('bossBtn2').addEventListener('click',()=>setBoss(!bossesOn));setBoss(bossesOn);
$('cutsBtn').addEventListener('click',()=>setCuts(!cutsOn));$('cutsBtn2').addEventListener('click',()=>setCuts(!cutsOn));setCuts(cutsOn);
$('resetNo').addEventListener('click',()=>$('confirm').classList.remove('show'));
$('resetYes').addEventListener('click',()=>{
  try{['sb_coins','sb_best','sb_autozap','sb_design','sb_boss'].forEach(k=>localStorage.removeItem(k));}catch(e){}
  coins=0;best=0;tier=0;score=0;wave=0;stormT=0;streams=[];cut=null;document.body.classList.remove('cut');setCuts(true);try{localStorage.removeItem('sb_cuts');}catch(e){}charge=1;setAutoZap(true);DESIGN=Object.assign({},DESIGN_DEFAULT);applyDesign();setAcc();buildLadder();refreshDzBtns();waves=[];holes=[];boss=null;bossDefeated=null;setBoss(true);
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
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;
  if(dzOpen){if(e.code==='Escape')closeDesigner(false);return;}
  if(cut&&['Space','Enter','Escape','KeyP'].includes(e.code)){e.preventDefault();if(cut.t>.5&&!e.repeat)endCut();return;}
  if(KM[e.code]){keys[KM[e.code]]=true;e.preventDefault();}
  if(e.code==='KeyE'||e.code==='KeyL'||e.code==='ShiftLeft'||e.code==='ShiftRight')strike();
  if(e.code==='KeyP'||e.code==='Escape')togglePause();
  if(e.code==='KeyZ'){setAutoZap(!autoZap);const sd=specDef(specialOf(tier));if(state==='play'&&sd.id!=='none')banner('AUTO '+sd.label.toUpperCase()+' '+(autoZap?'ON':'OFF'),'',sd.col);}
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
applyDesign();
function buildLadder(){const L=$('ladder');L.innerHTML='';SHIPS.forEach((sh,i)=>{const d=document.createElement('div'),c=document.createElement('canvas');c.width=c.height=120;
  const g=c.getContext('2d'),k=88/(sh.nose-sh.tail+18);g.translate(60,62);g.rotate(-Math.PI/2);g.scale(k,k);g.translate(-(sh.nose+sh.tail)/2,0);drawShip(g,i,.6,1);
  d.appendChild(c);d.insertAdjacentHTML('beforeend',`<b style="color:${sh.acc}">${sh.name}</b><small>${i?'◉ '+sh.cost.toLocaleString():'START'}</small>`);L.appendChild(d);});}
buildLadder();refreshDzBtns();setInterval(refreshDzBtns,700);
$('dzBtnMenu').addEventListener('click',()=>openDesigner());$('dzBtnPause').addEventListener('click',()=>openDesigner());
$('dzSave').addEventListener('click',()=>closeDesigner(true));$('dzCancel').addEventListener('click',()=>closeDesigner(false));
$('dzShots').addEventListener('input',()=>{dzDraft.shots=+$('dzShots').value;$('dzShotsV').textContent=dzDraft.shots;});
$('dzAutoF').addEventListener('click',()=>{dzDraft.autoFire=!dzDraft.autoFire;buildDz();});$('dzAutoS').addEventListener('click',()=>{dzDraft.autoSpecial=!dzDraft.autoSpecial;buildDz();});
if(best)$('bestTxt').textContent='Best score: '+best.toLocaleString();
for(let i=0;i<7;i++){const t=['rock','ice','iron','emerald','gold','void','rock'][i],a=rand(0,TAU),sp=rand(10,30)*S;asteroids.push(makeAsteroid(t,1+(i%3),rand(0,W),rand(0,H),Math.cos(a)*sp,Math.sin(a)*sp));}
let last=performance.now();
function frame(t){requestAnimationFrame(frame);let dt=(t-last)/1000;last=t;if(dt>.05)dt=.05;if(dt<0)dt=0;
  try{if(cut&&state==='play'){updateCut(dt);if(cut)renderCut();else render();}else{if(state!=='paused')update(dt);render();hud();}}catch(err){console.error(err);if(cut)endCut();}}
requestAnimationFrame(frame);
/* ---------- console test helpers: type sb.help() ---------- */
window.sb={
  help(){console.log('sb.boss("bastion"|"phantom"|"hive"|"mirror"|"leviathan"|"titan")  spawn a boss now\nsb.ship(0-6)  fly ship N (6 = your design)\nsb.coins(n)  set coins\nsb.god(true|false)  invincibility\nsb.hp(0.1)  set boss health to a fraction\nsb.kill()  finish the boss\nsb.wave(n)  jump to wave n\nsb.design()  open the ship designer');return 'ok';},
  boss(name){const i=BOSSES.indexOf(name);if(i<0)return 'Bosses: '+BOSSES.join(', ');if(state!=='play'){initAudio();newGame();}
    asteroids=[];enemies=[];ebullets=[];clearT=-1;boss=null;wave=(i+1)*5;startBoss();return boss.name;},
  ship(n){n=clamp(n|0,0,MAXT);if(state!=='play'){initAudio();newGame();}tier=n;setAcc();refreshDzBtns();if(player)player.hp=SHIPS[n].hp;charge=1;return SHIPS[n].name;},
  coins(n){coins=n|0;saveCoins();checkTier();refreshDzBtns();return coins;},
  god(on=true){window.sbGod=!!on;return 'invincible: '+window.sbGod;},
  hp(f){if(!boss)return 'no boss';boss.hp=boss.max*clamp(f,0.001,1);return boss.hp;},
  kill(){if(!boss)return 'no boss';boss.entering=0;bossDamage(boss.hp+1,boss.x,boss.y);return 'boom';},
  wave(n){if(state!=='play'){initAudio();newGame();}asteroids=[];boss=null;wave=(n|0)-1;startWave();return wave;},
  design(){openDesigner();return 'designer open';},
};
</script>
</body>
</html>
