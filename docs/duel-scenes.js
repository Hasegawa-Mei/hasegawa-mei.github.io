import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {box,cyl,sphere,torus,rod,group} from './scenes.js';
import {prepareStudy,placeAsset} from './model-library.js';

function materials(){return {white:new T.MeshStandardMaterial({color:'#ffffff',roughness:.32}),blue:new T.MeshStandardMaterial({color:'#233eee',roughness:.23,metalness:.18}),grey:new T.MeshStandardMaterial({color:'#b9c4d7',roughness:.4,metalness:.35}),dark:new T.MeshStandardMaterial({color:'#293450',roughness:.5}),gold:new T.MeshStandardMaterial({color:'#e6db9f',roughness:.48}),glass:new T.MeshPhysicalMaterial({color:'#f1f6ff',transmission:.92,roughness:.055,thickness:.23,ior:1.49,dispersion:.4,envMapIntensity:1.7})};}
function words(root,str,x,y,z,w=1.2,h=.2){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=Math.round(512*h/w);const c=canvas.getContext('2d');c.font=`600 ${canvas.height*.72}px Microsoft YaHei`;c.textAlign='center';c.textBaseline='middle';c.fillStyle='#213dd8';c.fillText(str,256,canvas.height/2,480);const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;const mat=new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:T.DoubleSide});const mesh=new T.Mesh(new T.PlaneGeometry(w,h),mat);mesh.position.set(x,y,z);mesh.layers.set(30);root.add(mesh);return mesh;}
function person(p,x,z,m,s=.68){const g=group(p,x,.13,z),asset=placeAsset(g,'FIG_STAND',0,0,0,s);if(asset)asset.traverse(n=>{if(n.isMesh){n.material=m.white;n.castShadow=true;}});else{sphere(g,.13,0,1,0,m.white);box(g,.25,.50,.17,0,.64,0,m.white,.06);for(const side of [-1,1])rod(g,[side*.07,.48,0],[side*.08,.05,0],.04,m.white);}return g;}
function cable(p,points,m,r=.016){const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v)));const mesh=new T.Mesh(new T.TubeGeometry(curve,40,r,7,false),m);p.add(mesh);return mesh;}
function desk(p,x,z,m,w=1.4){const g=group(p,x,0,z);box(g,w,.1,.8,0,.85,0,m.white);for(const sign of [-1,1])box(g,.06,.68,.6,sign*(w/2-.15),.46,0,m.grey);return g;}
function panel(p,x,y,z,m,w=1.3,h=1){const g=group(p,x,y,z);box(g,w,h,.08,0,0,0,m.glass,.035);for(const sign of [-1,1])box(g,.025,h,.10,sign*w/2,0,0,m.blue,.005);return g;}
export function dispose(root){const mats=new Set();root.traverse(o=>{o.skeleton?.dispose();if(!o.geometry?.userData.libraryAsset)o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)mats.add(m);});mats.forEach(m=>{m.map?.dispose();m.dispose();});}
export function makeScene(info,arena=false){const root=group(),m=materials();if(!arena){box(root,6,.16,3.8,0,.02,0,m.white,.07);box(root,5.7,.015,.035,0,.11,1.73,m.blue,.005);}let animate=()=>{};
 if(info.kind==='signal'){
  const sources=[];for(const side of [-1,1]){const d=desk(root,side*2,0,m);const screen=panel(d,0,1.45,0,m,1.05,.85);sources.push(screen);person(root,side*2,-.85,m);for(let i=0;i<5;i++)box(screen,.035,.12+(i%3)*.12,.02,-.35+i*.175,0,.06,m.blue,.005);}
  const rings=[];for(let i=0;i<4;i++){const r=torus(root,.3+i*.11,.018,0,1.2,0,i===0?m.glass:m.blue,0);rings.push(r);}
  const switcher=box(root,.75,.3,.6,0,.3,1,m.glass,.05);words(root,info.variant?'被听懂了吗？':'谁在发声？',0,2.02,.05,1.7,.24);const check=words(root,'保留核实与回应',0,.5,1.33,1.7,.19);check.visible=false;
  animate=(t,k)=>{rings.forEach((r,i)=>{r.scale.setScalar(1+Math.sin(t*1.3-i)*.07);r.rotation.y=k*.4;});switcher.rotation.y=k*.6;check.visible=k>.8;sources[1].rotation.y=-k*.35;};
 }else if(info.kind==='council'){
  cyl(root,1.14,.10,0,.9,0,m.white);cyl(root,.28,.73,0,.5,0,m.glass);const guests=[],proxies=[];
  for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.cos(a)*1.8,z=Math.sin(a)*1.22;const chair=group(root,x,0,z);chair.rotation.y=-a+Math.PI/2;box(chair,.52,.08,.49,0,.53,0,m.white);box(chair,.52,.60,.07,0,.83,-.22,m.white);for(const j of [-1,1])box(chair,.04,.38,.4,j*.20,.3,0,m.grey);const g=person(root,x*1.24,z*1.24,m,.63);g.rotation.y=-a-Math.PI/2;guests.push(g);const proxy=panel(root,x,.98,z,m,.4,.5);proxies.push(proxy);}
  const gem=sphere(root,.30,0,1.27,0,m.glass);torus(root,.43,.018,0,1.27,0,m.blue,0);words(root,info.variant?'共同维持一条线路':'偏好 ≠ 发言',0,2.15,0,2.2,.23);
  animate=(t,k)=>{proxies.forEach(g=>{g.scale.y=1-k*.95;});guests.forEach(g=>g.scale.setScalar(.02+k*.98));gem.rotation.y=t*.2;};
 }else if(info.kind==='archive'){
  for(const x of [-2.15,2.15]){box(root,1.13,2.35,.44,x,1.3,-.5,m.white);for(let row=0;row<3;row++){box(root,1.1,.04,.46,x,.5+row*.64,-.45,m.grey);for(let i=0;i<5;i++)box(root,.11,.44,.28,x-.42+i*.2,.74+row*.64,-.37,i%3===0?m.glass:m.white,.01);}}
  const d=desk(root,0,.4,m,1.8),pages=[];for(let i=0;i<3;i++){const p=group(root,(i-1)*.5,1.3+i*.25,.15);box(p,.9,1.05,.035,0,0,0,i===1?m.glass:m.white,.012);for(let j=0;j<5;j++)box(p,.55-(j%2)*.13,.018,.015,0,.30-j*.13,.03,i===1?m.gold:m.blue,.003);pages.push(p);}
  words(root,info.variant?'不同的证词':'原件 / 推测 / 来源',0,2.7,.1,2.1,.22);
  animate=(t,k)=>{pages.forEach((p,i)=>{p.position.x=(i-1)*(.5+k*.32);p.rotation.y=(i-1)*(.15+k*.15);p.position.y=1.32+i*.25+Math.sin(t*.8+i)*.018;});};
 }else if(info.kind==='robot'){
  const robot=group(root,1.35,0,.1);box(robot,1,.45,.8,0,.52,0,m.glass,.08);for(const x of [-.43,.43])for(const z of [-.30,.30]){const wheel=cyl(robot,.14,.08,x,.28,z,m.dark);wheel.rotation.z=Math.PI/2;}
  box(robot,.7,.07,.54,0,.78,0,m.white);const arm=group(robot,-.34,.76,0);rod(arm,[0,0,0],[-.48,.34,0],.08,m.white);rod(arm,[-.48,.34,0],[-.95,.13,0],.055,m.grey);box(arm,.06,.4,.5,-1,.02,0,m.blue,.01);
  const stuff=group(root,-1.4,0,.3);for(let i=0;i<3;i++)box(stuff,.55,.35+i*.12,.55,(i-1)*.48,.32+i*.06,0,m.white,.05);person(root,-2.05,-.65,m,.8);person(root,2.1,-1.1,m,.65);
  const barrier=panel(root,0,.85,.1,m,.07,1.4);barrier.rotation.y=Math.PI/2;words(root,info.variant?'风险分数 ≠ 决定':'移除谁的物品？',0,2.1,.1,2.5,.23);
  animate=(t,k)=>{robot.position.x=1.2+k*.55;arm.rotation.z=-k*.65;barrier.scale.y=.02+k*.98;};
 }else if(info.kind==='threshold'){
  for(const x of [-.9,.9])box(root,.17,2.5,.4,x,1.37,0,m.white);box(root,1.97,.17,.4,0,2.6,0,m.white);const glass=panel(root,0,1.35,0,m,1.6,2.25);const scan=torus(root,.47,.025,0,1.45,.09,m.blue,0);
  person(root,-2.05,.6,m,.84);const ghost=person(root,.15,-.7,m,.86);ghost.traverse(n=>{if(n.isMesh)n.material=m.glass;});
  const alternate=box(root,1.2,.035,.70,1.7,.15,.7,m.blue,.025);const valve=group(root,1.7,0,-.6);cyl(valve,.23,.85,0,.6,0,m.white);sphere(valve,.14,0,1.14,0,m.glass);
  words(root,info.variant?'可以拒绝吗？':'谁能替他同意？',0,3,.1,2.25,.23);
  animate=(t,k)=>{scan.scale.setScalar(1-k*.28);glass.rotation.y=k*.48;alternate.scale.x=.03+k*.97;ghost.position.x=k*.35;};
 }else if(info.kind==='paths'){
  person(root,0,1.05,m,.83);const gates=[],routes=[];
  for(let i=0;i<3;i++){const x=(i-1)*2;const g=panel(root,x,1.2,-.75,m,1.2,1.8);gates.push(g);routes.push(cable(root,[[0,.14,1.2],[x*.55,.14,.35],[x,.14,-.5]],i===1?m.blue:m.grey));box(g,1.1,.13,.08,0,.15,.06,m.white);}
  const forecast=sphere(root,.3,0,2.7,-.4,m.glass);words(root,'还有新的开端吗？',0,3.2,0,2.6,.22);
  animate=(t,k)=>{gates.forEach((g,i)=>g.rotation.y=(i-1)*k*.5);routes.forEach(r=>r.material=k>.5?m.blue:m.grey);forecast.position.y=2.7+Math.sin(t*.7)*.035;};
 }else{
  const panels=[];for(let i=0;i<3;i++){const x=(i-1)*1.9,g=panel(root,x,1.58,-.2,m,1.55,2.15);panels.push(g);cyl(g,.23,.07,0,.42,.08,m.blue).rotation.x=Math.PI/2;box(g,.85,.06,.03,0,-.1,.07,m.blue);box(g,.85,.06,.03,0,-.3,.07,m.blue);person(root,x,.9,m,.67);}
  words(root,'同样的内容，不同的人',0,2.95,0,3,.22);
  animate=(t,k)=>{panels.forEach((g,i)=>{g.rotation.y=(i-1)*k*.32;g.children[3].scale.x=1-k*i*.21;g.children[4].position.y=-.1-k*(i-1)*.22;});};
 }
 return {root,animate};
}

export class DuelScene {
 async mount(host){if(this.host!==host){this.resizeObserver?.disconnect();this.host=host;if(this.renderer)host.append(this.renderer.domElement);this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);}if(this.renderer){this.resize();return;}
  await prepareStudy('boundary');if(!host.isConnected)return;
  try{this.renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.95;host.append(this.renderer.domElement);
   this.scene=new T.Scene();const env=new RoomEnvironment(),pm=new T.PMREMGenerator(this.renderer);this.environment=pm.fromScene(env,.04);this.scene.environment=this.environment.texture;env.dispose();pm.dispose();this.scene.add(new T.HemisphereLight('#f6f8ff','#6a7793',2.2));const sun=new T.DirectionalLight('#fff',3.5);sun.position.set(-4,8,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7});sun.shadow.bias=-.0005;this.scene.add(sun);
   const floor=new T.Mesh(new T.PlaneGeometry(30,30),new T.ShadowMaterial({opacity:.13}));floor.rotation.x=-Math.PI/2;floor.position.y=-.08;floor.receiveShadow=true;this.scene.add(floor);
   this.camera=new T.OrthographicCamera(-5,5,3,-3,.1,80);this.camera.position.set(4.6,4.2,9);this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(0,1.25,0);this.controls.enablePan=false;this.controls.enableZoom=false;this.controls.enableDamping=true;this.controls.minPolarAngle=.5;this.controls.maxPolarAngle=Math.PI*.49;this.controls.update();this.resize();
   this.running=true;this.renderer.setAnimationLoop(t=>{if(!this.running||!this.host?.isConnected)return;this.amount=T.MathUtils.damp(this.amount||0,this.success?1:0,4,.016);this.model?.animate(t/1000,this.amount);this.controls.update();this.renderer.render(this.scene,this.camera);});if(this.pending)this.show(...this.pending);
  }catch{host.innerHTML='<p class="arena-fallback">模型暂时无法显示；你仍可阅读情境并继续对局。</p>';}}
 resize(){if(!this.renderer||!this.host?.isConnected)return;const {width,height}=this.host.getBoundingClientRect();if(!width||!height)return;this.renderer.setSize(width,height);const half=Math.max(2.25,3.55/(width/height));this.camera.left=-half*width/height;this.camera.right=-this.camera.left;this.camera.top=half;this.camera.bottom=-half;this.camera.updateProjectionMatrix();}
 show(info,success=false){this.pending=[info,success];this.success=success;if(!this.scene)return;if(this.key!==info.id){if(this.model){this.scene.remove(this.model.root);dispose(this.model.root);}this.key=info.id;this.amount=0;this.model=makeScene(info);this.scene.add(this.model.root);}this.running=true;}
 suspend(){this.running=false;}
 dispose(){this.suspend();this.resizeObserver?.disconnect();this.controls?.dispose();if(this.model)dispose(this.model.root);this.environment?.dispose();this.renderer?.dispose();this.renderer?.forceContextLoss();}
}
