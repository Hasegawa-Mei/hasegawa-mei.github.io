import test from 'node:test';
import assert from 'node:assert/strict';
const listeners={},ticks=[],sources=[];let musicButton,autoplayBlocked=false;
const parameter=()=>({value:0,events:[],cancelScheduledValues(t){this.events.push(['cancel',t]);},setValueAtTime(v,t){this.events.push(['set',v,t]);},linearRampToValueAtTime(v,t){this.events.push(['ramp',v,t]);},setTargetAtTime(){}});
class FakeContext{
 constructor(){this.currentTime=0;this.state='suspended';this.destination={};FakeContext.instance=this;}
 createGain(){return {gain:parameter(),connect(){},disconnect(){}};}
 createBufferSource(){const s={connect(){},disconnect(){},start(...args){this.started=args;},stop(t){this.stopped=t??FakeContext.instance.currentTime;}};sources.push(s);return s;}
 decodeAudioData(label){return Promise.resolve({duration:label.includes('ordinary')?60:label.includes('prologue')?66:label.includes('finale')?65:80,label});}
 resume(){if(!autoplayBlocked)this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}
}
globalThis.window={AudioContext:FakeContext,addEventListener(){}};
globalThis.document={hidden:false,readyState:'complete',body:{append(){}},createElement(){return musicButton={dataset:{},setAttribute(){}};},addEventListener(n,fn){listeners[n]=fn;}};
globalThis.localStorage={getItem(){return 'off';},setItem(){}};
globalThis.fetch=async url=>({ok:true,arrayBuffer:async()=>url});
globalThis.setInterval=fn=>{ticks.push(fn);return 1;};
const music=await import('../docs/music.js');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
const clock=()=>FakeContext.instance;
const tick=t=>{clock().currentTime=t;ticks.forEach(fn=>fn());};
test('music starts automatically despite a mute saved by a previous visit',async()=>{
 await flush();assert.equal(music.musicEnabled(),true);assert.equal(sources.length,1);assert.deepEqual(sources[0].started,[0,0,57.5]);
});
test('loop restarts after one second of complete silence',async()=>{
 tick(57);assert.equal(sources.length,1);tick(57.1);assert.deepEqual(sources[1].started,[58.5,0,57.5]);
 assert.equal(sources[1].started[0]-(sources[0].started[0]+sources[0].started[2]),1);
});
test('new music waits for fade-out and silence, and cancels a queued repeat',async()=>{
 music.setMusic('finale',{out:.4,fade:3});await flush();assert.equal(sources[1].stopped,57.1);
 tick(57.2);await flush();const v=sources.at(-1);assert.match(v.buffer.label,/finale/);assert.ok(Math.abs(v.started[0]-58.5)<.001);assert.equal(v.started[1],0);
});
test('endgame entrance plays once; repeats skip first five seconds',async()=>{
 tick(60);music.setMusic('endgame',{out:2.4,fade:5});await flush();tick(62);await flush();
 const first=sources.at(-1);assert.match(first.buffer.label,/endgame/);assert.deepEqual(first.started,[63.4,0,76.8]);
 tick(140);const repeat=sources.at(-1);assert.equal(repeat.started[1],5);assert.ok(Math.abs(repeat.started[0]-141.2)<.001);assert.equal(repeat.started[2],71.8);
});
test('prologue starts at picture time and stops when picture is buffering',async()=>{
 tick(143);music.setMusic('prologue',{out:1});music.syncPrologue(0,false);await flush();tick(145.1);music.syncPrologue(2,true);await flush();
 const v=sources.at(-1);assert.match(v.buffer.label,/prologue/);assert.equal(v.started[1],2);music.syncPrologue(2,false);assert.ok(v.stopped<=145.2);
});
test('blocked autoplay starts after interaction and respects manual mute',async()=>{
 autoplayBlocked=true;const before=sources.length,blockedMusic=await import('../docs/music.js?blocked-autoplay');await flush();
 assert.equal(blockedMusic.musicEnabled(),true);assert.equal(sources.length,before);
 autoplayBlocked=false;listeners.click({target:{closest:()=>null}});await flush();assert.equal(sources.length,before+1);
 await musicButton.onclick();assert.equal(blockedMusic.musicEnabled(),false);listeners.pointerdown({target:{closest:()=>null}});await flush();assert.equal(blockedMusic.musicEnabled(),false);
});
