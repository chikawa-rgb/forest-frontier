import { useState, useEffect, useRef, useCallback } from "react";

const W=700,H=480,SPEED=2.4,REACH=52;
const PRICES={wood:2,meat:5,fur:8,mushroom:3,ore:12};
const SELL_Y=H-44;
const TOWER_POS={x:556,y:182};

const SELL_STATIONS=[
  {id:"sw",res:"wood",    x:70, y:SELL_Y,label:"材木屋",icon:"🪵",col:"#78350f",req:null,      cd:0},
  {id:"sm",res:"meat",    x:210,y:SELL_Y,label:"精肉店",icon:"🥩",col:"#b91c1c",req:"axe1",   cd:0},
  {id:"sf",res:"fur",     x:350,y:SELL_Y,label:"毛皮商",icon:"🦊",col:"#7c3aed",req:"axe1",   cd:0},
  {id:"sh",res:"mushroom",x:490,y:SELL_Y,label:"薬草屋",icon:"🍄",col:"#166534",req:"basket", cd:0},
  {id:"so",res:"ore",     x:630,y:SELL_Y,label:"鉱石屋",icon:"💎",col:"#334155",req:"pickaxe",cd:0},
];
const UPGRADES_DATA=[
  {id:"axe1",   name:"鉄の斧",    cost:40,  req:null,       desc:"木材+2/回・狩り解放"},
  {id:"basket", name:"竹かご",    cost:60,  req:null,       desc:"キノコ採取を解放"},
  {id:"axe2",   name:"鋼の斧",    cost:280, req:"axe1",    desc:"木材さらに+3/回"},
  {id:"pickaxe",name:"つるはし",  cost:200, req:"axe1",    desc:"鉱石採掘を解放"},
  {id:"p2",     name:"ダイヤ斧",  cost:800, req:"pickaxe", desc:"鉱石+2/回"},
  {id:"sawmill",name:"製材所",    cost:600, req:null,       desc:"木材売値+2G"},
  {id:"tower1", name:"監視塔 Lv1",cost:300, req:"axe1",    desc:"自動で獣を狩る（4秒毎）"},
  {id:"tower2", name:"監視塔 Lv2",cost:600, req:"tower1",  desc:"射程・速度アップ（2.5秒毎）"},
  {id:"tower3", name:"監視塔 Lv3",cost:1500,req:"tower2",  desc:"最大射程・1.5秒毎"},
  {id:"goldMine",name:"金脈開発！",cost:5000,req:null,      desc:"全収入×2"},
];
const TOWER_CFG=[{range:130,interval:4000},{range:170,interval:2500},{range:220,interval:1500}];
const LOCATIONS=[
  {x:478,y:174,upgrades:["axe1","axe2"],   label:"鍛冶場", icon:"⚒️"},
  {x:342,y:420,upgrades:["basket"],          label:"採取小屋",icon:"🌿"},
  {x:558,y:370,upgrades:["pickaxe","p2"],   label:"採掘場", icon:"⛏️"},
  {x:450,y:420,upgrades:["sawmill"],         label:"製材所", icon:"🏭"},
  {x:640,y:370,upgrades:["goldMine"],        label:"金庫",  icon:"💰"},
];
const STARS=Array.from({length:55},(_,i)=>({x:(i*137.5+31)%W,y:(i*83.7+17)%(H*.42),r:.5+((i*31)%10)*.15,t:((i*53)%100)/100*Math.PI*2}));
const TREE_DATA=[
  {id:"t1",x:42,y:65,s:.78},{id:"t2",x:92,y:58,s:.85},{id:"t3",x:144,y:62,s:.9},
  {id:"t4",x:195,y:55,s:.82},{id:"t5",x:248,y:62,s:.88},{id:"t6",x:298,y:57,s:.8},
  {id:"t7",x:350,y:63,s:.84},{id:"t8",x:400,y:59,s:.75},{id:"t9",x:448,y:68,s:.72},
  {id:"t10",x:60,y:108,s:1.0},{id:"t11",x:115,y:102,s:1.05},{id:"t12",x:168,y:110,s:.95},
  {id:"t13",x:220,y:100,s:1.0},{id:"t14",x:275,y:108,s:1.02},{id:"t15",x:328,y:100,s:.92},
  {id:"t16",x:378,y:108,s:.85},{id:"t17",x:428,y:112,s:.8},
  {id:"t18",x:42,y:158,s:1.05},{id:"t19",x:95,y:150,s:.95},{id:"t20",x:148,y:160,s:1.0},
  {id:"t21",x:202,y:152,s:1.08},{id:"t22",x:255,y:162,s:.98},{id:"t23",x:308,y:155,s:.9},
  {id:"t24",x:360,y:162,s:.85},{id:"t25",x:408,y:158,s:.8},
  {id:"t26",x:58,y:208,s:.98},{id:"t27",x:112,y:200,s:1.0},{id:"t28",x:165,y:210,s:1.05},
  {id:"t29",x:220,y:202,s:.95},{id:"t30",x:275,y:212,s:1.0},{id:"t31",x:328,y:205,s:.9},
  {id:"t32",x:378,y:212,s:.82},
  {id:"t33",x:40,y:255,s:.92},{id:"t34",x:95,y:262,s:1.0},{id:"t35",x:148,y:255,s:1.05},
  {id:"t36",x:202,y:265,s:.95},{id:"t37",x:258,y:257,s:.98},{id:"t38",x:310,y:265,s:.85},
  {id:"t39",x:58,y:308,s:.95},{id:"t40",x:112,y:318,s:1.0},{id:"t41",x:168,y:308,s:1.05},
  {id:"t42",x:222,y:318,s:.92},{id:"t43",x:275,y:310,s:.85},
  {id:"t44",x:42,y:358,s:.88},{id:"t45",x:98,y:368,s:.95},{id:"t46",x:152,y:358,s:1.0},
  {id:"t47",x:208,y:368,s:.9},
  {id:"t48",x:62,y:395,s:.82},{id:"t49",x:118,y:405,s:.88},{id:"t50",x:172,y:398,s:.85},
  {id:"t51",x:228,y:408,s:.8},
];
const OTHER_NODES=[
  {id:"a1",type:"boar",x:470,y:230,yield:{meat:1,fur:1},ms:2500,rsMs:8000,wanders:true,req:"axe1"},
  {id:"a2",type:"deer",x:545,y:188,yield:{meat:1,fur:1},ms:2500,rsMs:8000,wanders:true,req:"axe1"},
  {id:"m1",type:"mushroom",icon:"🍄",x:355,y:292,yield:{mushroom:1},ms:900,rsMs:5000,req:"basket"},
  {id:"m2",type:"mushroom",icon:"🍄",x:295,y:332,yield:{mushroom:1},ms:900,rsMs:5000,req:"basket"},
  {id:"m3",type:"mushroom",icon:"🍄",x:415,y:308,yield:{mushroom:1},ms:900,rsMs:5000,req:"basket"},
  {id:"o1",type:"ore",icon:"🪨",x:582,y:345,yield:{ore:1},ms:3000,rsMs:12000,req:"pickaxe"},
  {id:"o2",type:"ore",icon:"🪨",x:638,y:262,yield:{ore:1},ms:3000,rsMs:12000,req:"pickaxe"},
];
const NODE_DEFS=[
  ...TREE_DATA.map(t=>({...t,type:"tree",yield:{wood:1},ms:1100,rsMs:900})),
  ...OTHER_NODES,
];

function dst(ax,ay,bx,by){return Math.hypot(ax-bx,ay-by);}
function spawnPart(g,nx,ny,col){g.particles.push({x:nx+(Math.random()-.5)*8,y:ny+(Math.random()-.5)*8,vx:(Math.random()-.5)*4,vy:-(1+Math.random()*3.5),life:.9,color:col,size:2+Math.random()*4,rot:Math.random()*Math.PI*2,rotV:(Math.random()-.5)*.4});}
function spawnParts(g,nx,ny,type){const p={tree:["#d4e8ff","#c8d8e8","#d4a16a"],animal:["#fca5a5","#fda4af"],mushroom:["#c4b5fd"],ore:["#93c5fd","#e5e7eb"]};(p[type]||p.ore).forEach(c=>{for(let i=0;i<4;i++)spawnPart(g,nx,ny,c);});}
function spawnFloat(g,nx,ny,text,color="#86efac"){g.floats.push({x:nx+(Math.random()-.5)*22,y:ny-28,vy:-1.2,text,color,life:1});}
function getActiveUpg(loc,bought){for(const id of loc.upgrades){const u=UPGRADES_DATA.find(x=>x.id===id);if(u&&!bought.has(id)){if(!u.req||bought.has(u.req))return u;return null;}}return null;}
function getTowerLevel(bought){return bought.has("tower3")?3:bought.has("tower2")?2:bought.has("tower1")?1:0;}

// ── 雪の松の木 ────────────────────────────────────────────────
function drawPine(ctx,x,y,s,state){
  const dep=state==="respawning";
  ctx.save();ctx.globalAlpha=.18;ctx.fillStyle="#000";
  ctx.beginPath();ctx.moveTo(x-3*s,y);ctx.lineTo(x+3*s,y);ctx.lineTo(x+24*s,y+9*s);ctx.lineTo(x-3*s+20*s,y+9*s);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.ellipse(x,y+3,14*s,5*s,0,0,Math.PI*2);ctx.fill();ctx.restore();
  if(dep){ctx.fillStyle="#3a2a18";ctx.beginPath();ctx.ellipse(x,y+1,9*s,5*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#c8e0f8";ctx.save();ctx.globalAlpha=.6;ctx.beginPath();ctx.ellipse(x,y-2,8*s,4*s,0,0,Math.PI*2);ctx.fill();ctx.restore();return;}
  ctx.fillStyle="#3d2007";ctx.fillRect(x-3.5*s,y-11,7*s,14);ctx.fillStyle="#5a3010";ctx.fillRect(x-1.5*s,y-9,3*s,12);
  ctx.fillStyle="#1a0c03";ctx.fillRect(x+2.8*s,y-11,3.5*s,14);
  const tiers=[{dy:0,w:20},{dy:-13,w:17},{dy:-25,w:14},{dy:-36,w:11},{dy:-46,w:8},{dy:-55,w:5}];
  for(let i=0;i<tiers.length;i++){const{dy,w}=tiers[i],ws=w*s,bh=(13-i*.4)*s,ty=y+dy*s;
    ctx.fillStyle="#020c06";ctx.beginPath();ctx.moveTo(x,ty-bh-s);ctx.lineTo(x-ws-2*s,ty+2*s);ctx.lineTo(x+ws+2*s,ty+2*s);ctx.closePath();ctx.fill();
    ctx.fillStyle=i===0?"#166534":i<3?"#1a5c28":"#134d1e";
    ctx.beginPath();ctx.moveTo(x,ty-bh);ctx.lineTo(x-ws,ty+s);ctx.lineTo(x+ws*.08,ty+s);ctx.closePath();ctx.fill();
    ctx.fillStyle=i===0?"#062a0e":i<3?"#081f0c":"#051808";
    ctx.beginPath();ctx.moveTo(x,ty-bh);ctx.lineTo(x+ws*.08,ty+s);ctx.lineTo(x+ws,ty+s);ctx.closePath();ctx.fill();
    ctx.save();ctx.globalAlpha=.88;ctx.fillStyle="#ddeeff";ctx.beginPath();ctx.ellipse(x-ws*.18,ty-bh+1,ws*.6,bh*.21,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.55;ctx.fillStyle="#c8e0f8";ctx.beginPath();ctx.ellipse(x-ws*.5,ty-bh*.55,ws*.15,bh*.13,-.3,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  ctx.fillStyle="#1a5c22";ctx.beginPath();ctx.moveTo(x,y-66*s);ctx.lineTo(x-3*s,y-57*s);ctx.lineTo(x+3*s,y-57*s);ctx.closePath();ctx.fill();
  ctx.save();ctx.globalAlpha=.82;ctx.fillStyle="#ddeeff";ctx.beginPath();ctx.ellipse(x-s,y-66*s,2.2*s,1.8*s,0,0,Math.PI*2);ctx.fill();ctx.restore();
}

// ── イノシシ（改良）──────────────────────────────────────────
function drawBoar(ctx,x,y,fl,moving){
  const t=Date.now(),ls=moving?Math.sin(t/110)*4:0,d=fl?-1:1;
  ctx.save();ctx.globalAlpha=.18;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(x,y+11,17,5,0,0,Math.PI*2);ctx.fill();ctx.restore();
  // 脚
  ctx.fillStyle="#2d1a0e";
  [[x-10,ls],[x-3,-ls],[x+3,ls*d],[x+9,-ls*d]].forEach(([lx,la])=>{
    ctx.beginPath();ctx.roundRect(lx,y+6,4,10+la*0.5,[2,2,3,3]);ctx.fill();
    ctx.fillStyle="#1a0c06";ctx.beginPath();ctx.roundRect(lx,y+16+la*.5,4,4,[1,1,2,2]);ctx.fill();
    ctx.fillStyle="#2d1a0e";
  });
  // 胴体
  const bG=ctx.createRadialGradient(x,y-3,2,x,y,20);bG.addColorStop(0,"#7a5040");bG.addColorStop(1,"#3a1e10");
  ctx.fillStyle=bG;ctx.beginPath();ctx.ellipse(x,y,19,13,0,0,Math.PI*2);ctx.fill();
  // 背中の剛毛
  ctx.save();ctx.globalAlpha=.5;ctx.strokeStyle="#1a0a04";ctx.lineWidth=1.5;
  for(let i=-12;i<=12;i+=4){ctx.beginPath();ctx.moveTo(x+i,y-11);ctx.lineTo(x+i+d*.5,y-15);ctx.stroke();}
  ctx.restore();
  // 首・頭
  const hx=x+d*21;ctx.fillStyle="#4a2a18";ctx.beginPath();ctx.moveTo(x+d*10,y-4);ctx.lineTo(hx,y-4);ctx.lineTo(hx,y+2);ctx.lineTo(x+d*10,y+4);ctx.closePath();ctx.fill();
  const hdG=ctx.createRadialGradient(hx,y-4,1,hx,y-2,10);hdG.addColorStop(0,"#7a5038");hdG.addColorStop(1,"#3a1e10");
  ctx.fillStyle=hdG;ctx.beginPath();ctx.ellipse(hx,y-2,10,9,0,0,Math.PI*2);ctx.fill();
  // 耳
  ctx.fillStyle="#4a2a18";ctx.beginPath();ctx.ellipse(hx-d*3,y-9,5,6,d*.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#7a4a30";ctx.save();ctx.globalAlpha=.5;ctx.beginPath();ctx.ellipse(hx-d*3,y-9,3,4,d*.3,0,Math.PI*2);ctx.fill();ctx.restore();
  // 鼻
  ctx.fillStyle="#8b5a3c";ctx.beginPath();ctx.ellipse(hx+d*9,y,7,5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#3a1e10";[[hx+d*11,y-1],[hx+d*7,y-1]].forEach(([nx,ny])=>{ctx.beginPath();ctx.ellipse(nx,ny,1.8,1.8,0,0,Math.PI*2);ctx.fill();});
  // キバ
  ctx.fillStyle="#f0e8d0";ctx.beginPath();ctx.moveTo(hx+d*11,y+2);ctx.lineTo(hx+d*17,y+6);ctx.lineTo(hx+d*16,y+9);ctx.closePath();ctx.fill();
  // 目
  ctx.fillStyle="#1c0e06";ctx.beginPath();ctx.arc(hx-d*1,y-5,3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.7)";ctx.beginPath();ctx.arc(hx-d*.5,y-6,1.2,0,Math.PI*2);ctx.fill();
  // しっぽ
  ctx.strokeStyle="#4a2a18";ctx.lineWidth=2.5;ctx.lineCap="round";const tx=x-d*18;
  ctx.beginPath();ctx.moveTo(tx,y-2);ctx.bezierCurveTo(tx-d*5,y-8,tx-d*4,y-1,tx-d*2,y+3);ctx.stroke();
}

// ── 鹿（改良）───────────────────────────────────────────────
function drawDeer(ctx,x,y,fl,moving){
  const t=Date.now(),ls=moving?Math.sin(t/130)*5:0,d=fl?-1:1;
  ctx.save();ctx.globalAlpha=.15;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(x,y+14,16,5,0,0,Math.PI*2);ctx.fill();ctx.restore();
  // 脚（細め、4本）
  ctx.fillStyle="#9a6044";
  [[x-11,ls],[x-3,-ls],[x+3,ls*d],[x+10,-ls*d]].forEach(([lx,la])=>{
    ctx.beginPath();ctx.roundRect(lx,y+8+Math.abs(la)*.2,3.5,14+la*.3,[2,2,3,3]);ctx.fill();
    ctx.fillStyle="#3d2010";ctx.beginPath();ctx.roundRect(lx,y+22+la*.3,3.5,4,[1,1,2,2]);ctx.fill();
    ctx.fillStyle="#9a6044";
  });
  // 胴体
  const bG=ctx.createRadialGradient(x+d*3,y-3,2,x,y,18);bG.addColorStop(0,"#c88055");bG.addColorStop(1,"#8b5a3c");
  ctx.fillStyle=bG;ctx.beginPath();ctx.ellipse(x,y,18,12,0,0,Math.PI*2);ctx.fill();
  // お腹（明るい）
  ctx.save();ctx.globalAlpha=.35;ctx.fillStyle="#daa068";ctx.beginPath();ctx.ellipse(x,y+4,10,6,0,0,Math.PI*2);ctx.fill();ctx.restore();
  // お尻の白
  ctx.save();ctx.globalAlpha=.65;ctx.fillStyle="#f5ead5";ctx.beginPath();ctx.ellipse(x-d*14,y+1,7,9,0,0,Math.PI*2);ctx.fill();ctx.restore();
  // しっぽ
  ctx.fillStyle="#f5ead5";ctx.beginPath();ctx.ellipse(x-d*16,y-3,4,5,0,0,Math.PI*2);ctx.fill();
  // 首
  const hx=x+d*17;
  ctx.fillStyle="#b07858";ctx.beginPath();ctx.moveTo(x+d*8,y-5);ctx.lineTo(hx,y-18);ctx.lineTo(hx+d*4,y-14);ctx.lineTo(x+d*10,y-1);ctx.closePath();ctx.fill();
  // 頭
  const hdG=ctx.createRadialGradient(hx+d*2,y-22,1,hx,y-21,9);hdG.addColorStop(0,"#d49460");hdG.addColorStop(1,"#9a6040");
  ctx.fillStyle=hdG;ctx.beginPath();ctx.ellipse(hx,y-20,10,7,d*.15,0,Math.PI*2);ctx.fill();
  // 耳（大きめ）
  ctx.fillStyle="#c87850";ctx.beginPath();ctx.ellipse(hx-d*4,y-27,6,8,d*.4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#f0c090";ctx.save();ctx.globalAlpha=.5;ctx.beginPath();ctx.ellipse(hx-d*4,y-27,4,6,d*.4,0,Math.PI*2);ctx.fill();ctx.restore();
  // 鼻・口
  ctx.fillStyle="#c08060";ctx.beginPath();ctx.ellipse(hx+d*8,y-19,5,4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#7a4030";ctx.beginPath();ctx.ellipse(hx+d*9,y-20,1.8,1.8,0,0,Math.PI*2);ctx.fill();
  // 目（大きめ・表情豊か）
  ctx.fillStyle="#1c1412";ctx.beginPath();ctx.arc(hx-d*1,y-22,3.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.75)";ctx.beginPath();ctx.arc(hx-d*.5,y-23,1.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#6b3010";ctx.beginPath();ctx.arc(hx-d*1,y-22,1.5,0,Math.PI*2);ctx.fill();
  // ツノ
  ctx.strokeStyle="#6b4020";ctx.lineWidth=2.2;ctx.lineCap="round";const ax=hx-d*3;
  ctx.beginPath();ctx.moveTo(ax,y-27);ctx.lineTo(ax+d*3,y-42);ctx.stroke();
  ctx.beginPath();ctx.moveTo(ax+d,y-33);ctx.lineTo(ax+d*8,y-38);ctx.stroke();
  ctx.beginPath();ctx.moveTo(ax+d*3,y-40);ctx.lineTo(ax-d*1,y-46);ctx.stroke();
  ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(ax+d*8,y-38);ctx.lineTo(ax+d*11,y-44);ctx.stroke();
}

// ── プレイヤー（極地探検家）──────────────────────────────────
function drawPlayer(ctx,px,py,fl,moving,inv){
  inv=inv||{};
  const wood=inv.wood||0,meat=inv.meat||0,fur=inv.fur||0,mush=inv.mushroom||0,ore=inv.ore||0;
  const t=Date.now(),bob=moving?Math.sin(t/110)*2.5:0,ls=moving?Math.sin(t/110)*7:0,b=bob,d=fl?-1:1;
  const bd=fl?1:-1,bx=px+bd*14;
  let stackY=py+4+b;
  ctx.save();ctx.globalAlpha=.25;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(px,py+15,13,5,0,0,Math.PI*2);ctx.fill();ctx.restore();
  // 背中の積み荷
  for(let i=0;i<Math.min(wood,5);i++){const lx=bx+bd*i*1.2,ly=stackY-i*5;ctx.fillStyle="#3d1a06";ctx.beginPath();ctx.ellipse(lx,ly,7,4.5,bd*.15,0,Math.PI*2);ctx.fill();ctx.fillStyle="#7c3a10";ctx.beginPath();ctx.ellipse(lx,ly,5.5,3.2,bd*.15,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#5c2a0a";ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(lx,ly,3.5,2.2,bd*.15,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#2d1006";ctx.beginPath();ctx.ellipse(lx,ly,.6,.4,0,0,Math.PI*2);ctx.fill();if(i===0)stackY=ly;}
  if(wood>0)stackY-=8;
  for(let i=0;i<Math.min(meat,4);i++){const mx=bx+bd*i*.8,my=stackY-i*4.5;ctx.fillStyle="#7f1d1d";ctx.beginPath();ctx.ellipse(mx,my,7,4,bd*.1,0,Math.PI*2);ctx.fill();ctx.fillStyle="#dc2626";ctx.beginPath();ctx.ellipse(mx-1,my-1,5,2.8,bd*.1,0,Math.PI*2);ctx.fill();if(i===0)stackY=my;}
  if(meat>0)stackY-=7;
  for(let i=0;i<Math.min(fur,3);i++){const fx=bx+bd*i*.8,fy=stackY-i*4;ctx.fillStyle="#78350f";ctx.beginPath();ctx.ellipse(fx,fy,8,4.5,bd*.2,0,Math.PI*2);ctx.fill();ctx.fillStyle="#92400e";ctx.beginPath();ctx.ellipse(fx,fy,6,3,bd*.2,0,Math.PI*2);ctx.fill();if(i===0)stackY=fy;}
  if(fur>0)stackY-=7;
  for(let i=0;i<Math.min(mush,3);i++){const ux=bx+bd*i*5,uy=stackY-i;ctx.fillStyle="#e8d5b7";ctx.fillRect(ux-2,uy,4,6);ctx.fillStyle="#7c3aed";ctx.beginPath();ctx.ellipse(ux,uy-2,7,5,0,0,Math.PI,Math.PI*2);ctx.fill();if(i===0)stackY=uy;}
  if(mush>0)stackY-=9;
  for(let i=0;i<Math.min(ore,3);i++){const ox=bx+bd*i*.8,oy=stackY-i*4.5;ctx.fillStyle="#374151";ctx.beginPath();ctx.moveTo(ox-6,oy+3);ctx.lineTo(ox-7,oy-1);ctx.lineTo(ox-2,oy-5);ctx.lineTo(ox+3,oy-5);ctx.lineTo(ox+6,oy-1);ctx.lineTo(ox+5,oy+3);ctx.closePath();ctx.fill();ctx.fillStyle="#6b7280";ctx.beginPath();ctx.moveTo(ox-2,oy-5);ctx.lineTo(ox+3,oy-5);ctx.lineTo(ox+2,oy-2);ctx.lineTo(ox-1,oy-2);ctx.closePath();ctx.fill();if(i===0)stackY=oy;}
  // ブーツ
  const bx1=fl?px-1:px-10,bx2=fl?px-10:px-1;
  ctx.fillStyle="#1c1917";ctx.beginPath();ctx.roundRect(bx1,py+9+b+ls,10,8,[2,2,4,4]);ctx.fill();ctx.beginPath();ctx.roundRect(bx2,py+9+b-ls,10,8,[2,2,4,4]);ctx.fill();
  ctx.fillStyle="#2d2a28";ctx.fillRect(bx1,py+9+b+ls,10,3);ctx.fillRect(bx2,py+9+b-ls,10,3);
  // パンツ
  ctx.fillStyle="#1e3a8a";ctx.fillRect(px-8,py+1+b,7,10);ctx.fillRect(px+1,py+1+b,7,10);
  // 極地用コート（白/グレー）
  const cG=ctx.createLinearGradient(px-12,0,px+12,0);cG.addColorStop(0,"#94a3b8");cG.addColorStop(.5,"#cbd5e1");cG.addColorStop(1,"#94a3b8");
  ctx.fillStyle=cG;ctx.beginPath();ctx.roundRect(px-11,py-9+b,22,13,[5,5,2,2]);ctx.fill();
  // ファーのライン（白い縁取り）
  ctx.strokeStyle="#e2e8f0";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px-11,py-9+b);ctx.lineTo(px-11,py+3+b);ctx.stroke();ctx.beginPath();ctx.moveTo(px+11,py-9+b);ctx.lineTo(px+11,py+3+b);ctx.stroke();
  // フロントジッパー
  ctx.strokeStyle="#64748b";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,py-9+b);ctx.lineTo(px,py+4+b);ctx.stroke();
  // ベルト
  ctx.fillStyle="#475569";ctx.fillRect(px-11,py+1+b,22,3);ctx.fillStyle="#94a3b8";ctx.beginPath();ctx.roundRect(px-3,py+.5+b,6,4,1);ctx.fill();
  // 腕（手袋あり）
  const as=moving?Math.sin(t/110)*9:0;
  ctx.fillStyle="#94a3b8";ctx.beginPath();ctx.roundRect(px+d*8,py-7+b+as*d,6,11,3);ctx.fill();
  ctx.fillStyle="#cbd5e1";ctx.beginPath();ctx.roundRect(px-d*14,py-7+b-as*d,6,11,3);ctx.fill();
  // 手袋
  ctx.fillStyle="#1e3a8a";ctx.beginPath();ctx.roundRect(px+d*8,py+2+b+as*d,6,4,2);ctx.fill();
  ctx.fillStyle="#1e3a8a";ctx.beginPath();ctx.roundRect(px-d*14,py+2+b-as*d,6,4,2);ctx.fill();
  // スカーフ（赤）
  ctx.fillStyle="#dc2626";ctx.beginPath();ctx.roundRect(px-9,py-10+b,18,4,[2]);ctx.fill();
  ctx.save();ctx.globalAlpha=.6;ctx.fillStyle="#ef4444";ctx.fillRect(fl?px-9:px+6,py-9+b,3,8);ctx.restore();
  // 首
  ctx.fillStyle="#f5d0a0";ctx.beginPath();ctx.ellipse(px,py-12+b,4,3.5,0,0,Math.PI*2);ctx.fill();
  // 顔
  const fG=ctx.createRadialGradient(px-2,py-19+b,1,px,py-18+b,9);fG.addColorStop(0,"#fef3c7");fG.addColorStop(1,"#fde68a");
  ctx.fillStyle=fG;ctx.beginPath();ctx.ellipse(px,py-18+b,9,10,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#f5c67a";ctx.beginPath();ctx.ellipse(fl?px-9:px+9,py-18+b,3,4,0,0,Math.PI*2);ctx.fill();
  // 毛皮トリムの帽子
  ctx.fillStyle="#334155";ctx.beginPath();ctx.roundRect(px-11,py-26+b,22,6,[3,3,1,1]);ctx.fill();
  ctx.fillStyle="#e2e8f0";ctx.beginPath();ctx.roundRect(px-12,py-28+b,24,4,[2]);ctx.fill(); // ファートリム
  const hbG=ctx.createLinearGradient(px-9,py-40+b,px+9,py-26+b);hbG.addColorStop(0,"#475569");hbG.addColorStop(1,"#334155");
  ctx.fillStyle=hbG;ctx.beginPath();ctx.roundRect(px-10,py-42+b,20,17,[6,6,2,2]);ctx.fill();
  // ゴーグル
  ctx.fillStyle="#1e293b";ctx.beginPath();ctx.roundRect(px-8,py-22+b,7,5,[3]);ctx.fill();ctx.beginPath();ctx.roundRect(px+1,py-22+b,7,5,[3]);ctx.fill();
  ctx.strokeStyle="#94a3b8";ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(px-1,py-20+b);ctx.lineTo(px+1,py-20+b);ctx.stroke();
  ctx.save();ctx.globalAlpha=.4;ctx.fillStyle="#7dd3fc";ctx.beginPath();ctx.roundRect(px-7,py-21+b,5,3,[2]);ctx.fill();ctx.beginPath();ctx.roundRect(px+2,py-21+b,5,3,[2]);ctx.fill();ctx.restore();
  // 耳当て
  ctx.fillStyle="#e2e8f0";ctx.beginPath();ctx.ellipse(fl?px-10:px+10,py-28+b,4,5,0,0,Math.PI*2);ctx.fill();
  // 吐く息（寒い！）
  const bra=fl?Math.PI*.1:Math.PI*.9;ctx.save();ctx.globalAlpha=.22+Math.sin(t/600)*.08;ctx.fillStyle="#bfdbfe";
  for(let i=0;i<3;i++){const ba=bra+i*.25-.25,br=8+i*5;ctx.beginPath();ctx.arc(px+Math.cos(ba)*br,py-15+b+Math.sin(ba)*br,1.5-i*.4,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

// ── 斧 ──────────────────────────────────────────────────────
function drawAxe(ctx,x,y,angle,active){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  if(active){ctx.save();ctx.globalAlpha=.5;ctx.shadowColor="#fbbf24";ctx.shadowBlur=18;ctx.fillStyle="rgba(251,191,36,.2)";ctx.beginPath();ctx.arc(12,-6,13,0,Math.PI*2);ctx.fill();ctx.restore();}
  ctx.strokeStyle="#92400e";ctx.lineWidth=4.5;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-3,3);ctx.lineTo(15,-7);ctx.stroke();
  const bg=ctx.createLinearGradient(12,-15,24,2);bg.addColorStop(0,"#e2e8f0");bg.addColorStop(.5,"#94a3b8");bg.addColorStop(1,"#64748b");
  ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(15,-7);ctx.bezierCurveTo(20,-18,29,-13,24,-2);ctx.bezierCurveTo(20,6,16,3,15,-7);ctx.fill();
  ctx.fillStyle="#f1f5f9";ctx.beginPath();ctx.moveTo(22,-14);ctx.bezierCurveTo(28,-9,26,-2,23,-1);ctx.bezierCurveTo(22,-3,22,-9,22,-14);ctx.fill();
  ctx.restore();
}

// ── 監視塔 ───────────────────────────────────────────────────
function drawTower(ctx,x,y,level){
  if(level===0){
    ctx.save();ctx.globalAlpha=.4;ctx.strokeStyle="#fbbf24";ctx.lineWidth=1.5;ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.roundRect(x-18,y-58,36,62,3);ctx.stroke();ctx.setLineDash([]);
    ctx.font="10px sans-serif";ctx.fillStyle="#fbbf24";ctx.textAlign="center";ctx.fillText("建設可",x,y+10);
    ctx.restore();return;
  }
  const t=Date.now();
  ctx.save();ctx.globalAlpha=.22;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(x,y+2,20,7,0,0,Math.PI*2);ctx.fill();ctx.restore();
  // 石造りの基台
  ctx.fillStyle="#374151";ctx.beginPath();ctx.roundRect(x-18,y-10,36,14,[2]);ctx.fill();
  ctx.fillStyle="#4b5563";ctx.beginPath();ctx.roundRect(x-15,y-10,32,3,[1]);ctx.fill();
  // タワー本体（石積み）
  const tG=ctx.createLinearGradient(x-12,0,x+12,0);tG.addColorStop(0,"#374151");tG.addColorStop(.5,"#4b5563");tG.addColorStop(1,"#374151");
  ctx.fillStyle=tG;ctx.beginPath();ctx.moveTo(x-12,y-10);ctx.lineTo(x-8,y-55);ctx.lineTo(x+8,y-55);ctx.lineTo(x+12,y-10);ctx.closePath();ctx.fill();
  // 横の石目
  ctx.strokeStyle="rgba(0,0,0,.2)";ctx.lineWidth=.7;
  for(let iy=y-15;iy>y-55;iy-=8){const w=12+(8-12)*(iy-(y-10))/(y-55-(y-10));ctx.beginPath();ctx.moveTo(x-w,iy);ctx.lineTo(x+w,iy);ctx.stroke();}
  // 胸壁
  ctx.fillStyle="#374151";
  [-8,0,8].forEach(bx=>{ctx.beginPath();ctx.roundRect(x+bx-3,y-63,6,10,[1]);ctx.fill();});
  // 窓
  if(level>=2){ctx.fillStyle="#1e293b";ctx.beginPath();ctx.roundRect(x-4,y-38,8,10,[2]);ctx.fill();ctx.save();ctx.globalAlpha=.4;ctx.fillStyle="#fbbf24";ctx.beginPath();ctx.roundRect(x-3,y-37,6,8,[2]);ctx.fill();ctx.restore();}
  // 頂上のライト
  const lp=(Math.sin(t/800)+1)/2;
  ctx.save();ctx.shadowColor="#fbbf24";ctx.shadowBlur=20+lp*10;
  ctx.fillStyle=`rgba(255,235,80,${.7+lp*.3})`;ctx.beginPath();ctx.arc(x,y-68,5+lp*1.5,0,Math.PI*2);ctx.fill();ctx.restore();
  // 回転サーチライト
  if(level>=1){
    const ba=t/1800*Math.PI*2;
    const bl=TOWER_CFG[level-1].range;
    ctx.save();ctx.globalAlpha=.1+lp*.06;
    const lG=ctx.createLinearGradient(x,y-68,x+Math.cos(ba)*bl,y-68+Math.sin(ba)*bl);
    lG.addColorStop(0,"#fbbf24");lG.addColorStop(1,"rgba(251,191,36,0)");
    ctx.strokeStyle="#fbbf24";ctx.lineWidth=18;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(x,y-68);ctx.lineTo(x+Math.cos(ba)*bl,y-68+Math.sin(ba)*bl);ctx.stroke();
    ctx.restore();
  }
  ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillStyle="#fbbf24";ctx.fillText(`Lv${level}`,x,y-76);
}

// ── 販売カウンター ───────────────────────────────────────────
function drawSellStall(ctx,st,bought,hasRes,inRange){
  const{x,y,label,icon,col,req}=st,unlocked=!req||bought.has(req);
  if(!unlocked){ctx.save();ctx.globalAlpha=.3;}
  const W2=32,H2=38,D=10;
  // 右側面（3D）
  ctx.fillStyle="#1a0e06";ctx.beginPath();ctx.moveTo(x+W2,y-H2+15);ctx.lineTo(x+W2+D,y-H2+15-D*.5);ctx.lineTo(x+W2+D,y+15-D*.5);ctx.lineTo(x+W2,y+15);ctx.closePath();ctx.fill();
  // 天面
  ctx.fillStyle=col+"aa";ctx.beginPath();ctx.moveTo(x-W2,y-H2+15);ctx.lineTo(x+W2,y-H2+15);ctx.lineTo(x+W2+D,y-H2+15-D*.5);ctx.lineTo(x-W2+D,y-H2+15-D*.5);ctx.closePath();ctx.fill();
  // 天面の雪
  ctx.save();ctx.globalAlpha=.7;ctx.fillStyle="#ddeeff";ctx.beginPath();ctx.ellipse(x+D*.5,y-H2+14,25,3,0,0,Math.PI*2);ctx.fill();ctx.restore();
  // 正面
  ctx.fillStyle="#2a1a0e";ctx.beginPath();ctx.roundRect(x-W2,y-H2+15,W2*2,H2,[2,2,0,0]);ctx.fill();
  // カラー幕
  ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x-W2-3,y-H2+3,W2*2+6,14,[3,3,0,0]);ctx.fill();
  ctx.save();ctx.globalAlpha=.2;ctx.fillStyle="#000";for(let i=-26;i<30;i+=11){ctx.beginPath();ctx.moveTo(x+i,y-H2+3);ctx.lineTo(x+i+5,y-H2+3);ctx.lineTo(x+i+7,y-H2+17);ctx.lineTo(x+i+2,y-H2+17);ctx.closePath();ctx.fill();}ctx.restore();
  // カウンター天板
  ctx.fillStyle="#a16207";ctx.beginPath();ctx.roundRect(x-W2,y+10,W2*2,8,[1,1,0,0]);ctx.fill();ctx.fillStyle="#ca8a04";ctx.beginPath();ctx.roundRect(x-W2,y+7,W2*2,5,[1]);ctx.fill();
  ctx.font="18px serif";ctx.textAlign="center";ctx.textBaseline="middle";
  if(unlocked)ctx.fillText(icon,x,y-H2+22);else{ctx.save();ctx.globalAlpha=.5;ctx.fillText("🔒",x,y-H2+22);ctx.restore();}
  ctx.font="7px sans-serif";ctx.fillStyle="#fef3c7";ctx.textAlign="center";ctx.fillText(label,x,y+3);
  if(unlocked)drawVendorSmall(ctx,x,y-H2+8,col);
  if(!unlocked){ctx.restore();return;}
  if(inRange&&hasRes){const p=(Math.sin(Date.now()/300)+1)/2;ctx.save();ctx.globalAlpha=.22+p*.22;ctx.strokeStyle="#fbbf24";ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x-W2-3,y-H2+3,(W2+3)*2,H2+10,3);ctx.stroke();ctx.restore();}
}
function drawVendorSmall(ctx,cx,cy,col){
  const bob=Math.sin(Date.now()/900)*1.2;
  ctx.save();ctx.globalAlpha=.82;
  ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(cx-4,cy-1+bob,8,8,[2,2,1,1]);ctx.fill();
  ctx.fillStyle="#fde68a";ctx.beginPath();ctx.arc(cx,cy-5+bob,4.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#78350f";ctx.beginPath();ctx.arc(cx,cy-7.5+bob,3.5,Math.PI,0);ctx.fill();
  ctx.fillStyle="#1c1917";ctx.beginPath();ctx.arc(cx-1.5,cy-5.5+bob,.8,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+1.5,cy-5.5+bob,.8,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// ── 並んでる客NPC ────────────────────────────────────────────
function drawQueueCustomer(ctx,cx,cy,col,moving){
  const t=Date.now(),ls=moving?Math.sin(t/120)*3:0,bob=moving?Math.sin(t/120)*1.2:0;
  ctx.save();ctx.globalAlpha=.15;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(cx,cy+10,5,2,0,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.fillStyle="#1c1917";ctx.beginPath();ctx.roundRect(cx-4,cy+4+bob,4,7+ls,[2,2,2,2]);ctx.fill();ctx.beginPath();ctx.roundRect(cx+0,cy+4+bob,4,7-ls,[2,2,2,2]);ctx.fill();
  ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(cx-5,cy-3+bob,10,9,[2,2,1,1]);ctx.fill();
  ctx.fillStyle="#fde68a";ctx.beginPath();ctx.arc(cx,cy-7+bob,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#78350f";ctx.beginPath();ctx.arc(cx,cy-10+bob,4,Math.PI,0);ctx.fill();
  ctx.fillStyle="#1c1917";ctx.beginPath();ctx.arc(cx-1.5,cy-7.5+bob,.7,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+1.5,cy-7.5+bob,.7,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// ── 強化拠点 ─────────────────────────────────────────────────
function drawLocation(ctx,loc,bought){
  const{x,y,icon,label}=loc,au=getActiveUpg(loc,bought),done=loc.upgrades.every(id=>bought.has(id)),t=Date.now();
  ctx.fillStyle=done?"#1a3a10":"#1a1408";ctx.beginPath();ctx.roundRect(x-20,y-4,40,18,3);ctx.fill();ctx.fillStyle=done?"#2a5a18":"#2a2010";ctx.beginPath();ctx.roundRect(x-20,y-8,40,6,2);ctx.fill();
  ctx.fillStyle=done?"#183510":"#2a1808";ctx.beginPath();ctx.roundRect(x-16,y-28,32,22,2);ctx.fill();ctx.fillStyle=done?"#102808":"#221006";ctx.beginPath();ctx.moveTo(x,y-44);ctx.lineTo(x-20,y-26);ctx.lineTo(x+20,y-26);ctx.closePath();ctx.fill();
  ctx.save();ctx.globalAlpha=.7;ctx.fillStyle="#ddeeff";ctx.beginPath();ctx.ellipse(x,y-42,15,3,0,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.font="13px serif";ctx.textAlign="center";ctx.textBaseline="middle";
  if(done){ctx.globalAlpha=.8;ctx.fillText("✅",x,y-34);ctx.globalAlpha=1;}
  else if(au){const p=(Math.sin(t/600)+1)/2;ctx.save();ctx.globalAlpha=.15+p*.1;ctx.fillStyle="#fbbf24";ctx.beginPath();ctx.arc(x,y-34,13,0,Math.PI*2);ctx.fill();ctx.restore();ctx.fillText(icon,x,y-34);}
  else{ctx.globalAlpha=.25;ctx.fillText(icon,x,y-34);ctx.globalAlpha=1;}
  ctx.font="7px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=done?"#4ade80":au?"#fbbf24":"#444";ctx.fillText(done?`✓${label}`:au?`${au.cost}G`:"🔒",x,y+8);
}

// ── App ──────────────────────────────────────────────────────
export default function App(){
  const canvasRef=useRef(null),gRef=useRef(null),keysRef=useRef({});
  const [hud,setHud]=useState({money:10,inv:{wood:0,meat:0,fur:0,mushroom:0,ore:0},bought:new Set(),towerLv:0,logs:["❄️ 雪山へようこそ！木を切って売り場へ運ぼう！"]});

  useEffect(()=>{
    const custCols=["#3b82f6","#ef4444","#9333ea","#16a34a","#78716c"];
    gRef.current={
      px:500,py:260,fl:false,moving:false,axeAngle:0,
      destX:null,destY:null,destMarker:null,
      money:10,inv:{wood:0,meat:0,fur:0,mushroom:0,ore:0},bought:new Set(),
      logs:["❄️ 雪山へようこそ！木を切って売り場へ運ぼう！"],
      activeNodes:[],nearLoc:null,
      nodes:NODE_DEFS.map(d=>({...d,cx:d.x,cy:d.y,wx:d.x+(Math.random()-.5)*180,wy:d.y+(Math.random()-.5)*130,wt:Math.random()*3000,state:"available",prog:0,rsTimer:0,hitTimer:0,workerId:null})),
      sellStations:SELL_STATIONS.map(s=>({...s,customers:[]})),
      custSpawnTimer:2000,
      custCols,
      tower:{level:0,fireTimer:0,projectile:null},
      workers:[],nextWorkerId:0,
      particles:[],floats:[],
      snowflakes:Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:.3+Math.random()*.65,size:.7+Math.random()*1.8,alpha:.3+Math.random()*.45})),
      shake:0,shakeX:0,shakeY:0,
    };
  },[]);

  useEffect(()=>{
    const kd=e=>{keysRef.current[e.key]=true;["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)&&e.preventDefault();};
    const ku=e=>{keysRef.current[e.key]=false;};
    window.addEventListener("keydown",kd);window.addEventListener("keyup",ku);
    return()=>{window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);};
  },[]);

  const handlePointerDown=useCallback(e=>{
    e.preventDefault();
    const g=gRef.current;if(!g)return;
    const rect=e.currentTarget.getBoundingClientRect();
    const tx=(e.clientX-rect.left)*(W/rect.width),ty=(e.clientY-rect.top)*(H/rect.height);
    g.destX=tx;g.destY=ty;g.destMarker={x:tx,y:ty,life:1};
    // Eキー相当（強化拠点に近い場合）
    for(const loc of LOCATIONS){
      if(dst(g.px,g.py,loc.x,loc.y)<REACH+10){
        const upg=getActiveUpg(loc,g.bought);
        if(upg&&g.money>=upg.cost){g.money-=upg.cost;g.bought.add(upg.id);g.tower.level=getTowerLevel(g.bought);g.logs=[`✨ ${upg.name} 完成！`,...g.logs].slice(0,14);}
        return;
      }
    }
    // 監視塔タップで強化
    if(dst(tx,ty,TOWER_POS.x,TOWER_POS.y)<40){
      const towerUpgs=["tower1","tower2","tower3"];
      for(const id of towerUpgs){
        const u=UPGRADES_DATA.find(x=>x.id===id);
        if(!g.bought.has(id)&&(!u.req||g.bought.has(u.req))&&g.money>=u.cost){
          g.money-=u.cost;g.bought.add(id);g.tower.level=getTowerLevel(g.bought);
          g.logs=[`🗼 ${u.name} 完成！`,...g.logs].slice(0,14);return;
        }
      }
    }
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");
    let last=performance.now(),animId,hudT=0;

    function update(dt){
      const g=gRef.current;if(!g)return;
      const k=keysRef.current;
      let kdx=(k["ArrowLeft"]||k["a"]||k["A"]?-1:0)+(k["ArrowRight"]||k["d"]||k["D"]?1:0);
      let kdy=(k["ArrowUp"]  ||k["w"]||k["W"]?-1:0)+(k["ArrowDown"] ||k["s"]||k["S"]?1:0);
      if(kdx!==0||kdy!==0){if(kdx!==0&&kdy!==0){kdx*=.707;kdy*=.707;}g.px=Math.max(14,Math.min(W-14,g.px+kdx*SPEED*(dt/16)));g.py=Math.max(14,Math.min(H-80,g.py+kdy*SPEED*(dt/16)));g.moving=true;if(kdx!==0)g.fl=kdx<0;g.destX=null;}
      else if(g.destX!==null){const ddx=g.destX-g.px,ddy=g.destY-g.py,dd=Math.hypot(ddx,ddy);if(dd>6){g.px+=ddx/dd*SPEED*(dt/16);g.py+=ddy/dd*SPEED*(dt/16);g.py=Math.min(g.py,H-80);g.moving=true;if(ddx!==0)g.fl=ddx<0;}else{g.moving=false;g.destX=null;}}
      else g.moving=false;

      g.axeAngle+=dt*(g.activeNodes.length>0?.013:.007);

      // 動物徘徊
      for(const n of g.nodes){
        if(!n.wanders)continue;n.wt-=dt;
        if(n.wt<=0||dst(n.cx,n.cy,n.wx,n.wy)<5){n.wx=400+Math.random()*200;n.wy=100+Math.random()*(H-250);n.wt=2000+Math.random()*4000;}
        if(n.state==="available"){const tdx=n.wx-n.cx,tdy=n.wy-n.cy,td2=Math.hypot(tdx,tdy);if(td2>3){const ws=.42*(dt/16);n.cx+=tdx/td2*ws;n.cy+=tdy/td2*ws;}n.cx=Math.max(400,Math.min(W-40,n.cx));n.cy=Math.max(60,Math.min(H-120,n.cy));}
      }
      for(const n of g.nodes)if(n.state==="respawning"){n.rsTimer-=dt;if(n.rsTimer<=0){n.state="available";n.prog=0;n.workerId=null;}}

      // 採取
      const inRange=[];
      for(const n of g.nodes){if(n.state!=="available")continue;if(n.req&&!g.bought.has(n.req))continue;if(n.workerId!==null)continue;if(dst(g.px,g.py,n.cx,n.cy)<REACH)inRange.push(n);}
      g.activeNodes=inRange;
      const emj={wood:"🪵",meat:"🥩",fur:"🦊",mushroom:"🍄",ore:"💎"};
      const fc={wood:"#86efac",meat:"#fca5a5",fur:"#fca5a5",mushroom:"#c4b5fd",ore:"#93c5fd"};
      const cc={tree:["#d4e8ff","#c8d8e8","#8b6c48"],animal:["#fca5a5"],mushroom:["#c4b5fd"],ore:["#93c5fd"]};
      for(const n of inRange){
        n.prog=Math.min(1,n.prog+dt/n.ms);n.hitTimer-=dt;
        if(n.hitTimer<=0){n.hitTimer=320;(cc[n.type]||cc.ore).forEach(c=>spawnPart(g,n.cx,n.cy,c));}
        if(n.prog>=1){
          for(const[res,amt]of Object.entries(n.yield)){let a=amt;if(res==="wood")a+=(g.bought.has("axe1")?2:0)+(g.bought.has("axe2")?3:0);if(res==="ore")a+=(g.bought.has("p2")?2:0);if(res==="mushroom")a+=(g.bought.has("basket")?1:0);g.inv[res]=(g.inv[res]||0)+a;spawnFloat(g,n.cx,n.cy-10,`+${a}${emj[res]}`,fc[res]);}
          spawnParts(g,n.cx,n.cy,n.type);g.shake=4;n.state="respawning";n.rsTimer=n.rsMs;n.prog=0;
        }
      }
      for(const n of g.nodes)if(!inRange.includes(n)&&n.prog>0&&n.state==="available"&&!n.workerId)n.prog=Math.max(0,n.prog-dt/280);

      // 販売（プレイヤー）
      for(const st of g.sellStations){
        st.cd=Math.max(0,st.cd-dt);if(!(!st.req||g.bought.has(st.req)))continue;
        if(g.inv[st.res]<=0||st.cd>0)continue;
        if(dst(g.px,g.py,st.x,st.y)<REACH+15){
          const price=PRICES[st.res]+(st.res==="wood"&&g.bought.has("sawmill")?2:0);
          const earn=Math.floor(g.inv[st.res]*price*(g.bought.has("goldMine")?2:1));
          g.money+=earn;spawnFloat(g,st.x,st.y-55,`+${earn}G`,"#fbbf24");
          g.logs=[`💰 ${st.label}で${earn}G売却！`,...g.logs].slice(0,14);g.inv[st.res]=0;st.cd=1000;
          // 列の先頭の客が買う演出（先頭を少し動かす）
          if(st.customers.length>0){const c=st.customers[0];c.celebrating=true;c.celebTimer=800;}
        }
      }

      // 客の生成・管理
      g.custSpawnTimer-=dt;
      if(g.custSpawnTimer<=0){
        g.custSpawnTimer=2500+Math.random()*2000;
        // 各ステーションに最大3人まで
        for(const st of g.sellStations){
          if(!(!st.req||g.bought.has(st.req)))continue;
          if(st.customers.length<3){
            const slot=st.customers.length;
            st.customers.push({x:st.x,y:-30,tx:st.x+(slot-1)*14,ty:st.y-34-slot*28,state:"walking",col:g.custCols[Math.floor(Math.random()*5)],celebrating:false,celebTimer:0,fl:true,moving:true});
            break; // 1回に1人だけ追加
          }
        }
      }
      for(const st of g.sellStations){
        for(let i=st.customers.length-1;i>=0;i--){
          const c=st.customers[i];
          if(c.celebrating){c.celebTimer-=dt;if(c.celebTimer<=0){c.state="leaving";c.tx=W+50;c.ty=c.y;c.celebrating=false;}}
          if(c.state==="leaving"){const ddx=c.tx-c.x,ddy=c.ty-c.y,d=Math.hypot(ddx,ddy);if(d>5){c.x+=ddx/d*1.5*(dt/16);c.moving=true;}else{st.customers.splice(i,1);continue;}}
          else{const ddx=c.tx-c.x,ddy=c.ty-c.y,d=Math.hypot(ddx,ddy);if(d>4){c.x+=ddx/d*1.2*(dt/16);c.y+=ddy/d*1.2*(dt/16);c.moving=true;c.fl=ddx<0;}else{c.moving=false;c.state="waiting";}}
          // 前につめる
          c.tx=st.x+(i-1)*14;c.ty=st.y-34-i*28;
        }
      }

      // 監視塔
      if(g.tower.level>0){
        const cfg=TOWER_CFG[g.tower.level-1];
        g.tower.fireTimer-=dt;
        if(g.tower.fireTimer<=0){
          let target=null,nearDist=cfg.range;
          for(const n of g.nodes){if(n.type!=="boar"&&n.type!=="deer")continue;if(n.state!=="available")continue;if(!g.bought.has("axe1"))continue;const d=dst(TOWER_POS.x,TOWER_POS.y,n.cx,n.cy);if(d<nearDist){target=n;nearDist=d;}}
          if(target){g.tower.projectile={x:TOWER_POS.x,y:TOWER_POS.y-68,tx:target.cx,ty:target.cy,prog:0,tid:target.id};g.tower.fireTimer=cfg.interval;}
          else g.tower.fireTimer=800;
        }
        if(g.tower.projectile){
          const p=g.tower.projectile;p.prog+=dt*.0025;
          if(p.prog>=1){
            const tgt=g.nodes.find(n=>n.id===p.tid);
            if(tgt&&tgt.state==="available"){g.inv.meat=(g.inv.meat||0)+1;g.inv.fur=(g.inv.fur||0)+1;spawnParts(g,tgt.cx,tgt.cy,"animal");spawnFloat(g,tgt.cx,tgt.cy-10,"+1🥩+1🦊","#fca5a5");tgt.state="respawning";tgt.rsTimer=tgt.rsMs;tgt.prog=0;g.logs=[`🗼 監視塔が獲物を仕留めた！`,...g.logs].slice(0,14);}
            g.tower.projectile=null;
          }
        }
      }
      g.nearLoc=null;for(const loc of LOCATIONS){if(dst(g.px,g.py,loc.x,loc.y)<REACH+10){g.nearLoc=loc;break;}}
      for(let i=g.particles.length-1;i>=0;i--){const p=g.particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.2;p.life-=.022;p.rot+=p.rotV;if(p.life<=0)g.particles.splice(i,1);}
      for(let i=g.floats.length-1;i>=0;i--){const f=g.floats[i];f.y+=f.vy;f.life-=.016;if(f.life<=0)g.floats.splice(i,1);}
      for(const s of g.snowflakes){s.x+=s.vx+Math.sin(Date.now()/2200+s.y*.01)*.2;s.y+=s.vy;if(s.y>H+5){s.y=-5;s.x=Math.random()*W;}if(s.x<-5)s.x=W+5;if(s.x>W+5)s.x=-5;}
      if(g.destMarker)g.destMarker.life-=dt/800;
      if(g.shake>.1){g.shakeX=(Math.random()-.5)*g.shake;g.shakeY=(Math.random()-.5)*g.shake;g.shake*=.7;}else{g.shake=0;g.shakeX=0;g.shakeY=0;}
    }

    function render(){
      const g=gRef.current;if(!g)return;
      ctx.save();if(g.shake>.1)ctx.translate(g.shakeX,g.shakeY);

      // ── 夜空（雪山） ────────────────────────────────────────
      const sky=ctx.createLinearGradient(0,0,0,H*.5);sky.addColorStop(0,"#030810");sky.addColorStop(.5,"#0a1628");sky.addColorStop(1,"#0f1f3d");
      ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
      // 星
      ctx.save();ctx.fillStyle="#fff";
      for(const s of STARS){ctx.globalAlpha=.3+Math.sin(Date.now()/1000+s.t)*.25;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();}
      ctx.restore();
      // 山のシルエット（後ろ・薄い）
      ctx.fillStyle="#0a1a2e";ctx.beginPath();ctx.moveTo(0,H*.52);ctx.lineTo(W*.1,H*.2);ctx.lineTo(W*.22,H*.35);ctx.lineTo(W*.32,H*.16);ctx.lineTo(W*.44,H*.30);ctx.lineTo(W*.54,H*.12);ctx.lineTo(W*.65,H*.27);ctx.lineTo(W*.76,H*.10);ctx.lineTo(W*.88,H*.22);ctx.lineTo(W,H*.18);ctx.lineTo(W,H*.52);ctx.closePath();ctx.fill();
      // 山の雪冠
      ctx.fillStyle="#c8d8e8";ctx.save();ctx.globalAlpha=.4;
      [[W*.32,H*.16],[W*.54,H*.12],[W*.76,H*.10]].forEach(([mx,my])=>{ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx-W*.04,my+H*.05);ctx.lineTo(mx+W*.04,my+H*.05);ctx.closePath();ctx.fill();});
      ctx.restore();
      // 手前の山（暗め）
      ctx.fillStyle="#071220";ctx.beginPath();ctx.moveTo(0,H*.48);ctx.lineTo(W*.06,H*.32);ctx.lineTo(W*.14,H*.42);ctx.lineTo(W*.24,H*.28);ctx.lineTo(W*.35,H*.40);ctx.lineTo(W*.46,H*.30);ctx.lineTo(W*.58,H*.42);ctx.lineTo(W*.68,H*.25);ctx.lineTo(W*.80,H*.38);ctx.lineTo(W*.90,H*.28);ctx.lineTo(W,H*.35);ctx.lineTo(W,H*.48);ctx.closePath();ctx.fill();
      // 雪地面
      const groundG=ctx.createLinearGradient(0,H*.42,0,H*.72);groundG.addColorStop(0,"rgba(180,200,225,0)");groundG.addColorStop(1,"rgba(200,218,238,.18)");
      ctx.fillStyle=groundG;ctx.fillRect(0,0,W,H);
      // 地面（雪のパッチ）
      ctx.save();ctx.fillStyle="#c8d8e8";[[90,H*.88,48,8,.18],[210,H*.91,60,10,.2],[360,H*.89,50,9,.16],[510,H*.90,44,8,.17],[640,H*.90,38,7,.14]].forEach(([px,py,rx,ry,a])=>{ctx.globalAlpha=a;ctx.beginPath();ctx.ellipse(px,py,rx,ry,0,0,Math.PI*2);ctx.fill();});ctx.restore();
      // 下の販売エリア（地面）
      const marketG=ctx.createLinearGradient(0,H-90,0,H);marketG.addColorStop(0,"rgba(10,20,40,0)");marketG.addColorStop(1,"rgba(5,15,30,.85)");
      ctx.fillStyle=marketG;ctx.fillRect(0,H-90,W,90);
      // 仕切りライン
      ctx.strokeStyle="rgba(147,197,253,.15)";ctx.lineWidth=1;ctx.setLineDash([4,8]);
      ctx.beginPath();ctx.moveTo(0,H-88);ctx.lineTo(W,H-88);ctx.stroke();ctx.setLineDash([]);

      // 遠近グリッド
      ctx.save();const vx=W*.52,vy=H*-.05;ctx.lineWidth=.8;
      for(let gx=-60;gx<=W+60;gx+=55){ctx.strokeStyle="#6a8fa8";ctx.globalAlpha=.055;ctx.beginPath();ctx.moveTo(vx+(gx-vx)*.04,vy+(H-vy)*.04);ctx.lineTo(gx,H+8);ctx.stroke();}
      for(let gt=.08;gt<=1.0;gt+=.09){const gy=vy+(H-vy)*gt,hw=Math.min(W*.5,W*.5*gt*1.4);ctx.strokeStyle="#7ab4cc";ctx.globalAlpha=.04+gt*.025;ctx.beginPath();ctx.moveTo(vx-hw,gy);ctx.lineTo(vx+hw,gy);ctx.stroke();}ctx.restore();

      // 木の影（方向性）
      ctx.save();ctx.globalAlpha=.12;ctx.fillStyle="#000";
      for(const n of g.nodes)if(n.type==="tree"&&n.state!=="respawning"){const sl=24*n.s,sd=10*n.s;ctx.beginPath();ctx.moveTo(n.cx-3*n.s,n.cy);ctx.lineTo(n.cx+3*n.s,n.cy);ctx.lineTo(n.cx+3*n.s+sl,n.cy+sd);ctx.lineTo(n.cx-3*n.s+sl,n.cy+sd);ctx.closePath();ctx.fill();}
      ctx.restore();
      ctx.save();ctx.globalAlpha=.18;ctx.fillStyle="#000";for(const n of g.nodes)if(n.type==="tree"){ctx.beginPath();ctx.ellipse(n.cx,n.cy+14,15*n.s,5*n.s,0,0,Math.PI*2);ctx.fill();}ctx.restore();

      // 雪降り
      ctx.save();ctx.fillStyle="#e8f4ff";for(const s of g.snowflakes){ctx.globalAlpha=s.alpha;ctx.beginPath();ctx.arc(s.x,s.y,s.size,0,Math.PI*2);ctx.fill();}ctx.restore();

      // 深度ソート描画
      const drawables=[];
      // 強化拠点
      for(const loc of LOCATIONS)drawables.push({y:loc.y,cx:loc.x,draw:()=>{ctx.textAlign="center";ctx.textBaseline="middle";drawLocation(ctx,loc,g.bought);}});
      // 近接ヒント（強化拠点）
      if(g.nearLoc){const upg=getActiveUpg(g.nearLoc,g.bought);if(upg)drawables.push({y:g.nearLoc.y-65,cx:g.nearLoc.x,draw:()=>{ctx.fillStyle="rgba(0,0,0,.8)";ctx.beginPath();ctx.roundRect(g.nearLoc.x-72,g.nearLoc.y-72,144,20,8);ctx.fill();ctx.fillStyle="#fbbf24";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText(`タップ/E: ${upg.name} ${upg.cost}G`,g.nearLoc.x,g.nearLoc.y-62);}});}
      // 監視塔
      const tvLv=g.tower.level;
      drawables.push({y:TOWER_POS.y+5,cx:TOWER_POS.x,draw:()=>{ctx.textAlign="center";ctx.textBaseline="middle";drawTower(ctx,TOWER_POS.x,TOWER_POS.y,tvLv);
        // 塔へのヒント（未建設or未解放）
        if(tvLv<3){const nextId=["tower1","tower2","tower3"][tvLv];const nu=UPGRADES_DATA.find(u=>u.id===nextId);if(nu&&(!nu.req||g.bought.has(nu.req))&&dst(g.px,g.py,TOWER_POS.x,TOWER_POS.y)<60){ctx.fillStyle="rgba(0,0,0,.8)";ctx.beginPath();ctx.roundRect(TOWER_POS.x-72,TOWER_POS.y-90,144,20,8);ctx.fill();ctx.fillStyle="#fbbf24";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText(`タップ: ${nu.name} ${nu.cost}G`,TOWER_POS.x,TOWER_POS.y-80);}}
      }});
      // 木
      for(const n of g.nodes)if(n.type==="tree"){drawables.push({y:n.cy,cx:n.cx,draw:()=>{const act=g.activeNodes.includes(n);if(act&&n.prog>0){ctx.save();ctx.globalAlpha=n.prog*.08;ctx.fillStyle="#4ade80";ctx.beginPath();ctx.ellipse(n.cx,n.cy-25*n.s,22*n.s,35*n.s,0,0,Math.PI*2);ctx.fill();ctx.restore();}drawPine(ctx,n.cx,n.cy,n.s,n.state);if(n.state==="respawning"){const r=1-n.rsTimer/n.rsMs;ctx.fillStyle="rgba(0,0,0,.5)";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+18,36,5,3);ctx.fill();ctx.fillStyle="#c8e0f0";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+18,36*r,5,3);ctx.fill();}if(n.prog>0){const pw=34*n.s;ctx.fillStyle="rgba(0,0,0,.5)";ctx.beginPath();ctx.roundRect(n.cx-pw/2,n.cy+16,pw,4,2);ctx.fill();ctx.fillStyle="#86efac";ctx.beginPath();ctx.roundRect(n.cx-pw/2,n.cy+16,pw*n.prog,4,2);ctx.fill();}}});}
      // 獣
      for(const n of g.nodes)if(n.type==="boar"||n.type==="deer"){drawables.push({y:n.cy,cx:n.cx,draw:()=>{const rq=!n.req||g.bought.has(n.req);ctx.save();ctx.globalAlpha=n.state==="respawning"?.22:rq?1:.35;if(n.type==="boar")drawBoar(ctx,n.cx,n.cy,n.cx<n.wx,n.moving||false);else drawDeer(ctx,n.cx,n.cy,n.cx<n.wx,n.moving||false);ctx.restore();if(!rq){ctx.font="12px serif";ctx.textAlign="center";ctx.fillText("🔒",n.cx+18,n.cy-18);}if(n.state==="respawning"){const r=1-n.rsTimer/n.rsMs;ctx.fillStyle="rgba(0,0,0,.5)";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+20,36,5,3);ctx.fill();ctx.fillStyle="#fca5a5";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+20,36*r,5,3);ctx.fill();}if(n.prog>0){ctx.fillStyle="rgba(0,0,0,.5)";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+18,36,4,2);ctx.fill();ctx.fillStyle="#fca5a5";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+18,36*n.prog,4,2);ctx.fill();}}});}
      // キノコ・鉱石
      for(const n of g.nodes)if(n.type==="mushroom"||n.type==="ore"){drawables.push({y:n.cy,cx:n.cx,draw:()=>{const rq=!n.req||g.bought.has(n.req);ctx.save();ctx.globalAlpha=n.state==="respawning"?.22:rq?1:.35;ctx.font="24px serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.icon,n.cx,n.cy);ctx.restore();if(!rq){ctx.font="12px serif";ctx.textAlign="center";ctx.fillText("🔒",n.cx+13,n.cy-14);}if(n.prog>0||n.state==="respawning"){const r=n.state==="respawning"?1-n.rsTimer/n.rsMs:n.prog;ctx.fillStyle="rgba(0,0,0,.5)";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+13,36,4,2);ctx.fill();ctx.fillStyle=n.type==="mushroom"?"#c4b5fd":"#93c5fd";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+13,36*r,4,2);ctx.fill();}}});}
      // プレイヤー
      drawables.push({y:g.py,cx:g.px,draw:()=>{drawPlayer(ctx,g.px,g.py,g.fl,g.moving,g.inv);const ax=g.px+Math.cos(g.axeAngle)*30,ay=g.py+Math.sin(g.axeAngle)*22;if(g.activeNodes.length>0){ctx.save();ctx.globalAlpha=.45;ctx.fillStyle="#fbbf24";ctx.shadowColor="#fbbf24";ctx.shadowBlur=14;ctx.beginPath();ctx.arc(ax,ay,5,0,Math.PI*2);ctx.fill();ctx.restore();}drawAxe(ctx,ax,ay,g.axeAngle+Math.PI*.75,g.activeNodes.length>0);}});

      // 深度スケール
      drawables.sort((a,b)=>a.y-b.y);ctx.textAlign="center";ctx.textBaseline="middle";
      for(const d of drawables){const t=Math.max(0,Math.min(1,d.y/H)),scl=0.8+0.4*t,cx=d.cx!==undefined?d.cx:W*.5;ctx.save();ctx.translate(cx,d.y);ctx.scale(scl,scl);ctx.translate(-cx,-d.y);d.draw();ctx.restore();}

      // 砲弾（監視塔）
      if(g.tower.projectile){const p=g.tower.projectile,px2=p.x+(p.tx-p.x)*p.prog,py2=p.y+(p.ty-p.y)*p.prog;ctx.save();ctx.globalAlpha=1-p.prog*.4;ctx.fillStyle="#fbbf24";ctx.shadowColor="#fbbf24";ctx.shadowBlur=10;ctx.beginPath();ctx.arc(px2,py2,4,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.3;ctx.beginPath();ctx.arc(px2-(p.tx-p.x)*.04,py2-(p.ty-p.y)*.04,3,0,Math.PI*2);ctx.fill();ctx.restore();}

      // ── 下の販売カウンター列 ─────────────────────────────────
      ctx.textAlign="center";ctx.textBaseline="middle";
      for(const st of g.sellStations){
        const hasRes=g.inv[st.res]>0,inR=dst(g.px,g.py,st.x,st.y)<REACH+15;
        drawSellStall(ctx,st,g.bought,hasRes,inR);
        // 客のキュー
        for(const c of st.customers){drawQueueCustomer(ctx,c.x,c.y,c.col,c.moving);if(c.celebrating){ctx.font="12px serif";ctx.textAlign="center";ctx.fillText("⭐",c.x,c.y-20);}}
      }

      // タップマーカー
      if(g.destMarker&&g.destMarker.life>0){const{x,y,life}=g.destMarker,sz=9;ctx.save();ctx.globalAlpha=Math.max(0,life)*.8;ctx.strokeStyle="#93c5fd";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-sz,y);ctx.lineTo(x+sz,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-sz);ctx.lineTo(x,y+sz);ctx.stroke();ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);ctx.stroke();ctx.restore();}

      // パーティクル
      for(const p of g.particles){ctx.save();ctx.globalAlpha=p.life;ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=3;ctx.beginPath();ctx.ellipse(0,0,p.size,p.size*.6,0,0,Math.PI*2);ctx.fill();ctx.restore();}
      // フロートテキスト
      for(const f of g.floats){ctx.save();ctx.globalAlpha=Math.min(1,f.life*1.5);ctx.font="bold 14px sans-serif";ctx.textAlign="center";ctx.strokeStyle="rgba(0,0,0,.8)";ctx.lineWidth=3;ctx.strokeText(f.text,f.x,f.y);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);ctx.restore();}
      // ビネット
      const vig=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.85);vig.addColorStop(0,"rgba(0,0,0,0)");vig.addColorStop(1,"rgba(0,0,0,.78)");ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
      // 同時伐採数
      const cc2=g.activeNodes.filter(n=>n.type==="tree").length;if(cc2>1){ctx.fillStyle="rgba(0,0,0,.55)";ctx.beginPath();ctx.roundRect(8,8,80,20,8);ctx.fill();ctx.fillStyle="#86efac";ctx.font="bold 11px sans-serif";ctx.textAlign="left";ctx.fillText(`🪓×${cc2} 同時`,14,20);}
      ctx.restore();
    }

    function loop(t){const dt=Math.min(t-last,50);last=t;update(dt);render();hudT+=dt;if(hudT>120){hudT=0;const g=gRef.current;if(g)setHud({money:g.money,inv:{...g.inv},bought:new Set(g.bought),towerLv:g.tower.level,logs:[...g.logs]});}animId=requestAnimationFrame(loop);}
    animId=requestAnimationFrame(loop);return()=>cancelAnimationFrame(animId);
  },[]);

  const{money,inv,bought,towerLv,logs}=hud;
  return(
    <div style={{fontFamily:"system-ui,sans-serif",background:"#030810",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:4,userSelect:"none"}}>
      <style>{`@keyframes gp{0%,100%{text-shadow:0 0 8px rgba(147,197,253,.4)}50%{text-shadow:0 0 22px rgba(147,197,253,.9)}} button{transition:transform .08s} button:active{transform:scale(.92)!important}`}</style>
      <div style={{position:"relative",width:"100%",maxWidth:W}}>
        <canvas ref={canvasRef} width={W} height={H}
          style={{display:"block",width:"100%",height:"auto",borderRadius:10,border:"1px solid rgba(147,197,253,.15)",boxShadow:"0 0 40px rgba(0,0,0,.9)",touchAction:"none",outline:"none"}}
          tabIndex={0}
          autoFocus
          onPointerDown={e=>{handlePointerDown(e);e.currentTarget.focus();}}
          onKeyDown={e=>{keysRef.current[e.key]=true;["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key)&&e.preventDefault();}}
          onKeyUp={e=>{keysRef.current[e.key]=false;}}
        />
        {/* HUDオーバーレイ */}
        <div style={{position:"absolute",top:8,left:8,background:"rgba(3,8,16,.82)",borderRadius:10,padding:"6px 10px",border:"1px solid rgba(147,197,253,.2)"}}>
          <div style={{fontSize:18,fontWeight:900,color:"#fbbf24",animation:"gp 2s infinite"}}>💰 {money.toLocaleString()}G</div>
          {bought.has("goldMine")&&<div style={{fontSize:9,color:"#fbbf24"}}>👑 ×2</div>}
        </div>
        <div style={{position:"absolute",top:8,right:8,background:"rgba(3,8,16,.82)",borderRadius:10,padding:"6px 10px",border:"1px solid rgba(147,197,253,.2)"}}>
          {[["wood","🪵",inv.wood||0],["meat","🥩",inv.meat||0],["fur","🦊",inv.fur||0],["mushroom","🍄",inv.mushroom||0],["ore","💎",inv.ore||0]].map(([k,em,v])=>v>0&&(
            <div key={k} style={{fontSize:11,color:"#86efac",fontWeight:700}}>{em}{v}</div>
          ))}
        </div>
        <div style={{position:"absolute",bottom:100,left:8,background:"rgba(3,8,16,.75)",borderRadius:8,padding:"4px 8px",maxWidth:180,border:"1px solid rgba(147,197,253,.12)"}}>
          {logs.slice(0,4).map((l,i)=>(<div key={i} style={{fontSize:9,color:`rgba(180,210,235,${Math.max(.2,1-i*.25)})`,lineHeight:1.5}}>{l}</div>))}
        </div>
        <div style={{position:"absolute",bottom:100,right:8,background:"rgba(3,8,16,.75)",borderRadius:8,padding:"4px 8px",border:"1px solid rgba(147,197,253,.12)"}}>
          <div style={{fontSize:9,color:"#93c5fd",lineHeight:1.8}}><div>🖱️ タップ/クリックで移動</div><div>WASD/矢印キーも可</div><div>施設タップでE</div>{towerLv>0&&<div style={{color:"#fbbf24"}}>🗼 塔Lv{towerLv} 稼働中</div>}</div>
        </div>
      </div>
    </div>
  );
}
