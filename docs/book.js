import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {chapters,palette as P} from './content.js';
import {createScene} from './scenes.js';
import {FocusLens} from './focus.js';
import {animateInspection} from './inspection-motion.js';
const $=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let current=-1,active,renderer,scene,camera,controls,loaded=false,inspecting=false,value=0,last=performance.now(),elapsed=0,scrollPending=false,lightEffect;
let turning=null,lastWheel=-1000,focusLens,lightPlane,readingScroll=0,objectDrag=null,modeTransition=null,inspectRequested=false,drift=0,driftPauseUntil=0,orbitHeld=false,inspectionMix=0,framingMove=null;
const zoomLevels=new Map();
const raycaster=new T.Raycaster(),pointer=new T.Vector2();
const states=chapters.map(c=>c.id==='fabrication'?1:0),sections=[$('cover')];
chapters.forEach((c,i)=>{const section=document.createElement('section');section.id=c.id;section.className='book-page chapter-page';section.dataset.index=i;section.innerHTML=`<div class="chapter-copy"><div class="chapter-kicker"><span class="index">${String(i+1).padStart(2,'0')}</span><span>${c.kind}</span></div><h1><span class="term-cn">${c.term}</span><em>${c.en}</em></h1><p class="concept">${c.concept}</p><div class="design-block"><span class="design-label">THE DESIGN</span><h2>${c.title}</h2><p class="design-copy">${c.design}</p></div><div class="state-control"><div class="state-caption">SCENARIOS / 状态演示</div><div class="state-buttons" role="group" aria-label="${c.title}的状态">${c.states.map((s,j)=>`<button data-state="${j}" aria-pressed="${j===states[i]}" class="${j===states[i]?'active':''}">${s[0]}</button>`).join('')}</div><p class="state-description" aria-live="polite">${c.states[states[i]][1]}</p></div><div class="chapter-links"><button data-note="${i}">设计手记与建模<span>↗</span></button><a href="https://arendt-lexicon.vercel.app/browser.html?concept=${encodeURIComponent(c.source)}" target="_blank" rel="noopener">概念出处<span>↗</span></a></div></div>`;section.querySelectorAll('[data-state]').forEach(b=>b.onclick=()=>setState(i,Number(b.dataset.state)));section.querySelector('[data-note]').onclick=()=>brief(i);$('book').append(section);sections.push(section);const item=document.createElement('button');item.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span><div><strong>${c.term}</strong><small>${c.title} / ${c.kind}</small></div><i>↗</i>`;item.onclick=()=>{$('contents').close();go(i);};$('contents-list').append(item);});
function setState(i,n){states[i]=n;const s=sections[i+1];s.querySelectorAll('[data-state]').forEach((b,j)=>{b.classList.toggle('active',j===n);b.setAttribute('aria-pressed',String(j===n));});s.querySelector('.state-description').textContent=chapters[i].states[n][1];if(i!==current)activate(i);if(reduced)value=n;}
function go(i,instant=false){i=Math.max(-1,Math.min(9,i));if(inspecting||modeTransition)return exitInspect().then(()=>go(i,instant));if(turning)return;const target=sections[i+1].getBoundingClientRect().top+scrollY;if(instant||reduced||!renderer){window.scrollTo({top:target,behavior:'instant'});activate(i);onScroll();return;}if(i===current&&Math.abs(target-scrollY)<2)return;turning={from:current,to:i,start:performance.now(),fromY:scrollY,toY:target,swapped:false,duration:1050};document.body.classList.add('page-turning');$('page-down').disabled=true;}
function activate(i){sections.forEach((section,n)=>section.classList.toggle('is-current',n===i+1));if(i===current&&active)return;current=i;document.body.classList.toggle('on-cover',i===-1);$('scene-id').textContent=i===-1?'BETWEEN / PROLOGUE':`${String(i+1).padStart(2,'0')} / ${chapters[i].en.toUpperCase()}`;$('scene-title').textContent=i===-1?'有距离的共同运行':chapters[i].title;$('interaction-hint').textContent=i===-1?'拖动环体或小物体 · 松手归位':'拖动旋转 · 滚轮翻页';$('progress-number').textContent=String(i+1).padStart(2,'0');$('page-down').querySelector('span').textContent=i===9?'↑':'↓';$('page-down').setAttribute('aria-label',i===9?'返回封面':'下一页');$('next-label').textContent=i===-1?'向下，进入这本书':i===9?'回到封面':String(i+2).padStart(2,'0')+' / '+chapters[i+1].term;history.replaceState(null,'',i===-1?'#cover':`#${chapters[i].id}`);loadScene();resize();}
function onScroll(){if(turning){const max=document.documentElement.scrollHeight-innerHeight;$('progress-line').style.height=Math.max(1,scrollY/max*100)+'%';scrollPending=false;return;}if(inspecting||modeTransition){scrollPending=false;return;}const mobile=innerWidth<701,probe=mobile?100:innerHeight*.42;let selected=-1;for(let i=0;i<sections.length;i++){const r=sections[i].getBoundingClientRect();if(r.top<=probe&&r.bottom>probe){selected=i-1;break;}}activate(selected);const shift=mobile?Math.min(0,sections[selected+1].getBoundingClientRect().top):0;document.documentElement.style.setProperty('--scene-shift',shift+'px');const max=document.documentElement.scrollHeight-innerHeight;$('progress-line').style.height=`${Math.max(1,scrollY/max*100)}%`;scrollPending=false;}
function loadScene(){if(!loaded)return;if(active){active.dispose?.();scene.remove(active.root);active.root.traverse(o=>{o.geometry?.dispose();if(o.material?.userData.local)o.material.dispose();});}active=createScene(current===-1?'cover':chapters[current].model);scene.add(active.root);value=current===-1?0:states[current];active.update(value,elapsed);resetView(false);}
function resetView(resetZoom=true){
 if(!camera)return;controls.autoRotate=false;drift=0;driftPauseUntil=performance.now()+1200;
 if(current===-1){const radius=Math.hypot(7,10),yaw=Math.atan2(7,10)+Math.PI/9;camera.position.set(Math.sin(yaw)*radius,2.05+radius,Math.cos(yaw)*radius);}else camera.position.set(8,6.5,10);controls.target.set(0,current===-1?2.05:.9,0);
 camera.zoom=resetZoom?1:(zoomLevels.get(current)??1);zoomLevels.set(current,camera.zoom);
 camera.updateProjectionMatrix();controls.update();active?.resetInteraction?.();
}
function resize(){
 if(!renderer)return;const w=innerWidth,h=innerHeight,mobile=w<701,dpr=renderer.getPixelRatio();renderer.setSize(w,h);focusLens?.resize(w,h,dpr);
 // The former inspection maximum is now the shared, default scale in both modes.
 const half=(mobile?4.45/(w/h):Math.max(3.9,5.8/(w/h)))/1.9/(current===2?.72:1);
 camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;
 // Keep the original reading centre, including when zooming or changing modes.
 const x=mobile?0:-w*.195,y=framingY(w,h);
 camera.setViewOffset(w,h,x,y,w,h);camera.updateProjectionMatrix();
}
function framingY(w,h){
 const mobile=w<701,base=mobile?T.MathUtils.lerp(current===-1?-h*.04:h*.25,-h*.02,inspectionMix):h*.005;
 // Give the raised suitcase handle headroom, including the exploded assembly state.
 if(current!==2)return base;
 return base-h*(mobile?.05*(1-inspectionMix):.20);
}
function setInspection(next){
 inspectRequested=next;if(modeTransition)return modeTransition;if(next===inspecting)return Promise.resolve();
 document.body.classList.add('mode-changing');controls.enabled=false;controls.autoRotate=false;drift=0;
 modeTransition=(async()=>{
  try{
   while(inspectRequested!==inspecting){
    const entering=inspectRequested;if(entering)readingScroll=scrollY;
    await animateInspection(sections[current+1],entering,()=>{
     inspecting=entering;document.body.classList.toggle('inspect',entering);controls.enableZoom=entering;
     if(reduced){inspectionMix=entering?1:0;if(innerWidth<701&&camera.view){camera.view.offsetY=framingY(innerWidth,innerHeight);camera.updateProjectionMatrix();}}else framingMove={from:inspectionMix,to:entering?1:0,start:performance.now()};
     if(!entering)window.scrollTo({top:readingScroll,behavior:'instant'});
    },reduced);
   }
  }finally{
   modeTransition=null;document.body.classList.remove('mode-changing');controls.enabled=true;
   driftPauseUntil=performance.now()+1200;
   $(inspecting?'exit-inspect':'inspect-button').focus({preventScroll:true});onScroll();
  }
 })();return modeTransition;
}
function enterInspect(){if(!loaded||turning)return;return setInspection(true);}
function exitInspect(){return setInspection(false);}
function makeLight(){
 const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uStrength:{value:.45},uPhase:{value:0}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:`varying vec2 vUv;uniform float uTime,uStrength,uPhase;
 float band(float x,float center,float w){return exp(-pow((x-center)*w,2.));}
 void main(){vec2 p=vUv-.5;float a=uPhase*.48;mat2 r=mat2(cos(a),-sin(a),sin(a),cos(a));p=r*p;p.x*=1.+.12*sin(uPhase);p.y*=2.1+.30*cos(uPhase*.7);float angle=atan(p.y,p.x);float q=length(p)+.026*sin(angle*4.+uPhase)+.008*sin(angle*9.-uTime*.3);float b=band(q,.332,125.);float red=band(q,.366,125.);float g=band(q,.349,145.);float bloom=band(q,.35,11.)*.23;float fleck=band(q,.30+.025*sin(angle*3.+uPhase),35.)*.2;vec3 color=vec3(.82*red+.05*b,.72*g+.13*b,.95*b+.18*red);float alpha=(max(red,max(g,b))*.65+bloom+fleck)*uStrength;gl_FragColor=vec4(color+.12,alpha);}`});
 lightPlane=new T.Mesh(new T.PlaneGeometry(6.7,5.3),mat);lightPlane.rotation.x=-Math.PI/2;lightPlane.rotation.z=.28;lightPlane.position.set(.35,-.171,.75);scene.add(lightPlane);return mat;
}
function init(){try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;$('stage').append(renderer.domElement);scene=new T.Scene();scene.background=new T.Color(P.paper);scene.fog=new T.Fog(P.paper,25,55);camera=new T.OrthographicCamera(-8,8,5,-5,.1,80);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;controls.minZoom=.38;controls.maxZoom=2.6;controls.minPolarAngle=.25;controls.maxPolarAngle=1.4;controls.enabled=true;controls.enableZoom=false;controls.rotateSpeed=.65;
 controls.addEventListener('change',()=>{zoomLevels.set(current,camera.zoom);$('stage').setAttribute('aria-label',`三维产品场景，缩放 ${Math.round(camera.zoom*100)}%。可直接拖动旋转，观察模式下可缩放。`);});
 controls.addEventListener('start',()=>{orbitHeld=true;controls.autoRotate=false;drift=0;});
 controls.addEventListener('end',()=>{orbitHeld=false;driftPauseUntil=performance.now()+1600;});const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=.40;room.dispose();pmrem.dispose();scene.add(new T.HemisphereLight('#ffffff','#a9b2c2',.55));const key=new T.DirectionalLight('#ffffff',3.0);key.position.set(-3,9,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:24});key.shadow.normalBias=.025;key.shadow.bias=-.00015;key.shadow.radius=4;scene.add(key);const fill=new T.DirectionalLight('#d5dfff',.45);fill.position.set(6,4,-5);scene.add(fill);const floor=new T.Mesh(new T.PlaneGeometry(150,150),new T.MeshStandardMaterial({color:P.paper,roughness:.65}));floor.rotation.x=-Math.PI/2;floor.position.y=-.19;floor.receiveShadow=true;scene.add(floor);lightEffect=makeLight();focusLens=new FocusLens(renderer);bindObjectDrag();loaded=true;$('loading').hidden=true;loadScene();resize();renderer.setAnimationLoop(frame);}catch(e){console.error(e);$('loading').hidden=true;$('webgl-error').hidden=false;}}
function turnFrame(now){if(!turning)return;const t=Math.min(1,(now-turning.start)/turning.duration),ease=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;window.scrollTo({top:turning.fromY+(turning.toY-turning.fromY)*ease,behavior:'instant'});if(t>=.47&&!turning.swapped){activate(turning.to);turning.swapped=true;}const local=turning.swapped?Math.min(1,(t-.47)/.53):Math.min(1,t/.47),smooth=local*local*(3-2*local),alpha=turning.swapped?smooth:1-smooth;if(renderer)renderer.domElement.style.opacity=alpha;document.querySelector('.scene-hud').style.opacity=alpha;if(active){active.root.position.y=turning.swapped?-.40*(1-smooth):-.22*smooth;active.root.scale.setScalar(turning.swapped?.94+.06*smooth:1-.06*smooth);}if(t>=1){turning=null;document.body.classList.remove('page-turning');$('page-down').disabled=false;if(renderer)renderer.domElement.style.opacity=1;document.querySelector('.scene-hud').style.opacity=1;if(active){active.root.position.y=0;active.root.scale.setScalar(1);}onScroll();}}
function frame(now){
 turnFrame(now);
 if(framingMove){const t=Math.min(1,(now-framingMove.start)/760),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;inspectionMix=T.MathUtils.lerp(framingMove.from,framingMove.to,e);if(innerWidth<701&&camera.view){camera.view.offsetY=framingY(innerWidth,innerHeight);camera.updateProjectionMatrix();}if(t===1)framingMove=null;}
 const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;if(!reduced)elapsed+=dt;
 const target=current===-1?0:states[current];value=T.MathUtils.damp(value,target,5,dt);if(Math.abs(value-target)<.001)value=target;
 active?.update(value,elapsed);

 const canDrift=!reduced&&!inspecting&&!modeTransition&&!turning&&!objectDrag&&!orbitHeld&&!document.querySelector('dialog[open]')&&now>driftPauseUntil;
 drift=T.MathUtils.damp(drift,canDrift?1:0,2.2,dt);controls.autoRotate=canDrift&&drift>.001;controls.autoRotateSpeed=.18*drift;controls.update(dt);active?.updateReflection?.(renderer,scene,elapsed);
 lightEffect.uniforms.uTime.value=elapsed;lightEffect.uniforms.uStrength.value=current===-1?1.05:.60;
 lightEffect.uniforms.uPhase.value=(active?.lightPhase??elapsed*.07)+controls.getAzimuthalAngle()*.65+value*.22;
 lightPlane.position.y=current===-1?-.171:.093;
 const focal=active?.focusPoint?.clone()??new T.Vector3(0,current===2?1.95:1.1,0);if(active)focal.applyMatrix4(active.root.matrixWorld);
 focusLens.render(scene,camera,focal,inspecting);
}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600);}
function brief(i){const c=chapters[i];$('brief-kicker').textContent='DESIGN NOTES / '+c.en.toUpperCase();$('brief-content').innerHTML=`<p class="eyebrow">${c.kind}</p><h2>${c.title}</h2><h3>从一个问题出发</h3><p>${c.question}</p><h3>设计如何运作</h3><p>${c.design}</p><h3>哲学与设计之间</h3><p class="note">${c.note}</p><h3>尺度与材料</h3><p>${c.spec}<br>${c.materials}</p><h3>人如何参与</h3><p>${c.system}</p><div class="brief-actions"><a href="dossier.html#${c.id}" target="_blank">提案与三视图 ↗</a><button id="export-model">导出当前模型 ↓</button></div><p class="fine-print">这是可继续深化的设计原型，尺寸为概念起点，不是投产工程文件。</p>`;$('brief').showModal();$('export-model').onclick=async()=>{toast('正在整理模型…');try{if(current!==i)activate(i);const {GLTFExporter}=await import('./vendor/GLTFExporter.js');const out=await new GLTFExporter().parseAsync(active.root,{binary:true});const url=URL.createObjectURL(new Blob([out],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download=`BETWEEN-${c.id}-state-${states[i]+1}.glb`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('模型已导出');}catch(e){console.error(e);toast('导出未完成，请重试');}};}
$('start').onclick=()=>go(0);$('page-down').onclick=()=>go(current===9?-1:current+1);$('contents-button').onclick=()=>$('contents').showModal();$('inspect-button').onclick=enterInspect;$('exit-inspect').onclick=exitInspect;$('reset-view').onclick=()=>resetView();document.querySelector('.brand').onclick=e=>{e.preventDefault();go(-1);};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());document.querySelectorAll('dialog').forEach(d=>d.onclick=e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
function bindObjectDrag(){
 const el=renderer.domElement;
 const hit=e=>{const rect=el.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(active?.dragTargets??[],false)[0];};
 el.addEventListener('pointerdown',e=>{if(e.button!==0||turning||modeTransition||current!==-1)return;const intersection=hit(e);if(!intersection)return;
   e.stopImmediatePropagation();objectDrag={id:e.pointerId,key:intersection.object.userData.interactionKey,x:e.clientX,y:e.clientY};
   controls.enabled=false;active.beginInteraction(objectDrag.key);el.setPointerCapture(e.pointerId);document.body.classList.add('object-dragging');
   $('interaction-hint').textContent=objectDrag.key==='axis'?'轴向偏转 · 松手归位':'沿固定轨道移动 · 松手归位';
 },true);
 el.addEventListener('pointermove',e=>{if(objectDrag){e.stopImmediatePropagation();active.dragInteraction(objectDrag.key,e.clientX-objectDrag.x,e.clientY-objectDrag.y);return;}if(current===-1)el.style.cursor=hit(e)?'grab':'grab';},true);
 const finish=e=>{if(!objectDrag)return;e.stopImmediatePropagation();active?.releaseInteraction?.();if(reduced)active?.resetInteraction?.();if(el.hasPointerCapture(objectDrag.id))el.releasePointerCapture(objectDrag.id);objectDrag=null;controls.enabled=true;document.body.classList.remove('object-dragging');$('interaction-hint').textContent='拖动环体或小物体 · 松手归位';};
 el.addEventListener('pointerup',finish,true);el.addEventListener('pointercancel',finish,true);
}
window.addEventListener('wheel',e=>{if(modeTransition){e.preventDefault();return;}if(inspecting||document.querySelector('dialog[open]')||e.ctrlKey||!e.deltaY)return;e.preventDefault();const now=performance.now(),quiet=now-lastWheel;lastWheel=now;if(turning||quiet<150)return;go(current+(e.deltaY>0?1:-1));},{passive:false});
window.addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(onScroll);}}, {passive:true});window.addEventListener('resize',()=>{resize();if(!inspecting&&!modeTransition&&!turning)window.scrollTo({top:sections[current+1].offsetTop,behavior:'instant'});onScroll();});window.addEventListener('keydown',e=>{if(e.key==='Escape'&&(inspecting||modeTransition))exitInspect();if(modeTransition)return;if(document.querySelector('dialog[open]')||inspecting||/INPUT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='PageDown'||e.key==='ArrowDown'){e.preventDefault();go(Math.min(9,current+1));}if(e.key==='PageUp'||e.key==='ArrowUp'){e.preventDefault();go(Math.max(-1,current-1));}});window.addEventListener('hashchange',()=>{const id=location.hash.slice(1).split('/')[0];go(chapters.findIndex(c=>c.id===id),true);});
const initialId=location.hash.slice(1).split('/')[0],initial=chapters.findIndex(c=>c.id===initialId);document.body.classList.add('on-cover');init();requestAnimationFrame(()=>{go(initial,true);onScroll();});
