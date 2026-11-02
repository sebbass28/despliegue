import {W,H,HZ,CAM,PT,CAR_W} from './config.js';
import {bend,road,project} from './road.js';
const HILLS=[['#1f6068',.012,36,28],['#164a4c',.02,26,16]];
export class Renderer{
 constructor(canvas){canvas.width=W;canvas.height=H;this.g=canvas.getContext('2d');
  const s=this.g.createLinearGradient(0,0,0,HZ);s.addColorStop(0,'#0e3b4a');s.addColorStop(.55,'#4b8f9a');s.addColorStop(1,'#f7c77e');this.sky=s}
 draw(game){const g=this.g;g.save();
  if(game.shake>0)g.translate((Math.random()-.5)*10,(Math.random()-.5)*10);
  this.background(game.pos);this.road(game.pos);this.traffic(game);this.player(game);g.restore();
  if(game.state=='play')this.hud(game)}
 background(pos){const g=this.g;g.fillStyle=this.sky;g.fillRect(0,0,W,HZ+2);
  g.fillStyle='#fff1c1';g.beginPath();g.arc(560,HZ-22,48,0,7);g.fill();
  const o=bend(pos+400)*60;
  HILLS.forEach(([col,f,a,b],i)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,HZ);
   for(let x=0;x<=W;x+=16)g.lineTo(x,HZ-b-a*Math.abs(Math.sin((x+o*(i+1))*f+i*2)));
   g.lineTo(W,HZ);g.fill()})}
 road(pos){const g=this.g;
  for(let y=H;y>HZ;y-=2){const t=(y-HZ)/(H-HZ),r=road(t,pos),b=Math.floor(r.z/50)&1;
   g.fillStyle=b?'#2b6e52':'#245f47';g.fillRect(0,y-2,W,2);
   g.fillStyle=b?'#f3efe6':'#c8402f';g.fillRect(r.cx-r.w*.56,y-2,r.w*1.12,2);
   g.fillStyle=b?'#2b3038':'#303640';g.fillRect(r.cx-r.w/2,y-2,r.w,2);
   if(b){g.fillStyle='#e9e4d4';const d=Math.max(1,r.w*.012);for(const l of[-.4,0,.4])g.fillRect(r.cx+l*r.w/2*.85-d/2,y-2,d,2)}}}
 traffic(game){const cars=game.traffic.cars.filter(k=>k.z-game.pos<1500).sort((a,b)=>b.z-a.z);
  for(const k of cars){const t=CAM/(k.z-game.pos),p=project(t,k.lane,game.pos);this.car(p.x,p.y,t*CAR_W,k.col)}}
 player(game){if(game.state!='play'||(game.inv>0&&!(Math.floor(game.inv*12)%2)))return;
  const p=project(PT,game.px,game.pos);this.car(p.x,p.y,CAR_W*PT,'#ffc857')}
 car(x,y,w,col){const g=this.g,h=w*.56;
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x,y,w*.55,w*.08,0,0,7);g.fill();
  g.fillStyle='#111';g.fillRect(x-w*.5,y-h*.38,w*.14,h*.38);g.fillRect(x+w*.36,y-h*.38,w*.14,h*.38);
  g.fillStyle=col;g.fillRect(x-w*.46,y-h*.62,w*.92,h*.5);g.fillRect(x-w*.32,y-h,w*.64,h*.42);
  g.fillStyle='#10242c';g.fillRect(x-w*.26,y-h*.94,w*.52,h*.28);
  g.fillStyle='#ff3b3b';g.fillRect(x-w*.42,y-h*.5,w*.16,h*.1);g.fillRect(x+w*.26,y-h*.5,w*.16,h*.1)}
 hud(s){const g=this.g;g.font='700 22px "Trebuchet MS",sans-serif';g.fillStyle='#fff';g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=6;
  g.textAlign='left';g.fillText(s.distance+' m',18,34);g.fillText(Math.round(s.speed*.55)+' km/h',18,62);
  g.textAlign='right';g.fillText('♥'.repeat(s.lives)+'♡'.repeat(3-s.lives),W-18,34);g.shadowBlur=0;
  g.fillStyle='rgba(0,0,0,.4)';g.fillRect(W-178,48,160,12);
  g.fillStyle=s.nitro>.2?'#5bd1d7':'#ff6b6b';g.fillRect(W-178,48,160*s.nitro,12);
  if(s.flashT>0){g.textAlign='center';g.fillStyle='#ffc857';g.fillText(s.flash,W/2,90)}}
}
