import * as T from 'three';
export function createRefractionLight(scene){
 let lightPlane;
 const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uStrength:{value:.45},uPhase:{value:0}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:`varying vec2 vUv;uniform float uTime,uStrength,uPhase;
 float band(float x,float center,float w){return exp(-pow((x-center)*w,2.));}
 void main(){vec2 p=vUv-.5;float a=uPhase*.48;mat2 r=mat2(cos(a),-sin(a),sin(a),cos(a));p=r*p;p.x*=1.+.12*sin(uPhase);p.y*=2.1+.30*cos(uPhase*.7);float angle=atan(p.y,p.x);float q=length(p)+.026*sin(angle*4.+uPhase)+.008*sin(angle*9.-uTime*.3);float b=band(q,.332,125.);float red=band(q,.366,125.);float g=band(q,.349,145.);float bloom=band(q,.35,11.)*.23;float fleck=band(q,.30+.025*sin(angle*3.+uPhase),35.)*.2;vec3 color=vec3(.82*red+.05*b,.72*g+.13*b,.95*b+.18*red);float alpha=(max(red,max(g,b))*.65+bloom+fleck)*uStrength;gl_FragColor=vec4(color+.12,alpha);}`});
 lightPlane=new T.Mesh(new T.PlaneGeometry(6.7,5.3),mat);lightPlane.rotation.x=-Math.PI/2;lightPlane.rotation.z=.28;lightPlane.position.set(.35,-.171,.75);scene.add(lightPlane);return {update(index,time,phase){mat.uniforms.uTime.value=time;mat.uniforms.uPhase.value=phase;mat.uniforms.uStrength.value=index<0?1.05:.20;lightPlane.position.y=index<0?-.08:.124;lightPlane.scale.setScalar(index<0?1:.72);}};
}
