import {TUNING} from './config.js';
import {curveAt} from './road.js';
import {Traffic} from './traffic.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class Game{
 constructor(input,sound){this.input=input;this.sound=sound;this.traffic=new Traffic();this.state='menu';this.onOver=()=>{};this.reset()}
 reset(){Object.assign(this,{pos:0,speed:120,px:0,lives:TUNING.lives,nitro:1,inv:0,shake:0,flash:'',flashT:0});this.traffic.reset()}
 start(){this.reset();this.state='play'}
 get distance(){return Math.floor(this.pos/10)}
 update(dt){
  if(this.state!='play'){this.pos+=70*dt;return}
  const boost=this.input.boost&&this.nitro>0;
  let target=boost?TUNING.nitro:TUNING.base;if(Math.abs(this.px)>1)target*=.5;
  this.speed+=(target-this.speed)*dt*1.5;
  this.nitro=clamp(this.nitro+(boost?-.35:.06)*dt,0,1);
  this.px=clamp(this.px+this.input.dir*dt*1.7*(.4+this.speed/400)-curveAt(this.pos)*this.speed*dt*.0011,-1.3,1.3);
  this.pos+=this.speed*dt;this.inv-=dt;this.shake=Math.max(0,this.shake-dt);this.flashT-=dt;
  this.traffic.update(dt,this.pos,(c,rel)=>this.pass(c,rel));
  this.sound.engine(this.speed,this.state=='play')}
 pass(c,rel){const d=Math.abs(c.lane-this.px);
  if(d<.3&&rel>50){if(this.inv>0)return;
   this.lives--;this.speed*=.35;this.inv=1.6;this.shake=.35;this.sound.crash();
   if(this.lives<=0){this.state='menu';this.sound.engine(0,false);this.onOver(this.distance)}}
  else if(d<.55&&this.inv<=0){this.nitro=Math.min(1,this.nitro+.15);this.flash='Rozando +nitro';this.flashT=.8;this.sound.near()}}
}
