import * as T from 'three';
import {box,cyl,torus,sphere,rod,group} from './scenes.js';
import {placeAsset} from './model-library.js';

const BLUE='#233ceb';
const damp=(a,b,dt)=>T.MathUtils.damp(a,b,5,dt);
function palette(){
 const local=m=>{m.userData.local=true;return m;};
 return {white:local(new T.MeshStandardMaterial({color:'#ffffff',roughness:.32})),
  blue:local(new T.MeshStandardMaterial({color:BLUE,roughness:.24,metalness:.15})),
  metal:local(new T.MeshStandardMaterial({color:'#cbd4e2',roughness:.21,metalness:.7})),
  dark:local(new T.MeshStandardMaterial({color:'#1d2842',roughness:.5})),
  gold:local(new T.MeshStandardMaterial({color:'#f3d96a',roughness:.4})),
  glass:local(new T.MeshPhysicalMaterial({color:'#f5f9ff',transmission:.95,roughness:.045,thickness:.22,ior:1.48,dispersion:.6,envMapIntensity:2.1,side:T.DoubleSide}))};
}
function text(p,str,x,y,z,w=1.2,h=.22,color=BLUE){
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=Math.round(768*h/w);
 const c=canvas.getContext('2d');c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';
 let size=canvas.height*.72;c.font=`600 ${size}px "Microsoft YaHei",sans-serif`;
 if(c.measureText(str).width>720){size*=720/c.measureText(str).width;c.font=`600 ${size}px "Microsoft YaHei",sans-serif`;}
 c.fillText(str,384,canvas.height/2);const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
 const m=new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:T.DoubleSide});m.userData.local=true;
 const plane=new T.Mesh(new T.PlaneGeometry(w,h),m);plane.position.set(x,y,z);plane.layers.set(30);p.add(plane);return plane;
}
function floor(root,m){box(root,6.6,.14,4.25,0,.04,0,m.white,.08);box(root,6.38,.018,.03,0,.121,1.96,m.blue,.005);}
function actor(p,x,z,m,scale=.78){
 const g=group(p,x,.12,z),body=placeAsset(g,'FIG_STAND',0,0,0,scale);
 if(body){body.traverse(o=>{if(o.isMesh){o.material=m.white;o.castShadow=true;}});}
 else {sphere(g,.14*scale,0,1.47*scale,0,m.white);const torso=new T.Mesh(new T.CapsuleGeometry(.17*scale,.44*scale,6,16),m.white);torso.position.y=1.05*scale;g.add(torso);for(const s of [-1,1]){rod(g,[s*.1*scale,.8*scale,0],[s*.12*scale,.09*scale,0],.065*scale,m.white);rod(g,[s*.19*scale,1.2*scale,0],[s*.23*scale,.78*scale,.06],.05*scale,m.white);}}
 return g;
}
function table(p,x,z,m,w=1.35){const g=group(p,x,0,z);box(g,w,.1,.82,0,.9,0,m.white,.04);for(const s of [-1,1]){box(g,.06,.75,.66,s*(w/2-.12),.48,0,m.metal,.012);}return g;}
function wire(p,points,m,r=.013){const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v)));const mesh=new T.Mesh(new T.TubeGeometry(curve,32,r,6,false),m);p.add(mesh);return mesh;}
function monitor(p,x,y,z,m,w=.8){const g=group(p,x,y,z);box(g,w,.56,.07,0,.1,0,m.glass,.035);box(g,.05,.18,.05,0,-.25,0,m.metal);box(g,.32,.025,.18,0,-.34,.03,m.metal);box(g,w*.76,.07,.015,0,.22,.046,m.blue,.006);return g;}
function tick(p,x,y,z,m){const g=group(p,x,y,z);rod(g,[-.10,0,0],[-.025,-.065,0],.018,m);rod(g,[-.025,-.065,0],[.14,.12,0],.018,m);return g;}

function processScene(){
 const root=group(),m=palette();floor(root,m);
 const machine=group(root,-2.45,0,-1.1);cyl(machine,.5,.4,0,.32,0,m.white);sphere(machine,.33,0,.86,0,m.glass);torus(machine,.4,.018,0,.86,0,m.blue,0);text(machine,'AI',0,.34,.51,.35,.19);
 const folds=[],labels=['理解问题','寻找依据','形成草案','比较方案','交付与复核'];
 for(let i=0;i<5;i++){
  const x=-2.5+i*1.22,base=table(root,x,.5,m,1.1),pivot=group(base,0,.965,-.35);folds.push(pivot);
  box(pivot,1.02,.04,.71,0,.015,.355,i===4?m.glass:m.white,.015);
  text(base,labels[i],0,.72,.43,.96,.14);
  for(let j=0;j<3;j++)box(pivot,.61-j*.11,.013,.045,-.08,.05,.18+j*.12,m.blue,.006);
  if(i<4)rod(root,[x+.53,.86,.5],[x+.69,.86,.5],.024,m.blue);
 }
 const output=monitor(root,2.4,1.37,.3,m,1.15);text(output,'社区服务',0,.09,.048,.84,.14);
 const bad=text(output,'缺少图片说明',0,-.10,.048,1,.13,'#b05c20'),good=tick(output,.36,-.10,.05,m.blue);
 const reader=actor(root,-.3,-1.0,m,.83);reader.rotation.y=Math.PI;
 const draft=group(root,-.65,1.02,.45);box(draft,.6,.035,.5,0,0,0,m.gold,.014);
 const request=text(root,'新增要求：读屏可读',.85,2.22,.1,2.55,.23);
 wire(root,[[-2.45,.5,-1.1],[-1.8,.14,-.3],[2.4,.14,-.4]],m.blue);
 let amount=0;
 return {root,focusPoint:new T.Vector3(0,1,0),interactTargets:[output.children[0]],update(o,t,dt){
  const mode=o.processMode||0;amount=damp(amount,mode===0?0:1,dt);
  folds.forEach((g,i)=>{g.rotation.x=i===4?0:-(1-amount)*(Math.PI*.48);g.position.y=.965+(mode===2&&i===2?.04:0);});
  reader.position.x=damp(reader.position.x,mode===0?-1.2:mode===1?1.35:-.6,dt);draft.visible=mode===2;
  request.visible=!!o.processChallenge;bad.visible=!!o.processChallenge&&mode===0;good.visible=!!o.processChallenge&&mode>0;
  machine.children[2].rotation.z=t*.24;
  root.userData.result={mode,stepsVisible:mode===0?1:5,changedRequirement:!!o.processChallenge,checked:!!o.processChallenge&&mode>0};
 }};
}

function doorScene(){
 const root=group(),m=palette();floor(root,m);
 const doorway=group(root,-.7,0,-.15),w=1.85,h=2.46;
 box(doorway,.17,h,.38,-w/2,.12+h/2,0,m.white);box(doorway,.17,h,.38,w/2,.12+h/2,0,m.white);box(doorway,w+.17,.18,.38,0,h+.12,0,m.white);
 const hinge=group(doorway,-w/2+.09,.14,0),door=box(hinge,w-.19,h-.17,.065,(w-.19)/2,(h-.17)/2,0,m.glass,.015);
 box(hinge,.035,.4,.07,w-.4,1,.09,m.blue);text(hinge,'不会制作',.8,1.6,.042,1.15,.21);
 const creator=actor(root,-2.1,1,m,.86);creator.rotation.y=1.2;
 const desk=table(root,1.65,-.65,m,1.65),site=monitor(desk,0,1.30,0,m,1.3);text(site,'社区互助',0,.08,.05,.87,.15);
 const webRows=[];for(let i=0;i<3;i++)webRows.push(box(site,.5,.035,.02,-.16,-.035-i*.075,.052,m.blue,.008));
 const visitors=[actor(root,2.4,1.1,m,.72),actor(root,.85,1.4,m,.76)];visitors[0].rotation.y=-1.3;visitors[1].rotation.y=.2;
 const note=group(root,1.65,2.3,-.4);box(note,2.1,.38,.025,0,0,0,m.white,.06);text(note,'“入口再清楚一点。”',0,0,.02,1.9,.17);
 const bridge=box(root,2.5,.045,.72,-.6,.16,1,m.glass,.03);const maintenance=text(root,'修改 · 回应 · 维护',1.7,.31,1.83,2,.18);
 const spark=sphere(root,.14,-2.1,1.1,.6,m.glass);let amount=0,journey=0;
 const walkRoute=[[-2.1,1],[-.7,1],[-.7,-1.35],[1.65,-1.5]];
 return {root,focusPoint:new T.Vector3(0,1.15,0),interactTargets:[door],update(o,t,dt){
  const stage=o.doorStage||0;amount=damp(amount,stage?1:0,dt);hinge.rotation.y=-amount*Math.PI*.50;
  journey=stage===2?Math.min(1,journey+dt/3.2):0;
  const segment=Math.min(2,Math.floor(journey*3)),u=T.MathUtils.smoothstep(journey*3-segment,0,1),a=walkRoute[segment],b=walkRoute[segment+1];
  creator.position.x=T.MathUtils.lerp(a[0],b[0],u);creator.position.z=T.MathUtils.lerp(a[1],b[1],u);
  creator.rotation.y=journey<1?Math.atan2(b[0]-a[0],b[1]-a[1]):0;
  desk.scale.y=damp(desk.scale.y,stage?1:.035,dt);site.visible=stage>0;visitors.forEach(v=>{v.visible=stage===2;});note.visible=stage===2;maintenance.visible=stage===2;
  bridge.scale.x=damp(bridge.scale.x,stage===2?1:.001,dt);spark.visible=stage===0;spark.position.y=1.1+Math.sin(t*1.3)*.04;
  webRows.forEach(g=>g.scale.x=damp(g.scale.x,stage===2?1.4:1,dt));
  root.userData.result={stage,doorOpen:stage>0,users:stage===2?2:0,feedback:stage===2};
 }};
}

function workScene(){
 const root=group(),m=palette();floor(root,m);
 const workers=[],desks=[],tasks=[];
 for(let i=0;i<3;i++){
  const x=-2.1+i*2.1,desk=table(root,x,.1,m,1.65);desks.push(desk);monitor(desk,0,1.30,-.15,m);
  const person=actor(root,x,-.85,m,.86);person.rotation.y=0;workers.push(person);
  const pile=group(root,x,.98,.3);tasks.push(pile);
  for(let k=0;k<6;k++)box(pile,.45,.065,.33,0,k*.08,0,k===0?m.blue:m.white,.012);
 }
 const ai=group(root,0,0,-1.65);box(ai,1.5,.43,.55,0,.35,0,m.white,.08);box(ai,1.25,.57,.42,0,.79,0,m.glass,.07);text(ai,'AI / 重复任务',0,.48,.3,1.3,.17);
 const shared=group(root,0,0,1.32);box(shared,2.8,.09,.7,0,.78,0,m.glass,.03);for(const x of [-1.1,1.1])box(shared,.06,.63,.5,x,.44,0,m.metal);
 text(shared,'共同学习 / 过渡支持',0,.64,.37,2.25,.18);
 const books=[];for(let i=0;i<3;i++){const b=group(shared,-.82+i*.82,.86,0);box(b,.49,.055,.4,0,0,0,m.blue,.01);box(b,.45,.05,.38,0,.052,0,m.white,.01);books.push(b);}
 const absent=text(root,'岗位撤去，人仍在场',0,2.18,.15,2.5,.22),queue=text(root,'产量要求继续增加',0,2.2,.15,2.5,.22);
 const pipes=[];for(let i=0;i<3;i++)pipes.push(wire(root,[[-2.1+i*2.1,.15,.1],[-1+i,.15,-1.2],[0,.65,-1.65]],m.blue,.017));
 let modeNow=-1;
 return {root,focusPoint:new T.Vector3(0,1,0),interactTargets:[ai.children[1]],update(o,t,dt){
  const mode=o.workMode||0;
  desks.forEach((d,i)=>{d.scale.y=damp(d.scale.y,mode===0&&i!==1?.035:1,dt);});
  workers.forEach((p,i)=>{p.position.z=damp(p.position.z,mode===2?.73:mode===0&&i!==1?.45:-.85,dt);p.rotation.y=damp(p.rotation.y,mode===2?Math.PI:0,dt);});
  tasks.forEach((pile,i)=>{pile.position.y=.98;pile.visible=!(mode===0&&i!==1);pile.children.forEach((tile,k)=>{tile.visible=mode===3||k<(mode===2?1:2);tile.position.y=damp(tile.position.y,k*.08,dt);});});
  shared.scale.y=damp(shared.scale.y,mode===2?1:.001,dt);absent.visible=mode===0;queue.visible=mode===3;
  if(modeNow!==mode){modeNow=mode;root.userData.result={mode,people:3,workstations:mode===0?1:3,tasksPerDesk:mode===3?6:mode===2?1:2,training:mode===2};}
 }};
}

function hypeScene(){
 const root=group(),m=palette();floor(root,m);
 const beacon=group(root,0,0,-1.1);cyl(beacon,.4,1.65,0,.96,0,m.white,.27);cyl(beacon,.49,.10,0,1.83,0,m.blue);cyl(beacon,.3,.45,0,2.1,0,m.glass);cyl(beacon,.45,.13,0,2.38,0,m.white,.1);sphere(beacon,.09,0,2.14,0,m.gold);
 const orbit=torus(root,2.2,.018,0,.15,0,m.blue);
 const people=[],badges=[],pedestals=[],positions=[];
 const slogans=['“又更新了”','“我先用上了”','“时代变了”','“看我的权限”','“新的版本”','“我也来试试”'];
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3+.2,x=Math.cos(a)*2.35,z=Math.sin(a)*1.5;
  positions.push([x,z]);pedestals.push(cyl(root,.36,.23,x,.23,z,m.white));
  const p=actor(root,x,z,m,.65);p.position.y=.35;people.push(p);
  const tag=group(root,x,1.76,z);box(tag,1.15,.27,.03,0,0,0,m.glass,.025);text(tag,slogans[i],0,0,.024,1.05,.15);badges.push(tag);
 }
 const issue=group(root,0,0,.35);box(issue,1.25,.22,.8,0,.25,0,m.white,.025);box(issue,.06,1.02,.08,-.59,.87,-.25,m.blue);box(issue,.06,1.02,.08,.59,.87,-.25,m.blue);box(issue,1.24,.08,.08,0,1.37,-.25,m.blue);
 const ramp=group(issue,0,.36,.4);box(ramp,1.1,.05,1.05,0,0,.52,m.glass,.015);const title=text(issue,'待修的社区入口',0,.61,.46,1.7,.17);
 const proposal=text(root,'“让轮椅也能进来。”',0,1.72,.8,2.45,.21);
 const route=wire(root,[[-2.7,.145,1.6],[-1,.145,1.4],[0,.16,1.44],[0,.38,.48]],m.blue,.023);
 let amount=0;
 return {root,focusPoint:new T.Vector3(0,1.1,0),interactTargets:[issue.children[0]],update(o,t,dt){
  const mode=o.hypeMode||0;amount=damp(amount,mode===2?1:0,dt);
  people.forEach((p,i)=>{const [x,z]=positions[i],a=Math.atan2(z,x);const moving=mode===0?t*.065:0;
   const tx=mode===0?Math.cos(a+moving)*2.35:x*(mode===2?.68:1),tz=mode===0?Math.sin(a+moving)*1.5:z*(mode===2?.65:1)+(mode===2?.25:0);
   p.position.x=damp(p.position.x,tx,dt);p.position.z=damp(p.position.z,tz,dt);p.position.y=damp(p.position.y,mode===0?.35:.12,dt);
   p.rotation.y=Math.atan2(-p.position.x,.4-p.position.z);const badge=badges[i];badge.visible=mode===0;badge.position.set(p.position.x,1.76+Math.sin(t+i)*.035,p.position.z);
   pedestals[i].scale.y=damp(pedestals[i].scale.y,mode===0?1:.04,dt);pedestals[i].position.set(p.position.x,damp(pedestals[i].position.y,mode===0?.23:.125,dt),p.position.z);
  });
  ramp.rotation.x=damp(ramp.rotation.x,mode===2&&o.hypeRepair!==false?.20:-Math.PI*.49,dt);
  proposal.visible=mode===2;title.visible=mode!==2;route.visible=mode===2;orbit.scale.setScalar(1-amount*.16);
  root.userData.result={mode,labels:mode===0,sharedProblem:mode===2,repaired:mode===2&&o.hypeRepair!==false};
 }};
}

const makers={process:processScene,door:doorScene,work:workScene,hype:hypeScene};
const permitted={boundary:['process','door'],power:['work'],'alienation-two':['hype']};
export function withAIStudies(base,id){
 if(!permitted[id])return base;
 const root=group(),cache=new Map(),focusPoint=base.focusPoint.clone();root.add(base.root);let active=base,previous='';
 return {root,legacyRoot:base.root,focusPoint,get interactTargets(){return active.interactTargets||[];},
  update(o,t,dt=.016){
   const key=permitted[id].includes(o.aiCase)?o.aiCase:'';
   if(key&&!cache.has(key)){const made=makers[key]();made.root.scale.setScalar(.76);made.root.position.y=.22;cache.set(key,made);root.add(made.root);}
   active=key?cache.get(key):base;base.root.visible=!key;cache.forEach((v,k)=>v.root.visible=k===key);
   if(previous!==key){previous=key;focusPoint.copy(active.focusPoint);}
   active.update(o,t,dt);root.userData.aiCase=key;root.userData.result=active.root.userData.result;
  }
 };
}
