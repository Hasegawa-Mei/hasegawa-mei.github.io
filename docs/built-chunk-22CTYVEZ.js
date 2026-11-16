import{a as U,b as R,c as b,l as M}from"./built-chunk-M7DTTBR7.js";import{B as i,E as h,O as x,S as s,U as n,V as S,_ as l,f as p,fb as v,ia as y,r as g}from"./built-chunk-PUZE7I6W.js";import"./built-chunk-WD73G3QW.js";import{a as u}from"./built-chunk-GS3VSVEW.js";import"./built-chunk-WHNGGEMS.js";import"./built-chunk-2Q4LZWYX.js";import"./built-chunk-7XXQBVX2.js";var T=29,c=class{constructor(t){this.renderer=t,this.target=new h(1,1,{type:g,samples:u().samples}),this.uniforms={tScene:{value:this.target.texture},uResolution:{value:new i(1,1)},uFocus:{value:new i(.7,.5)},uRadius:{value:.24},uBlur:{value:5}},this.uniforms.tSilhouette={value:null},this.uniforms.uStroke={value:new i},this.material=new n({uniforms:this.uniforms,depthTest:!1,depthWrite:!1,vertexShader:"varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}",fragmentShader:`
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
        }`}),this.scene=new y,this.camera=new S,this.scene.add(new s(new l(2,2),this.material))}outlineSubject(t){t.traverse(e=>{if(!e.isMesh)return;let r=Array.isArray(e.material)?e.material:[e.material];r.every(a=>!a.colorWrite||a.opacity===0||!a.visible)||e.geometry.type==="PlaneGeometry"&&r.some(a=>a.transparent&&a.map)||e.layers.enable(T)}),!this.silhouette&&(this.silhouette=new h(this.target.width,this.target.height,{samples:u().samples}),this.maskMaterial=new x({color:16777215,side:p,toneMapped:!1}),this.uniforms.tSilhouette.value=this.silhouette.texture)}drawSilhouette(t,e){let r=e.layers.mask,a=t.overrideMaterial,o=this.renderer.shadowMap.autoUpdate;try{e.layers.set(T),t.overrideMaterial=this.maskMaterial,this.renderer.shadowMap.autoUpdate=!1,this.renderer.setRenderTarget(this.silhouette),this.renderer.render(t,e)}finally{e.layers.mask=r,t.overrideMaterial=a,this.renderer.shadowMap.autoUpdate=o}}resize(t,e,r){this.target.setSize(Math.round(t*r),Math.round(e*r)),this.silhouette?.setSize(this.target.width,this.target.height),this.uniforms.uResolution.value.set(t*r,e*r),this.uniforms.uBlur.value=6*r}render(t,e,r,a,o=1,w=0){let f=r.clone().project(e);this.uniforms.uFocus.value.set((f.x+1)/2,(f.y+1)/2),this.uniforms.uRadius.value=a?.26:.21,this.uniforms.uBlur.value=4.6*this.renderer.getPixelRatio()*o;let m=this.silhouette?w:0;this.uniforms.uStroke.value.set(1.75*this.renderer.getPixelRatio(),m*.78),m>0&&this.drawSilhouette(t,e),this.renderer.setRenderTarget(this.target),this.renderer.render(t,e),this.renderer.setRenderTarget(null),this.renderer.render(this.scene,this.camera)}};function P(d){let t,e=new n({transparent:!0,depthWrite:!1,uniforms:{uTime:{value:0},uStrength:{value:.45},uPhase:{value:0}},vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:`varying vec2 vUv;uniform float uTime,uStrength,uPhase;
 float band(float x,float center,float w){return exp(-pow((x-center)*w,2.));}
 void main(){vec2 p=vUv-.5;float a=uPhase*.48;mat2 r=mat2(cos(a),-sin(a),sin(a),cos(a));p=r*p;p.x*=1.+.12*sin(uPhase);p.y*=2.1+.30*cos(uPhase*.7);float angle=atan(p.y,p.x);float q=length(p)+.026*sin(angle*4.+uPhase)+.008*sin(angle*9.-uTime*.3);float b=band(q,.332,125.);float red=band(q,.366,125.);float g=band(q,.349,145.);float bloom=band(q,.35,11.)*.23;float fleck=band(q,.30+.025*sin(angle*3.+uPhase),35.)*.2;vec3 color=vec3(.82*red+.05*b,.72*g+.13*b,.95*b+.18*red);float alpha=(max(red,max(g,b))*.65+bloom+fleck)*uStrength;gl_FragColor=vec4(color+.12,alpha);}`});return t=new s(new l(6.7,5.3),e),t.rotation.x=-Math.PI/2,t.rotation.z=.28,t.position.set(.35,-.171,.75),d.add(t),{update(r,a,o){e.uniforms.uTime.value=a,e.uniforms.uPhase.value=o,e.uniforms.uStrength.value=r<0?1.05:.2,t.position.y=r<0?-.08:.124,t.scale.setScalar(r<0?1:.72)}}}export{c as FocusLens,U as OrbitControls,R as RoomEnvironment,v as T,P as createRefractionLight,M as makeStudy,b as prepareStudy};
