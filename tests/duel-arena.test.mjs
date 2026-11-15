import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Window} from 'happy-dom';
import {newMatch,drawIdentity,rollInitiative,beginTurn,selectConcept,submitTurn,nextTurn,agreeAlternative,validSaved} from '../docs/duel-state.js';
import {scenarioById,concepts} from '../docs/duel-data.js';

// Exercise the actual scene graph without requiring a GPU in Node.
const window=new Window({url:'http://localhost/'});
for(const name of ['window','document','localStorage','sessionStorage','matchMedia']){
 const value=name==='window'?window:window[name];
 globalThis[name]=typeof value==='function'?value.bind(window):value;
}
after(()=>window.close());
const root=fileURLToPath(new URL('..',import.meta.url));
const result=await build({stdin:{contents:"export {DuelArena} from './docs/duel-arena.js'; export * as T from 'three';",resolveDir:root},bundle:true,format:'esm',platform:'node',write:false,logLevel:'silent',alias:{three:fileURLToPath(new URL('../docs/vendor/three.module.js',import.meta.url))}});
const {DuelArena,T}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
function arena(){
 const a=new DuelArena();a.scene=new T.Scene();a.m={};
 for(const name of ['floor','stone','plaster','blue','edge','satin','matte','glow'])a.m[name]=new T.MeshStandardMaterial();
 a.buildBoard();a.buildSeats();return a;
}
function game(){const s=newMatch('threshold','arena-test');drawIdentity(s,1);rollInitiative(s);beginTurn(s);return s;}
function answer(s,matched=true){
 const accepted=scenarioById(s.scenario).accepted;
 let id=s.players[s.active].hand.find(id=>accepted.includes(id)===matched);
 if(!id){id=concepts.find(c=>accepted.includes(c.id)===matched).id;s.players[s.active].hand[0]=id;}
 selectConcept(s,id);s.reason='邀请受影响的人共同讨论，保留原始记录与重新提出不同意见的机会。';submitTurn(s);
}
function snapshot(s){return {turn:s.turn,feedback:s.phase==='feedback',stars:s.players.map(p=>p.hp),history:s.history.map(h=>({player:h.player,ok:!!(h.matched||h.overridden)}))};}
function display(a,s){a.endgame=s.phase.startsWith('endgame-');a.sync(snapshot(s),s.active);}
function standing(a){return a.pawns.map(list=>list.filter(p=>p.userData.alive).length);}

test('eight completed rounds create eight pieces without changing saved match data',()=>{
 const a=arena(),s=game();
 for(let i=0;i<8;i++){
  answer(s);const before=JSON.stringify(s);display(a,s);
  assert.equal(a.pieces.length,i+1);assert.equal(JSON.stringify(s),before);
  assert.deepEqual(standing(a),s.players.map(p=>p.hp));nextTurn(s);
 }
 display(a,s);assert.equal(s.endgame.trigger,'tie');assert.equal(a.pieces.length,8);assert.equal(a.cursor.visible,false);
});
test('rescue and private design phases retain pieces and lost stars without inviting another normal turn',()=>{
 const a=arena(),s=game();for(let i=0;i<3;i++){answer(s,false);nextTurn(s);}
 assert.equal(s.endgame.trigger,'rescue');
 for(const phase of ['endgame-intro','endgame-think','endgame-write-gate','endgame-write','endgame-score-gate','endgame-score','endgame-reveal']){
  s.phase=phase;display(a,s);assert.equal(a.pieces.length,3);assert.equal(a.cursor.visible,false,phase);assert.deepEqual(standing(a),s.players.map(p=>p.hp));
 }
});
test('a jointly accepted interpretation restores its pawn and keeps one piece for the round',()=>{
 const a=arena(),s=game();answer(s,false);display(a,s);assert.equal(standing(a)[s.active],2);assert.equal(a.pieces[0].userData.ok,false);
 agreeAlternative(s,[true,true]);display(a,s);assert.equal(standing(a)[s.active],3);assert.equal(a.pieces.length,1);assert.equal(a.pieces[0].userData.ok,true);
});
test('restoration reconstructs the board and a new match removes the previous pieces',()=>{
 const a=arena(),s=game();for(let i=0;i<4;i++){answer(s);nextTurn(s);}
 const restored=JSON.parse(JSON.stringify(s));assert.equal(validSaved(restored,'arena-test'),true);display(a,restored);assert.equal(a.pieces.length,4);
 const previous=[...a.pieces];display(a,game());assert.equal(a.pieces.length,0);assert.ok(previous.every(p=>p.parent===null));assert.deepEqual(standing(a),[3,3]);assert.equal(a.cursor.visible,true);
});
