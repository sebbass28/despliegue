import {W,H,HZ,CAM} from './config.js';
export const bend=z=>Math.sin(z*.0016)*1.1+Math.sin(z*.0007)*.6;
export const curveAt=pos=>Math.cos(pos*.0016);
export function road(t,pos){const z=CAM/Math.max(t,.02);return{cx:W/2+bend(pos+z)*(1-t)**2*230,w:30+t*620,z}}
export function project(t,lane,pos){const r=road(t,pos);return{x:r.cx+lane*r.w/2*.85,y:HZ+t*(H-HZ)}}
