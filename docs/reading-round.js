import {resetGeneration} from './reset-reading.js';
// A round belongs to this tab. Existing notebook entries keep their own lifetime.
const storageKey = 'between.reading-round.1';
function newRound() {
  return { id: crypto.randomUUID(), started: Date.now(), generation: resetGeneration(), events: [], notes: {} };
}
function loadRound() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (saved?.id && (saved.generation || '') === resetGeneration() && Array.isArray(saved.events) && saved.notes) return saved;
  } catch {}
  return newRound();
}
export let round = loadRound();
function persist() {
  try { sessionStorage.setItem(storageKey, JSON.stringify(round)); } catch {}
}
// An empty reading round also needs a stable identity for a resumable duel.
persist();
export function restartRound() { round = newRound(); round.notebookKey='between.notes.'+round.id; persist(); }
export function record(topic, kind, text, field = '') {
  if (!topic || (!text && kind !== '回应')) return;
  if (kind !== '回应' || field !== 'after') return;
  round.events = round.events.filter(event => event.topic !== topic && event.kind === '回应' && event.field === 'after');
  round.events.push({topic, kind, text, field, at:Date.now()});
  persist();
}
export function rememberFinalScene(topic, options, time) {
  const state={...options};
  for(const key of ['commandAt','actionAt']) {
    if(Number.isFinite(state[key])) state[key]=8-(time-state[key]);
  }
  round.finalScenes ??= {};
  round.finalScenes[topic]=state;
}
export function note(topic, value) {
  round.notes[topic] = value;
  persist();
}
export const faces = [
  {id:'threshold', name:'守界者', en:'THE KEEPER', concept:'私人领域 · 边界与自主', thought:'你留意一条界线保护谁，也在意人能否自己决定向外界打开多少。守界，既包含保留庇护，也包含留出一扇可以打开的门。', color:'#203dec'},
  {id:'assembly', name:'共议者', en:'THE CONVENER', concept:'公共领域 · 复数性', thought:'你可能更关心一件事如何成为大家的事，尤其是谁有位置开口，谁的回应会被听见。', color:'#364ca1'},
  {id:'repair', name:'续物者', en:'THE MENDER', concept:'世界的持久性', thought:'你的注意力停在一次使用之后。一个物件能否留下来，被维护、归还，再交给另一个人，是你愿意追问的事。', color:'#347465'},
  {id:'inquiry', name:'追问者', en:'THE INQUIRER', concept:'工具性 · 暴力', thought:'你倾向于沿着器物继续追问。谁决定目的，谁去执行，谁承担后果，这些关系改变了你看待设计的方式。', color:'#745180'},
  {id:'discern', name:'辨识者', en:'THE DISCERNER', concept:'世界异化 · 消费者社会', thought:'你留意物件如何附着身份与期待。把这些标签暂时移开，可能更容易看清自己真正看重的东西。', color:'#806640'},
  {id:'witness', name:'观照者', en:'THE WITNESS', concept:'复数性 · 从他人的处境观看', thought:'你会把目光移向原本不在中心的人。谁没有进来，谁正在承担代价？先看见具体处境，再形成自己的判断，是你这一轮留下的线索。', color:'#263dd2'}
];
export const unwrittenFace={id:'unwritten',name:'未定之页',en:'NOT YET NAMED',concept:'等待你的最终想法',thought:'你留下的原话会被保留，身份仍可在下一次选择中形成。',color:'#263dd2'};
