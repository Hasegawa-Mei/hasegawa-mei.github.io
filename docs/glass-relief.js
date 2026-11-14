import * as T from 'three';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
const tau=Math.PI*2;

// A height field makes the lathe-cut rosette respond to the same light as the glass.
export function cutSurface(){
  const canvas=document.createElement('canvas');canvas.width=960;canvas.height=1482;
  const ctx=canvas.getContext('2d');ctx.scale(3,3);ctx.fillStyle='#bfc0bf';ctx.fillRect(0,0,320,494);
  ctx.strokeStyle='#333';ctx.lineWidth=1.15;
  for(let band=0;band<22;band++){
    ctx.beginPath();
    for(let i=0;i<=640;i++){
      const t=i*tau/640,r=51+band*2.5+(8+band*.24)*Math.cos(t*8+band*.095);
      const x=160+Math.cos(t)*r,y=247+Math.sin(t)*r*1.22;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.stroke();
  }
  for(const inset of [10,14,19]){ctx.beginPath();ctx.roundRect(inset,inset,320-inset*2,494-inset*2,9);ctx.stroke();}
  const tex=new T.CanvasTexture(canvas);tex.anisotropy=4;return tex;
}
const silver=new T.MeshPhysicalMaterial({color:'#b8c6d9',metalness:.83,roughness:.16,clearcoat:.85,iridescence:.48,iridescenceIOR:1.32,iridescenceThicknessRange:[180,375]});
const smoked=new T.MeshStandardMaterial({color:'#8f9fb7',metalness:.72,roughness:.22});
const prism=new T.MeshPhysicalMaterial({color:'#e8efff',metalness:.22,roughness:.075,transmission:.48,thickness:.09,ior:1.54,iridescence:.7,iridescenceIOR:1.42,iridescenceThicknessRange:[140,420],envMapIntensity:1.45});
const core=new T.MeshPhysicalMaterial({color:'#283bc2',metalness:.54,roughness:.13,clearcoat:.86,envMapIntensity:1.22});
function pipe(points,r,material,closed=false){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),closed,'centripetal');
 const mesh=new T.Mesh(new T.TubeGeometry(curve,Math.max(16,points.length*3),r,7,closed),material);
 return mesh;
}
// Separate parts have a visible standoff. All orbital heights stay in front of the glass.
export function reliefParts(){
  const fittings=new T.Group();
  for(const sx of [-1,1])for(const sy of [-1,1]){
    const corner=new T.Group();corner.position.set(sx*.728,sy*1.16,.102);corner.scale.set(-sx,-sy,1);
    for(let j=0;j<3;j++){
      const inlay=j*.037,size=.245-j*.054,z=.021+j*.011;
      corner.add(pipe([[inlay,size+inlay,z],[inlay,inlay+.035,z],[inlay+.008,inlay+.008,z],[inlay+.035,inlay,z],[size+inlay,inlay,z]],j===0?.012:.008,j===1?prism:silver));
    }
    for(const [x,y] of [[0,.21],[.21,0]]){const pin=new T.Mesh(new T.CylinderGeometry(.014,.018,.039,12),smoked);pin.rotation.x=Math.PI/2;pin.position.set(x,y,.005);corner.add(pin);}
    fittings.add(corner);
  }
  const center=new T.Group();
  for(let j=0;j<2;j++){
    const pts=[];
    for(let i=0;i<96;i++){
      const t=tau*i/96,angle=j?-.52:.53;
      const u=Math.cos(t)*(j?.505:.45),v=Math.sin(t)*(j?.19:.235);
      pts.push([u*Math.cos(angle)-v*Math.sin(angle),u*Math.sin(angle)+v*Math.cos(angle),.208+Math.sin(t)*.065+j*.017]);
    }
    center.add(pipe(pts,j?.021:.027,j?prism:silver,true));
  }
  const cube=new T.Mesh(new RoundedBoxGeometry(.218,.218,.218,3,.012),core);cube.rotation.set(.52,.62,.36);cube.position.z=.295;center.add(cube);
  return {fittings,center};
}
export function lightCards(room){
  // Thin coloured softboxes contribute broken spectrum highlights in the beveled edges.
  for(const [x,y,z,color,width,height] of [[-3.6,1,2.4,0x92d8ff,.35,3],[3.4,2.1,1.8,0xffa8d4,.38,2.8],[2.5,-1.6,-1.6,0xffe3a0,1.5,.29]]){
    const panel=new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({color,side:T.DoubleSide}));
    panel.material.color.multiplyScalar(4.1);panel.position.set(x,y,z);panel.lookAt(0,0,0);room.add(panel);
  }
}

