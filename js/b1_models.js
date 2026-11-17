/* B1: baut die Modelle pro Aufgabe (gleiche Struktur wie MODELS bei B2) */
(function(){
const M={lesen:{a1:[],a2:[],a4:[]},hoeren:{a1:[],a2:[]},schreiben:{a1:[],a2:[]},sprechen:{a1:[],a2:[],a3:[]}};
const add=(m,a,x)=>M[m][a].push(x);
const rg=seed=>{let s=0;for(const c of seed)s=(s*31+c.charCodeAt(0))>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};
const sh=(a,r)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* Lesen */
LB1.forEach((x,i)=>add('lesen','a1',{id:'b1l1_'+i,title:x.title,th:x.th,a1:{text:x.text,items:x.items,hds:x.hds}}));
LB4.forEach((x,i)=>add('lesen','a4',{id:'b1l4_'+i,title:'Brief: '+x.head,th:x.th,a4:{head:x.head,greet:x.greet,brief:x.brief,sign:x.sign,ans:x.ans}}));
const SRC=M.lesen.a1;
SRC.forEach(s=>{
 const r=rg('a2'+s.id),own=s.a1.text.filter(x=>x[0]==='p').map((x,i)=>({p:x[1],h:s.a1.hds[i]}));
 const others=sh(SRC.filter(o=>o!==s),r),texts=own.slice(),corr=new Set(own.map(o=>o.h));
 for(const o of others){if(texts.length>=5)break;const ps=o.a1.text.filter(x=>x[0]==='p'),i=Math.floor(r()*ps.length);texts.push({p:ps[i][1],h:o.a1.hds[i]});corr.add(o.a1.hds[i])}
 const dist=sh([...new Set(SRC.filter(o=>o!==s).flatMap(o=>o.a1.hds))].filter(h=>!corr.has(h)),r).slice(0,5);
 const hs=sh([...corr,...dist],r),L='ABCDEFGHIK',heads={};hs.forEach((h,i)=>heads[L[i]]=h);
 add('lesen','a2',{id:'b1g2_'+s.id,title:'Überschriften: '+s.title,th:s.th,a2:{heads,texts:sh(texts,r).map(x=>['aus einer Zeitschrift',x.p,L[hs.indexOf(x.h)]])}});
});
/* Hören */
HB2.forEach((x,i)=>{const g=genHA2(x);add('hoeren','a2',{id:'b1hb_'+i,title:'Tabelle: '+g.title,th:g.th,a2:g.a2})});
HB1.forEach((x,i)=>add('hoeren','a1',{id:'b1ha_'+i,title:x.title,th:x.th,a1:{items:x.items,tr:x.tr,dlg:x.dlg,names:x.names,plays:x.plays}}));
/* Schreiben */
SB1.forEach((x,i)=>add('schreiben','a1',{id:'b1sa1_'+i,title:x.title,th:x.th,a1:{kind:x.kind,sit:x.sit,ad:x.ad,checks:x.checks}}));
SB2.forEach(([th,topic,q,third],i)=>add('schreiben','a2',{id:'b1sa2_'+i,title:'Forumsbeitrag: '+topic,th,a2:{A:{t:`Sie lesen in einem Internetforum zum Thema „${topic}“ diese Beiträge:`,q,p:['Schreiben Sie Ihre Meinung zum Thema und begründen Sie sie.','Erzählen Sie von einer eigenen Erfahrung.',third||'Machen Sie einen Vorschlag oder geben Sie einen Tipp.']}}}));
/* Sprechen */
SPK1.forEach(([th,sit,pics,o1,o2,topic],i)=>{
 add('sprechen','a1',{id:'b1sp1_'+i,title:'Planen: '+th,th,a1:{sit,pts:['Machen Sie einen Vorschlag (Was? Wann? Wo?) und fragen Sie Ihren Gesprächspartner nach seiner Meinung.','Reagieren Sie auf seine Vorschläge und sagen Sie, was Sie besser finden und warum.','Einigen Sie sich auf Zeit und Ort.']}});
 add('sprechen','a2',{id:'b1sp2_'+i,title:'Präsentation: '+th,th,a2:{pics:pics.map((p,j)=>{const [d,t]=p.split('|');return ['Bild '+(j+1),d,[t]]})}});
 add('sprechen','a3',{id:'b1sp3_'+i,title:topic,th,a3:{sit:`Sie haben zwei Meinungen zum Thema „${topic}“ gelesen. Sagen Sie zuerst Ihre eigene Meinung. Fragen Sie dann Ihren Gesprächspartner und reagieren Sie auf seine Antworten.`,op:[{n:o1[0],x:o1[1]},{n:o2[0],x:o2[1]}]}})});
B1.MODELS=M;
})();
