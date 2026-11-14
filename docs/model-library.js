import {assetBytes} from './resource-cache.js';
import {clone as cloneRig} from './vendor/SkeletonUtils.js';
import * as THREE from 'three';

const studyAssets = {
  tutorial:['FIG_STAND','FIG_SIT','WHEELCHAIR'],
  boundary:['FIG_STAND','FIG_SIT','WHEELCHAIR'],
  public:['FIG_STAND','FIG_SIT','WHEELCHAIR','STROLLER'],
  power:['FIG_STAND','FIG_SIT','THRONE'],
  privacy:['FIG_STAND','FIG_SIT','KLINE'],
  alienation:['FIG_STAND'],
  'alienation-two':['FIG_STAND','DISPLAY_BAG'],
  violence:['FIG_STAND']
};

const pigment = {
  WHITE_STONE:new THREE.MeshStandardMaterial({color:'#e5e4df',roughness:.73}),
  WHITE_BODY:new THREE.MeshStandardMaterial({color:'#eceeeb',roughness:.50}),
  TEXTILE:new THREE.MeshStandardMaterial({color:'#dedfdc',roughness:.93}),
  RUBBER:new THREE.MeshStandardMaterial({color:'#828894',roughness:.81}),
  SATIN_METAL:new THREE.MeshStandardMaterial({color:'#c2c8d2',roughness:.26,metalness:.74}),
  BLUE_ACCENT:new THREE.MeshStandardMaterial({color:'#253dc5',roughness:.29,metalness:.34}),
  GLASS_OR_METAL_PROXY:new THREE.MeshPhysicalMaterial({color:'#f1f6ff',transmission:.93,thickness:.13,ior:1.48,dispersion:.28,roughness:.09}),
  GLASS_ACTOR_PROXY:new THREE.MeshStandardMaterial({color:'#eaedeb',roughness:.41})
};
const templates=new Map(), requests=new Map();
let loader;
async function fetchTemplate(id){
  if(!loader)loader=import('./vendor/GLTFLoader.js').then(({GLTFLoader})=>new GLTFLoader());
  const url=new URL('./assets/models/'+id+'.glb',import.meta.url);
  const gltf=await (await loader).parseAsync(await assetBytes(url.href),new URL('./',url).href);
  gltf.scene.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const source=mesh.material;
    mesh.material=pigment[source.name] || pigment.WHITE_BODY;
    mesh.castShadow=!mesh.material.transmission;
    mesh.receiveShadow=true;
    mesh.geometry.userData.libraryAsset=true;
  });
  templates.set(id,gltf.scene);
}

export function prepareStudy(id){
  return Promise.all((studyAssets[id] || []).map(key=>{
    if(!requests.has(key))requests.set(key,fetchTemplate(key).catch(error=>{
      console.warn('Model unavailable:',key,error.message);
      requests.delete(key);
    }));
    return requests.get(key);
  }));
}

export function placeAsset(parent,id,x=0,y=0,z=0,scale=1){
  const template=templates.get(id);
  if(!template)return null;
  const object=id==='FIG_STAND'?cloneRig(template):template.clone(true);
  object.name=id;
  object.position.set(x,y,z);
  object.scale.setScalar(scale);
  parent.add(object);
  return object;
}

