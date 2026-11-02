import {LANES,CAR_COLORS} from './config.js';
const pick=a=>a[Math.random()*a.length|0];
export class Traffic{
 constructor(){this.reset()}
 reset(){this.cars=[];this.timer=0}
 update(dt,pos,onPass){
  this.timer-=dt;
  if(this.timer<=0){this.timer=Math.max(.32,1-pos/22000)*(.7+Math.random()*.6);
   this.cars.push({lane:pick(LANES),z:pos+1500,v:90+Math.random()*90,col:pick(CAR_COLORS),passed:false})}
  for(const c of this.cars){c.z+=c.v*dt;const rel=c.z-pos;if(!c.passed&&rel<76){c.passed=true;onPass(c,rel)}}
  this.cars=this.cars.filter(c=>c.z-pos>30)}
}
