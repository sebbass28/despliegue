import {Input} from './input.js';
import {Sound} from './audio.js';
import {Game} from './game.js';
import {Renderer} from './render.js';
import {loadBest,saveBest} from './storage.js';
const $=id=>document.getElementById(id);
const canvas=$('c'),menu=$('m'),result=$('r'),btn=$('b');
const input=new Input(canvas),sound=new Sound(),game=new Game(input,sound),view=new Renderer(canvas);
let best=loadBest();
if(best)result.textContent=`Récord: ${best} m`;
function start(){sound.init();game.start();menu.hidden=true}
game.onOver=d=>{if(d>best){best=d;saveBest(d)}
 $('t').textContent='Fin del trayecto';result.textContent=`Distancia: ${d} m · Récord: ${best} m`;btn.textContent='Otra vez';menu.hidden=false};
btn.onclick=start;
addEventListener('keydown',e=>{if(e.code=='KeyM')sound.muted=!sound.muted;
 if(game.state!='play'&&(e.code=='Enter'||e.code=='Space')){e.preventDefault();start()}});
let last=0;
requestAnimationFrame(function loop(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;
 game.update(dt);view.draw(game);requestAnimationFrame(loop)});
