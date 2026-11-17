/* Niveau (B1 / B2): wird vor allen Daten geladen. Gespeichert unter osdb2_level (wird mit dem Konto synchronisiert). */
(function(){
 let l='';try{const v=localStorage.getItem('osdb2_level');l=v?JSON.parse(v):''}catch(e){}
 window.LEVEL_CHOSEN=(l==='b1'||l==='b2')?l:'';
 window.LEVEL=window.LEVEL_CHOSEN||'b2';
 window.LVN=window.LEVEL==='b1'?'B1':'B2';
 window.B1X=window.LEVEL==='b1';
})();
