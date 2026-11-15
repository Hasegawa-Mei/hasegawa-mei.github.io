import * as T from 'three';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
import {makeScene,dispose} from './duel-scenes.js';
import {prepareStudy,placeAsset} from './model-library.js';
import {faces} from './reading-round.js';
import {identityPortraits} from './identity-card.js';

// 白色棋局：全白棋盘靠高低差与哑光/抛光区分格子，低角度主光把它们“显影”。
// 这里只负责呈现。回合、星星与胜负全部来自 duel.js 传入的只读快照（beat）。
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const imageCache=new Map(),cardMaps=new Map();
function picture(url){if(!imageCache.has(url)){const img=new Image();img.src=url;imageCache.set(url,img.decode().then(()=>img));}return imageCache.get(url);}
async function cardMap(id){
 if(cardMaps.has(id))return cardMaps.get(id);
 const promise=(async()=>{
  const [stock,portrait]=await Promise.all([picture('./assets/identity/front-stock.webp'),picture(identityPortraits[id])]);
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

// —— 尺寸约定（世界单位）——
const CELL=1,BOARD=8*CELL,HALF=BOARD/2;          // 8×8 棋盘
const DAIS_TOP=.30,FRAME_TOP=.42,CELL_LOW=.44,CELL_HIGH=.53,STAGE_TOP=.53;
const SEAT_X=9.5,FILE_X=3.5,MODEL=.78,BEAM=130;                      // 身份立牌位置；两位旅人各自的落子纵线
const VIEW_KEYS=['angle','radius','height','targetX','targetY','targetZ','shift','lift'];

function lathe(profile,segments=48){return new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),segments);}
// 兵：一颗星；柱：一次出牌。
const PAWN=[[0,0],[.25,0],[.27,.035],[.25,.07],[.19,.1],[.15,.13],[.085,.36],[.075,.4],[.13,.43],[.13,.455],[.07,.48],[0,.48]];
const PILLAR=[[0,0],[.31,0],[.33,.04],[.31,.085],[.23,.12],[.19,.16],[.13,.62],[.12,.7],[.2,.74],[.21,.79],[.16,.82],[.16,.9],[.21,.93],[.21,.97],[0,.97]];

// 程序生成的贴图：不新增素材文件。固定种子，保证每次打开纹路一致。
function seeded(seed){let v=seed;return()=>(v=(v*16807)%2147483647)/2147483647;}
function marbleMap(seed,vein='#8f9bb8',base='#ffffff'){
 const size=512,canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d'),r=seeded(seed);
 c.fillStyle=base;c.fillRect(0,0,size,size);
 for(let pass=0;pass<2;pass++){c.filter=pass?'blur(.6px)':'blur(7px)';
  for(let i=0;i<(pass?14:9);i++){let x=r()*size,y=r()*size;c.beginPath();c.moveTo(x,y);const a=r()*Math.PI*2;
   for(let k=0;k<7;k++){x+=Math.cos(a+(r()-.5)*1.5)*90;y+=Math.sin(a+(r()-.5)*1.5)*90;c.lineTo(x,y);}
   c.strokeStyle=vein;c.globalAlpha=pass?.1+r()*.16:.1+r()*.1;c.lineWidth=pass?.6+r()*1.4:8+r()*22;c.stroke();}}
 c.globalAlpha=1;c.filter='none';
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;return map;
}
function floorMap(){
 const size=512,half=size/2,canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d'),r=seeded(41);
 for(let i=0;i<2;i++)for(let j=0;j<2;j++){c.fillStyle=(i+j)%2?'#e9ebee':'#fbfbfa';c.fillRect(i*half,j*half,half,half);}
 c.filter='blur(5px)';for(let i=0;i<16;i++){let x=r()*size,y=r()*size;c.beginPath();c.moveTo(x,y);for(let k=0;k<5;k++){x+=(r()-.5)*240;y+=(r()-.5)*240;c.lineTo(x,y);}c.strokeStyle='#a3adc4';c.globalAlpha=.03+r()*.04;c.lineWidth=4+r()*10;c.stroke();}
 c.filter='none';c.globalAlpha=.5;c.strokeStyle='#b9c0cf';c.lineWidth=2;for(const v of [1,half,size-1]){c.beginPath();c.moveTo(v,0);c.lineTo(v,size);c.moveTo(0,v);c.lineTo(size,v);c.stroke();}
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(40,40);map.anisotropy=8;return map;
}

export class DuelArena{
 constructor(){
  this.view={angle:0,radius:27,height:12.5,targetX:0,targetY:.9,targetZ:0,shift:0,lift:0};
  this.from={...this.view};this.queue=[];this.cards=[];this.seatKey='';this.mode=null;this.lastTime=0;
  this.pieces=[];this.pawns=[[],[]];this.activeSide=0;this.size={w:1,h:1};
 }
 async mount(host){
  if(this.host!==host){this.resizeObserver?.disconnect();this.host=host;this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);if(this.renderer)host.append(this.renderer.domElement);}
  if(this.renderer){this.resize();return;}
  if(!this.initializing)this.initializing=this.initialize();
  await this.initializing;
 }
 async initialize(){
  try{
   await Promise.all([prepareStudy('boundary'),prepareStudy('power')]);
   const r=this.renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
   r.setPixelRatio(Math.min(devicePixelRatio,1.35));r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=.86;this.host.append(r.domElement);
   r.domElement.setAttribute('aria-label','强光下的白色棋盘。王座立在棋盘尽头，两位旅人的身份牌立在两侧，每回合在棋盘上落下一枚棋子');
   this.scene=new T.Scene();this.scene.background=new T.Color('#e2e5ea');this.scene.fog=new T.Fog('#e2e5ea',40,110);
   this.camera=new T.PerspectiveCamera(36,1,.1,150);
   const env=new RoomEnvironment(),pm=new T.PMREMGenerator(r);this.environment=pm.fromScene(env,.04);this.scene.environment=this.environment.texture;this.scene.environmentIntensity=.09;env.dispose();pm.dispose();
   this.buildLight();this.buildMaterials();this.buildBoard();this.buildThrone();this.buildSeats();this.buildHall();
   this.setupDepth();this.resize();this.tickCamera(0);
   r.setAnimationLoop(t=>this.frame(t));
  }catch(error){console.warn('Arena unavailable',error);this.failed=true;this.host.innerHTML='<p class="arena-fallback">立体场景暂时无法显示，题目、手牌与作答仍可继续使用。</p>';}
 }
 buildLight(){
  // 冷色天光让阴影带一点群青；暖白主光压低角度，拉出长影。
  this.scene.add(new T.HemisphereLight('#eef2ff','#4458b0',.2));
  const sun=this.sun=new T.DirectionalLight('#fff3df',5);sun.position.set(-15,8.4,9.5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-17,right:17,top:15,bottom:-15,near:1,far:60});sun.shadow.bias=-.0002;sun.shadow.normalBias=.03;sun.shadow.radius=1.7;this.scene.add(sun);
  const rim=this.rim=new T.DirectionalLight('#cfdcff',1.15);this.rim.position.set(11,7,-13);this.scene.add(this.rim);
  // 灯塔的光：一束冷白聚光，跟随当前回合的旅人。
  const beam=this.beam=new T.SpotLight('#dfe7ff',0,34,.24,.75,1.1);beam.position.set(0,15,7);this.scene.add(beam,beam.target);
 }
 buildMaterials(){
  const M=(color,roughness,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
  this.m={plaster:M('#f1f0ec',.82),matte:M('#e6e5e1',.86),satin:M('#fbfbf9',.34,.02),stone:M('#e9e8e3',.66),edge:M('#d4d8df',.34,.35),blue:M('#2f4bdc',.32,.2),
   glow:new T.MeshBasicMaterial({color:'#3554ea',transparent:true,opacity:.9}),floor:M('#dcdfe5',.55),wall:M('#d3d7df',.95),column:M('#efeeea',.7)};
  // 棋盘是大理石：抛光格纹路清晰，哑光格纹路更淡；宫殿地面是大块的白色格砖。
  this.m.satin.map=marbleMap(7,'#7f8db3');this.m.matte.map=marbleMap(19,'#a3abc0');this.m.stone.map=marbleMap(31,'#9aa4bd');this.m.stone.map.repeat.set(2,2);
  this.m.column.map=marbleMap(53,'#a9b1c6');this.m.column.map.repeat.set(1,3);this.m.floor.map=floorMap();
  this.materials=Object.values(this.m);
 }
 add(geometry,material,x=0,y=0,z=0,parent=this.scene){const n=new T.Mesh(geometry,material);n.position.set(x,y,z);n.castShadow=true;n.receiveShadow=true;parent.add(n);return n;}
 buildBoard(){
  const m=this.m;
  const floor=this.add(new T.PlaneGeometry(260,260),m.floor,0,-.08,0);floor.rotation.z=Math.PI/4;floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  const disc=(radius,height,y,mat=m.plaster)=>this.add(new T.CylinderGeometry(radius,radius,height,160),mat,0,y,0);
  // 圆台：与章节海报的圆盘呼应，方棋盘嵌在其中。
  disc(8.1,.12,-.02,m.stone);disc(7.55,.16,.1);disc(7.2,.1,.25,m.stone);
  const ring=(radius,tube,y,mat)=>{const n=this.add(new T.TorusGeometry(radius,tube,10,220),mat,0,y,0);n.rotation.x=-Math.PI/2;return n;};
  ring(7.36,.012,.303,m.blue);ring(11.6,.09,.0,m.plaster);ring(11.6,.014,.095,m.blue);
  for(let i=0;i<96;i++){const a=i*Math.PI/48,n=this.add(new T.BoxGeometry(.014,.012,i%8===0?.26:.1),m.edge,Math.sin(a)*11.2,-.07,Math.cos(a)*11.2);n.rotation.y=a;n.castShadow=false;}
  // 棋盘底座与边框。
  this.add(new RoundedBoxGeometry(BOARD+1.3,.14,BOARD+1.3,3,.035),m.plaster,0,DAIS_TOP+.06,0);
  this.add(new RoundedBoxGeometry(BOARD+.5,.1,BOARD+.5,3,.03),m.stone,0,FRAME_TOP-.05,0);
  const line=(w,d,x,z)=>{const n=this.add(new T.BoxGeometry(w,.008,d),m.blue,x,FRAME_TOP+.003,z);n.castShadow=false;return n;};
  const L=HALF+.13;line(2*L+.02,.02,0,L);line(2*L+.02,.02,0,-L);line(.02,2*L+.02,L,0);line(.02,2*L+.02,-L,0);
  // 64 格：高的一半抛光，低的一半哑光。颜色不参与区分。
  const cell=new RoundedBoxGeometry(CELL-.035,.12,CELL-.035,2,.022),high=new T.InstancedMesh(cell,m.satin,32),low=new T.InstancedMesh(cell,m.matte,32),at=new T.Object3D();
  let h=0,l=0;for(let i=0;i<8;i++)for(let j=0;j<8;j++){const up=(i+j)%2===0;at.position.set(-HALF+CELL/2+i*CELL,(up?CELL_HIGH:CELL_LOW)-.06,-HALF+CELL/2+j*CELL);at.rotation.y=((i*5+j*3)%4)*Math.PI/2;at.updateMatrix();(up?high:low).setMatrixAt(up?h++:l++,at.matrix);}
  for(const n of [high,low]){n.castShadow=true;n.receiveShadow=true;this.scene.add(n);}
  // 中央议题台：每回合的情境模型立在这里。
  const s=(w,d,x,z)=>{const n=this.add(new T.BoxGeometry(w,.1,d),m.blue,x,CELL_HIGH-.047,z);n.castShadow=false;};
  s(5*CELL,.016,0,1.5*CELL);s(5*CELL,.016,0,-1.5*CELL);s(.016,3*CELL,2.5*CELL,0);s(.016,3*CELL,-2.5*CELL,0);
  // 回合刻度：八行对应八回合，当前行亮起。
  this.rowMarks=[];for(let i=0;i<8;i++){const g=new T.Group();g.position.set(0,FRAME_TOP+.004,HALF-CELL/2-i*CELL);for(const side of [-1,1]){const tick=new T.Mesh(new T.BoxGeometry(.2,.008,.03),m.edge.clone());tick.position.x=side*(HALF+.42);g.add(tick);}this.scene.add(g);this.rowMarks.push(g);}
  this.cursor=this.add(new RoundedBoxGeometry(CELL-.1,.012,CELL-.1,2,.005),m.glow.clone(),0,CELL_HIGH+.012,0);this.cursor.castShadow=false;this.cursor.receiveShadow=false;this.cursor.visible=false;
 }
 buildThrone(){
  // 王座立在棋盘尽头的中轴上：没有人坐的位置。
  const m=this.m,g=new T.Group();g.position.set(0,DAIS_TOP,-5.72);this.scene.add(g);
  this.add(new RoundedBoxGeometry(3.4,.16,2.5,3,.04),m.plaster,0,.08,0,g);
  this.add(new RoundedBoxGeometry(2.9,.16,2.2,3,.04),m.stone,0,.24,-.05,g);
  this.add(new RoundedBoxGeometry(2.4,.16,1.9,3,.04),m.plaster,0,.4,-.1,g);
  const inlay=this.add(new T.BoxGeometry(2.1,.006,.014),m.blue,0,.483,.74,g);inlay.castShadow=false;
  const throne=placeAsset(g,'THRONE',0,.48,-.2,1.42);
  if(!throne){this.add(new RoundedBoxGeometry(1.5,.5,1.3,3,.05),m.plaster,0,.73,-.1,g);this.add(new RoundedBoxGeometry(1.5,2.6,.22,3,.05),m.plaster,0,1.78,-.66,g);for(const x of [-.66,.66])this.add(new RoundedBoxGeometry(.2,.75,1.2,3,.05),m.stone,x,1.2,-.1,g);}
  for(const x of [-1.35,1.35]){this.add(new T.CylinderGeometry(.13,.16,2.3,40),m.plaster,x,1.63,-.75,g);this.add(new T.SphereGeometry(.17,32,20),m.satin,x,2.9,-.75,g);}
  this.halo=this.add(new T.TorusGeometry(1.05,.012,10,120),m.glow.clone(),0,3.95,-.6,g);this.halo.castShadow=false;this.halo.material.opacity=.0;
  this.throne=g;
 }
 buildSeats(){
  const m=this.m,pawn=lathe(PAWN),head=new T.SphereGeometry(.105,28,18);
  for(const side of [-1,1]){
   const base=new T.Group();base.position.set(side*SEAT_X,0,0);this.scene.add(base);
   this.add(new T.CylinderGeometry(1.75,1.75,.14,96),m.plaster,0,-.01,0,base);this.add(new T.CylinderGeometry(1.5,1.56,.2,96),m.stone,0,.16,0,base);this.add(new T.CylinderGeometry(1.38,1.38,.2,96),m.plaster,0,.36,0,base);
   const mark=this.add(new T.TorusGeometry(1.44,.014,10,140),m.glow.clone(),0,.27,0,base);mark.rotation.x=-Math.PI/2;mark.castShadow=false;mark.material.opacity=0;
   const seat=new T.Group();seat.position.set(side*SEAT_X,.46,0);seat.userData.mark=mark;this.scene.add(seat);this.cards.push(seat);
   // 三颗星做成三枚兵，立在棋盘与立牌之间。
   const list=this.pawns[side<0?0:1];
   for(let k=0;k<3;k++){const p=new T.Group();p.position.set(side*5.65,DAIS_TOP+.1,(k-1)*.82);this.add(pawn,m.satin,0,0,0,p);this.add(head,m.satin,0,.57,0,p);p.userData={alive:1,side};this.scene.add(p);list.push(p);}
  }
  this.pieceGeometry=lathe(PILLAR);this.pieceCap=new T.OctahedronGeometry(.13);
 }
 buildHall(){
  // 圆形殿堂：后半圈柱廊与檐口，王座后的拱门，两侧立牌身后的壁龛。
  // 面向镜头的前半圈留空，主光从那里照进来。
  const m=this.m,R=17.5,H=9.4,hall=new T.Group();this.scene.add(hall);
  const arc=(inner,outer,y0,y1,from,span,mat)=>{const n=this.add(lathe([[inner,y0],[outer,y0],[outer,y1],[inner,y1],[inner,y0]],120),mat,0,0,0,hall);n.geometry.dispose();n.geometry=new T.LatheGeometry([[inner,y0],[outer,y0],[outer,y1],[inner,y1],[inner,y0]].map(([r,y])=>new T.Vector2(r,y)),120,from,span);return n;};
  const start=1.08,span=Math.PI*2-start*2;
  arc(R-1.2,R+1.2,-.08,.1,start-.1,span+.2,m.stone);arc(R-.95,R+.95,.1,.26,start-.08,span+.16,m.plaster);       // 柱廊台阶
  arc(R-.75,R+.75,H+.26,H+1.3,start-.06,span+.12,m.plaster);arc(R-.95,R+.95,H+1.3,H+1.55,start-.07,span+.14,m.stone); // 檐口
  arc(R-.77,R-.75,H+.5,H+.53,start-.06,span+.12,m.blue).castShadow=false;
  arc(R+3.4,R+3.9,-.08,H+1.55,start-.2,span+.4,m.wall).castShadow=false;                                         // 外墙
  const shaft=new T.CylinderGeometry(.5,.58,H-1.1,24,1),drum=new T.CylinderGeometry(.74,.74,.2,32),plinth=new RoundedBoxGeometry(1.7,.34,1.7,2,.04),cap=new RoundedBoxGeometry(1.6,.3,1.6,2,.04),bell=new T.CylinderGeometry(.78,.52,.5,24);
  const count=11;for(let i=0;i<count;i++){const a=start+.14+i*(span-.28)/(count-1),g=new T.Group();g.position.set(Math.sin(a)*R,.26,Math.cos(a)*R);g.rotation.y=a;hall.add(g);
   this.add(plinth,m.plaster,0,.17,0,g);this.add(drum,m.stone,0,.44,0,g);this.add(shaft,m.column,0,.54+(H-1.1)/2,0,g);this.add(bell,m.plaster,0,H-.31,0,g);this.add(cap,m.stone,0,H+.09,0,g);}
  // 拱门：两根细柱加半圆拱。
  const arch=(x,z,face,width,height,scale=1)=>{const g=new T.Group();g.position.set(x,DAIS_TOP-.3,z);g.rotation.y=face;g.scale.setScalar(scale);hall.add(g);
   for(const side of [-1,1]){this.add(new T.CylinderGeometry(.2,.24,height,24),m.column,side*width,height/2,0,g);this.add(new RoundedBoxGeometry(.72,.24,.72,2,.03),m.plaster,side*width,.12,0,g);this.add(new RoundedBoxGeometry(.66,.2,.66,2,.03),m.stone,side*width,height+.1,0,g);}
   const top=this.add(new T.TorusGeometry(width,.2,14,64,Math.PI),m.plaster,0,height+.2,0,g),line=this.add(new T.TorusGeometry(width-.3,.014,8,64,Math.PI),m.blue,0,height+.2,.04,g);line.castShadow=false;
   const back=this.add(new T.CircleGeometry(width-.2,48,0,Math.PI),m.wall,0,height+.2,-.22,g);back.castShadow=false;const panel=this.add(new T.PlaneGeometry(width*2-.4,height),m.wall,0,height/2+.2,-.22,g);panel.castShadow=false;return g;};
  arch(0,-8.6,0,2.5,5.6);
  for(const side of [-1,1])arch(side*(SEAT_X+2.5),-1.2,-side*1.05,2.1,5.2,1.05);
 }
 setupDepth(){
  this.target=new T.WebGLRenderTarget(1,1,{depthTexture:new T.DepthTexture(1,1),samples:2,type:T.HalfFloatType});this.target.texture.colorSpace=T.LinearSRGBColorSpace;
  this.postScene=new T.Scene();this.postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
  // 朦胧感保留：远处与最近处轻微失焦，四角略收光；清晰区留给棋盘。
  this.post=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{colorMap:{value:this.target.texture},depthMap:{value:this.target.depthTexture},pixel:{value:new T.Vector2(1,1)},near:{value:.1},far:{value:150},focus:{value:23},haze:{value:1}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
   uniform sampler2D colorMap,depthMap;uniform vec2 pixel;uniform float near,far,focus,haze;varying vec2 vUv;
   float depthAt(vec2 p){float d=texture2D(depthMap,p).x;return near*far/(far-d*(far-near));}
   void main(){float d=depthAt(vUv);
    float blur=(smoothstep(focus+7.,focus+21.,d)*1.9+smoothstep(focus-9.,focus-16.,d)*1.2)*haze;
    vec4 c=texture2D(colorMap,vUv)*.28;float total=.28;
    for(int i=0;i<8;i++){float a=float(i)*.785398;vec2 uv=vUv+vec2(cos(a),sin(a))*pixel*blur;float w=.09*step(d-2.,depthAt(uv));c+=texture2D(colorMap,uv)*w;total+=w;}
    c/=total;
    // 远处溶进空气里一点点。
    c.rgb=mix(c.rgb,vec3(.89,.9,.93),smoothstep(focus+10.,focus+46.,d)*.3*haze);
    vec2 q=vUv-.5;c.rgb*=1.-dot(q,q)*.2;
    gl_FragColor=c;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`});
  this.postScene.add(new T.Mesh(new T.PlaneGeometry(2,2),this.post));
 }
 async prepare(){await Promise.all(faces.map(f=>cardMap(f.id)));if(this.renderer){for(const promise of cardMaps.values())this.renderer.initTexture(await promise);await this.show({id:'arena-warmup',kind:'threshold'},[{face:faces[0].id},{face:faces[1].id}],0,false,true);await this.renderer.compileAsync(this.scene,this.camera);this.frame(performance.now());this.mode=null;this.key=null;}}
 resize(){if(!this.renderer||!this.host?.isConnected)return;const {width:w,height:h}=this.host.getBoundingClientRect();if(!w||!h)return;this.size={w,h};this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.layers[w<701?'disable':'enable'](30);this.compact=w<560&&w/h<1.2;this.camera.fov=T.MathUtils.clamp(T.MathUtils.radToDeg(2*Math.atan(Math.tan(Math.PI/10)*1.75/(w/h))),36,62);this.camera.updateProjectionMatrix();const size=this.renderer.getDrawingBufferSize(new T.Vector2());this.target?.setSize(size.x,size.y);this.post?.uniforms.pixel.value.set(1/size.x,1/size.y);}
 // —— 机位 ——
 pose(name,side){
  const s=side===0?-1:1; // 镜头随玩家换边，HUD 保持在屏幕边缘。
  const base={angle:s*.5,radius:25,height:10.4,targetX:0,targetY:.7,targetZ:-.3,shift:0,lift:0};
  switch(name){
   case 'overview':return {angle:0,radius:27,height:12.5,targetX:0,targetY:.9,targetZ:-.4,shift:0,lift:0};
   case 'top':return {...base,angle:s*.16,radius:9.5,height:25,targetY:0,targetZ:.2};            // 俯视全盘：新的一回合
   case 'write':return {...base,angle:s*.6,radius:16.5,height:6.3,targetY:1.25,targetZ:.2,shift:.12}; // 为右下作答卡片留出空间
   case 'throne':return {...base,angle:s*.2,radius:18.5,height:5.6,targetY:1.9,targetZ:-2.6,shift:.12}; // 抬头看王座：这条关联成立
   case 'still':return {...base,angle:s*.52,radius:20,height:12.6,targetY:.4,shift:.12};             // 俯身看棋盘：暂未成立
   default:return base;
  }
 }
 shots(list){const still=reduced();this.from={...this.view};this.queue=list.map(([to,duration])=>({to,duration:still?0:duration}));this.moveStarted=performance.now();}
 async show(info,players,side,success=false,overview=false,beat={}){
  if(!this.scene)return;this.running=true;this.success=success;this.endgame=!!info.endgame;this.activeSide=side;this.overview=overview;
  const fresh=this.key!==info.id;
  if(fresh){if(this.model){this.scene.remove(this.model.root);dispose(this.model.root);}this.key=info.id;this.amount=0;this.model=makeScene(info,true);this.model.root.position.y=STAGE_TOP;this.model.root.scale.setScalar(MODEL);this.model.root.userData.rise=reduced()?1:0;this.scene.add(this.model.root);}
  this.sync(beat,side);
  const key=players.map(p=>p.face).join('|');if(this.seatKey!==key){this.seatKey=key;const maps=await Promise.all(players.map(p=>cardMap(p.face)));if(this.seatKey!==key)return;
   this.cards.forEach((seat,i)=>{while(seat.children.length){const old=seat.children[0];seat.remove(old);if(old.userData.own){old.geometry?.dispose();old.material?.dispose();old.customDepthMaterial?.dispose();}else if(old.geometry?.type!=='PlaneGeometry')old.geometry?.dispose();}
    // 立牌：一块有厚度的石膏板，牌面贴在前面，人物仍可探出牌框。
    const slab=new T.Mesh(new RoundedBoxGeometry(3.02,4.52,.2,3,.05),this.m.plaster);slab.position.set(0,2.57,-.13);slab.castShadow=true;slab.receiveShadow=true;seat.add(slab);
    const foot=new T.Mesh(new RoundedBoxGeometry(3.3,.2,.62,3,.04),this.m.stone);foot.position.set(0,.2,-.13);foot.castShadow=true;foot.receiveShadow=true;seat.add(foot);
    const mat=new T.MeshStandardMaterial({map:maps[i],transparent:true,alphaTest:.35,roughness:.6,side:T.DoubleSide});const card=new T.Mesh(new T.PlaneGeometry(4.2,5.7),mat);card.position.y=2.57;card.castShadow=true;card.receiveShadow=true;card.userData.own=true;card.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:maps[i],alphaTest:.35});seat.add(card);
    // 雕像的厚度：同一张剪影向后叠几层，侧看时有实心的边。
    for(let k=1;k<=6;k++){const layer=new T.Mesh(card.geometry,mat);layer.position.set(0,2.57,-k*.03);layer.receiveShadow=true;seat.add(layer);}});
  }
  const mode=[overview?'o':side,beat.writing?'w':'',beat.feedback?(success?'s':'f'):'',info.id].join('|');
  if(this.mode!==mode){const first=this.mode===null;this.mode=mode;
   if(overview)this.shots([[this.pose('overview',side),1700]]);
   else if(beat.feedback)this.shots([[this.pose(success?'throne':'still',side),2100]]);
   else if(beat.writing)this.shots([[this.pose('write',side),1300]]);
   else if(fresh&&!first)this.shots([[this.pose('top',side),1250],[this.pose('turn',side),1900]]);
   else this.shots([[this.pose('turn',side),1500]]);
  }
 }
 // 把对局快照映射到棋盘：已完成的回合各落一子；星星对应兵。
 sync(beat,side){
  const history=beat.history||[],turn=Math.min(7,beat.turn??history.length),s=this.m;
  while(this.pieces.length>history.length){const p=this.pieces.pop();this.scene.remove(p);p.traverse(n=>{if(n.isMesh&&n.userData.own)n.material.dispose();});}
  history.forEach((entry,i)=>{
   let p=this.pieces[i];
   if(!p){p=new T.Group();this.add(this.pieceGeometry,s.satin,0,0,0,p);const cap=this.add(this.pieceCap,s.blue,0,1.13,0,p);cap.scale.set(1,1.35,1);cap.userData.cap=true;p.userData.drop=reduced()?1:0;this.scene.add(p);this.pieces.push(p);}
   const x=(entry.player===0?-1:1)*FILE_X,z=HALF-CELL/2-i*CELL,up=(Math.round(x+HALF-.5)+Math.round(z+HALF-.5))%2===0;
   p.userData.home=new T.Vector3(x,up?CELL_HIGH:CELL_LOW,z);p.userData.ok=entry.ok;p.userData.side=entry.player===0?-1:1;
  });
  (beat.stars||[3,3]).forEach((count,i)=>this.pawns[i].forEach((p,k)=>{p.userData.alive=k<count?1:0;}));
  const active=!this.endgame&&!this.overview&&!beat.feedback&&history.length<8;this.cursor.visible=active;
  if(active)this.cursor.position.set((side===0?-1:1)*FILE_X,this.cursor.position.y,HALF-CELL/2-turn*CELL);
  this.rowMarks.forEach((g,i)=>g.children.forEach(n=>{n.material.color.set(i<history.length?'#2f4bdc':i===turn&&active?'#3554ea':'#d4d8df');n.scale.x=i===turn&&active?1.8:1;}));
 }
 tickCamera(t){
  const shot=this.queue[0];
  if(shot){const fraction=shot.duration?Math.min(1,Math.max(0,(t-this.moveStarted)/shot.duration)):1,k=fraction*fraction*fraction*(fraction*(fraction*6-15)+10);
   for(const key of VIEW_KEYS)this.view[key]=T.MathUtils.lerp(this.from[key],shot.to[key],k);
   if(fraction>=1){this.queue.shift();this.from={...this.view};this.moveStarted=t;}}
  const v=this.view,portrait=this.camera.aspect<.9||this.compact,drift=reduced()?0:Math.sin(t*.00017)*.03,
   radius=portrait?(this.camera.aspect<.9?40:29):v.radius,angle=(portrait?v.angle*.4:v.angle)+drift;
  this.camera.position.set(Math.sin(angle)*radius+v.targetX,portrait?15:v.height,Math.cos(angle)*radius+v.targetZ);
  this.camera.lookAt(portrait?v.targetX*.2:v.targetX,portrait&&this.endgame?-8:v.targetY,v.targetZ);
  // Keep the full-screen world; smoothly compose beside the temporary response HUD.
  const {w,h}=this.size;
  if(portrait||!v.shift)this.camera.clearViewOffset();
  else this.camera.setViewOffset(w,h,v.shift*w,0,w,h);
  this.camera.updateMatrixWorld();
  if(this.post)this.post.uniforms.focus.value=this.camera.position.distanceTo(new T.Vector3(v.targetX,v.targetY,v.targetZ));
  this.cards.forEach(card=>{card.rotation.y=Math.atan2(this.camera.position.x-card.position.x,this.camera.position.z-card.position.z)*.72;});
 }
 frame(t){
  if(!this.running||!this.host?.isConnected||document.hidden){this.lastTime=t;return;}
  const dt=Math.min(.05,(t-this.lastTime)/1000||.016),still=reduced(),D=T.MathUtils.damp;this.lastTime=t;this.tickCamera(t);
  this.amount=D(this.amount||0,this.success?1:0,4,dt);this.model?.animate(still?0:t/1000,this.amount);
  if(this.model){const root=this.model.root;root.userData.rise=D(root.userData.rise,1,3.2,dt);root.position.y=STAGE_TOP-(1-root.userData.rise)*.5;root.scale.setScalar(MODEL*(.86+.14*root.userData.rise));}
  // 立牌与标记：当前一方亮起细蓝环，灯束移过去。
  this.cards.forEach((c,i)=>{const on=!this.overview&&this.activeSide===i?1:0,mark=c.userData.mark;mark.material.opacity=D(mark.material.opacity,on*.9,5,dt);c.position.y=.46+(still?0:Math.sin(t*.0007+i)*.02);});
  // 主光随发言的一方转向：换手时，整盘的影子一起扫过去。
  const sunX=(this.activeSide===0?-1:1)*15;this.sun.position.x=D(this.sun.position.x,sunX,1.1,dt);this.rim.position.x=-this.sun.position.x*.73;
  const side=this.activeSide===0?-1:1,goal=this.overview?0:side*SEAT_X*.78;this.beam.target.position.x=D(this.beam.target.position.x,goal,2.2,dt);this.beam.target.position.y=1.6;this.beam.intensity=D(this.beam.intensity,this.overview?0:BEAM,2,dt);
  this.halo.material.opacity=D(this.halo.material.opacity,this.success?.85:0,2.5,dt);this.halo.rotation.z=still?0:t*.0002;
  // 兵：失去的星倒下。
  for(const list of this.pawns)for(const p of list){const u=p.userData,fall=1-u.alive;u.fall=D(u.fall||0,fall,5,dt);p.rotation.x=u.fall*Math.PI/2*.985;p.rotation.y=u.side*.5*u.fall;p.position.y=DAIS_TOP+.1+u.fall*.24;}
  // 棋子：落下，成立则立住，未成立则放倒。
  for(const p of this.pieces){const u=p.userData;if(!u.home)continue;u.drop=D(u.drop,1,4.5,dt);u.lean=D(u.lean||0,u.ok?0:1,4,dt);
   p.position.set(u.home.x,u.home.y+(1-u.drop)*2.6+u.lean*.2,u.home.z);p.rotation.z=-u.side*u.lean*Math.PI/2*.97;p.scale.setScalar(.82+.18*u.drop);
   p.children.forEach(n=>{if(n.userData.cap){n.visible=u.lean<.5;n.rotation.y=still?0:t*.0006;}});}
  if(this.cursor.visible)this.cursor.material.opacity=still?.75:.5+.35*Math.sin(t*.003);
  this.renderer.setRenderTarget(this.target);this.renderer.render(this.scene,this.camera);this.renderer.setRenderTarget(null);this.renderer.render(this.postScene,this.postCamera);
 }
 suspend(){this.running=false;}
}
