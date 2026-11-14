import {assetURL,preparedImage} from './resource-cache.js';
import {setMusic,syncPrologue,musicReadyIn} from './music.js';
import * as T from 'three';
import {faces} from './reading-round.js';
import {identityPortraits} from './identity-card.js';
import {prologueMedia} from './prologue-media.js';

let musicStartAt=0,waitingForMusic=false,stalledFor=0,lastVideoTime=-1;
let host,renderer,scene,camera,tower,portraits=[],keyLight,beam,star,halos,clock=0,last=0,raf=0,active=false,paused=false,done,segment=-1,total=0,segments=[],videoErrored=false;
const $=id=>document.getElementById(id),reduce=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mount(){
 if(host)return;
 host=document.createElement('section');host.id='prologue';host.hidden=true;
 host.setAttribute('aria-label','灯塔、飞鸟与王座的游戏 · 视频序章');
 host.innerHTML=`<button id="prologue-skip" aria-label="跳过序章">跳过 ↗</button><div class="prologue-screen"><div id="prologue-render"></div><video id="prologue-video" playsinline muted preload="auto" disablepictureinpicture disableremoteplayback hidden></video><div class="prologue-vignette"></div><div id="prologue-words" aria-live="polite"></div><div class="prologue-caption"><p id="prologue-cn"></p><p id="prologue-en"></p></div><span id="prologue-role"></span></div>`;
 document.body.append(host);$('prologue-skip').onclick=finish;
 const video=$('prologue-video');video.muted=true;
 video.onended=()=>{if(active&&segments[segment]?.kind==='video'){clock=segments[segment].end;segment=-1;}};
 video.onerror=()=>{if(active){videoErrored=true;clock=segments[segment]?.end||clock;segment=-1;}};
 document.addEventListener('visibilitychange',()=>{if(!active)return;paused=document.hidden;last=performance.now();if(paused)video.pause();else if(!video.hidden&&!waitingForMusic)playVideo();});
 document.addEventListener('keydown',e=>{if(active&&e.key==='Escape')finish();});
 window.addEventListener('resize',resize);
}
function buildTimeline(){
 let offset=0;
 const opening=prologueMedia.opening?.src?{kind:'video',...prologueMedia.opening}:{kind:'tower',duration:8};
 const footage=prologueMedia.montage?.src?[{kind:'video',...prologueMedia.montage}]:[opening,...prologueMedia.events.filter(e=>e.src).map(e=>({kind:'video',...e}))];
 segments=[...footage,...faces.map((face,portraitIndex)=>({kind:'portrait',duration:2.8,face,portraitIndex,cn:face.name,en:face.en})),
  {kind:'words',duration:3.4,cn:'星星已经降临。',en:'The star has arrived.'},
  {kind:'words',duration:3.8,cn:'先静默感受，再辨认表象背后的问题。',en:'First observe. Then question what lies beneath.'},
  {kind:'words',duration:3.8,cn:'带着你的判断，走向真理的王座。',en:'Carry your judgment toward the throne of truth.'}
 ].map(s=>({...s,start:offset,end:offset+=s.duration}));total=offset;
}
function buildScene(){if(renderer)return;
 try{
 renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(1.5,devicePixelRatio));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.75;$('prologue-render').append(renderer.domElement);
 scene=new T.Scene();scene.background=new T.Color('#000000');scene.fog=new T.FogExp2('#000000',.025);camera=new T.PerspectiveCamera(30,3,.1,100);scene.add(new T.AmbientLight('#93a8ff',.12));
 keyLight=new T.SpotLight('#dae7ff',45,25,.39,.65,1.5);keyLight.position.set(-3,5,5);keyLight.target.position.set(0,1,0);scene.add(keyLight,keyLight.target);
 const rim=new T.DirectionalLight('#253ee8',1.2);rim.position.set(-4,3,-4);scene.add(rim);
 const white=new T.MeshStandardMaterial({color:'#f0f3ff',roughness:.42,metalness:.17}),ink=new T.MeshStandardMaterial({color:'#15287b',roughness:.34,metalness:.4});
 const mesh=(parent,geo,material,x,y,z)=>{const m=new T.Mesh(geo,material);m.position.set(x,y,z);parent.add(m);return m;};
 tower=new T.Group();scene.add(tower);mesh(tower,new T.CylinderGeometry(.28,.6,3.4,48),white,0,1.7,0);for(let i=0;i<4;i++)mesh(tower,new T.TorusGeometry(.6-i*.08,.018,8,48),ink,0,.2+i*.8,0).rotation.x=Math.PI/2;
 mesh(tower,new T.CylinderGeometry(.55,.55,.1,48),white,0,3.43,0);mesh(tower,new T.CylinderGeometry(.39,.39,.58,48),new T.MeshPhysicalMaterial({color:'#9fcaff',transparent:true,opacity:.3,roughness:.1,metalness:.1}),0,3.78,0);mesh(tower,new T.ConeGeometry(.61,.35,48),white,0,4.2,0);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;mesh(tower,new T.CylinderGeometry(.017,.017,.58,8),white,Math.cos(a)*.4,3.78,Math.sin(a)*.4);}
 mesh(tower,new T.CylinderGeometry(1.1,1.3,.14,64),ink,0,-.06,0);
 const shape=new T.Shape();shape.moveTo(0,.55);shape.bezierCurveTo(.04,.1,.1,.04,.55,0);shape.bezierCurveTo(.1,-.04,.04,-.1,0,-.55);shape.bezierCurveTo(-.04,-.1,-.1,-.04,-.55,0);shape.bezierCurveTo(-.1,.04,-.04,.1,0,.55);
 star=mesh(tower,new T.ShapeGeometry(shape),new T.MeshBasicMaterial({color:'#e7eeff',side:T.DoubleSide}),0,7,.1);
 halos=new T.Group();halos.position.set(0,4.2,0);tower.add(halos);for(let i=0;i<3;i++){const m=new T.MeshBasicMaterial({color:i===0?'#fff':'#8296ff',transparent:true,opacity:.5,side:T.DoubleSide,blending:T.AdditiveBlending,depthWrite:false});const h=mesh(halos,new T.RingGeometry(.3+i*.17,.31+i*.17,96),m,0,0,0);h.rotation.x=.5;}
 beam=mesh(tower,new T.ConeGeometry(1.2,7,64,1,true),new T.MeshBasicMaterial({color:'#b6c8ff',transparent:true,opacity:.10,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending}),3.5,3.8,0);beam.rotation.z=Math.PI/2;
 const loader=new T.TextureLoader();portraits=faces.map(face=>{const picture=preparedImage(identityPortraits[face.id]),map=picture?new T.Texture(picture):loader.load(identityPortraits[face.id]);if(picture)map.needsUpdate=true;map.colorSpace=T.SRGBColorSpace;const m=mesh(scene,new T.PlaneGeometry(3.5,5.1),new T.MeshStandardMaterial({map,transparent:true,alphaTest:.035,roughness:.7,metalness:.07,side:T.DoubleSide}),0,1,0);m.visible=false;return m;});resize();
 }catch{$('prologue-render').innerHTML='<div class="prologue-static-light"></div>';renderer=null;}
}
function resize(){if(!renderer||!active)return;const r=$('prologue-render').getBoundingClientRect();if(r.width&&r.height){renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}}
function playVideo(){
 const v=$('prologue-video'),source=v.src;
 v.play().catch(error=>{if(error.name!=='AbortError'&&active&&!v.hidden&&v.src===source){videoErrored=true;clock=segments[segment]?.end||clock;segment=-1;}});
}
function setSegment(){
 const index=segments.findIndex(s=>clock>=s.start&&clock<s.end);
 if(index===segment||index<0)return;
 segment=index;const s=segments[index],v=$('prologue-video');videoErrored=false;stalledFor=0;lastVideoTime=-1;v.pause();v.hidden=true;
 $('prologue-cn').textContent=s.kind==='portrait'?s.cn:'';
 $('prologue-en').textContent=s.kind==='portrait'?s.en:'';
 $('prologue-role').textContent=s.kind==='portrait'?s.face.concept:'';
 $('prologue-words').innerHTML=s.kind==='words'?`<p>${safe(s.cn)}<small>${safe(s.en)}</small></p>`:'';
 host.dataset.shot=s.kind;host.dataset.scene=s.label||s.cn||'';
 if(s.kind==='video'){v.poster=s.poster||'';const url=assetURL(s.src);if(v.src!==url)v.src=url;else v.currentTime=0;v.setAttribute('aria-label',s.label||'AI 时代的片刻');v.hidden=false;v.muted=true;if(!paused&&!waitingForMusic)playVideo();}
 resize();
}
const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
function frame(now){
 if(!active)return;
 const wallDelta=Math.max(0,(now-last)/1000||0),dt=Math.min(.08,wallDelta);last=now;
 if(waitingForMusic&&now>=musicStartAt){waitingForMusic=false;if(!paused&&!$('prologue-video').hidden)playVideo();}
 if(!paused&&!waitingForMusic){const s=segments[segment],v=$('prologue-video');
  if(s?.kind==='video'&&!videoErrored){
   if(v.ended)clock=s.end;
   else if(v.readyState>=2&&!v.seeking)clock=s.start+Math.min(s.duration,v.currentTime);
   stalledFor=v.currentTime>lastVideoTime+.01?0:stalledFor+wallDelta;lastVideoTime=v.currentTime;
   // An unavailable stream cannot trap the visitor on a black frame.
   if(stalledFor>12){v.pause();videoErrored=true;clock=s.end;}
  }
  else clock+=dt;
 }
 if(clock>=total){finish();return;}
 setSegment();const s=segments[segment];syncPrologue(clock,!paused&&!waitingForMusic&&(s?.kind!=='video'||(!$('prologue-video').paused&&$('prologue-video').readyState>=3&&!$('prologue-video').seeking)));if(!s){raf=requestAnimationFrame(frame);return;}
 const elapsed=clock-s.start,u=elapsed/s.duration;
 // All scenes meet at black, with a short settled pause before the next image.
 const loading=s.kind==='video'&&$('prologue-video').readyState<2&&elapsed===0;
 const opacity=loading?0:s.bakedFades?1:Math.min(smooth(elapsed/.6),smooth((s.duration-elapsed-.08)/.6));
 host.querySelector('.prologue-screen').style.opacity=opacity;
 if(renderer){
  tower.visible=s.kind==='tower';portraits.forEach((p,i)=>p.visible=s.kind==='portrait'&&i===s.portraitIndex);
  if(s.kind==='tower'){const fall=T.MathUtils.smoothstep(u,0,.30);star.position.y=T.MathUtils.lerp(7.7,4.3,fall);star.scale.setScalar(u<.34?.25:.25+(u-.34)*.6);star.rotation.z=reduce()?0:Math.max(0,u-.34)*1.8;halos.visible=u>.32;halos.scale.setScalar(1+Math.max(0,u-.32)*9);halos.children.forEach(h=>h.material.opacity=Math.max(0,.7-(u-.32)));beam.visible=u>.33;beam.rotation.y=reduce()?0:(u-.33)*1.6;keyLight.intensity=u<.3?4:24;keyLight.position.set(-3,5,5);keyLight.target.position.set(0,2,0);camera.position.set(4.6-u*1.1,3.7,10-u*.8);camera.lookAt(0,2.2,0);}
  else if(s.kind==='portrait'){const p=portraits[s.portraitIndex];p.rotation.y=reduce()?0:(u-.5)*.14;keyLight.intensity=70;keyLight.position.set(-4+u*8,3,5);keyLight.target.position.set(-.6+u*1.2,1.7,0);camera.position.set(.55-u*.7,1.95+u*.2,7.5-u*.7);camera.lookAt(0,1.8,0);}
  if(s.kind!=='video')renderer.render(scene,camera);
 }
 raf=requestAnimationFrame(frame);
}
function finish(){if(!active)return;setMusic('ambient',{fade:3,out:1.8});active=false;cancelAnimationFrame(raf);$('prologue-video').pause();done?.();}
export function enterPrologue(onDone){
 mount();setMusic('prologue',{fade:.3,out:1.3});musicStartAt=document.documentElement.classList.contains('site-booting')?Infinity:performance.now()+musicReadyIn()*1000;waitingForMusic=true;done=onDone;active=true;paused=document.hidden;clock=0;segment=-1;last=performance.now();host.hidden=false;
 host.querySelector('.prologue-screen').style.opacity=0;document.body.classList.add('prologue-page');
 buildTimeline();buildScene();setSegment();resize();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
}
export function leavePrologue(){if(!host)return;active=false;cancelAnimationFrame(raf);$('prologue-video').pause();host.hidden=true;document.body.classList.remove('prologue-page');}

window.addEventListener('site-ready',()=>{if(active){musicStartAt=performance.now()+musicReadyIn()*1000;last=performance.now();}});
export async function preparePrologue(){
 mount();buildTimeline();buildScene();
 if(renderer){renderer.setSize(48,16);tower.visible=false;for(const portrait of portraits){portrait.visible=true;renderer.initTexture(portrait.material.map);}await renderer.compileAsync(scene,camera);renderer.render(scene,camera);portraits.forEach(p=>p.visible=false);}
 const v=$('prologue-video');v.src=assetURL(prologueMedia.montage.src);v.preload='auto';v.load();
 if(v.readyState<3)await new Promise((resolve,reject)=>{const timer=setTimeout(()=>done(Error('Video preparation timed out')),20000);const ready=()=>done(),error=()=>done(Error('Video unavailable'));function done(e){clearTimeout(timer);v.removeEventListener('canplay',ready);v.removeEventListener('error',error);e?reject(e):resolve();}v.addEventListener('canplay',ready,{once:true});v.addEventListener('error',error,{once:true});});
}
