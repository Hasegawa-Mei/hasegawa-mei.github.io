import test from 'node:test';
import assert from 'node:assert/strict';
import {newMatch,setMatchMode,rollInitiative,beginTurn,submitTurn,nextTurn,validSaved,upgradeMatch} from '../docs/duel-state.js';
import {botDesigns,advanceBot,botPending} from '../docs/duel-bot.js';
import {concepts,scenarioById} from '../docs/duel-data.js';
import {endgameChallenges,beginEndgame,beginDesigns,openEndgameGate,submitDesign,beginScoring,submitRating,revealEndgame,concealEndgame} from '../docs/duel-endgame.js';
const reading='bot-test';
function match(first=1){const s=newMatch('threshold',reading,'bot');rollInitiative(s);s.first=first;s.rolls=[[first?1:6,first?6:1]];beginTurn(s);return s;}
function humanAnswer(s,correct){const accepted=scenarioById(s.scenario).accepted;let id=s.players[0].hand.find(id=>accepted.includes(id)===correct);if(!id){id=concepts.find(c=>accepted.includes(c.id)===correct).id;s.players[0].hand[0]=id;}s.selected=id;s.reason='邀请受到影响的人一起讨论，保留原始记录并安排可以实际使用的复议机会。';submitTurn(s);}
test('bot probability is exactly 80 of 100 evenly spaced draws, even with all-correct hands',()=>{
 let correct=0;
 for(let i=0;i<100;i++){const s=match();const scenario=scenarioById(s.scenario);s.players[1].hand=scenario.accepted.slice(0,3);const human=structuredClone(s.players[0]);let draws=0;advanceBot(s,()=>draws++===0?i/100:.3);correct+=Number(s.history[0].matched);assert.deepEqual(s.players[0],human);assert.equal(s.players[1].hand.length,2);assert.equal(advanceBot(s),false);assert.equal(validSaved(s,reading),true);}
 assert.equal(correct,80);
});
test('bot never acts for the human and cannot change an already-started mode',()=>{
 const s=match(0),before=structuredClone(s);assert.equal(advanceBot(s),false);setMatchMode(s,'human');assert.deepEqual(s,before);
 const human=newMatch('threshold',reading);setMatchMode(human,'bot');assert.ok(human.players[1].face);setMatchMode(human,'human');assert.equal(human.players[1].name,'旅人二');
});
test('version 3 saves migrate to human mode without changing history or hand size',()=>{
 const s=match(0);humanAnswer(s,true);s.version=3;delete s.mode;const u=upgradeMatch(s);assert.equal(u.mode,'human');assert.deepEqual(u.history,s.history);assert.deepEqual(u.players,s.players);assert.equal(validSaved(u,reading),true);u.mode='bad';assert.equal(validSaved(u,reading),false);
});
for(const first of [0,1])for(const challenge of endgameChallenges)test(`bot completes ${challenge.id}, first=${first}, with sealed, persistent random scores`,()=>{
 let s=match(first);
 while(s.phase==='play'){
  if(s.active===1)advanceBot(s,()=>.1);else humanAnswer(s,false);
  nextTurn(s);
 }
 assert.equal(s.phase,'endgame-intro');s.endgame.challenge=challenge.id;
 beginEndgame(s);beginDesigns(s);
 for(let turn=0;turn<2;turn++){
  if(botPending(s))advanceBot(s);else{openEndgameGate(s);s.endgame.drafts[0]={concept:'judgment',plan:'我会先请受影响的人说明处境，让参与者核实事实并共同提出可撤回的试行方案。',care:'保留线下申诉入口，失败时暂停实施并公开复议的理由。'};submitDesign(s);}
  assert.equal(validSaved(s,reading),true);s=structuredClone(s);concealEndgame(s);
 }
 assert.deepEqual(s.endgame.designs[1],botDesigns[challenge.id]);assert.equal(s.phase,'endgame-exchange');beginScoring(s);
 for(let turn=0;turn<2;turn++){
  if(botPending(s)){let i=0;advanceBot(s,()=>[0,.2,.6,.999][i++]);}else{openEndgameGate(s);s.endgame.ratingDrafts[0]={values:[5,4,4,3],comment:'概念与方案有明确的联系，也保留了具体纠错的机会。'};submitRating(s);}
  assert.equal(validSaved(s,reading),true);s=structuredClone(s);concealEndgame(s);
 }
 assert.equal(s.phase,'endgame-reveal');assert.equal(s.endgame.revealed,false);assert.deepEqual(s.endgame.ratings[1].values,[1,2,4,5]);assert.match(s.endgame.ratings[1].comment,/随机/);const sealed=structuredClone(s.endgame.ratings);assert.equal(advanceBot(s),false);assert.deepEqual(s.endgame.ratings,sealed);revealEndgame(s);assert.equal(validSaved(s,reading),true);
});
