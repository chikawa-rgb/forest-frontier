import { useState, useEffect, useRef, useCallback } from "react";

const W=700,H=460,SPEED=2.5,REACH=52;
const PRICES={wood:2,meat:5,fur:8,mushroom:3,ore:12};
const CAMP={x:645,y:382};

const SELL_STATIONS=[
  {id:"s_wood",    res:"wood",    x:596,y:82, label:"材木屋",icon:"🪵",col:"#92400e",req:null,      cd:0},
  {id:"s_meat",    res:"meat",    x:652,y:145,label:"精肉店",icon:"🥩",col:"#b91c1c",req:"axe1",   cd:0},
  {id:"s_fur",     res:"fur",     x:596,y:208,label:"毛皮商",icon:"🦊",col:"#7c3aed",req:"axe1",   cd:0},
  {id:"s_mushroom",res:"mushroom",x:652,y:271,label:"薬草屋",icon:"🍄",col:"#15803d",req:"basket", cd:0},
  {id:"s_ore",     res:"ore",     x:596,y:334,label:"鉱石屋",icon:"💎",col:"#334155",req:"pickaxe",cd:0},
];
const UPGRADES_DATA=[
  {id:"axe1",   name:"鉄の斧",   cost:40,  req:null,      desc:"木材+2/回・狩り解放"},
  {id:"basket", name:"竹かご",   cost:60,  req:null,      desc:"キノコ採取を解放"},
  {id:"axe2",   name:"鋼の斧",   cost:280, req:"axe1",   desc:"木材さらに+3/回"},
  {id:"pickaxe",name:"つるはし", cost:200, req:"axe1",   desc:"鉱石採掘を解放"},
  {id:"p2",     name:"ダイヤ斧", cost:800, req:"pickaxe",desc:"鉱石+2/回"},
  {id:"sawmill",name:"製材所",   cost:600, req:null,      desc:"木材売値+2G"},
  {id:"goldMine",name:"金脈開発！",cost:5000,req:null,   desc:"全収入×2"},
];
const LOCATIONS=[
  {x:492,y:176,upgrades:["axe1","axe2"],  label:"鍛冶場", icon:"⚒️"},
  {x:348,y:436,upgrades:["basket"],        label:"採取小屋",icon:"🌿"},
  {x:572,y:415,upgrades:["pickaxe","p2"], label:"採掘場", icon:"⛏️"},
  {x:462,y:438,upgrades:["sawmill"],       label:"製材所", icon:"🏭"},
];
// 凍えた生存者 → 救出すると仲間になる！
const SURVIVOR_DEFS=[
  {id:"sv1",x:108,y:188,type:"woodcutter",label:"木こり",  req:null},
  {id:"sv2",x:255,y:315,type:"woodcutter",label:"木こり",  req:null},
  {id:"sv3",x:385,y:232,type:"hunter",    label:"猟師",    req:"axe1"},
  {id:"sv4",x:188,y:392,type:"gatherer",  label:"採取師",  req:"basket"},
  {id:"sv5",x:495,y:388,type:"miner",     label:"採掘師",  req:"pickaxe"},
];
const W_TYPES={
  woodcutter:{res:"wood",   nodes:["tree"],           col:"#78350f"},
  hunter:    {res:"meat",   nodes:["boar","deer"],    col:"#7f1d1d"},
  gatherer:  {res:"mushroom",nodes:["mushroom"],      col:"#14532d"},
  miner:     {res:"ore",    nodes:["ore"],             col:"#334155"},
};
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
  {id:"t48",x:62,y:408,s:.82},{id:"t49",x:118,y:418,s:.88},{id:"t50",x:172,y:410,s:.85},
  {id:"t51",x:228,y:420,s:.8},
];
const OTHER_NODES=[
  {id:"a1",type:"boar",x:470,y:230,yield:{meat:1,fur:1},ms:2500,rsMs:8000,wanders:true,req:"axe1"},
  {id:"a2",type:"deer",x:555,y:185,yield:{meat:1,fur:1},ms:2500,rsMs:8000,wanders:true,req:"axe1"},
  {id:"m1",type:"mushroom",icon:"🍄",x:355,y:295,yield:{mushroom:1},ms:900,rsMs:5000,req:"basket"},
  {id:"m2",type:"mushroom",icon:"🍄",x:295,y:340,yield:{mushroom:1},ms:900,rsMs:5000,req:"basket"},
  {id:"m3",type:"mushroom",icon:"🍄",x:418,y:310,yield:{mushroom:1},ms:900,rsMs:5000,req:"basket"},
  {id:"m4",type:"mushroom",icon:"🍄",x:340,y:380,yield:{mushroom:1},ms:900,rsMs:5000,req:"basket"},
  {id:"o1",type:"ore",icon:"🪨",x:580,y:352,yield:{ore:1},ms:3000,rsMs:12000,req:"pickaxe"},
  {id:"o2",type:"ore",icon:"🪨",x:638,y:260,yield:{ore:1},ms:3000,rsMs:12000,req:"pickaxe"},
];
const NODE_DEFS=[
  ...TREE_DATA.map(t=>({...t,type:"tree",yield:{wood:1},ms:1100,rsMs:900})),
  ...OTHER_NODES,
];

function dst(ax,ay,bx,by){return Math.hypot(ax-bx,ay-by);}
function spawnPart(g,nx,ny,col){g.particles.push({x:nx+(Math.random()-.5)*8,y:ny+(Math.random()-.5)*8,vx:(Math.random()-.5)*4,vy:-(1+Math.random()*3.5),life:.9,color:col,size:2+Math.random()*4,rot:Math.random()*Math.PI*2,rotV:(Math.random()-.5)*.4});}
function spawnParts(g,nx,ny,type){const p={tree:["#d4e8ff","#c8d8e8","#d4a16a","#a3845a"],animal:["#fca5a5","#fda4af"],mushroom:["#c4b5fd","#a78bfa"],ore:["#93c5fd","#e5e7eb"],rescue:["#fbbf24","#f97316","#86efac","#fef9c3"]};(p[type]||p.ore).forEach(c=>{for(let i=0;i<4;i++)spawnPart(g,nx,ny,c);});}
function spawnFloat(g,nx,ny,text,color="#86efac"){g.floats.push({x:nx+(Math.random()-.5)*22,y:ny-28,vy:-1.2,text,color,life:1});}
function getActiveUpg(loc,bought){for(const id of loc.upgrades){const u=UPGRADES_DATA.find(x=>x.id===id);if(!bought.has(id)){if(!u.req||bought.has(u.req))return u;return null;}}return null;}

// ── 雪をかぶった松の木 ─────────────────────────────────────
function drawPine(ctx,x,y,s,state){
  const dep=state==="respawning";
  // 3Dシャドウ（方向性あり）
  ctx.save();ctx.globalAlpha=.18;ctx.fillStyle="#000";
  ctx.beginPath();ctx.moveTo(x-3*s,y);ctx.lineTo(x+3*s,y);ctx.lineTo(x+26*s,y+10*s);ctx.lineTo(x-3*s+22*s,y+10*s);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.ellipse(x+16*s,y-8*s,10*s,4*s,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
  // 地面影
  ctx.save();ctx.globalAlpha=.22;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(x,y+3,14*s,5*s,0,0,Math.PI*2);ctx.fill();ctx.restore();
  if(dep){
    ctx.fillStyle="#3a2a18";ctx.beginPath();ctx.ellipse(x,y+1,9*s,5*s,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#ddeeff";ctx.save();ctx.globalAlpha=.6;ctx.beginPath();ctx.ellipse(x,y-2,8*s,4*s,0,0,Math.PI*2);ctx.fill();ctx.restore();return;
  }
  // 幹（3Dシリンダー）
  const trG=ctx.createLinearGradient(x-4*s,0,x+4*s,0);trG.addColorStop(0,"#3d2007");trG.addColorStop(.4,"#6b3515");trG.addColorStop(1,"#1a0c03");
  ctx.fillStyle=trG;ctx.fillRect(x-3.5*s,y-11,7*s,14);
  ctx.fillStyle="#1a0c03";ctx.fillRect(x+2.8*s,y-11,3.5*s,14); // 右面（暗い）
  ctx.fillStyle="#5a3010";ctx.beginPath();ctx.ellipse(x,y-11,4*s,2.2*s,0,0,Math.PI*2);ctx.fill(); // 天面

  const tiers=[{dy:0,w:20},{dy:-13,w:17},{dy:-25,w:14},{dy:-36,w:11},{dy:-46,w:8},{dy:-55,w:5}];
  for(let i=0;i<tiers.length;i++){
    const{dy,w}=tiers[i],ws=w*s,bh=(13-i*.4)*s,ty=y+dy*s;
    // 影ベース
    ctx.fillStyle="#020c06";ctx.beginPath();ctx.moveTo(x,ty-bh-s);ctx.lineTo(x-ws-2*s,ty+2*s);ctx.lineTo(x+ws+2*s,ty+2*s);ctx.closePath();ctx.fill();
    // 左面（ライト側）
    const litC=i===0?"#166534":i<3?"#1a5c28":"#134d1e";
    ctx.fillStyle=litC;ctx.beginPath();ctx.moveTo(x,ty-bh);ctx.lineTo(x-ws,ty+s);ctx.lineTo(x+ws*.08,ty+s);ctx.closePath();ctx.fill();
    // 右面（シャドウ側）— 3Dの核心
    const shdC=i===0?"#062a0e":i<3?"#081f0c":"#051808";
    ctx.fillStyle=shdC;ctx.beginPath();ctx.moveTo(x,ty-bh);ctx.lineTo(x+ws*.08,ty+s);ctx.lineTo(x+ws,ty+s);ctx.closePath();ctx.fill();
    // 右側面の奥行き（アイソメトリック面）
    ctx.save();ctx.globalAlpha=.55;ctx.fillStyle="#010806";
    const dz=6*s;
    ctx.beginPath();ctx.moveTo(x+ws,ty+s);ctx.lineTo(x+ws+dz,ty+s+dz*.5);ctx.lineTo(x+dz*.3,ty-bh+dz*.5);ctx.lineTo(x,ty-bh);ctx.closePath();ctx.fill();
    ctx.restore();
    // 雪（左に寄せてリアル感）
    ctx.save();ctx.globalAlpha=.9;ctx.fillStyle="#ddeeff";
    ctx.beginPath();ctx.ellipse(x-ws*.18,ty-bh+1,ws*.6,bh*.21,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.55;ctx.fillStyle="#c8e0f8";
    ctx.beginPath();ctx.ellipse(x-ws*.5,ty-bh*.55,ws*.15,bh*.13,-.3,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  // 頂点
  ctx.fillStyle="#1a5c22";ctx.beginPath();ctx.moveTo(x,y-66*s);ctx.lineTo(x-3*s,y-57*s);ctx.lineTo(x+3*s,y-57*s);ctx.closePath();ctx.fill();
  ctx.save();ctx.globalAlpha=.82;ctx.fillStyle="#ddeeff";ctx.beginPath();ctx.ellipse(x-s,y-66*s,2.2*s,1.8*s,0,0,Math.PI*2);ctx.fill();ctx.restore();
}

// ── イノシシ・鹿（変更なし）──────────────────────────────────
function drawBoar(ctx,x,y,fl,moving){
  const t=Date.now(),ls=moving?Math.sin(t/110)*4:0,d=fl?-1:1;
  ctx.save();ctx.globalAlpha=.2;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(x,y+12,18,5,0,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.fillStyle="#3d2012";[[x-12,ls],[x-4,-ls],[x+2,ls*d],[x+8,-ls*d]].forEach(([lx,la])=>{ctx.beginPath();ctx.roundRect(lx,y+8,5,11+la,[2,2,3,3]);ctx.fill();});
  ctx.fillStyle="#1c0e06";[[x-12,ls],[x-4,-ls],[x+2,ls*d],[x+8,-ls*d]].forEach(([lx,la])=>{ctx.beginPath();ctx.roundRect(lx,y+19+la,5,4,[1,1,2,2]);ctx.fill();});
  const bG=ctx.createRadialGradient(x+d*3,y-4,3,x,y,18);bG.addColorStop(0,"#6b4530");bG.addColorStop(1,"#3a1e10");ctx.fillStyle=bG;ctx.beginPath();ctx.ellipse(x,y,18,12,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.globalAlpha=.4;ctx.fillStyle="#1c0e06";ctx.beginPath();ctx.ellipse(x,y-9,14,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
  const hx=x+d*20;ctx.fillStyle="#4a2a18";ctx.beginPath();ctx.moveTo(x+d*10,y-4);ctx.lineTo(hx,y-5);ctx.lineTo(hx,y+1);ctx.lineTo(x+d*10,y+4);ctx.closePath();ctx.fill();
  const hdG=ctx.createRadialGradient(hx-d*2,y-5,2,hx,y-3,9);hdG.addColorStop(0,"#7a5038");hdG.addColorStop(1,"#3a1e10");ctx.fillStyle=hdG;ctx.beginPath();ctx.ellipse(hx,y-3,9,8,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#4a2a18";ctx.beginPath();ctx.ellipse(hx-d*3,y-9,5,6,d*.3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#8b5a3c";ctx.beginPath();ctx.ellipse(hx+d*8,y-1,6,5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#3a1e10";[[hx+d*10,y-2],[hx+d*6,y-2]].forEach(([nx,ny])=>{ctx.beginPath();ctx.ellipse(nx,ny,1.5,1.5,0,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle="#f5f0e0";ctx.beginPath();ctx.moveTo(hx+d*10,y+1);ctx.lineTo(hx+d*15,y+5);ctx.lineTo(hx+d*14,y+7);ctx.closePath();ctx.fill();
  ctx.fillStyle="#1c0e06";ctx.beginPath();ctx.arc(hx-d*1,y-6,2.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.65)";ctx.beginPath();ctx.arc(hx-.5,y-7,1,0,Math.PI*2);ctx.fill();
}
function drawDeer(ctx,x,y,fl,moving){
  const t=Date.now(),ls=moving?Math.sin(t/130)*5:0,d=fl?-1:1;
  ctx.save();ctx.globalAlpha=.18;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(x,y+15,17,5,0,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.fillStyle="#8b5a3c";[[x-11,ls],[x-3,-ls],[x+3,ls*d],[x+10,-ls*d]].forEach(([lx,la])=>{ctx.beginPath();ctx.roundRect(lx,y+8+Math.abs(la)*.2,4,14+la*.3,[2,2,3,3]);ctx.fill();});
  ctx.fillStyle="#3d2010";[[x-11,ls],[x-3,-ls],[x+3,ls*d],[x+10,-ls*d]].forEach(([lx,la])=>{ctx.beginPath();ctx.roundRect(lx,y+22+la*.3,4,4,[1,1,2,2]);ctx.fill();});
  const bG=ctx.createRadialGradient(x+d*2,y-3,2,x,y,17);bG.addColorStop(0,"#c4845a");bG.addColorStop(1,"#8b5a3c");ctx.fillStyle=bG;ctx.beginPath();ctx.ellipse(x,y,17,11,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.globalAlpha=.35;ctx.fillStyle="#d4a470";ctx.beginPath();ctx.ellipse(x,y+4,10,6,0,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.save();ctx.globalAlpha=.65;ctx.fillStyle="#f5ead5";ctx.beginPath();ctx.ellipse(x-d*14,y+1,6,8,0,0,Math.PI*2);ctx.fill();ctx.restore();
  const hx=x+d*16;ctx.fillStyle="#b07050";ctx.beginPath();ctx.moveTo(x+d*8,y-5);ctx.lineTo(hx,y-18);ctx.lineTo(hx+d*4,y-14);ctx.lineTo(x+d*10,y-1);ctx.closePath();ctx.fill();
  const hdG=ctx.createRadialGradient(hx+d*2,y-22,1,hx,y-21,8);hdG.addColorStop(0,"#d49460");hdG.addColorStop(1,"#9a6040");ctx.fillStyle=hdG;ctx.beginPath();ctx.ellipse(hx,y-20,9,7,d*.15,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#c47850";ctx.beginPath();ctx.ellipse(hx-d*4,y-26,5,7,d*.4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#1c1412";ctx.beginPath();ctx.arc(hx-d*1,y-22,3,0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(255,255,255,.7)";ctx.beginPath();ctx.arc(hx-d*.5,y-23,1.2,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#6b4020";ctx.lineWidth=2;ctx.lineCap="round";const ax=hx-d*3;
  ctx.beginPath();ctx.moveTo(ax,y-27);ctx.lineTo(ax+d*2,y-40);ctx.stroke();
  ctx.beginPath();ctx.moveTo(ax+d,y-32);ctx.lineTo(ax+d*7,y-37);ctx.stroke();
  ctx.beginPath();ctx.moveTo(ax+d*2,y-38);ctx.lineTo(ax-d*2,y-44);ctx.stroke();
  ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax+d*7,y-37);ctx.lineTo(ax+d*10,y-43);ctx.stroke();
}

// ── 斧 ───────────────────────────────────────────────────────
function drawAxe(ctx,x,y,angle,active){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  if(active){ctx.save();ctx.globalAlpha=.5;ctx.shadowColor="#fbbf24";ctx.shadowBlur=18;ctx.fillStyle="rgba(251,191,36,.2)";ctx.beginPath();ctx.arc(12,-6,13,0,Math.PI*2);ctx.fill();ctx.restore();}
  ctx.strokeStyle="#92400e";ctx.lineWidth=4.5;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-3,3);ctx.lineTo(15,-7);ctx.stroke();
  ctx.strokeStyle="#78350f";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-3,3);ctx.lineTo(15,-7);ctx.stroke();
  const bg=ctx.createLinearGradient(12,-15,24,2);bg.addColorStop(0,"#e2e8f0");bg.addColorStop(.5,"#94a3b8");bg.addColorStop(1,"#64748b");
  ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(15,-7);ctx.bezierCurveTo(20,-18,29,-13,24,-2);ctx.bezierCurveTo(20,6,16,3,15,-7);ctx.fill();
  ctx.fillStyle="#f1f5f9";ctx.beginPath();ctx.moveTo(22,-14);ctx.bezierCurveTo(28,-9,26,-2,23,-1);ctx.bezierCurveTo(22,-3,22,-9,22,-14);ctx.fill();
  ctx.restore();
}

// ── プレイヤー ────────────────────────────────────────────────
function drawPlayer(ctx,px,py,fl,moving,inv){
  inv=inv||{};
  const wood=inv.wood||0,meat=inv.meat||0,fur=inv.fur||0,mush=inv.mushroom||0,ore=inv.ore||0;
  const t=Date.now(),bob=moving?Math.sin(t/110)*2.5:0,ls=moving?Math.sin(t/110)*7:0,b=bob,d=fl?-1:1;
  const bd=fl?1:-1; // 背中方向（逆）
  const bx=px+bd*14; // 背中のX基点

  // 影
  ctx.save();ctx.globalAlpha=.28;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(px,py+15,13,5,0,0,Math.PI*2);ctx.fill();ctx.restore();

  // ── 背中に積まれたアイテム（後ろに描いてキャラが前に来る）─
  let stackY=py+4+b; // 積み上げ底辺
  // 木材：横向き丸太（断面が見える）
  for(let i=0;i<Math.min(wood,5);i++){
    const lx=bx+(bd*i*1.2),ly=stackY-i*5;
    ctx.fillStyle="#3d1a06";ctx.beginPath();ctx.ellipse(lx,ly,7,4.5,bd*.15,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#7c3a10";ctx.beginPath();ctx.ellipse(lx,ly,5.5,3.2,bd*.15,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#5c2a0a";ctx.lineWidth=.7;
    ctx.beginPath();ctx.ellipse(lx,ly,3.5,2.2,bd*.15,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.ellipse(lx,ly,1.5,.9,bd*.15,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle="#2d1006";ctx.beginPath();ctx.ellipse(lx,ly,.6,.4,0,0,Math.PI*2);ctx.fill();
    if(i===0)stackY=ly;
  }
  if(wood>0)stackY-=8;
  // 肉：赤い塊
  for(let i=0;i<Math.min(meat,4);i++){
    const mx=bx+(bd*i*.8),my=stackY-i*4.5;
    ctx.fillStyle="#7f1d1d";ctx.beginPath();ctx.ellipse(mx,my,7,4,bd*.1,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#dc2626";ctx.beginPath();ctx.ellipse(mx-1,my-1,5,2.8,bd*.1,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#b91c1c";ctx.lineWidth=.6;
    ctx.beginPath();ctx.moveTo(mx-3,my);ctx.quadraticCurveTo(mx,my-2,mx+3,my);ctx.stroke();
    if(i===0)stackY=my;
  }
  if(meat>0)stackY-=7;
  // 毛皮：丸めた皮
  for(let i=0;i<Math.min(fur,3);i++){
    const fx=bx+(bd*i*.8),fy=stackY-i*4;
    ctx.fillStyle="#78350f";ctx.beginPath();ctx.ellipse(fx,fy,8,4.5,bd*.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#92400e";ctx.beginPath();ctx.ellipse(fx,fy,6,3,bd*.2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#a16207";ctx.lineWidth=.6;
    for(let j=-4;j<=4;j+=2){ctx.beginPath();ctx.moveTo(fx+j,fy-2);ctx.lineTo(fx+j+.5,fy+2);ctx.stroke();}
    if(i===0)stackY=fy;
  }
  if(fur>0)stackY-=7;
  // キノコ
  for(let i=0;i<Math.min(mush,3);i++){
    const ux=bx+(bd*i*5),uy=stackY-i*1;
    ctx.fillStyle="#e8d5b7";ctx.fillRect(ux-2,uy,4,6);
    ctx.fillStyle="#7c3aed";ctx.beginPath();ctx.ellipse(ux,uy-2,7,5,0,0,Math.PI,Math.PI*2);ctx.fill();
    ctx.fillStyle="#a855f7";ctx.beginPath();ctx.ellipse(ux-1,uy-3,4,3,-.2,0,Math.PI,Math.PI*2);ctx.fill();
    if(i===0)stackY=uy;
  }
  if(mush>0)stackY-=9;
  // 鉱石
  for(let i=0;i<Math.min(ore,3);i++){
    const ox=bx+(bd*i*.8),oy=stackY-i*4.5;
    ctx.fillStyle="#374151";ctx.beginPath();ctx.moveTo(ox-6,oy+3);ctx.lineTo(ox-7,oy-1);ctx.lineTo(ox-2,oy-5);ctx.lineTo(ox+3,oy-5);ctx.lineTo(ox+6,oy-1);ctx.lineTo(ox+5,oy+3);ctx.closePath();ctx.fill();
    ctx.fillStyle="#6b7280";ctx.beginPath();ctx.moveTo(ox-2,oy-5);ctx.lineTo(ox+3,oy-5);ctx.lineTo(ox+2,oy-2);ctx.lineTo(ox-1,oy-2);ctx.closePath();ctx.fill();
    if(i===0)stackY=oy;
  }

  // ── キャラ本体（前に重なる）──────────────────────────────
  const bx1=fl?px-1:px-10,bx2=fl?px-10:px-1;
  ctx.fillStyle="#1c1917";ctx.beginPath();ctx.roundRect(bx1,py+9+b+ls,10,8,[2,2,4,4]);ctx.fill();ctx.beginPath();ctx.roundRect(bx2,py+9+b-ls,10,8,[2,2,4,4]);ctx.fill();
  ctx.fillStyle="#1e3a8a";ctx.fillRect(px-8,py+1+b,7,10);ctx.fillRect(px+1,py+1+b,7,10);
  const cG=ctx.createLinearGradient(px-12,0,px+12,0);cG.addColorStop(0,"#7f1d1d");cG.addColorStop(.5,"#b91c1c");cG.addColorStop(1,"#7f1d1d");ctx.fillStyle=cG;ctx.beginPath();ctx.roundRect(px-11,py-9+b,22,13,[5,5,2,2]);ctx.fill();
  ctx.strokeStyle="#991b1b";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,py-9+b);ctx.lineTo(px,py+4+b);ctx.stroke();
  ctx.fillStyle="#fbbf24";[py-6+b,py-2+b].forEach(by=>{ctx.beginPath();ctx.arc(px,by,1.5,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle="#78350f";ctx.fillRect(px-11,py+1+b,22,3);ctx.fillStyle="#fbbf24";ctx.beginPath();ctx.roundRect(px-3,py+.5+b,6,4,1);ctx.fill();
  const as=moving?Math.sin(t/110)*9:0;
  ctx.fillStyle="#991b1b";ctx.beginPath();ctx.roundRect(px+d*8,py-7+b+as*d,6,11,3);ctx.fill();ctx.fillStyle="#b91c1c";ctx.beginPath();ctx.roundRect(px-d*14,py-7+b-as*d,6,11,3);ctx.fill();
  ctx.fillStyle="#fde68a";ctx.beginPath();ctx.ellipse(px,py-11+b,4,3.5,0,0,Math.PI*2);ctx.fill();
  const fG=ctx.createRadialGradient(px-2,py-18+b,1,px,py-17+b,9);fG.addColorStop(0,"#fef3c7");fG.addColorStop(1,"#fde68a");ctx.fillStyle=fG;ctx.beginPath();ctx.ellipse(px,py-17+b,9,10,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#f5c67a";ctx.beginPath();ctx.ellipse(fl?px-9:px+9,py-17+b,3,4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#92400e";ctx.beginPath();ctx.ellipse(px,py-23+b,9,6,0,0,Math.PI);ctx.fill();ctx.beginPath();ctx.ellipse(fl?px-6:px+6,py-19+b,4,6,fl?.4:-.4,0,Math.PI);ctx.fill();
  const htG=ctx.createLinearGradient(px-13,py-27+b,px+13,py-24+b);htG.addColorStop(0,"#450a0a");htG.addColorStop(.5,"#7c2d12");htG.addColorStop(1,"#450a0a");ctx.fillStyle=htG;ctx.beginPath();ctx.roundRect(px-13,py-27+b,26,5,[2,2,1,1]);ctx.fill();
  const hbG=ctx.createLinearGradient(px-9,py-40+b,px+9,py-27+b);hbG.addColorStop(0,"#9a3412");hbG.addColorStop(1,"#7c2d12");ctx.fillStyle=hbG;ctx.beginPath();ctx.roundRect(px-8,py-40+b,16,15,[6,6,2,2]);ctx.fill();
  ctx.fillStyle="#3b0a0a";ctx.fillRect(px-8,py-29+b,16,3);
  ctx.save();ctx.strokeStyle="#86efac";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px+4,py-40+b);ctx.quadraticCurveTo(px+13,py-47+b,px+9,py-42+b);ctx.stroke();ctx.restore();
  const ex=fl?-2:2;ctx.fillStyle="#1c1917";ctx.beginPath();ctx.ellipse(px+ex-3,py-18+b,2,2.3,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(px+ex+3,py-18+b,2,2.3,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.8)";ctx.beginPath();ctx.arc(px+ex-2.5,py-19.5+b,1,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(px+ex+3.5,py-19.5+b,1,0,Math.PI*2);ctx.fill();
  const breathAngle=fl?Math.PI*.1:Math.PI*.9;ctx.save();ctx.globalAlpha=.25+Math.sin(t/600)*.1;ctx.fillStyle="#bfdbfe";
  for(let i=0;i<3;i++){const ba=breathAngle+i*.25-.25,br=8+i*5;ctx.beginPath();ctx.arc(px+Math.cos(ba)*br,py-15+b+Math.sin(ba)*br,1.5-i*.4,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

// ── 凍えた生存者 ─────────────────────────────────────────────
function drawSurvivor(ctx,sv){
  const {x,y,state,rescueProgress}=sv;
  if(state==="rescued")return;
  const t=Date.now(),iciness=1-rescueProgress;
  // 氷の結晶
  ctx.save();ctx.globalAlpha=iciness*.6;ctx.strokeStyle="#93c5fd";ctx.lineWidth=1.3;
  for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2+(t*.0004),r=19+iciness*7,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;
    ctx.beginPath();ctx.moveTo(x+Math.cos(a)*10,y+Math.sin(a)*10);ctx.lineTo(px,py);ctx.stroke();
    ctx.beginPath();ctx.moveTo(px-Math.cos(a+.6)*4,py-Math.sin(a+.6)*4);ctx.lineTo(px+Math.cos(a-.6)*4,py+Math.sin(a-.6)*4);ctx.stroke();}
  ctx.restore();
  // 体（青みかかった色）
  ctx.save();ctx.globalAlpha=.22;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(x,y+13,10,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
  const ib=Math.floor(iciness*80);
  // 腕（凍えポーズ：上に上げてる）
  ctx.fillStyle=`rgb(${80+ib},${100+ib},${180+ib})`;
  ctx.save();ctx.translate(x-7,y-5);ctx.rotate(-1.1+rescueProgress*.8);ctx.fillRect(-2,-1,4,10);ctx.restore();
  ctx.save();ctx.translate(x+7,y-5);ctx.rotate(1.1-rescueProgress*.8);ctx.fillRect(-2,-1,4,10);ctx.restore();
  // 体
  ctx.fillStyle=`rgb(${80+ib},${100+ib},${180+ib})`;ctx.beginPath();ctx.roundRect(x-7,y-8,14,13,[3,3,2,2]);ctx.fill();
  // 頭
  ctx.fillStyle=`rgb(${130+ib},${150+ib},${210+ib})`;ctx.beginPath();ctx.arc(x,y-13,7,0,Math.PI*2);ctx.fill();
  // 目（震え）
  ctx.fillStyle="#1c1917";ctx.beginPath();ctx.arc(x-2.5,y-13.5,1.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+2.5,y-13.5,1.2,0,Math.PI*2);ctx.fill();
  // 「！」と「凍！」吹き出し
  if(iciness>.7&&Math.sin(t/400)>.3){ctx.save();ctx.globalAlpha=.85;ctx.fillStyle="#bfdbfe";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText("❄️",x,y-28);ctx.restore();}
  // 種別ラベル
  ctx.font="9px sans-serif";ctx.fillStyle="#93c5fd";ctx.textAlign="center";ctx.fillText(sv.label,x,y+22);
  // 救出プログレスバー
  if(rescueProgress>0){ctx.fillStyle="rgba(0,0,0,.6)";ctx.beginPath();ctx.roundRect(x-22,y-32,44,7,3);ctx.fill();ctx.fillStyle="#fbbf24";ctx.beginPath();ctx.roundRect(x-22,y-32,44*rescueProgress,7,3);ctx.fill();}
  else{ctx.save();ctx.globalAlpha=.75+Math.sin(t/400)*.25;ctx.fillStyle="#fbbf24";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText("救出",x,y+32);ctx.restore();}
}

// ── 仲間ワーカー ──────────────────────────────────────────────
function drawWorker(ctx,w){
  const t=Date.now(),mv=w.state!=="idle",ls=mv?Math.sin(t/120)*4:0,bob=mv?Math.sin(t/120)*1.5:0,{x,y,fl,type,carrying}=w;
  const col=W_TYPES[type]?.col||"#374151",d=fl?-1:1;
  ctx.save();ctx.globalAlpha=.18;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(x,y+10,9,3,0,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.fillStyle="#1c1917";ctx.beginPath();ctx.roundRect(x-4,y+5+bob,4,8+ls,[2,2,2,2]);ctx.fill();ctx.beginPath();ctx.roundRect(x+0,y+5+bob,4,8-ls,[2,2,2,2]);ctx.fill();
  ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x-6,y-4+bob,12,11,[3,3,2,2]);ctx.fill();
  ctx.save();ctx.globalAlpha=.28;ctx.fillStyle="#fff";ctx.beginPath();ctx.roundRect(x-4,y-4+bob,4,3,[1]);ctx.fill();ctx.restore();
  const fG=ctx.createRadialGradient(x-1,y-10+bob,1,x,y-9+bob,5.5);fG.addColorStop(0,"#fef3c7");fG.addColorStop(1,"#fde68a");ctx.fillStyle=fG;ctx.beginPath();ctx.arc(x,y-9+bob,5.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#92400e";ctx.beginPath();ctx.arc(x,y-12+bob,4,Math.PI,0);ctx.fill();
  ctx.fillStyle="#1c1917";ctx.beginPath();ctx.arc(x+d*1.5,y-9.5+bob,.9,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+d*3.5,y-9.5+bob,.9,0,Math.PI*2);ctx.fill();
  if(carrying){const icons={wood:"🪵",meat:"🥩",fur:"🦊",mushroom:"🍄",ore:"💎"};ctx.font="11px serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(icons[carrying]||"?",x,y-22+bob);}
}

// ── 販売所（アイソメトリック3Dボックス）────────────────────
function drawSellStall(ctx,st,bought,hasRes,inRange){
  const{x,y,label,icon,col,req}=st,unlocked=!req||bought.has(req);
  if(!unlocked){ctx.save();ctx.globalAlpha=.28;}
  const W2=34,H2=55,D=12; // 幅/高さ/奥行き
  // ── 右側面（暗い奥行き面）─────────────────────────────
  ctx.fillStyle="#1a0e06";
  ctx.beginPath();ctx.moveTo(x+W2,y-H2+20);ctx.lineTo(x+W2+D,y-H2+20-D*.5);ctx.lineTo(x+W2+D,y+20-D*.5);ctx.lineTo(x+W2,y+20);ctx.closePath();ctx.fill();
  // ── 天面（明るい上面）─────────────────────────────────
  const topC=ctx.createLinearGradient(x-W2,y-H2+20,x+W2,y-H2+20);topC.addColorStop(0,col+"cc");topC.addColorStop(1,col+"88");
  ctx.fillStyle=topC;
  ctx.beginPath();ctx.moveTo(x-W2,y-H2+20);ctx.lineTo(x+W2,y-H2+20);ctx.lineTo(x+W2+D,y-H2+20-D*.5);ctx.lineTo(x-W2+D,y-H2+20-D*.5);ctx.closePath();ctx.fill();
  // 天面の雪
  ctx.save();ctx.globalAlpha=.75;ctx.fillStyle="#ddeeff";ctx.beginPath();ctx.ellipse(x+D*.5,y-H2+19,28,3.5,0,0,Math.PI*2);ctx.fill();ctx.restore();
  // ── 正面（メイン）────────────────────────────────────
  ctx.fillStyle="#2a1a0e";ctx.beginPath();ctx.roundRect(x-W2,y-H2+20,W2*2,H2,[2,2,0,0]);ctx.fill();
  // カラー幕
  ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x-W2-4,y-H2+6,W2*2+8,16,[4,4,0,0]);ctx.fill();
  ctx.save();ctx.globalAlpha=.22;ctx.fillStyle="#000";for(let i=-28;i<32;i+=12){ctx.beginPath();ctx.moveTo(x+i,y-H2+6);ctx.lineTo(x+i+6,y-H2+6);ctx.lineTo(x+i+8,y-H2+22);ctx.lineTo(x+i+2,y-H2+22);ctx.closePath();ctx.fill();}ctx.restore();
  // カウンター天板
  ctx.fillStyle="#a16207";ctx.beginPath();ctx.roundRect(x-W2,y+14,W2*2,9,[1,1,0,0]);ctx.fill();ctx.fillStyle="#ca8a04";ctx.beginPath();ctx.roundRect(x-W2,y+10,W2*2,6,[1]);ctx.fill();
  // カウンター右側面
  ctx.fillStyle="#7a4a05";ctx.beginPath();ctx.moveTo(x+W2,y+10);ctx.lineTo(x+W2+D,y+10-D*.5);ctx.lineTo(x+W2+D,y+23-D*.5);ctx.lineTo(x+W2,y+23);ctx.closePath();ctx.fill();
  // アイコン・ラベル
  ctx.font="20px serif";ctx.textAlign="center";ctx.textBaseline="middle";
  if(unlocked)ctx.fillText(icon,x,y-H2+36);else{ctx.save();ctx.globalAlpha=.5;ctx.fillText("🔒",x,y-H2+36);ctx.restore();}
  ctx.font="8px sans-serif";ctx.fillStyle="#fef3c7";ctx.textAlign="center";ctx.fillText(label,x,y+5);
  if(unlocked)drawVendor(ctx,x,y-H2+14,col);
  if(!unlocked){ctx.restore();return;}
  if(inRange&&hasRes){const p=(Math.sin(Date.now()/300)+1)/2;ctx.save();ctx.globalAlpha=.22+p*.22;ctx.strokeStyle="#fbbf24";ctx.lineWidth=2.5;ctx.beginPath();ctx.roundRect(x-W2-4,y-H2+6,(W2+4)*2,H2+D,3);ctx.stroke();ctx.restore();ctx.fillStyle="rgba(0,0,0,.85)";ctx.beginPath();ctx.roundRect(x-38,y-H2-14,76,20,8);ctx.fill();ctx.fillStyle="#fbbf24";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText(`${icon} 持ってきた！`,x,y-H2-4);}
}
function drawVendor(ctx,cx,cy,coatCol){
  const bob=Math.sin(Date.now()/900)*1.5;ctx.save();ctx.globalAlpha=.8;
  ctx.fillStyle="rgba(0,0,0,.18)";ctx.beginPath();ctx.ellipse(cx,cy+11,6,2.5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=coatCol;ctx.beginPath();ctx.roundRect(cx-5,cy-2+bob,10,10,[2,2,1,1]);ctx.fill();
  ctx.save();ctx.globalAlpha=.28;ctx.fillStyle="#fff";ctx.beginPath();ctx.roundRect(cx-4,cy-1+bob,4,3,[1]);ctx.fill();ctx.restore();
  const fG=ctx.createRadialGradient(cx-1,cy-8+bob,1,cx,cy-7+bob,5.5);fG.addColorStop(0,"#fef3c7");fG.addColorStop(1,"#fde68a");ctx.fillStyle=fG;ctx.beginPath();ctx.arc(cx,cy-7+bob,5.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#92400e";ctx.beginPath();ctx.arc(cx,cy-10+bob,4,Math.PI,0);ctx.fill();
  ctx.fillStyle="#1c1917";ctx.beginPath();ctx.arc(cx-2,cy-7.5+bob,1,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+2,cy-7.5+bob,1,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// ── 焚き火 ────────────────────────────────────────────────────
function drawCampFire(ctx,x,y){
  const t=Date.now(),f=Math.sin(t/60)*.5+.5;
  const glow=ctx.createRadialGradient(x,y,0,x,y,100);glow.addColorStop(0,"rgba(251,146,36,.3)");glow.addColorStop(.5,"rgba(251,100,20,.08)");glow.addColorStop(1,"rgba(251,146,36,0)");ctx.fillStyle=glow;ctx.fillRect(x-100,y-100,200,200);
  ctx.fillStyle="#4a2008";ctx.beginPath();ctx.ellipse(x,y+8,16,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#6b3010";ctx.fillRect(x-14,y+4,28,6);ctx.fillRect(x-10,y+2,6,6);ctx.fillRect(x+4,y+2,6,6);
  ctx.fillStyle="#dc2626";ctx.beginPath();ctx.ellipse(x,y-2,9,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#f97316";ctx.beginPath();ctx.moveTo(x-8,y);ctx.quadraticCurveTo(x-4,y-14-f*4,x,y-18-f*6);ctx.quadraticCurveTo(x+4,y-14-f*4,x+8,y);ctx.closePath();ctx.fill();
  ctx.fillStyle="#fbbf24";ctx.beginPath();ctx.moveTo(x-5,y-2);ctx.quadraticCurveTo(x,y-14-f*5,x+5,y-2);ctx.closePath();ctx.fill();
  ctx.save();ctx.globalAlpha=.7;ctx.fillStyle="#fef3c7";ctx.beginPath();ctx.ellipse(x,y-10-f*3,3,5,0,0,Math.PI*2);ctx.fill();ctx.restore();
  // 小さな拠点サイン
  ctx.font="8px sans-serif";ctx.fillStyle="#fbbf24";ctx.textAlign="center";ctx.fillText("⛺ 拠点",x,y+22);
}

// ── 強化拠点 ──────────────────────────────────────────────────
function drawLocation(ctx,loc,bought){
  const{x,y,icon,label}=loc,activeUpg=getActiveUpg(loc,bought),allDone=loc.upgrades.every(id=>bought.has(id)),t=Date.now();
  ctx.fillStyle=allDone?"#1a3a10":"#1a1408";ctx.beginPath();ctx.roundRect(x-20,y-4,40,18,3);ctx.fill();ctx.fillStyle=allDone?"#2a5a18":"#2a2010";ctx.beginPath();ctx.roundRect(x-20,y-8,40,6,2);ctx.fill();
  ctx.fillStyle=allDone?"#183510":"#2a1808";ctx.beginPath();ctx.roundRect(x-16,y-28,32,22,2);ctx.fill();ctx.fillStyle=allDone?"#102808":"#221006";ctx.beginPath();ctx.moveTo(x,y-44);ctx.lineTo(x-20,y-26);ctx.lineTo(x+20,y-26);ctx.closePath();ctx.fill();
  // 屋根雪
  ctx.save();ctx.globalAlpha=.75;ctx.fillStyle="#ddeeff";ctx.beginPath();ctx.ellipse(x,y-42,16,3,0,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.font="14px serif";ctx.textAlign="center";ctx.textBaseline="middle";
  if(allDone){ctx.globalAlpha=.8;ctx.fillText("✅",x,y-34);ctx.globalAlpha=1;}
  else if(activeUpg){const p=(Math.sin(t/600)+1)/2;ctx.save();ctx.globalAlpha=.15+p*.12;ctx.fillStyle="#fbbf24";ctx.beginPath();ctx.arc(x,y-34,14,0,Math.PI*2);ctx.fill();ctx.restore();ctx.fillText(icon,x,y-34);}
  else{ctx.globalAlpha=.25;ctx.fillText(icon,x,y-34);ctx.globalAlpha=1;}
  ctx.font="8px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=allDone?"#4ade80":activeUpg?"#fbbf24":"#444";ctx.fillText(allDone?`✓ ${label}`:activeUpg?`${activeUpg.cost}G`:"🔒",x,y+8);
}

// ── App ──────────────────────────────────────────────────────
export default function App(){
  const canvasRef=useRef(null),gRef=useRef(null),keysRef=useRef({});
  const [hud,setHud]=useState({money:10,inv:{wood:0,meat:0,fur:0,mushroom:0,ore:0},bought:new Set(),workers:[],logs:["❄️ 極寒の森へようこそ！凍えた仲間を救出しよう！"]});

  useEffect(()=>{
    gRef.current={
      px:560,py:280,fl:false,moving:false,axeAngle:0,
      destX:null,destY:null,destMarker:null,
      money:10,inv:{wood:0,meat:0,fur:0,mushroom:0,ore:0},bought:new Set(),
      logs:["❄️ 極寒の森へようこそ！凍えた仲間を救出しよう！"],
      activeNodes:[],nearLoc:null,
      nodes:NODE_DEFS.map(d=>({...d,cx:d.x,cy:d.y,wx:d.x+(Math.random()-.5)*180,wy:d.y+(Math.random()-.5)*130,wt:Math.random()*3000,state:"available",prog:0,rsTimer:0,hitTimer:0,workerId:null})),
      survivors:SURVIVOR_DEFS.map(s=>({...s,state:"frozen",rescueProgress:0})),
      workers:[],nextWorkerId:0,
      sellStations:SELL_STATIONS.map(s=>({...s})),
      particles:[],floats:[],
      snowflakes:Array.from({length:70},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:.35+Math.random()*.7,size:.8+Math.random()*1.8,alpha:.3+Math.random()*.45})),
      shake:0,shakeX:0,shakeY:0,
    };
  },[]);

  useEffect(()=>{
    if(canvasRef.current) canvasRef.current.focus();
  },[]);

  // タップ/クリックで移動
  const handlePointerDown=useCallback(e=>{
    e.preventDefault();
    const g=gRef.current;if(!g)return;
    const rect=e.currentTarget.getBoundingClientRect();
    const tx=(e.clientX-rect.left)*(W/rect.width);
    const ty=(e.clientY-rect.top)*(H/rect.height);
    g.destX=tx;g.destY=ty;
    g.destMarker={x:tx,y:ty,life:1};
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");
    let last=performance.now(),animId,hudT=0;

    function update(dt){
      const g=gRef.current;if(!g)return;
      const k=keysRef.current;

      // キーボード移動
      let kdx=(k["ArrowLeft"]||k["a"]||k["A"]?-1:0)+(k["ArrowRight"]||k["d"]||k["D"]?1:0);
      let kdy=(k["ArrowUp"]  ||k["w"]||k["W"]?-1:0)+(k["ArrowDown"] ||k["s"]||k["S"]?1:0);
      if(kdx!==0||kdy!==0){// キーボード優先
        if(kdx!==0&&kdy!==0){kdx*=.707;kdy*=.707;}
        g.px=Math.max(14,Math.min(W-14,g.px+kdx*SPEED*(dt/16)));
        g.py=Math.max(14,Math.min(H-14,g.py+kdy*SPEED*(dt/16)));
        g.moving=true;if(kdx!==0)g.fl=kdx<0;
        g.destX=null; // タップ行き先キャンセル
      } else if(g.destX!==null){// タップ移動
        const ddx=g.destX-g.px,ddy=g.destY-g.py,dd=Math.hypot(ddx,ddy);
        if(dd>6){g.px+=ddx/dd*SPEED*(dt/16);g.py+=ddy/dd*SPEED*(dt/16);g.moving=true;if(ddx!==0)g.fl=ddx<0;}
        else{g.moving=false;g.destX=null;}
      } else{g.moving=false;}
      g.px=Math.max(14,Math.min(W-14,g.px));g.py=Math.max(14,Math.min(H-14,g.py));

      // 斧回転
      g.axeAngle+=dt*(g.activeNodes.length>0?.013:.007);

      // 動物徘徊
      for(const n of g.nodes){
        if(!n.wanders)continue;n.wt-=dt;
        if(n.wt<=0||dst(n.cx,n.cy,n.wx,n.wy)<5){n.wx=400+Math.random()*200;n.wy=100+Math.random()*(H-200);n.wt=2000+Math.random()*4000;}
        if(n.state==="available"){const tdx=n.wx-n.cx,tdy=n.wy-n.cy,td2=Math.hypot(tdx,tdy);if(td2>3){const ws=.42*(dt/16);n.cx+=tdx/td2*ws;n.cy+=tdy/td2*ws;}n.cx=Math.max(400,Math.min(W-40,n.cx));n.cy=Math.max(60,Math.min(H-60,n.cy));}
      }
      for(const n of g.nodes)if(n.state==="respawning"){n.rsTimer-=dt;if(n.rsTimer<=0){n.state="available";n.prog=0;n.workerId=null;}}

      // ── 生存者救出 ───────────────────────────────────────
      for(const sv of g.survivors){
        if(sv.state==="rescued")continue;
        if(sv.req&&!g.bought.has(sv.req))continue;
        const inRange=dst(g.px,g.py,sv.x,sv.y)<REACH;
        if(inRange){sv.rescueProgress=Math.min(1,sv.rescueProgress+dt/2000);}
        else{sv.rescueProgress=Math.max(0,sv.rescueProgress-dt/500);}
        if(sv.rescueProgress>=1){
          sv.state="rescued";
          // 仲間に追加！
          g.workers.push({id:g.nextWorkerId++,type:sv.type,label:sv.label,x:sv.x,y:sv.y,fl:false,moving:false,state:"idle",target:null,carrying:null,timer:0});
          spawnParts(g,sv.x,sv.y,"rescue");
          g.logs=[`❄️→👤 ${sv.label}を救出！仲間が増えた！`,...g.logs].slice(0,14);g.shake=5;
        }
      }

      // ── 複数同時採取（プレイヤー）──────────────────────
      const inRange=[];
      for(const n of g.nodes){
        if(n.state!=="available")continue;if(n.req&&!g.bought.has(n.req))continue;
        if(n.workerId!==null)continue; // ワーカーが使用中
        if(dst(g.px,g.py,n.cx,n.cy)<REACH)inRange.push(n);
      }
      g.activeNodes=inRange;
      const emojis={wood:"🪵",meat:"🥩",fur:"🦊",mushroom:"🍄",ore:"💎"};
      const fCols={wood:"#86efac",meat:"#fca5a5",fur:"#fca5a5",mushroom:"#c4b5fd",ore:"#93c5fd"};
      const chipC={tree:["#d4e8ff","#a3b8cc","#8b6c48"],animal:["#fca5a5"],mushroom:["#c4b5fd"],ore:["#93c5fd","#e5e7eb"]};
      for(const n of inRange){
        n.prog=Math.min(1,n.prog+dt/n.ms);n.hitTimer-=dt;
        if(n.hitTimer<=0){n.hitTimer=320;const cc=chipC[n.type]||chipC.ore;for(let i=0;i<3;i++)spawnPart(g,n.cx,n.cy,cc[Math.floor(Math.random()*cc.length)]);}
        if(n.prog>=1){
          for(const [res,amt] of Object.entries(n.yield)){
            let a=amt;if(res==="wood")a+=(g.bought.has("axe1")?2:0)+(g.bought.has("axe2")?3:0);if(res==="ore")a+=(g.bought.has("p2")?2:0);if(res==="mushroom")a+=(g.bought.has("basket")?1:0);
            g.inv[res]=(g.inv[res]||0)+a;spawnFloat(g,n.cx,n.cy-10,`+${a}${emojis[res]}`,fCols[res]);
          }
          spawnParts(g,n.cx,n.cy,n.type);g.shake=4;n.state="respawning";n.rsTimer=n.rsMs;n.prog=0;
        }
      }
      for(const n of g.nodes)if(!inRange.includes(n)&&n.prog>0&&n.state==="available"&&!n.workerId)n.prog=Math.max(0,n.prog-dt/280);

      // 販売所（プレイヤー）
      for(const st of g.sellStations){
        st.cd=Math.max(0,st.cd-dt);const reqOk=!st.req||g.bought.has(st.req);
        if(!reqOk||g.inv[st.res]<=0||st.cd>0)continue;
        if(dst(g.px,g.py,st.x,st.y)<REACH+10){
          const price=PRICES[st.res]+(st.res==="wood"&&g.bought.has("sawmill")?2:0);
          const earn=Math.floor(g.inv[st.res]*price*(g.bought.has("goldMine")?2:1));
          g.money+=earn;spawnFloat(g,st.x,st.y-58,`+${earn}G`,"#fbbf24");
          g.logs=[`💰 ${st.label}で${earn}G売却！`,...g.logs].slice(0,14);g.inv[st.res]=0;st.cd=1000;
        }
      }

      // 強化拠点
      g.nearLoc=null;for(const loc of LOCATIONS){if(dst(g.px,g.py,loc.x,loc.y)<REACH+10){g.nearLoc=loc;break;}}

      // ── ワーカーAI ────────────────────────────────────
      const wsPrices={...PRICES,wood:PRICES.wood+(g.bought.has("sawmill")?2:0)};
      const wsMult=g.bought.has("goldMine")?2:1;
      for(const w of g.workers){
        const wt=W_TYPES[w.type];
        switch(w.state){
          case "idle":{// 近くの採取可能ノード探す
            let best=null,bd=Infinity;
            for(const n of g.nodes){
              if(!wt.nodes.includes(n.type)||n.state!=="available")continue;
              if(n.req&&!g.bought.has(n.req))continue;
              if(n.workerId!==null)continue;
              const d=dst(w.x,w.y,n.cx,n.cy);if(d<bd){best=n;bd=d;}
            }
            if(best){best.workerId=w.id;w.target=best;w.state="to_res";}
            break;}
          case "to_res":{const n=w.target;if(!n||n.state!=="available"){w.state="idle";w.target=null;break;}
            const ddx=n.cx-w.x,ddy=n.cy-w.y,d=Math.hypot(ddx,ddy);
            if(d>28){w.x+=ddx/d*1.1*(dt/16);w.y+=ddy/d*1.1*(dt/16);w.fl=ddx<0;w.moving=true;}
            else{w.state="gathering";w.timer=n.ms*1.5;w.moving=false;}
            break;}
          case "gathering":{w.timer-=dt;
            if(w.timer<=0){
              const n=w.target;if(!n||n.state!=="available"){w.state="idle";w.target=null;break;}
              // 資源獲得
              const res=Array.isArray(wt.res)?wt.res[0]:wt.res;
              w.carrying=res;
              n.workerId=null;n.state="respawning";n.rsTimer=n.rsMs;n.prog=0;w.target=null;
              // 対応する販売所へ
              const stall=g.sellStations.find(s=>s.res===res&&(!s.req||g.bought.has(s.req)));
              if(stall){w.destX=stall.x;w.destY=stall.y;w.state="to_stall";}else w.state="idle";
            }break;}
          case "to_stall":{const ddx=w.destX-w.x,ddy=w.destY-w.y,d=Math.hypot(ddx,ddy);
            if(d>25){w.x+=ddx/d*1.1*(dt/16);w.y+=ddy/d*1.1*(dt/16);w.fl=ddx<0;w.moving=true;}
            else{w.state="selling";w.timer=400;w.moving=false;}break;}
          case "selling":{w.timer-=dt;
            if(w.timer<=0){
              const earn=Math.floor((wsPrices[w.carrying]||1)*wsMult);
              g.money+=earn;spawnFloat(g,w.x,w.y-25,`+${earn}G`,"#fbbf24");
              w.carrying=null;w.state="idle";
            }break;}
        }
      }

      // パーティクル・フロート
      for(let i=g.particles.length-1;i>=0;i--){const p=g.particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.2;p.life-=.024;p.rot+=p.rotV;if(p.life<=0)g.particles.splice(i,1);}
      for(let i=g.floats.length-1;i>=0;i--){const f=g.floats[i];f.y+=f.vy;f.life-=.016;if(f.life<=0)g.floats.splice(i,1);}
      // 雪
      for(const s of g.snowflakes){s.x+=s.vx+Math.sin(Date.now()/2000+s.y*.01)*.18;s.y+=s.vy;if(s.y>H+5){s.y=-5;s.x=Math.random()*W;}if(s.x<-5)s.x=W+5;if(s.x>W+5)s.x=-5;}
      // デスティネーションマーカー
      if(g.destMarker)g.destMarker.life-=dt/800;
      if(g.shake>.1){g.shakeX=(Math.random()-.5)*g.shake;g.shakeY=(Math.random()-.5)*g.shake;g.shake*=.7;}else{g.shake=0;g.shakeX=0;g.shakeY=0;}
    }

    function render(){
      const g=gRef.current;if(!g)return;
      ctx.save();if(g.shake>.1)ctx.translate(g.shakeX,g.shakeY);

      // ── 雪の夜空・地面 ─────────────────────────────────
      const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#060d1a");sky.addColorStop(.4,"#0d1b2a");sky.addColorStop(1,"#0a1520");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
      // 地面の雪
      const ground=ctx.createLinearGradient(0,H*.4,0,H);ground.addColorStop(0,"rgba(180,200,220,0)");ground.addColorStop(1,"rgba(200,218,235,.15)");ctx.fillStyle=ground;ctx.fillRect(0,0,W,H);
      // 雪の地面パッチ
      ctx.save();ctx.fillStyle="#c8d8e8";const patches=[[80,420,40,8,.18],[200,440,55,10,.2],[350,435,45,9,.15],[500,445,38,8,.18],[150,430,30,6,.12],[450,430,42,8,.16],[620,442,35,7,.14]];
      patches.forEach(([px,py,rx,ry,a])=>{ctx.globalAlpha=a;ctx.beginPath();ctx.ellipse(px,py,rx,ry,0,0,Math.PI*2);ctx.fill();});ctx.restore();
      // 左（森）が暗い
      const fogL=ctx.createLinearGradient(0,0,420,0);fogL.addColorStop(0,"rgba(2,8,15,.7)");fogL.addColorStop(1,"rgba(2,8,15,0)");ctx.fillStyle=fogL;ctx.fillRect(0,0,W,H);

      // 焚き火グロー
      const cg=ctx.createRadialGradient(CAMP.x,CAMP.y,0,CAMP.x,CAMP.y,110);cg.addColorStop(0,"rgba(251,146,36,.28)");cg.addColorStop(1,"rgba(251,146,36,0)");ctx.fillStyle=cg;ctx.fillRect(0,0,W,H);

      // ── 遠近感のある床タイル（強め）──────────────────────
      ctx.save();
      const vx=W*.52,vy=H*-.05;
      ctx.lineWidth=.9;
      for(let gx=-60;gx<=W+60;gx+=55){
        ctx.strokeStyle="#6a8fa8";ctx.globalAlpha=.06;ctx.beginPath();
        ctx.moveTo(vx+(gx-vx)*.04,vy+(H-vy)*.04);ctx.lineTo(gx,H+8);ctx.stroke();
      }
      for(let t=.08;t<=1.05;t+=.09){
        const gy=vy+(H-vy)*t,hw=Math.min(W*.5,W*.5*t*1.4);
        ctx.strokeStyle="#7ab4cc";ctx.globalAlpha=.04+t*.03;
        ctx.beginPath();ctx.moveTo(vx-hw,gy);ctx.lineTo(vx+hw,gy);ctx.stroke();
      }
      ctx.restore();

      // 木の方向性シャドウ
      ctx.save();ctx.globalAlpha=.13;ctx.fillStyle="#000";
      for(const n of g.nodes)if(n.type==="tree"&&n.state!=="respawning"){
        const sl=26*n.s,sd=11*n.s;
        ctx.beginPath();ctx.moveTo(n.cx-3*n.s,n.cy);ctx.lineTo(n.cx+3*n.s,n.cy);ctx.lineTo(n.cx+3*n.s+sl,n.cy+sd);ctx.lineTo(n.cx-3*n.s+sl,n.cy+sd);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.ellipse(n.cx+sl*.75,n.cy-10*n.s+sd*.75,9*n.s,3.5*n.s,0,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
      ctx.save();ctx.globalAlpha=.18;ctx.fillStyle="#000";for(const n of g.nodes)if(n.type==="tree"){ctx.beginPath();ctx.ellipse(n.cx,n.cy+14,15*n.s,5*n.s,0,0,Math.PI*2);ctx.fill();}ctx.restore();

      // 雪降り
      ctx.save();ctx.fillStyle="#e8f4ff";for(const s of g.snowflakes){ctx.globalAlpha=s.alpha;ctx.beginPath();ctx.arc(s.x,s.y,s.size,0,Math.PI*2);ctx.fill();}ctx.restore();

      // 深度ソート＋深度スケール（奥=小さく・手前=大きく）
      const drawables=[];

      // 販売所
      for(const st of g.sellStations){const hasRes=g.inv[st.res]>0,inR=dst(g.px,g.py,st.x,st.y)<REACH+10;drawables.push({y:st.y+14,cx:st.x,draw:()=>{ctx.textAlign="center";ctx.textBaseline="middle";drawSellStall(ctx,st,g.bought,hasRes,inR);}});}
      // 強化拠点
      for(const loc of LOCATIONS)drawables.push({y:loc.y,cx:loc.x,draw:()=>{ctx.textAlign="center";ctx.textBaseline="middle";drawLocation(ctx,loc,g.bought);}});
      // 強化ヒント
      if(g.nearLoc){const upg=getActiveUpg(g.nearLoc,g.bought);if(upg)drawables.push({y:g.nearLoc.y-65,cx:g.nearLoc.x,draw:()=>{ctx.fillStyle="rgba(0,0,0,.8)";ctx.beginPath();ctx.roundRect(g.nearLoc.x-72,g.nearLoc.y-74,144,22,8);ctx.fill();ctx.fillStyle="#fbbf24";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText(`E: ${upg.name} ${upg.cost}G`,g.nearLoc.x,g.nearLoc.y-63);}});}
      // 焚き火
      drawables.push({y:CAMP.y+10,draw:()=>{ctx.textAlign="center";ctx.textBaseline="middle";drawCampFire(ctx,CAMP.x,CAMP.y);}});
      // 生存者
      for(const sv of g.survivors)if(sv.state!=="rescued")drawables.push({y:sv.y,draw:()=>{ctx.textAlign="center";ctx.textBaseline="middle";drawSurvivor(ctx,sv);}});
      // 木
      for(const n of g.nodes)if(n.type==="tree"){drawables.push({y:n.cy,draw:()=>{const act=g.activeNodes.includes(n);if(act&&n.prog>0){ctx.save();ctx.globalAlpha=n.prog*.08;ctx.fillStyle="#4ade80";ctx.beginPath();ctx.ellipse(n.cx,n.cy-25*n.s,22*n.s,35*n.s,0,0,Math.PI*2);ctx.fill();ctx.restore();}drawPine(ctx,n.cx,n.cy,n.s,n.state);if(n.state==="respawning"){const r=1-n.rsTimer/n.rsMs;ctx.fillStyle="rgba(0,0,0,.5)";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+18,36,5,3);ctx.fill();ctx.fillStyle="#c8e0f0";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+18,36*r,5,3);ctx.fill();}if(n.prog>0){const pw=34*n.s;ctx.fillStyle="rgba(0,0,0,.5)";ctx.beginPath();ctx.roundRect(n.cx-pw/2,n.cy+16,pw,4,2);ctx.fill();ctx.fillStyle="#86efac";ctx.beginPath();ctx.roundRect(n.cx-pw/2,n.cy+16,pw*n.prog,4,2);ctx.fill();}}});}
      // イノシシ・鹿
      for(const n of g.nodes)if(n.type==="boar"||n.type==="deer"){drawables.push({y:n.cy,draw:()=>{const rq=!n.req||g.bought.has(n.req);ctx.save();ctx.globalAlpha=n.state==="respawning"?.22:rq?1:.35;if(n.type==="boar")drawBoar(ctx,n.cx,n.cy,n.cx<n.wx,n.moving||false);else drawDeer(ctx,n.cx,n.cy,n.cx<n.wx,n.moving||false);ctx.restore();if(!rq){ctx.font="12px serif";ctx.textAlign="center";ctx.fillText("🔒",n.cx+18,n.cy-18);}if(n.state==="respawning"){const r=1-n.rsTimer/n.rsMs;ctx.fillStyle="rgba(0,0,0,.5)";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+20,36,5,3);ctx.fill();ctx.fillStyle="#fca5a5";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+20,36*r,5,3);ctx.fill();}if(n.prog>0){ctx.fillStyle="rgba(0,0,0,.5)";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+18,36,4,2);ctx.fill();ctx.fillStyle="#fca5a5";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+18,36*n.prog,4,2);ctx.fill();}}});}
      // キノコ・鉱石
      for(const n of g.nodes)if(n.type==="mushroom"||n.type==="ore"){drawables.push({y:n.cy,draw:()=>{const rq=!n.req||g.bought.has(n.req);ctx.save();ctx.globalAlpha=n.state==="respawning"?.22:rq?1:.35;ctx.font="24px serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(n.icon,n.cx,n.cy);ctx.restore();if(!rq){ctx.font="12px serif";ctx.textAlign="center";ctx.fillText("🔒",n.cx+13,n.cy-14);}if(n.prog>0||n.state==="respawning"){const r=n.state==="respawning"?1-n.rsTimer/n.rsMs:n.prog;ctx.fillStyle="rgba(0,0,0,.5)";ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+13,36,4,2);ctx.fill();const col=n.type==="mushroom"?"#c4b5fd":n.state==="respawning"?"#4ade80":"#93c5fd";ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(n.cx-18,n.cy+13,36*r,4,2);ctx.fill();}}});}
      // ワーカー
      for(const w of g.workers)drawables.push({y:w.y,draw:()=>{ctx.textAlign="center";ctx.textBaseline="middle";drawWorker(ctx,w);}});
      // プレイヤー
      drawables.push({y:g.py,cx:g.px,draw:()=>{drawPlayer(ctx,g.px,g.py,g.fl,g.moving,g.inv);const ax=g.px+Math.cos(g.axeAngle)*30,ay=g.py+Math.sin(g.axeAngle)*22;if(g.activeNodes.length>0){ctx.save();ctx.globalAlpha=.45;ctx.fillStyle="#fbbf24";ctx.shadowColor="#fbbf24";ctx.shadowBlur=14;ctx.beginPath();ctx.arc(ax,ay,5,0,Math.PI*2);ctx.fill();ctx.restore();}drawAxe(ctx,ax,ay,g.axeAngle+Math.PI*.75,g.activeNodes.length>0);}});

      // 深度ソート
      // 深度スケール描画（奥=小さく・手前=大きく → 立体感）
      drawables.sort((a,b)=>a.y-b.y);
      ctx.textAlign="center";ctx.textBaseline="middle";
      for(const d of drawables){
        const t=Math.max(0,Math.min(1,d.y/H));
        const scl=0.78+0.44*t; // 奥0.78倍 → 手前1.22倍
        const cx=d.cx!==undefined?d.cx:W*.5;
        ctx.save();
        ctx.translate(cx,d.y);ctx.scale(scl,scl);ctx.translate(-cx,-d.y);
        d.draw();
        ctx.restore();
      }

      // タップ先マーカー
      if(g.destMarker&&g.destMarker.life>0){const{x,y,life}=g.destMarker,sz=9;ctx.save();ctx.globalAlpha=Math.max(0,life)*.85;ctx.strokeStyle="#93c5fd";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-sz,y);ctx.lineTo(x+sz,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-sz);ctx.lineTo(x,y+sz);ctx.stroke();ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);ctx.stroke();ctx.restore();}

      // パーティクル
      for(const p of g.particles){ctx.save();ctx.globalAlpha=p.life;ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=3;ctx.beginPath();ctx.ellipse(0,0,p.size,p.size*.6,0,0,Math.PI*2);ctx.fill();ctx.restore();}
      // フロートテキスト
      for(const f of g.floats){ctx.save();ctx.globalAlpha=Math.min(1,f.life*1.5);ctx.font="bold 15px sans-serif";ctx.textAlign="center";ctx.strokeStyle="rgba(0,0,0,.8)";ctx.lineWidth=3.5;ctx.strokeText(f.text,f.x,f.y);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);ctx.restore();}
      // ビネット
      const vig=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.85);vig.addColorStop(0,"rgba(0,0,0,0)");vig.addColorStop(1,"rgba(0,0,0,.82)");ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
      // 同時伐採数
      const cc=g.activeNodes.filter(n=>n.type==="tree").length;if(cc>1){ctx.fillStyle="rgba(0,0,0,.55)";ctx.beginPath();ctx.roundRect(8,8,84,22,8);ctx.fill();ctx.fillStyle="#86efac";ctx.font="bold 12px sans-serif";ctx.textAlign="left";ctx.fillText(`🪓×${cc} 同時伐採`,14,22);}
      ctx.restore();
    }

    function loop(t){const dt=Math.min(t-last,50);last=t;update(dt);render();hudT+=dt;if(hudT>120){hudT=0;const g=gRef.current;if(g)setHud({money:g.money,inv:{...g.inv},bought:new Set(g.bought),workers:[...g.workers],logs:[...g.logs]});}animId=requestAnimationFrame(loop);}
    animId=requestAnimationFrame(loop);return()=>cancelAnimationFrame(animId);
  },[]);

  const {money,inv,bought,workers,logs}=hud;
  const totalInv=Object.entries(inv).reduce((s,[k,v])=>s+v*(PRICES[k]||0),0);

  return(
    <div style={{fontFamily:"system-ui,sans-serif",background:"#060d1a",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:8,userSelect:"none"}}>
      <style>{`@keyframes gp{0%,100%{text-shadow:0 0 8px rgba(147,197,253,.4)}50%{text-shadow:0 0 22px rgba(147,197,253,.9)}} @keyframes iceIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}} button{transition:transform .08s} button:active{transform:scale(.92)!important} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(147,197,253,.2);border-radius:2px}`}</style>
      <div style={{color:"#93c5fd",fontWeight:700,fontSize:13,letterSpacing:3,marginBottom:6,textShadow:"0 0 10px rgba(147,197,253,.5)"}}>❄️ WHITEOUT FRONTIER ❄️</div>

      <div style={{display:"flex",gap:10,alignItems:"flex-start",flexWrap:"wrap",justifyContent:"center"}}>
        {/* ゲームキャンバス */}
        <div style={{position:"relative"}}>
          <canvas ref={canvasRef} width={W} height={H}
            style={{display:"block",width:"100%",maxWidth:W,height:"auto",borderRadius:12,border:"1px solid rgba(147,197,253,.18)",boxShadow:"0 0 40px rgba(0,0,0,.9)",touchAction:"none",cursor:"crosshair",outline:"none"}}
            tabIndex={0}
            onKeyDown={e=>{keysRef.current[e.key]=true;if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key))e.preventDefault();if(e.key==="e"||e.key==="E"){const g=gRef.current;if(!g)return;for(const loc of LOCATIONS){if(dst(g.px,g.py,loc.x,loc.y)<REACH+10){const upg=getActiveUpg(loc,g.bought);if(upg&&g.money>=upg.cost){g.money-=upg.cost;g.bought.add(upg.id);g.logs=[`✨ ${upg.name} 完成！`,...g.logs].slice(0,14);}return;}}}}}
            onKeyUp={e=>{keysRef.current[e.key]=false;}}
            onPointerDown={e=>{handlePointerDown(e);e.currentTarget.focus();}}
            />
          <div style={{position:"absolute",bottom:6,left:6,fontSize:"10px",color:"rgba(147,197,253,.4)"}}>タップ/クリックで移動 · WASDも可</div>
        </div>

        {/* HUDパネル */}
        <div style={{width:188,display:"flex",flexDirection:"column",gap:8,color:"#e8f0fe"}}>
          {/* 所持金 */}
          <div style={{background:"rgba(6,13,26,.92)",borderRadius:12,padding:"10px 14px",border:"1px solid rgba(147,197,253,.25)",textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:900,color:"#fbbf24",animation:"gp 2s infinite"}}>💰 {money.toLocaleString()}G</div>
            {totalInv>0&&<div style={{fontSize:10,color:"#93c5fd",marginTop:2}}>在庫: {totalInv}G相当</div>}
            {bought.has("goldMine")&&<div style={{fontSize:10,color:"#fbbf24",marginTop:1}}>👑 全収入×2！</div>}
          </div>
          {/* 在庫 */}
          <div style={{background:"rgba(6,13,26,.92)",borderRadius:12,padding:"10px 12px",border:"1px solid rgba(147,197,253,.18)"}}>
            <div style={{fontSize:11,color:"#93c5fd",fontWeight:700,marginBottom:6,letterSpacing:1}}>📦 在庫</div>
            {[["wood","🪵","木材"],["meat","🥩","肉"],["fur","🦊","毛皮"],["mushroom","🍄","キノコ"],["ore","💎","鉱石"]].map(([k,em,nm])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                <span>{em} {nm}</span><span style={{fontWeight:700,color:inv[k]>0?"#86efac":"#334155"}}>{inv[k]}</span>
              </div>
            ))}
          </div>
          {/* 仲間 */}
          <div style={{background:"rgba(6,13,26,.92)",borderRadius:12,padding:"10px 12px",border:"1px solid rgba(147,197,253,.18)"}}>
            <div style={{fontSize:11,color:"#93c5fd",fontWeight:700,marginBottom:5,letterSpacing:1}}>👥 仲間 ({workers.length}/5)</div>
            {workers.length===0?<div style={{fontSize:10,color:"#334155"}}>凍えた人を救出しよう！</div>:
              workers.map(w=><div key={w.id} style={{fontSize:11,color:"#86efac",padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                {W_TYPES[w.type]?.col&&"●"} {w.label} {w.carrying?`→${w.carrying}運搬中`:w.state==="idle"?"待機":"稼働中"}
              </div>)}
          </div>
          {/* ログ */}
          <div style={{background:"rgba(6,13,26,.92)",borderRadius:12,padding:"10px 12px",border:"1px solid rgba(147,197,253,.12)"}}>
            <div style={{fontSize:11,color:"#93c5fd",fontWeight:700,marginBottom:5,letterSpacing:1}}>📜 ログ</div>
            <div style={{maxHeight:110,overflowY:"auto"}}>{logs.map((l,i)=>(<div key={i} style={{fontSize:10,color:`rgba(180,210,235,${Math.max(.18,1-i*.09)})`,padding:"1px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>{l}</div>))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
