const bytes=new Map(),images=new Map(),objectURLs=new Map();
const key=url=>new URL(url,import.meta.url).href;
export function rememberBytes(url,data){bytes.set(key(url),data);}
export async function assetBytes(url){
 const id=key(url);if(bytes.has(id))return bytes.get(id).slice(0);
 const response=await fetch(id);if(!response.ok)throw Error('Resource unavailable: '+url);
 const data=await response.arrayBuffer();bytes.set(id,data);return data.slice(0);
}
export function assetURL(url,type='video/mp4'){
 const id=key(url);if(!bytes.has(id))return id;
 if(!objectURLs.has(id))objectURLs.set(id,URL.createObjectURL(new Blob([bytes.get(id)],{type})));
 return objectURLs.get(id);
}
export async function prepareImage(url,keep=false){
 const id=key(url);if(images.has(id))return images.get(id);
 const img=new Image();img.decoding='async';img.src=id;await img.decode();if(keep)images.set(id,img);return img;
}
export const preparedImage=url=>images.get(key(url));
