/* ÖSD B1/B2 Trainer – App-Logik (tests aus tests.js, Daten aus data.js) */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const norm=(s,cs)=>{s=(s||'').trim().replace(/[-\s]/g,'');return cs?s:s.toLowerCase()};
const pts=(n,tb)=>{for(const [m,p] of tb)if(n>=m)return p;return 0};
const GKEYS=['acct','level'],sk=k=>'osdb2_'+(B1X&&!GKEYS.includes(k)?'b1_':'')+k;
const store={get(k,d){try{const v=localStorage.getItem(sk(k));return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(sk(k),JSON.stringify(v))}catch(e){}window.Sync&&Sync.dirty()}};
const PASSR=B1X?.6:.35;
var HIS=store.get('his',[]);var WR=[];
function logRes(m,t,s,max){HIS.push({m,id:t.id,src:t.src||[t.id],t:t.title,s,max,d:new Date().toISOString().slice(0,10)});HIS=HIS.slice(-80);store.set('his',HIS)}
const head=(ic,mod,dur,aufg,p)=>`<div class="sh"><div class="ic" aria-hidden="true">${ic}</div><div class="nm">Name: <input class="nmi" aria-label="Name"></div></div><div class="sm"><span>${mod}</span><span>${dur}</span></div><div class="ab"><b>${aufg}</b><span>${p}</span></div>`;
const radio=(n,i,t)=>`<label><input type="radio" name="${n}" value="${i}"><span><b>${'ABC'[i]}</b> ${t}</span></label>`;
const MODS=['lesen','hoeren','schreiben','sprechen'];
const MOD=B1X?B1.MOD:{lesen:{ic:'👁',t:'Leseverstehen',d:'90 Minuten',free:'lesen'},hoeren:{ic:'👂',t:'Hörverstehen',d:'ca. 30 Minuten',free:'hören'},schreiben:{ic:'✏️',t:'Schreiben',d:'90 Minuten'},sprechen:{ic:'👄',t:'Sprechen',d:'Aufgaben 1–3'}};
const VIEWS=[['home','Start','🏠'],['lesen','Lesen','👁'],['hoeren','Hören','👂'],['schreiben','Schreiben','✏️'],['sprechen','Sprechen','👄'],['karten','Karten','🃏'],['themen','Wortschatz','📚'],['gram','Grammatik','🧩'],['ergebnis','Fortschritt','📈']];
const DUR=B1X?B1.DUR:{home:90,lesen:90,hoeren:30,schreiben:90,sprechen:15,karten:15,themen:30,gram:30,ergebnis:90};
const main=$('#main');
VIEWS.forEach(([id])=>{const s=document.createElement('section');s.className='sheet';s.id='v-'+id;s.hidden=true;main.appendChild(s)});
$('#nav').innerHTML=VIEWS.map(([id,t,ic])=>`<button data-v="${id}"><span aria-hidden="true">${ic}</span><span>${t}</span></button>`).join('');

/* ============ Sprachausgabe ============ */
const SS=window.speechSynthesis||null;
let tok=0;
function stopSpeak(){tok++;SS&&SS.cancel()}
function speak(lines){stopSpeak();if(!SS||!window.SpeechSynthesisUtterance)return;const my=tok,vs=SS.getVoices().filter(v=>/^de/i.test(v.lang));let i=0;(function nx(){if(my!==tok||i>=lines.length)return;const l=lines[i++],u=new SpeechSynthesisUtterance(l.t);u.lang='de-DE';if(vs.length)u.voice=vs[l.v&&vs[1]?1:0];u.pitch=l.p||1;u.rate=.92;u.onend=nx;u.onerror=nx;SS.speak(u)})()}
function linesOf(s){if(s.tr)return s.tr.split('\n').flatMap(p=>p.split(/(?<=[.!?:“])\s+/)).map(t=>({t}));const f=s.dlg[0][0];return s.dlg.flatMap(([sp,t])=>t.split(/(?<=[.!?])\s+/).map(x=>({t:x,v:sp!==f,p:sp!==f?1.2:.8})))}
let PL={};
function updPlayers(){$$('.player[data-p]').forEach(p=>{const k=p.dataset.p,u=$('#mode').value==='u';p.querySelector('[data-left]').textContent=u?'Übungsmodus: unbegrenzt':`Noch ${PL[k].left}× abspielbar`;p.querySelector('[data-play]').disabled=!u&&PL[k].left<=0})}
document.addEventListener('click',e=>{const p=e.target.closest('.player[data-p]');if(!p)return;const k=p.dataset.p;
 if(e.target.matches('[data-stop]'))return stopSpeak();
 if(e.target.matches('[data-play]')){if(!SS||!window.SpeechSynthesisUtterance){alert('Sprachausgabe ist in dieser Ansicht nicht verfügbar. Öffne die Datei direkt in Chrome oder lies das Transkript nach der Auswertung.');return}
  if($('#mode').value==='p')PL[k].left--;updPlayers();speak(PL[k].lines)}});

/* ============ Hilfen ============ */
const best=(m,t)=>{const h=HIS.filter(x=>x.m===m&&x.id===t.id);if(!h.length)return '';const sc=h.filter(x=>x.s!=null);if(sc.length){const b=sc.reduce((a,x)=>x.s/x.max>a.s/a.max?x:a);return `<span class="badge">Bestwert ${b.s}/${b.max}</span>`}return '<span class="badge">✓ erledigt</span>'};
const passTxt=(s,max)=>{const need=Math.ceil(PASSR*max),ok=s>=need;return `${ok?'bestanden':'noch nicht bestanden'} (Richtwert ≥ ${need} von ${max}${max===20&&!B1X?', wie in der Prüfung: mindestens 7':''}${B1X?', in der Prüfung: 60 %':''})`};
const gaps=(sel,cs)=>{let k=0;$$(sel).forEach(i=>{const a=JSON.parse(i.dataset.a),ok=a.some(x=>norm(x,cs)===norm(i.value,cs));if(!ok)WR.push(`${i.getAttribute('aria-label')}: meine Antwort „${i.value}“, richtig: ${a.join(' / ')}`);i.classList.remove('ok','no');i.classList.add(ok?'ok':'no');i.nextElementSibling.textContent=ok?'':' → '+a.join(' / ');if(ok)k++});return k};
const wordsOf=t=>(t.trim().match(/\S+/g)||[]).length;
const rec=`<div class="player" data-rec><button class="g" data-r>● Aufnehmen</button><audio controls hidden></audio><span class="hint">Sprich laut und höre dich danach selbst an.</span></div>`;

/* ============ Modul-Seiten: Prüfungssaal + Aufgaben-Tabs ============ */
const AUFN=B1X?B1.AUFN:{lesen:{a1:'Text & Multiple Choice',a2:'Überschriften zuordnen',a3:'Rechten Rand rekonstruieren',a4:'Lückentext'},hoeren:{a1:'Richtig / Falsch',a2:'Tabelle ausfüllen'},schreiben:{a1:'E-Mail / Brief mit Notizen',a2:'Stellungnahme'},sprechen:{a1:'Gespräch führen',a2:'Bild beschreiben',a3:'Meinungsaustausch'}};
const AMIN=B1X?B1.AMIN:{lesen:{a1:20,a2:12,a3:15,a4:12},hoeren:{a1:15,a2:12},schreiben:{a1:35,a2:35},sprechen:{a1:7,a2:7,a3:8}};
const EXD=B1X?B1.EXD:{lesen:'Ein zufälliger kompletter Satz mit Aufgabe 1 bis 4, jeweils aus verschiedenen Themen. Dauer: 90 Minuten.',hoeren:'Ein zufälliger Satz mit Aufgabe 1 (Richtig/Falsch) und Aufgabe 2 (Tabelle). Dauer: ca. 30 Minuten.',schreiben:'Aufgabe 1 (Brief mit Notizen) und Aufgabe 2 mit drei Themen zur Wahl. Dauer: 90 Minuten.',sprechen:'Aufgabe 1, 2 und 3 zu verschiedenen Themen. Nimm dich auf und höre dich danach an.'};
const GUIDE=B1X?B1.GUIDE:{
lesen:'<li>Aufgabe 1: اقرأ النص مرة وحدة بسرعة، من بعد اقرأ الأسئلة وقلّب على الجواب فالنص. كل سؤال عندو جواب واحد.</li><li>Aufgabe 2: اقرأ العناوين (Überschriften) الأول، من بعد النصوص. كاين عنوان زايد ما كيناسب حتى نص.</li><li>Aufgabe 3: الكلمة مقطوعة، ركّز على السياق وعلى الغرامير. اكتب حروف قليلة (ماكسيمم 3).</li><li>Aufgabe 4: خاصك تعمر كل الفراغات بكلمة وحدة. ما تخلي حتى فراغ خاوي.</li><li>باش تنجح: خاصك على الأقل 7 من 20 فالقراءة.</li>',
hoeren:'<li>اقرأ الأسئلة قبل ما تسمع (فالامتحان عندك 90 ثانية).</li><li>Aufgabe 1: كتسمع النص جوج مرات. R = صحيح، F = غلط.</li><li>Aufgabe 2: كتسمع غير مرة وحدة، كتب بسرعة الأرقام والاختيارات فالجدول.</li><li>إلا فاتتك معلومة، ما توقفش عليها، كمّل.</li><li>باش تنجح: خاصك على الأقل 7 من 20 فالسمع.</li>',
schreiben:'<li>Aufgabe 1: خاصك تجاوب على <b>كل</b> الملاحظات (Notizen)، مع Anrede و Grußformel، 120 كلمة على الأقل.</li><li>Aufgabe 2: اختار موضوع واحد، عطي رأيك مع السبب، تجربتك، وضعية بلادك.</li><li>استعمل Konnektoren: weil, obwohl, deshalb, einerseits … andererseits.</li><li>عاود قرا النص لتصحيح الأخطاء قبل ما توقف.</li>',
sprechen:'<li>Aufgabe 1: تعرّف على شخص، سول على الغرض ديال السفر وقترح نشاط.</li><li>Aufgabe 2: علاش اخترتي الصورة، وصفها، من بعد الموضوع والرأي ديالك.</li><li>Aufgabe 3: قول رأيك الأول، سول الشريك، دافع بالحجج.</li><li>سجّل صوتك وعاود سمعو باش تلاحظ الأخطاء.</li>'};
const TAB=store.get('tab',{});
const doneIds=()=>new Set(HIS.flatMap(h=>h.src||[h.id]));
const bestOf=id=>{const h=HIS.filter(x=>(x.src||[x.id]).includes(id));if(!h.length)return '';const sc=h.filter(x=>x.s!=null&&(x.src||[]).length<=1);if(sc.length){const b=sc.reduce((a,x)=>x.s/x.max>a.s/a.max?x:a);return `<span class="badge">Bestwert ${b.s}/${b.max}</span>`}return '<span class="badge">✓ gemacht</span>'};
function renderList(m){const M=MOD[m],A=AUF[m],tab=TAB[m]||'exam';
 const tabs=[['exam','🏛 Prüfungssaal'],...A.map((a,i)=>[a,'Aufgabe '+(i+1)]),['free','Eigenes Thema'],['guide','Anleitung']];
 let body='';
 if(tab==='exam')body=`<h2>Prüfungssaal</h2><p>${EXD[m]}</p><p><button class="b" data-exam="${m}">Prüfung starten</button></p>${HIS.filter(h=>h.m===m&&h.id==='exam'&&h.s!=null).slice(-3).map(h=>`<p class="hint">${h.d}: ${h.s} / ${h.max}</p>`).join('')}`;
 else if(tab==='guide')body=`<div class="gram"><h2>Anleitung</h2><ul class="ar">${GUIDE[m]}</ul></div>`;
 else if(tab==='free')body=freeBody(m);
 else{const L=MODELS[m][tab],th=[...new Set(L.map(x=>x.th))];
  body=`<p><b>${AUFN[m][tab]}</b> · ${L.length} Modelle zu ${th.length} Themen</p><div class="tools"><input type="search" id="tq" placeholder="Modell oder Thema suchen …" aria-label="Suche"></div><div class="chips">${th.map(t=>`<button class="chip" data-chip="${t}" aria-pressed="false">${t}</button>`).join('')}</div><div class="grid" id="tg">${L.map(x=>`<button class="card" data-open="${m}:${tab}:${x.id}" data-s="${(x.title+' '+x.th).toLowerCase()}" data-th="${x.th}"><b>${x.title}</b><br><span class="tag">${x.th}</span> ${bestOf(x.id)}</button>`).join('')}</div>`}
 $('#v-'+m).innerHTML=head(M.ic,M.t,M.d,'Prüfungssaal oder Aufgabe wählen','')+`<div class="body"><div class="tabs">${tabs.map(([k,l])=>`<button data-tab="${m}:${k}" aria-pressed="${k===tab}">${l}</button>`).join('')}</div>${body}</div>`}
function freeBody(m){const write=m==='schreiben'||m==='sprechen';return `<h2>Eigenes Thema</h2><p>${write?'Schreibe ein Thema, und du bekommst sofort eine Aufgabe dazu.':'Schreibe ein Thema. Die App kopiert einen fertigen Auftrag, den du bei Claude einfügst, um einen neuen Test zu bekommen. Schick mir den Test, dann baue ich ihn fest in die App ein.'}</p><div class="tools"><input type="search" id="fth" placeholder="z. B. Klimawandel, Mode, Tourismus …" aria-label="Eigenes Thema"><button class="b" data-free="${m}">${write?'Aufgabe erstellen':'Auftrag kopieren'}</button></div>`}
function filterList(){const q=($('#tq')?.value||'').trim().toLowerCase(),ch=$$('.chip[aria-pressed=true]').map(c=>c.dataset.chip);$$('#tg .card').forEach(c=>{c.hidden=!((!q||c.dataset.s.includes(q))&&(!ch.length||ch.includes(c.dataset.th)))})}
document.addEventListener('input',e=>{if(e.target.id==='tq')filterList()});
function single(m,a,x){return {id:x.id,title:x.title,th:x.th,min:AMIN[m][a],[a]:x[a]}}
function composeExam(m){const used=new Set(),done=doneIds(),t={id:'exam',title:'Prüfungssaal',min:DUR[m],src:[]};
 const pick=a=>{const L=MODELS[m][a];if(!L.length)return null;let c=L.filter(x=>!used.has(x.th)&&!done.has(x.id));if(!c.length)c=L.filter(x=>!used.has(x.th));if(!c.length)c=L;const x=c[Math.floor(Math.random()*c.length)];used.add(x.th);t.src.push(x.id);return x};
 if(m==='schreiben'){const x1=pick('a1');if(x1)t.a1=x1.a1;const V={};['A','B','C'].forEach(k=>{const x=pick('a2');if(x)V[k]=x.a2.A});t.a2=V}
 else AUF[m].forEach(a=>{const x=pick(a);if(x)t[a]=x[a]});return t}
function openModel(m,a,id){const x=MODELS[m][a].find(y=>y.id===id);if(!x)return;store.set('last',{ts:Date.now(),m,a,id,title:x.title});openTest(m,single(m,a,x))}
function freeTheme(m){const th=($('#fth').value||'').trim();if(!th){alert('Bitte schreibe zuerst ein Thema.');return}
 if(m==='schreiben')return openTest(m,{id:'custom',title:'Eigenes Thema: '+th,min:45,a2:{A:{t:`Sie haben in einer Zeitung einen Artikel zum Thema „${th}“ gelesen. Dazu gibt es viele unterschiedliche Meinungen.`,q:['Thema: '+th],p:[`Wie denken Sie über das Thema „${th}“? Begründen Sie Ihre persönliche Meinung.`,'Beschreiben Sie eigene Erfahrungen (oder Erfahrungen von Freunden) zum Thema.','Wie ist die Situation in Ihrem Land?']}}});
 if(m==='sprechen')return openTest(m,{id:'custom',title:'Eigenes Thema: '+th,min:15,a2:{pics:[['Dein Bild',`Suche im Internet ein Foto zum Thema „${th}“ oder stelle dir eines vor. Begründe, warum du es gewählt hast, beschreibe es und sprich über das Thema.`,[th]]]},a3:{sit:`Diskutieren Sie mit Ihrem Gesprächspartner das Thema „${th}“. Sagen Sie zuerst Ihre Meinung und fragen Sie dann nach seiner Position. Versuchen Sie, ihn mit Argumenten zu überzeugen.`,op:[]}});
 const txt=m==='lesen'?`Erstelle mir einen Übungstest für das ÖSD-Zertifikat ${LVN}, Leseverstehen, zum Thema „${th}“. Aufgabe 1: ein Text (ca. 250 Wörter) mit 5 Multiple-Choice-Fragen (A, B, C). Aufgabe 4: ein Lückentext (Brief oder E-Mail) mit 10 Lücken, je ein Wort. Gib am Ende den Lösungsschlüssel an.`:`Erstelle mir einen Übungstest für das ÖSD-Zertifikat ${LVN}, Hörverstehen, zum Thema „${th}“. Schreibe ein Transkript (ca. 300 Wörter, Radiosendung oder Gespräch) und 10 Richtig/Falsch-Aussagen mit Lösungen.`;
 (navigator.clipboard||{writeText:()=>Promise.reject()}).writeText(txt).then(()=>alert('Auftrag kopiert. Füge ihn jetzt bei Claude ein.'),()=>prompt('Kopiere diesen Auftrag:',txt))}
function setTimer(min){if(!run){$('#tmin').value=min;left=min*60;showT(left)}}
function openTest(m,t){stopSpeak();$('#v-'+m).innerHTML=`<div class="body" style="padding-bottom:0"><button class="g" data-back="${m}">← Zurück</button> <b style="margin-left:8px">${t.title}</b></div>`+BUILD[m](t)+'';BIND[m](t);setTimer(t.min||DUR[m]);updPlayers();scrollTo(0,0)}
document.addEventListener('click',e=>{
 const o=e.target.closest('[data-open]');if(o){const [m,a,id]=o.dataset.open.split(':');return openModel(m,a,id)}
 const tb=e.target.closest('[data-tab]');if(tb){const [m,k]=tb.dataset.tab.split(':');TAB[m]=k;store.set('tab',TAB);return renderList(m)}
 const ex=e.target.closest('[data-exam]');if(ex)return openTest(ex.dataset.exam,composeExam(ex.dataset.exam));
 const b=e.target.closest('[data-back]');if(b){stopSpeak();renderList(b.dataset.back);scrollTo(0,0);return}
 const f=e.target.closest('[data-free]');if(f)return freeTheme(f.dataset.free);
 const c=e.target.closest('.chip');if(c){c.setAttribute('aria-pressed',c.getAttribute('aria-pressed')!=='true');return filterList()}
 const r=e.target.closest('[data-resume]');if(r){const l=store.get('last',null);if(l){go(l.m);openModel(l.m,l.a,l.id)}return}
 const tr=e.target.closest('[data-trans]');if(tr){const box=tr.closest('.body').querySelector('.news,.tr'),txt=(box?box.innerText:'').slice(0,4500);window.open('https://translate.google.com/?sl=de&tl=ar&op=translate&text='+encodeURIComponent(txt),'_blank','noopener')}});

/* ============ LESEN ============ */
const BUILD={},BIND={};
BUILD.lesen=t=>{let h='',n=0;const hd=(a,p)=>head('👁','Leseverstehen','',a,p+' Punkte').replace('class="sh"','class="sh" style="margin-top:16px"');
 if(t.a1){h+=hd('Aufgabe '+(AUF.lesen.indexOf('a1')+1)+' | Text und Multiple Choice',5)+`<div class="body"><p>Lesen Sie den Text und kreuzen Sie die richtige Antwort (A, B oder C) an.</p><p><button class="g" data-trans>🌐 Übersetzen (Arabisch)</button></p><div class="news">${t.a1.text.map(([k,x])=>k==='h'?`<h3>${x}</h3>`:`<p>${x}</p>`).join('')}</div>`+t.a1.items.map(([q,o],i)=>`<div class="q" data-q="${i}"><b>${i+1} ${q}</b>${o.map((x,j)=>radio('l1_'+i,j,x)).join('')}</div>`).join('')+'</div>'}
 if(t.a2){h+=hd('Aufgabe '+(AUF.lesen.indexOf('a2')+1)+' | Überschriften zuordnen',5)+`<div class="body"><p>Ordnen Sie den Texten (1–5) die passende Überschrift zu. Pro Text passt nur eine Überschrift.</p><div class="heads">${Object.entries(t.a2.heads).map(([k,v])=>`<div><i>${k}</i>${v}</div>`).join('')}</div><div class="txts">${t.a2.texts.map(([s,x],i)=>`<div class="txt"><b>${i+1}</b> ${x}<br><span class="hint">[${s}]</span><br><select id="l2_${i}" aria-label="Überschrift für Text ${i+1}"><option value="">Überschrift …</option>${Object.keys(t.a2.heads).map(k=>`<option>${k}</option>`).join('')}</select><span class="key"></span></div>`).join('')}</div></div>`}
 if(t.a3){h+=hd('Aufgabe 3 | Rechten Rand rekonstruieren',5)+`<div class="body"><p>Ein Zeitungsartikel kam per Fax, der rechte Rand fehlt. Ergänzen Sie die fehlenden Wortteile (maximal 3 Buchstaben).</p><div class="lines">${t.a3.intro||'<div class="ln"><b>Mit ehrenamtlichen Vorleser/innen <u>in</u> die phantastis<u>che</u> Welt der Bücher ein<u>tau-</u>chen</b></div>'}`;
  t.a3.cloze.forEach(([x,a,p])=>{if(a){n++;h+=`<div class="ln"><span class="n">${n}</span><span>${x}</span><input class="gap g3" data-a='${JSON.stringify(a)}' aria-label="Lücke ${n}" autocomplete="off" autocapitalize="off" spellcheck="false">${p||''}<span class="key"></span></div>`}else h+=`<div class="ln"><span class="n"></span><span>${x}</span></div>`});h+='</div></div>'}
 if(t.a4){h+=hd('Aufgabe '+(AUF.lesen.indexOf('a4')+1)+' | Lückentext',5)+`<div class="body"><p>Im Text fehlen Wörter (1–10). Eine Lösung pro Lücke, ein Wort. Keine Lücke darf leer bleiben.</p><div class="news" style="font-family:system-ui;font-size:16.5px;line-height:2.1"><b>${t.a4.head}</b><br>${t.a4.greet}<br>`+t.a4.brief.replace(/\{(\d+)\}/g,(m,k)=>`<input class="gap b4" data-a='${JSON.stringify(t.a4.ans[k-1])}' data-cs="1" aria-label="Lücke ${k}" autocomplete="off" autocapitalize="off" spellcheck="false">(${k})<span class="key"></span>`).replace(/\n/g,'<br>')+`<br><br>${t.a4.sign.replace(/\n/g,'<br>')}</div></div>`}
 return h+`<div class="body"><button class="b" id="evL">Auswerten</button><div class="res" id="rL" role="status"></div></div>`};
BIND.lesen=t=>{$('#evL').onclick=()=>{WR=[];let tot=0,max=0,det=[];
 if(t.a1){let c=0;t.a1.items.forEach(([q,o,a],i)=>{const labs=$$(`[data-q="${i}"] label`),sel=$(`input[name=l1_${i}]:checked`);labs.forEach(l=>l.classList.remove('ok','no'));labs[a].classList.add('ok');if(sel&&+sel.value===a)c++;else{if(sel)labs[+sel.value].classList.add('no');WR.push(`Frage ${i+1} „${q}“: meine Antwort ${sel?'ABC'[+sel.value]:'keine'}, richtig ist ${'ABC'[a]} (${o[a]})`)}});tot+=c;max+=5;det.push(`Aufgabe ${AUF.lesen.indexOf('a1')+1}: ${c}/5`)}
 if(t.a2){let c=0;t.a2.texts.forEach(([,,a],i)=>{const s=$('#l2_'+i);s.classList.remove('ok','no');s.classList.add(s.value===a?'ok':'no');s.nextElementSibling.textContent=s.value===a?'':' → '+a;if(s.value===a)c++});tot+=c;max+=5;det.push(`Aufgabe ${AUF.lesen.indexOf('a2')+1}: ${c}/5`)}
 if(t.a3){const g0=gaps('.g3',false),n3=$$('.g3').length,g=Math.round(g0*20/n3),p=pts(g,[[18,5],[15,4],[11,3],[7,2],[4,1]]);tot+=p;max+=5;det.push(`Aufgabe 3: ${g0}/${n3} Lücken → ${p} P.`)}
 if(t.a4){const g=gaps('.b4',true),n4=$$('.b4').length,g10=Math.round(g*10/n4),p=pts(g10,[[9,5],[7,4],[5,3],[3,2],[1,1]]);tot+=p;max+=5;det.push(`Aufgabe ${AUF.lesen.indexOf('a4')+1}: ${g}/${n4} Lücken → ${p} P.`)}
 const ok=tot>=Math.ceil(PASSR*max),e=$('#rL');e.className='res show '+(ok?'pass':'fail');
 e.innerHTML=`<b>Lesen: ${tot} / ${max} Punkte – ${passTxt(tot,max)}</b><br>${det.join(' · ')}<br><span class="hint">Grün = richtig. Neben jeder falschen Antwort steht die Lösung.</span>${errBtn('Lesen',t)}`;logRes('lesen',t,tot,max)}};

/* ============ HÖREN ============ */
BUILD.hoeren=t=>{PL={};
 const tr=s=>s.tr?s.tr.split('\n').map(p=>`<p>${p}</p>`).join(''):s.dlg.map(([sp,x])=>`<p><b>${s.names[sp]}:</b> ${x}</p>`).join('');
 const bar=k=>`<div class="player" data-p="${k}"><button class="b" data-play>▶ Abspielen</button><button class="g" data-stop>■ Stopp</button><span class="hint" data-left></span></div>${SS?'':'<p class="hint">Diese Ansicht unterstützt keine Sprachausgabe. Öffne die Datei direkt in Chrome.</p>'}`;
 const trb=(id,s)=>`<details class="tr" id="${id}" hidden><summary>Transkript anzeigen</summary><p><button class="g" data-trans>🌐 Übersetzen (Arabisch)</button></p>${tr(s)}</details>`;
 let h='';
 if(t.a1){const a=t.a1,secs=new Set(a.items.map(x=>x[1])).size>1;PL[1]={left:a.plays||2,lines:linesOf(a)};
  h+=head('👂','Hörverstehen','','Aufgabe 1 | Richtig oder falsch',a.items.length+' Punkte')+`<div class="body"><p><i>Lesen Sie die Aussagen zuerst gut durch.</i> Sie hören den Text <b>${(a.plays||2)===1?'ein Mal':'zwei Mal'}</b>. Kreuzen Sie R (richtig) oder F (falsch) an.</p>${bar(1)}<table class="rf"><tr><th>Aussage</th><th>R</th><th>F</th></tr>`;
  let sec=0;a.items.forEach(([x,s],i)=>{if(secs&&s!==sec){sec=s;h+=`<tr><th colspan="3">Abschnitt ${s}</th></tr>`}h+=`<tr data-h="${i}"><td>${i+1}. ${x}</td><td><input type="radio" name="h1_${i}" value="1" aria-label="richtig"></td><td><input type="radio" name="h1_${i}" value="0" aria-label="falsch"></td></tr>`});
  h+=`</table>${trb('tr1',a)}</div>`}
 if(t.a2){const a=t.a2;PL[2]={left:a.plays||1,lines:linesOf(a)};
  h+=head('👂','Hörverstehen','','Aufgabe 2 | Tabelle ausfüllen','10 Punkte').replace('class="sh"',t.a1?'class="sh" style="margin-top:16px"':'class="sh"')+`<div class="body"><p>Sie hören ein Gespräch zwischen zwei Personen. Tragen Sie die Informationen zu den drei Möglichkeiten in die Tabelle ein. Sie hören den Text nur <b>ein Mal</b>!</p>${bar(2)}<div class="tbl"><table id="ht"><tr><th></th>${a.hot.map(x=>`<th>${x}</th>`).join('')}</tr>`;
  a.rows.forEach((r,ri)=>{h+=`<tr><th>${r.k}</th>`;a.hot.forEach((_,hi)=>{h+='<td>';
   if(r.t==='radio')h+=r.o.map((o,oi)=>`<label><input type="radio" name="h2_${ri}_${hi}" value="${oi}"> ${o}</label>`).join('');
   if(r.t==='num')h+=`<input type="text" inputmode="decimal" name="h2_${ri}_${hi}" aria-label="${r.k}"> ${r.u||''}`;
   if(r.t==='chk')h+=r.o.map((o,oi)=>`<label><input type="checkbox" name="h2_${ri}_${hi}_${oi}"> ${o}</label>`).join('');
   if(r.t==='erm')h+=`ab <input type="text" inputmode="numeric" name="h2_${ri}_${hi}_0" aria-label="ab Personen"> Personen<br><input type="text" inputmode="numeric" name="h2_${ri}_${hi}_1" aria-label="Prozent"> %`;h+='</td>'});h+='</tr>'});
  h+=`</table></div>${trb('tr2',a)}</div>`}
 return h+`<div class="body"><button class="b" id="evH">Auswerten</button><div class="res" id="rH" role="status"></div></div>`};
BIND.hoeren=t=>{$('#evH').onclick=()=>{stopSpeak();WR=[];let tot=0,max=0,det=[];
 if(t.a1){let a1=0;max+=t.a1.items.length;
  t.a1.items.forEach(([,,ans],i)=>{const row=$(`[data-h="${i}"]`),sel=$(`input[name=h1_${i}]:checked`);row.classList.remove('ok','no');if(sel&&(sel.value==='1')===ans){a1++;row.classList.add('ok')}else{row.classList.add('no');WR.push(`Aussage ${i+1} „${t.a1.items[i][0]}“: meine Antwort ${sel?(sel.value==='1'?'R':'F'):'keine'}, richtig ist ${ans?'R':'F'}`);if(!row.querySelector('.key'))row.firstChild.insertAdjacentHTML('beforeend',`<span class="key"> → ${ans?'R':'F'}</span>`)}});
  tot+=a1;det.push(`Aufgabe 1: ${a1}/${t.a1.items.length}`);$('#tr1').hidden=false}
 if(t.a2){const a=t.a2;let c=0,n=0;max+=10;const num=s=>parseFloat(String(s).replace(',','.')),mark=(el,ok,key)=>{n++;const w=el.closest('label')||el;w.classList.add('cell');w.classList.remove('ok','no');w.classList.add(ok?'ok':'no');if(!ok&&!w.querySelector('.key'))w.insertAdjacentHTML('beforeend',`<span class="key"> ${key}</span>`);if(ok)c++};
  a.rows.forEach((r,ri)=>a.hot.forEach((_,hi)=>{
   if(r.t==='radio'){n++;const sel=$(`input[name=h2_${ri}_${hi}]:checked`),ok=sel&&+sel.value===r.a[hi],box=$(`input[name=h2_${ri}_${hi}]`).closest('td');box.classList.remove('ok','no');box.classList.add(ok?'ok':'no');if(ok)c++;else if(!box.querySelector('.key'))box.insertAdjacentHTML('beforeend',`<div class="key">→ ${r.o[r.a[hi]]}</div>`)}
   if(r.t==='num'){const i=$(`input[name=h2_${ri}_${hi}]`);mark(i,num(i.value)===num(r.a[hi]),'→ '+r.a[hi])}
   if(r.t==='chk')r.o.forEach((o,oi)=>{const i=$(`input[name=h2_${ri}_${hi}_${oi}]`),ex=!!r.a[hi][oi];mark(i,i.checked===ex,ex?'(✓ nötig)':'(nicht ankreuzen)')});
   if(r.t==='erm')[0,1].forEach(j=>{const i=$(`input[name=h2_${ri}_${hi}_${j}]`);mark(i,num(i.value)===r.a[hi][j],'→ '+r.a[hi][j])})}));
  const sc=Math.round(c*45/n),p=pts(sc,[[43,10],[40,9],[37,8],[33,7],[29,6],[24,5],[19,4],[14,3],[9,2],[4,1]]);tot+=p;det.push(`Aufgabe 2: ${c}/${n} Einträge → ${p} P.`);$('#tr2').hidden=false}
 const ok=tot>=Math.ceil(PASSR*max),e=$('#rH');e.className='res show '+(ok?'pass':'fail');
 e.innerHTML=`<b>Hören: ${tot} / ${max} Punkte – ${passTxt(tot,max)}</b><br>${det.join(' · ')}<br><span class="hint">Das Transkript ist jetzt geöffnet.</span>${errBtn('Hören',t)}`;logRes('hoeren',t,tot,max)}};

/* ============ SCHREIBEN ============ */
const MINW=B1X?80:120;
const A2chk=B1X?B1.A2chk:[['Meinung klar genannt',t=>/meiner meinung|ich finde|ich denke|ich glaube|meiner ansicht|ich bin der ansicht/i.test(t)],['Begründung (weil, denn, deshalb …)',t=>/weil|denn|deshalb|darum|deswegen/i.test(t)],['Eigene Erfahrung / Beispiel',t=>/ich habe|ich war|mein freund|meine freundin|bei mir|erfahrung|zum beispiel/i.test(t)],['Situation im eigenen Land',t=>/in meinem land|bei uns|marokko/i.test(t)],['Gegenargument (einerseits/andererseits, aber)',t=>/einerseits|andererseits|jedoch|allerdings|dennoch|aber/i.test(t)],['Schluss (zusammenfassend, abschließend …)',t=>/zusammenfassend|abschließend|insgesamt|alles in allem|fazit|zum schluss/i.test(t)]];
const writer=(id,chk)=>`<textarea class="w" id="${id}" aria-label="Dein Text" spellcheck="false"></textarea><div class="wc"><span id="${id}c">0 Wörter (mindestens ${MINW})</span><span><button class="g" data-fix="${id}">🤖 Mit Claude korrigieren</button> <button class="g" data-copy="${id}">Text kopieren</button></span></div><ul class="chk" id="${id}l">${chk.map(c=>`<li>${c[0]}</li>`).join('')}</ul><p class="hint">Automatische Hinweise nach Stichwörtern, keine Bewertung. Lass den Text zusätzlich korrigieren.</p>`;
BUILD.schreiben=t=>{let h='';
 if(t.a1)h+=head('✏️','Schreiben','','Aufgabe 1 | '+t.a1.kind,B1X?'20 Punkte':'15 Punkte')+`<div class="body"><p><b>Situation:</b> ${t.a1.sit}</p>${t.a1.ad}${writer('w1',[[B1X?'Anrede (Liebe/Lieber … oder Sehr geehrte …)':'Anrede (Sehr geehrte/r …)'],[B1X?'Grußformel (Viele Grüße / Mit freundlichen Grüßen)':'Grußformel (Mit freundlichen Grüßen)'],...t.a1.checks.map(c=>[c[0]])])}</div>`;
 if(t.a2){const ks=Object.keys(t.a2);h+=head('✏️','Schreiben','',(t.a1?'Aufgabe 2 | ':'')+(B1X?'Forumsbeitrag':'Stellungnahme'),'15 Punkte').replace('class="sh"',t.a1?'class="sh" style="margin-top:16px"':'class="sh"')+`<div class="body"><p>${ks.length>1?'Wählen Sie eine Aufgabenstellung. ':''}Schreiben Sie mindestens ${MINW} Wörter.</p>${ks.length>1?`<div class="tabs" id="w2t">${ks.map((k,i)=>`<button data-w2="${k}" aria-pressed="${i===0}">Variante ${k}</button>`).join('')}</div>`:''}<div id="w2p"></div>${writer('w2',A2chk)}</div>`}
 h+=`<div class="body"><h2>Redemittel</h2>`+Object.entries(REDE).filter(([k])=>!k.startsWith('Sprechen')).map(([k,v])=>`<details><summary>${k}</summary><ul>${v.map(x=>`<li>${x}</li>`).join('')}</ul></details>`).join('')+`<h2>Vorlagen (Gerüst)</h2>`+Object.entries(TEMPL).map(([k,v])=>`<details><summary>${k}</summary><div class="tpl">${v}</div></details>`).join('')+`<p><button class="b" id="wdone">Als erledigt speichern</button></p></div>`;return h};
BIND.schreiben=t=>{
 const bind=(id,chk)=>{const ta=$('#'+id),key='draft_'+t.id+'_'+id,sv=store.get(key,'');const upd=()=>{const n=wordsOf(ta.value);$('#'+id+'c').textContent=`${n} Wörter (mindestens ${MINW})${n>=MINW?' ✓':''}`;$$('#'+id+'l li').forEach((li,i)=>li.classList.toggle('y',chk[i][1](ta.value)))};ta.addEventListener('input',()=>{upd();store.set(key,ta.value)});if(sv){ta.value=sv;upd()}};
 if(t.a2){const show=k=>{const v=t.a2[k];$$('#w2t button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.w2===k));$('#w2p').innerHTML=`<p>${v.t}</p><div class="bubbles">${v.q.map(x=>`<div>${x}</div>`).join('')}</div><p>Schreiben Sie nun Ihre Meinung dazu und gehen Sie auf die folgenden Punkte ein:</p><ol>${v.p.map(x=>`<li>${x}</li>`).join('')}</ol>`;$('#w2').dataset.var=k};
  show(Object.keys(t.a2)[0]);$$('#w2t button').forEach(b=>b.onclick=()=>show(b.dataset.w2));bind('w2',A2chk)}
 if(t.a1)bind('w1',[[0,x=>/sehr geehrt|guten tag|hallo|liebe/i.test(x)],[0,x=>/freundlichen gr|freundliche gr|beste gr|viele gr/i.test(x)],...t.a1.checks.map(c=>[0,x=>new RegExp(c[1],'i').test(x)])]);
 $('#wdone').onclick=e=>{logRes('schreiben',t,null,null);e.target.textContent='Gespeichert ✓'}};
document.addEventListener('click',e=>{const c=e.target.closest('[data-copy]');if(!c)return;const ta=$('#'+c.dataset.copy);(navigator.clipboard||{writeText:()=>Promise.reject()}).writeText('Bitte korrigiere meinen ÖSD-'+LVN+'-Text. Zeige meine Fehler, gib die korrigierte Version und bewerte nach Inhalt, Textaufbau, Wortschatz und Grammatik.\n\n'+ta.value).then(()=>{c.textContent='Kopiert ✓';setTimeout(()=>c.textContent='Text für Korrektur kopieren',1800)},()=>alert('Kopieren nicht möglich. Markiere den Text und kopiere ihn von Hand.'))});

/* ============ SPRECHEN ============ */
const SPL=B1X?B1.SPL:['Aufgabe 1 | Jemanden kennenlernen und beraten','Aufgabe 2 | Ein Bild beschreiben und interpretieren','Aufgabe 3 | Meinungsaustausch'];
BUILD.sprechen=t=>{let h='';
 if(t.a1)h+=head('👄','Sprechen','',SPL[0],'5 Punkte')+`<div class="body"><p><b>Situation:</b> ${t.a1.sit}</p><ol>${t.a1.pts.map(x=>`<li>${x}</li>`).join('')}</ol>${rec}</div>`;
 if(t.a2)h+=head('👄','Sprechen','',SPL[1],'5 Punkte').replace('class="sh"',t.a1?'class="sh" style="margin-top:16px"':'class="sh"')+`<div class="body"><p>${B1X?'Wählen Sie ein Bild und präsentieren Sie das Thema: (1) Einleitung, (2) Bild beschreiben, (3) eigene Erfahrungen, (4) Meinung, (5) Schluss und Dank. Sprechen Sie 2–3 Minuten.':'Wählen Sie ein Bild und (1) begründen Sie, warum Sie es gewählt haben, (2) beschreiben Sie es, (3) sprechen Sie über das Thema: Was sagt das Bild aus? Äußern Sie Ihre Meinung und Vermutung.'}</p><div class="pics">${t.a2.pics.map(([a,b,c])=>`<div class="pic"><b>${a}</b><br>${b}<br>${c.map(x=>`<span class="tag">${x}</span>`).join('')}</div>`).join('')}</div><p class="hint">Die Fotos sind hier als Beschreibung eingefügt.</p>${rec}</div>`;
 if(t.a3)h+=head('👄','Sprechen','',SPL[2],'5 Punkte').replace('class="sh"',(t.a1||t.a2)?'class="sh" style="margin-top:16px"':'class="sh"')+`<div class="body"><p><b>Situation:</b> ${t.a3.sit}</p>${t.a3.op.length?`<div class="txts">${t.a3.op.map(o=>`<div class="txt"><b>${o.n}</b><br>${o.x}</div>`).join('')}</div>`:''}${rec}</div>`;
 return h+`<div class="body"><details><summary>Redemittel für die Diskussion</summary><ul>${REDE['Sprechen – Diskussion'].map(x=>`<li>${x}</li>`).join('')}</ul></details><p><button class="b" id="sdone">Als erledigt speichern</button></p></div>`};
BIND.sprechen=t=>{$('#sdone').onclick=e=>{logRes('sprechen',t,null,null);e.target.textContent='Gespeichert ✓'}};
const recs=new WeakMap();
document.addEventListener('click',async e=>{const b=e.target.closest('[data-r]');if(!b)return;const box=b.closest('[data-rec]'),a=box.querySelector('audio');if(recs.has(b)){recs.get(b).stop();return}
 try{const st=await navigator.mediaDevices.getUserMedia({audio:true}),mr=new MediaRecorder(st),ch=[];recs.set(b,mr);b.textContent='■ Stopp';mr.ondataavailable=ev=>ch.push(ev.data);mr.onstop=()=>{st.getTracks().forEach(x=>x.stop());a.src=URL.createObjectURL(new Blob(ch,{type:mr.mimeType}));a.hidden=false;recs.delete(b);b.textContent='● Neu aufnehmen'};mr.start()}
 catch(err){alert('Kein Zugriff auf das Mikrofon. Erlaube den Zugriff im Browser, um dich aufzunehmen.')}});

/* ============ Start, Karten, Wortschatz, Grammatik, Fortschritt ============ */
let CW=store.get('cw',[]),ALLW=[];
function rebuildW(){ALLW=TH.flatMap(([e,t,w,v])=>v.map(([d,a])=>({d,a,t:e+' '+t}))).concat(CW.map(w=>({d:w.d,a:w.a,t:'⭐ Meine Wörter'})))}rebuildW();
let KD=store.get('kd',{});
const doneN=m=>new Set(HIS.filter(h=>h.m===m).map(h=>h.id)).size;
const ring=(v,max,l)=>`<div class="ring" style="--p:${Math.round(v/max*100)}"><div><b>${v}/${max}</b><span>${l}</span></div></div>`;
const PLANNED=B1X?B1.PLANNED:['Kleidung & Mode','Politik & Demokratie','Wirtschaft & Geld','Wissenschaft & Forschung','Tiere & Haustiere','Feste & Traditionen','Gleichberechtigung','Jugend & Generationen','Klima & Wetter','Sicherheit & Kriminalität','Tourismus & Gastronomie','Alter & Pflege','Sprachen lernen'];
function modStats(m){const d=doneIds();let n=0,t=0;AUF[m].forEach(a=>MODELS[m][a].forEach(x=>{t++;if(d.has(x.id))n++}));return [n,t]}
function renderHome(){const known=ALLW.filter(w=>(KD[w.d]||0)>=3).length,l=store.get('last',null),u=window.Acct&&Acct.user;
 $('#v-home').innerHTML=`<div class="body"><div class="hero"><h1>ÖSD ${LVN} – dein Prüfungstrainer</h1><p><button class="g" data-a="lvl">🎯 Niveau wechseln (aktuell ${LVN})</button></p><p>${u?'Angemeldet als '+u.email+'. Dein Fortschritt wird gespeichert.':'Du bist als Gast hier. Mit einem Konto kannst du auf jedem Gerät weitermachen.'}</p></div>
 ${l?`<button class="card" data-resume="1"><b>▶ Weitermachen</b><br><span class="hint">Zuletzt: ${l.title}</span></button>`:''}
 <h2>Dein Stand (gemachte Modelle)</h2><div class="rings">${MODS.map(m=>{const [n,t]=modStats(m);return ring(n,t,MOD[m].t)}).join('')}${ring(known,ALLW.length,'Wörter gelernt')}</div>
 <h2>Prüfungsteile</h2><div class="grid">${MODS.map(m=>`<button class="card" data-go="${m}"><b>${MOD[m].ic} ${MOD[m].t}</b><br>${AUF[m].reduce((s,a)=>s+MODELS[m][a].length,0)} Modelle · ${MOD[m].d}</button>`).join('')}</div>
 <h2>Lernen</h2><div class="grid"><button class="card" data-go="karten"><b>🃏 Karteikarten</b><br>${ALLW.length} Wörter</button><button class="card" data-go="themen"><b>📚 Wortschatz</b><br>${TH.length} Themenbereiche</button><button class="card" data-go="gram"><b>🧩 Grammatik</b><br>${GRAM.length} ${LVN}-Themen mit Übungen</button></div>
 <h2>Am Prüfungstag</h2><ul><li>Ausweis und Anmeldebestätigung mitnehmen.</li>${B1X?'<li>Schreiben: Anrede, Grußformel, mindestens 80 Wörter, auf alle Punkte eingehen.</li><li>Hören: Aufgaben vorher lesen, nicht an einer Stelle hängen bleiben.</li><li>Lesen: keine Aufgabe leer lassen. Zum Bestehen brauchst du in jedem Modul mindestens 60 %.</li>':'<li>Schreiben: Anrede, Grußformel, mindestens 120 Wörter, auf alle Notizen eingehen.</li><li>Hören: Aufgaben vorher lesen (90 Sekunden), nicht an einer Lücke hängen bleiben.</li><li>Lesen: keine Lücke leer lassen. Mindestens 7 von 20 Punkten in Lesen und in Hören.</li>'}</ul></div>`}
$('#v-karten').innerHTML=`<div class="sh"><div class="ic" aria-hidden="true">🃏</div></div><div class="body"><h1>Karteikarten</h1><p>Tippe auf die Karte, um die Übersetzung zu sehen. Was du weißt, kommt seltener wieder.</p><div class="tools"><select id="kth" class="g" aria-label="Thema"><option value="">Alle Themen</option>${TH.map(([e,t])=>`<option value="${e} ${t}">${e} ${t}</option>`).join('')}<option value="⭐ Meine Wörter">⭐ Meine Wörter</option></select><span class="hint" id="kst"></span></div><div class="fc"><div class="fcard" id="kc" role="button" tabindex="0" aria-label="Karte umdrehen"></div><div class="fbtn"><button class="g" id="ks">🔊 Aussprache</button><button class="g" id="kn">Nochmal</button><button class="b" id="ky">Gewusst</button></div></div></div>`;
let cur=null,flip=false;
const pool=()=>{const t=$('#kth').value;return ALLW.filter(w=>!t||w.t===t)};
function nextCard(){const p=pool();if(!p.length){$('#kc').innerHTML='<div>Noch keine Wörter hier. Tippe beim Lesen auf ein Wort und speichere es mit ➕.</div>';cur=null;$('#kst').textContent='0 / 0 gelernt';return}const mb=Math.min(...p.map(w=>KD[w.d]||0)),c=p.filter(w=>(KD[w.d]||0)===mb&&w!==cur);cur=c.length?c[Math.floor(Math.random()*c.length)]:p[Math.floor(Math.random()*p.length)];flip=false;drawCard()}
function drawCard(){$('#kc').innerHTML=flip?`<div><div class="ar">${cur.a}</div><small>${cur.d}</small></div>`:`<div>${cur.d}<small>Tippen zum Umdrehen</small></div>`;const p=pool();$('#kst').textContent=`${p.filter(w=>(KD[w.d]||0)>=3).length} / ${p.length} gelernt`}
$('#kc').onclick=()=>{if(!cur)return;flip=!flip;drawCard()};$('#kc').onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();flip=!flip;drawCard()}};
$('#ky').onclick=()=>{if(!cur)return;KD[cur.d]=Math.min((KD[cur.d]||0)+1,4);store.set('kd',KD);nextCard()};$('#kn').onclick=()=>{if(!cur)return;KD[cur.d]=0;store.set('kd',KD);nextCard()};$('#kth').onchange=nextCard;
$('#ks').onclick=()=>{if(!cur)return;if(!SS||!window.SpeechSynthesisUtterance){alert('Sprachausgabe ist in dieser Ansicht nicht verfügbar. Öffne die Datei direkt in Chrome.');return}SS.cancel();const u=new SpeechSynthesisUtterance(cur.d.replace(/^(der|die|das) /,''));u.lang='de-DE';SS.speak(u)};nextCard();

$('#v-themen').innerHTML=`<div class="sh"><div class="ic" aria-hidden="true">📚</div></div><div class="body"><h1>Alle Themen für ÖSD ${LVN}</h1><p>Wortschatz mit Artikel und Übersetzung, zwei Fragen zum Üben und ein Mustersatz. Tippe auf die arabische Spalte, um eine Übersetzung kurz aufzudecken.</p><div class="tools"><input type="search" id="thq" placeholder="Thema oder Wort suchen …" aria-label="Suche"><button class="g" id="thar">Übersetzung verstecken</button><button class="g" id="thall">Alle öffnen</button></div><div id="thl">`+TH.map(([e,t,w,v,q,m])=>`<details class="th" data-s="${(t+' '+v.map(x=>x.join(' ')).join(' ')).toLowerCase()}"><summary>${e} ${t}</summary><p class="wh">Kommt vor in: ${w}</p><table class="voc">${v.map(([d,a])=>`<tr><td>${d}</td><td class="ar">${a}</td></tr>`).join('')}</table><h2>Übe sprechen und schreiben</h2><ul class="fq">${q.map(x=>`<li>${x}</li>`).join('')}</ul><div class="mini"><b>Mustersatz:</b> ${m}</div></details>`).join('')+`</div></div>`;
$('#thq').oninput=e=>{const q=e.target.value.trim().toLowerCase();$$('#thl details').forEach(d=>d.hidden=q&&!d.dataset.s.includes(q))};
$('#thar').onclick=e=>{const b=$('#v-themen');b.classList.toggle('hidear');e.target.textContent=b.classList.contains('hidear')?'Übersetzung zeigen':'Übersetzung verstecken'};
$('#thall').onclick=e=>{const o=e.target.dataset.o!=='1';$$('#thl details').forEach(d=>d.open=o);e.target.dataset.o=o?'1':'0';e.target.textContent=o?'Alle schließen':'Alle öffnen'};
$('#v-themen').addEventListener('click',e=>{const c=e.target.closest('td.ar');c&&c.classList.toggle('show')});

$('#v-gram').innerHTML=`<div class="sh"><div class="ic" aria-hidden="true">🧩</div></div><div class="body gram"><h1>Grammatik für ${LVN}</h1><p>Erklärung auf Darija, Beispiele auf Deutsch. Probiere die Übung zuerst selbst und tippe dann auf „Lösung“.</p>`+GRAM.map(([t,ar,fm,ex,ue])=>`<details><summary>${t}</summary><p class="ar">${ar}</p><div class="fm">${fm}</div><ul>${ex.map(x=>`<li>${x}</li>`).join('')}</ul><b>Übung</b>${ue.map(([q,a])=>`<div class="ex2"><span>${q}</span><button class="g" data-sol>Lösung</button><span class="sol" hidden>${a}</span></div>`).join('')}</details>`).join('')+'</div>';
$('#v-gram').addEventListener('click',e=>{const b=e.target.closest('[data-sol]');if(b){const s=b.nextElementSibling;s.hidden=!s.hidden;b.textContent=s.hidden?'Lösung':'Verbergen'}});

function renderErg(){const l=HIS.slice().reverse().slice(0,30),cov=coverage(),cols=Object.keys(AUF).flatMap(m=>AUF[m].map((a,i)=>[m,a,m[0].toUpperCase()+(i+1)]));let miss=0;
 const rows=THEMES.map(t=>`<tr><td>${t}</td>${cols.map(([m,a])=>{const n=cov[t][m+'.'+a]||0;if(!n)miss++;return `<td class="${n?'ok':'no'}">${n||'–'}</td>`}).join('')}</tr>`).join('');
 $('#v-ergebnis').innerHTML=`<div class="sh"><div class="ic" aria-hidden="true">📈</div></div><div class="body"><h1>Fortschritt</h1><div class="rings">${MODS.map(m=>{const [n,t]=modStats(m);return ring(n,t,MOD[m].t)}).join('')}</div><h2>Verlauf</h2>`+(l.length?'<ul class="hist">'+l.map(h=>`<li><span>${h.d} · ${MOD[h.m].t} · ${h.t}</span>${h.s==null?'<b>erledigt</b>':`<b class="${h.s>=Math.ceil(PASSR*h.max)?'ok':'no'}" style="padding:0 8px;border-radius:8px">${h.s} / ${h.max}</b>`}</li>`).join('')+'</ul>':'<p class="hint">Noch kein Test gemacht.</p>')+
 `<h2>Themen-Abdeckung</h2><p class="hint">Anzahl der Modelle pro Thema und Aufgabe (L = Lesen, H = Hören, S = Schreiben, P = Sprechen). Eine Lücke (–) bedeutet: hier fehlt noch ein Modell. Derzeit ${THEMES.length} Themen, ${miss} Lücken.</p><div class="tbl"><table class="cov"><tr><th>Thema</th>${cols.map(c=>`<th>${c[2]}</th>`).join('')}</tr>${rows}</table></div>${PLANNED.length?`<p class="hint"><b>Geplant (noch in Arbeit, Ziel: 30 Themen):</b> ${PLANNED.join(', ')}.</p>`:''}</div>`}
/* ============ Lesehilfe: Wort/Satz antippen, übersetzen, erklären lassen ============ */
const LHSEL='.news,.txt,.tr,.ad,.lines,.bubbles,.pic,.pics,.mini,.tpl,.q>b,.heads,.rf td:first-child,.gram,.th,.fq,.ab';
let PROMPT='',LH={text:'',blk:null,tok:0};
function toast(t){let e=$('#toast');if(!e){e=document.createElement('div');e.id='toast';e.setAttribute('role','status');document.body.appendChild(e)}e.textContent=t;e.className='show';clearTimeout(toast.t);toast.t=setTimeout(()=>{e.className=''},3800)}
function askClaude(p){(navigator.clipboard||{writeText:()=>Promise.reject()}).writeText(p).catch(()=>{});window.open('https://claude.ai/new'+(p.length<3000?'?q='+encodeURIComponent(p):''),'_blank','noopener');toast(p.length<3000?'Frage an Claude geöffnet (auch kopiert).':'Auftrag kopiert. Füge ihn bei Claude ein.')}
function errBtn(kind,t){if(!WR.length)return '';let ctx='';if(kind==='Lesen')ctx=t.a1?t.a1.text.map(x=>x[1]).join('\n'):(t.a4?t.a4.brief:'');if(kind==='Hören'){const a=t.a1||t.a2;ctx=a?(a.tr||a.dlg.map(x=>x[0]+': '+x[1]).join('\n')):''}
 PROMPT=`Ich übe für die ÖSD-${LVN}-Prüfung (${kind}). Erkläre mir bitte auf Darija (marokkanisches Arabisch, arabische Schrift), warum meine Antworten falsch waren und woran ich die richtige Lösung im Text erkenne.\n\nMeine Fehler:\n${WR.join('\n')}\n\nText:\n${ctx.slice(0,2500)}`;return '<p><button class="g" data-ask-err="1">🤖 Fehler mit Claude erklären (Darija)</button></p>'}
function wordAt(x,y){let r=document.caretRangeFromPoint?document.caretRangeFromPoint(x,y):null;if(!r&&document.caretPositionFromPoint){const p=document.caretPositionFromPoint(x,y);if(p){r=document.createRange();r.setStart(p.offsetNode,p.offset);r.collapse(true)}}
 if(!r||r.startContainer.nodeType!==3)return null;const tx=r.startContainer.textContent,L=/[A-Za-zÄÖÜäöüß-]/;let a=r.startOffset,b=a;while(a>0&&L.test(tx[a-1]))a--;while(b<tx.length&&L.test(tx[b]))b++;if(b-a<2)return null;const w=document.createRange();w.setStart(r.startContainer,a);w.setEnd(r.startContainer,b);return w}
function sentenceOf(txt,blk){const full=(blk?blk.textContent:'').replace(/\s+/g,' '),i=full.indexOf(txt);if(i<0)return txt;let a=i,b=i+txt.length;while(a>0&&!/[.!?]/.test(full[a-1]))a--;while(b<full.length&&!/[.!?]/.test(full[b]))b++;return full.slice(a,b+1).trim().slice(0,400)}
async function lhShow(txt,blk){txt=txt.trim().replace(/\s+/g,' ');if(!txt||txt.length>400)return;if(LH.text===txt&&!$('#lh').hidden)return;LH={text:txt,blk,tok:LH.tok+1};const my=LH.tok;$('#lhs').textContent=txt;$('#lha').value='…';$('#lha').placeholder='';$('#lh').hidden=false;
 try{const r=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(txt.slice(0,450))+'&langpair=de|ar'),j=await r.json();if(my!==LH.tok)return;const tt=(j.responseData&&j.responseData.translatedText)||'';$('#lha').value=/MYMEMORY|QUERY LENGTH/i.test(tt)?'':tt;if(!$('#lha').value)$('#lha').placeholder='Keine Übersetzung gefunden. Nutze 🌐 oder 🤖.'}catch(e){if(my===LH.tok){$('#lha').value='';$('#lha').placeholder='Übersetzung nicht verfügbar (offline?). Nutze 🌐 oder 🤖.'}}}
const lhOn=()=>$('#lhon')&&$('#lhon').checked;
document.addEventListener('click',e=>{if(!lhOn())return;const t=e.target;if(t.closest('input,button,select,textarea,summary,label,a,#lh'))return;if(!t.closest(LHSEL))return;if(String(getSelection()))return;const r=wordAt(e.clientX,e.clientY);if(r){const s=getSelection();s.removeAllRanges();s.addRange(r)}});
let lhT=0;document.addEventListener('selectionchange',()=>{clearTimeout(lhT);lhT=setTimeout(()=>{if(!lhOn())return;const s=getSelection(),txt=String(s).trim();if(!txt||!s.rangeCount)return;let n=s.anchorNode;n=n&&(n.nodeType===3?n.parentElement:n);if(!n||n.closest('#lh'))return;const blk=n.closest(LHSEL);if(blk)lhShow(txt,blk)},450)});
document.addEventListener('click',e=>{
 if(e.target.closest('[data-ask-err]'))return askClaude(PROMPT);
 const f=e.target.closest('[data-fix]');if(f){const ta=$('#'+f.dataset.fix);if(!ta.value.trim())return toast('Schreibe zuerst einen Text.');return askClaude('Bitte korrigiere meinen ÖSD-'+LVN+'-Text. Zeige meine Fehler und erkläre sie auf Darija (arabische Schrift). Gib danach die korrigierte Version und bewerte nach Inhalt, Textaufbau, Wortschatz und Grammatik.\n\n'+ta.value)}
 const b=e.target.closest('[data-lh]');if(!b)return;const a=b.dataset.lh,tx=LH.text;
 if(a==='x'){$('#lh').hidden=true;getSelection().removeAllRanges();LH.text=''}
 if(a==='say'){if(!SS||!window.SpeechSynthesisUtterance)return toast('Sprachausgabe nicht verfügbar. Öffne die Datei in Chrome.');SS.cancel();const u=new SpeechSynthesisUtterance(tx);u.lang='de-DE';u.rate=.9;SS.speak(u)}
 if(a==='gt')window.open('https://translate.google.com/?sl=de&tl=ar&op=translate&text='+encodeURIComponent(tx),'_blank','noopener');
 if(a==='ai'){const w=tx.split(' ').length;askClaude(`Ich lerne Deutsch für die ÖSD-${LVN}-Prüfung. Erkläre mir bitte auf Darija (marokkanisches Arabisch, arabische Schrift) ${w<4?'das Wort bzw. den Ausdruck':'den Satz'} „${tx}“:\n1) Bedeutung und Übersetzung\n2) Wortart, Artikel, wichtige Grammatik (Kasus, Zeitform, Präposition)\n3) zwei einfache Beispielsätze mit Übersetzung.\nKontext aus dem Text: „${sentenceOf(tx,LH.blk)}“`)}
 if(a==='add'){const ar=$('#lha').value.trim();if(!ar||ar==='…')return toast('Schreibe zuerst die arabische Bedeutung in das Feld.');if(CW.some(w=>w.d===tx))return toast('Das Wort ist schon in deinen Karteikarten.');CW.push({d:tx,a:ar});store.set('cw',CW);rebuildW();toast('Gespeichert in „⭐ Meine Wörter“ (Karten).')}});
$('#mode').addEventListener('change',()=>{if($('#lhon'))$('#lhon').checked=$('#mode').value==='u'});

/* ============ Navigation & Timer ============ */
let curView='';
function go(id){const again=id===curView;curView=id;VIEWS.forEach(([v])=>$('#v-'+v).hidden=v!==id);$$('#nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.v===id));
 if(MODS.includes(id)&&(!$('#v-'+id).innerHTML||again)){stopSpeak();renderList(id)}
 if(id==='home')renderHome();if(id==='ergebnis')renderErg();
 if(!run){$('#tmin').value=DUR[id];left=DUR[id]*60;showT(left)}store.set('lastView',id);try{history.replaceState(null,'','#'+id)}catch(e){}scrollTo(0,0)}
$('#nav').addEventListener('click',e=>{const b=e.target.closest('[data-v]');b&&go(b.dataset.v)});
document.addEventListener('click',e=>{const c=e.target.closest('[data-go]');c&&go(c.dataset.go)});
$('#mode').onchange=updPlayers;
let run=null,left=90*60;
const showT=s=>{const o=$('#tout');o.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');o.classList.toggle('end',s<=0)};
$('#tmin').oninput=()=>{if(!run){left=(+$('#tmin').value||1)*60;showT(left)}};
$('#tgo').onclick=()=>{if(run){clearInterval(run);run=null;$('#tgo').textContent='Weiter';return}left=left>0?left:(+$('#tmin').value||1)*60;$('#tgo').textContent='Pause';run=setInterval(()=>{left--;showT(Math.max(left,0));if(left<=0){clearInterval(run);run=null;$('#tgo').textContent='Start';alert('Die Zeit ist um.')}},1000)};
$('#trs').onclick=()=>{clearInterval(run);run=null;left=(+$('#tmin').value||1)*60;showT(left);$('#tgo').textContent='Start'};
const h0=(location.hash||'#'+store.get('lastView','home')).slice(1);go(DUR[h0]!==undefined?h0:'home');
