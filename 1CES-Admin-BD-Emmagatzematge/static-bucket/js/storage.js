const K='costa-rapida:best';
export const loadBest=()=>{try{return+localStorage.getItem(K)||0}catch{return 0}};
export const saveBest=v=>{try{localStorage.setItem(K,v)}catch{}};
