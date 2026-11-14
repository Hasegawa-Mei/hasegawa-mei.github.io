import * as T from 'three';
import {box,cyl,group,rod} from './scenes.js';

export function parkTree(parent,x,z,size,{wood,chalk,steel}) {
  const tree=group(parent,x,0,z);
  tree.scale.setScalar(size);
  const trunk=new T.CatmullRomCurve3([new T.Vector3(0,.16,0),new T.Vector3(.035,.65,-.02),new T.Vector3(-.06,1.08,.03),new T.Vector3(.05,1.75,0)]);
  tree.add(new T.Mesh(new T.TubeGeometry(trunk,18,.067,12,false),wood));
  rod(tree,[-.02,.92,0],[-.29,1.48,.10],.043,wood);
  rod(tree,[-.01,1.1,0],[.26,1.54,-.04],.037,wood);
  const geometry=new T.SphereGeometry(1,36,26);
  const pos=geometry.attributes.position;
  for(let i=0;i<pos.count;i++){
    const px=pos.getX(i),py=pos.getY(i),pz=pos.getZ(i);
    const phi=Math.atan2(pz,px), shoulder=1-py*py;
    const folds=1+shoulder*(.07*Math.cos(5*phi+py*2)+.035*Math.cos(9*phi-py));
    pos.setXYZ(i,px*.64*folds+.10*py,1.84+py*.82+.045*Math.cos(phi*3)*shoulder,pz*.56*folds);
  }
  geometry.computeVertexNormals();
  const crown=new T.Mesh(geometry,chalk);crown.castShadow=true;crown.receiveShadow=true;tree.add(crown);
  cyl(tree,.45,.052,0,.15,0,steel);cyl(tree,.39,.034,0,.19,0,chalk);
  return tree;
}

export function foldedSeat(parent,material) {
  // Cross-section of one bent shell. The top surface stays at the existing seated hip height.
  const profile=new T.Shape();
  profile.moveTo(.34,.80);profile.quadraticCurveTo(.39,.80,.39,.75);
  profile.quadraticCurveTo(.39,.69,.31,.68);profile.lineTo(-.20,.68);
  profile.quadraticCurveTo(-.37,.68,-.39,.87);profile.lineTo(-.46,1.37);
  profile.quadraticCurveTo(-.47,1.43,-.39,1.43);
  profile.quadraticCurveTo(-.35,1.43,-.34,1.36);profile.lineTo(-.27,.91);
  profile.quadraticCurveTo(-.26,.80,-.15,.80);profile.closePath();
  const geometry=new T.ExtrudeGeometry(profile,{depth:3.82,curveSegments:12,bevelEnabled:true,bevelThickness:.032,bevelSize:.023,bevelSegments:3});
  geometry.translate(0,0,-1.91);geometry.rotateY(-Math.PI/2);
  const mesh=new T.Mesh(geometry,material);
  mesh.name='Bent-seat-shell';mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
}

export function benchArm(parent,x,accent,steel) {
  const arm=group(parent,x,0,0);
  const pts=[[0,.79,-.22],[0,1.04,-.21],[0,1.10,-.13],[0,1.10,.19],[0,1.05,.26],[0,.80,.26]];
  const rail=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),24,.029,12,false),steel);
  rail.castShadow=true;arm.add(rail);
  box(arm,.093,.054,.38,0,1.115,.028,accent,.024);
  for(const z of [-.22,.26]) cyl(arm,.058,.027,0,.807,z,steel);
  return arm;
}

export function hinge(pivot,material,height) {
  for(const y of [.28,height-.13]){
    cyl(pivot,.055,.15,0,y,0,material);
    cyl(pivot,.066,.025,0,y+.085,0,material);
    box(pivot,.18,.053,.058,.085,y,0,material,.012);
  }
}

export function weatherHardware(phone,metal,ink) {
  for(const y of [1.92,2.18]) box(phone,.035,.15,.08,-.84,y,0,metal,.014);
  box(phone,.037,.28,.08,.84,1.98,0,metal,.014);
  box(phone,.27,.027,.017,0,.33,.213,ink,.01);
  for(let i=0;i<5;i++) box(phone,.041,.014,.034,-.42+i*.084,.098,.015,ink,.005);
}

