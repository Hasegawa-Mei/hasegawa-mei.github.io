// The edited film keeps every shot at 1536 × 512, with baked monochrome,
// silent audio, subject-aware crops and fades. Sources: ./footage-sources.html.
const clip=(id,label,duration)=>({src:`./assets/prologue/${id}.mp4`,poster:`./assets/prologue/${id}.jpg`,duration,label,bakedFades:true});
export const prologueMedia={
 montage:{src:'./assets/prologue/prologue-montage-wide.mp4',poster:'./assets/prologue/00-lighthouse-wide.jpg',duration:38.16,label:'星星降落、岗位变化、AI 回答、展会围观与机器人送餐',bakedFades:true},
 opening:clip('00-lighthouse-wide','星星落下，灯塔照亮',15),
 events:[
  clip('01-displacement-wide','收拾物品，抱起纸箱，离开工位',5.96),
  clip('02-learning-wide','向 ChatGPT 提问，答案生成，学生书写',6.76),
  clip('03-attention-wide','人形机器人伸手，观众举起手机拍摄',4.96),
  clip('04-automation-wide','机器人驶近餐桌，顾客从托盘取菜',5.48)
 ]
};
