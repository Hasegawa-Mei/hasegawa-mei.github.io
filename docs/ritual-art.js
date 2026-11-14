import {cutSurface,reliefParts,lightCards} from './glass-relief.js';
// Engraved paths borrow the prologue's tilted orbit and the book's measured linework.
import * as T from 'three';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
const blue='#263dba', TAU=Math.PI*2;
const number=n=>n.toFixed(2);
function loop(fn,count=360){
  return 'M'+Array.from({length:count},(_,i)=>{const [x,y]=fn(i*TAU/count);return number(x)+' '+number(y);}).join('L')+'Z';
}
const marks=['#c93586','#77a542','#d3be30','#cf4547','#39a3bb'];
const glyphs={
 threshold:'<path d="M-37 37V-36H-4V29M9-34H38V37M-43 37H46"/><circle cx="7" cy="1" r="3"/>',
 assembly:'<circle r="13"/><path d="M-37 -10V-32H-15M14-32H37V-11M37 11V32H14M-15 32H-37V10"/>',
 repair:'<ellipse rx="27" ry="15" transform="rotate(-42) translate(-12 0)"/><ellipse rx="27" ry="15" transform="rotate(-42) translate(15 0)"/>',
 inquiry:'<circle cx="-5" cy="-7" r="26"/><circle cx="-5" cy="-7" r="19"/><path d="M13 13L36 38"/>',
 discern:'<path d="M0-40L40 29H-40ZM0-40L6 14L40 29M6 14L-40 29"/>',
 witness:'<ellipse rx="42" ry="15" transform="rotate(-32)"/><circle r="17"/>'};
export function cardArt(face=null,printOnly=false){
  const ink=face?.color||blue;
  const etched=[];
  for(let k=0;k<22;k++){
    const radius=51+k*2.5;
    etched.push('<path d="'+loop(t=>{const r=radius+(8+k*.24)*Math.cos(t*8+k*.095);return [160+Math.cos(t)*r,247+Math.sin(t)*r*1.22];})+'"/>');
  }
  const orbit=Array.from({length:9},(_,i)=>'<ellipse cx="160" cy="247" rx="'+(108-i*1.8)+'" ry="'+(37+i*2)+'" transform="rotate('+(-42+i*1.7)+' 160 247)"/>').join('');
  let ticks='';
  for(let i=0;i<96;i++){const a=i*TAU/96,r=i%8?111:106;ticks+='<path d="M'+number(160+Math.cos(a)*r)+' '+number(247+Math.sin(a)*r*1.22)+'L'+number(160+Math.cos(a)*115)+' '+number(247+Math.sin(a)*140)+'"/>';}
  const corners=['36 39','284 39','36 455','284 455'].map((p,i)=>'<g transform="translate('+p+') rotate('+[0,90,-90,180][i]+')"><path d="M0 30V0H32M4 27V5H25M9 21V10H19"/><circle cx="11" cy="11" r="2"/></g>').join('');
  let art='<svg xmlns="http://www.w3.org/2000/svg" width="320" height="494" viewBox="0 0 320 494"><defs><linearGradient id="foil" x2=".85" y2="1"><stop stop-color="#fff" stop-opacity=".77"/><stop offset=".34" stop-color="#dce5ef" stop-opacity=".22"/><stop offset=".56" stop-color="#fff" stop-opacity=".85"/><stop offset=".8" stop-color="#ccd7eb" stop-opacity=".31"/><stop offset="1" stop-color="#fff" stop-opacity=".7"/></linearGradient></defs><rect x="4" y="4" width="312" height="486" rx="16" fill="url(#foil)" stroke="#9facbe" stroke-width=".9"/><rect x="10" y="10" width="300" height="474" rx="12" stroke="#fafcff" stroke-width="3" fill="none"/><rect x="17" y="17" width="286" height="460" rx="8" fill="none" stroke="#8a99b3" stroke-width=".7"/><g fill="none" stroke="'+ink+'" stroke-width=".9" opacity=".64">'+corners+'</g><g fill="none" stroke="'+ink+'" stroke-width=".8" opacity="'+(face?.22:.61)+'">'+etched.join('')+'</g><g fill="none" stroke="#8e9daf" stroke-width=".8">'+ticks+orbit+'</g><g transform="translate(160 247)" fill="none" stroke="'+ink+'" stroke-width="2">'+(face?glyphs[face.id]:'<rect x="-15" y="-15" width="30" height="30" transform="rotate(32)" fill="#293fac"/><circle r="34"/>')+'</g><g text-anchor="middle" fill="'+ink+'"><text x="160" y="63" font-family="Georgia,serif" font-size="11" letter-spacing="4">B E T W E E N</text><text x="160" y="408" font-family="serif" font-size="'+(face?23:13)+'" font-weight="bold">'+(face?face.name:'之　间')+'</text><text x="160" y="431" font-family="Arial,sans-serif" font-size="7.5" letter-spacing="2">'+(face?face.en:'READING   /   ARCHIVE')+'</text></g>'+marks.map((c,i)=>'<rect x="'+(143+i*8)+'" y="450" width="4" height="4" fill="'+c+'"/>').join('')+'</svg>';
  if(printOnly){
    // On the object these ink marks are replaced by mounted metal and glass geometry.
    art=art.replace(/<rect x="4"[^>]*\/>/,'').replace(/<rect x="10"[^>]*\/>/,'');
    art=art.replace(corners,'').replace(orbit,'');
    art=art.replace(/<g transform="translate\(160 247\)"[\s\S]*?<\/g>/,'');
  }
  return art;

}
const artURL=(face,printOnly=false)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(cardArt(face,printOnly));
function faceModel(face){
  const emblem=new T.Group(),material=new T.MeshStandardMaterial({color:face.color,metalness:.67,roughness:.18});
  const ring=(r,x,y,rz=0,sx=1,sy=1)=>{const m=new T.Mesh(new T.TorusGeometry(r,.035,8,64),material);m.position.set(x,y,.04);m.rotation.z=rz;m.scale.set(sx,sy,1);emblem.add(m);};
  const bar=(x,y,w,h,z=0)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,.085),material);m.position.set(x,y,.04);m.rotation.z=z;emblem.add(m);};
  switch(face.id){
    case 'threshold':bar(-.26,0,.055,.54);bar(-.12,.26,.31,.052);bar(.21,0,.055,.54);break;
    case 'assembly':ring(.12,0,0);for(let i=0;i<4;i++){const a=i*TAU/4;bar(.27*Math.sin(a),.27*Math.cos(a),.2,.075,-a);}break;
    case 'repair':ring(.17,-.1,0,.63,1.3,.68);ring(.17,.12,.1,.63,1.3,.68);break;
    case 'inquiry':ring(.21,-.05,.05);bar(.17,-.17,.06,.27,.78);break;
    case 'discern':{const prism=new T.Mesh(new T.OctahedronGeometry(.3),material);prism.rotation.set(.2,.5,.1);emblem.add(prism);break;}
    default:ring(.28,0,0,-.45,1.3,.5);ring(.16,0,0);
  }
  return emblem;
}
export function createArt(host){
  let renderer;
  try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}
  catch{return flatArt(host);}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0xffffff,0);renderer.toneMapping=T.ACESFilmicToneMapping;
  host.append(renderer.domElement);
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(33,1,.1,70);
  camera.position.z=10;
  const pm=new T.PMREMGenerator(renderer),room=new RoomEnvironment();lightCards(room);const env=pm.fromScene(room,.025);scene.environment=env.texture;pm.dispose();room.dispose();
  scene.add(new T.HemisphereLight(0xffffff,0xabb9da,2.3));
  const key=new T.DirectionalLight(0xffffff,3.5);key.position.set(-4,5,8);scene.add(key);
  const shape=new T.Shape(),w=.86,h=1.33,r=.09;
  shape.moveTo(-w+r,-h);shape.lineTo(w-r,-h);shape.quadraticCurveTo(w,-h,w,-h+r);shape.lineTo(w,h-r);shape.quadraticCurveTo(w,h,w-r,h);shape.lineTo(-w+r,h);shape.quadraticCurveTo(-w,h,-w,h-r);shape.lineTo(-w,-h+r);shape.quadraticCurveTo(-w,-h,-w+r,-h);
  const bodyGeo=new T.ExtrudeGeometry(shape,{depth:.066,bevelSegments:4,bevelSize:.032,bevelThickness:.025,curveSegments:10});
  const coordinates=bodyGeo.attributes.position,uv=bodyGeo.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(coordinates.getX(i)+w)/(2*w),(coordinates.getY(i)+h)/(2*h));
  const bodyMaterial=new T.MeshPhysicalMaterial({color:0xdde6f1,transmission:.88,thickness:.23,roughness:.08,metalness:0,ior:1.5,envMapIntensity:.85,clearcoat:.64,dispersion:.4,bumpMap:cutSurface(),bumpScale:.022});
  const relief=reliefParts();
  const texture=new T.TextureLoader().load(artURL(null,true));texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  const plate=new T.PlaneGeometry(w*2,h*2);
  const engraved=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false});
  // A polished bevel catches the studio light separately from the clear glass core.
  const edgeMaterial=new T.MeshPhysicalMaterial({color:0x9cacc4,metalness:.38,roughness:.12,transmission:.48,thickness:.14,clearcoat:.8,iridescence:.48,iridescenceThicknessRange:[160,390]});
  // A narrow dispersive reflection moves in card coordinates with the viewing angle.
  const sheen = new T.ShaderMaterial({
    transparent:true,depthWrite:false,
    vertexShader:`varying vec2 coords; varying float angle;
      void main(){coords=uv;angle=(normalMatrix*normal).x;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec2 coords; varying float angle;
      void main(){
        float position=coords.x+.45*coords.y+.018*sin(coords.y*9.)-.72-angle*.7;
        float band=exp(-pow(abs(position)/.072,2.));
        float rim=smoothstep(.02,.065,min(min(coords.x,1.-coords.x),min(coords.y,1.-coords.y)));
        float wave=clamp(position/.13+.52,0.,1.);
        vec3 cool=mix(vec3(.25,.56,.96),vec3(.62,.90,.83),smoothstep(.05,.43,wave));
        vec3 warm=mix(vec3(.98,.89,.66),vec3(.93,.50,.82),smoothstep(.55,1.,wave));
        vec3 light=mix(cool,warm,smoothstep(.42,.63,wave));
        gl_FragColor=vec4(light,band*rim*.46);
      }`
  });
  const lean={x:0,y:0},desired={x:0,y:0};
  window.addEventListener('pointermove',e=>{desired.x=e.clientX/innerWidth-.5;desired.y=e.clientY/innerHeight-.5;},{passive:true});
  const cards=[];
  for(let i=0;i<7;i++){
    const item=new T.Group();item.add(new T.Mesh(bodyGeo,[bodyMaterial,edgeMaterial]));
    item.userData.crest=relief.center.clone();item.add(relief.fittings.clone(),item.userData.crest);
    const reflection=new T.Mesh(plate,sheen);reflection.position.z=.096;reflection.renderOrder=1;item.add(reflection);
    const print=new T.Mesh(plate,engraved);print.position.z=.098;print.renderOrder=2;item.add(print);scene.add(item);cards.push(item);
  }
  
  const orbit=new T.Group();orbit.position.z=-1.75;scene.add(orbit);
  let seed=827;function rand(){seed=(seed*16807)%2147483647;return seed/2147483647;}
  const points=[],colors=[];
  for(let i=0;i<4700;i++){
    const ring=i%11,angle=rand()*TAU;
    let radius=[1.58,1.62,1.9,2.22,2.25,2.29,2.58,2.64,2.85,3.0,3.22][ring]+(rand()-.5)*.02;
    if(ring===5)radius+=.18*Math.cos(angle*8);
    if(ring===7)radius+=.19*Math.sin(angle*6);
    if(ring===9)radius+=Math.floor(angle*72/TAU)%3*.085;
    points.push(Math.cos(angle)*radius,Math.sin(angle)*radius,(rand()-.5)*.035);
    const c=new T.Color(i%37===0?marks[i%5]:i%4===0?'#34478c':'#8797ba');colors.push(c.r,c.g,c.b);
  }
  const pg=new T.BufferGeometry();pg.setAttribute('position',new T.Float32BufferAttribute(points,3));pg.setAttribute('color',new T.Float32BufferAttribute(colors,3));pg.setDrawRange(0,0);
  const dust=new T.Points(pg,new T.PointsMaterial({vertexColors:true,size:.016,sizeAttenuation:true,transparent:true,opacity:.75,depthWrite:false}));orbit.add(dust);
  let mode='idle',selection=0,offset=0,settleTo=0,rotating=false,chosen=false,clock=0,started=0,last=0,revealIndex=0;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const resize=()=>{const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();};
  new ResizeObserver(resize).observe(host);resize();
  function tick(now){
    const dt=Math.min(.064,(now-last)/1000||0);last=now;if(document.hidden||mode==='paused')return;
    clock+=dt;
    if(mode==='array'&&rotating&&!chosen)offset+=dt*.95;
    if(!rotating)offset=T.MathUtils.damp(offset,settleTo,8,dt);
    lean.x=T.MathUtils.damp(lean.x,desired.x,4,dt);lean.y=T.MathUtils.damp(lean.y,desired.y,4,dt);
    selection=((Math.round(offset)%7)+7)%7;
    const array=mode==='array',result=mode==='result',age=clock-started;
    const form=reduced?1:Math.min(1,age/1.5);
    const framed=host.clientWidth>700;
    const viewH=2*Math.tan(camera.fov*Math.PI/360)*camera.position.z;
    const viewW=viewH*camera.aspect;
    orbit.visible=array||result;
    if(orbit.visible){pg.setDrawRange(0,Math.floor(points.length/3*form));orbit.scale.setScalar((.78+form*.22)*(framed?.95:Math.min(.84,viewW*.26)));if(!reduced)orbit.rotation.z+=dt*.095;orbit.position.x=result&&framed?viewW*.205:0;dust.material.opacity=result?.28:.77;}
    cards.forEach((card,i)=>{
      const center=result?revealIndex:selection;
      const index=((i-offset+10.5)%7+7)%7-3.5;
      const main=i===(mode==='idle'?0:center);
      card.visible=array||(result?(main||age<.8&&!reduced):i===0);
      if(!card.visible)return;
      let x=0,y=0,z=0,ry=0,rz=0,scale=1;
      if(array||result){
        const pos=index*Math.min(1.88,viewW*.33);
        x=pos;y=-Math.abs(index)*.06;z=-Math.abs(index)*.46;
        ry=-index*.14;rz=-index*.025;scale=framed?.81:Math.min(.7,viewW*.24);
        if(array){y+=(1-form)*-.72;scale*=.7+.3*form;if(main&&chosen){y+=.25;z+=.5;}}
        if(result&&!main){const fall=Math.min(1,age/.8);scale*=Math.max(.001,1-fall);y-=fall*.8;}
        if(result&&main){const u=reduced?1:Math.min(1,age/1.25),ease=u*u*(3-2*u);x=T.MathUtils.lerp(x,framed?viewW*.205:0,ease);y=T.MathUtils.lerp(y,framed?.02:.15,ease);ry=(reduced?Math.PI:Math.PI*ease)-.07;rz=-.03;scale=T.MathUtils.lerp(scale,framed?1.12:Math.min(.86,viewW*.30),ease);}
      }else{scale=framed?1.03:Math.min(.95,viewW*.36);y=.34+(reduced?0:Math.sin(clock*1.05)*.045);ry=-.28+(reduced?0:Math.sin(clock*.48)*.14);rz=-.075;}
      const showBack=!(result&&main&&ry>Math.PI*.51);
      card.userData.crest.visible=showBack;
      if(mode==='idle'&&!reduced)ry+=lean.x*.54;
      card.position.set(x,y,z);card.rotation.set(mode==='idle'?.075+(reduced?0:lean.y*.22):0,ry,rz);card.scale.setScalar(scale);
    });
    renderer.render(scene,camera);
  }
  let removeFace=null;
  renderer.setAnimationLoop(tick);
  return {
    suspend(){renderer.setAnimationLoop(null);},
    resume(){last=performance.now();renderer.setAnimationLoop(tick);},
    start(){mode='array';started=clock;offset=settleTo=0;rotating=chosen=false;},
    rotate(){chosen=false;rotating=true;},stop(){if(rotating)settleTo=Math.round(offset);rotating=false;},advance(){chosen=false;rotating=false;settleTo=Math.round(Math.max(offset,settleTo))+1;},
    select(){rotating=false;chosen=true;settleTo=Math.round(offset);},
    reveal(face){revealIndex=((Math.round(offset)%7)+7)%7;mode='result';started=clock;rotating=false;
      const tex=new T.TextureLoader().load(artURL(face,true));tex.colorSpace=T.SRGBColorSpace;
      const front=new T.Mesh(plate,new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,toneMapped:false}));front.rotation.y=Math.PI;front.position.z=-.029;cards[revealIndex].add(front);
      const frontReflection=new T.Mesh(plate,sheen);frontReflection.rotation.y=Math.PI;frontReflection.position.z=-.027;frontReflection.renderOrder=1;front.renderOrder=2;cards[revealIndex].add(frontReflection);
      const frontCorners=relief.fittings.clone();frontCorners.rotation.y=Math.PI;frontCorners.position.z=.065;cards[revealIndex].add(frontCorners);
      const frontMark=faceModel(face);frontMark.rotation.y=Math.PI;frontMark.position.z=-.115;const selected=cards[revealIndex];selected.add(frontMark);
      removeFace=()=>{
        selected.remove(front,frontReflection,frontCorners,frontMark);
        tex.dispose();front.material.dispose();
        const materials=new Set();
        frontMark.traverse(o=>{if(o.isMesh){o.geometry.dispose();materials.add(o.material);}});
        materials.forEach(m=>m.dispose());
      };
    },
    idle(){removeFace?.();removeFace=null;mode='idle';chosen=rotating=false;},resize
  };
}
function flatArt(host){
  const group=document.createElement('div');group.className='flat-cards';host.append(group);
  let offset=0,timer=0,cards=[];
  function draw(count,face){group.replaceChildren();cards=Array.from({length:count},(_,i)=>{const img=new Image();img.src=artURL(face);img.alt='';group.append(img);return img;});}
  function stop(){clearInterval(timer);}
  function advance(){offset++;cards.forEach((card,i)=>card.style.order=(i+offset)%cards.length);}
  draw(1);
  return {suspend:stop,resume(){},start(){draw(5);},idle(){stop();draw(1);},advance,rotate(){stop();timer=setInterval(advance,650);},stop,select(){stop();group.classList.add('selected');},reveal(face){stop();draw(1,face);},resize(){}};
}
