/* B2: Prüfungssimulation mit echten Zeiten (ÖSD B2: Lesen 90, Hören 30, Schreiben 90, Sprechen 15-20) */
(function(){if(window.B1X||typeof VIEWS==='undefined'||typeof go!=='function')return;
VIEWS.push(['exam','Prüfung','📝']);const s=document.createElement('section');s.className='sheet';s.id='v-exam';s.hidden=true;$('#main').appendChild(s);
const b=document.createElement('button');b.dataset.v='exam';b.innerHTML='<span aria-hidden="true">📝</span><span>Prüfung</span>';$('#nav').appendChild(b);try{DUR.exam=90}catch(e){}
const M=[['lesen','Lesen','4 Teile',90,'Wähle ein Modell pro Teil (1–4).'],['hoeren','Hören','2 Teile',30,'Audio nur so oft wie in der Prüfung.'],['schreiben','Schreiben','2 Teile',90,'Teil 1: Stellungnahme, Teil 2: Brief/Beschwerde.'],['sprechen','Sprechen','3 Teile',20,'Sprich laut, am besten mit Aufnahme.']];
const done=()=>{try{return JSON.parse(localStorage.getItem('b2_exam_done')||'{}')}catch(e){return{}}};
function home(){const d=done();s.innerHTML=`<h2>📝 Prüfungssimulation ÖSD B2</h2><p>Wie in der echten Prüfung: du wählst ein Modul, die Zeit läuft sofort mit dem echten Limit und es gibt keine Hilfe. Alle vier Module der Reihe nach = komplette Prüfung.</p><div class="grid">`+M.map(m=>`<button class="card" data-m="${m[0]}"><b>${m[1]}</b> · ${m[2]}<br>${m[3]} Min${d[m[0]]?'<br>✔ zuletzt gestartet: '+d[m[0]]:''}<br><small>${m[4]}</small></button>`).join('')+'</div><p class="hint">Tipp: Beginne mit Lesen und gehe dann der Reihe nach vor. Nach dem Ablauf der Zeit abgeben und Ergebnis prüfen.</p>';
 s.onclick=e=>{const c=e.target.closest('[data-m]');if(!c)return;const m=M.find(x=>x[0]===c.dataset.m);if(!confirm(m[1]+' starten? Die Zeit ('+m[3]+' Min) läuft sofort.'))return;
  const dn=done();dn[m[0]]=new Date().toLocaleString('de-AT');try{localStorage.setItem('b2_exam_done',JSON.stringify(dn))}catch(x){}
  go(m[0]);const mo=$('#mode');if(mo){mo.value='p';mo.dispatchEvent(new Event('change'))}const t=$('#tmin');t.value=m[3];t.dispatchEvent(new Event('input'));t.dispatchEvent(new Event('change'));$('#trs').click();setTimeout(()=>$('#tgo').click(),150)}}
home()})();
