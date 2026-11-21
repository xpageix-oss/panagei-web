(function(){
'use strict';
const API='https://evvfenvbvctcvyscooyp.supabase.co',KEY='sb_publishable_ju52qhrdcwX4PzwC6ied_A_w7f5YQDB';
const app=document.getElementById('panageiApp');
if(!app)return;
const style=document.createElement('style');style.textContent=`
#panageiTabs[hidden]{display:none!important}\n#panageiContextSwitch{display:flex;gap:8px;padding:12px max(16px,calc((100vw - 1160px)/2));background:#e4eee7}
#panageiContextSwitch button{flex:1;max-width:220px;font-weight:700}
#panageiContextSwitch button[aria-pressed=true]{background:#153e34;color:#fff}
#panageiEveryday{max-width:980px;margin:0 auto;padding:12px 14px 40px}
#panageiEveryday[hidden],#panageiContextSwitch[hidden]{display:none!important}
#panageiEveryday .everyday-tabs{display:flex;gap:8px;margin:12px 0}
#panageiEveryday .everyday-tabs button[aria-selected=true]{background:#153e34;color:#fff}
#panageiEveryday .everyday-panel{background:var(--paper,#fff);border:1px solid #d6e4d9;border-radius:14px;padding:16px;margin:10px 0;color:var(--ink,#193b31)}
#panageiEveryday form{display:grid;gap:10px}
#panageiEveryday label{display:grid;gap:5px;font-size:14px}
#panageiEveryday input,#panageiEveryday select,#panageiEveryday textarea{width:100%;max-width:100%;min-height:42px;padding:9px;border:1px solid #b8c7bf;border-radius:8px;background:#fff;color:#173c33;font-size:16px}
#panageiEveryday textarea{min-height:65px}
#panageiEveryday .everyday-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
#panageiEveryday .everyday-entry{border-top:1px solid #dce7e0;padding:12px 0}
#panageiEveryday .everyday-entry .everyday-row{justify-content:space-between}
#panageiEveryday .everyday-entry small{display:block;color:#62776d}
#panageiEveryday .everyday-entry button{min-height:38px}
#panageiEveryday .everyday-calendar{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px}
#panageiEveryday .everyday-calendar button{min-width:0;padding:5px 1px;min-height:44px;font-size:13px}
#panageiEveryday .everyday-calendar button[aria-pressed=true]{background:#153e34;color:white}
#panageiEveryday .everyday-calendar button.has-events{border:2px solid #398260;font-weight:800}
#panageiEveryday .everyday-calendar .weekday{text-align:center;font-size:12px;padding:6px 0}
@media(max-width:500px){#panageiContextSwitch button{max-width:none}#panageiEveryday .everyday-panel{padding:12px}}
`;document.head.appendChild(style);
const switcher=document.createElement('div');switcher.id='panageiContextSwitch';switcher.hidden=true;
switcher.innerHTML='<button type="button" data-context="umbau" aria-pressed="true">Umbau</button><button type="button" data-context="alltag" aria-pressed="false">Alltag</button>';
const tabs=document.getElementById('panageiTabs');tabs.before(switcher);
const root=document.createElement('div');root.id='panageiEveryday';root.hidden=true;
root.innerHTML=`<h2>Alltag</h2><p>Eigene Aufgaben und Termine, getrennt vom Umbau. Synchronisiert über das gemeinsame Projekt.</p>
<div class="everyday-tabs" role="tablist"><button type="button" data-view="task" aria-selected="true">Aufgaben</button><button type="button" data-view="event" aria-selected="false">Kalender</button></div>
<div id="everydayStatus" role="status" aria-live="polite"></div>
<div class="everyday-panel"><h3 id="everydayFormTitle">Neue Aufgabe</h3><form id="everydayForm">
<label>Titel<input name="title" required maxlength="240" autocomplete="off"></label>
<label>Notizen<textarea name="notes" maxlength="5000"></textarea></label>
<label id="everydayDateLabel">Fällig am<input name="due_date" type="date"></label>
<label id="everydayStartLabel" hidden>Beginn<input name="starts_at" type="datetime-local"></label>
<label id="everydayEndLabel" hidden>Ende (optional)<input name="ends_at" type="datetime-local"></label>
<label id="everydayAssigneeLabel">Zuständig<select name="assignee"><option value="">Nicht zugewiesen</option><option value="all">Gemeinsam</option></select></label>
<div class="everyday-row"><button type="submit" id="everydaySave">Speichern</button><button type="button" id="everydayCancel" hidden>Abbrechen</button></div>
</form></div>
<div id="everydayCalendarBox" class="everyday-panel" hidden></div>
<div class="everyday-panel"><div class="everyday-row"><h3 id="everydayListTitle">Aufgaben</h3><button type="button" id="everydayReload">Aktualisieren</button></div>
<label id="everydayFilterLabel">Zuständigkeit filtern<select id="everydayFilter"><option value="">Alle</option><option value="me">Meine Aufgaben</option><option value="all">Gemeinsam</option><option value="unassigned">Nicht zugewiesen</option></select></label>
<div id="everydayList"></div></div>`;
tabs.after(root);
let mode='umbau',view='task',project=null,identity=null,rows=[],members=[],edit=null,calendarMonth=new Date(),selectedDate='',loading=false,role='viewer',lastRefresh=0;
const $=id=>document.getElementById(id);
const session=()=>{try{return JSON.parse(sessionStorage.getItem('umbau26_auth')||'null')}catch{return null}};
const selectedProject=()=>document.querySelector('#cloudProjects select')?.value||null;
function auth(){const s=session();if(!s?.token||!s?.user?.id)throw Error('Bitte erneut anmelden.');return s}
async function request(path,method='GET',payload=null,extra={}) {
 const s=auth();const res=await fetch(API+'/rest/v1/'+path,{method,headers:{'apikey':KEY,'Authorization':'Bearer '+s.token,'Content-Type':'application/json','Prefer':method==='POST'?'return=representation':'return=minimal',...extra},body:payload===null?undefined:JSON.stringify(payload)});
 if(!res.ok){let body;try{body=await res.json()}catch{};throw Error(body?.message||body?.error||'Serverfehler '+res.status)}
 if(res.status===204)return null;const text=await res.text();return text?JSON.parse(text):null;
}
function status(message){$('everydayStatus').textContent=message}
function memberName(record){return record.assigned_to_all?'Gemeinsam':record.assigned_to?(members.find(m=>m.user_id===record.assigned_to)?.display_name||'Ehemaliges Mitglied'):'Nicht zugewiesen'}
function localDay(value){const d=new Date(value);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}\nfunction dateLabel(record){if(record.kind==='task')return record.due_date?'Fällig: '+new Date(record.due_date+'T12:00:00').toLocaleDateString('de-DE'):'Ohne Frist';return new Date(record.starts_at).toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'})}
function option(select,value,label){const o=document.createElement('option');o.value=value;o.textContent=label;select.appendChild(o)}
function fillMembers(){const choices=$('everydayForm').elements.assignee;const f=$('everydayFilter');const old=choices.value,filter=f.value;choices.replaceChildren();option(choices,'','Nicht zugewiesen');option(choices,'all','Gemeinsam');for(const m of members)option(choices,m.user_id,m.display_name+(m.user_id===identity?' (ich)':''));choices.value=old;f.replaceChildren();[['','Alle'],['me','Meine Aufgaben'],['all','Gemeinsam'],['unassigned','Nicht zugewiesen'],...members.map(m=>[m.user_id,m.display_name])].forEach(([v,l])=>option(f,v,l));f.value=filter}
async function load(force=false){
 const s=auth(),p=selectedProject();if(!p){status('Projekt wird geladen.');return}
 if(loading)return; if(!force&&p===project&&identity===s.user.id&&Date.now()-lastRefresh<10000)return;
 loading=true;status('Synchronisiere Alltag …');
 try{
 const changed=p!==project||identity!==s.user.id;project=p;identity=s.user.id;
 if(changed){rows=[];edit=null;resetForm()}
 const [entries,people,myRole]=await Promise.all([
 request('panagei_everyday_entries?project_id=eq.'+encodeURIComponent(p)+'&select=*&order=created_at.desc'),
 request('rpc/umbau_task_members','POST',{p_project_id:p}).catch(()=>[]),
 request('umbau_members?project_id=eq.'+encodeURIComponent(p)+'&user_id=eq.'+encodeURIComponent(identity)+'&select=role')
 ]);
 if(p!==selectedProject()||identity!==auth().user.id)return;
 rows=entries||[];members=people||[];role=myRole?.[0]?.role||'viewer';fillMembers();
 $('everydayForm').querySelectorAll('input,textarea,select,button').forEach(el=>el.disabled=role==='viewer');
 status('Synchronisiert · '+rows.length+' Einträge'+(role==='viewer'?' · Nur Lesen':''));
 lastRefresh=Date.now();render();
 }catch(e){status('Synchronisierung fehlgeschlagen: '+e.message)}finally{loading=false}
}
function resetForm(){edit=null;const form=$('everydayForm');form.reset();$('everydayCancel').hidden=true;$('everydayFormTitle').textContent=view==='task'?'Neue Aufgabe':'Neuer Termin';$('everydaySave').textContent='Speichern'}
function selectView(which){view=which;resetForm();root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.view===view)));$('everydayDateLabel').hidden=view!=='task';$('everydayStartLabel').hidden=view!=='event';$('everydayEndLabel').hidden=view!=='event';$('everydayAssigneeLabel').hidden=view!=='task';$('everydayFilterLabel').hidden=view!=='task';$('everydayCalendarBox').hidden=view!=='event';$('everydayListTitle').textContent=view==='task'?'Aufgaben':'Termine';render()}
function element(tag,className,text,parent){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined&&text!==null)el.textContent=text;if(parent)parent.appendChild(el);return el}
function visibleRows(){const filter=$('everydayFilter').value;return rows.filter(r=>r.kind===view&&(!selectedDate||view!=='event'||localDay(r.starts_at)===selectedDate)&&(!filter||view!=='task'||(filter==='me'?(r.assigned_to===identity||r.assigned_to_all):filter==='all'?r.assigned_to_all:filter==='unassigned'?!r.assigned_to&&!r.assigned_to_all:r.assigned_to===filter)))}
function render(){
 const list=$('everydayList');list.replaceChildren();
 const items=visibleRows().sort((a,b)=>view==='task'?Number(a.done)-Number(b.done)||String(a.due_date||'9999').localeCompare(String(b.due_date||'9999')):String(a.starts_at).localeCompare(String(b.starts_at)));
 if(!items.length)element('p','',view==='task'?'Keine Aufgaben für diesen Filter.':'Keine Termine für diese Auswahl.',list);
 for(const r of items){
 const row=element('div','everyday-entry',null,list),top=element('div','everyday-row',null,row);
 if(view==='task'){
  const check=element('input','',null,top);check.type='checkbox';check.checked=r.done;check.disabled=role==='viewer';check.style.width='20px';check.style.minHeight='20px';check.setAttribute('aria-label',r.title+' erledigt');check.onchange=()=>void mutate(r,{done:check.checked}).catch(e=>{check.checked=!check.checked;status(e.message)});
 }
 const strong=element('strong','',r.title,top);if(r.done)strong.style.textDecoration='line-through';
 element('small','',dateLabel(r)+' · '+(view==='task'?memberName(r):'Alltagstermin'),row);
 if(r.notes)element('p','',r.notes,row);
 if(role!=='viewer'){
  const actions=element('div','everyday-row',null,row);
  const editButton=element('button','','Bearbeiten',actions);editButton.type='button';editButton.onclick=()=>startEdit(r);
  const remove=element('button','','Löschen',actions);remove.type='button';remove.onclick=()=>{if(confirm('Eintrag wirklich löschen?'))void deleteEntry(r)};
 }
 }
 if(view==='event')renderCalendar();
}
function renderCalendar(){
 const box=$('everydayCalendarBox');box.replaceChildren();
 const top=element('div','everyday-row',null,box);const prev=element('button','','‹',top);prev.type='button';prev.onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1);renderCalendar()};
 element('strong','',calendarMonth.toLocaleDateString('de-DE',{month:'long',year:'numeric'}),top);
 const next=element('button','','›',top);next.type='button';next.onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);renderCalendar()};
 const clear=element('button','','Alle Termine',top);clear.type='button';clear.onclick=()=>{selectedDate='';render()};
 const grid=element('div','everyday-calendar',null,box);
 for(const day of ['Mo','Di','Mi','Do','Fr','Sa','So'])element('span','weekday',day,grid);
 const y=calendarMonth.getFullYear(),m=calendarMonth.getMonth(),offset=(new Date(y,m,1).getDay()+6)%7;
 for(let n=0;n<offset;n++)element('span','',null,grid);
 for(let day=1;day<=new Date(y,m+1,0).getDate();day++){
 const key=y+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
 const count=rows.filter(r=>r.kind==='event'&&localDay(r.starts_at)===key).length;
 const b=element('button',count?'has-events':'',String(day)+(count?' •':''),grid);b.type='button';b.setAttribute('aria-pressed',String(selectedDate===key));b.setAttribute('aria-label',key+(count?' · '+count+' Termine':''));b.onclick=()=>{selectedDate=selectedDate===key?'':key;render()};
 }
}
function startEdit(r){
 edit=r;$('everydayFormTitle').textContent='Eintrag bearbeiten';$('everydaySave').textContent='Änderungen speichern';$('everydayCancel').hidden=false;
 const f=$('everydayForm').elements;f.title.value=r.title;f.notes.value=r.notes||'';f.due_date.value=r.due_date||'';f.starts_at.value=r.starts_at?toLocal(r.starts_at):'';f.ends_at.value=r.ends_at?toLocal(r.ends_at):'';f.assignee.value=r.assigned_to_all?'all':r.assigned_to||'';root.scrollIntoView({block:'start',behavior:'smooth'});
}
function toLocal(value){const d=new Date(value),t=new Date(d.getTime()-d.getTimezoneOffset()*60000);return t.toISOString().slice(0,16)}
async function mutate(r,fields){
 try{await request('panagei_everyday_entries?id=eq.'+encodeURIComponent(r.id)+'&project_id=eq.'+encodeURIComponent(project)+'&updated_at=eq.'+encodeURIComponent(r.updated_at),'PATCH',{...fields,updated_at:new Date().toISOString()},{'Prefer':'return=representation'}).then(data=>{if(!data?.length)throw Error('Eintrag wurde zwischenzeitlich geändert. Bitte aktualisieren.')});await load(true)}
 catch(e){status('Speichern fehlgeschlagen: '+e.message);throw e}
}
async function deleteEntry(r){try{const out=await request('panagei_everyday_entries?id=eq.'+encodeURIComponent(r.id)+'&project_id=eq.'+encodeURIComponent(project)+'&updated_at=eq.'+encodeURIComponent(r.updated_at),'DELETE',null,{'Prefer':'return=representation'});if(!out?.length)throw Error('Eintrag inzwischen geändert');resetForm();await load(true)}catch(e){status('Löschen fehlgeschlagen: '+e.message)}}
$('everydayForm').onsubmit=async e=>{
 e.preventDefault();if(role==='viewer'){status('Keine Schreibberechtigung');return}
 const f=e.currentTarget.elements,p=selectedProject();if(!p)return;
 const payload={title:f.title.value.trim(),notes:f.notes.value.trim(),kind:view,project_id:p};
 if(!payload.title)return;
 if(view==='task'){payload.due_date=f.due_date.value||null;payload.assigned_to=f.assignee.value&&f.assignee.value!=='all'?f.assignee.value:null;payload.assigned_to_all=f.assignee.value==='all'}
 else{if(!f.starts_at.value){status('Bitte Beginn angeben');return}payload.starts_at=new Date(f.starts_at.value).toISOString();payload.ends_at=f.ends_at.value?new Date(f.ends_at.value).toISOString():null}
 const save=$('everydaySave');save.disabled=true;
 try{if(edit){await mutate(edit,payload)}else{await request('panagei_everyday_entries','POST',payload);await load(true)}resetForm();status('Gespeichert und synchronisiert')}catch(e){status('Speichern fehlgeschlagen: '+e.message)}finally{save.disabled=false}
};
$('everydayCancel').onclick=resetForm;
$('everydayReload').onclick=()=>void load(true);
$('everydayFilter').onchange=render;
root.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>selectView(b.dataset.view));
function setMode(which){
 if(which===mode)return;
 mode=which;const everyday=which==='alltag';\n const header=app.querySelector('header h1');if(header)header.textContent=everyday?'Alltag – Aufgaben & Kalender':'Digitale Gebäudeakte';
 root.hidden=!everyday;tabs.hidden=everyday;
 const pages=app.querySelectorAll('.panagei-page');pages.forEach(p=>{if(everyday)p.hidden=true});
 switcher.querySelectorAll('[data-context]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.context===which)));
 if(!everyday){window.panageiOpenPage?.('dashboard')}else{selectedDate='';void load(true)}
}
switcher.querySelectorAll('[data-context]').forEach(b=>b.onclick=()=>setMode(b.dataset.context));
function tick(){
 const s=session();const ready=!app.hidden&&!!s?.user?.id&&!!selectedProject();
 switcher.hidden=!ready;
 if(!ready){if(mode==='alltag'){mode='umbau';root.hidden=true;tabs.hidden=false}project=null;identity=null;rows=[];const header=app.querySelector('header h1');if(header)header.textContent='Digitale Gebäudeakte';return}
 if(mode==='alltag'&&(project!==selectedProject()||identity!==s.user.id||Date.now()-lastRefresh>30000))void load(true);
}
setInterval(tick,1500);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&mode==='alltag')void load(true)});tick();
})();
