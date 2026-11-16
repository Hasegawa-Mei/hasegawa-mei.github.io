import {renderQuality} from './render-quality.js';
import * as T from 'three';
const OUTLINE_LAYER=29;

// Only the scene passes through this lens. The book's text remains native and sharp.
export class FocusLens {
  constructor(renderer) {
    this.renderer=renderer;
    this.target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,samples:renderQuality().samples});
    this.uniforms={tScene:{value:this.target.texture},uResolution:{value:new T.Vector2(1,1)},uFocus:{value:new T.Vector2(.7,.5)},uRadius:{value:.24},uBlur:{value:5}};
    this.uniforms.tSilhouette={value:null};
    this.uniforms.uStroke={value:new T.Vector2()};
    this.material=new T.ShaderMaterial({uniforms:this.uniforms,depthTest:false,depthWrite:false,
      vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
      fragmentShader:`
        uniform sampler2D tScene,tSilhouette;
        uniform vec2 uResolution,uFocus,uStroke;
        uniform float uRadius,uBlur;
        varying vec2 vUv;
        void main(){
          vec2 p=(vUv-uFocus)*vec2(uResolution.x/uResolution.y,1.0);
          float peripheral=smoothstep(uRadius,uRadius+.35,length(p));
          vec2 spread=vec2(uBlur)*peripheral/uResolution;
          vec4 color=texture2D(tScene,vUv)*.20;
          color+=texture2D(tScene,vUv+spread*vec2(1.,0.))*.12;
          color+=texture2D(tScene,vUv+spread*vec2(-1.,0.))*.12;
          color+=texture2D(tScene,vUv+spread*vec2(0.,1.))*.12;
          color+=texture2D(tScene,vUv+spread*vec2(0.,-1.))*.12;
          color+=texture2D(tScene,vUv+spread*vec2(.707,.707))*.08;
          color+=texture2D(tScene,vUv+spread*vec2(-.707,.707))*.08;
          color+=texture2D(tScene,vUv+spread*vec2(.707,-.707))*.08;
          color+=texture2D(tScene,vUv+spread*vec2(-.707,-.707))*.08;
          // The render target contains premultiplied edges and transparent shadows.
          gl_FragColor=vec4(color.rgb/max(color.a,0.0001),color.a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          gl_FragColor.rgb*=gl_FragColor.a;
          if(uStroke.y>0.0){
            vec2 stepUV=vec2(uStroke.x)/uResolution;
            float inside=texture2D(tSilhouette,vUv).a;
            float nearby=0.0;
            for(int i=0;i<8;i++){
              float angle=float(i)*.78539816;
              nearby=max(nearby,texture2D(tSilhouette,vUv+stepUV*vec2(cos(angle),sin(angle))).a);
            }
            float stroke=max(nearby-inside,0.0)*uStroke.y;
            gl_FragColor=mix(gl_FragColor,vec4(.17,.30,.55,1.),stroke);
          }
        }`});
    this.scene=new T.Scene();this.camera=new T.Camera();
    this.scene.add(new T.Mesh(new T.PlaneGeometry(2,2),this.material));
  }
  outlineSubject(root){
    root.traverse(obj=>{
      if(!obj.isMesh)return;
      const mats=Array.isArray(obj.material)?obj.material:[obj.material];
      if(mats.every(m=>!m.colorWrite||m.opacity===0||!m.visible))return;
      if(obj.geometry.type==='PlaneGeometry'&&mats.some(m=>m.transparent&&m.map))return;
      obj.layers.enable(OUTLINE_LAYER);
    });
    if(this.silhouette)return;
    this.silhouette=new T.WebGLRenderTarget(this.target.width,this.target.height,{samples:renderQuality().samples});
    this.maskMaterial=new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide,toneMapped:false});
    this.uniforms.tSilhouette.value=this.silhouette.texture;
  }
  drawSilhouette(scene,camera){
    // One coverage pass for the assembled model. The paper, cast shadows and
    // refracted light never enter the mask. Internal mesh seams have no edge here.
    const layers=camera.layers.mask,material=scene.overrideMaterial;
    const shadows=this.renderer.shadowMap.autoUpdate;
    try{
      camera.layers.set(OUTLINE_LAYER);
      scene.overrideMaterial=this.maskMaterial;
      this.renderer.shadowMap.autoUpdate=false;
      this.renderer.setRenderTarget(this.silhouette);
      this.renderer.render(scene,camera);
    }finally{
      camera.layers.mask=layers;scene.overrideMaterial=material;
      this.renderer.shadowMap.autoUpdate=shadows;
    }
  }
  resize(w,h,dpr){this.target.setSize(Math.round(w*dpr),Math.round(h*dpr));this.silhouette?.setSize(this.target.width,this.target.height);this.uniforms.uResolution.value.set(w*dpr,h*dpr);this.uniforms.uBlur.value=6*dpr;}
  render(scene,camera,point,inspection,blurAmount=1,outlineAmount=0){
    const projected=point.clone().project(camera);
    this.uniforms.uFocus.value.set((projected.x+1)/2,(projected.y+1)/2);
    this.uniforms.uRadius.value=inspection?.26:.21;
    this.uniforms.uBlur.value=6*this.renderer.getPixelRatio()*blurAmount;
    const ink=this.silhouette?outlineAmount:0;
    this.uniforms.uStroke.value.set(1.75*this.renderer.getPixelRatio(),ink*.78);
    if(ink>0)this.drawSilhouette(scene,camera);
    this.renderer.setRenderTarget(this.target);this.renderer.render(scene,camera);
    this.renderer.setRenderTarget(null);this.renderer.render(this.scene,this.camera);
  }
}
