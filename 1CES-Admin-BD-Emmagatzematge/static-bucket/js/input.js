export class Input{
 constructor(el){this.keys={};this.ptr={};
  addEventListener('keydown',e=>{this.keys[e.code]=1;if(e.code=='Space'||e.code.startsWith('Arrow'))e.preventDefault()});
  addEventListener('keyup',e=>this.keys[e.code]=0);
  const set=e=>{const r=el.getBoundingClientRect();this.ptr[e.pointerId]=(e.clientX-r.left)/r.width};
  el.addEventListener('pointerdown',set);
  el.addEventListener('pointermove',e=>{if(this.ptr[e.pointerId]!=null)set(e)});
  for(const n of['pointerup','pointercancel','pointerleave'])el.addEventListener(n,e=>delete this.ptr[e.pointerId])}
 get dir(){const k=this.keys;let d=(k.ArrowRight||k.KeyD?1:0)-(k.ArrowLeft||k.KeyA?1:0);
  for(const x of Object.values(this.ptr))d+=x<.5?-1:1;return Math.max(-1,Math.min(1,d))}
 get boost(){return !!this.keys.Space||Object.keys(this.ptr).length>1}
}
