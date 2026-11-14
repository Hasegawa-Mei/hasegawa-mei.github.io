import * as T from 'three';
// The floor ink must be in the opaque pass used for glass transmission.
export function coverPrint(parent) {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=1024;
  const ctx=canvas.getContext('2d');
  ctx.translate(512,512);
  ctx.rotate(-.52);
  ctx.fillStyle='#273fe0';
  ctx.beginPath();
  ctx.arc(0,0,459,-2.67,1.03);
  ctx.arc(0,0,315,1.03,-2.67,true);
  ctx.closePath(); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(0,0,459,1.04,2.23);ctx.arc(0,0,315,2.23,1.04,true);ctx.closePath();ctx.clip();
  ctx.fillStyle='#344bdc';
  for(let y=-464;y<468;y+=9)for(let x=-464;x<468;x+=9){
    ctx.beginPath();ctx.arc(x,y,1.15+2.15*(x+465)/930,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
  const tex=new T.CanvasTexture(canvas);
  tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
  const mat=new T.MeshBasicMaterial({map:tex,alphaTest:.42,toneMapped:false});
  const print=new T.Mesh(new T.PlaneGeometry(6.0,6.0),mat);
  print.rotation.x=-Math.PI/2;print.position.set(.04,-.076,-.28);
  parent.add(print);
  return ()=>{tex.dispose();mat.dispose();};
}

