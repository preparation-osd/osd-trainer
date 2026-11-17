/* Modelle pro Aufgabe (aus tests.js + content_*.js) und automatisch erzeugte Aufgaben */
const THEMES=TH.map(x=>x[1]);
const MODELS={lesen:{a1:[],a2:[],a3:[],a4:[]},hoeren:{a1:[],a2:[]},schreiben:{a1:[],a2:[]},sprechen:{a1:[],a2:[],a3:[]}};
const addM=(m,a,x)=>MODELS[m][a].push(x);
function rng(seed){let s=0;for(const c of seed)s=(s*31+c.charCodeAt(0))>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const shuf=(a,r)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const GEN2=(th,topic,q,third)=>({t:`Sie haben im Deutschkurs über das Thema „${topic}“ diskutiert. Dabei fielen folgende Äußerungen:`,q,p:['Wie denken Sie über diese Äußerungen? Begründen Sie Ihre persönliche Meinung.','Beschreiben Sie eigene Erfahrungen (oder Erfahrungen von Freunden) zum Thema.',third||'Wie ist die Situation in Ihrem Land?']});

/* ---- Lesen ---- */
const TMl={m1:['Kultur & Bibliothek','Lernen & Gedächtnis','Gesellschaft & Migration','Beruf & Arbeit'],umwelt:'Umwelt & Natur',wohnen:'Wohnen & Stadtleben',medien:'Medien & Internet',arbeit:'Beruf & Arbeit'};
const m1t=['Nationalbibliothek','Lernen und Tiere','Vorlesen in Berlin','„That’s me“-Seminar'];
TESTS.lesen.forEach(t=>['a1','a2','a3','a4'].forEach((a,i)=>{if(!t[a])return;const th=Array.isArray(TMl[t.id])?TMl[t.id][i]:TMl[t.id];
 const title=t.id==='m1'?'Modelltest 1 · '+m1t[i]:(a==='a4'?'Brief: '+t.a4.head:t.title);
 addM('lesen',a,{id:t.id+'_'+a,title,th,[a]:a==='a1'&&LHDS[t.id]?{...t.a1,hds:LHDS[t.id]}:t[a]})}));
LA1.forEach((x,i)=>addM('lesen','a1',{id:'la1_'+i,title:x.title,th:x.th,a1:{text:x.text,items:x.items,hds:x.hds}}));
LA4.forEach((x,i)=>addM('lesen','a4',{id:'la4_'+i,title:'Brief: '+x.head,th:x.th,a4:{head:x.head,greet:x.greet,brief:x.brief,sign:x.sign,ans:x.ans}}));
/* A2 (Überschriften) und A3 (rechter Rand) werden aus den A1-Texten erzeugt */
function genCloze(text){const w=text.split(/\s+/),lines=[];let cur=[];for(const x of w){cur.push(x);const core=x.replace(/[^A-Za-zÄÖÜäöüß-]/g,'');if(cur.join(' ').length>=38&&core.length>=5&&!/\d/.test(x)){lines.push(cur);cur=[]}}
 return lines.slice(0,20).map(l=>{const last=l[l.length-1],m=last.match(/^(.*?)([.,;:!?“”"]*)$/),core=m[1],k=core.length>=8?3:2;return [l.slice(0,-1).concat(core.slice(0,-k)).join(' '),[core.slice(-k)],m[2]]})}
const SRC=MODELS.lesen.a1.filter(m=>m.a1.hds);
SRC.forEach(s=>{
 const r=rng('a2'+s.id),own=s.a1.text.filter(x=>x[0]==='p').map((x,i)=>({p:x[1],h:s.a1.hds[i]}));
 const others=shuf(SRC.filter(o=>o!==s),r),texts=own.slice(),corr=new Set(own.map(o=>o.h));
 for(const o of others){if(texts.length>=5)break;const ps=o.a1.text.filter(x=>x[0]==='p'),i=Math.floor(r()*ps.length);texts.push({p:ps[i][1],h:o.a1.hds[i]});corr.add(o.a1.hds[i])}
 const dist=shuf([...new Set(SRC.filter(o=>o!==s).flatMap(o=>o.a1.hds))].filter(h=>!corr.has(h)),r).slice(0,5);
 const hs=shuf([...corr,...dist],r),L='ABCDEFGHIK',heads={};hs.forEach((h,i)=>heads[L[i]]=h);
 addM('lesen','a2',{id:'g2_'+s.id,title:'Überschriften: '+s.title,th:s.th,a2:{heads,texts:shuf(texts,r).map(x=>['aus einer Zeitschrift',x.p,L[hs.indexOf(x.h)]])}});
 addM('lesen','a3',{id:'g3_'+s.id,title:'Rechter Rand: '+s.title,th:s.th,a3:{intro:`<div class="ln"><b>${s.a1.text[0][1]}</b></div>`,cloze:genCloze(s.a1.text.filter(x=>x[0]==='p').map(x=>x[1]).join(' '))}})});

/* ---- Hören ---- */
const TMh={m1:['Inklusion & Behinderung','Reisen & Verkehr'],ki:'Technik & KI',schlaf:'Gesundheit & Ernährung',portugal:'Reisen & Verkehr'};
TESTS.hoeren.forEach(t=>['a1','a2'].forEach((a,i)=>{if(!t[a])return;const th=Array.isArray(TMh[t.id])?TMh[t.id][i]:TMh[t.id];addM('hoeren',a,{id:t.id+'_'+a,title:t.id==='m1'?(a==='a1'?'Modelltest 1 · Gehörlosenuniversität':'Modelltest 1 · Seminarhotels'):t.title,th,[a]:a==='a2'?{...t.a2,hot:HOT.map(x=>'Seminarhotel '+x)}:t[a]})}));
HA2.forEach((x,i)=>{const g=genHA2(x);addM('hoeren','a2',{id:'hb_'+i,title:'Tabelle: '+g.title,th:g.th,a2:g.a2})});
HA1.forEach((x,i)=>addM('hoeren','a1',{id:'ha_'+i,title:x.title,th:x.th,a1:{items:x.items,tr:x.tr,dlg:x.dlg,names:x.names,plays:x.plays}}));

/* ---- Schreiben ---- */
const TMs1={m1:'Umwelt & Natur',sprachreise:'Reisen & Verkehr',fitness:'Freizeit & Sport',onlineshop:'Konsum & Beschwerde',sommeruni:'Studium & Bildung'};
const TMs2={m1:{A:'Studium & Bildung',B:'Gesundheit & Ernährung',C:'Leistungsdruck & Stress'},sprachreise:{A:'Studium & Bildung',B:'Reisen & Verkehr'},fitness:{A:'Freizeit & Sport',B:'Leistungsdruck & Stress'},onlineshop:{A:'Konsum & Beschwerde',B:'Konsum & Beschwerde'},sommeruni:{A:'Studium & Bildung',B:'Technik & KI'}};
TESTS.schreiben.forEach(t=>{addM('schreiben','a1',{id:t.id+'_a1',title:t.id==='m1'?'Modelltest 1 · '+t.a1.kind:t.title,th:TMs1[t.id],a1:t.a1});
 Object.entries(t.a2).forEach(([k,v])=>{const topic=(v.t.match(/„([^“]+)“/)||[])[1]||TMs2[t.id][k];addM('schreiben','a2',{id:t.id+'_a2'+k,title:'Stellungnahme: '+(t.id==='m1'?{A:'Beruf und Studium',B:'Ernährung und Leistung',C:'Leistungsdruck'}[k]:topic),th:TMs2[t.id][k],a2:{A:v}})})});
SA1.forEach((x,i)=>addM('schreiben','a1',{id:'sa1_'+i,title:x.title,th:x.th,a1:{kind:x.kind,sit:x.sit,ad:x.ad,checks:x.checks}}));
SA2.forEach(([th,topic,q,third],i)=>addM('schreiben','a2',{id:'sa2_'+i,title:'Stellungnahme: '+topic,th,a2:{A:GEN2(th,topic,q,third)}}));

/* ---- Sprechen ---- */
const TMp={m1:['Reisen & Verkehr','Inklusion & Behinderung','Beruf & Arbeit'],umwelt:'Umwelt & Natur',gesundheit:'Gesundheit & Ernährung',bildung:'Studium & Bildung',arbeit:'Beruf & Arbeit'};
TESTS.sprechen.forEach(t=>['a1','a2','a3'].forEach((a,i)=>{const th=Array.isArray(TMp[t.id])?TMp[t.id][i]:TMp[t.id];addM('sprechen',a,{id:t.id+'_'+a,title:(t.id==='m1'?'Modelltest 1 · ':t.title+' · ')+['Gespräch','Bild','Meinungsaustausch'][i],th,[a]:t[a]})}));
SPK.forEach(([th,sit,pics,o1,o2,topic],i)=>{
 addM('sprechen','a1',{id:'sp1_'+i,title:'Gespräch: '+th,th,a1:{sit,pts:['Erkundigen Sie sich nach den Erfahrungen Ihres Gesprächspartners / Ihrer Gesprächspartnerin zum Thema und erzählen Sie von Ihren eigenen.','Machen Sie einen Vorschlag für eine gemeinsame Aktivität und einigen Sie sich auf Details.']}});
 addM('sprechen','a2',{id:'sp2_'+i,title:'Bilder: '+th,th,a2:{pics:pics.map((p,j)=>{const [d,t]=p.split('|');return ['Bild '+(j+1),d,[t]]})}});
 addM('sprechen','a3',{id:'sp3_'+i,title:topic,th,a3:{sit:`Sie und Ihr Gesprächspartner haben zwei Stellungnahmen zum Thema „${topic}“ gelesen. Sagen Sie zuerst Ihre Meinung und fragen Sie dann nach seiner Position. Diskutieren Sie und versuchen Sie, Ihren Gesprächspartner mit Argumenten zu überzeugen.`,op:[{n:o1[0],x:o1[1]},{n:o2[0],x:o2[1]}]}})});

/* ---- Abdeckung ---- */
const AUF={lesen:['a1','a2','a3','a4'],hoeren:['a1','a2'],schreiben:['a1','a2'],sprechen:['a1','a2','a3']};
function coverage(){const c={};THEMES.forEach(t=>c[t]={});for(const m in AUF)AUF[m].forEach(a=>MODELS[m][a].forEach(x=>{if(!c[x.th])c[x.th]={};const k=m+'.'+a;c[x.th][k]=(c[x.th][k]||0)+1}));return c}
