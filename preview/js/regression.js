/* Browser regression harness. All app network traffic and storage are isolated. */
'use strict';
document.getElementById('run').onclick=async()=>{
 const button=document.getElementById('run'),output=document.getElementById('results');button.disabled=true;output.className='';output.textContent='Tests laufen …\n';
 const results=[],assert=(ok,message)=>{if(!ok)throw Error(message);results.push(message);output.textContent+='✓ '+message+'\n'};
 const user={id:'00000000-0000-4000-8000-000000000001',email:'test@example.invalid'},pid='00000000-0000-4000-8000-000000000002',rid='00000000-0000-4000-8000-000000000003';
 const room={id:rid,project_id:pid,floor:1,name:'Testraum',length_m:4,width_m:3,height_m:2.35,area_m2:12,notes:'',revision:1};
 const model={dimensions:{length:16.5,width:11.8},model:{elements:[],levels:Array.from({length:5},(_,i)=>({name:['Keller','Erdgeschoss','Obergeschoss','Dachgeschoss','Dachboden'][i],z:i*2.6,height:2.35})),roof:{ridge:12.6,angle:35,center:5.9}},planNames:[]};
 const fixture={user,pid,rid,room,model,failWrites:false,refreshStatus:200,logoutCount:0,writes:[],reads:[],errors:[],storage:new Map(),session:new Map(),intervals:[]};
 const material={id:'00000000-0000-4000-8000-000000000004',project_id:pid,title:'Testmaterial',trade:'',notes:'',quantity:1,unit:'Stk.',purchased:false,revision:1};
 fixture.data={umbau_materials:[material],umbau_projects:[{id:pid,name:'Regression',created_by:user.id}],umbau_rooms:[room],umbau_tasks:[],umbau_files:[],umbau_members:[{project_id:pid,user_id:user.id,role:'owner'}],umbau_model:[{project_id:pid,payload:model}],umbau_project_changes:[{project_id:pid,revision:1}]};
 window.panageiTestFixture=fixture;
 let iframe,win,doc;
 const wait=async(fn,message)=>{const end=Date.now()+10000;while(Date.now()<end){const v=fn();if(v)return v;await new Promise(r=>setTimeout(r,40))}throw Error('Zeitüberschreitung: '+message)};
 const delay=ms=>new Promise(r=>setTimeout(r,ms));
 const html=await (await fetch('./index.html',{cache:'no-store'})).text();
 const mock=function(){
  const f=parent.panageiTestFixture;
  function storage(map){return new Proxy({get length(){return map.size},key:i=>[...map.keys()][i],getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),clear:()=>map.clear()},{ownKeys:()=>[...map.keys()],getOwnPropertyDescriptor:()=>({enumerable:true,configurable:true}),get:(o,k)=>k in o?o[k]:map.get(k)})}
  Object.defineProperty(window,'localStorage',{value:storage(f.storage)});Object.defineProperty(window,'sessionStorage',{value:storage(f.session)});
  window.addEventListener('error',e=>f.errors.push(e.message));window.addEventListener('unhandledrejection',e=>f.errors.push(String(e.reason)));
  window.confirm=()=>true;window.alert=()=>{};window.scrollTo=()=>{};Element.prototype.scrollIntoView=function(){};
  window.WebSocket=class{constructor(){this.readyState=1}send(){}close(){this.readyState=3}};
  const originalInterval=window.setInterval;window.setInterval=(fn,ms)=>{if(ms===120000)f.refreshInterval=fn;return originalInterval(fn,ms)};
  window.fetch=async(url,options={})=>{
   const u=new URL(url,location.href),method=options.method||'GET',reply=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json'}});
   if(!u.hostname.endsWith('.supabase.co'))return reply({message:'isolated'},404);
   if(u.pathname.includes('/auth/v1/token')){if(u.searchParams.get('grant_type')==='refresh_token'&&f.refreshStatus!==200)return reply({msg:'temporary'},f.refreshStatus);return reply({access_token:'synthetic-token',refresh_token:'synthetic-refresh',user:f.user})}
   if(u.pathname.includes('/auth/v1/logout')){f.logoutCount++;return reply({})}
   if(u.pathname.startsWith('/storage/'))return reply({message:'not found'},404);
   if(u.pathname.includes('/functions/'))return reply({publicKey:''});
   if(u.pathname.endsWith('/rpc/umbau_task_members'))return reply([{user_id:f.user.id,display_name:'Test',role:'owner'}]);
   const table=u.pathname.split('/').pop(),rows=f.data[table]||[];
   function matches(row){for(const [k,v]of u.searchParams){if(v.startsWith('eq.')&&String(row[k])!==v.slice(3))return false;if(v.startsWith('in.(')&&!v.slice(4,-1).split(',').includes(String(row[k])))return false;}return true;}
   if(method==='GET'){f.reads.push({table,query:u.search});return reply(rows.filter(matches).slice(+(u.searchParams.get('offset')||0),+(u.searchParams.get('offset')||0)+127))}
   f.writes.push({table,method,query:u.search});if(f.failWrites)return reply({message:'offline'},503);
   if(['PATCH','DELETE'].includes(method)){
    if(!u.searchParams.has('revision'))throw Error('Revision fehlt bei '+table);
    const found=rows.filter(matches);
    if(method==='PATCH')for(const row of found)Object.assign(row,JSON.parse(options.body),{revision:row.revision+1});
    else f.data[table]=rows.filter(row=>!found.includes(row));
    return reply(found);
   }
   if(method==='POST'){const body=JSON.parse(options.body),existing=rows.find(row=>row.id===body.id);if(existing)return reply([]);const row={id:crypto.randomUUID(),revision:1,...body};rows.push(row);f.data[table]=rows;return reply([row])}
   return reply([]);
  };
 };
 async function load(){
  document.getElementById('stage').replaceChildren();iframe=document.createElement('iframe');iframe.title='Isolierte Test-App';document.getElementById('stage').append(iframe);
  const base=new URL('./',location.href).href;
  iframe.srcdoc=html.replace('<head>','<head>') // The existing document intentionally omits an explicit head.
   .replace('<meta charset=', '<base href="'+base+'"><script>('+mock.toString()+')()<\/script><meta charset=');
  await wait(()=>iframe.contentWindow?.panageiGate&&iframe.contentWindow?.panageiOpenPage&&iframe.contentDocument?.readyState==='complete','App-Start');win=iframe.contentWindow;doc=iframe.contentDocument;
 }
 function input(selector,value){const el=doc.querySelector(selector);if(!el)throw Error('Feld fehlt: '+selector);el.value=value;el.dispatchEvent(new win.Event('input',{bubbles:true}));el.dispatchEvent(new win.Event('change',{bubbles:true}));return el;}
 function click(selector){const el=doc.querySelector(selector);if(!el)throw Error('Element fehlt: '+selector);el.click();return el;}
 function draftButton(text){const b=[...doc.querySelectorAll('#draftRecovery button')].find(b=>b.textContent===text);if(!b)throw Error('Entwurfsaktion fehlt: '+text);b.click();}
 async function tasks(){click('[data-panagei-tab="aufgaben"]');input('#panageiTaskLevel','1');await wait(()=>doc.querySelector('.roomCard'),'Raumkarte');doc.querySelector('.roomCard').open=true;}
 try{
  await load();click('#panageiLogo');input('#panageiEmail','test@example.invalid');input('#panageiPassword','synthetic-password');doc.querySelector('#panageiAuth').dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));
  await wait(()=>!doc.querySelector('#panageiApp').hidden,'Anmeldung');assert(fixture.errors.length===0,'App startet ohne JavaScript-Fehler');
  await tasks();fixture.failWrites=true;input('[data-field="notes"]','Entwurf bleibt nach Neustart erhalten');
  await wait(()=>doc.querySelector('#cloudStatus').textContent.includes('Speichern fehlgeschlagen'),'Speicherfehler');
  const drafts=[...fixture.storage].filter(([k])=>k.startsWith('panagei-draft-v1:'));assert(drafts.length===1,'Fehlgeschlagene Speicherung wird als Entwurf gesichert');assert(!drafts[0][1].includes('synthetic-password')&&!drafts[0][1].includes('synthetic-token'),'Entwürfe enthalten weder Passwort noch Zugangstoken');
  await load();await wait(()=>doc.querySelector('#draftRecovery')?.textContent.includes('Entwurf wiederherstellen'),'Wiederherstellung');const count=fixture.writes.length;draftButton('Entwurf wiederherstellen');await delay(1000);assert(fixture.writes.length===count,'Wiederherstellung überschreibt keine Serverdaten');
  await tasks();assert(doc.querySelector('[data-field="notes"]').value==='Entwurf bleibt nach Neustart erhalten','Entwurf übersteht einen vollständigen App-Neustart');
  room.notes='Änderung vom zweiten Gerät';room.revision=2;fixture.failWrites=false;draftButton('Erneut speichern');await wait(()=>doc.querySelector('#draftRecovery').textContent.includes('Speicherkonflikt'),'Konflikt');assert(room.notes==='Änderung vom zweiten Gerät','Veraltete Speicherung überschreibt keine neueren Daten');
  draftButton('Aktuellen Stand laden');await wait(()=>doc.querySelector('[data-field="notes"]')?.value==='Änderung vom zweiten Gerät','Aktueller Stand');
  input('[data-field="notes"]','Konflikt geklärt');await wait(()=>doc.querySelector('#cloudStatus').textContent==='Alle Änderungen in der Cloud gespeichert','Erfolgreich gespeichert');assert(room.notes==='Konflikt geklärt'&&room.revision===3,'Bestätigte Speicherung erhöht die Revision');assert(![...fixture.storage.keys()].some(k=>k.startsWith('panagei-draft-v1:')),'Bestätigter Entwurf wird entfernt');
  // An unsent task text must survive as well.
  input('.newTask','Noch nicht hinzugefügte Aufgabe');await delay(200);await load();await wait(()=>doc.querySelector('#draftRecovery')?.textContent.includes('Entwurf wiederherstellen'),'Aufgabenentwurf');draftButton('Entwurf wiederherstellen');await wait(()=>![...doc.querySelectorAll('#draftRecovery button')].some(b=>b.textContent==='Entwurf wiederherstellen'),'Entwurf vollständig wiederhergestellt');await tasks();assert(doc.querySelector('.newTask').value==='Noch nicht hinzugefügte Aufgabe','Auch noch nicht hinzugefügter Aufgabentext wird wiederhergestellt');await load();await wait(()=>doc.querySelector('#draftRecovery')?.textContent.includes('Entwurf wiederherstellen'),'Aufgabentext erneut laden');draftButton('Entwurf wiederherstellen');await wait(()=>![...doc.querySelectorAll('#draftRecovery button')].some(b=>b.textContent==='Entwurf wiederherstellen'),'Aufgabentext erneut wiederhergestellt');await tasks();assert(doc.querySelector('.newTask').value==='Noch nicht hinzugefügte Aufgabe','Aufgabentext bleibt auch nach erneutem Neustart erhalten');input('.newTask','');await delay(200);
  // Workspace form values and original revisions survive restart.
  click('[data-panagei-tab="kosten"]');await wait(()=>doc.querySelector('#costWorkspace form'),'Kostenformular');input('#costWorkspace [name="title"]','Ungespeicherter Beleg');await delay(200);await load();await wait(()=>doc.querySelector('#draftRecovery')?.textContent.includes('Entwurf wiederherstellen'),'Formularentwurf');draftButton('Entwurf wiederherstellen');await wait(()=>doc.querySelector('#costWorkspace [name="title"]')?.value==='Ungespeicherter Beleg','Formular wiederhergestellt');assert(true,'Formularentwürfe werden wiederhergestellt');
  doc.querySelector('#costWorkspace form').dataset.dirty='false';
  await tasks();
  [...doc.querySelectorAll('#materialWorkspace .workspace-row button')].find(b=>b.textContent==='Bearbeiten').click();
  input('#materialWorkspace [name="title"]','Lokale Materialänderung');
  material.title='Neuer Materialstand';material.revision=2;
  doc.querySelector('#materialWorkspace form').dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));
  await wait(()=>doc.querySelector('#materialWorkspace .workspace-status')?.textContent.includes('Zwischenzeitlich'),'Formularkonflikt');
  assert(material.title==='Neuer Materialstand','Veraltete Formularänderung wird abgewiesen');
  assert(doc.querySelector('#materialWorkspace form').dataset.dirty==='true','Formulareingaben bleiben nach Konflikt erhalten');
  [...doc.querySelectorAll('#materialWorkspace form button')].find(b=>b.textContent==='Abbrechen').click();
  [...doc.querySelectorAll('#materialWorkspace .workspace-row button')].find(b=>b.textContent==='Löschen').click();
  await wait(()=>doc.querySelector('#materialWorkspace .workspace-status')?.textContent.includes('Zwischenzeitlich'),'Löschkonflikt');
  assert(fixture.data.umbau_materials.length===1,'Veralteter Löschversuch entfernt keine neueren Daten');
  fixture.refreshStatus=503;await fixture.refreshInterval();assert(fixture.session.has('umbau26_auth')&&!doc.querySelector('#panageiApp').hidden,'Temporärer Auth-Verbindungsfehler erhält Anmeldung und Eingaben');fixture.refreshStatus=200;
  await tasks();input('#taskAssignmentForm [name="title"]','Zugewiesene Projektaufgabe');input('#taskAssignmentForm [name="responsible"]',user.id);doc.querySelector('#taskAssignmentForm form').dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));
  await wait(()=>fixture.data.umbau_tasks.some(t=>t.title==='Zugewiesene Projektaufgabe'&&t.assigned_to===user.id),'Personenzuweisung');assert(true,'Neue Projektaufgabe kann einer Person zugewiesen werden');
  await wait(()=>doc.querySelector('#renovationOverview [aria-label="Zuständig"]'),'Zuweisungsauswahl geladen');input('#renovationOverview [aria-label="Zuständig"]','all');await wait(()=>fixture.data.umbau_tasks.some(t=>t.title==='Zugewiesene Projektaufgabe'&&t.assigned_to_all&&!t.assigned_to),'Gemeinsame Aufgabe');assert(true,'Bestehende Projektaufgabe kann gemeinsam zugewiesen werden');
  input('#taskAssignmentForm [name="assignment"]','room');input('#taskAssignmentForm [name="room"]',rid);input('#taskAssignmentForm [name="title"]','Zugewiesene Raumaufgabe');input('#taskAssignmentForm [name="responsible"]',user.id);doc.querySelector('#taskAssignmentForm form').dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}));
  await wait(()=>fixture.data.umbau_tasks.some(t=>t.title==='Zugewiesene Raumaufgabe'&&t.assigned_to===user.id),'Raumzuweisung');await wait(()=>doc.querySelector('#taskAssignmentForm .workspace-status')?.textContent==='Aufgabe gespeichert.','Aufgabe vollständig angelegt');await tasks();input('.roomCard [aria-label="Zuständig"]','all');await wait(()=>fixture.data.umbau_tasks.some(t=>t.title==='Zugewiesene Raumaufgabe'&&t.assigned_to_all&&!t.assigned_to),'Raumzuweisung ändern');assert(true,'Raumzuweisung wird beim Speichern übernommen');
  // Discard form deliberately so logout can be tested without saved work.
  doc.querySelector('#costWorkspace form').dataset.dirty='false';click('#cloudLogout');await wait(()=>fixture.logoutCount===1,'Serverabmeldung');assert(true,'Abmeldung widerruft die Sitzung beim Server');
  const indirect=fixture.reads.filter(r=>['umbau_tasks','umbau_files'].includes(r.table));assert(indirect.every(r=>{const q=new URLSearchParams(r.query);return q.has('project_id')||q.has('room_id')}),'Aufgaben und Dateien werden ausschließlich projektbezogen geladen');
  // Pagination returns all 1203 rows even when the API only returns 127 at once.
  const rows=Array.from({length:1203},(_,id)=>({id}));const result=await win.PanageiSafety.readAll(async q=>{const p=new URLSearchParams(q);return rows.slice(+p.get('offset'),+p.get('offset')+127)},'?project_id=eq.test');assert(result.length===1203,'Pagination lädt 1203 Einträge trotz kleiner Serverseiten vollständig');
  assert(fixture.errors.length===0,'Alle Abläufe ohne Laufzeitfehler');output.className='passed';output.textContent+='\nBESTANDEN: '+results.length+' Prüfungen.';output.dataset.result='passed';
 }catch(error){output.className='failed';output.textContent+='\nFEHLER: '+error.message+'\n'+fixture.errors.join('\n');output.dataset.result='failed';console.error(error)}finally{button.disabled=false}
};
