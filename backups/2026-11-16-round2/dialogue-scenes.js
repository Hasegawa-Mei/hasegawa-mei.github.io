import {placeAsset} from './model-library.js';
import {withAIStudies} from './ai-scenes.js';
import {withProposalStudies} from './proposal-scenes.js';
import {parkTree,foldedSeat,benchArm,hinge,weatherHardware} from './product-finish.js';
import * as T from 'three';
import {box,cyl,torus,sphere,rod,group,glass,createScene as originalScene} from './scenes.js';
const blue='#243dca',paper='#eceeed';
function mat(color,roughness=.5,metalness=0){return new T.MeshStandardMaterial({color,roughness,metalness});}
const chalk=mat('#eff0ed'),wood=mat('#e4e2da',.87),steel=mat('#d2d7de',.28,.65),rope=mat('#d5d0c4',1),ink=mat('#292f3d',.4),azure=mat(blue,.27,.25);
const crystal=new T.MeshPhysicalMaterial({color:'#e3ecff',roughness:.055,transmission:.94,thickness:.32,ior:1.48,dispersion:.65,metalness:0,envMapIntensity:2.15,clearcoat:.6,clearcoatRoughness:.045});
const crownGlass=new T.MeshPhysicalMaterial({color:'#ffffff',roughness:.035,transmission:.96,thickness:.38,ior:1.5,dispersion:0,envMapIntensity:2.4,side:T.DoubleSide});
function glaze(g,m=crystal){g.traverse(o=>{if(o.isMesh){o.material=m;o.castShadow=false;}});return g;}
const mix=(a,b,t)=>T.MathUtils.lerp(a,b,t);
function capsule(p,r,h,a,b,m=chalk){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);const o=new T.Mesh(new T.CapsuleGeometry(r,Math.max(.001,d.length()-2*r),5,12),m);o.castShadow=true;o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());p.add(o);return o;}
function human(p,x,z,seated=false,seatHeight=.80){
 const g=group(p,x,0,z);
 const figure=placeAsset(g,seated?'FIG_SIT':'FIG_STAND',0,seated?seatHeight-.435:.12,0);
 if(figure)return g;
 g.name=seated?'Figure_Seated':'Figure_Standing';sphere(g,.16,0,seated?1.34:1.55,0,chalk,[.86,1.13,.9]);capsule(g,.17,0,[0,seated?.83:.84,0],[0,seated?1.16:1.36,0]);
 for(const s of [-1,1]){if(seated){capsule(g,.075,0,[s*.105,.88,0],[s*.13,.86,.47]);capsule(g,.06,0,[s*.13,.86,.47],[s*.13,.16,.47]);box(g,.17,.12,.28,s*.13,.14,.55,chalk,.05);capsule(g,.055,0,[s*.19,1.12,0],[s*.24,.95,.13]);capsule(g,.05,0,[s*.24,.95,.13],[s*.16,.95,.30]);}else{capsule(g,.073,0,[s*.10,.91,0],[s*.13,.16,0]);box(g,.17,.12,.28,s*.13,.13,.07,chalk,.05);capsule(g,.056,0,[s*.18,1.29,0],[s*.24,.86,.07]);}}return g;}
function wheelchair(p,x,z){const g=group(p,x,0,z);g.name='Wheelchair_Assembly';const h=human(g,0,0,true,.12+.490*1.17);
 if(placeAsset(g,'WHEELCHAIR',0,.12,0,1.17))return g;
 h.scale.setScalar(.95);for(const s of [-1,1]){torus(g,.30,.032,s*.31,.40,.06,ink,Math.PI/2).rotation.y=Math.PI/2;torus(g,.247,.012,s*.35,.40,.06,steel,Math.PI/2).rotation.y=Math.PI/2;rod(g,[s*.28,.40,.06],[s*.28,.26,.55],.023,steel);torus(g,.09,.023,s*.27,.19,.54,ink,0).rotation.y=Math.PI/2;rod(g,[s*.25,.42,.07],[s*.25,1.01,-.15],.022,steel);rod(g,[s*.25,.88,-.15],[s*.25,.88,.30],.025,azure);}box(g,.5,.05,.48,0,.72,.05,azure,.025);box(g,.48,.38,.045,0,.92,-.17,azure,.025);box(g,.44,.04,.2,0,.14,.56,steel,.02);return g;}
function ground(root){box(root,6.8,.16,4.5,0,.01,0,chalk,.12);box(root,6.67,.025,4.37,0,.101,0,mat('#f5f5f1'),.10);for(let i=0;i<4;i++){box(root,.05,.012,.05,2.63+i*.11,.123,1.91,['#d43e89','#9cbd3c','#e3d634','#27b7cc'][i],.004);}for(let i=0;i<4;i++)box(root,6.5,.006,.009,0,.119,-1.55+i*.95,mat('#dcdedc'),0);}
function path(root,points,color=blue){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const o=new T.Mesh(new T.TubeGeometry(curve,40,.018,6,false),mat(color,.4));root.add(o);return o;}
function tree(p,x,z,s=1){return parkTree(p,x,z,s,{wood,chalk,steel});}
function sign(p,x,z){const g=group(p,x,0,z);cyl(g,.025,1,0,.62,0,steel);box(g,.45,.32,.045,0,1.14,0,glass,.015);box(g,.20,.025,.015,0,1.15,.04,azure,.005);return g;}
function fence(){const root=group();ground(root);tree(root,-2.7,-1.45,.85);tree(root,2.6,-1.6,.65);const variants=[];const gates=[];
 for(let type=0;type<3;type++){const g=group(root);variants.push(g);const height=[.82,.94,2.15][type],m=type===0?wood:type===1?chalk:steel;for(let i=0;i<5;i++){const x=-2.5+i*1.25;if(type===0){cyl(g,.065,height,x,.13+height/2,0,m);sphere(g,.07,x,height+.13,0,m);}else box(g,.065,height,.065,x,.13+height/2,0,m,.015);box(g,.18,.035,.18,x,.14,0,steel,.012);}
  for(let i=0;i<4;i++){const pivot=group(g,-2.5+i*1.25,0,0);if(i===2){gates[type]=pivot;hinge(pivot,steel,height);}
   if(type===0){const pts=[];for(let j=0;j<=12;j++){const t=j/12;pts.push(new T.Vector3(t*1.25,.89-Math.sin(t*Math.PI)*.11,0));}const cable=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),30,.026,7,false),rope);cable.castShadow=true;pivot.add(cable);}
   if(type===1){for(const y of [.48,.95])box(pivot,1.2,.12,.065,.625,y,0,m,.015);}
   if(type===2){for(let j=1;j<8;j++)box(pivot,.026,2.05,.026,j*1.25/8,1.18,0,steel,.006);for(const y of [.32,2.2])box(pivot,1.25,.055,.055,.625,y,0,steel,.01);}
  }
 }
 const visitor=traveler(root),chair=wheelchair(root,-.7,1.18);glaze(chair.children[0]);chair.rotation.y=Math.PI;
 const mark=sign(root,1.8,.28),walkPath=path(root,[[-.7,.133,1.9],[-.7,.133,.7],[-.7,.133,-1.55]]),gatePath=path(root,[[-.7,.134,1.9],[-.3,.134,.9],[.65,.134,.4],[.65,.134,-.7],[1,.134,-1.6]]);
 const warning=group(root);for(let i=0;i<4;i++){box(warning,.65,.018,.10,-1.2+i*.8,.14,-1.3,azure,.01).rotation.y=-.5;if(i<3){const cone=new T.Mesh(new T.ConeGeometry(.13,.38,12),azure);cone.position.set(-1+i*.85,.34,-1.05);warning.add(cone);}}
 let openness=0,progress=0,signature='';
 return{root,focusPoint:new T.Vector3(0,.9,0),update(o,t,dt){const type=o.material??0,key=[type,o.gate,o.wheelchair,o.hazard,o.replay].join();if(key!==signature){signature=key;progress=0;}
 const allowed=!o.hazard&&(o.gate||(!o.wheelchair&&type<2)),cross=allowed&&!o.gate;
 progress=Math.min(1,progress+(o.reading===false?0:dt/4.2));const u=T.MathUtils.smoothstep(progress,.15,.96),travel=allowed?u:Math.min(u,.24);
 variants.forEach((g,i)=>g.visible=i===type);openness=T.MathUtils.damp(openness,o.gate?1:0,5,dt);gates.forEach(g=>g.rotation.y=-openness*Math.PI*.48);
 const x=o.gate?mix(-.7,.65,Math.min(1,travel*3)):-.7,z=mix(1.6,-1.35,travel);
 const lift=cross?T.MathUtils.smoothstep(travel,.24,.43)*(1-T.MathUtils.smoothstep(travel,.61,.8))*1.04:0;
 visitor.root.visible=!o.wheelchair;chair.visible=!!o.wheelchair;visitor.root.position.set(x,lift,z);visitor.pose(progress<.99&&travel>0&&(allowed||u<.24)?t*6:0,lift);chair.position.set(x,0,z);
 if(chair.visible){const distance=1.6-z;for(const side of ['NEG','POS']){
   const wheel=chair.getObjectByName('WHEEL_'+side),caster=chair.getObjectByName('CASTER_'+side);
   if(wheel)wheel.rotation.x=distance/(.309*1.17);
   if(caster)caster.rotation.x=distance/(.089*1.17);
 }}
 gatePath.visible=!!o.gate&&!o.hazard;walkPath.visible=!o.gate;walkPath.material.color.set(allowed?blue:'#b7bdc6');warning.visible=!!o.hazard;mark.rotation.y=Math.sin(t*.3)*.03;
 root.userData.result=o.hazard?'no-purpose':allowed?(progress===1?'arrived':cross?'crossing':'walking'):'blocked';root.userData.traveler={x,z,lift};}};
}
function traveler(root){
 const g=group(root);g.rotation.y=Math.PI;
 const actor=placeAsset(g,'FIG_STAND',0,.12,0,.97);
 if(actor){
   glaze(actor);
   const joints=['NEG','POS'].map(side=>Object.fromEntries(['HIP','KNEE','ANKLE','SHOULDER','ELBOW'].map(name=>[name,actor.getObjectByName(name+'_'+side)])));
   return {root:g,pose(t,lift){joints.forEach((leg,index)=>{
     const stride=t?Math.sin(t+index*Math.PI):0;
     const forward=Math.max(0,stride);
     const hip=-stride*.36-lift*(index?.14:.40);
     const knee=forward*.43+lift*(index?.3:.74);
     if(leg.HIP)leg.HIP.rotation.x=hip;
     if(leg.KNEE)leg.KNEE.rotation.x=knee;
     if(leg.ANKLE)leg.ANKLE.rotation.x=-.65*(hip+knee);
     if(leg.SHOULDER)leg.SHOULDER.rotation.x=stride*.23;
     if(leg.ELBOW)leg.ELBOW.rotation.x=-forward*.14;
   });}};
 }
 sphere(g,.16,0,1.56,0,crystal,[.86,1.13,.9]);capsule(g,.17,0,[0,.92,0],[0,1.36,0],crystal);
 const limbs=[],feet=[];for(const side of [-1,1]){const upper=capsule(g,.07,0,[side*.11,.91,0],[side*.11,.5,0],crystal),lower=capsule(g,.06,0,[side*.11,.5,0],[side*.11,.16,0],crystal),arm=capsule(g,.055,0,[side*.18,1.30,0],[side*.23,.87,0],crystal);limbs.push({side,upper,lower,arm});feet.push(box(g,.17,.12,.28,side*.13,.13,.07,crystal,.05));}
 function fit(mesh,a,b,length){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);mesh.position.copy(av.add(bv).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());mesh.scale.y=d.length()/length;}
 return{root:g,pose(t,lift){limbs.forEach(({side,upper,lower,arm},i)=>{const swing=t?Math.sin(t+i*Math.PI):0,knee=[side*.13,.50+Math.max(0,swing)*.18+lift*.08,swing*.18+lift*.14],foot=[side*.13,.16+Math.max(0,swing)*.14,swing*.28];fit(upper,[side*.11,.91,0],knee,.41);fit(lower,knee,foot,.34);fit(arm,[side*.18,1.3,0],[side*.23,.87,-swing*.16],.43);feet[i].position.set(foot[0],foot[1]-.03,foot[2]+.07);});}};
}

function bench(){const root=group();ground(root);tree(root,-2.6,-1.4,.85);tree(root,2.5,-1.5,.65);const g=group(root,0,.062,-.18);g.scale.y=.67;
 const seat=foldedSeat(g,chalk);for(const x of [-1.55,1.55]){box(g,.10,.57,.52,x,.44,0,steel,.025);box(g,.45,.035,.62,x,.145,0,steel,.018);}box(g,3.7,.08,.06,0,.61,-.15,steel,.018);
 function arm(x){return benchArm(g,x,azure,steel);}
 const middle=[arm(-.64),arm(.64)],sides=[arm(-1.8),arm(1.8)],seated=glaze(human(root,-1.1,-.18,true,.598));const wheel=wheelchair(root,2.3,.05);wheel.rotation.y=-.12;
 const access=group(root,2.28,0,.10);for(const x of [-.6,.6])box(access,.015,.008,1.55,x,.126,0,azure,.002);for(const z of [-.77,.77])box(access,1.2,.008,.015,0,.126,z,azure,.002);
 const stand=human(root,.90,1.05);stand.rotation.y=-.35;rod(stand,[.34,.9,.15],[.40,.15,.35],.027,crystal);sphere(stand,.036,.4,.15,.35,ink);
 const reference=group(root);const camden=camdenBench(reference);camden.position.z=-.18;const witness=glaze(human(reference,1.95,.83));witness.rotation.y=-.6;
 const plate=sign(root,-2.05,.75);let v=0;return{root,focusPoint:new T.Vector3(0,.8,0),update(o,t,dt){g.visible=seated.visible=!o.reference;reference.visible=!!o.reference;v=T.MathUtils.damp(v,o.material??0,6,dt);const fit=Math.max(0,v-1);seat.scale.x=1-fit*.18;seat.position.x=-fit*.35;middle.forEach(a=>{a.scale.y=Math.max(.001,1-Math.min(v,1));a.visible=v<.98;});sides.forEach(a=>{a.scale.y=Math.max(.001,Math.min(v,1));a.visible=v>.02;});sides[1].position.x=1.8-fit*.70;wheel.visible=access.visible=(o.material===2)&&!o.reference;stand.visible=o.material!==2&&!o.reference;seated.rotation.y=0;}};
}
function solarCrown(p,x,y,z){
 const g=group(p,x,y,z),vertices=[],indices=[],n=100;
 for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,spike=1-Math.abs((i%10)/5-1),outer=.175+.12*spike,inner=.13,top=.055+.075*spike;for(const [r,h] of [[.175,0],[outer,top],[.13,0],[inner,top]])vertices.push(Math.cos(a)*r,h,Math.sin(a)*r);}
 for(let i=0;i<n;i++){const a=i*4,b=a+4;indices.push(a,b,a+1,a+1,b,b+1,a+2,a+3,b+2,a+3,b+3,b+2,a+1,b+1,a+3,a+3,b+1,b+3,a,a+2,b,a+2,b+2,b);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new T.Mesh(geo,crownGlass);mesh.name='Ten-point glass sun crown';g.add(mesh);torus(g,.155,.019,0,.015,0,crownGlass);return g;
}
function power(){const root=group();ground(root);const throne=group(root,0,0,-.35);throne.name='Throne_Assembly';
 const royalSeat=placeAsset(throne,'THRONE',0,.12,0);
 if(!royalSeat){box(throne,1.25,.2,1.15,0,.28,0,chalk,.08);box(throne,1.02,.65,.90,0,.64,0,chalk,.06);box(throne,1.12,1.85,.18,0,1.28,-.45,chalk,.08);box(throne,.85,.08,.78,0,1.02,.02,azure,.035);for(const x of [-.53,.53])box(throne,.14,.38,.75,x,1.12,0,chalk,.035);}
 const seatY=royalSeat?1.104:1.06;
 glaze(human(throne,0,-.009,true,seatY));
 box(throne,.69,.12,.42,0,seatY-.435-.06,.30,chalk,.03);
 solarCrown(throne,0,seatY-.435+1.387,-.022);
 const panel=group(root,0,0,1.36);cyl(panel,.58,.13,0,.2,0,chalk);cyl(panel,.40,.08,0,.305,0,glass);const button=cyl(panel,.24,.09,0,.39,0,azure);torus(panel,.29,.012,0,.37,0,steel);
 const supporters=group(root);const lights=[];const positions=[[-2.25,-1.15],[-1.65,1.1],[1.65,-1.2]];positions.forEach(([x,z],i)=>{const h=human(supporters,x,z);h.rotation.y=Math.atan2(-x,-z);const m=mat(blue,.3);m.emissive.set(blue);const l=cyl(root,.21,.025,x,.15,z,m);lights.push(l);const link=path(root,[[x,.14,z],[x*.65,.14,z*.7],[0,.14,-.3]],blue);link.material=m;});
 const executor=human(root,2.35,.95);executor.rotation.y=-.9;const receive=box(root,.32,.04,.40,2.35,1.04,1.30,azure,.02);const route=path(root,[[0,.15,1.36],[1,.15,1.72],[2.35,.15,1.3]],blue);const pulse=sphere(root,.055,0,.23,1.36,azure);const halo=torus(root,.23,.013,0,.38,1.36,azure);
 const outcome=group(root,2.35,0,-.65);cyl(outcome,.34,.08,0,.18,0,chalk);const signal=box(outcome,.10,1.25,.10,0,.83,0,steel,.02),flag=box(outcome,.70,.42,.035,.32,1.35,0,azure,.02);label(outcome,'命令结果',0,.38,.12,.80,.15);
 const shared=group(root,0,0,.35);cyl(shared,.72,.12,0,.70,0,crystal);shared.visible=false;
 let press=0,performed=0;
 return{root,interactTargets:[button],focusPoint:new T.Vector3(0,1.1,0),update(o,t,dt){press=T.MathUtils.damp(press,t-(o.commandAt??-100)<.8?1:0,12,dt);button.position.y=.39-press*.035;lights.forEach(l=>{l.material.emissiveIntensity=o.support?.55:0;l.material.color.set(o.support?blue:'#bfc4cf');});supporters.children.forEach(h=>h.rotation.y=T.MathUtils.damp(h.rotation.y,o.support?Math.atan2(-h.position.x,-h.position.z):Math.PI,4,dt));route.material.color.set(o.execute?blue:'#bfc4cf');receive.rotation.x=T.MathUtils.damp(receive.rotation.x,o.execute?0:1.2,5,dt);const u=Math.min(1,(t-(o.commandAt??-100))/1.5);pulse.visible=u<1&&u>=0&&o.execute;if(pulse.visible)pulse.position.set(mix(0,2.35,u),.24+Math.sin(u*Math.PI)*.20,mix(1.36,1.3,u));halo.scale.setScalar(1+press*.20);
 performed=T.MathUtils.damp(performed,o.execute&&t-(o.commandAt??-100)>1.0&&t-(o.commandAt??-100)<30?1:0,4,dt);flag.position.y=.46+performed*.9;flag.scale.x=.25+.75*performed;signal.scale.y=.35+.65*performed;signal.position.y=.3+performed*.53;
 executor.rotation.y=T.MathUtils.damp(executor.rotation.y,o.execute?-.9:1.6,4,dt);executor.position.z=T.MathUtils.damp(executor.position.z,o.execute?.95:1.65,4,dt);
 supporters.children.forEach((h,i)=>{const [x,z]=positions[i];h.position.x=T.MathUtils.damp(h.position.x,x*(o.support?1:1.25),4,dt);h.position.z=T.MathUtils.damp(h.position.z,z+(o.support?0:-.35),4,dt);});
 shared.visible=o.reflection===2;root.userData.result=(o.support?'supported':'unsupported')+'-'+(o.execute?'executed':'refused');}};
}
function label(p,text,x,y,z,w=1,h=.20,color='#243dca'){
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=Math.round(768*h/w);const ctx=canvas.getContext('2d');ctx.fillStyle=color;let size=canvas.height*.76;ctx.font=`500 ${size}px "Microsoft YaHei", sans-serif`;const measured=ctx.measureText(text).width;if(measured>700){size*=700/measured;ctx.font=`500 ${size}px "Microsoft YaHei", sans-serif`;}ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,canvas.height/2);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const material=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:T.DoubleSide});material.userData.local=true;const mesh=new T.Mesh(new T.PlaneGeometry(w,h),material);mesh.position.set(x,y,z);mesh.layers.set(30);p.add(mesh);return mesh;
}
function weather(){
 const root=group();ground(root);const phone=group(root,-.45,.16,-.10);phone.rotation.y=-.12;
 box(phone,1.65,2.72,.22,0,1.46,0,chalk,.15);box(phone,1.47,2.45,.035,0,1.46,.13,mat('#e6eaf0',.4),.10);box(phone,1.48,2.47,.045,0,1.46,.18,crystal,.09);box(phone,.44,.055,.022,0,2.65,.21,steel,.025);
 weatherHardware(phone,steel,ink);const cloud=group(phone,0,2.05,.25);sphere(cloud,.18,-.22,0,0,chalk);sphere(cloud,.24,0,.09,0,chalk);sphere(cloud,.17,.24,0,0,chalk);box(cloud,.65,.18,.21,0,-.04,0,chalk,.07);const sun=sphere(phone,.21,.30,2.34,.19,azure);sun.scale.z=.35;
 label(phone,'22°',0,1.55,.24,.85,.40);label(phone,'WEATHER',0,1.13,.24,.91,.13);label(phone,'示意天气 · 非实时',0,.87,.24,1.10,.16,'#69778c');
 const location=group(phone,0,.51,.24);torus(location,.10,.023,-.40,0,0,azure,0);box(location,.58,.025,.015,.12,0,0,azure,.008);
 const homes=group(root,-2.25,0,-.65);box(homes,.65,.67,.7,0,.47,0,chalk,.04);const roof=new T.Mesh(new T.ConeGeometry(.52,.38,4),chalk);roof.rotation.y=Math.PI/4;roof.position.y=.99;homes.add(roof);box(homes,.18,.30,.024,0,.35,.36,azure,.02);
 const tower=group(root,1.45,0,-.15);box(tower,.88,1.62,.72,0,.96,0,crystal,.07);box(tower,.88,.12,.72,0,.20,0,chalk,.045);box(tower,.88,.09,.72,0,1.81,0,chalk,.045);for(let i=0;i<4;i++)box(tower,.57,.06,.42,0,.49+i*.29,0,chalk,.02);label(tower,'商业用途',0,1.98,.37,.85,.18);
 const trace=path(root,[[-.45,.15,.6],[.4,.15,.77],[1.45,.15,.4]],blue),input=path(root,[[-2.25,.15,-.3],[-1.55,.15,.55],[-.45,.15,.6]],blue),dots=[];
 for(let i=0;i<5;i++)dots.push(sphere(root,.045,0,.2,0,azure));const switchButton=box(phone,.64,.09,.08,0,.36,.23,azure,.035);
 return{root,focusPoint:new T.Vector3(0,1.2,0),interactTargets:[switchButton],update(o,t){const active=o.precise&&o.commercial;trace.visible=active;input.material.color.set(o.precise?blue:'#bdc4cd');location.visible=o.precise;switchButton.material=active?azure:chalk;dots.forEach((d,i)=>{const u=(t*.20+i*.2)%1;d.visible=active;d.position.copy(trace.geometry.parameters.path.getPointAt(u));d.position.y=.22;});}};
}
function shoppingBag(p,x,y,z,m=crystal,s=1){
 const g=group(p,x,y,z);g.scale.setScalar(s);const shape=new T.Shape();shape.moveTo(-.47,0);shape.lineTo(.47,0);shape.quadraticCurveTo(.52,.6,.47,1.48);shape.lineTo(.20,1.48);shape.lineTo(.20,1.03);shape.quadraticCurveTo(0,.93,-.20,1.03);shape.lineTo(-.20,1.48);shape.lineTo(-.47,1.48);shape.quadraticCurveTo(-.52,.6,-.47,0);for(const x of [-.335,.335]){const hole=new T.Path();hole.absellipse(x,1.25,.065,.15,0,Math.PI*2,true);shape.holes.push(hole);}
 const geo=new T.ExtrudeGeometry(shape,{depth:.26,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035});geo.translate(0,0,-.13);const vertices=geo.attributes.position;
 for(let i=0;i<vertices.count;i++){
   const vx=vertices.getX(i),vy=vertices.getY(i),vz=vertices.getZ(i);
   const belly=Math.max(0,1-(vx/.54)**2)*Math.max(0,Math.sin(Math.PI*Math.min(1,vy/1.10)));
   vertices.setZ(i,vz+Math.sign(vz)*belly*(.078+.03*Math.cos(vx*16+vy*3)));
 }
 geo.computeVertexNormals();const body=new T.Mesh(geo,m);body.castShadow=m!==crystal;g.add(body);return g;
}
function shopping(){
 const root=group();ground(root);const shopper=human(root,-1.55,.5);shopper.rotation.y=.40;
 const shop=group(root,-.6,0,-1.25);box(shop,2.1,.15,.75,0,1.45,0,chalk,.045);for(const x of [-.92,.92])box(shop,.075,1.32,.07,x,.80,0,steel,.02);box(shop,2.1,.15,.75,0,.35,0,chalk,.04);label(shop,'领取 / CHECK OUT',0,1.66,.05,1.65,.16);for(let i=0;i<3;i++)shoppingBag(shop,-.65+i*.65,.45,0,chalk,.38);
 const cabinet=group(root,1.65,0,-.5);for(const x of [-.46,.46])box(cabinet,.10,1.55,.85,x,.94,0,chalk,.035);for(const y of [.20,1.72])box(cabinet,1.02,.10,.85,0,y,0,chalk,.035);box(cabinet,.90,1.45,.07,0,.94,-.38,chalk,.025);box(cabinet,.9,1.28,.045,0,.99,.45,crystal,.05);const slot=box(cabinet,.58,.095,.04,0,1.56,.48,azure,.025);label(cabinet,'归还 / RETURN',0,1.95,.46,1.02,.17);for(let i=0;i<3;i++)box(cabinet,.68,.06,.48,0,.43+i*.22,.02,azure,.02);
 const bag=shoppingBag(root,-.5,.45,-1.15,crystal,.72);const band=box(bag,.61,.075,.025,0,.48,.19,azure,.012);const goods=group(bag);box(goods,.28,.43,.14,.12,.7,0,chalk,.025);cyl(goods,.11,.48,-.16,.73,0,chalk);
 const waste=group(root,.35,0,1.15),discarded=[];for(let i=0;i<6;i++){const item=shoppingBag(waste,(i%3-1)*.5,.19+Math.floor(i/3)*.14,(Math.floor(i/3)-.5)*.38,chalk,.43);item.rotation.x=-1.25;item.rotation.z=(i-2)*.2;discarded.push(item);}
 const wasteLabel=label(root,'留下的袋子',.35,.40,1.85,1.4,.18,'#6e7684');const loop=path(root,[[-1.2,.14,.5],[-.6,.14,1.1],[1.6,.14,1.0],[1.65,.14,-.4],[.2,.14,-.7],[-1.2,.14,.5]],blue);const keeper=human(root,2.55,.8);keeper.rotation.y=-1;keeper.visible=false;
 return{root,focusPoint:new T.Vector3(0,.95,0),update(o,t,dt){keeper.visible=!!o.maintenance;const phase=o.phase??0;const targets=[[-.5,.45,-1.15],[-1.13,.46,.83],[-.25,.20,.62],o.reuse?[1.65,.73,-.43]:[.35,.22,1.15]];const target=targets[phase];for(let i=0;i<3;i++)bag.position[['x','y','z'][i]]=T.MathUtils.damp(bag.position[['x','y','z'][i]],target[i],4,dt);bag.scale.setScalar(T.MathUtils.damp(bag.scale.x,phase===3?.47:phase===0?.72:1,5,dt));bag.rotation.x=T.MathUtils.damp(bag.rotation.x,phase===3&&!o.reuse?-1.25:0,5,dt);bag.visible=phase!==3||!!o.reuse||t-o.actionAt<.8;band.visible=!!o.reuse;goods.visible=phase===2;loop.visible=!!o.reuse;discarded.forEach((d,i)=>d.visible=i<Math.min(6,o.waste));wasteLabel.visible=o.waste>0;slot.material=o.reuse?azure:steel;}};
}
function toolExhibit(){
 const root=group();ground(root);const display=group(root,0,0,-.25);box(display,3.85,.20,1.27,0,.26,0,chalk,.08);
 const panels=[];for(const side of [-1,1]){const pivot=group(display,side*1.82,0,-.53);box(pivot,1.82,1.7,.055,-side*.91,1.22,0,crystal,.02);box(pivot,.025,1.7,.025,0,1.22,0,steel,.005);panels.push(pivot);}
 for(const x of [-1.8,1.8])box(display,.055,1.7,1.08,x,1.22,0,crystal,.02);
 const shape=new T.Shape();const outline=[[-1.64,.16],[-1.64,.58],[-.85,.41],[-.59,.45],[-.59,.60],[.18,.60],[.18,.45],[.93,.42],[.93,.34],[1.68,.34],[1.68,.23],[.93,.23],[.93,.15],[.21,.13],[.10,-.36],[-.17,-.40],[-.24,.12],[-.42,.10],[-.52,-.30],[-.72,-.22],[-.62,.18],[-.89,.16]];outline.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:.17,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.015,bevelThickness:.015});geo.translate(0,0,-.085);const silhouette=new T.Mesh(geo,chalk);silhouette.position.set(0,1.06,.04);silhouette.castShadow=true;display.add(silhouette);
 const stands=group(display);for(const x of [-1.0,.8]){cyl(stands,.025,.64,x,.64,.03,steel);box(stands,.19,.05,.19,x,.35,.03,azure,.015);}label(display,'工具 / 目的 / 后果',0,.26,.66,2.1,.22);
 const people=group(root),persons=[];for(const [x,z,a] of [[-2.2,.9,.65],[2.15,.9,-.85],[.45,1.8,Math.PI]]){const h=human(people,x,z);h.rotation.y=a;persons.push(h);}glaze(persons[2]);const interrupted=group(root);for(const x of [-1.15,1.15]){path(interrupted,[[x,.14,1.7],[x,.14,.55]],blue);box(interrupted,.44,.018,.07,x,.145,.5,azure,.015);}const forum=group(root,0,0,1.5);cyl(forum,.42,.1,0,.63,0,crystal);forum.visible=false;let reveal=0,removal=0;
 return{root,focusPoint:new T.Vector3(0,1.05,0),update(o,t,dt){reveal=T.MathUtils.damp(reveal,o.stage>0?1:0,4,dt);removal=T.MathUtils.damp(removal,o.stage===2?1:0,4,dt);panels.forEach((p,i)=>{p.rotation.y=(i?1:-1)*reveal*1.12;p.position.x=(i?1:-1)*(1.82+reveal*.48);});forum.visible=!!o.convene;people.visible=reveal>.03;persons.forEach((p,i)=>{p.position.y=-(1-reveal)*1.9;p.rotation.y=[.65,-.85,Math.PI][i]+removal*(i===2?.6:0);p.position.x=T.MathUtils.damp(p.position.x,o.convene?[-.9,.9,0][i]:[-2.2,2.15,.45][i],4,dt);p.position.z=T.MathUtils.damp(p.position.z,o.convene?[1.3,1.3,2.25][i]:[.9,.9,1.8][i],4,dt);});interrupted.visible=reveal>.3;silhouette.position.y=1.06-removal*1.35;silhouette.scale.setScalar(Math.max(.001,1-removal));silhouette.visible=removal<.99;stands.scale.y=Math.max(.001,1-removal);}};
}
function camdenBench(root){
 // A continuous faceted concrete monolith, with side recesses and sloping ends.
 const g=group(root),vertices=[],indices=[];const nx=80,ny=16;
 const knots=[[-1.9,.89],[-1.65,.96],[-1.15,.82],[-.58,.89],[.02,.80],[.70,.91],[1.26,.83],[1.9,.97]];
 function top(x,z){let v=.9;for(let i=0;i<knots.length-1;i++){if(x>=knots[i][0]&&x<=knots[i+1][0]){const u=(x-knots[i][0])/(knots[i+1][0]-knots[i][0]);v=mix(knots[i][1],knots[i+1][1],u);break;}}return v+.035*(z/.39);}
 function edge(x,y){const center=Math.exp(-Math.pow(x/1.02,8)),ends=Math.exp(-Math.pow((Math.abs(x)-1.47)/.18,4));const recess=(center*.115+ends*.10)*Math.pow(Math.max(0,1-y/.66),.30);return .39-recess;}
 function surface(fn,nu,nv,flip=false){const start=vertices.length/3;for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)vertices.push(...fn(i/nu,j/nv));for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=start+j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;indices.push(...(flip?[a,c,b,b,c,d]:[a,b,c,b,d,c]));}}
 surface((u,v)=>{const x=(u-.5)*3.8,z=(v-.5)*.78;return[x,top(x,z),z]},nx,8,true);
 for(const side of [-1,1])surface((u,v)=>{const x=(u-.5)*3.8,y=.13+v*(top(x,side*.39)-.13),inset=.10*(1-v)*Math.pow(Math.abs(x)/1.9,10);return[x-Math.sign(x)*inset,y,side*edge(x,y-.13)]},nx,ny,side<0);
 for(const side of [-1,1])surface((u,v)=>{const z=(u-.5)*.78,y=.13+v*(top(side*1.9,z)-.13);return[side*(1.8+.1*v),y,z*(edge(side*1.9,y-.13)/.39)]},8,ny,side>0);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const concrete=mat('#dedfd9',.94);const mesh=new T.Mesh(geo,concrete);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);label(g,'CAMDEN',1.795,.66,.01,.42,.10,'#989d97').rotation.y=Math.PI/2;return g;
}
function displayHandbag(p,x,y,z){
 const g=group(p,x,y,z);g.name='Display_Handbag';if(placeAsset(g,'DISPLAY_BAG'))return g;box(g,.83,.58,.33,0,.30,0,mat('#e4e4df',.24),.08);box(g,.69,.035,.24,0,.60,0,steel,.012);const curve=new T.CatmullRomCurve3([new T.Vector3(-.22,.59,.02),new T.Vector3(-.20,.82,.02),new T.Vector3(0,.91,.02),new T.Vector3(.20,.82,.02),new T.Vector3(.22,.59,.02)]);const handle=new T.Mesh(new T.TubeGeometry(curve,32,.026,8,false),steel);g.add(handle);box(g,.15,.10,.045,0,.46,.183,azure,.018);box(g,.62,.012,.012,0,.35,.173,steel,.004);return g;
}
function shoppingStreet(){
 const root=group();const districts=[],exchangeItems=[],goods=[],audience=[],tags=[];let journey=0,exchange=0,paid=0,prestige=1;
 function building(p,x,z,w,h,d,style){const g=group(p,x,0,z);if(style>0){box(g,w,h,.09,0,.12+h/2,-d/2,chalk,.025);for(const side of [-1,1])box(g,.12,h,d,side*(w-.12)/2,.12+h/2,0,chalk,.025);box(g,w,.12,d,0,.18,0,chalk,.025);}else box(g,w,h,d,0,.12+h/2,0,chalk,.045);box(g,w+.12,.12,d+.12,0,h+.18,0,chalk,.025);if(style>0){box(g,w-.23,h-.52,.065,0,.24+(h-.52)/2,d/2+.035,crystal,.02);for(const sx of [-1,1])box(g,.06,h-.35,.08,sx*(w/2-.12),.27+(h-.35)/2,d/2+.08,steel,.01);}return g;}
 function goodsShape(p,x,z,type=0){const g=group(p,x,0,z);if(type===0){sphere(g,.17,0,.17,0,chalk,[1.2,.75,.85]);for(let i=0;i<3;i++)rod(g,[-.1+i*.07,.275,-.05],[-.1+i*.07,.275,.08],.007,wood);}else{cyl(g,.12,.22,0,.13,0,chalk);torus(g,.085,.02,.11,.16,0,steel,0);}return g;}
 for(let era=0;era<3;era++){
  const district=group(root);districts.push(district);ground(district);for(const x of [-1.9,1.9])box(district,1.1,.07,3.9,x,.14,0,chalk,.03);for(let j=0;j<6;j++)box(district,.035,.01,.28,0,.125,-1.8+j*.65,era===2?azure:wood,.005);
  if(era===0){
   const stall=group(district,0,0,-.65);for(const x of [-1.65,1.65]){cyl(stall,.055,1.8,x,1.05,0,wood);cyl(stall,.055,1.8,x,1.05,-.65,wood);}box(stall,3.6,.07,1.15,0,2.04,-.32,chalk,.03).rotation.z=-.035;box(stall,3.3,.14,.85,0,.72,-.27,chalk,.035);box(stall,3.0,.54,.60,0,.40,-.27,wood,.035);label(stall,'交换集市',0,1.80,.28,1.20,.2,'#6f7885');
   for(const side of [-1,1]){const h=human(district,side*1.25,.60);h.rotation.y=side*-1.1;const item=group(district,side*.85,.81,.20);if(side<0){for(let i=0;i<5;i++)sphere(item,.10,(i%3)*.13-.13,0,Math.floor(i/3)*.11,chalk,[1,.7,1]);}else{box(item,.40,.10,.35,0,0,0,crystal,.025);box(item,.34,.06,.32,0,.085,0,chalk,.02);}exchangeItems.push(item);}
   const sideStall=group(district,2.55,0,-.72);box(sideStall,.7,.56,1.25,0,.40,0,chalk,.035);box(sideStall,.76,.08,1.30,0,.72,0,wood,.02);for(let j=0;j<3;j++)cyl(sideStall,.12,.24,0,.87,-.40+j*.4,chalk);const scale=group(stall,0,.8,-.3);cyl(scale,.035,.62,0,.3,0,steel);rod(scale,[-.48,.57,0],[.48,.57,0],.025,steel);for(const x of [-.43,.43]){rod(scale,[x,.57,0],[x,.22,0],.009,steel);sphere(scale,.23,x,.20,0,crystal,[1,.17,1]);}tree(district,-2.7,-1.3,.6);
  }else if(era===1){
   const store=building(district,0,-1.14,3.5,2.0,.85,1);box(store,3.7,.09,1.40,0,1.83,.65,chalk,.03).rotation.x=.12;for(let j=0;j<7;j++)box(store,.30,.015,.65,-1.50+j*.5,1.91,.85,j%2?chalk:wood,.01).rotation.x=.12;label(store,'DAILY / 日常所需',0,2.24,.47,2.25,.20);box(store,2.85,.15,.65,0,.72,.75,chalk,.035);
   const neighbor=building(district,2.65,-.65,.74,1.25,1.25,1);label(neighbor,'日用',0,1.48,.68,.5,.13);goods.push(goodsShape(district,-.50,-.32,0),goodsShape(district,.50,-.32,1));goods.forEach(g=>g.position.y=.8);const h=human(district,-1.35,1.0);h.rotation.y=.6;const bag=shoppingBag(district,-.45,.2,1.0,crystal,.72);goods.push(bag);
  }else{
   const flagship=building(district,-.40,-.85,3.05,2.62,1.20,1);box(flagship,3.20,.12,1.4,0,2.55,.08,steel,.025);label(flagship,'MAISON / 身份橱窗',0,2.85,.65,2.6,.20);box(flagship,1.1,.65,.82,0,.47,.37,chalk,.035);const luxury=displayHandbag(flagship,0,.83,.37);
   const tower=building(district,2.12,-.95,.91,2.05,.9,1);label(tower,'LIMITED',0,2.25,.5,.85,.14);const tag=label(flagship,'限量 / EXCLUSIVE',0,2.13,.71,1.8,.18,'#343e50');tags.push(tag);const halo=torus(flagship,.56,.014,0,1.45,.35,azure,0);tags.push(halo);
   for(const [x,z] of [[-1.7,.85],[.35,1.35],[1.95,.85]]){const h=human(district,x,z);h.rotation.y=Math.atan2(-.4-x,-.85-z);audience.push(h);const line=path(district,[[x,.14,z],[x*.65-.1,.14,.20],[-.4,.14,-.45]],blue);tags.push(line);}glaze(audience[1]);
  }
 }
 return{root,focusPoint:new T.Vector3(0,1,0),update(o,t,dt){journey=T.MathUtils.damp(journey,o.era,4,dt);districts.forEach((g,i)=>{const d=i-journey;g.position.x=d*9;g.position.y=-Math.min(1,Math.abs(d))*.28;g.visible=Math.abs(d)<1.05;});exchange=T.MathUtils.damp(exchange,o.exchanged?1:0,5,dt);exchangeItems.forEach((g,i)=>{g.position.x=(i?1:-1)*.85*(1-2*exchange);g.position.y=.81+Math.sin(exchange*Math.PI)*.40;g.position.z=.2+(i?1:-1)*Math.sin(exchange*Math.PI)*.22;});paid=T.MathUtils.damp(paid,o.bought?1:0,5,dt);goods.slice(0,2).forEach((g,i)=>{g.position.x=mix(i?.5:-.5,-.45+(i?.11:-.11),paid);g.position.z=mix(-.32,1,paid);g.position.y=mix(.8,.62,paid)+Math.sin(paid*Math.PI)*.35;});prestige=T.MathUtils.damp(prestige,o.status?1:0,5,dt);tags.forEach(g=>{g.visible=prestige>.03;g.scale.setScalar(Math.max(.001,prestige));});audience.forEach(h=>{const facing=Math.atan2(-.4-h.position.x,-.85-h.position.z);h.rotation.y=mix(0,facing,o.lookAway?0:prestige);});}};
}
function publicScenes(){
 const root=group(),seat=bench(),meeting=originalScene('screen');root.add(seat.root,meeting.root);meeting.root.visible=false;
 const arrivals=[],speech=[];
 function add(person,x,z,stage,seated=false){person.position.set(x,0,z);person.rotation.y=Math.atan2(-x,-z);const targetY=seated?-.03:0;arrivals.push({person,x,z,stage,targetY,amount:0});return person;}
 for(let i=0;i<4;i++){const a=i*Math.PI/2+.5,x=Math.cos(a),z=Math.sin(a),h=human(meeting.root,0,0,true,.69);h.scale.setScalar(.91);add(h,x,z,[1,3,2,3][i],true);const bubble=group(meeting.root,x,1.73,z);sphere(bubble,.13,0,0,0,crystal,[1.5,.8,.5]);for(let j=0;j<3;j++)sphere(bubble,.017,-.065+j*.065,0,.07,azure);speech.push(bubble);}
 for(const [x,z] of [[-2.5,.9],[2.4,.9],[-2.3,-1.3],[2.2,-1.6]])add(human(meeting.root,0,0),x,z,4);
 const elder=add(human(meeting.root,0,0),-1.4,2.0,5);elder.scale.setScalar(.91);rod(elder,[.3,.85,.1],[.35,.13,.32],.028,crystal);sphere(elder,.18,0,1.84,0,chalk,[.96,.65,1]);
 const parent=add(human(meeting.root,0,0),1.35,2.15,5);const child=add(human(meeting.root,0,0),.8,2.45,5);child.scale.setScalar(.58);
 const chair=add(wheelchair(meeting.root,0,0),-2.65,-.2,5);glaze(chair.children[0]);
 const pram=group(meeting.root);pram.name='Pram_Assembly';if(!placeAsset(pram,'STROLLER',0,.12,0)){for(const x of [-.27,.27])for(const z of [-.25,.25])torus(pram,.10,.025,x,.22,z,ink,0).rotation.y=Math.PI/2;box(pram,.50,.16,.74,0,.52,0,chalk,.07);sphere(pram,.32,0,.75,-.15,crystal,[.82,.8,1]);rod(pram,[-.25,.54,.25],[-.25,1,.46],.022,steel);rod(pram,[.25,.54,.25],[.25,1,.46],.022,steel);rod(pram,[-.25,1,.46],[.25,1,.46],.025,azure);}add(pram,2.15,1.75,5);
 const discussion=group(meeting.root);box(discussion,.44,.025,.30,0,.63,0,crystal,.025);label(discussion,'共同议题',0,.65,0,.32,.065).rotation.x=-Math.PI/2;
 let openness=0,entered=1,lastView=false;
 return{root,focusPoint:new T.Vector3(0,1,0),update(o,t,dt){const view=!!o.meeting;if(view!==lastView){entered=0;lastView=view;}entered=T.MathUtils.damp(entered,1,9,dt);seat.root.visible=!view;meeting.root.visible=view;const active=view?meeting.root:seat.root;active.position.y=(1-entered)*.12;active.scale.setScalar(.96+.04*entered);
 if(!view){seat.update(o,t,dt);return;}openness=T.MathUtils.damp(openness,o.open?1:0,5,dt);meeting.update(openness,t);
 const count=o.gather??0;arrivals.forEach((a,i)=>{a.amount=T.MathUtils.damp(a.amount,count>=a.stage?1:0,3.4,dt);a.person.visible=a.amount>.015;const d=1-a.amount;a.person.position.set(a.x+d*Math.sign(a.x)*.75,a.targetY-d*1.7,a.z+d*.45);a.person.scale.y=(i<4?.91:i===8?.91:i===10?.58:1)*(.86+.14*a.amount);});
 speech.forEach((g,i)=>{g.visible=count>=5||(o.reflection===1&&count>=3);g.position.y=1.73+Math.sin(t*1.4+i)*.025;g.scale.setScalar(.85+.15*Math.sin(t*1.2+i));});discussion.visible=count>=2;discussion.scale.setScalar(T.MathUtils.damp(discussion.scale.x,o.reflection===2?1.7:1,4,dt));root.userData.arrivals=count;
 }};
}
function chamber(){
 const root=group();ground(root);const stone=mat('#e5e4df',.54),detail=mat('#b8bdca',.3,.55);
 // An open, classical room leaves the inhabitants visible from the reading view.
 box(root,6.1,.08,3.7,0,.15,0,stone,.04);box(root,6.1,2.9,.13,0,1.62,-1.83,chalk,.03);
 for(const x of [-2.7,-1.1,1.1,2.7]){cyl(root,.13,2.55,x,1.48,-1.57,stone);cyl(root,.22,.15,x,.27,-1.57,chalk);cyl(root,.22,.15,x,2.76,-1.57,chalk);for(let j=0;j<8;j++){const a=j*Math.PI/4;rod(root,[x+Math.cos(a)*.132,.43,-1.57+Math.sin(a)*.132],[x+Math.cos(a)*.132,2.54,-1.57+Math.sin(a)*.132],.009,chalk);}}
 box(root,6.3,.14,.48,0,2.98,-1.65,chalk,.03);for(const y of [.36,2.6])box(root,5.8,.025,.03,0,y,-1.75,detail,.006);
 for(const x of [-1.9,1.9]){box(root,.86,1.45,.035,x,1.52,-1.74,crystal,.07);box(root,.96,.05,.10,x,2.28,-1.72,chalk,.01);}
 const sofa=group(root,-1.25,0,-.1);sofa.name='Private_Couch';const couch=placeAsset(sofa,'KLINE',0,.19,0);if(!couch){box(sofa,1.6,.30,.85,0,.53,0,stone,.09);box(sofa,1.65,.65,.17,0,.98,-.38,chalk,.06);for(const x of [-.82,.82])box(sofa,.16,.48,.90,x,.69,0,chalk,.05);}glaze(human(sofa,0,.05,true,couch ? .721 : .68));
 const table=group(root,-.2,0,.85);cyl(table,.57,.10,0,.72,0,crystal);cyl(table,.08,.55,0,.42,0,detail);cyl(table,.30,.08,0,.19,0,chalk);
 const attendant=human(root,1.35,.30);attendant.rotation.y=-1.2;for(const side of ['NEG','POS']){const elbow=attendant.getObjectByName('ELBOW_'+side);if(elbow)elbow.rotation.x=-1.28;}const tray=group(attendant,0,1.16,.27);cyl(tray,.29,.025,0,0,0,detail);cyl(tray,.08,.13,0,.08,0,chalk);torus(tray,.05,.012,.075,.10,0,detail,0);
 const cupboard=group(root,2.5,0,-.6);box(cupboard,.72,1.4,.55,0,.86,0,chalk,.035);for(let i=0;i<3;i++){box(cupboard,.65,.028,.50,0,.40+i*.4,.03,detail,.01);box(cupboard,.64,.30,.035,0,.59+i*.4,.29,crystal,.025);}
 const screens=group(root,-1.2,0,.1);const leaves=[];for(let i=0;i<3;i++){const leaf=group(screens,-.95+i*.95,0,-.65);box(leaf,.90,1.9,.045,0,1.15,0,crystal,.03);for(const x of [-.46,.46])rod(leaf,[x,.2,0],[x,2.12,0],.018,detail);leaves.push(leaf);}
 const memories=[];for(let i=0;i<3;i++){const g=group(root,1.8,1.0+i*.43,-.15);box(g,.6,.30,.04,0,0,0,crystal,.03);label(g,['口味','作息','习惯'][i],0,0,.03,.43,.16);memories.push(g);}
 const withdrawn=label(root,'习惯记录已收回',1.6,2.25,.2,1.7,.2);withdrawn.visible=false;const links=[];for(let i=0;i<3;i++)links.push(path(root,[[-1.25,.21,.3],[.15,.21,1.3],[1.8,.21,-.15+i*.12]],blue));let amount=0;
 return{root,focusPoint:new T.Vector3(0,1.3,0),update(o,t,dt){withdrawn.visible=!!o.revoked;amount=T.MathUtils.damp(amount,o.service??0,3,dt);attendant.position.x=mix(1.75,.8,amount/2);attendant.position.z=.4+Math.sin(t*.7)*.03;leaves.forEach((l,i)=>{l.rotation.y=(i-1)*(.15+amount*.36);l.position.x=-.95+i*.95+(i-1)*amount*.20;});memories.forEach((g,i)=>{g.visible=amount>(i===0?.5:1.5);g.position.y=1+i*.42+Math.sin(t+i)*.025;});links.forEach((g,i)=>g.visible=(o.service===1?i===0:o.service===2));root.userData.service=o.service;}};
}
function privacyScenes(){const root=group(),phone=weather(),room=chamber();root.add(phone.root,room.root);return{root,focusPoint:new T.Vector3(0,1.2,0),update(o,t,dt){phone.root.visible=!o.chamber;room.root.visible=!!o.chamber;(o.chamber?room:phone).update(o,t,dt);}};}
function tutorialScene(){const root=group(),demo=fence();root.add(demo.root);let entered=1,lastPhase=-1;return{root,focusPoint:new T.Vector3(0,1,0),update(o,t,dt){if(lastPhase!==o.phase){lastPhase=o.phase;entered=0;}entered=T.MathUtils.damp(entered,1,5,dt);demo.root.position.y=-(1-entered)*.35;const final=o.phase===2;demo.update({material:final&&o.finalChoice===0?2:0,gate:final?o.finalChoice>0:o.gate,wheelchair:final&&o.finalChoice===2,reading:o.phase>0,replay:o.phase},t,dt);}};}
export function makeStudy(id){if(id==='cover')return originalScene('cover');if(id==='tutorial')return tutorialScene();return withProposalStudies(withAIStudies(({boundary:fence,public:publicScenes,power,privacy:privacyScenes,alienation:shopping,'alienation-two':shoppingStreet,violence:toolExhibit})[id](),id),id);}
