function l(i,r,t=null){return new Promise(o=>{let n=!1,e=u=>{n||(n=!0,clearTimeout(s),o(u))},s=setTimeout(()=>e(t),r);Promise.resolve(i).then(e,()=>e(t))})}export{l as a};
