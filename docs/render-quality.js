// Keep the artwork; limit the number of pixels and shadow samples on small devices.
export function renderQuality(env=globalThis){
 const compact=!!env.matchMedia?.('(pointer: coarse)').matches||!!env.matchMedia?.('(max-width: 900px)').matches;
 const memory=env.navigator?.deviceMemory;
 const light=compact||(memory>0&&memory<=4);
 return {pixelRatio:Math.min(env.devicePixelRatio||1,light?1:1.35),shadow:light?1024:2048,samples:light?0:2,interval:light?1000/30:0};
}
