/* Schaltet auf B1 um: ersetzt die B2-Daten (nur wenn Niveau B1 gewählt ist). */
(function(){
 const lg=document.getElementById('lvlogo');if(lg)lg.textContent=window.LVN+' Trainer';
 document.title='ÖSD '+window.LVN+' – Prüfungstrainer';
 if(!window.B1X)return;
 const swapArr=(a,b)=>{a.length=0;b.forEach(x=>a.push(x))};
 const swapObj=(a,b)=>{Object.keys(a).forEach(k=>delete a[k]);Object.assign(a,b)};
 swapArr(TH,B1.TH);swapArr(GRAM,B1.GRAM);swapObj(REDE,B1.REDE);swapObj(TEMPL,B1.TEMPL);swapArr(THEMES,B1.THEMES);
 swapObj(AUF,B1.AUF);
 Object.keys(MODELS).forEach(m=>{Object.keys(MODELS[m]).forEach(a=>delete MODELS[m][a]);Object.keys(B1.MODELS[m]).forEach(a=>MODELS[m][a]=B1.MODELS[m][a])});
})();
