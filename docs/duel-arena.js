import * as T from 'three';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {makeScene,dispose} from './duel-scenes.js';
import {prepareStudy} from './model-library.js';
import {faces} from './reading-round.js';
import {identityPortraits} from './identity-card.js';

const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const imageCache=new Map(),cardMaps=new Map();
function picture(url){if(!imageCache.has(url)){const img=new Image();img.src=url;imageCache.set(url,img.decode().then(()=>img));}return imageCache.get(url);}
async function cardMap(id){
 if(cardMaps.has(id))return cardMaps.get(id);
 const promise=(async()=>{
  const [stock,portrait]=await Promise.all([picture('./assets/identity/front-stock.png'),picture(identityPortraits[id])]);
  const canvas=document.createElement('canvas');canvas.width=1120;canvas.height=1520;
  const c=canvas.getContext('2d'),x=160,y=180,w=800,h=1200;
  c.drawImage(stock,x,y,w,h);c.save();c.beginPath();
  [[-.4,-.45],[1.4,-.45],[1.4,.54],[1,.62],[1,.86],[0,.86],[0,.62],[-.4,.54]].forEach(([px,py],i)=>c[i?'lineTo':'moveTo'](x+px*w,y+py*h));c.closePath();c.clip();
  c.drawImage(portrait,x-w*.3,y-h*.14,w*1.6,w*1.6);c.restore();c.save();c.beginPath();
  [[0,.58],[.12,.58],[.12,.82],[.25,.86],[.4,.86],[.5,.83],[.6,.86],[.75,.86],[.88,.82],[.88,.58],[1,.58],[1,1],[0,1]].forEach(([px,py],i)=>c[i?'lineTo':'moveTo'](x+px*w,y+py*h));c.closePath();c.clip();c.drawImage(stock,x,y,w,h);c.restore();
  // The readable identity name lives in the HUD, not in the scaled card texture.
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;return map;
 })();cardMaps.set(id,promise);return promise;
}

// The entire table, identity cards and question model share this renderer and sun.
export class DuelArena{
 constructor(){this.view={angle:0,radius:23,height:9,targetX:0,targetY:1.35};this.from={...this.view};this.to={...this.view};this.cards=[];this.seatKey='';this.mode=null;this.lastTime=0;}
 async mount(host){
  if(this.host!==host){this.resizeObserver?.disconnect();this.host=host;this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);if(this.renderer)host.append(this.renderer.domElement);}
  if(this.renderer){this.resize();return;}
  if(!this.initializing)this.initializing=this.initialize();
  await this.initializing;
 }
 async initialize(){
  try{
   await prepareStudy('boundary');
   this.renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.91;this.host.append(this.renderer.domElement);
   this.renderer.domElement.setAttribute('aria-label','阳光下的圆环对局空间，两位旅人的身份牌立在圆盘两侧');
   this.scene=new T.Scene();this.scene.background=new T.Color('#edf0ef');this.scene.fog=new T.Fog('#edf0ef',30,85);
   this.camera=new T.PerspectiveCamera(36,1,.1,150);
   const env=new RoomEnvironment(),pm=new T.PMREMGenerator(this.renderer);this.environment=pm.fromScene(env,.04);this.scene.environment=this.environment.texture;this.scene.environmentIntensity=.26;env.dispose();pm.dispose();
   this.scene.add(new T.HemisphereLight('#fcfcff','#64708b',.8));
   const sun=new T.DirectionalLight('#fff8e9',4.3);sun.position.set(-8,17,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-15,right:15,top:13,bottom:-13,near:.1,far:55});sun.shadow.bias=-.00025;sun.shadow.normalBias=.025;sun.shadow.radius=2;this.scene.add(sun);
   const white=new T.MeshStandardMaterial({color:'#f4f5f2',roughness:.4,metalness:.06}),edge=new T.MeshStandardMaterial({color:'#bac1cc',roughness:.35,metalness:.4}),blue=new T.MeshStandardMaterial({color:'#304edd',roughness:.3,metalness:.25});
   this.materials=[white,edge,blue];
   const floor=new T.Mesh(new T.PlaneGeometry(240,240),new T.MeshStandardMaterial({color:'#e5e8e7',roughness:.85}));floor.rotation.x=-Math.PI/2;floor.position.y=-.08;floor.receiveShadow=true;this.scene.add(floor);
   const cylinder=(radius,height,y,material=white,x=0,z=0)=>{const n=new T.Mesh(new T.CylinderGeometry(radius,radius,height,128),material);n.position.set(x,y,z);n.castShadow=true;n.receiveShadow=true;this.scene.add(n);return n;};
   cylinder(4.35,.19,.015);cylinder(4.1,.12,.17,edge);cylinder(3.98,.24,.35);cylinder(3.68,.1,.52);
   const ring=(r,tube,y,mat)=>{const n=new T.Mesh(new T.TorusGeometry(r,tube,10,192),mat);n.rotation.x=-Math.PI/2;n.position.y=y;n.receiveShadow=true;n.castShadow=true;this.scene.add(n);return n;};
   ring(3.75,.014,.584,blue);ring(8.35,.11,.12,white);ring(8.35,.018,.237,blue);ring(8.6,.016,.1,edge);
   for(let i=0;i<72;i++){const a=i*Math.PI/36;const n=new T.Mesh(new T.BoxGeometry(.012,.012,i%6===0?.19:.075),edge);n.position.set(Math.sin(a)*8.13,.12,Math.cos(a)*8.13);n.rotation.y=a;this.scene.add(n);}
   for(const side of [-1,1]){cylinder(1.52,.16,.08,white,side*8.35,0);cylinder(1.33,.25,.28,edge,side*8.35,0);cylinder(1.25,.24,.52,white,side*8.35,0);const seat=new T.Group();seat.position.set(side*8.35,.72,0);this.scene.add(seat);this.cards.push(seat);}
   this.setupDepth();this.resize();this.tickCamera(0);
   this.renderer.setAnimationLoop(t=>this.frame(t));
  }catch(error){console.warn('Arena unavailable',error);this.failed=true;this.host.innerHTML='<p class="arena-fallback">立体场景暂时无法显示，题目、手牌与作答仍可继续使用。</p>';}
 }
 setupDepth(){
  this.target=new T.WebGLRenderTarget(1,1,{depthTexture:new T.DepthTexture(1,1),samples:2});this.target.texture.colorSpace=T.LinearSRGBColorSpace;
  this.postScene=new T.Scene();this.postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
  this.post=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{colorMap:{value:this.target.texture},depthMap:{value:this.target.depthTexture},pixel:{value:new T.Vector2(1,1)},near:{value:.1},far:{value:150},focusFar:{value:23}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
   uniform sampler2D colorMap,depthMap;uniform vec2 pixel;uniform float near,far,focusFar;varying vec2 vUv;
   float depthAt(vec2 p){float d=texture2D(depthMap,p).x;return near*far/(far-d*(far-near));}
   void main(){float d=depthAt(vUv);float blur=smoothstep(focusFar,focusFar+12.,d)*2.4;vec4 c=texture2D(colorMap,vUv)*.28;float total=.28;
    for(int i=0;i<8;i++){float a=float(i)*.785398;vec2 uv=vUv+vec2(cos(a),sin(a))*pixel*blur;float w=.09*step(d-2.,depthAt(uv));c+=texture2D(colorMap,uv)*w;total+=w;}
    gl_FragColor=c/total;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`});
  this.postScene.add(new T.Mesh(new T.PlaneGeometry(2,2),this.post));
 }
 async prepare(){await Promise.all(faces.map(f=>cardMap(f.id)));if(this.renderer){for(const promise of cardMaps.values())this.renderer.initTexture(await promise);await this.show({id:'arena-warmup',kind:'threshold'},[{face:faces[0].id},{face:faces[1].id}],0,false,true);await this.renderer.compileAsync(this.scene,this.camera);this.frame(performance.now());this.mode=null;}}
 resize(){if(!this.renderer||!this.host?.isConnected)return;const {width:w,height:h}=this.host.getBoundingClientRect();if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.layers[w<701?'disable':'enable'](30);this.compact=w<560;this.camera.fov=this.compact?46:w/h<1.05?51:36;this.camera.updateProjectionMatrix();const size=this.renderer.getDrawingBufferSize(new T.Vector2());this.target?.setSize(size.x,size.y);this.post?.uniforms.pixel.value.set(1/size.x,1/size.y);}
 async show(info,players,side,success=false,overview=false){
  if(!this.scene)return;this.running=true;this.success=success;this.endgame=!!info.endgame;
  if(this.key!==info.id){if(this.model){this.scene.remove(this.model.root);dispose(this.model.root);}this.key=info.id;this.amount=0;this.model=makeScene(info,true);this.model.root.position.y=.65;this.model.root.scale.setScalar(.95);this.scene.add(this.model.root);}
  const key=players.map(p=>p.face).join('|');if(this.seatKey!==key){this.seatKey=key;const maps=await Promise.all(players.map(p=>cardMap(p.face)));if(this.seatKey!==key)return;
   this.cards.forEach((seat,i)=>{while(seat.children.length){const old=seat.children[0];seat.remove(old);old.geometry?.dispose();old.material?.dispose();old.customDepthMaterial?.dispose();}const mat=new T.MeshStandardMaterial({map:maps[i],transparent:true,alphaTest:.35,roughness:.64,side:T.DoubleSide});const card=new T.Mesh(new T.PlaneGeometry(4.2,5.7),mat);card.position.y=2.57;card.castShadow=true;card.receiveShadow=true;card.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:maps[i],alphaTest:.35});seat.add(card);});
  }
  const mode=overview?'overview':String(side);if(this.mode!==mode){this.mode=mode;this.from={...this.view};this.to=overview?{angle:0,radius:23,height:9,targetX:0,targetY:1.5}:{angle:side===0?-.64:.64,radius:18.8,height:6.7,targetX:side===0?-2.6:2.6,targetY:1.85};this.moveStarted=performance.now();this.moveDuration=reduced()?0:1550;}
 }
 tickCamera(t){const fraction=this.moveDuration?Math.min(1,Math.max(0,(t-this.moveStarted)/this.moveDuration)):1;const k=fraction*fraction*(3-2*fraction);for(const key of Object.keys(this.view))this.view[key]=T.MathUtils.lerp(this.from[key],this.to[key],k);const v=this.view,portrait=this.camera.aspect<.9||this.compact,radius=portrait?(this.camera.aspect<.9?36:25):v.radius,angle=portrait?v.angle*.4:v.angle;this.camera.position.set(Math.sin(angle)*radius,portrait?12:v.height,Math.cos(angle)*radius);this.camera.lookAt(portrait?v.targetX*.2:v.targetX,portrait&&this.endgame?-8:v.targetY,0);this.camera.updateMatrixWorld();this.cards.forEach(card=>{card.rotation.y=Math.atan2(this.camera.position.x-card.position.x,this.camera.position.z-card.position.z)*.72;});}
 frame(t){if(!this.running||!this.host?.isConnected||document.hidden){this.lastTime=t;return;}const dt=Math.min(.05,(t-this.lastTime)/1000||.016);this.lastTime=t;this.tickCamera(t);this.amount=T.MathUtils.damp(this.amount||0,this.success?1:0,4,dt);this.model?.animate(reduced()?0:t/1000,this.amount);this.cards.forEach((c,i)=>{c.position.y=.72+(reduced()?0:Math.sin(t*.0007+i)*.035);});
  this.renderer.setRenderTarget(this.target);this.renderer.render(this.scene,this.camera);this.renderer.setRenderTarget(null);this.renderer.render(this.postScene,this.postCamera);
 }
 suspend(){this.running=false;}
}
