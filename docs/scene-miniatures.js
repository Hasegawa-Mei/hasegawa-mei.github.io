import {prepareStudy} from './model-library.js';
import * as THREE from 'three';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {makeStudy} from './dialogue-scenes.js';
import {reflectionOptions} from './reader-extras.js';
import {initialStudyOptions} from './study-state.js';
import {aiFinals} from './ai-content.js';

export function fallbackURL(row) {
  if(aiFinals[row.unit]?.choices.includes(row.answer))return 'assets/recap/ai-'+row.study.id+'-'+row.choice+'.webp';
  return 'assets/recap/'+row.study.id+'-'+(row.choice<0?'open':row.choice)+'.webp';
}

// A single drawing surface serves the visible models. Each figure retains its
// rendered view while the reader scrolls. A drag renders the geometry again.
export class MiniatureGallery {
  constructor(rows) {
    this.rows = rows;
    this.views = new Map();
    this.disposers = [];
  }

  prepare() {
    if (this.renderer) return;
    this.renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = .9;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f5f5f3');
    const room = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(this.renderer);
    this.environment = generator.fromScene(room,.04);
    room.dispose();
    generator.dispose();
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = .55;
    this.scene.add(new THREE.HemisphereLight('#ffffff','#aeb6c4',1.35));
    const key = new THREE.DirectionalLight('#ffffff',2.75);
    key.position.set(-4,8,5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024,1024);
    Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6});
    key.shadow.normalBias = .025;
    this.scene.add(key);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({opacity:.10}));
    floor.rotation.x = -Math.PI/2;
    floor.position.y = -.11;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.camera = new THREE.OrthographicCamera(-4,4,3,-3,.1,80);
  }

  view(row) {
    let view = this.views.get(row.unit);
    if (view) return view;
    const model = makeStudy(row.study.id);
    const base = {...initialStudyOptions[row.unit], ...row.state};
    if (!row.state && row.unit===1) Object.assign(base,{meeting:true,open:true,gather:5});
    if (!row.state && row.unit===5) base.era=2;
    const after = row.answer;
    const options = reflectionOptions(row.unit,1,1,{after},base,8);
    for (let frame=0;frame<75;frame++) model.update(options,8,.1);
    if (row.study.id==='alienation-two'&&!options.aiCase) {
      (model.legacyRoot||model.root).children.forEach((district,index)=>district.visible=index===options.era);
    }
    model.root.visible = false;
    this.scene.add(model.root);
    view = {model,yaw:.48,pitch:.50};
    this.views.set(row.unit,view);
    return view;
  }

  draw(row,width=640,height=420) {
    this.prepare();
    const view = this.view(row);
    this.renderer.setSize(width,height,false);
    const aspect = width/height;
    const half = Math.max(2.65,5.05/aspect);
    Object.assign(this.camera,{left:-half*aspect,right:half*aspect,top:half,bottom:-half});
    const center = row.unit===3?1.35:1.12;
    const radius = 12*Math.cos(view.pitch);
    this.camera.position.set(radius*Math.sin(view.yaw),center+12*Math.sin(view.pitch),radius*Math.cos(view.yaw));
    this.camera.lookAt(0,center,0);
    this.camera.updateProjectionMatrix();
    view.model.root.visible = true;
    try { this.renderer.render(this.scene,this.camera); }
    finally { view.model.root.visible = false; }
    return this.renderer.domElement;
  }

  mount(container,scrollRoot) {
    const observer = new IntersectionObserver(entries=>{
      for (const entry of entries) if(entry.isIntersecting) {
        observer.unobserve(entry.target);
        this.attach(entry.target,this.rows[Number(entry.target.dataset.mini)]);
      }
    },{root:scrollRoot,rootMargin:'160px 0px'});
    container.querySelectorAll('[data-mini]').forEach(el=>observer.observe(el));
    this.disposers.push(()=>observer.disconnect());
  }

  async attach(figure,row) {
    await prepareStudy(row.study.id);
    if(this.disposed || !figure.isConnected)return;
    const canvas = figure.querySelector('canvas');
    const context = canvas.getContext('2d');
    const paint = () => {
      const rect = figure.getBoundingClientRect();
      const width=Math.max(300,Math.min(820,Math.round(rect.width*1.6)));
      const height=Math.round(width/(rect.width/rect.height || 1.5));
      const source=this.draw(row,width,height);
      if(canvas.width!==width || canvas.height!==height){canvas.width=width;canvas.height=height;}
      context.drawImage(source,0,0);
    };
    try {paint();} catch {return;}
    canvas.hidden=false;
    figure.classList.add('interactive-mini');
    figure.tabIndex=0;
    figure.setAttribute('aria-label',row.study.title.join('')+'，拖动或使用方向键旋转模型');
    let point=null,request=0;
    const view=this.views.get(row.unit);
    const turn=(dx,dy)=>{
      view.yaw+=dx*.012;
      view.pitch=THREE.MathUtils.clamp(view.pitch+dy*.008,.12,1.1);
      cancelAnimationFrame(request);
      request=requestAnimationFrame(paint);
    };
    figure.onpointerdown=e=>{
      if(e.button!==0)return;
      point={id:e.pointerId,x:e.clientX,y:e.clientY};
      figure.setPointerCapture(e.pointerId);
    };
    figure.onpointermove=e=>{
      if(!point||e.pointerId!==point.id)return;
      turn(e.clientX-point.x,e.clientY-point.y);
      point.x=e.clientX;point.y=e.clientY;
    };
    figure.onlostpointercapture=()=>{point=null;};
    figure.onkeydown=e=>{
      const movement={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,8],ArrowDown:[0,-8]}[e.key];
      if(movement){e.preventDefault();turn(...movement);}
    };
    const resize=new ResizeObserver(()=>{cancelAnimationFrame(request);request=requestAnimationFrame(paint);});
    resize.observe(figure);
    this.disposers.push(()=>{resize.disconnect();cancelAnimationFrame(request);});
  }

  async picture(row) {
    try { await prepareStudy(row.study.id); return this.draw(row,720,460).toDataURL('image/webp',.89); }
    catch {
      const response = await fetch(fallbackURL(row));
      if(!response.ok) throw Error('模型画面暂时无法导出');
      const blob=await response.blob();
      return new Promise((resolve,reject)=>{ const file=new FileReader(); file.onload=()=>resolve(file.result); file.onerror=reject; file.readAsDataURL(blob); });
    }
  }

  dispose() {
    this.disposed=true;
    this.disposers.forEach(stop=>stop());
    this.views.forEach(({model})=>model.dispose?.());
    this.scene?.traverse(object=>{object.skeleton?.dispose();if(!object.geometry?.userData.libraryAsset)object.geometry?.dispose();});
    const materials=new Set();this.scene?.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m?.userData.local)materials.add(m);});
    materials.forEach(m=>{m.map?.dispose();m.dispose();});
    this.environment?.dispose();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.views.clear();
  }
}
