export class Sound{
 constructor(){this.ctx=null;this.muted=false}
 init(){if(this.ctx)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  this.ctx=new C();this.osc=this.ctx.createOscillator();this.gain=this.ctx.createGain();
  this.osc.type='sawtooth';this.gain.gain.value=0;this.osc.connect(this.gain).connect(this.ctx.destination);this.osc.start()}
 engine(speed,on){if(!this.ctx)return;const t=this.ctx.currentTime;
  this.osc.frequency.setTargetAtTime(40+speed*.35,t,.05);this.gain.gain.setTargetAtTime(on&&!this.muted?.04:0,t,.1)}
 blip(f,d,type='square',v=.08){if(!this.ctx||this.muted)return;const o=this.ctx.createOscillator(),n=this.ctx.createGain(),t=this.ctx.currentTime;
  o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,f/3),t+d);
  n.gain.setValueAtTime(v,t);n.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(n).connect(this.ctx.destination);o.start(t);o.stop(t+d)}
 crash(){this.blip(160,.4,'sawtooth',.2)}
 near(){this.blip(700,.12,'triangle',.07)}
}
