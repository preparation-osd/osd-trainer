/* Konto & Synchronisierung (Firebase, optional). Ohne Konfiguration läuft die App im Gastmodus. */
const rawSet=(k,v)=>{try{localStorage.setItem('osdb2_'+k,JSON.stringify(v))}catch(e){}};
const gather=()=>{const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('osdb2_')&&k!=='osdb2_acct')o[k.slice(6)]=localStorage.getItem(k)}}catch(e){}return o};
const rawGet=k=>{try{const v=localStorage.getItem('osdb2_'+k);return v?JSON.parse(v):undefined}catch(e){return undefined}};
function mergeData(remote){
 for(const [k,vs] of Object.entries(remote||{})){let rv;try{rv=JSON.parse(vs)}catch(e){continue}const lv=rawGet(k),b=k.replace(/^b1_/,'');
  if(b==='his'){const key=h=>h.d+h.id+h.t+h.s+h.max,seen=new Set((lv||[]).map(key)),all=(lv||[]).slice();(rv||[]).forEach(h=>{if(!seen.has(key(h))){seen.add(key(h));all.push(h)}});all.sort((x,y)=>x.d<y.d?-1:x.d>y.d?1:0);rawSet(k,all.slice(-80))}
  else if(b==='kd'){const o=Object.assign({},lv||{});for(const w in rv)o[w]=Math.max(o[w]||0,rv[w]);rawSet(k,o)}
  else if(b==='last'){if(!lv||(rv&&rv.ts>lv.ts))rawSet(k,rv)}
  else if(b.startsWith('draft_')){if(!lv||(typeof rv==='string'&&rv.length>String(lv).length))rawSet(k,rv)}
  else if(lv===undefined)rawSet(k,rv)}
 HIS=store.get('his',[]);KD=store.get('kd',{});Object.assign(TAB,store.get('tab',{}));renderHome();renderErg();Level.afterSync()}

/* ===== Niveau-Auswahl (B1 / B2) ===== */
const Level=window.Level={
 stat(l){try{const h=JSON.parse(localStorage.getItem('osdb2_'+(l==='b1'?'b1_':'')+'his')||'[]');return new Set(h.flatMap(x=>x.src||[x.id])).size}catch(e){return 0}},
 set(l){try{localStorage.setItem('osdb2_level',JSON.stringify(l))}catch(e){}window.Sync&&Sync.dirty();if(l===window.LEVEL&&window.LEVEL_CHOSEN){this.show(false);return}
  setTimeout(()=>{try{history.replaceState(null,'','#home')}catch(e){}location.reload()},250)},
 show(v,force){const o=$('#lvl');if(!o)return;if(v){const n1=this.stat('b1'),n2=this.stat('b2'),cur=window.LEVEL_CHOSEN;
   o.querySelector('#lvlc').innerHTML=`<button class="card lv" data-lv="b1"><b>B1</b><br>Grundlagen: Alltag, kurze Texte, einfache Briefe${n1?`<br><span class="hint">${n1} Modelle gemacht</span>`:''}${cur==='b1'?'<br><span class="badge">aktuell</span>':''}</button><button class="card lv" data-lv="b2"><b>B2</b><br>Fortgeschritten: Zeitungstexte, Stellungnahmen, Diskussion${n2?`<br><span class="hint">${n2} Modelle gemacht</span>`:''}${cur==='b2'?'<br><span class="badge">aktuell</span>':''}</button>`;
   o.querySelector('#lvlx').hidden=!cur}
  o.hidden=!v},
 ensure(){if(!window.LEVEL_CHOSEN&&$('#login').hidden)this.show(true)},
 afterSync(){const r=rawGet('level');if(!window.LEVEL_CHOSEN&&(r==='b1'||r==='b2')){window.LEVEL_CHOSEN=r;if(r!==window.LEVEL){location.reload();return}}this.ensure()}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-lv]');if(b)return Level.set(b.dataset.lv);
 if(e.target.closest('[data-a="lvl"]'))return Level.show(true,true);if(e.target.id==='lvlx')Level.show(false)});
const Sync=window.Sync={t:null,dirty(){if(!Acct.user)return;clearTimeout(this.t);this.t=setTimeout(()=>Acct.push(),2500)}};
const Acct=window.Acct={user:null,auth:null,db:null,
 conf(){const c=window.OSD_FIREBASE;return c&&c.apiKey&&c.projectId?c:null},
 note(t){const n=$('#lnote');if(n)n.textContent=t||''},
 err(e){const m={'auth/invalid-credential':'E-Mail oder Passwort falsch.','auth/wrong-password':'E-Mail oder Passwort falsch.','auth/user-not-found':'Kein Konto mit dieser E-Mail.','auth/email-already-in-use':'Diese E-Mail ist schon registriert.','auth/weak-password':'Das Passwort ist zu kurz (mindestens 6 Zeichen).','auth/invalid-email':'Ungültige E-Mail-Adresse.','auth/network-request-failed':'Keine Internetverbindung.'};this.note(m[e.code]||e.message||String(e))},
 ui(){const a=$('#acct');if(!a)return;a.innerHTML=(this.user?`<div class="hint">👤 ${this.user.email}</div><button class="g" data-a="out">Abmelden</button>`:`<div class="hint">👤 Gast</div><button class="g" data-a="login">Anmelden</button>`)+`<div class="fbtn" style="margin:6px 0 0"><button class="g" data-a="lvl">🎯 Niveau: ${LVN}</button></div><div class="fbtn" style="margin:6px 0 0"><button class="g" data-a="exp">Sichern</button><button class="g" data-a="imp">Laden</button></div><input type="file" id="impf" accept="application/json" hidden>`},
 show(v){const l=$('#login');if(l)l.hidden=!v},
 async push(){if(!this.user||!this.db)return;try{await this.db.collection('users').doc(this.user.uid).set({data:gather(),updated:Date.now()},{merge:true})}catch(e){console.warn('Sync fehlgeschlagen',e)}},
 async pull(){try{const d=await this.db.collection('users').doc(this.user.uid).get();if(d.exists)mergeData(d.data().data);else renderHome();await this.push()}catch(e){console.warn('Laden fehlgeschlagen',e)}},
 exportData(){const txt=JSON.stringify(gather());try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download='osd-fortschritt.json';a.click()}catch(e){prompt('Kopiere diesen Text und speichere ihn:',txt)}},
 async init(){
  const loginBtn=(id,fn)=>{const b=$(id);if(b)b.onclick=fn};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
   if(a==='login'){this.show(true)}if(a==='out'&&this.auth)this.auth.signOut().then(()=>{store.set('acct','guest');this.user=null;this.ui();renderHome()});
   if(a==='exp')this.exportData();if(a==='imp')$('#impf').click()});
  document.addEventListener('change',e=>{if(e.target.id==='impf'&&e.target.files[0]){e.target.files[0].text().then(t=>{try{mergeData(JSON.parse(t));alert('Fortschritt geladen.')}catch(x){alert('Datei ungültig.')}})}});
  loginBtn('#lguest',()=>{store.set('acct','guest');this.show(false);this.ui();Level.show(true,true)});
  loginBtn('#lclose',()=>{this.show(false);Level.ensure()});
  const cred=()=>[$('#lemail').value.trim(),$('#lpass').value];
  loginBtn('#lin',async()=>{this.note('…');this.fresh=true;try{await this.auth.signInWithEmailAndPassword(...cred())}catch(e){this.err(e)}});
  loginBtn('#lreg',async()=>{this.note('…');this.fresh=true;try{await this.auth.createUserWithEmailAndPassword(...cred())}catch(e){this.err(e)}});
  loginBtn('#lforgot',async()=>{const [m]=cred();if(!m)return this.note('Bitte zuerst deine E-Mail eingeben.');try{await this.auth.sendPasswordResetEmail(m);this.note('E-Mail zum Zurücksetzen wurde gesendet.')}catch(e){this.err(e)}});
  this.ui();
  const c=this.conf();
  if(!c){const f=$('#lform');if(f)f.hidden=true;this.note('Die Konto-Funktion ist noch nicht eingerichtet (siehe README). Bis dahin: Gastmodus, Fortschritt mit „Sichern/Laden“ übertragen.')}
  if(!store.get('acct',''))this.show(true);else Level.ensure();
  if(!c)return;
  try{const b='https://www.gstatic.com/firebasejs/10.12.2/',ld=s=>new Promise((r,j)=>{const x=document.createElement('script');x.src=b+s;x.onload=r;x.onerror=j;document.head.appendChild(x)});
   await ld('firebase-app-compat.js');await Promise.all([ld('firebase-auth-compat.js'),ld('firebase-firestore-compat.js')]);
   firebase.initializeApp(c);this.auth=firebase.auth();this.db=firebase.firestore();
   this.auth.onAuthStateChanged(u=>{this.user=u;if(u){const fresh=this.fresh;this.fresh=false;store.set('acct','user');this.show(false);this.ui();this.pull().then(()=>{if(fresh)Level.show(true,true);else Level.ensure()})}else this.ui()})}
  catch(e){this.note('Konto-Dienst nicht erreichbar (Internet?). Gastmodus funktioniert weiter.')}}};
Acct.init();
