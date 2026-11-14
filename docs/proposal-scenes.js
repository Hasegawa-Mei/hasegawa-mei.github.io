import * as T from 'three';
import {box,cyl,torus,sphere,rod,group} from './scenes.js';
import {placeAsset} from './model-library.js';
import {proposals,initialProposal} from './proposal-content.js';

const blue='#2944d6',damp=(a,b,dt)=>T.MathUtils.damp(a,b,5,dt);
function palette(){const local=m=>{m.userData.local=true;return m;};return {
 white:local(new T.MeshStandardMaterial({color:'#f6f6f3',roughness:.38})),
 blue:local(new T.MeshStandardMaterial({color:blue,roughness:.27,metalness:.15})),
 metal:local(new T.MeshStandardMaterial({color:'#bfc9d3',roughness:.3,metalness:.65})),
 dark:local(new T.MeshStandardMaterial({color:'#2b3549',roughness:.55})),
 soft:local(new T.MeshStandardMaterial({color:'#d3dbe5',roughness:.75})),
 glass:local(new T.MeshPhysicalMaterial({color:'#e7efff',transmission:.9,roughness:.09,thickness:.17,ior:1.48,dispersion:.45,envMapIntensity:1.6,side:T.DoubleSide})),
 light:local(new T.MeshStandardMaterial({color:'#fff7df',emissive:'#ffe4a6',emissiveIntensity:.45,roughness:.4}))};}
function label(p,str,x,y,z,w=1.2,h=.22,color=blue){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=Math.max(64,Math.round(768*h/w));const c=canvas.getContext('2d');c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;let size=canvas.height*.68;c.font=`500 ${size}px "Microsoft YaHei",sans-serif`;if(c.measureText(str).width>730){size*=730/c.measureText(str).width;c.font=`500 ${size}px "Microsoft YaHei",sans-serif`;}c.fillText(str,384,canvas.height/2);const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;const m=new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:T.DoubleSide});m.userData.local=true;const n=new T.Mesh(new T.PlaneGeometry(w,h),m);n.position.set(x,y,z);n.layers.set(30);p.add(n);return n;}
function base(root,m){box(root,6.6,.14,4.25,0,.03,0,m.white,.10);box(root,6.36,.012,.028,0,.108,1.94,m.blue,.004);for(let i=0;i<3;i++)box(root,.035,.012,.035,2.68+i*.09,.114,1.81,m.metal,.003);}
function actor(p,x,z,m,scale=.8){const g=group(p,x,.12,z),asset=placeAsset(g,'FIG_STAND',0,0,0,scale);if(asset)asset.traverse(n=>{if(n.isMesh){n.material=m.white;n.castShadow=true;}});else{sphere(g,.13*scale,0,1.3*scale,0,m.white);box(g,.26*scale,.54*scale,.19*scale,0,.92*scale,0,m.white,.07);for(const s of [-1,1])rod(g,[s*.08*scale,.7*scale,0],[s*.1*scale,.05,0],.05*scale,m.white);}return g;}
function table(p,x,z,m,w=1.25){const g=group(p,x,0,z);box(g,w,.11,.78,0,.86,0,m.white,.045);for(const side of [-1,1])box(g,.055,.69,.62,side*(w/2-.1),.47,0,m.metal,.01);return g;}
function path(p,points,m,r=.012){const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v)));const n=new T.Mesh(new T.TubeGeometry(curve,32,r,6,false),m);p.add(n);return n;}
function lamp(p,m,scale=1){const g=group(p);g.scale.setScalar(scale);cyl(g,.24,.055,0,.04,0,m.white);rod(g,[0,.05,0],[0,.84,0],.025,m.metal);const head=new T.Mesh(new T.CylinderGeometry(.17,.31,.24,32,1,true),m.white);head.position.set(0,.92,0);g.add(head);cyl(g,.27,.015,0,.8,0,m.light);return g;}
function button(p,x,y,z,m){const g=group(p,x,y,z);cyl(g,.19,.07,0,0,0,m.metal);return cyl(g,.145,.04,0,.054,0,m.blue);}

function allocationScene(){const root=group(),m=palette();base(root,m);
 const platform=group(root,0,0,-.12);cyl(platform,1.05,.12,0,.85,0,m.white);cyl(platform,.47,.69,0,.46,0,m.glass);torus(platform,1.02,.016,0,.92,0,m.blue);
 const areas=[[-2,.32],[0,1.35],[2,.32]],trays=areas.map(([x,z],i)=>{const g=table(root,x,z,m,1.5);const target=box(g,1.24,.035,.57,0,.94,0,m.glass,.025);target.userData.proposalAction='allocate:'+i;label(g,['休息','共同学习','共同项目'][i],0,1.16,.15,1.18,.23);return target;});
 const people=[actor(root,-2.4,-1,m),actor(root,0,-1.5,m),actor(root,2.4,-1,m)];people[0].rotation.y=.8;people[2].rotation.y=-.8;
 const modules=Array.from({length:6},(_,i)=>{const g=group(root,(i%3-1)*.32,1.04,Math.floor(i/3)*.37-.48);box(g,.24,.12,.30,0,0,0,m.blue,.025);box(g,.13,.009,.018,0,.066,0,m.white,.003);return g;});
 const ribbons=areas.map(([x,z])=>path(root,[[0,.14,-.3],[x*.6,.14,z*.5],[x,.14,z]],m.blue));
 const proposed=label(root,'提案 / 等待共同确认',0,2.05,-.25,2.9,.25),confirmed=label(root,'共同确认 · 约定复议',0,2.05,-.25,2.9,.25),review=label(root,'异议保留 · 重新协商',0,2.05,-.25,2.9,.25);
 const switcher=button(platform,0,.94,.68,m);let height=0;
 return {root,focusPoint:new T.Vector3(0,1,0),interactTargets:[switcher,...trays],update(s,t,dt){const assigned=[];s.allocation.forEach((n,side)=>{for(let j=0;j<n;j++)assigned.push([side,j]);});modules.forEach((n,i)=>{const a=assigned[i],p=a?[areas[a[0]][0]+(a[1]%3-1)*.32,1.06+Math.floor(a[1]/3)*.15,areas[a[0]][1]]:[(i%3-1)*.32,1.04,Math.floor(i/3)*.37-.48];n.position.x=damp(n.position.x,p[0],dt);n.position.y=damp(n.position.y,p[1],dt);n.position.z=damp(n.position.z,p[2],dt);});height=damp(height,s.stage==='confirmed'?1:0,dt);ribbons.forEach(n=>n.visible=height>.05);people.forEach((p,i)=>p.position.z=damp(p.position.z,(i===1?-1.5:-1)+height*.3,dt));proposed.visible=s.stage==='draft';confirmed.visible=s.stage==='confirmed';review.visible=s.stage==='review';root.userData.result={allocated:assigned.length,stage:s.stage};}};
}

function assistantScene(){const root=group(),m=palette();base(root,m);const desk=table(root,0,0,m,3.7);box(desk,3.5,.035,1.45,0,.93,0,m.white,.04);
 const light=group(root,0,1,0);cyl(light,.64,.11,0,.06,0,m.white);cyl(light,.55,.06,0,.15,0,m.metal);cyl(light,.08,1.04,0,.72,0,m.metal);cyl(light,.5,.07,0,1.25,0,m.white);cyl(light,.44,.025,0,1.2,0,m.light);torus(light,.53,.022,0,.2,0,m.blue);
 const back=new T.Mesh(new T.CylinderGeometry(.56,.56,1.06,48,1,true,Math.PI/2,Math.PI),m.glass);back.position.y=.72;light.add(back);
 const pivot=group(light,-.56,.72,0),door=new T.Mesh(new T.CylinderGeometry(.56,.56,1.06,48,1,true,-Math.PI/2,Math.PI),m.white);door.position.x=.56;door.userData.proposalAction='door';pivot.add(door);rod(pivot,[1.04,-.13,.15],[1.04,.13,.15],.021,m.blue);
 const sensor=sphere(light,.065,0,.72,.46,m.blue),micLine=path(root,[[-2,.14,.55],[-1,.14,.6],[0,.14,.2]],m.blue);
 const person=actor(root,-2,-.7,m,.88);person.rotation.y=.7;
 const temporary=group(root,1.7,1.15,.2);box(temporary,.72,.72,.045,0,0,0,m.glass,.025);label(temporary,'当次请求',0,.02,.04,.62,.18);
 const memory=group(root,2.35,.95,-.85);box(memory,.6,.72,.48,0,0,0,m.white,.045);label(memory,'已授权偏好',0,.03,.25,.55,.16);torus(memory,.1,.012,0,.23,.255,m.blue,0);
 label(root,'照明继续',-.82,1.14,.45,.75,.19);const doorText=label(root,'感知已停止',.1,2.64,.1,1.75,.23);const particles=Array.from({length:4},()=>sphere(root,.035,0,0,0,m.blue));
 return {root,focusPoint:new T.Vector3(0,1.5,0),interactTargets:[door],update(s,t,dt){pivot.rotation.y=damp(pivot.rotation.y,s.open?-1.25:0,dt);sensor.material=s.open?m.blue:m.soft;temporary.visible=!!s.request;memory.visible=s.remembered;doorText.visible=!s.open;micLine.visible=s.open&&s.request;particles.forEach((n,i)=>{n.visible=s.open&&s.request;const u=(t*.2+i*.25)%1;n.position.set(-1.7+u*1.7,1.5+Math.sin(u*Math.PI)*.3,.5);});root.userData.result={sensing:s.open,temporary:s.request,memory:s.remembered,lighting:true};}};
}

function stationScene(){const root=group(),m=palette();base(root,m);
 const cabinet=group(root,-2.15,0,-.5);box(cabinet,1.15,1.85,.74,0,1.05,0,m.white,.08);box(cabinet,.94,1.54,.035,0,1.1,.39,m.glass,.04);box(cabinet,.75,.10,.08,0,1.44,.42,m.dark,.015);label(cabinet,'归还',0,1.86,.43,.65,.22);for(let i=0;i<3;i++)box(cabinet,.88,.025,.6,0,.5+i*.44,.04,m.metal,.005);
 const repair=table(root,0,.15,m,1.65);label(repair,'检修 / 修补',0,1.22,-.20,1.4,.22);for(let i=0;i<3;i++)rod(repair,[-.52+i*.17,.94,-.25],[-.42+i*.17,.94,.02],.018,m.metal);torus(repair,.1,.012,.55,.97,0,m.blue);
 const shelf=group(root,2.05,0,-.5);for(const x of [-.53,.53])box(shelf,.065,1.8,.065,x,1.02,0,m.metal,.012);for(const y of [.45,1.03,1.7])box(shelf,1.2,.07,.8,0,y,0,m.white,.025);label(shelf,'再次领用',0,2,.15,1.1,.22);
 const bag=group(root,-2.55,.6,1.15);box(bag,.62,.68,.18,0,.25,0,m.white,.05);const handle=torus(bag,.17,.027,0,.69,0,m.metal,0);handle.scale.y=.78;box(bag,.55,.065,.19,0,.39,0,m.blue,.01);
 const tear=box(bag,.18,.016,.012,.09,.13,.10,m.dark,.003);tear.rotation.z=.6;const patch=box(bag,.24,.20,.018,.09,.13,.11,m.blue,.015);for(let i=0;i<4;i++)box(patch,.012,.022,.01,-.08+i*.055,.08,.015,m.white,.002);
 const owner=actor(root,-2.6,1.2,m,.72),next=actor(root,2.6,1.15,m,.72),maintainer=actor(root,0,-1,m,.85);maintainer.rotation.y=Math.PI;
 const sign=label(root,'维护者待落实',0,2,-.7,2,.25);const staffed=label(root,'商店轮值 · 共同维护',0,2,-.7,2.3,.25);
 path(root,[[-2.15,.13,.3],[0,.13,1],[2.05,.13,.3]],m.blue);
 const points=[[-2.55,.6,1.15],[-2.15,.77,-.08],[0,.95,.22],[2.05,1.17,-.38],[2.55,.6,1.15]];
 return {root,focusPoint:new T.Vector3(0,1.05,0),interactTargets:[bag.children[0]],update(s,t,dt){const target=points[s.stage];['x','y','z'].forEach((axis,i)=>bag.position[axis]=damp(bag.position[axis],target[i],dt));bag.rotation.y=damp(bag.rotation.y,s.stage===2?-.2:0,dt);patch.visible=s.stage>=3;tear.visible=s.stage<3;maintainer.visible=s.maintainer;sign.visible=!s.maintainer;staffed.visible=s.maintainer;root.userData.result={stage:s.stage,patched:s.stage>=3,sameBag:true,maintainer:s.maintainer};}};
}

function borrowingScene(){const root=group(),m=palette();base(root,m);
 const cabinet=group(root,-1.8,0,-.45);box(cabinet,1.7,2.2,.9,0,1.22,0,m.white,.07);for(const x of [-.4,.4]){box(cabinet,.74,1.68,.055,x,1.25,.48,m.glass,.03);for(const y of [.55,1.39])box(cabinet,.72,.04,.7,x,y,0,m.metal,.006);}label(cabinet,'七日借用',0,2.51,.25,1.5,.24);
 const desk=table(root,1.7,.15,m,1.8);box(desk,.7,.015,.44,0,.94,0,m.white,.01);for(let i=0;i<4;i++)box(desk,.4,.008,.012,-.06,.952,-.1+i*.07,m.soft,.002);const visitor=actor(root,1.8,1.15,m,.77);visitor.rotation.y=Math.PI;
 const object=group(root,-1.8,.59,.03),light=lamp(object,m,.72),recorder=group(object);box(recorder,.28,.52,.12,0,.27,0,m.white,.04);box(recorder,.20,.22,.015,0,.25,.07,m.glass,.015);for(let i=0;i<4;i++)box(recorder,.15,.008,.008,0,.44+i*.015,.065,m.dark,.001);cyl(recorder,.04,.02,0,.09,.075,m.blue).rotation.x=Math.PI/2;
 const ticks=Array.from({length:7},(_,i)=>{const g=group(root,-1.65+i*.55,.13,1.52);cyl(g,.15,.04,0,0,0,m.soft);label(g,String(i+1),0,.19,.06,.18,.16);return g;});
 const unused=label(root,'尚未使用',1.6,1.8,.1,1.4,.22),used=label(root,'进入实际生活',1.6,1.8,.1,1.6,.22),returned=label(root,'可以归还，不必购买',0,2.95,0,2.5,.23);
 return {root,focusPoint:new T.Vector3(0,1.1,0),interactTargets:[cabinet.children[0]],update(s,t,dt){light.visible=s.task===0;recorder.visible=s.task===1;const out=s.day>0&&s.decision!=='return';object.position.x=damp(object.position.x,out?1.55:-1.8,dt);object.position.y=damp(object.position.y,out?.94:.59,dt);object.position.z=damp(object.position.z,out?.17:.03,dt);ticks.forEach((n,i)=>{n.children[0].material=i<s.day?m.blue:m.soft;n.scale.y=damp(n.scale.y,s.used.includes(i+1)?2.2:1,dt);});unused.visible=!!s.day&&!s.used.length;used.visible=s.used.length>0&&s.decision!=='return';returned.visible=s.decision==='return';visitor.position.z=damp(visitor.position.z,out?1.15:1.5,dt);root.userData.result={day:s.day,uses:s.used.length,decision:s.decision};}};
}

function pauseScene(){const root=group(),m=palette();base(root,m);
 const gate=group(root,0,0,-.25),wings=[];
 for(const side of [-1,1]){const g=group(gate,side*2.3,0,0);cyl(g,.14,1.12,0,.68,0,m.white);const wing=group(g,0,1.02,0);box(wing,1.65,.13,.10,-side*.82,0,0,m.white,.018);for(let i=0;i<5;i++)box(wing,.055,.62,.055,-side*(.17+i*.30),-.35,0,m.metal,.009);wings.push(wing);}
 const person=actor(root,-.75,1.2,m,.93),operator=actor(root,2.2,-1.12,m,.75),responder=actor(root,.9,.35,m,.80);person.rotation.y=Math.PI;operator.rotation.y=-.7;
 const controls=group(root,2.25,0,.95);cyl(controls,.25,.65,0,.44,0,m.white);const stopA=button(controls,0,.81,0,m);stopA.userData.proposalAction='pause-operator';label(controls,'管理者暂停',0,1.12,.15,1.1,.18);
 const access=group(root,-1.75,0,1.05);cyl(access,.25,.65,0,.44,0,m.white);const stopB=button(access,0,.81,0,m);stopB.userData.proposalAction='pause-person';label(access,'当事人暂停',0,1.12,.15,1.1,.18);
 const seat=table(root,.7,-1.05,m,1.4);label(seat,'人工回应席',0,1.3,.05,1.4,.22);const documents=group(root,0,1.8,-.4);box(documents,1.45,.75,.035,0,0,0,m.glass,.03);label(documents,'理由：停留影响通行',0,.15,.04,1.3,.17);label(documents,'责任：现场负责人',0,-.12,.04,1.2,.17);
 const route=path(root,[[.45,.13,1.9],[.55,.13,.3],[.65,.13,-1.7]],m.blue,.025);const waiting=label(root,'已暂停 · 仍待回应',-.7,2.6,0,2.4,.24);const alternative=label(root,'保留停留区 / 留出通行带',0,2.6,0,3.2,.24);
 return {root,focusPoint:new T.Vector3(0,1.05,0),interactTargets:[stopB,stopA],update(s,t,dt){wings.forEach((w,i)=>w.rotation.y=damp(w.rotation.y,s.stage===5?(i?-1:1)*1.48:s.stage>=1?(i?-.35:.35):(i?-.95:.95),dt));documents.visible=s.stage>=1&&s.stage<5;responder.visible=s.stage>=4;waiting.visible=s.stage===2||s.stage===3;alternative.visible=route.visible=s.stage===5;person.position.x=damp(person.position.x,s.stage===5?-1.15:-.75,dt);responder.position.z=damp(responder.position.z,s.stage>=4?.25:-1.05,dt);root.userData.result={stage:s.stage,paused:s.stage>=2,responded:s.stage>=4,alternative:s.stage===5};}};
}

const makers={2:allocationScene,3:assistantScene,4:stationScene,5:borrowingScene,6:pauseScene};
export function withProposalStudies(base,id){
 const unit=Object.keys(proposals).find(i=>proposals[i].id===id);if(!unit)return base;
 const root=group(),proposal=makers[unit](),fallback=initialProposal(+unit),focusPoint=base.focusPoint.clone();root.add(base.root,proposal.root);proposal.root.visible=false;let active=base,enter=1,previous=false;
 return {root,focusPoint,get interactTargets(){return active.interactTargets||[];},
  async prepare(renderer,scene,camera){proposal.root.visible=true;base.root.visible=false;proposal.update(fallback,0,1);await renderer.compileAsync(scene,camera);renderer.render(scene,camera);proposal.root.visible=false;base.root.visible=true;},
  update(o,t,dt=.016){const show=!!o.proposalActive;if(show!==previous){previous=show;enter=0;}active=show?proposal:base;base.root.visible=!show;proposal.root.visible=show;enter=damp(enter,1,dt);proposal.root.position.y=.22+(1-enter)*.1;proposal.root.scale.setScalar(.73+enter*.03);focusPoint.copy(active.focusPoint);active.update(show?(o.proposalState||fallback):o,t,dt);root.userData.proposal=show?proposals[unit].name:'';root.userData.result=active.root.userData.result;}
 };
}
