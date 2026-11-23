(function(){try{
document.getElementById("view").style.display="none";
let D=null, modelPayload=null; const c=document.getElementById('view'),ctx=c.getContext('2d');let angle=-.5,tilt=.9,zoom=1,selected='all',exploded=false,showRoof=true,onlyStairs=false,drag=null,S,centerZ=5;
const $=id=>document.getElementById(id);
function offset(l){return 0}
function visible(b){return (selected==='all'||b.level===+selected)&&(!onlyStairs||['step','landing','rail','entrance'].includes(b.kind))}
function project(v){let X=v[0]-modelPayload.dimensions.length/2,Y=v[1]-modelPayload.dimensions.width/2,Z=v[2]-centerZ,u=X*Math.cos(angle)-Y*Math.sin(angle),w=X*Math.sin(angle)+Y*Math.cos(angle);return[c.width/2+u*S,c.height/2+(w*Math.cos(tilt)-Z*Math.sin(tilt))*S,w*Math.sin(tilt)+Z*Math.cos(tilt)]}
function vertices(b){let{x,y,w,d,z,h,level}=b;z+=offset(level);let v=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]];if(level>=3)for(let p of v){let cap=D.roof.ridge-Math.abs(p[1]-D.roof.center)*Math.tan(D.roof.angle*Math.PI/180)+offset(level);p[2]=Math.min(p[2],cap)}return v}
function roofFaces(){let r=D.roof,z=r.eave+offset(3),h=r.ridge+offset(3),L=modelPayload.dimensions.length,W=modelPayload.dimensions.width,M=r.center;return [[[0,0,z],[L,0,z],[L,M,h],[0,M,h]],[[0,M,h],[L,M,h],[L,W,z],[0,W,z]],[[0,0,z],[0,M,h],[0,W,z]],[[L,0,z],[L,W,z],[L,M,h]]]}
let modelPick=null, modelLabels=[],modelSelection=null,modelTap=null,modelSaving=false;
const indices=[[0,3,2,1],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]];
function paintSolidFaces(faces){
const W=c.width,H=c.height,im=ctx.createImageData(W,H),pix=im.data,depth=new Float32Array(W*H);depth.fill(-Infinity);modelPick=new Int32Array(W*H);modelPick.fill(-1);
for(const f of faces){let hex=f.col.replace('#','');let rgb=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16));
for(let k=1;k<f.q.length-1;k++){let a=f.q[0],b=f.q[k],v=f.q[k+1];let den=(b[1]-v[1])*(a[0]-v[0])+(v[0]-b[0])*(a[1]-v[1]);if(Math.abs(den)<1e-8)continue;
let x0=Math.max(0,Math.floor(Math.min(a[0],b[0],v[0]))),x1=Math.min(W-1,Math.ceil(Math.max(a[0],b[0],v[0]))),y0=Math.max(0,Math.floor(Math.min(a[1],b[1],v[1]))),y1=Math.min(H-1,Math.ceil(Math.max(a[1],b[1],v[1])));
for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){let u=((b[1]-v[1])*(x+.5-v[0])+(v[0]-b[0])*(y+.5-v[1]))/den,t=((v[1]-a[1])*(x+.5-v[0])+(a[0]-v[0])*(y+.5-v[1]))/den,w=1-u-t;if(u<-.00001||t<-.00001||w<-.00001)continue;let z=u*a[2]+t*b[2]+w*v[2],i=y*W+x;if(z<depth[i])continue;depth[i]=z;modelPick[i]=f.pick??-1;let j=i*4;pix[j]=rgb[0];pix[j+1]=rgb[1];pix[j+2]=rgb[2];pix[j+3]=255;}}}
ctx.putImageData(im,0,0);
}
function render(){if(!D||!D.levels.length)return;if(!c.clientWidth||!c.clientHeight)return;let d=Math.min(devicePixelRatio||1,1.5);c.width=c.clientWidth*d;c.height=c.clientHeight*d;let all=selected==='all';centerZ=all?(exploded?D.roof.ridge:D.roof.ridge*.5873015873):D.levels[+selected].z+offset(+selected)+D.levels[+selected].height/2;S=c.closest('#panageiTaskCanvas')?Math.min(c.width/(modelPayload.dimensions.length+2),c.height/(modelPayload.dimensions.width+2)):Math.min(c.width/(modelPayload.dimensions.length*1.5151515),c.height/(all?(exploded?D.roof.ridge*2.8571429:modelPayload.dimensions.length*1.5151515):modelPayload.dimensions.length*1.090909))*zoom;if(c.closest('#panageiTaskCanvas')){modelPick=null;modelLabels=[];if(!drawImportedTaskPlan(+selected)){if(selected==='2')drawOG();else drawOtherPlan(+selected)}return;}ctx.clearRect(0,0,c.width,c.height);let faces=[];function face(v,col,pick=-1){let q=v.map(project);const chosen=modelSelection?.kind==='element'&&modelSelection.index===pick&&pick!==-1;faces.push({q,col:chosen?'#e3a84b':col,pick,z:q.reduce((s,p)=>s+p[2],0)/q.length})}for(const [i,b] of D.elements.entries()){if(!visible(b))continue;let v=vertices(b);for(let ix of indices)face(ix.map(j=>v[j]),b.color,i)}if(!c.closest('#panageiTaskCanvas')&&showRoof&&!onlyStairs&&(all||+selected>=3)){for(let [i,f]of roofFaces().entries())face(f,i<2?'#976b52':'#d5d0c4',-2)}paintSolidFaces(faces);drawModelLabels(d);}

const panel=$('projectPanel');
let initialInfo='';
let ogRegions=[], taskRegions=[], projectData={},roomTaskDrafts={};
function saveProject(){cloudSchedule();renderRenovation()}
function safeText(t){return String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function getRooms(l){return projectData[String(l)]??(projectData[String(l)]=[])}
function updatePanel(){
 for(const el of panel.querySelectorAll('.newTask')){const id=el.closest('[data-room-id]')?.dataset.roomId;if(id){if(el.value.trim())roomTaskDrafts[id]=el.value;else delete roomTaskDrafts[id];}}
 if(!D||selected==='all'){panel.innerHTML=initialInfo;return}
 const l=+selected,rooms=getRooms(l);const opened=new Set([...panel.querySelectorAll('.roomCard[open]')].map(x=>x.dataset.roomId));
 panel.innerHTML=`<div id="roomCards"></div><button id="addRoom" type="button">＋ Raum hinzufügen</button><button id="exportData" type="button">Daten sichern (JSON)</button>`;
 const cards=$('roomCards');
 function drawRooms(){
 cards.innerHTML='';
 rooms.forEach((r,i)=>{
 const d=document.createElement('details');d.className='roomCard';d.dataset.roomId=r.id;d.open=opened.has(r.id);
 d.innerHTML=`<summary><span class="room-title">${safeText(r.name)}</span><small>${(r.tasks||[]).filter(t=>!t.done).length} offen</small></summary>
 <div class="roomBody"><label>Raumname<input data-field="name" value="${safeText(r.name)}"></label>
 <div class="roomGrid">${[['area','Fläche (m²)'],['length','Länge (m)'],['width','Breite (m)'],['height','Höhe (m)']].map(([key,label])=>`<label>${label}<input data-field="${key}" inputmode="decimal" value="${safeText(r[key])}"></label>`).join('')}</div>
 <h3>Offene Aufgaben</h3><div class="openTasks"></div><div class="addTask"><input class="newTask" placeholder="Neue Aufgabe"><button class="plusTask" type="button" aria-label="Aufgabe hinzufügen">＋</button></div>
 <h3>Erledigt</h3><div class="doneTasks"></div><h3>Notizen</h3><textarea data-field="notes" rows="3" placeholder="Fragen, Materialien, Entscheidungen ...">${safeText(r.notes)}</textarea>
 <h3>Fotos</h3><input class="photoInput" type="file" accept="image/*" multiple><div class="photoGrid"></div></div>`;
 cards.appendChild(d);
 d.querySelectorAll('[data-field]').forEach(el=>el.addEventListener('input',()=>{r[el.dataset.field]=el.value;saveProject();if(el.dataset.field==='name')d.querySelector('summary').firstChild.textContent=el.value+' '}));
 const taskList=()=>{
  for(let done of [false,true]){
   const box=d.querySelector(done?'.doneTasks':'.openTasks');box.innerHTML='';
   (r.tasks||[]).filter(t=>!!t.done===done).forEach(t=>{
    const row=document.createElement('label');row.className='taskRow';if(t.id)row.dataset.taskId=t.id;
    const cb=document.createElement('input');cb.type='checkbox';cb.checked=done;cb.onchange=()=>{t.done=cb.checked;saveProject();taskList();d.querySelector('summary small').textContent='· '+r.tasks.filter(x=>!x.done).length+' offen'};
    const span=document.createElement('span');span.textContent=t.text;if(done)span.style.textDecoration='line-through';
    const del=document.createElement('button');del.type='button';del.textContent='×';del.title='Aufgabe löschen';del.onclick=()=>{if(confirm('Aufgabe löschen?')){r.tasks=r.tasks.filter(x=>x!==t);saveProject();taskList();d.querySelector('summary small').textContent='· '+r.tasks.filter(x=>!x.done).length+' offen'}};
    row.append(cb,span,del);box.appendChild(row);const meta=document.createElement('div');meta.className='taskMeta';for(const [key,label,type] of [['trade','Gewerk','text'],['priority','Priorität','select'],['due_date','Frist','date']]){const input=type==='select'?document.createElement('select'):document.createElement('input');if(type==='select'){for(const [v,t] of priorityOptions)input.add(new Option(t,v))}else{input.type=type;input.placeholder=label}input.value=t[key]||(key==='priority'?'normal':'');input.setAttribute('aria-label',label);input.disabled=!['owner','editor'].includes(cloud.role);input.oninput=()=>{t[key]=input.value;saveProject()};const lab=document.createElement('label');lab.textContent=label;lab.append(input);meta.append(lab)}const assignee=wsField(meta,{key:'assigned_to',label:'Zuständig',type:'select',options:taskAssigneeOptions(t)},PanageiAssignments.value(t));assignee.disabled=!writableWorkspace();assignee.onchange=()=>{Object.assign(t,PanageiAssignments.patch(assignee.value));saveProject()};box.append(meta);
   });
  }
 };
 taskList();
 const add=()=>{const el=d.querySelector('.newTask'),value=el.value.trim();if(!value)return;r.tasks.push({text:value,done:false});el.value='';delete roomTaskDrafts[r.id];saveProject();taskList();d.querySelector('summary small').textContent='· '+r.tasks.filter(x=>!x.done).length+' offen'};
 const taskInput=d.querySelector('.newTask');taskInput.value=roomTaskDrafts[r.id]||'';taskInput.addEventListener('input',()=>{if(taskInput.value.trim())roomTaskDrafts[r.id]=taskInput.value;else delete roomTaskDrafts[r.id];});
 d.querySelector('.plusTask').onclick=add;d.querySelector('.newTask').onkeydown=e=>{if(e.key==='Enter')add()};
 const photoBox=d.querySelector('.photoGrid');
 const drawPhotos=()=>{photoBox.innerHTML='';(r.photos||[]).forEach((photo,j)=>{const wrap=document.createElement('div');const img=document.createElement('img');img.src=photo;img.alt='Raumfoto';const del=document.createElement('button');del.textContent='×';del.onclick=()=>{r.photos.splice(j,1);saveProject();drawPhotos()};wrap.append(img,del);photoBox.append(wrap)})};
 drawPhotos();
 });
 }
 drawRooms();
 $('addRoom').onclick=()=>{const name=prompt('Raumname:');if(name?.trim()){rooms.push({id:'r'+Date.now(),name:name.trim(),length:'',width:'',height:'',area:'',notes:'',tasks:[],photos:[]});saveProject();drawRooms()}};
 $('exportData').onclick=()=>{const blob=new Blob([JSON.stringify(projectData,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Umbau26_Raumdaten.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
}
updatePanel();

// Supabase REST + Auth: no secret/service-role key in client.
const CLOUD_URL='https://evvfenvbvctcvyscooyp.supabase.co',CLOUD_KEY='sb_publishable_ju52qhrdcwX4PzwC6ied_A_w7f5YQDB';
let drafts;
const persistDraft=()=>drafts?.persist();
const renderDraftStatus=()=>drafts?.render();
const offerDraft=()=>drafts?.offer();
const discardOwnDraft=()=>drafts?.discard();
let taskMembers=[];
const taskAssigneeOptions=t=>PanageiAssignments.options(taskMembers,cloud.user?.id,PanageiAssignments.value(t||{}));
const taskAssigneeLabel=t=>PanageiAssignments.label(t,taskMembers);
const cloud={role:null,token:null,refresh:null,user:null,project:null,loading:false,pushing:false,queued:false,dirty:false,lastSnapshot:'',timer:null};
const cs=(message)=>{document.getElementById('cloudStatus').textContent=message;if(message.startsWith('Cloud verbunden')||message.startsWith('Alle Änderungen'))window.panageiLastSync=new Date().toISOString()};
const cloudHeaders=(extra={})=>({'apikey':CLOUD_KEY,'Authorization':'Bearer '+(cloud.token||CLOUD_KEY),...extra});
async function cloudFetch(path,options={}){const r=await fetch(CLOUD_URL+path,{...options,headers:cloudHeaders(options.headers||{})});const raw=await r.text();let body;try{body=raw?JSON.parse(raw):null}catch{body=raw}if(!r.ok){const error=Error(body&&typeof body==='object'?(body.msg||body.message||body.error_description||body.error||JSON.stringify(body)):String(body));error.status=r.status;throw error;}return body}
async function api(table,qs='',options={}) {
 const {expected,...request}=options;
 const read=q=>cloudFetch('/rest/v1/'+table+q,{...request,headers:cloudHeaders({'Content-Type':'application/json',...request.headers})});
 if(!request.method||request.method==='GET'){
  const order=({umbau_members:'project_id.asc,user_id.asc',umbau_budgets:'project_id.asc,trade.asc',umbau_bauteil_raeume:'project_id.asc,bauteil_id.asc,room_id.asc',umbau_model:'project_id.asc',umbau_project_changes:'project_id.asc'})[table]||'id.asc';
  return PanageiSafety.readAll(read,qs,order);
 }
 if(['PATCH','DELETE'].includes(request.method)){
  qs=PanageiSafety.revisionQuery(qs,expected);
  request.headers={...request.headers,Prefer:'return=representation'};
  const result=await read(qs);
  if(!Array.isArray(result)||result.length!==1)throw new PanageiSafety.ConflictError();
  return result;
 }
 return read(qs);
}
async function readProjectRelated(table,pid,rooms){
 const ids=rooms.map(r=>r.id),out=[];
 if(table==='umbau_tasks')out.push(...await api(table,'?select=*&project_id=eq.'+encodeURIComponent(pid)));
 for(let i=0;i<ids.length;i+=100)out.push(...await api(table,'?select=*&room_id=in.('+ids.slice(i,i+100).join(',')+')'));
 return out;
}
const uid=()=>crypto.randomUUID();
const numeric=v=>v===''||v==null?null:Number(v);
window.panageiCloudAuth=cloudAuth;
async function cloudAuth(mode){try{const email=document.getElementById('cloudEmail').value.trim(),password=document.getElementById('cloudPassword').value;if(!email||!password)throw Error('E-Mail und Passwort eingeben');const userEmail=({'adriana':'adriana@panagei.de','viewer':'viewer@panagei.de'})[email.toLowerCase()]||email;const response=await fetch(CLOUD_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json','apikey':CLOUD_KEY},body:JSON.stringify({email:userEmail,password})});const result=await response.json();if(!response.ok)throw Error(result.error_description||result.msg||result.message||'Anmeldung fehlgeschlagen');if(!result.access_token){cs('Registrierung eingereicht. Bitte gegebenenfalls E-Mail bestätigen und dann anmelden.');window.panageiGate.message('Registrierung eingereicht. Bitte gegebenenfalls E-Mail bestätigen und danach anmelden.');return}persistDraft();clearTimeout(cloud.timer);drafts?.resetSession();cloud.dirty=false;cloud.queued=false;clearModel();cloudSession(result);await cloudInit()}catch(e){cs('Anmeldung: '+e.message);window.panageiGate.message('Anmeldung fehlgeschlagen: '+e.message)}finally{document.getElementById('cloudPassword').value='';document.getElementById('panageiPassword').value='';}}
function accountDisplayName(){const u=cloud.user;if(!u)return '';const m=u.user_metadata||{};const raw=[m.given_name,m.first_name,m.full_name,m.name].find(v=>typeof v==='string'&&v.trim());const alias=raw?.trim().split(/\s+/)[0]||String(u.email||'').split('@')[0].split(/[._+\-]/)[0];return alias?alias.charAt(0).toLocaleUpperCase('de-DE')+alias.slice(1,39):'Projektmitglied'}
function updateAccountIdentity(){const name=accountDisplayName();const role=({owner:'Administrator',editor:'Bearbeiten',viewer:'Lesen'})[cloud.role]||'';document.getElementById('cloudIdentity').textContent=[name,role].filter(Boolean).join(' · ')||'Angemeldet';window.panageiAccountIdentity?.({name,role,user:cloud.user?.id})}
function cloudSession(data){cloud.token=data.access_token;updateRealtimeToken();cloud.refresh=data.refresh_token||cloud.refresh;cloud.user=data.user||cloud.user;try{const saved=JSON.stringify({token:cloud.token,refresh:cloud.refresh,user:cloud.user});localStorage.setItem('umbau26_auth',saved);sessionStorage.setItem('umbau26_auth',saved)}catch{};document.getElementById('cloudLogin').hidden=true;document.getElementById('cloudLogged').hidden=false;updateAccountIdentity()}
let refreshInFlight=null,refreshRetry=null;
async function cloudRefreshToken(){
 if(refreshInFlight)return refreshInFlight;
 if(!cloud.refresh)return false;
 const refresh=cloud.refresh;
 refreshInFlight=(async()=>{try{
  const r=await cloudFetch('/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refresh_token:refresh})});
  if(cloud.refresh!==refresh)return false;cloudSession(r);clearTimeout(refreshRetry);return true;
 }catch(e){
  if(cloud.refresh!==refresh)return false;
  persistDraft();
  if(PanageiSafety.transient(e)){cs('Verbindung unterbrochen. Eingaben bleiben als Entwurf erhalten.');window.panageiGate.message('Verbindung unterbrochen. Anmeldung wird erneut versucht.');clearTimeout(refreshRetry);refreshRetry=setTimeout(async()=>{if(await cloudRefreshToken()){if(!cloud.project)await cloudInit();else if(cloud.dirty)cloudSchedule();}},15000);return false;}
  stopProjectRealtime();cloud.token=null;cloud.refresh=null;clearTimeout(cloud.timer);try{sessionStorage.removeItem('umbau26_auth');localStorage.removeItem('umbau26_auth')}catch{};
  window.panageiGate.showLogin();window.panageiGate.message('Sitzung abgelaufen. Bitte erneut anmelden. Dein Entwurf bleibt auf diesem Gerät erhalten.');return false;
 }finally{refreshInFlight=null}})();
 return refreshInFlight;
}
async function cloudInit(){try{const projects=await api('umbau_projects','?select=id,name,created_by&order=created_at.asc');const list=document.getElementById('cloudProjects');list.innerHTML='';if(!projects.length){cs('Angemeldet. Noch kein freigegebenes Projekt.');window.panageiGate.showLogin();window.panageiGate.message('Für dieses Konto ist noch kein Projekt freigegeben.');return}const sel=document.createElement('select');sel.setAttribute('aria-label','Cloud-Projekt');projects.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;sel.appendChild(o)});list.appendChild(sel);sel.onchange=async()=>{if(cloud.dirty||cloud.pushing||cloud.loading||modelSaving||document.querySelector('form[data-dirty="true"]')){sel.value=cloud.project;cs('Zuerst laufende Änderungen speichern.');return}clearHistory();clearPrivatePlans();clearModel();cloud.lastSnapshot='';cloud.project=sel.value;await cloudLoad()};cloud.project=projects.some(p=>p.id===cloud.project)?cloud.project:projects[0].id;sel.value=cloud.project;await cloudLoad()}catch(e){cs('Cloud-Zugriff fehlgeschlagen: '+e.message);window.panageiGate.showLogin();window.panageiGate.message('Cloud-Zugriff fehlgeschlagen: '+e.message)}}
async function cloudCreateProject(){if(!cloud.user)return;try{const id=await cloudFetch('/rest/v1/rpc/umbau_create_project',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});cloud.project=id;await cloudInit()}catch(e){cs('Projekt konnte nicht erstellt werden: '+e.message)}}
async function cloudLoad(){if(!cloud.project||cloud.loading||cloud.pushing||modelSaving||cloud.dirty)return;const pid=cloud.project,user=cloud.user?.id;try{cloud.loading=true;cs('Lade Projektdaten …');const roomsPromise=api('umbau_rooms','?select=*&project_id=eq.'+pid);const [rooms,tasks,files,members,models,people]=await Promise.all([roomsPromise,roomsPromise.then(rows=>readProjectRelated('umbau_tasks',pid,rows)),roomsPromise.then(rows=>readProjectRelated('umbau_files',pid,rows)),api('umbau_members','?select=role&project_id=eq.'+cloud.project+'&user_id=eq.'+cloud.user.id),api('umbau_model','?select=payload&project_id=eq.'+cloud.project),cloudFetch('/rest/v1/rpc/umbau_task_members',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_project_id:pid})})]);if(cloud.project!==pid||cloud.user?.id!==user||!cloud.token)return;if(cloud.dirty)return;if((document.activeElement?.closest('#roomCards')&&document.activeElement?.matches('input,textarea,select'))||[...document.querySelectorAll('#roomCards .newTask')].some(e=>e.value.trim())){realtimePending=true;return}taskMembers=people||[];cloud.role=members[0]?.role||null;if(!cloud.role)throw Error('Keine Projektberechtigung');installModel(models[0]?.payload);const roomIds=new Set(rooms.map(r=>r.id));const next={};for(const r of rooms){const floor=String(r.floor);if(!next[floor])next[floor]=[];next[floor].push({id:r.id,revision:r.revision,name:r.name,length:r.length_m??'',width:r.width_m??'',height:r.height_m??'',area:r.area_m2??'',notes:r.notes||'',tasks:tasks.filter(t=>t.room_id===r.id).map(t=>({id:t.id,revision:t.revision,text:t.title,done:t.done,trade:t.trade||'',priority:t.priority||'normal',due_date:t.due_date||'',assigned_to:t.assigned_to||null,assigned_to_all:!!t.assigned_to_all})),photos:[],cloudFiles:files.filter(f=>f.room_id===r.id)})}projectData=next;scopedTaskState={pid,rows:tasks.filter(t=>t.project_id===pid&&!t.room_id)};renderRenovation();void loadWorkspaces();refreshModelRooms();if(!$('modelDimensionForm')?.matches(':focus-within,[data-dirty="true"]'))showModelSelection();cloud.lastSnapshot=JSON.stringify(projectData);cloud.dirty=false;updatePanel();applyPanageiRole();updateAccountIdentity();cs('Cloud verbunden · Räume und Aufgaben geladen');window.panageiGate.showApp();offerDraft();startProjectRealtime();void loadActivity();requestRender();void cloudLoadImages();void loadPrivatePlans();if(!historyLoadedFor(pid,user))void loadHistory();void loadHistoricModels()}catch(e){if(cloud.project!==pid||cloud.user?.id!==user)return;persistDraft();if(PanageiSafety.transient(e)&&D){cs('Verbindung unterbrochen. Geladener Stand und Eingaben bleiben erhalten.');return;}clearHistory();clearPrivatePlans();clearModel();cs('Laden fehlgeschlagen: '+e.message);window.panageiGate.showLogin();window.panageiGate.message('Projektdaten konnten nicht geladen werden: '+e.message)}finally{cloud.loading=false}}

let historyGeneration=0,phaseUrls=[],historySelection=null,historyLoadedKey='';const historyLoadedFor=(p,u)=>historyLoadedKey===p+'|'+u;
function historyNode(tag,txt,cls){const el=document.createElement(tag);if(txt!=null)el.textContent=txt;if(cls)el.className=cls;return el;}
function clearHistory(){historyLoadedKey='';for(const u of phaseUrls)URL.revokeObjectURL(u);phaseUrls=[];historyGeneration++;for(const id of ['historyCards','inventoryCards','techCards','documentCards'])document.getElementById(id)?.replaceChildren();}
const historyFields={beschreibung:'Beschreibung',baubeginn:'Baubeginn',fertigstellung:'Fertigstellung',bauherr:'Bauherr',architekt:'Architekt',bauunternehmen:'Bauunternehmen',baugenehmigung:'Baugenehmigung',aktenzeichen:'Aktenzeichen',flurstueck:'Flurstücknummer',baukosten:'Baukosten',waehrung:'Währung',quelle:'Quelle',notizen:'Notizen',status:'Status',merkmal:'Merkmal',wert_text:'Wert',wert_zahl:'Zahlenwert',einheit:'Einheit',geschoss:'Geschoss',kategorie:'Kategorie',bezeichnung:'Bezeichnung',material:'Material',staerke_cm:'Stärke (cm)',abmessungen:'Abmessungen',raum:'Raum',tragend:'Tragend',konstruktion:'Konstruktion',system:'System',titel:'Titel',dokumentdatum:'Dokumentdatum'};
function historyValues(target,row,keys){const dl=historyNode('dl',null,'history-values');for(const key of keys){const v=row[key];if(v==null||v==='')continue;dl.append(historyNode('dt',historyFields[key]||key),historyNode('dd',typeof v==='boolean'?(v?'Ja':'Nein'):String(v)));}if(dl.children.length)target.append(dl);else target.append(historyNode('p','Noch nicht erfasst.','archive-empty'));}
function archiveCard(root,title,sub){const card=historyNode('details',null,'history-card'),head=historyNode('summary'),body=historyNode('div',null,'history-body');const label=historyNode('span',null,'archive-label');label.append(historyNode('strong',title));if(sub){const meta=historyNode('span',sub,'archive-meta');label.append(meta);}head.append(label);head.append(historyNode('span',null,'archive-chevron'));card.append(head,body);root.append(card);return body;}
async function loadHistory(){clearHistory();const gen=historyGeneration,pid=cloud.project,user=cloud.user?.id;const valid=()=>gen===historyGeneration&&cloud.project===pid&&cloud.user?.id===user&&cloud.token&&cloud.role;if(!valid())return;historyLoadedKey=pid+'|'+user;
const roots=['historyCards','inventoryCards','techCards','documentCards'].map(id=>document.getElementById(id));const query='?select=*&project_id=eq.'+encodeURIComponent(pid);const read=async(root,fn)=>{if(!root)return;root.replaceChildren(historyNode('p','Wird geladen …','archive-empty'));try{await fn();}catch(e){if(valid())root.replaceChildren(historyNode('p','Laden fehlgeschlagen: '+e.message,'archive-empty'));}};
const phasesPromise=api('umbau_bauabschnitte',query+'&order=jahr_von.asc,jahr_bis.asc');const year=r=>r.jahr_von===r.jahr_bis?String(r.jahr_von):r.jahr_von+'–'+r.jahr_bis;
await Promise.all([
read(roots[0],async()=>{const phases=await phasesPromise;if(!valid())return;const root=roots[0];root.replaceChildren();if(!phases.length){root.append(historyNode('p','Keine Bauabschnitte vorhanden.'));return}const track=historyNode('div',null,'phase-track'), detail=historyNode('section',null,'phase-detail');root.append(track,detail);const tiles=[],urls=[];const currentYear=new Date().getFullYear();const inProgress=phases.map((r,i)=>({r,i})).filter(({r})=>Number(r.jahr_von)<=currentYear&&Number(r.jahr_bis)>=currentYear);const latest=phases.reduce((best,r,i)=>Number(r.jahr_von)>=Number(phases[best].jahr_von)?i:best,0);const current=inProgress.length?inProgress[inProgress.length-1].i:latest;const saved=historySelection?.project===pid?phases.findIndex(r=>r.id===historySelection.id):-1;let active=saved>=0?saved:current;let docs=[];function select(i){active=i;historySelection={project:pid,id:phases[i].id};tiles.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));const r=phases[i];detail.replaceChildren();const visual=historyNode('div');if(urls[i]){const img=historyNode('img');img.src=urls[i];img.alt='Illustration des Bauzustands';visual.append(img)}else visual.append(historyNode('div','Illustration noch nicht verfügbar','phase-placeholder'));visual.append(historyNode('p','Illustrative Rekonstruktion · kein historisches Foto.','phase-caption'));const info=historyNode('div');const heading=historyNode('h3',null,'phase-heading');heading.append(historyNode('strong',year(r)),historyNode('span',r.bezeichnung));info.append(heading);if(i===current)info.append(historyNode('p','Aktueller Bauabschnitt','phase-current-detail'));if(r.beschreibung)info.append(historyNode('p',r.beschreibung,'phase-description'));else info.append(historyNode('p','Noch keine Beschreibung hinterlegt.','phase-description phase-muted'));if(r.quelle||r.status)historyValues(info,r,['quelle','status']);const group=docs.filter(d=>d.bauabschnitt_id===r.id);info.append(historyNode('h3','Zugehörige Dokumente ('+group.length+')','phase-doc-heading')); if(!group.length)info.append(historyNode('p','Keine Dokumente zugeordnet.','archive-empty'));const docList=historyNode('div',null,'phase-doc-grid');for(const d of group){const btn=historyNode('button',d.titel||'Dokument öffnen','phase-doc');btn.onclick=async()=>{try{if(!valid())return;const path=d.storage_path.split('/').map(encodeURIComponent).join('/');const res=await cloudFetch('/storage/v1/object/sign/umbau26/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expiresIn:120})});if(!valid())return;const a=historyNode('a','Dokument anzeigen');a.href=CLOUD_URL+'/storage/v1'+res.signedURL;a.target='_blank';a.rel='noopener noreferrer';btn.replaceWith(a)}catch(e){btn.textContent='Dokument nicht verfügbar – erneut versuchen'}};docList.append(btn)}if(group.length)info.append(docList);detail.append(visual,info)}for(const [i,r] of phases.entries()){const b=historyNode('button',null,'phase-tile');b.type='button';b.setAttribute('aria-label',year(r)+' – '+r.bezeichnung);const name=historyNode('span',null,'phase-name');name.textContent=r.bezeichnung.replace(/\p{L}{20,}/gu,v=>v.replace(/(gebäude|wohnhaus)(?=\p{L})/iu,'$1\u00ad'));b.append(historyNode('div','Illustration wird geladen …','phase-placeholder'),historyNode('strong',year(r)),name);if(i===current){b.classList.add('phase-current');const marker=historyNode('span','Aktueller Abschnitt','phase-current-label');b.append(marker)}b.onclick=()=>{select(i);centerActive()};tiles.push(b);track.append(b)}function centerActive(){if(track.scrollWidth<=track.clientWidth||!tiles[active])return;const b=tiles[active],tr=track.getBoundingClientRect(),br=b.getBoundingClientRect();track.scrollLeft+=br.left-tr.left-(tr.width-br.width)/2;}select(active);requestAnimationFrame(centerActive);await Promise.all([api('umbau_dokumente',query).then(rows=>{if(valid()){docs=rows;select(active)}}).catch(()=>{}),...phases.map(async(r,i)=>{try{const path=[pid,'Bauhistorie','phase-'+String(i+1).padStart(2,'0')+'.jpg'].map(encodeURIComponent).join('/');const res=await fetch(CLOUD_URL+'/storage/v1/object/authenticated/umbau26/'+path,{headers:cloudHeaders(),cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);const blob=await res.blob();if(!valid())return;const url=URL.createObjectURL(blob);phaseUrls.push(url);urls[i]=url;const img=historyNode('img');img.src=url;img.alt='Illustration '+year(r);tiles[i].firstChild.replaceWith(img);tiles[i].classList.add('phase-has-image');if(active===i)select(i)}catch(e){if(valid())tiles[i].firstChild.textContent='Illustration nicht verfügbar'}})])}),
read(roots[1],async()=>{const [parts,links,phases]=await Promise.all([api('umbau_bauteile',query),api('umbau_bauteil_raeume',query),phasesPromise]);if(!valid())return;roots[1].replaceChildren();const used=new Set();const labels=D?.levels.map(l=>l.name)||[];for(let i=0;i<labels.length;i++){const rooms=projectData[String(i)]||[];const floor=archiveCard(roots[1],labels[i],rooms.length+' Räume');if(!rooms.length)floor.append(historyNode('p','Noch keine Räume in der Cloud erfasst.','archive-empty'));for(const r of rooms){const entries=parts.filter(p=>p.ist_zustand===true&&links.some(l=>l.bauteil_id===p.id&&l.room_id===r.id));const body=archiveCard(floor,r.name,entries.length+' Bauteile');for(const category of ['Wand','Decke','Boden','Fenster','Tür','Sonstiges']){const section=historyNode('section',null,'history-section');section.append(historyNode('h3',category));const group=entries.filter(p=>{const k=String(p.kategorie).toLowerCase();const c=k.includes('wand')||k.includes('wänd')?'Wand':k.includes('decke')?'Decke':k.includes('boden')||k.includes('estrich')?'Boden':k.includes('fenster')?'Fenster':k.includes('tür')?'Tür':'Sonstiges';return c===category});if(!group.length)section.append(historyNode('p','Noch nicht erfasst.','archive-empty'));for(const p of group){used.add(p.id);const item=historyNode('div',null,'history-entry');historyValues(item,p,['bezeichnung','material','staerke_cm','abmessungen','tragend','konstruktion','notizen','quelle','status']);const phase=phases.find(x=>x.id===p.bauabschnitt_id);if(phase)item.append(historyNode('p','Bauabschnitt: '+year(phase)));section.append(item);}body.append(section);}}}const pending=parts.filter(p=>!used.has(p.id));if(pending.length){const box=archiveCard(roots[1],'Noch nicht zugeordnet',pending.length+' Einträge');for(const p of pending){const item=historyNode('div',null,'history-entry');historyValues(item,p,['kategorie','bezeichnung','material','geschoss','raum','status']);box.append(item);}}}),
read(roots[2],async()=>{const [rows,phases]=await Promise.all([api('umbau_gebaeudetechnik',query),phasesPromise]);if(!valid())return;roots[2].replaceChildren();const categories=[...new Set([...['Elektroinstallation','Trinkwasser','Abwasser','Heizung','Gasinstallation','Telekommunikation','Lüftung'],...rows.map(r=>r.kategorie)])];for(const cat of categories){const group=rows.filter(r=>r.kategorie===cat),body=archiveCard(roots[2],cat,group.length+' Einträge');if(!group.length)body.append(historyNode('p','Noch nicht erfasst.','archive-empty'));for(const r of group){const item=historyNode('div',null,'history-entry');const phase=phases.find(x=>x.id===r.bauabschnitt_id);if(phase)item.append(historyNode('h3',year(phase)));historyValues(item,r,['bezeichnung','material','system','geschoss','notizen','quelle','status']);body.append(item);}}}),
read(roots[3],async()=>{const [rows,phases]=await Promise.all([api('umbau_dokumente',query),phasesPromise]);if(!valid())return;roots[3].replaceChildren();for(const phase of phases){const group=rows.filter(r=>r.bauabschnitt_id===phase.id);if(!group.length)continue;const body=archiveCard(roots[3],year(phase),phase.bezeichnung);for(const r of group){const item=historyNode('div',null,'history-entry');item.append(historyNode('h3',r.titel));historyValues(item,r,['kategorie','dokumentdatum','notizen','quelle','status']);const btn=historyNode('button','Dokument öffnen');btn.onclick=async()=>{try{if(!valid())return;const path=r.storage_path.split('/').map(encodeURIComponent).join('/');const res=await cloudFetch('/storage/v1/object/sign/umbau26/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expiresIn:120})});if(!valid())return;const a=historyNode('a','Dokument anzeigen');a.href=CLOUD_URL+'/storage/v1'+res.signedURL;a.target='_blank';a.rel='noopener noreferrer';btn.replaceWith(a);}catch(e){if(valid())btn.textContent='Dokument nicht verfügbar – erneut versuchen';}};item.append(btn);body.append(item);}}})]);}

let loadedPlansKey='', planUrls=[], plansPending=false;

function clearModel(){clearExport();clearActivity();stopProjectRealtime();photoSignCache.clear();historySelection=null;clearWorkspaces();modelSelection=null;modelPick=null;modelLabels=[];modelTap=null;projectData={};roomTaskDrafts={};cloud.role=null;renderRenovation();refreshModelRooms();showModelSelection();D=null;modelPayload=null;ogRegions=[];taskRegions=[];initialInfo='';panel.replaceChildren();ctx.clearRect(0,0,c.width,c.height);c.style.display='none';$('modelFallback').style.display='block';$('privatePlanList').replaceChildren();}
function installModel(p){
 if(!p||!Array.isArray(p.model?.elements)||!Array.isArray(p.model?.levels)||!p.model.levels.length||!p.model.roof||!(p.dimensions?.length>0)||!(p.dimensions?.width>0))throw Error('Gebäudemodell fehlt oder ist ungültig');
 const changed=JSON.stringify(modelPayload)!==JSON.stringify(p);if(!changed)return;
 clearPrivatePlans();modelSelection=null;modelPayload=p;D=p.model;ogRegions=p.ogRegions||[];taskRegions=p.taskRegions||[];
 for(const id of ['level','panageiTaskLevel']){const el=$(id),old=el.value;el.replaceChildren();if(id==='level')el.add(new Option('Gesamtes Haus','all'));D.levels.forEach((l,i)=>el.add(new Option(l.name,String(i))));el.value=[...el.options].some(o=>o.value===old)?old:(id==='level'?'all':String(Math.min(1,D.levels.length-1)));}
 selected=$('level').value;
 initialInfo='<h2>Höhen aus dem Schnitt</h2><table>'+D.levels.map(l=>'<tr><td>'+safeText(l.name)+'</td><td>+'+safeText(Number(l.z).toFixed(2).replace('.',','))+' m</td></tr>').join('')+'</table>'+(p.modelNotes||[]).map(n=>'<p>'+safeText(n)+'</p>').join('');
 const list=$('privatePlanList');list.replaceChildren();for(const name of p.planNames||[]){if(typeof name!=='string'||name.includes('/')||name.includes('..'))continue;const d=document.createElement('details'),summary=document.createElement('summary'),img=document.createElement('img'),line=document.createElement('p'),a=document.createElement('a');summary.textContent=name;img.dataset.plan=name;img.alt=name;img.style.width='100%';a.dataset.planDownload=name;a.download=name;a.textContent='Herunterladen';a.hidden=true;line.append(a);d.append(summary,img,line);list.append(d)}
 c.style.display='block';$('modelFallback').style.display='none';
}

function clearPrivatePlans(){for(const url of planUrls)URL.revokeObjectURL(url);planUrls=[];loadedPlansKey='';document.querySelectorAll('[data-plan]').forEach(el=>el.removeAttribute('src'));document.querySelectorAll('[data-plan-download]').forEach(el=>{el.hidden=true;el.removeAttribute('href')});}
async function loadPrivatePlans(){
 if(!cloud.token||!cloud.role||!cloud.project||plansPending)return;
 const key=cloud.project+'|'+cloud.user.id;if(loadedPlansKey===key)return;
 plansPending=true;clearPrivatePlans();const status=document.getElementById('privatePlanStatus');status.textContent='Lade geschützte Zeichnungen …';let count=0;
 try{for(const img of document.querySelectorAll('[data-plan]')){
 const detail=img.closest('details');let error=detail.querySelector('.plan-error');if(!error){error=document.createElement('div');error.className='plan-error';detail.appendChild(error)}error.textContent='';
 let url;try{const path=[cloud.project,'Zeichnungen',img.dataset.plan].map(encodeURIComponent).join('/');const r=await fetch(CLOUD_URL+'/storage/v1/object/authenticated/umbau26/'+path,{headers:cloudHeaders(),cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const bytes=await r.arrayBuffer();if(!bytes.byteLength)throw Error('Datei ist leer');if(!cloud.user||key!==cloud.project+'|'+cloud.user.id)return;
 const head=new Uint8Array(bytes,0,Math.min(bytes.byteLength,12));let type=head[0]===255&&head[1]===216?'image/jpeg':head[0]===137&&head[1]===80?'image/png':r.headers.get('content-type')||'image/jpeg';
 url=URL.createObjectURL(new Blob([bytes],{type}));await new Promise((resolve,reject)=>{const test=new Image();test.onload=resolve;test.onerror=()=>reject(Error('Bildformat nicht lesbar oder Datei beschädigt'));test.src=url});if(!cloud.user||key!==cloud.project+'|'+cloud.user.id){URL.revokeObjectURL(url);return}planUrls.push(url);img.src=url;const link=[...document.querySelectorAll('[data-plan-download]')].find(el=>el.dataset.planDownload===img.dataset.plan);link.href=url;link.hidden=false;count++;
 }catch(e){if(url)URL.revokeObjectURL(url);error.textContent='Bild konnte nicht geladen werden: '+e.message;console.warn('Zeichnung nicht verfügbar',e)}}const total=document.querySelectorAll('[data-plan]').length;if(count===total)loadedPlansKey=key;status.textContent=count+' von '+total+' Zeichnungen geladen.';}finally{plansPending=false;}
}

const photoSignCache=new Map();
async function cloudLoadImages(){const pid=cloud.project,user=cloud.user?.id,data=projectData;if(!pid||!user)return;const valid=()=>pid===cloud.project&&user===cloud.user?.id&&data===projectData&&!!cloud.token;const rooms=Object.values(data).flat();await Promise.all(rooms.map(async room=>{const urls=await Promise.all((room.cloudFiles||[]).map(async f=>{try{const key=user+'|'+f.storage_path,hit=photoSignCache.get(key);if(hit&&hit.exp>Date.now())return hit.url;const result=await cloudFetch('/storage/v1/object/sign/umbau26/'+pathEncoded(f.storage_path),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expiresIn:3600})});if(!valid()||!result.signedURL)return null;const url=CLOUD_URL+'/storage/v1'+result.signedURL;photoSignCache.set(key,{url,exp:Date.now()+3000000});return url}catch{return null}}));if(valid())room.photos=urls.filter(Boolean)}));if(valid()&&!cloud.dirty&&!cloud.pushing&&!document.activeElement?.closest('#roomCards'))updatePanel()}
async function cloudUploadPhoto(file,room){if(!cloud.project||!cloud.user)throw Error('Bitte zuerst in der Cloud anmelden');if(!/^[0-9a-f-]{36}$/i.test(room.id))throw Error('Raum zuerst in die Cloud übertragen');if(file.size>20*1024*1024)throw Error('Maximal 20 MB pro Datei');const path=cloud.project+'/Fotos/'+room.id+'/'+uid()+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');await cloudFetch('/storage/v1/object/umbau26/'+encodeURI(path),{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream','x-upsert':'false'},body:file});await api('umbau_files','',{method:'POST',body:JSON.stringify({room_id:room.id,storage_path:path,original_name:file.name,uploaded_by:cloud.user.id})});await cloudLoad()}
function syncRows(data,pid){const rooms=new Map(),tasks=new Map();for(const [floor,list] of Object.entries(data||{}))for(const room of list){if(!/^[0-9a-f-]{36}$/i.test(room.id||''))continue;rooms.set(room.id,{id:room.id,revision:room.revision,project_id:pid,floor:Number(floor),name:room.name,length_m:numeric(room.length),width_m:numeric(room.width),height_m:numeric(room.height),area_m2:numeric(room.area),notes:room.notes||''});for(const t of room.tasks||[])if(/^[0-9a-f-]{36}$/i.test(t.id||''))tasks.set(t.id,{id:t.id,revision:t.revision,room_id:room.id,title:t.text,done:!!t.done,trade:t.trade||'',priority:t.priority||'normal',due_date:t.due_date||null,assigned_to:t.assigned_to||null,assigned_to_all:!!t.assigned_to_all})}return {rooms,tasks}}
function changedFields(before,after){return Object.fromEntries(Object.entries(after).filter(([k,v])=>k!=='id'&&k!=='project_id'&&k!=='room_id'&&k!=='revision'&&(!before||before[k]!==v)))}
async function cloudPush(){
 if(!['owner','editor'].includes(cloud.role)||!cloud.project||cloud.pushing||!cloud.dirty||drafts?.pending||drafts?.hasConflict)return;
 if(cloud.loading||modelSaving){cloud.timer=setTimeout(cloudPush,1000);return;}
 const pid=cloud.project,user=cloud.user?.id,valid=()=>pid===cloud.project&&user===cloud.user?.id&&['owner','editor'].includes(cloud.role)&&!!cloud.token;
 cloud.pushing=true;
 try{
  cs('Speichere Änderungen in der Cloud …');
  for(const list of Object.values(projectData))for(const r of list){if(!/^[0-9a-f-]{36}$/i.test(r.id||''))r.id=uid();for(const t of r.tasks||[])if(!/^[0-9a-f-]{36}$/i.test(t.id||''))t.id=uid();}
  persistDraft();
  const submitted=JSON.parse(JSON.stringify(projectData)),before=syncRows(JSON.parse(cloud.lastSnapshot||'{}'),pid),after=syncRows(submitted,pid);
  async function patch(table,row,old){
   if(!valid())throw Error('Sitzung geändert');
   const delta=changedFields(old,row);if(old&&!Object.keys(delta).length)return;
   const body=old?delta:Object.fromEntries(Object.entries(row).filter(([k])=>k!=='revision'));
   let result=await api(table,old?'?id=eq.'+row.id:'?on_conflict=id',{method:old?'PATCH':'POST',expected:old?.revision,headers:{Prefer:old?'return=representation':'resolution=ignore-duplicates,return=representation'},body:JSON.stringify({...body,updated_at:new Date().toISOString()})});
   if(!old&&result?.length===0){const existing=await api(table,'?id=eq.'+row.id+'&select=*');if(existing.length===1&&Object.entries(body).every(([k,v])=>existing[0][k]===v))result=existing;}
   if(!Array.isArray(result)||result.length!==1)throw new PanageiSafety.ConflictError();
   if(!valid())throw Error('Sitzung geändert');
   const revision=result[0].revision;
   for(const data of [projectData,submitted])for(const list of Object.values(data))for(const r of list){if(table==='umbau_rooms'&&r.id===row.id)r.revision=revision;for(const t of r.tasks||[])if(table==='umbau_tasks'&&t.id===row.id)t.revision=revision;}
   // Checkpoint each acknowledged row so a later failure can be retried safely.
   const baseline=JSON.parse(cloud.lastSnapshot||'{}');
   if(table==='umbau_rooms'){
    const incoming=Object.values(submitted).flat().find(r=>r.id===row.id),floor=String(row.floor);
    const existing=Object.values(baseline).flat().find(r=>r.id===row.id);
    if(existing)Object.assign(existing,{...incoming,tasks:existing.tasks});
    else (baseline[floor]??=[]).push({...incoming,tasks:[]});
   }else{
    const room=Object.values(baseline).flat().find(r=>r.id===row.room_id),incoming=Object.values(submitted).flat().flatMap(r=>r.tasks||[]).find(t=>t.id===row.id);
    room.tasks=(room.tasks||[]).filter(t=>t.id!==row.id);room.tasks.push({...incoming});
   }
   cloud.lastSnapshot=JSON.stringify(baseline);persistDraft();
  }
  for(const [id,row] of after.rooms)await patch('umbau_rooms',row,before.rooms.get(id));
  for(const [id,row] of after.tasks)await patch('umbau_tasks',row,before.tasks.get(id));
  for(const [id,row] of before.tasks)if(!after.tasks.has(id)){
   if(!valid())throw Error('Sitzung geändert');
   await api('umbau_tasks','?id=eq.'+id+'&room_id=eq.'+row.room_id,{method:'DELETE',expected:row.revision});
   const baseline=JSON.parse(cloud.lastSnapshot);for(const list of Object.values(baseline))for(const r of list)r.tasks=(r.tasks||[]).filter(t=>t.id!==id);cloud.lastSnapshot=JSON.stringify(baseline);persistDraft();
  }
  if(!valid())return;
  cloud.lastSnapshot=JSON.stringify(submitted);
  cloud.dirty=JSON.stringify(syncComparable(projectData,pid))!==JSON.stringify(syncComparable(submitted,pid));
  persistDraft();cs(cloud.dirty?'Weitere Änderungen stehen aus …':'Alle Änderungen in der Cloud gespeichert');
 }catch(e){if(valid()){cloud.dirty=true;if(e.name==='ConflictError'){drafts?.conflict();}persistDraft();cs('Speichern fehlgeschlagen: '+e.message);}}
 finally{cloud.pushing=false;if(valid())void loadActivity();if(valid()&&cloud.queued&&!drafts?.hasConflict){cloud.queued=false;cloudSchedule();}renderDraftStatus();}
}
function syncComparable(data,pid){const s=syncRows(data,pid);return {rooms:[...s.rooms],tasks:[...s.tasks]};}

function applyPanageiRole(){
 const viewer=cloud.role==='viewer';document.body.classList.toggle('panagei-viewer',viewer);
 document.getElementById('cloudInvite').hidden=cloud.role!=='owner';
 const panel=document.getElementById('projectPanel');if(!panel)return;
 panel.querySelectorAll('input,textarea,button').forEach(el=>{
   if(el.id==='exportData')return;
   if(viewer){el.disabled=true;el.readOnly=true;}
 });
}

function cloudSchedule(){if(!cloud.role||cloud.role==='viewer')return;if(!cloud.project)return;cloud.dirty=true;persistDraft();renderDraftStatus();if(cloud.pushing){cloud.queued=true;return}clearTimeout(cloud.timer);cloud.timer=setTimeout(cloudPush,850)}
// Existing UI photo handler is replaced with Cloud Storage uploads while logged in.
const originalUpdatePanel=updatePanel;
updatePanel=function(){originalUpdatePanel();if(cloud.role==='viewer')applyPanageiRole();if(!D||selected==='all')return;document.querySelectorAll('#roomCards .roomCard').forEach((card,i)=>{const room=getRooms(+selected)[i];const input=card.querySelector('.photoInput');if(!input)return;input.onchange=async e=>{if(!cloud.project||!cloud.role||cloud.role==='viewer')return;for(const file of [...e.target.files]){try{cs('Lade '+file.name+' hoch …');await cloudUploadPhoto(file,room)}catch(err){cs('Foto-Upload fehlgeschlagen: '+err.message)}}}})};
// Explicit local-to-cloud migration: never silently overwrite cloud data.
document.getElementById('cloudSignIn').onclick=()=>cloudAuth('login');document.getElementById('cloudSignUp').hidden=true;

document.getElementById('cloudInvite').onclick=async()=>{if(cloud.role!=='owner')return;if(!cloud.project)return alert('Zuerst Projekt auswählen');const email=prompt('E-Mail der bereits registrierten Person:');if(!email)return;const role=confirm('Soll die Person Aufgaben bearbeiten dürfen? OK = Bearbeiten, Abbrechen = Nur lesen')?'editor':'viewer';try{await cloudFetch('/rest/v1/rpc/umbau_add_member_by_email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_project_id:cloud.project,p_email:email,p_role:role})});cs('Mitglied hinzugefügt. Die Person kann sich jetzt anmelden.')}catch(e){cs('Mitglied hinzufügen fehlgeschlagen: '+e.message+' (Zusatz-SQL ausgeführt?)')}};
document.getElementById('cloudRefresh').onclick=async()=>{if(cloud.pushing||cloud.loading)return;if(cloud.dirty&&!confirm('Ungespeicherte lokale Änderungen verwerfen?'))return;discardOwnDraft();clearTimeout(cloud.timer);cloud.dirty=false;clearHistory();await cloudLoad()};
document.getElementById('cloudLogout').onclick=async()=>{if(cloud.pushing){cs('Speichern läuft. Bitte anschließend abmelden.');return}if((cloud.dirty||document.querySelector('form[data-dirty="true"]'))&&!confirm('Ungespeicherte Änderungen verwerfen und abmelden?'))return;try{await window.panageiDeactivatePushOnLogout?.()}catch(e){cs('Push-Abmeldung fehlgeschlagen. Bitte erneut versuchen oder Push in den Einstellungen deaktivieren.');return}try{await cloudFetch('/auth/v1/logout?scope=local',{method:'POST'});}catch(e){if(e.status!==401&&e.status!==403){cs('Abmeldung konnte nicht bestätigt werden. Bitte Verbindung prüfen und erneut abmelden.');return;}}discardOwnDraft();clearTimeout(refreshRetry);stopProjectRealtime();clearTimeout(cloud.timer);clearHistory();clearPrivatePlans();clearModel();cloud.token=null;cloud.refresh=null;cloud.user=null;cloud.project=null;cloud.dirty=false;sessionStorage.removeItem('umbau26_auth');localStorage.removeItem('umbau26_auth');sessionStorage.removeItem('panagei-welcome-account');document.getElementById('cloudLogin').hidden=false;document.getElementById('cloudLogged').hidden=true;projectData={};updatePanel();window.location.replace(window.location.pathname);cs('Abgemeldet')};
document.addEventListener('DOMContentLoaded',async()=>{try{const saved=JSON.parse(localStorage.getItem('umbau26_auth')||sessionStorage.getItem('umbau26_auth')||'null');if(saved?.refresh){cloud.refresh=saved.refresh;await cloudRefreshToken();if(cloud.token)await cloudInit()}}catch(e){cs('Bitte anmelden: '+e.message)}});
let realtimeJoined=false;let realtimeSocket=null,realtimeProject=null,realtimeUser=null,realtimeHeartbeat=null,realtimeRetry=null,realtimeRef=0,realtimePending=false,realtimeRevision=null,realtimeReading=false;
function rtSend(event,payload,topic='realtime:panagei-project'){if(realtimeSocket?.readyState===1){const ref=String(++realtimeRef);realtimeSocket.send(JSON.stringify({topic,event,payload,ref}));return ref}}
function updateRealtimeToken(){if(cloud.token)rtSend('access_token',{access_token:cloud.token})}
function stopProjectRealtime(){realtimeJoined=false;const s=realtimeSocket;realtimeSocket=null;realtimeProject=null;realtimeUser=null;realtimeRevision=null;realtimePending=false;clearInterval(realtimeHeartbeat);clearTimeout(realtimeRetry);if(s){s.onclose=null;s.close()}}
function startProjectRealtime(){if(!cloud.project||!cloud.role||!cloud.token||document.hidden)return;if(realtimeProject===cloud.project&&realtimeUser===cloud.user?.id&&realtimeSocket&&realtimeSocket.readyState<=1)return;stopProjectRealtime();const pid=cloud.project,user=cloud.user?.id;realtimeProject=pid;realtimeUser=user;try{const ws=new WebSocket(CLOUD_URL.replace(/^https:/,'wss:')+'/realtime/v1/websocket?apikey='+encodeURIComponent(CLOUD_KEY)+'&vsn=1.0.0');realtimeSocket=ws;ws.onopen=()=>{if(ws!==realtimeSocket)return;rtSend('phx_join',{config:{broadcast:{ack:false,self:false},presence:{key:''},postgres_changes:[{event:'*',schema:'public',table:'umbau_project_changes',filter:'project_id=eq.'+pid}]},access_token:cloud.token});realtimeHeartbeat=setInterval(()=>rtSend('heartbeat',{},'phoenix'),25000);void checkProjectRevision()};ws.onmessage=e=>{if(ws!==realtimeSocket)return;try{const m=JSON.parse(e.data);if(m.event==='phx_reply'&&m.topic==='realtime:panagei-project'&&m.payload?.status==='ok'){realtimeJoined=true;}else if(m.event==='postgres_changes'){realtimePending=true;void applyRealtime()}else if(m.event==='phx_error'||m.event==='phx_close'){ws.close()}}catch{}};ws.onclose=()=>{if(ws!==realtimeSocket)return;realtimeSocket=null;realtimeJoined=false;clearInterval(realtimeHeartbeat);if(!document.hidden&&cloud.project===pid&&cloud.user?.id===user)realtimeRetry=setTimeout(startProjectRealtime,5000)};ws.onerror=()=>ws.close()}catch{realtimeRetry=setTimeout(startProjectRealtime,10000)}}
async function checkProjectRevision(){if(realtimeReading||document.hidden||!cloud.project||!cloud.role)return;const pid=cloud.project,user=cloud.user?.id;realtimeReading=true;try{const rows=await api('umbau_project_changes','?select=revision&project_id=eq.'+encodeURIComponent(pid));if(pid!==cloud.project||user!==cloud.user?.id)return;const rev=rows?.[0]?.revision;if(realtimeRevision!==rev){realtimeRevision=rev;realtimePending=true;}await applyRealtime()}catch{}finally{realtimeReading=false}}
async function applyRealtime(){if(!realtimePending||document.hidden||!cloud.project||!cloud.role||syncBlocked())return;realtimePending=false;await cloudLoad()}
setInterval(()=>{if(!document.hidden){startProjectRealtime();void checkProjectRevision();void applyRealtime();}},10000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){startProjectRealtime();realtimePending=true;void applyRealtime()}});
setInterval(async()=>{if(document.hidden)return;if(cloud.refresh&&!await cloudRefreshToken())return;if(cloud.project&&!cloud.dirty&&!cloud.pushing&&!modelSaving&&!document.activeElement?.matches('input,textarea,select')&&!document.querySelector('form[data-dirty="true"]'))await cloudLoad()},120000);

$('level').onchange=e=>{selected=e.target.value;zoom=1;modelSelection=null;refreshModelRooms();showModelSelection();updatePanel();render()};$('top').onclick=()=>{angle=0;tilt=0;render()};$('iso').onclick=()=>{angle=-.5;tilt=.9;zoom=1;render()};const touches=new Map();let pinchDistance=null,renderQueued=false;

const elementLabels={wall:'Wand',slab:'Decke / Bodenplatte',step:'Treppenstufe',landing:'Podest',rail:'Geländer',entrance:'Eingang',column:'Stütze',beam:'Träger',window:'Fenster',door:'Tür'};
const modelNumber=v=>v==null||v===''||!Number.isFinite(Number(v))?'Nicht erfasst':Number(v).toLocaleString('de-DE',{maximumFractionDigits:2});
function refreshModelRooms(){
 const select=$('modelRoomSelect');if(!select)return;
 select.replaceChildren(new Option('Kein Raum ausgewählt',''));
 for(const [floor,rooms] of Object.entries(projectData)){if(selected!=='all'&&Number(floor)!==Number(selected))continue;for(const room of rooms){select.add(new Option((selected==='all'?(D?.levels[floor]?.name||'Etage '+floor)+' · ':'')+room.name,room.id))}}
 select.value=modelSelection?.kind==='room'?modelSelection.id:'';
}
function modelRoomById(id){for(const [floor,rooms] of Object.entries(projectData)){const room=rooms.find(r=>r.id===id);if(room)return {room,floor:Number(floor)}}return null}
function roomByAlias(floor,names){return (projectData[String(floor)]||[]).find(r=>names.some(n=>normalizeRoom(n)===normalizeRoom(r.name)))}
function drawModelLabels(d){
 modelLabels=[];if(selected==='all'||onlyStairs||![1,2].includes(+selected))return;
 const floor=+selected,regions=floor===1?taskRegions:ogRegions,z=D.levels[floor].z+D.levels[floor].height+.1;
 ctx.save();ctx.font=600+' '+Math.max(11,12*d)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
 for(const r of regions){
  const names=floor===1?r[5]:r[2],room=roomByAlias(floor,names||[r[0]]),point=floor===1?[(r[1]+r[3])/2,(r[2]+r[4])/2]:[r[1].reduce((a,p)=>a+p[0],0)/r[1].length,r[1].reduce((a,p)=>a+p[1],0)/r[1].length];
  const p=project([point[0],point[1],z]),active=modelSelection?.kind==='room'&&modelSelection.id===room?.id&&!!room,label=room?.name||r[0],w=ctx.measureText(label).width+14*d,h=21*d;
  ctx.fillStyle=active?'#e3a84b':'rgba(247,246,236,.90)';ctx.fillRect(p[0]-w/2,p[1]-h/2,w,h);ctx.fillStyle='#193e32';ctx.fillText(label,p[0],p[1]);modelLabels.push({x:p[0]-w/2,y:p[1]-h/2,w,h,room,label,floor});
 }ctx.restore();
}
function pickModel(e){
 if(!D||taskMode())return;const rect=c.getBoundingClientRect();if(!rect.width||!rect.height)return;
 const x=Math.floor((e.clientX-rect.left)*c.width/rect.width),y=Math.floor((e.clientY-rect.top)*c.height/rect.height);
 if(x<0||y<0||x>=c.width||y>=c.height)return;
 const label=[...modelLabels].reverse().find(l=>x>=l.x&&x<=l.x+l.w&&y>=l.y&&y<=l.y+l.h);
 if(label){modelSelection=label.room?{kind:'room',id:label.room.id}:{kind:'region',name:label.label,floor:label.floor};}
 else{const index=modelPick?.[y*c.width+x]??-1;modelSelection=index===-1?null:{kind:'element',index};}
 refreshModelRooms();showModelSelection();requestRender();
}
function showModelSelection(){
 const root=$('modelSelectionDetails'),status=$('modelEditStatus');if(!root)return;root.replaceChildren();status.textContent='';
 const add=(tag,t,parent=root)=>{const el=document.createElement(tag);el.textContent=t;parent.append(el);return el};
 const rows=(pairs)=>{const dl=document.createElement('dl');for(const [label,value] of pairs){add('dt',label,dl);add('dd',value,dl)}root.append(dl)};
 if(!modelSelection){add('p','Noch keine Auswahl.');return;}
 if(modelSelection.kind==='region'){add('h4',modelSelection.name);add('p','Für diesen Bereich besteht noch kein Raumdatensatz. Raumverwaltung zuerst ergänzen.');return;}
 if(modelSelection.kind==='element'){
  if(modelSelection.index===-2){add('h4','Dach');add('p','Modellgeometrie – vorläufiger Planungsstand.');rows([['Firsthöhe',modelNumber(D.roof.ridge)+' m'],['Dachneigung',modelNumber(D.roof.angle)+'°']]);return;}
  const b=D?.elements[modelSelection.index];if(!b)return;add('h4',elementLabels[b.kind]||b.kind);rows([['Stockwerk',D.levels[b.level]?.name||'Nicht erfasst'],['Länge (X)',modelNumber(b.w)+' m'],['Breite (Y)',modelNumber(b.d)+' m'],['Höhe (Z)',modelNumber(b.h)+' m'],['Unterkante',modelNumber(b.z)+' m']]);add('p','Maße aus dem digitalen Modell; keine geprüften Aufmaßdaten.');return;
 }
 const match=modelRoomById(modelSelection.id);if(!match){add('p','Raum nicht mehr verfügbar.');return;}
 const {room,floor}=match;add('h4',room.name);add('p',D?.levels[floor]?.name||'');
 const form=document.createElement('form');form.id='modelDimensionForm';form.dataset.draftRoom=room.id;form.dataset.expectedRevision=room.revision;form.addEventListener('input',()=>{form.dataset.dirty='true'});root.append(form);
 const fields=[['length','length_m','Länge (m)'],['width','width_m','Breite (m)'],['height','height_m','Höhe (m)'],['area','area_m2','Fläche (m²)']];
 const grid=document.createElement('div');grid.className='inspector-grid';form.append(grid);
 const writable=['owner','editor'].includes(cloud.role);
 for(const [local,db,title] of fields){const label=document.createElement('label');label.textContent=title;const input=document.createElement('input');input.name=db;input.type='number';input.min='0.01';input.step='any';input.value=room[local]??'';input.placeholder='Nicht erfasst';input.disabled=!writable;label.append(input);grid.append(label)}
 add('p','Raummaße und die 3D-Geometrie sind getrennte Daten. Eine Änderung hier verformt das 3D-Modell nicht.',form);
 if(writable){const btn=add('button','Raummaße speichern',form);btn.type='submit';form.onsubmit=async e=>{e.preventDefault();if(!form.reportValidity()||modelSaving)return;if(cloud.dirty||cloud.pushing||cloud.loading){status.textContent='Laufende Synchronisierung abwarten und erneut speichern.';return;}const pid=cloud.project,id=room.id;if(!pid||!['owner','editor'].includes(cloud.role)||!modelRoomById(id))return;const values={},local={};for(const [key,db] of fields){const v=form.elements.namedItem(db).value;values[db]=v===''?null:Number(v);if(values[db]!==null&&(!Number.isFinite(values[db])||values[db]<=0)){status.textContent='Bitte gültige positive Maße eintragen.';return;}local[key]=values[db]??''}modelSaving=true;btn.disabled=true;status.textContent='Speichere…';try{const data=await api('umbau_rooms','?id=eq.'+encodeURIComponent(id)+'&project_id=eq.'+encodeURIComponent(pid),{method:'PATCH',expected:form.dataset.expectedRevision??room.revision,headers:{Prefer:'return=representation'},body:JSON.stringify({...values,updated_at:new Date().toISOString()})});if(!Array.isArray(data)||data.length!==1)throw Error('Keine Schreibberechtigung oder Raum nicht gefunden');if(cloud.project===pid){Object.assign(modelRoomById(id)?.room||room,{...local,revision:data[0].revision});try{const baseline=JSON.parse(cloud.lastSnapshot||'{}');for(const list of Object.values(baseline))for(const r of list)if(r.id===id)Object.assign(r,{...local,revision:data[0].revision});cloud.lastSnapshot=JSON.stringify(baseline)}catch{}form.dataset.expectedRevision=data[0].revision;form.dataset.dirty='false';queueMicrotask(persistDraft);updatePanel();status.textContent='Raummaße in Supabase gespeichert.'}}catch(err){status.textContent='Speichern fehlgeschlagen: '+err.message}finally{modelSaving=false;btn.disabled=false;if(cloud.dirty)cloudSchedule()}};}
 const open=add('button','Zu Raum und Aufgaben');open.type='button';open.onclick=()=>{const target=$('panageiTaskLevel');target.value=String(floor);window.panageiOpenPage?.('aufgaben');target.dispatchEvent(new Event('change',{bubbles:true}));const card=[...panel.querySelectorAll('.roomCard')].find(el=>el.dataset.roomId===room.id);if(card){card.open=true;card.scrollIntoView({block:'start',behavior:'smooth'})}};
}
$('modelRoomSelect').onchange=e=>{const id=e.target.value,match=modelRoomById(id);if(match&&selected==='all'){$('level').value=String(match.floor);selected=String(match.floor);zoom=1;updatePanel()}modelSelection=id?{kind:'room',id}:null;refreshModelRooms();showModelSelection();requestRender()};
$('modelClearSelection').onclick=()=>{modelSelection=null;refreshModelRooms();showModelSelection();requestRender()};


const priorityOptions=[['low','Niedrig'],['normal','Normal'],['high','Hoch'],['urgent','Dringend']];
const taskFilters={trade:'',priority:'',room:'',status:'open',assignee:''};
const workspaces=[];
let workspaceEpoch=0;
const node=(tag,text,parent,cls)=>{const el=document.createElement(tag);if(text!=null)el.textContent=text;if(cls)el.className=cls;if(parent)parent.append(el);return el};
const optionList=(select,options)=>{select.replaceChildren(...options.map(([value,label])=>new Option(label,value)))};
window.panageiPushRequest=(action,data={})=>cloudFetch('/functions/v1/panagei-push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,project_id:cloud.project,...data})});
window.panageiSettingsContext=()=>({role:cloud.role,user:cloud.user?.id,project:cloud.project,name:accountDisplayName()});
window.panageiCanReload=()=>!cloud.dirty&&!cloud.pushing&&!cloud.loading&&!modelSaving&&!workspaces.some(w=>w.busy)&&!document.querySelector('form[data-dirty="true"]')&&!document.activeElement?.matches('input,textarea,select');
const writableWorkspace=()=>!!cloud.project&&!!cloud.token&&['owner','editor'].includes(cloud.role);
const allRooms=()=>Object.entries(projectData).flatMap(([floor,rooms])=>rooms.filter(r=>/^[0-9a-f-]{36}$/i.test(r.id)).map(r=>({...r,floor,label:(D?.levels[floor]?.name||'Etage '+floor)+' · '+r.name})));
const roomName=id=>allRooms().find(r=>r.id===id)?.label||'Projekt gesamt';
const todayLocal=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const fmtDate=v=>v?String(v).split('-').reverse().join('.'):'—';
const money=v=>Number(v||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});

const searchNormalize=value=>String(value??'').toLocaleLowerCase('de-DE').replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const searchMatches=(entry,query)=>searchNormalize(query).trim().split(/\s+/).filter(Boolean).every(word=>searchNormalize([entry.title,entry.kind,entry.detail,entry.extra].join(' ')).includes(word));
const searchWorkspaces={umbau_appointments:['Termin','calendar'],umbau_materials:['Material','aufgaben'],umbau_costs:['Kosten','kosten']};
function searchEntries(){
 if(!cloud.role||!cloud.project||!cloud.token)return [];
 const entries=[];
 for(const r of allRooms()){
  entries.push({kind:'Raum',title:r.name,detail:r.label,extra:r.notes,room:r.id});
  for(const t of r.tasks||[])entries.push({kind:'Aufgabe',title:t.text,detail:r.label+' · '+(t.done?'Erledigt':'Offen'),extra:[t.trade,t.due_date,fmtDate(t.due_date)].join(' '),room:r.id,task:t.id});
  for(const f of r.cloudFiles||[])entries.push({kind:'Foto',title:f.original_name||'Raumfoto',detail:r.label,room:r.id});
 }
 for(const t of scopedTasks())entries.push({kind:'Aufgabe',title:t.title,detail:taskScopeLabel(t.floor)+' · '+(t.done?'Erledigt':'Offen'),extra:t.trade,scopedTask:t.id});
 for(const w of workspaces){const def=searchWorkspaces[w.table];if(!def||w.pid!==cloud.project)continue;for(const row of w.rows){
  entries.push({kind:w.table==='umbau_archive'?(row.category||def[0]):def[0],title:row.title||w.title,detail:[row.room_id?roomName(row.room_id):'',row.trade,row.event_date?fmtDate(row.event_date):'',row.event_time?.slice(0,5),row.category].filter(Boolean).join(' · ')||w.title,extra:[row.notes,row.document_date,row.entry_date,row.next_due,row.event_date,row.unit].join(' '),workspace:w.table,id:row.id,page:def[1]});
 }}
 for(const name of modelPayload?.planNames||[])if(typeof name==='string'&&!name.includes('/')&&!name.includes('..'))entries.push({kind:'Bauplan',title:name,detail:'Originalunterlagen',plan:name});
 return entries;
}
function revealTarget(el,focus=false){if(!el)return;requestAnimationFrame(()=>{if(!el.isConnected)return;el.scrollIntoView({block:'center',behavior:'smooth'});if(focus)el.focus?.({preventScroll:true});el.classList.add('panagei-search-highlight');setTimeout(()=>el.classList.remove('panagei-search-highlight'),1800)})}
function openRoomSearch(id,taskId,create=false){
 const room=allRooms().find(r=>r.id===id);if(!room||!cloud.role)return false;
 const current=$('panageiTaskLevel');if(!current||![...current.options].some(o=>o.value===String(room.floor)))return false;
 if(document.querySelector('#roomCards .newTask')&&[...document.querySelectorAll('#roomCards .newTask')].some(el=>el.value.trim())&&!confirm('Noch nicht hinzugefügte Aufgabeneingaben verwerfen?'))return false;
 window.panageiOpenPage?.('aufgaben');current.value=String(room.floor);current.dispatchEvent(new Event('change',{bubbles:true}));
 const card=[...document.querySelectorAll('#roomCards .roomCard')].find(el=>el.dataset.roomId===id);if(!card)return false;card.open=true;highlightedTaskRoom=id;const notice=$('panageiPlanNotice');if(notice)notice.textContent='';requestRender();
 const target=create?card.querySelector('.newTask'):taskId?[...card.querySelectorAll('[data-task-id]')].find(el=>el.dataset.taskId===taskId):card;
 revealTarget(target||card,create);return true;
}
function openSearchEntry(entry){
 if(!cloud.role||!cloud.project||!cloud.token)return;
 if(entry.scopedTask){openScopedTask(entry.scopedTask);return}
 if(entry.room){if(entry.kind==='Raum')selectRoomCenter(entry.room);else openRoomSearch(entry.room,entry.task);return}
 if(entry.plan){window.panageiOpenPage?.('infos');const img=[...document.querySelectorAll('[data-plan]')].find(el=>el.dataset.plan===entry.plan);const details=img?.closest('details');if(details){details.open=true;revealTarget(details)}return}
 const w=workspaces.find(x=>x.table===entry.workspace&&x.pid===cloud.project);if(!w||!w.rows.some(r=>r.id===entry.id))return;
 const date=w.table==='umbau_appointments'?w.rows.find(r=>r.id===entry.id)?.event_date:null;
 if(date&&date!==calendarDay&&!w.busy&&!$(w.root)?.querySelector('form[data-dirty="true"]')){calendarDay=date;renderWorkspace(w)}
 if(entry.page!=='calendar'||$('panageiCalendarPage').hidden)window.panageiOpenPage?.(entry.page);const root=$(w.root);let target=[...root.querySelectorAll('[data-entry-id]')].find(el=>el.dataset.entryId===entry.id);
 if(!target&&!w.busy&&!root.querySelector('form[data-dirty="true"]')){if(w.table==='umbau_archive'){Object.keys(archiveFilters).forEach(k=>archiveFilters[k]='')}if(w.table==='umbau_diary'){diaryFilters.from='';diaryFilters.to='';diaryFilters.search=''}renderWorkspace(w);target=[...root.querySelectorAll('[data-entry-id]')].find(el=>el.dataset.entryId===entry.id)}
 if(target?.closest('details.invoice-list'))target.closest('details.invoice-list').open=true;
 revealTarget(target||root);
 if(!target)alert('Der Treffer liegt in einer gefilterten Liste. Bitte zuerst Eingaben speichern und die Filter zurücksetzen.');
}
function renderGlobalSearch(){
 const root=$('panageiGlobalSearch');if(!root)return;
 if(!cloud.role||!cloud.project||!cloud.token){root.replaceChildren();return}
 let input=root.querySelector('input'),filter=root.querySelector('select'),results=root.querySelector('.global-search-results');
 if(!input){
  const fields=node('div',null,root,'global-search-fields');const label=node('label','Projekt durchsuchen',fields);input=node('input',null,label);input.type='search';input.placeholder='z. B. Bad, Rechnung oder Termin';input.maxLength=160;input.autocomplete='off';input.setAttribute('aria-label','Globale Projektsuche');
  const lab=node('label','Bereich',fields);filter=node('select',null,lab);optionList(filter,[['','Alle Bereiche'],...['Raum','Aufgabe','Dokument','Bauplan','Foto','Technik','Wartung','Termin','Material','Kosten','Bautagebuch'].map(x=>[x,x])]);
  results=node('div',null,root,'global-search-results');results.setAttribute('aria-live','polite');input.addEventListener('input',renderGlobalSearch);filter.addEventListener('change',renderGlobalSearch);
 }
 results.replaceChildren();const query=input.value.trim();if(!query&&!filter.value){node('p','Räume, Aufgaben, Unterlagen, Termine und Material zentral finden.',results,'global-search-hint');return}
 const entries=searchEntries().filter(e=>(!filter.value||e.kind===filter.value)&&searchMatches(e,query));
 node('p',entries.length+' Treffer'+(entries.length>40?' · erste 40 angezeigt':''),results,'global-search-hint');
 for(const entry of entries.slice(0,40)){const b=node('button',null,results,'global-search-result');b.type='button';node('span',entry.kind,b,'global-search-kind');const info=node('span',null,b);node('strong',entry.title,info);node('small',entry.detail,info);b.onclick=()=>openSearchEntry(entry)}
 if(!entries.length)node('p','Keine passenden geladenen Einträge.',results,'global-search-hint');
}
function quickWorkspace(table,page){
 if(!writableWorkspace())return;const w=workspaces.find(x=>x.table===table&&x.pid===cloud.project);window.panageiOpenPage?.(page);if(!w){alert('Daten werden noch geladen. Bitte erneut versuchen.');return}
 const root=$(w.root);if(w.busy){revealTarget(root);return}const existing=root.querySelector('form');if(existing?.dataset.dirty==='true'){revealTarget(existing);return}if(w.edit!==null){w.edit=null;renderWorkspace(w)}const form=root.querySelector('form');revealTarget(form?.elements.namedItem('title')||form,true);
}
function renderQuickActions(){
 const root=$('panageiQuickActions');if(!root)return;root.replaceChildren();if(!writableWorkspace())return;
 const actions=[['Neue Aufgabe',()=>{window.panageiOpenPage?.('aufgaben');revealTarget($('taskAssignmentForm')?.querySelector('select'),true)}],['Neuer Termin',()=>quickWorkspace('umbau_appointments','calendar')]];
 node('h3','Schnellaktionen',root);const grid=node('div',null,root,'quick-action-grid');for(const [label,run] of actions){const b=node('button','＋ '+label,grid);b.type='button';b.onclick=run}
}

let activeRoomCenter='';
const openRoomFloors=new Set();
function roomRelatedRows(workspace,roomId,project){return workspace?.pid===project?workspace.rows.filter(r=>r.room_id===roomId):null}
function roomCenterData(room,project,spaces){
 const get=table=>roomRelatedRows(spaces.find(w=>w.table===table),room.id,project);
 const archive=get('umbau_archive'),materials=get('umbau_materials'),costs=get('umbau_costs')?.filter(isInvoice)??null,diary=get('umbau_diary'),appointments=get('umbau_appointments');
 const tasks=room.tasks||[],dates=[...tasks.filter(t=>!t.done&&t.due_date).map(t=>({title:t.text,date:t.due_date,task:t.id})),...(archive||[]).filter(a=>a.category==='Wartung'&&a.next_due).map(a=>({title:a.title,date:a.next_due,id:a.id})),...(appointments||[]).map(a=>({title:a.title,date:a.event_date,time:a.event_time,appointment:a.id}))].sort((a,b)=>a.date.localeCompare(b.date));
 return {archive,materials,costs,diary,tasks,dates,photos:room.cloudFiles||[],done:tasks.filter(t=>t.done).length,planned:costs?.reduce((sum,r)=>sum+Number(r.planned||0),0),actual:costs?.reduce((sum,r)=>sum+Number(r.actual||0),0)};
}
function selectRoomCenter(id){if(!cloud.role||!allRooms().some(r=>r.id===id))return;activeRoomCenter=id;openRoomFloors.add(Number(allRooms().find(r=>r.id===id).floor));window.panageiOpenPage?.('bauteile');renderRoomCenter();revealTarget($('panageiRoomCenter'))}
function roomCenterNew(table,page,roomId){
 if(!writableWorkspace())return;
 const w=workspaces.find(x=>x.table===table&&x.pid===cloud.project);
 if(!w){alert('Daten werden noch geladen. Bitte erneut versuchen.');return}
 const root=$(w.root);if(w.busy||root.querySelector('form[data-dirty="true"]')){window.panageiOpenPage?.(page);revealTarget(root.querySelector('form')||root);alert('Bitte den bestehenden Eintrag zuerst abschließen.');return}
 quickWorkspace(table,page);const form=root.querySelector('form'),field=form?.elements.namedItem('room_id');if(field&&[...field.options].some(o=>o.value===roomId)){field.value=roomId;field.dispatchEvent(new Event('change',{bubbles:true}));form.dataset.dirty='true'}
}
function renderRoomCenter(){
 const container=$('panageiRoomCenter');if(!container)return;
 container.replaceChildren();
 if(!cloud.role||!cloud.project||!cloud.token){activeRoomCenter='';openRoomFloors.clear();return;}
 const rooms=allRooms();
 if(!rooms.some(room=>room.id===activeRoomCenter))activeRoomCenter='';
 for(const [floor,label] of [[4,'Dachboden'],[3,'Dachgeschoss'],[2,'Obergeschoss'],[1,'Erdgeschoss'],[0,'Keller']]){
   const group=node('details',null,container,'room-floor');
   group.open=openRoomFloors.has(floor);
   group.ontoggle=()=>{if(!group.isConnected)return;if(group.open)openRoomFloors.add(floor);else openRoomFloors.delete(floor)};
   node('summary',label,group);
   const contents=node('div',null,group,'room-floor-content');
   const floorRooms=rooms.filter(room=>Number(room.floor)===floor);
   if(!floorRooms.length)node('p','Noch keine Räume vorhanden.',contents,'workspace-empty');
   for(const room of floorRooms){
     const button=node('button',room.name,contents,'room-floor-select');
     button.type='button';
     button.setAttribute('aria-expanded',String(activeRoomCenter===room.id));
     button.onclick=()=>{
       openRoomFloors.add(floor);
       activeRoomCenter=activeRoomCenter===room.id?'':room.id;
       renderRoomCenter();
       const next=[...container.querySelectorAll('.room-floor-select')].find(item=>item.dataset.roomId===room.id);
       next?.focus();
     };
     button.dataset.roomId=room.id;
     if(activeRoomCenter===room.id)renderRoomCenterDetails(node('div',null,contents,'room-floor-detail'),room);
   }
   if(writableWorkspace()){
     const add=node('button','＋ Raum hinzufügen',contents);
     add.type='button';
     add.onclick=()=>{
       const name=prompt('Raumname:')?.trim();
       if(!name||!writableWorkspace())return;
       const id=uid();
       getRooms(floor).push({id,name,length:'',width:'',height:'',area:'',notes:'',tasks:[],photos:[]});
       openRoomFloors.add(floor);
       activeRoomCenter=id;
       saveProject();
     };
   }
 }
}
function renderRoomCenterDetails(root,room){
 const data=roomCenterData(room,cloud.project,workspaces),top=node('div',null,root,'room-center-top');
 node('h3',room.name,top);const edit=node('button',writableWorkspace()?'Raum bearbeiten':'Raum öffnen',top);edit.type='button';edit.onclick=()=>openRoomSearch(room.id);
 const metrics=node('div',null,root,'room-center-metrics');const measure=(v,unit)=>v===''||v==null?'—':String(v).replace('.',',')+' '+unit;
 for(const [title,value] of [['Fläche',measure(room.area,'m²')],['Länge',measure(room.length,'m')],['Breite',measure(room.width,'m')],['Höhe',measure(room.height,'m')],['Aufgaben',data.done+' / '+data.tasks.length],['Ist-Kosten',data.actual==null?'…':money(data.actual)]]){const card=node('div',null,metrics);node('small',title,card);node('strong',value,card)}
 const p=node('progress',null,root);p.max=100;p.value=data.tasks.length?Math.round(data.done/data.tasks.length*100):0;p.setAttribute('aria-label','Aufgabenfortschritt im Raum');
 const groups=node('div',null,root,'room-center-grid');
 function section(title,rows,action){const box=node('section',null,groups,'room-center-section');const head=node('div',null,box,'room-center-section-head');node('h3',title+(rows===null?'':' · '+rows.length),head);if(action&&writableWorkspace()){const b=node('button','＋ Hinzufügen',head);b.type='button';b.onclick=action}if(rows===null)node('p','Daten derzeit nicht geladen.',box);else if(!rows.length)node('p','Noch keine Einträge.',box);return box}
 function line(box,title,detail,run){const b=node('button',null,box,'room-center-entry');b.type='button';node('strong',title,b);if(detail)node('small',detail,b);b.onclick=run;return b}
 const taskbox=section('Aufgaben',data.tasks,()=>openRoomSearch(room.id,null,true));for(const t of data.tasks)line(taskbox,t.text,[t.done?'Erledigt':'Offen',taskAssigneeLabel(t),t.trade,t.due_date?fmtDate(t.due_date):''].filter(Boolean).join(' · '),()=>openRoomSearch(room.id,t.id));
 const photos=section('Raumfotos',data.photos,()=>{if(openRoomSearch(room.id)){const card=[...document.querySelectorAll('#roomCards .roomCard')].find(el=>el.dataset.roomId===room.id);revealTarget(card?.querySelector('.photoInput'),true)}});for(const f of data.photos){const b=line(photos,f.original_name||'Raumfoto','Datei anzeigen',()=>{b.disabled=true;const status=node('div',null,photos);void openWorkspaceFile(f.storage_path,status).finally(()=>b.disabled=false)});}
 const materials=section('Material',data.materials,()=>roomCenterNew('umbau_materials','aufgaben',room.id));for(const r of data.materials||[])line(materials,r.title,[r.quantity,r.unit,r.purchased?'Beschafft':'Offen'].filter(v=>v!=null).join(' · '),()=>openSearchEntry({workspace:'umbau_materials',id:r.id,page:'aufgaben'}));
 const costs=section('Kosten',data.costs,()=>roomCenterNew('umbau_costs','kosten',room.id));if(data.costs!==null)node('p','Ist-Kosten '+money(data.actual),costs);for(const r of data.costs||[])line(costs,r.title,money(r.actual),()=>openSearchEntry({workspace:'umbau_costs',id:r.id,page:'kosten'}));
 const dates=section('Termine, Fristen & Wartung',data.dates,()=>roomCenterNew('umbau_appointments','calendar',room.id));for(const d of data.dates)line(dates,d.title,fmtDate(d.date)+(d.time?' · '+d.time.slice(0,5)+' Uhr':''),()=>d.appointment?openSearchEntry({workspace:'umbau_appointments',id:d.appointment,page:'calendar'}):d.id?openSearchEntry({workspace:'umbau_archive',id:d.id,page:'archiv'}):openRoomSearch(room.id,d.task));
 const notes=section('Notizen',room.notes?[room.notes]:[]);if(room.notes)node('p',room.notes,notes,'room-center-notes');
}
window.panageiRenderRoomCenter=renderRoomCenter;

let activityEpoch=0,activityRows=[],activityKey='',activityBusy=false,activityError=false,activityFilter='';
const activityKinds={umbau_appointments:'Termin',umbau_archive:'Archiv',umbau_costs:'Kosten',umbau_diary:'Bautagebuch',umbau_files:'Foto',umbau_installation_markers:'Installation',umbau_materials:'Material',umbau_model:'Hausmodell',umbau_model_versions:'Modellversion',umbau_rooms:'Raum',umbau_tasks:'Aufgabe'};
const activityActions={INSERT:'Hinzugefügt',UPDATE:'Geändert',DELETE:'Gelöscht'};
function clearActivity(){activityEpoch++;activityRows=[];activityKey='';activityBusy=false;activityError=false;activityFilter='';$('panageiActivity')?.replaceChildren();window.panageiLastSync=null}
function activityContext(){return cloud.role&&cloud.token&&cloud.project&&cloud.user?.id?cloud.project+'|'+cloud.user.id:''}
async function loadActivity(){
 const key=activityContext();if(!key||activityBusy)return;const epoch=activityEpoch;activityBusy=true;renderActivity();
 try{const rows=await api('umbau_activity','?select=id,happened_at,actor_id,entity,operation,label&project_id=eq.'+encodeURIComponent(cloud.project)+'&order=happened_at.desc,id.desc&limit=100');if(epoch!==activityEpoch||key!==activityContext())return;activityKey=key;activityRows=rows||[];activityError=false}
 catch{if(epoch===activityEpoch&&key===activityContext())activityError=true}
 finally{if(epoch===activityEpoch){activityBusy=false;renderActivity()}}
}
function renderActivity(){
 const root=$('panageiActivity');if(!root)return;root.replaceChildren();const key=activityContext();if(!key)return;
 node('small','Letzte 100 protokollierte Änderungen seit v70 · projektweit.',root);
 const bar=node('div',null,root,'activity-filter');const sel=node('select',null,bar);optionList(sel,[['','Alle Bereiche'],...Object.entries(activityKinds)]);sel.value=activityFilter;sel.setAttribute('aria-label','Änderungen filtern');sel.onchange=()=>{activityFilter=sel.value;renderActivity()};
 const refresh=node('button','Aktualisieren',bar);refresh.type='button';refresh.disabled=activityBusy;refresh.onclick=()=>void loadActivity();
 if(activityError)node('p','Änderungsverlauf konnte nicht geladen werden.',root);
 if(activityBusy)node('small','Wird aktualisiert …',root);
 const rows=activityKey===key?activityRows.filter(r=>!activityFilter||r.entity===activityFilter):[];
 if(!rows.length&&!activityBusy&&!activityError)node('p','Keine protokollierten Änderungen in dieser Auswahl.',root,'workspace-empty');
 const list=node('div',null,root,'activity-list');for(const r of rows){const item=node('div',null,list,'workspace-row');node('strong',(activityKinds[r.entity]||'Eintrag')+' · '+(activityActions[r.operation]||'Änderung'),item);if(r.label)node('p',r.label,item);node('small',new Date(r.happened_at).toLocaleString('de-DE')+' · '+(r.actor_id===cloud.user?.id?'Du':'Projektmitglied'),item)}
}
function syncBlocked(){return cloud.dirty||cloud.pushing||cloud.loading||modelSaving||workspaces.some(w=>w.busy)||!!document.querySelector('form[data-dirty="true"]')||[...document.querySelectorAll('#roomCards .newTask')].some(e=>e.value.trim())||!!document.activeElement?.matches('input,textarea,select')}


const exportTables={umbau_budgets:'Budgets',umbau_rooms:'Räume',umbau_tasks:'Aufgaben',umbau_materials:'Material',umbau_costs:'Kosten',umbau_archive:'Archiv',umbau_diary:'Bautagebuch',umbau_appointments:'Termine',umbau_installation_markers:'Installationspläne',umbau_files:'Raumfotos (Dateiverweise)',umbau_bauabschnitte:'Bauabschnitte',umbau_dokumente:'Historische Dokumente',umbau_bauteile:'Bauteile',umbau_bauteil_raeume:'Bauteilzuordnungen',umbau_gebaeudetechnik:'Gebäudetechnik',umbau_model:'Hausmodell',umbau_model_versions:'Modellstände',umbau_activity:'Änderungsverlauf'};
const csvColumns={umbau_rooms:['name','floor','area_m2','length_m','width_m','height_m','notes','id'],umbau_tasks:['title','room_id','project_id','floor','done','trade','priority','due_date','assigned_to','assigned_to_all','id'],umbau_materials:['title','room_id','trade','quantity','unit','purchased','notes','id'],umbau_costs:['title','room_id','trade','planned','actual','notes','id'],umbau_archive:['title','room_id','trade','category','document_date','next_due','interval_months','notes','storage_path','id'],umbau_diary:['title','room_id','trade','entry_date','notes','storage_path','id'],umbau_appointments:['title','category','room_id','trade','task_id','event_date','event_time','notes','reminders','id']};
function csvValue(v){if(v==null)return '""';if(typeof v==='number'&&Number.isFinite(v))return '"'+String(v).replace('.',',')+'"';let t=typeof v==='object'?JSON.stringify(v):typeof v==='boolean'?(v?'Ja':'Nein'):String(v);if(/^[\s\u0000-\u001f]*[=+\-@]/.test(t)||/^[\t\r\n]/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"'}
function exportCsv(rows,columns){return '\uFEFF'+[columns.map(csvValue).join(';'),...rows.map(r=>columns.map(c=>csvValue(r[c])).join(';'))].join('\r\n')}
let exportBusy=false,exportEpoch=0,exportStatus='',exportChoice='umbau_tasks';
function clearExport(){exportEpoch++;exportBusy=false;exportStatus='';exportChoice='umbau_tasks';$('panageiExport')?.replaceChildren()}
function downloadExport(content,type,name){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
async function readExportRows(table,pid,valid){
 if(!Object.hasOwn(exportTables,table))throw Error('Unbekannter Exportbereich');
 const indirect=table==='umbau_tasks'||table==='umbau_files';
 if(indirect){const rooms=await api('umbau_rooms','?select=id&project_id=eq.'+encodeURIComponent(pid));return readProjectRelated(table,pid,rooms);}
 const qs='?select=*'+'&project_id=eq.'+encodeURIComponent(pid)+'&order='+(table==='umbau_model'?'project_id.asc':table==='umbau_budgets'?'trade.asc':table==='umbau_bauteil_raeume'?'bauteil_id.asc,room_id.asc':'id.asc');
 if(!valid())throw Error('Sitzung geändert');const rows=await api(table,qs);if(!valid())throw Error('Sitzung geändert');return rows;
}
async function exportProject(mode){
 if(exportBusy||!activityContext()||syncBlocked())return;
 const pid=cloud.project,key=activityContext(),epoch=exportEpoch,choice=exportChoice,valid=()=>epoch===exportEpoch&&key===activityContext();exportBusy=true;exportStatus='Export wird erstellt …';renderExport();
 try{const initialRevision=mode==='json'?await api('umbau_project_changes','?select=revision&project_id=eq.'+encodeURIComponent(pid)):null;const roomRows=await readExportRows('umbau_rooms',pid,valid),roomIds=new Set(roomRows.map(r=>r.id));const read=async t=>{const rows=t==='umbau_rooms'?roomRows:await readExportRows(t,pid,valid);return t==='umbau_tasks'||t==='umbau_files'?rows.filter(r=>roomIds.has(r.room_id)||(t==='umbau_tasks'&&r.project_id===pid)):rows};
 const stamp=new Date().toISOString(),suffix=stamp.slice(0,10);
 if(mode==='csv'){const rows=await read(choice);if(!valid())return;const names=new Map(roomRows.map(r=>[r.id,r.name]));const columns=csvColumns[choice]||[...new Set(rows.flatMap(r=>Object.keys(r)))];const enriched=rows.map(r=>({...r,raum:r.room_id?names.get(r.room_id)||'':'Projekt gesamt'}));const cols=columns.includes('room_id')?['raum',...columns]:columns;downloadExport(exportCsv(enriched,cols),'text/csv;charset=utf-8','PANAGEI_'+choice.replace('umbau_','')+'_'+suffix+'.csv');exportStatus=rows.length+' Einträge für den Download erstellt.'}
 else{const revision=async()=>{const r=await api('umbau_project_changes','?select=revision&project_id=eq.'+encodeURIComponent(pid));return r?.[0]?.revision??null};const before=initialRevision?.[0]?.revision??null;const tables={};for(const t of Object.keys(exportTables)){tables[t]=await read(t)}const after=await revision();if(!valid())return;if(before!==after)throw Error('Projekt wurde während des Exports verändert. Bitte erneut exportieren.');const backup={format:'PANAGEI-project-data',version:1,app:'v73',exported_at:stamp,project_id:pid,includes_binary_files:false,restore_available:false,tables};downloadExport(JSON.stringify(backup,null,2),'application/json','PANAGEI_Datensicherung_'+suffix+'.json');exportStatus='Datensicherung für den Download erstellt.'}
 }catch(e){if(valid())exportStatus='Export fehlgeschlagen: '+e.message}finally{if(valid()){exportBusy=false;renderExport()}}
}
function renderExport(){const root=$('panageiExport');if(!root)return;if(!activityContext()){root.replaceChildren();return}if(root.querySelector('select')===document.activeElement)return;root.replaceChildren();node('p','Projektinformationen als Excel-kompatible CSV-Dateien oder gemeinsame JSON-Datensicherung herunterladen.',root);const label=node('label','Projektbereich',root),sel=node('select',null,label);optionList(sel,Object.entries(exportTables));sel.value=exportChoice;sel.disabled=exportBusy;sel.onchange=()=>{exportChoice=sel.value};const csv=node('button','CSV herunterladen',root),json=node('button','Projekt als JSON sichern',root);csv.type=json.type='button';csv.disabled=json.disabled=exportBusy;csv.onclick=()=>void exportProject('csv');json.onclick=()=>void exportProject('json');node('small','JSON enthält Projektdaten und Dateiverweise, keine PDF- oder Bilddateien, Konten oder Zugangsdaten. Kein automatischer Wiederimport. Dateien separat sichern. Exporte vertraulich aufbewahren.',root);const status=node('p',exportStatus,root);status.setAttribute('role','status');}
function renderDashboard(){
 renderExport();
 renderActivity();
 renderRoomCenter();
 renderGlobalSearch();
 renderQuickActions();
 const root=$('dashboardWorkspace');
 if(!root)return;
 root.replaceChildren();
 if(!cloud.role)return;
 const today=todayLocal();
 const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
 const tasks=[...allRooms().flatMap(r=>r.tasks||[]),...scopedTasks()];
 const complete=tasks.filter(t=>t.done).length;
 const done=tasks.length?Math.round(complete/tasks.length*100):0;
 const get=table=>workspaces.find(w=>w.table===table&&w.pid===cloud.project);
 const cost=get('umbau_costs'),material=get('umbau_materials');
 const totals=costTotals(cost?.rows||[],projectBudgetRows());
 const cards=[
   ['Aufgaben erledigt',done+' %','aufgaben'],
   ['Offene Aufgaben',String(tasks.length-complete),'aufgaben'],
   ['Restbudget',cost&&totals.budget!==null?money(totals.budget-totals.actual):budgetState.error?'Nicht verfügbar':'—','kosten'],
   ['Materialbedarf offen',material?String(material.rows.filter(r=>!r.purchased).length):'Wird geladen …','aufgaben','materialWorkspace']
 ];
 const summary=node('div',null,root,'dashboard-intro');
 node('strong','Dein Bauprojekt',summary);
 node('span',fmtDate(today),summary,'dashboard-today');
 const metrics=node('div',null,root,'workspace-metrics dashboard-metrics');
 for(const [label,value,page,target] of cards){
   const button=node('button',null,metrics);
   button.type='button';
   node('strong',value,button);
   node('small',label,button);
   button.onclick=()=>{
     window.panageiOpenPage?.(page);
     if(target)$(target)?.scrollIntoView({block:'start'});
   };
 }
 const progress=node('progress',null,root);
 progress.max=100;progress.value=done;
 progress.setAttribute('aria-label','Aufgabenfortschritt');
 node('h3','Nächste Termine',root);
 const appointments=get('umbau_appointments');
 const upcoming=appointments?.rows.filter(row=>row.event_date>today||
   (row.event_date===today&&(!row.event_time||row.event_time.slice(0,5)>=time)))
   .sort((a,b)=>(a.event_date+(a.event_time||'')).localeCompare(b.event_date+(b.event_time||'')))[0];
 if(!upcoming){
   node('p',appointments?'Keine anstehenden Termine.':'Termine werden geladen …',root,'workspace-empty');
   return;
 }
 const item=node('div',null,root,'workspace-row');
 node('strong',upcoming.title,item);
 node('small',[fmtDate(upcoming.event_date),upcoming.event_time?upcoming.event_time.slice(0,5)+' Uhr':'',upcoming.category].filter(Boolean).join(' · '),item);
}
const taskFloors=['Keller','Erdgeschoss','Obergeschoss','Dachgeschoss','Dachboden'];
let scopedTaskState={pid:null,rows:[]};
const scopedTasks=()=>scopedTaskState.pid===cloud.project?scopedTaskState.rows:[];
const taskScopeLabel=floor=>floor==null?'Projekt gesamt':taskFloors[floor]+' gesamt';
function openScopedTask(id){
 window.panageiOpenPage?.('aufgaben');
 Object.assign(taskFilters,{room:'',trade:'',priority:'',status:'all',assignee:''});
 renderRenovation();
 revealTarget([...$('renovationOverview').querySelectorAll('[data-scoped-task]')].find(row=>row.dataset.scopedTask===id));
}
async function writeScopedTask(method,values,id){
 const pid=cloud.project,user=cloud.user?.id;
 if(!writableWorkspace()||!pid)throw Error('Keine Schreibberechtigung');
 const result=await api('umbau_tasks',id?'?id=eq.'+id+'&project_id=eq.'+pid:'',{method,expected:id?scopedTasks().find(t=>t.id===id)?.revision:undefined,headers:{Prefer:'return=representation'},body:method==='DELETE'?undefined:JSON.stringify({...values,updated_at:new Date().toISOString(),...(id?{}:{project_id:pid})})});
 if(result?.length!==1)throw Error('Änderung nicht bestätigt');
 if(pid!==cloud.project||user!==cloud.user?.id||!cloud.token)return;
 const rows=scopedTasks().filter(t=>t.id!==result[0].id);
 if(method!=='DELETE')rows.push(result[0]);
 scopedTaskState={pid,rows};
 renderRenovation();
 const calendar=workspaces.find(w=>w.table==='umbau_appointments'&&w.pid===pid);
 if(calendar&&!calendar.busy&&!$(calendar.root)?.querySelector('form[data-dirty="true"]'))renderWorkspace(calendar);
 void loadActivity();
}
function renderTaskAssignmentForm(){
 const root=$('taskAssignmentForm');
 if(!root)return;
 root.hidden=!writableWorkspace();
 if(root.hidden){root.replaceChildren();return}
 const key=cloud.project+'|'+cloud.user?.id;
 if(root.firstChild&&root.dataset.context===key){const select=root.querySelector('[name=assigned_to]');if(select){const value=select.value;optionList(select,PanageiAssignments.options(taskMembers,cloud.user?.id,value));select.value=value}return;}
 root.dataset.context=key;root.replaceChildren();
 node('h2','Neue Aufgabe',root);
 const form=node('form',null,root,'workspace-form'),fields=node('div',null,form,'workspace-fields');
 const scope=wsField(fields,{key:'assignment',label:'Zuordnung',type:'select',options:[['project','Projekt gesamt'],...taskFloors.map((_,floor)=>['floor:'+floor,taskScopeLabel(floor)]),['room','Einzelner Raum']]},'project');
 const room=wsField(fields,{key:'room',label:'Raum',type:'select',options:[['','Raum auswählen']]},'');
 const title=wsField(fields,{key:'title',label:'Aufgabe',required:true},'');
 const trade=wsField(fields,{key:'trade',label:'Gewerk'},'');
 const priority=wsField(fields,{key:'priority',label:'Priorität',type:'select',options:priorityOptions},'normal');
 const date=wsField(fields,{key:'due_date',label:'Frist',type:'date'},'');
 const assignee=wsField(fields,{key:'assigned_to',label:'Zuständig',type:'select',options:taskAssigneeOptions({})},'');
 const status=node('p','',form,'workspace-status');status.setAttribute('role','status');
 const submit=node('button','Aufgabe hinzufügen',form);submit.type='submit';
 scope.onchange=()=>{
   room.disabled=scope.value!=='room';room.required=!room.disabled;
   room.closest('label').style.display=room.disabled?'none':'';
   if(!room.disabled)optionList(room,[['','Raum auswählen'],...allRooms().map(r=>[r.id,r.label])]);
 };
 scope.onchange();
 form.oninput=()=>{form.dataset.dirty='true'};
 form.onsubmit=async event=>{
   event.preventDefault();
   if(submit.disabled||!title.value.trim()||!writableWorkspace())return;
   submit.disabled=true;status.textContent='Speichere …';
   try{
     const values={title:title.value.trim(),trade:trade.value.trim(),priority:priority.value,due_date:date.value||null,...PanageiAssignments.patch(assignee.value)};
     if(scope.value==='room'){
       const selected=allRooms().find(r=>r.id===room.value);
       if(!selected)throw Error('Raum auswählen');
       const result=await api('umbau_tasks','',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({...values,room_id:selected.id})});
       if(result?.length!==1)throw Error('Änderung nicht bestätigt');
       if(root.dataset.context===key&&root.contains(form)){const t=result[0];selected.tasks.push({id:t.id,revision:t.revision,text:t.title,done:t.done,trade:t.trade,priority:t.priority,due_date:t.due_date,assigned_to:t.assigned_to||null,assigned_to_all:!!t.assigned_to_all});const baseline=JSON.parse(cloud.lastSnapshot||'{}');for(const r of Object.values(baseline).flat())if(r.id===selected.id)r.tasks.push({id:t.id,revision:t.revision,text:t.title,done:t.done,trade:t.trade,priority:t.priority,due_date:t.due_date,assigned_to:t.assigned_to||null,assigned_to_all:!!t.assigned_to_all});cloud.lastSnapshot=JSON.stringify(baseline);renderRenovation();}
     }else await writeScopedTask('POST',{...values,floor:scope.value==='project'?null:Number(scope.value.slice(6))});
     form.reset();scope.onchange();form.dataset.dirty='false';queueMicrotask(persistDraft);status.textContent='Aufgabe gespeichert.';
   }catch(error){status.textContent='Speichern fehlgeschlagen: '+error.message}
   finally{submit.disabled=false}
 };
}
function renderRenovation(){renderDashboard();renderTaskAssignmentForm();
 const root=$('renovationOverview');if(!root)return;root.replaceChildren();if(!cloud.role)return;
 const entries=[...allRooms().flatMap(r=>(r.tasks||[]).map(t=>({...t,room:r.label,room_id:r.id}))),...scopedTasks().map(t=>({...t,text:t.title,room:taskScopeLabel(t.floor),scoped:true}))];
 node('h2','Sanierungsfortschritt',root);const done=entries.filter(x=>x.done).length,pct=entries.length?Math.round(done/entries.length*100):0;
 const m=node('div',null,root,'workspace-metrics');for(const [label,value] of [['Gesamt',entries.length],['Erledigt',done],['Offen',entries.length-done],['Überfällig',entries.filter(x=>!x.done&&x.due_date&&x.due_date<todayLocal()).length]]){const card=node('div',null,m);node('strong',String(value),card);node('small',label,card)}
 const p=node('progress',null,root);p.max=100;p.value=pct;p.setAttribute('aria-label','Fortschritt '+pct+' Prozent');node('p',pct+' % erledigt',root);
 const filters=node('div',null,root,'workspace-fields');
 const opts={room:[['','Alle Zuordnungen'],['project','Projekt gesamt'],...taskFloors.map((_,floor)=>['floor:'+floor,taskScopeLabel(floor)]),...allRooms().map(r=>[r.id,r.label])],trade:[['','Alle Gewerke'],...Array.from(new Set(entries.map(t=>t.trade).filter(Boolean))).sort().map(x=>[x,x])],priority:[['','Alle Prioritäten'],...priorityOptions],status:[['open','Offen'],['done','Erledigt'],['all','Alle Aufgaben']],assignee:[['','Alle Personen'],['me','Meine Aufgaben'],['all','Gemeinsam'],['unassigned','Nicht zugewiesen'],...taskMembers.map(m=>[m.user_id,m.display_name])]};
 for(const [k,values] of Object.entries(opts)){const sel=node('select',null,filters);optionList(sel,values);sel.value=taskFilters[k];if(sel.selectedIndex<0){sel.selectedIndex=0;taskFilters[k]=sel.value}sel.setAttribute('aria-label',({room:'Zuordnung filtern',trade:'Gewerk filtern',priority:'Priorität filtern',status:'Status filtern',assignee:'Zuständigkeit filtern'})[k]||k);sel.onchange=()=>{taskFilters[k]=sel.value;renderRenovation()}}
 const filtered=entries.filter(t=>PanageiAssignments.matches(t,taskFilters.assignee,cloud.user?.id)&&(!taskFilters.room||(t.scoped?(t.floor==null?'project':'floor:'+t.floor):t.room_id)===taskFilters.room)&&(!taskFilters.trade||t.trade===taskFilters.trade)&&(!taskFilters.priority||t.priority===taskFilters.priority)&&(taskFilters.status==='all'||t.done===(taskFilters.status==='done'))).sort((a,b)=>{const x={urgent:0,high:1,normal:2,low:3};return (x[a.priority||'normal']-x[b.priority||'normal'])||String(a.due_date||'9999').localeCompare(String(b.due_date||'9999'))});
 if(!filtered.length)node('p','Keine passenden Aufgaben.',root);
 for(const t of filtered){
   const row=node('div',null,root,'workspace-row task-overview-row');
   const controls=node('div',null,row,'task-overview-controls');
   const check=node('input',null,controls);check.type='checkbox';check.checked=t.done;check.disabled=!writableWorkspace();
   check.setAttribute('aria-label',t.text+' als erledigt markieren');
   if(t.scoped)row.dataset.scopedTask=t.id;
   check.onchange=async ()=>{
     if(t.scoped){
       check.disabled=true;
       try{await writeScopedTask('PATCH',{done:check.checked},t.id)}
       catch(error){check.checked=t.done;alert('Speichern fehlgeschlagen: '+error.message)}
       finally{check.disabled=!writableWorkspace()}
       return;
     }
     const task=allRooms().find(r=>r.id===t.room_id)?.tasks?.find(item=>item.id===t.id);
     if(!task||!writableWorkspace()){check.checked=t.done;return;}
     task.done=check.checked;
     updatePanel();
     saveProject();
   };
   const jump=node('button',t.text,controls);jump.type='button';jump.onclick=()=>t.scoped?revealTarget(row):openRoomSearch(t.room_id,t.id);
   if(t.scoped&&writableWorkspace()){const remove=node('button','Löschen',controls);remove.type='button';remove.onclick=async()=>{if(!confirm('Aufgabe löschen?'))return;remove.disabled=true;try{await writeScopedTask('DELETE',{},t.id)}catch(error){alert('Löschen fehlgeschlagen: '+error.message);remove.disabled=false}}}
   const assignment=wsField(row,{key:'assigned_to',label:'Zuständig',type:'select',options:taskAssigneeOptions(t)},PanageiAssignments.value(t));
   assignment.disabled=!writableWorkspace();
   assignment.onchange=async()=>{
     const values=PanageiAssignments.patch(assignment.value);
     if(t.scoped){
       assignment.disabled=true;
       try{await writeScopedTask('PATCH',values,t.id)}
       catch(error){assignment.value=PanageiAssignments.value(t);alert('Zuweisung fehlgeschlagen: '+error.message)}
       finally{assignment.disabled=!writableWorkspace()}
     }else{
       const task=allRooms().find(r=>r.id===t.room_id)?.tasks?.find(item=>item.id===t.id);
       if(!task||!writableWorkspace())return;
       Object.assign(task,values);updatePanel();saveProject();
     }
   };
   node('small',[t.room,t.trade||'Ohne Gewerk',priorityOptions.find(x=>x[0]===t.priority)?.[1]||'Normal',t.due_date?'Frist '+fmtDate(t.due_date):'Ohne Frist',t.done?'Erledigt':'Offen'].join(' · '),row)}
}
function clearWorkspaces(){taskMembers=[];taskFilters.assignee='';scopedTaskState={pid:null,rows:[]};$('taskAssignmentForm')?.replaceChildren();budgetState={pid:null,rows:[],error:false};historicObserver?.disconnect();highlightedTaskRoom='';taskPlanTransform=null;calendarDay='';Object.assign(calendarFilters,{room:'',trade:'',kind:'',period:'open'});Object.keys(archiveFilters).forEach(k=>archiveFilters[k]='');historicState={pid:null,phase:null,phases:[],models:[],rot:-0.72,floor:'all'};$('historicWorkspace')?.replaceChildren();workspaceEpoch++;for(const w of workspaces){w.rows=[];w.pid=null;w.edit=null;w.busy=false;$(w.root)?.replaceChildren()}}
async function loadWorkspaces(){const pid=cloud.project,epoch=workspaceEpoch;if(!pid||!cloud.role)return;try{const budgets=await api('umbau_budgets','?select=trade,amount&project_id=eq.'+encodeURIComponent(pid));if(epoch!==workspaceEpoch||pid!==cloud.project||!cloud.role)return;budgetState={pid,rows:budgets,error:false}}catch(e){if(epoch!==workspaceEpoch||pid!==cloud.project)return;budgetState={pid,rows:[],error:true}}renderDashboard();for(const w of workspaces){if(w.busy||($(w.root)?.querySelector('form[data-dirty="true"]')&&w.pid===pid))continue;try{const rows=await api(w.table,'?project_id=eq.'+encodeURIComponent(pid)+'&select=*&order=created_at.desc');if(epoch!==workspaceEpoch||pid!==cloud.project||!cloud.role)return;w.rows=rows||[];w.pid=pid;renderWorkspace(w)}catch(e){if(epoch===workspaceEpoch&&pid===cloud.project){const root=$(w.root);root.replaceChildren();node('h2',w.title,root);node('p','Laden fehlgeschlagen: '+e.message,root);const retry=node('button','Erneut laden',root);retry.onclick=()=>loadWorkspaces()}}}}
function wsField(form,f,value){const label=node('label',f.label,form);label.classList.add('workspace-field');label.dataset.fieldType=f.type||'text';let input;if(f.type==='reminders'){const box=node('div',null,label);box.className='reminder-options';for(const [minutes,title] of reminderOptions){const l=node('label',null,box),c=node('input',null,l);c.type='checkbox';c.name=f.key+'_'+minutes;c.checked=(value||[]).includes(minutes);node('span',title,l)}return box}else if(f.type==='select'||f.type==='room'||f.type==='task'){input=node('select',null,label);optionList(input,f.type==='room'?(f.options?.()??[['','Projekt gesamt'],...allRooms().map(r=>[r.id,r.label])]):f.type==='task'?[['','Keine Aufgabe']]:typeof f.options==='function'?f.options(value):f.options)}else if(f.type==='textarea'){input=node('textarea',null,label);input.rows=2}else{input=node('input',null,label);input.type=f.type||'text';if(f.step)input.step=f.step;if(f.min!=null)input.min=f.min;if(f.max!=null)input.max=f.max;if(f.type==='text')input.maxLength=300}input.name=f.key;input.setAttribute('aria-label',f.label);input.required=!!f.required;if(f.type==='checkbox')input.checked=!!value;else if(f.type!=='file')input.value=value??f.default??'';return input}
function pathEncoded(path){return path.split('/').map(encodeURIComponent).join('/')}
async function workspaceUpload(file,pid,folder){if(!file)return null;const ext=file.name.split('.').pop().toLowerCase();if(!['pdf','jpg','jpeg','png','webp','heic'].includes(ext)||file.size>20*1024*1024)throw Error('Erlaubt: PDF oder Bild, maximal 20 MB.');const types={pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',heic:'image/heic'};const path=pid+'/'+folder+'/'+uid()+'.'+ext;await cloudFetch('/storage/v1/object/umbau26/'+pathEncoded(path),{method:'POST',headers:{'Content-Type':types[ext],'x-upsert':'false'},body:file});return path}
async function openWorkspaceFile(path,status){const pid=cloud.project;if(!path||!pid||!path.startsWith(pid+'/'))return;try{const res=await cloudFetch('/storage/v1/object/sign/umbau26/'+pathEncoded(path),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expiresIn:120})});if(pid!==cloud.project||!cloud.role)return;const href=CLOUD_URL+'/storage/v1'+res.signedURL;const a=node('a','Datei öffnen (2 Min.)',status);a.href=href;a.target='_blank';a.rel='noopener noreferrer'}catch(e){status.textContent='Datei nicht verfügbar: '+e.message}}
function renderWorkspace(w){
 const root=$(w.root);if(!root)return;root.replaceChildren();if(!cloud.role||!w.pid||w.pid!==cloud.project)return;const sectionHead=node('div',null,root,'workspace-heading');node('h2',w.title,sectionHead);node('p',w.description,sectionHead);
 renderDashboard();if(w.summary)w.summary(root,w.rows);if(w.filterUI)w.filterUI(root,w);
 const status=node('div','',root,'workspace-status');status.setAttribute('role','status');
 if(writableWorkspace()){
  const edited=w.rows.find(r=>r.id===w.edit),form=node('form',null,root,'workspace-form');if(edited)form.dataset.expectedRevision=edited.revision;form.dataset.draftEdit=w.edit||'';const fields=node('div',null,form,'workspace-fields');
  for(const f of w.fields)wsField(fields,f,edited?.[f.key]??(typeof f.default==='function'?f.default():f.default));if(w.table==='umbau_appointments')bindAppointmentTask(form,edited?.task_id);
  if(w.table==='umbau_costs')bindInvoiceScope(form,edited);
  if(w.folder){node('small','PDF oder Bild bis 20 MB. Beim Ersetzen oder Löschen eines Eintrags bleibt die alte Datei zur Sicherheit im Speicher erhalten.',form);const label=node('div',null,fields,'workspace-file-field');const id='file-'+w.root;const title=node('label',edited?.storage_path?'Neue Datei (optional)':'Datei (optional)',label);title.htmlFor=id;const input=node('input',null,label,'workspace-file-native');input.type='file';input.id=id;input.name='attachment';input.accept='.pdf,.jpg,.jpeg,.png,.webp,.heic';const pick=node('label','Datei auswählen',label,'workspace-file-pick');pick.htmlFor=id;const filename=node('span','Keine Datei ausgewählt',label,'workspace-file-name');filename.setAttribute('aria-live','polite');input.addEventListener('change',()=>{filename.textContent=input.files?.[0]?.name||'Keine Datei ausgewählt';form.dataset.dirty='true'})}
  fields.before(node('h3',edited?(w.editLabel||'Eintrag bearbeiten'):(w.newLabel||'Neuer Eintrag')));const submit=node('button',edited?'Änderungen speichern':(w.submitLabel||'Hinzufügen'),form,'workspace-primary');submit.type='submit';const cancel=node('button','Abbrechen',form);cancel.type='button';cancel.hidden=!edited;cancel.onclick=()=>{form.dataset.dirty='false';persistDraft();w.edit=null;renderWorkspace(w)};
  form.addEventListener('input',()=>{form.dataset.dirty='true'});
  form.onsubmit=async e=>{e.preventDefault();if(w.busy||!writableWorkspace()||!form.reportValidity())return;const pid=cloud.project,epoch=workspaceEpoch,body={project_id:pid,updated_at:new Date().toISOString()};let uploaded=null;for(const f of w.fields){if(f.type==='reminders'){body[f.key]=reminderOptions.filter(([m])=>form.elements.namedItem(f.key+'_'+m)?.checked).map(([m])=>m);continue}const el=form.elements.namedItem(f.key);body[f.key]=f.type==='checkbox'?el.checked:f.type==='number'?(el.value===''?null:Number(el.value)):['date','room','task'].includes(f.type)?(!el.disabled&&el.value)||null:el.value.trim()}w.busy=true;submit.disabled=true;status.textContent='Speichere …';try{const file=form.elements.namedItem('attachment')?.files?.[0];if(file){uploaded=await workspaceUpload(file,pid,w.folder);body.storage_path=uploaded}if(pid!==cloud.project||epoch!==workspaceEpoch||!writableWorkspace())throw Error('Sitzung geändert');const result=await api(w.table,edited?'?id=eq.'+edited.id+'&project_id=eq.'+pid:'',{method:edited?'PATCH':'POST',expected:edited?(form.dataset.expectedRevision??edited.revision):undefined,headers:{Prefer:'return=representation'},body:JSON.stringify(body)});if(!Array.isArray(result)||result.length!==1)throw Error('Speichern nicht bestätigt');uploaded=null;if(epoch!==workspaceEpoch||pid!==cloud.project)return;w.edit=null;form.dataset.dirty='false';queueMicrotask(persistDraft);w.rows=edited?w.rows.map(row=>row.id===edited.id?result[0]:row):[result[0],...w.rows];renderWorkspace(w);void loadActivity()}catch(err){status.textContent='Speichern fehlgeschlagen: '+err.message;if(uploaded&&pid===cloud.project&&epoch===workspaceEpoch){try{await cloudFetch('/storage/v1/object/umbau26/'+pathEncoded(uploaded),{method:'DELETE'})}catch{}}}finally{w.busy=false;submit.disabled=false}};
 }
 const rows=w.rows.filter(row=>!w.filter||w.filter(row));if(w.sort)rows.sort(w.sort);
 let listRoot=root;
 if(w.listLabel){
   listRoot=node('details',null,root,'invoice-list');
   node('summary',w.listLabel+' · '+rows.length,listRoot);
   root.insertBefore(listRoot,root.querySelector('.workspace-form'));
   listRoot.open=!!w.listOpen||!!w.edit;
   listRoot.ontoggle=()=>{if(listRoot.isConnected)w.listOpen=listRoot.open};
 }else{
   const listHead=node('div',null,root,'workspace-list-heading');node('h3','Einträge',listHead);node('span',String(rows.length),listHead,'workspace-count');
 }
 if(!rows.length)node('p',w.rows.length?'Keine passenden Einträge.':'Noch keine Einträge vorhanden.',listRoot,'workspace-empty');
 for(const row of rows){const item=node('div',null,w.table==='umbau_appointments'?root.querySelector('.month-calendar-entries'):listRoot,'workspace-row');item.dataset.entryId=row.id;if(w.table==='umbau_appointments'){item.dataset.appointmentDate=row.event_date;item.hidden=row.event_date!==calendarDay}node('strong',row.title,item);node('small',[w.table==='umbau_costs'?invoiceScopeLabel(row):roomName(row.room_id),row.trade,...w.details(row)].filter(Boolean).join(' · '),item);if(row.notes)node('p',row.notes,item);const actions=node('div',null,item,'workspace-actions');if(row.storage_path){const b=node('button','Datei anzeigen',actions);b.onclick=()=>{const area=node('span','',actions);void openWorkspaceFile(row.storage_path,area)}}if(writableWorkspace()){if(w.extraActions)w.extraActions(row,actions,status,w);const edit=node('button','Bearbeiten',actions);edit.onclick=()=>{if(w.busy)return;if(root.querySelector('form[data-dirty="true"]')&&!confirm('Ungespeicherte Eingaben verwerfen?'))return;w.edit=row.id;renderWorkspace(w);root.querySelector('form')?.scrollIntoView({block:'nearest',behavior:'smooth'})};const del=node('button','Löschen',actions);del.onclick=async()=>{if(w.busy||!writableWorkspace()||!confirm('Eintrag löschen?'))return;const pid=cloud.project,epoch=workspaceEpoch;w.busy=true;try{const result=await api(w.table,'?id=eq.'+row.id+'&project_id=eq.'+pid,{method:'DELETE',expected:row.revision,headers:{Prefer:'return=representation'}});if(!Array.isArray(result)||result.length!==1)throw Error('Löschen nicht bestätigt');if(epoch!==workspaceEpoch||pid!==cloud.project)return;w.rows=w.rows.filter(r=>r.id!==row.id);w.edit=null;renderWorkspace(w);void loadActivity()}catch(e){status.textContent='Löschen fehlgeschlagen: '+e.message}finally{w.busy=false}}}}
}
const sharedFields=[{key:'title',label:'Bezeichnung',required:true},{key:'room_id',label:'Raum',type:'room'},{key:'trade',label:'Gewerk'},{key:'notes',label:'Notizen',type:'textarea'}];
workspaces.push({root:'materialWorkspace',table:'umbau_materials',title:'Materialbedarf',description:'Materialliste je Raum und Gewerk. Mengen und Beschaffungsstatus werden in Supabase gespeichert.',fields:[...sharedFields,{key:'quantity',label:'Menge',type:'number',step:'any',min:.001,default:1,required:true},{key:'unit',label:'Einheit',default:'Stk.',required:true},{key:'purchased',label:'Beschafft',type:'checkbox'}],details:r=>[r.quantity+' '+r.unit,r.purchased?'Beschafft':'Offen'],rows:[],pid:null,edit:null,busy:false});


let budgetState={pid:null,rows:[],error:false};
function projectBudgetRows(){return budgetState.pid===cloud.project?budgetState.rows:[]}
function isInvoice(row){return typeof row.paid==='boolean'}
function costTotals(rows,budgets){
 const invoices=rows.filter(isInvoice);
 const sum=items=>items.reduce((total,row)=>total+Math.round(Number(row.actual||0)*100),0)/100;
 const actual=sum(invoices),open=sum(invoices.filter(row=>!row.paid));
 const total=budgets.find(row=>row.trade==='');
 return {budget:total?Number(total.amount):null,actual,open};
}
function costTradeOptions(value){
 const budgets=projectBudgetRows().map(row=>row.trade).filter(Boolean);
 const w=workspaces.find(w=>w.table==='umbau_costs'&&w.pid===cloud.project);
 const names=new Set([...budgets,...(w?.rows||[]).map(row=>row.trade).filter(Boolean),value].filter(Boolean));
 names.delete('Sonstiges');
 return [['','Gewerk auswählen'],...[...names].sort((a,b)=>a.localeCompare(b,'de')).map(name=>[name,name]),['Sonstiges','Sonstiges']];
}
const costScopes=[['project','Projekt gesamt'],['eg','Erdgeschoss · Umbau 2026'],['og','Obergeschoss'],['kg','Keller']];
function invoiceScope(row){
 if(row?.cost_scope)return row.cost_scope;
 const floor=Number(allRooms().find(room=>room.id===row?.room_id)?.floor);
 return ({0:'kg',1:'eg',2:'og'})[floor]||'project';
}
function groundFloorInvoiceRooms(){
 return [['','Gesamtes Erdgeschoss'],...allRooms().filter(room=>Number(room.floor)===1).map(room=>[room.id,room.name])];
}
function invoiceScopeLabel(row){
 const scope=invoiceScope(row);
 const label=costScopes.find(([key])=>key===scope)?.[1];
 const room=scope==='eg'&&allRooms().find(room=>room.id===row.room_id);
 return room?label+' · '+room.name:label;
}
function bindInvoiceScope(form,edited){
 const scope=form.elements.namedItem('cost_scope'),room=form.elements.namedItem('room_id');
 scope.value=invoiceScope(edited);
 const refresh=()=>{
   room.disabled=scope.value!=='eg';
   room.closest('label').style.display=room.disabled?'none':'';
 };
 scope.addEventListener('change',refresh);
 refresh();
}
function costSummary(root,rows){
 const budgets=projectBudgetRows();
 const {budget,actual,open}=costTotals(rows,budgets);
 const balance=budget===null?null:budget-actual,percent=budget>0?Math.round(actual/budget*100):null;
 const metrics=node('div',null,root,'workspace-metrics');
 for(const [title,value] of [['Gesamtbudget',budget===null?'—':money(budget)],['Ist-Kosten',money(actual)],['Restbudget',balance===null?'—':money(balance)],['Budgetnutzung',percent===null?'—':percent+' %'],['Offene Rechnungen',money(open)]]){
   const card=node('div',null,metrics);node('strong',value,card);node('small',title,card);
 }
 if(budgetState.pid===cloud.project&&budgetState.error)node('p','Das Budget konnte nicht geladen werden.',root,'workspace-status');
 const details=node('details',null,root,'budget-breakdown');
 node('summary','Budgetübersicht nach Gewerken',details);
 const groups=new Map();
 for(const row of budgets)if(row.trade)groups.set(row.trade,{budget:Number(row.amount),actual:0});
 for(const row of rows.filter(isInvoice)){
   const trade=row.trade||'Sonstiges',entry=groups.get(trade)||{budget:null,actual:0};
   entry.actual+=Math.round(Number(row.actual||0)*100);
   groups.set(trade,entry);
 }
 if(!groups.size)node('p','Die Einzelbudgets werden ergänzt, sobald sie feststehen.',details,'workspace-empty');
 else{
   const table=node('table',null,details,'cost-breakdown'),head=node('tr',null,table);
   for(const label of ['Gewerk','Budget','Ist-Kosten','Restbudget'])node('th',label,head);
   for(const [name,value] of [...groups].sort(([a],[b])=>a.localeCompare(b,'de'))){
     const row=node('tr',null,table);
     for(const part of [name,value.budget===null?'—':money(value.budget),money(value.actual/100),value.budget===null?'—':money(value.budget-value.actual/100)])node('td',part,row);
   }
 }
}
workspaces.push({
 root:'costWorkspace',table:'umbau_costs',title:'Kostenpositionen',
 description:'Geplante und tatsächliche Beträge in EUR. Belege bleiben im privaten Supabase-Speicher.',
 fields:[
   {key:'title',label:'Bezeichnung',required:true},
   {key:'trade',label:'Gewerk',type:'select',options:costTradeOptions,required:true},
   {key:'cost_scope',label:'Zuordnung',type:'select',options:costScopes,default:'project',required:true},
   {key:'room_id',label:'Raum im Erdgeschoss',type:'room',options:groundFloorInvoiceRooms},
   {key:'actual',label:'Rechnungsbetrag (€)',type:'number',min:.01,step:'.01',required:true},
   {key:'invoice_date',label:'Rechnungsdatum',type:'date',default:todayLocal,required:true},
   {key:'paid',label:'Bezahlt',type:'checkbox',default:false},
   {key:'notes',label:'Notizen',type:'textarea'}
 ],
 folder:'Belege',summary:costSummary,filter:isInvoice,listLabel:'Rechnungen',
 editLabel:'Rechnung bearbeiten',newLabel:'Neue Rechnung',submitLabel:'Rechnung hinzufügen',
 sort:(a,b)=>String(b.invoice_date||'').localeCompare(String(a.invoice_date||'')),
 details:r=>[money(r.actual),r.paid?'Bezahlt':'Offen',r.invoice_date?fmtDate(r.invoice_date):''],
 rows:[],pid:null,edit:null,busy:false
});

const archiveFilters={category:'',search:'',room:'',trade:'',file:''};

function plusMonthsISO(date,months){
 const [y,m,d]=date.split('-').map(Number);const target=new Date(Date.UTC(y,m-1+months,1));const last=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();target.setUTCDate(Math.min(d,last));return target.toISOString().slice(0,10);
}
function archiveSummary(root,rows){
 const maintenance=rows.filter(r=>r.category==='Wartung'),today=todayLocal(),limit=plusMonthsISO(today,1);
 const overdue=maintenance.filter(r=>r.next_due&&r.next_due<today),soon=maintenance.filter(r=>r.next_due&&r.next_due>=today&&r.next_due<=limit);
 const m=node('div',null,root,'workspace-metrics');for(const [label,value] of [['Archiv-Einträge',rows.length],['Dateien',rows.filter(r=>r.storage_path).length],['Überfällige Wartung',overdue.length],['Nächster Monat',soon.length]]){const card=node('div',null,m);node('strong',String(value),card);node('small',label,card)}
 const pending=[...overdue,...soon].sort((a,b)=>a.next_due.localeCompare(b.next_due));if(pending.length){node('h3','Anstehende Wartungen',root);for(const r of pending){const row=node('div',null,root,'workspace-row');node('strong',r.title,row);node('small',roomName(r.room_id)+' · '+fmtDate(r.next_due)+(r.next_due<today?' · Überfällig':''),row)}}else node('p','Keine Wartung im nächsten Monat eingetragen.',root);
}
const archiveCategories=['Dokument','Foto','Bauplan','Technik','Wartung'];

function archiveMatches(row,filters,roomLabel){
 return (!filters.category||row.category===filters.category)&&(!filters.room||(filters.room==='__none__'?!row.room_id:row.room_id===filters.room))&&(!filters.trade||(filters.trade==='__none__'?!String(row.trade||'').trim():String(row.trade||'').trim()===filters.trade))&&(!filters.file||(filters.file==='yes'?!!row.storage_path:!row.storage_path))&&searchMatches({title:row.title,kind:row.category,detail:roomLabel,extra:[row.notes,row.trade,row.document_date,row.next_due].join(' ')},filters.search);
}
function archiveFilterUI(root,w){
 const line=node('div',null,root,'workspace-fields archive-filter-grid');const controls={};
 const trades=[...new Set(w.rows.map(r=>String(r.trade||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
 for(const [key,label,options] of [['category','Dateityp',[['','Alle Kategorien'],...archiveCategories.map(x=>[x,x])]],['room','Raum',[['','Alle Räume'],['__none__','Projekt gesamt / nicht zugeordnet'],...allRooms().map(r=>[r.id,r.label])]],['trade','Gewerk',[['','Alle Gewerke'],['__none__','Ohne Gewerk'],...trades.map(t=>[t,t])]],['file','Anhang',[['','Alle Einträge'],['yes','Mit Datei'],['no','Ohne Datei']]]]){const lab=node('label',label,line),el=node('select',null,lab);optionList(el,options);el.value=archiveFilters[key];if(el.selectedIndex<0)el.value='';controls[key]=el}
 const lab=node('label','Suchbegriff',line),search=node('input',null,lab);search.type='search';search.placeholder='Bezeichnung, Notizen, Gewerk';search.value=archiveFilters.search;controls.search=search;
 const actions=node('div',null,line,'archive-filter-actions');const apply=node('button','Filter anwenden',actions),reset=node('button','Zurücksetzen',actions);apply.type=reset.type='button';
 const change=clear=>{if(w.busy)return;if(root.querySelector('form[data-dirty="true"]')&&!confirm('Ungespeicherte Eingaben verwerfen?'))return;for(const key of Object.keys(controls))archiveFilters[key]=clear?'':controls[key].value;renderWorkspace(w)};
 apply.onclick=()=>change(false);reset.onclick=()=>change(true);search.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();change(false)}};

}
function archiveMaintenanceAction(row,actions,status,w){
 if(row.category!=='Wartung')return;const button=node('button','Wartung erledigt',actions);
 button.onclick=async()=>{if(w.busy||!writableWorkspace()||!confirm('Wartung als heute erledigt markieren?'))return;const pid=cloud.project,epoch=workspaceEpoch,date=todayLocal(),due=row.interval_months?plusMonthsISO(date,Number(row.interval_months)):null;w.busy=true;button.disabled=true;try{const result=await api(w.table,'?id=eq.'+row.id+'&project_id=eq.'+pid,{method:'PATCH',expected:row.revision,headers:{Prefer:'return=representation'},body:JSON.stringify({document_date:date,next_due:due,updated_at:new Date().toISOString()})});if(!Array.isArray(result)||result.length!==1)throw Error('Speichern nicht bestätigt');if(epoch!==workspaceEpoch||pid!==cloud.project)return;w.rows=w.rows.map(r=>r.id===row.id?result[0]:r);renderWorkspace(w)}catch(e){status.textContent='Speichern fehlgeschlagen: '+e.message}finally{w.busy=false;button.disabled=false}};
}

window.panageiRenderDashboard=renderDashboard;

const diaryFilters={from:'',to:'',search:''};
function diaryFilterUI(root,w){const bar=node('div',null,root,'workspace-fields');for(const [key,label,type] of [['from','Von','date'],['to','Bis','date'],['search','Suche','search']]){const lab=node('label',label,bar),input=node('input',null,lab);input.type=type;input.value=diaryFilters[key];input.onchange=()=>{if(root.querySelector('form[data-dirty="true"]')&&!confirm('Ungespeicherte Eingaben verwerfen?')){input.value=diaryFilters[key];return}diaryFilters[key]=input.value;renderWorkspace(w)}}}


const installKinds=['Steckdose','Schalter','Leuchte','Netzwerk','Heizung','Wasser','Leitungsverlauf','Sonstiges'];
let installFloor=0;
const installColors=['#d97706','#7c3aed','#b5960e','#0369a1','#be123c','#0891b2','#315b4b','#64748b'];
function installationMap(root,rows){
 if(!D||!modelPayload)return;
 if(installFloor>=D.levels.length)installFloor=0;
 const bar=node('div',null,root,'workspace-fields'),label=node('label','Etage',bar),floor=node('select',null,label);
 optionList(floor,D.levels.map((l,i)=>[String(i),l.name]));floor.value=String(installFloor);
 floor.onchange=()=>{if(root.querySelector('form[data-dirty="true"]')&&!confirm('Ungespeicherte Eingaben verwerfen?')){floor.value=String(installFloor);return}installFloor=Number(floor.value);const w=workspaces.find(x=>x.table==='umbau_installation_markers');w.edit=null;renderWorkspace(w)};
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),W=Number(modelPayload.dimensions.length),H=Number(modelPayload.dimensions.width);
 svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.setAttribute('preserveAspectRatio','none');svg.style.cssText='width:100%;height:auto;aspect-ratio:'+W+'/'+H+';background:#f8fbf8;border:1px solid #8aa99d;border-radius:10px;display:block;touch-action:manipulation';root.append(svg);
 function shape(tag,attrs){const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));svg.append(el);return el}
 const elts=D.elements.filter(b=>Number(b.level)===installFloor);
 for(const b of elts.filter(b=>b.kind==='slab'))shape('rect',{x:b.x,y:b.y,width:b.w,height:b.d,fill:'#e1eae4'});
 for(const b of elts.filter(b=>b.kind==='wall'&&Math.abs(b.z-D.levels[installFloor].z)<.08))shape('rect',{x:b.x,y:b.y,width:b.w,height:b.d,fill:'#344d43'});
 for(const row of rows.filter(r=>Number(r.floor)===installFloor)){const x=Number(row.x)*W,y=Number(row.y)*H,color=installColors[installKinds.indexOf(row.category)]||'#334155';if(row.end_x!=null&&row.end_y!=null)shape('line',{x1:x,y1:y,x2:Number(row.end_x)*W,y2:Number(row.end_y)*H,stroke:color,'stroke-width':.11,'stroke-dasharray':'.25 .12'});const mark=shape('circle',{cx:x,cy:y,r:.16,fill:color,stroke:'white','stroke-width':.035});const title=document.createElementNS(ns,'title');title.textContent=row.title+' · '+row.category;mark.append(title)}
 const legend=node('p',installKinds.join(' · '),root);legend.style.fontSize='12px';
 if(!writableWorkspace())return;
 const mode=node('label','Position setzen: ',root),pick=node('select',null,mode);optionList(pick,[['start','Startpunkt / Anschluss'],['end','Endpunkt / Leitung']]);
 const hint=node('p','Auf die Skizze tippen, dann Bezeichnung und Kategorie eintragen und speichern. Leitungsverläufe sind nur dokumentierte Skizzen.',root);
 svg.onclick=e=>{const form=root.querySelector('form');if(!form)return;const rect=svg.getBoundingClientRect();const x=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)),y=Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height));const key=pick.value==='end'?'end_':'';form.elements.namedItem(key+'x').value=x.toFixed(5);form.elements.namedItem(key+'y').value=y.toFixed(5);form.elements.namedItem('floor').value=installFloor;form.dataset.dirty='true';hint.textContent=(key?'Endpunkt':'Startpunkt')+' übernommen – Eintrag speichern.'};
}


let historicState={pid:null,phase:null,phases:[],models:[],rot:-0.72,floor:'all',loading:false,error:''};
async function loadHistoricModels(){
 const pid=cloud.project,epoch=workspaceEpoch;if(!pid||!cloud.role||historicState.loading)return;
 if(historicState.pid!==pid)historicState={pid,phase:null,phases:[],models:[],rot:-0.72,floor:'all',loading:false,error:''};
 historicState.loading=true;historicState.error='';const state=historicState;
 try{const qs='?project_id=eq.'+encodeURIComponent(pid);const [phases,models]=await Promise.all([api('umbau_bauabschnitte',qs+'&select=*&order=jahr_von.asc'),api('umbau_model_versions',qs+'&select=*')]);
 if(epoch!==workspaceEpoch||cloud.project!==pid||state!==historicState)return;
 state.phases=phases;state.models=models;requestRender();if(!phases.some(p=>p.id===state.phase))state.phase=phases.at(-1)?.id||null;
 }catch(e){if(state===historicState)state.error=e.message}finally{state.loading=false;if(state===historicState&&cloud.project===pid)renderHistoric()}
}
function renderImportedWallModel(root, bar, state, wallModel){
 const levels=['Keller','Erdgeschoss','Obergeschoss','Dachgeschoss','Dachboden'];
 const type=node('label','Ansicht',bar), floor=node('select',null,type);
 optionList(floor,[['all','Gesamthaus'],...levels.map((name,i)=>[String(i),name])]);
 floor.value=state.floor;
 node('h3','Wandmodell V'+wallModel.version,root);
 const actions=node('div',null,root,'workspace-actions');
 const canvas=node('canvas',null,root);
 canvas.setAttribute('aria-label','Drehbares 3D-Hausmodell');
 canvas.style.cssText='width:100%;height:clamp(260px,55vh,620px);display:block;background:#e7efe9;border-radius:12px;touch-action:none;cursor:grab';
 const ctx=canvas.getContext('2d');
 let selected=0,activeWall=null,roof=true;
 // Orthographic triangles share a per-pixel depth buffer, including wall tops,
// jambs and glazing. Their draw order is independent of the camera angle.
let depthFrame;
const rgbByColor=new Map();
function renderSurfaces(surfaces,w,h,project){
 const sample=Math.min(devicePixelRatio||1,1.5,1280/Math.max(w,h));
 const width=Math.max(1,Math.round(w*sample));
 const height=Math.max(1,Math.round(h*sample));
 if(!depthFrame || depthFrame.width!==width || depthFrame.height!==height){
   const layer=document.createElement('canvas');
   layer.width=width;layer.height=height;
   const brush=layer.getContext('2d');
   depthFrame={width,height,layer,brush,image:brush.createImageData(width,height),depth:new Float32Array(width*height)};
 }
 const {image,depth,brush,layer}=depthFrame;
 image.data.fill(0);
 depth.fill(-Infinity);
 function triangle(a,b,c,rgb){
   const [ax,ay,az]=a,[bx,by,bz]=b,[cx,cy,cz]=c;
   const ux=bx-ax,uy=by-ay,vx=cx-ax,vy=cy-ay;
   const determinant=ux*vy-uy*vx;
   if(Math.abs(determinant)<1e-7)return;
   const minX=Math.max(0,Math.ceil(Math.min(ax,bx,cx)-.5));
   const maxX=Math.min(width-1,Math.floor(Math.max(ax,bx,cx)-.5));
   const minY=Math.max(0,Math.ceil(Math.min(ay,by,cy)-.5));
   const maxY=Math.min(height-1,Math.floor(Math.max(ay,by,cy)-.5));
   for(let y=minY;y<=maxY;y++){
     for(let x=minX;x<=maxX;x++){
       const px=x+.5-ax,py=y+.5-ay;
       const u=(px*vy-py*vx)/determinant,v=(ux*py-uy*px)/determinant;
       if(u<-.000001||v<-.000001||u+v>1.000001)continue;
       const z=az+u*(bz-az)+v*(cz-az), index=y*width+x;
       if(z<=depth[index]+.000001)continue;
       depth[index]=z;
       image.data.set(rgb,index*4);
     }
   }
 }
 for(const [level,material,vertices,id] of surfaces){
   if(selected && level!==selected-1)continue;
   if(!selected && level===4 && !roof)continue;
   const color=id && id===activeWall?'#aa552d':material;
   if(!rgbByColor.has(color)){
     const n=parseInt(color.slice(1),16);
     rgbByColor.set(color,[n>>16,(n>>8)&255,n&255,255]);
   }
   const points=vertices.map(point=>{
     const [x,y,z]=project(point);
     return [x*sample,y*sample,z];
   });
   for(let i=1;i<points.length-1;i++)triangle(points[0],points[i],points[i+1],rgbByColor.get(color));
 }
 brush.putImageData(image,0,0);
 ctx.drawImage(layer,0,0,w,h);
}

 let pitch=.55,zoom=1,panX=0,panY=0,topDown=false,roomFocus=null,framePending=false;
 const availableRooms=levels.flatMap((name,index)=>wallModelRooms(index,wallModel).map(region=>({...region,floor:index,levelName:name})));
 const roomLabel=node('label','Zimmer',actions);
 const roomMenu=node('select',null,roomLabel);
 optionList(roomMenu,[['','Kein Zimmer ausgewählt'],...availableRooms.map((room,index)=>[String(index),room.levelName+' · '+room.name])]);
 const pointers=new Map();
 const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
 function schedule(){
   if(framePending)return;
   framePending=true;
   requestAnimationFrame(()=>{framePending=false;draw()});
 }
 function resetCamera(){zoom=1;panX=0;panY=0;}
 function draw(){
   const {width:w,height:h}=canvas.getBoundingClientRect();
   if(!w||!h)return;
   const ratio=Math.min(devicePixelRatio||1,1.5);
   canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
   ctx.setTransform(ratio,0,0,ratio,0,0);
   selected=state.floor==='all'?0:Number(state.floor)+1;
   const extent=roomFocus?.bounds;
   const ox=extent?(extent[0]+extent[2])/2:8.2,oy=extent?(extent[1]+extent[3])/2:5.9;
   const span=extent?Math.max(extent[2]-extent[0],extent[3]-extent[1])+1.1:null;
   const scale=(span?Math.min(w/span,h/(span+1)):Math.min(w/35,h/(selected===0?24:19)))*zoom;
   if(topDown&&selected){
     const items=wallModelPlanItems(wallModel,selected-1);
     if(!items.length){ctx.fillStyle='#153e34';ctx.font='14px system-ui';ctx.fillText('Für dieses Geschoss ist keine Draufsicht hinterlegt.',14,28);return;}
     const rooms=availableRooms.filter(room=>room.floor===selected-1);
     paintWallPlan(ctx,items,rooms,(x,y)=>[w/2+panX+(x-ox)*scale,h/2+panY+(y-oy)*scale],roomFocus);
     return;
   }
   const cy=Math.cos(state.rot),sy=Math.sin(state.rot);
   const cp=Math.cos(pitch),sp=Math.sin(pitch);
   const center=[6.3,1.15,3.75,6.5,8.1,11.5][selected];
   renderSurfaces(wallModel.geometry,w,h,([x,y,z])=>{
     x-=ox;y-=oy;z-=center;
     const a=x*cy-y*sy,b=x*sy+y*cy;
     return [w/2+panX+a*scale,h/2+panY+(b*sp-z*cp)*scale,b*cp+z*sp];
   });
 }
 floor.onchange=()=>{state.floor=floor.value;roomMenu.value='';roomFocus=null;if(state.floor==='all'){topDown=false;topButton.setAttribute('aria-pressed','false')}resetCamera();schedule()};
 roomMenu.onchange=()=>{
   roomFocus=roomMenu.value===''?null:availableRooms[Number(roomMenu.value)]||null;
   if(roomFocus){state.floor=String(roomFocus.floor);floor.value=state.floor;}
   resetCamera();schedule();
 };
 const topButton=node('button','Draufsicht',actions);topButton.type='button';
 topButton.setAttribute('aria-pressed','false');
 topButton.onclick=()=>{
   topDown=!topDown;
   if(topDown&&state.floor==='all'){state.floor='1';floor.value='1'}
   topButton.setAttribute('aria-pressed',String(topDown));resetCamera();schedule();
 };
 const roofButton=node('button','Dach',actions);roofButton.type='button';
 roofButton.setAttribute('aria-pressed','true');
 roofButton.onclick=()=>{roof=!roof;roofButton.setAttribute('aria-pressed',String(roof));schedule()};
 for(const [label,factor] of [['−',.8],['＋',1.25]]){
   const button=node('button',label,actions);button.type='button';button.setAttribute('aria-label',factor<1?'Verkleinern':'Vergrößern');
   button.onclick=()=>{zoom=clamp(zoom*factor,.4,5);schedule()};
 }
 canvas.onpointerdown=e=>{
   if(e.pointerType==='mouse'&&e.button!==0)return;
   canvas.setPointerCapture(e.pointerId);
   pointers.set(e.pointerId,[e.clientX,e.clientY]);
   canvas.style.cursor='grabbing';
 };
 canvas.onpointermove=e=>{
   const old=pointers.get(e.pointerId);
   if(!old)return;
   const before=[...pointers.values()];
   pointers.set(e.pointerId,[e.clientX,e.clientY]);
   const after=[...pointers.values()];
   if(after.length>=2){
     const delta=points=>[points[1][0]-points[0][0],points[1][1]-points[0][1]];
     const [ax,ay]=delta(before),[bx,by]=delta(after),distance=Math.hypot(ax,ay);
     if(distance>3)zoom=clamp(zoom*Math.hypot(bx,by)/distance,.4,5);
     if(!topDown)state.rot+=Math.atan2(ax*by-ay*bx,ax*bx+ay*by);
     panX+=(after[0][0]+after[1][0]-before[0][0]-before[1][0])/2;
     panY+=(after[0][1]+after[1][1]-before[0][1]-before[1][1])/2;
   }else if(topDown||e.shiftKey){
     panX+=e.clientX-old[0];panY+=e.clientY-old[1];
   }else{
     state.rot+=(e.clientX-old[0])*.008;
     pitch=clamp(pitch+(e.clientY-old[1])*.007,.06,1.52);
   }
   schedule();
 };
 const end=e=>{pointers.delete(e.pointerId);if(!pointers.size)canvas.style.cursor='grab'};
 canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=end;
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=clamp(zoom*Math.exp(-e.deltaY*.002),.4,5);schedule()},{passive:false});
 historicObserver=new ResizeObserver(schedule);historicObserver.observe(canvas);
 schedule();
}
let historicObserver;

function renderHistoric(){
 const root=$('historicWorkspace');if(!root)return;historicObserver?.disconnect();root.replaceChildren();if(!cloud.role||!cloud.project)return;
 const state=historicState;if(state.pid!==cloud.project||(!state.phases.length&&state.loading)){node('p','Modellstände werden geladen …',root);return}
 if(state.error){node('p','Modellstände konnten nicht geladen werden: '+state.error,root);const b=node('button','Erneut laden',root);b.onclick=loadHistoricModels;return}
 if(!state.phases.length){node('p','Keine Bauabschnitte hinterlegt.',root);return}
 const bar=node('div',null,root,'workspace-fields');
 const version=state.models.find(m=>m.payload?.wallModel?.format==='panagei-wall-model')||state.models.find(m=>m.phase_id===state.phase),p=version?.payload,mdl=p?.model;
 const wallModel=p?.wallModel;
 if(wallModel?.format==='panagei-wall-model'&&Array.isArray(wallModel.geometry)&&wallModel.geometry.length){
   renderImportedWallModel(root,bar,state,wallModel);return;
 }
 if(!mdl?.elements?.length||!mdl.levels?.length||!p.dimensions){node('h3','Noch kein 3D-Modell vorhanden',root);node('p','Für diesen Bauabschnitt fehlen belegte Modelldaten. Die vorhandenen Originalunterlagen sind in der Bauhistorie zugänglich.',root);const b=node('button','Zur Bauhistorie',root);b.onclick=()=>window.panageiOpenPage?.('historie');return}
 node('h3',version.label,root);node('p',version.source||'Hinterlegter Modellstand',root);
 const fl=node('label','Ansicht',bar),floor=node('select',null,fl);optionList(floor,[['all','Gesamthaus'],...mdl.levels.map((l,i)=>[String(i),l.name])]);floor.value=state.floor;floor.onchange=()=>{state.floor=floor.value;renderHistoric()};
 const buttons=node('div',null,root,'workspace-actions');for(const [label,step] of [['↶ Drehen',-.35],['↷ Drehen',.35]]){const b=node('button',label,buttons);b.onclick=()=>{state.rot+=step;draw()}}
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 720 450');svg.setAttribute('role','img');svg.setAttribute('aria-label','Vereinfachte drehbare 3D-Ansicht des hinterlegten Modellstands');svg.style.cssText='display:block;width:100%;height:auto;background:#e7efe9;border-radius:12px;touch-action:pan-y';root.append(svg);
 function draw(){
 svg.replaceChildren();const elems=mdl.elements.filter(b=>state.floor==='all'||Number(b.level)===Number(state.floor)),L=Number(p.dimensions.length),W=Number(p.dimensions.width),roof=mdl.roof,points=[],faces=[],cos=Math.cos(state.rot),sin=Math.sin(state.rot);
 function project(v){const x=v[0]-L/2,y=v[1]-W/2,u=x*cos-y*sin,d=x*sin+y*cos;return [u,(d*.48-v[2]*.88),d*.88+v[2]*.48]}
 function add(v,color){const ps=v.map(project);points.push(...ps);faces.push({ps,color,z:ps.reduce((a,b)=>a+b[2],0)/ps.length})}
 const inds=[[0,3,2,1],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]];
 for(const b of elems){const {x,y,z,w,d,h}=b;if(![x,y,z,w,d,h].every(Number.isFinite))continue;let v=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]];
 if(roof&&Number(b.level)>=3)for(const a of v){const cap=roof.ridge-Math.abs(a[1]-roof.center)*Math.tan(roof.angle*Math.PI/180);if(Number.isFinite(cap))a[2]=Math.min(a[2],cap)}
 for(const [i,f] of inds.entries())add(f.map(j=>v[j]),i===5?'#d6dfd4':i%2?'#9fb7a5':'#b8cbbd')}
 if(state.floor==='all'&&roof&&[roof.eave,roof.ridge,roof.center].every(Number.isFinite)){const e=roof.eave,h=roof.ridge,m=roof.center;add([[0,0,e],[L,0,e],[L,m,h],[0,m,h]],'#956d56');add([[0,m,h],[L,m,h],[L,W,e],[0,W,e]],'#805f4f');add([[0,0,e],[0,m,h],[0,W,e]],'#d5d0c4');add([[L,0,e],[L,W,e],[L,m,h]],'#d5d0c4')}
 if(!points.length)return;const xs=points.map(q=>q[0]),ys=points.map(q=>q[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),scale=Math.min(650/Math.max(1,maxX-minX),380/Math.max(1,maxY-minY)),ox=360-scale*(minX+maxX)/2,oy=225-scale*(minY+maxY)/2;
 for(const f of faces.sort((a,b)=>a.z-b.z)){const el=document.createElementNS(ns,'polygon');el.setAttribute('points',f.ps.map(q=>[ox+q[0]*scale,oy+q[1]*scale].join(',')).join(' '));el.setAttribute('fill',f.color);el.setAttribute('stroke','#6f8876');el.setAttribute('stroke-width','.45');svg.append(el)}
 }
 draw();node('p','Vereinfachte Vergleichsansicht · nicht für Maßentnahme oder Ausführung geeignet.',root);
}
window.panageiRenderHistoric=renderHistoric;


const reminderOptions=[[10080,'1 Woche vorher'],[1440,'24 Stunden vorher'],[120,'2 Stunden vorher'],[60,'1 Stunde vorher'],[30,'30 Minuten vorher'],[15,'15 Minuten vorher'],[0,'Zum Terminbeginn']];

function appointmentTaskOptions(rooms,roomId){return [['','Keine Aufgabe'],...(rooms.find(r=>r.id===roomId)?.tasks||[]).filter(t=>t.id).map(t=>[t.id,t.text+(t.done?' (erledigt)':'')])]}
function bindAppointmentTask(form,initial){
 const room=form.elements.namedItem('room_id'),task=form.elements.namedItem('task_id');if(!room||!task)return;
 const update=selected=>{optionList(task,appointmentTaskOptions(allRooms(),room.value));task.value=selected||'';if(task.selectedIndex<0)task.value='';task.disabled=!room.value};
 update(initial);room.addEventListener('change',()=>update(''));
}
const calendarFilters={room:'',trade:'',kind:'',period:'open'};
function calendarEntries(appointments,rooms,archive){
 return [...appointments.map(r=>({title:r.title,date:r.event_date,time:r.event_time?.slice(0,5),kind:'Termin',category:r.category,room:r.room_id||'',trade:r.trade||'',id:r.id,workspace:'umbau_appointments',page:'calendar'})),...rooms.flatMap(r=>(r.tasks||[]).filter(t=>!t.done&&t.due_date).map(t=>({title:t.text,date:t.due_date,kind:'Aufgabenfrist',room:r.id,trade:t.trade||'',task:t.id,page:'aufgaben'}))),...scopedTasks().filter(t=>!t.done&&t.due_date).map(t=>({title:t.title,date:t.due_date,kind:'Aufgabenfrist',trade:t.trade||'',scopedTask:t.id,page:'aufgaben'})),...archive.filter(r=>r.category==='Wartung'&&r.next_due).map(r=>({title:r.title,date:r.next_due,kind:'Wartung',room:r.room_id||'',trade:r.trade||'',id:r.id,workspace:'umbau_archive',page:'archiv'}))].filter(e=>e.date).sort((a,b)=>(a.date+(a.time||'08:00')).localeCompare(b.date+(b.time||'08:00')));
}
function calendarMatch(e,f,today){return (!f.room||e.room===f.room)&&(!f.trade||e.trade===f.trade)&&(!f.kind||e.kind===f.kind)&&(f.period==='all'||(f.period==='future'?e.date>=today:f.period==='past'?e.date<today:(e.date>=today||e.kind!=='Termin')))}
let calendarDay='';
function renderCalendarSummary(root, rows){
 const today=todayLocal();
 if(!calendarDay)calendarDay=today;
 const widget=node('div',null,root,'month-calendar');
 const bar=node('div',null,widget,'month-calendar-bar');
 const prev=node('button','‹',bar),title=node('h3','',bar),next=node('button','›',bar);
 prev.setAttribute('aria-label','Vorheriger Monat');
 next.setAttribute('aria-label','Nächster Monat');
 const grid=node('div',null,widget,'month-calendar-grid');
 const dayHeading=node('h3','',widget);
 dayHeading.setAttribute('aria-live','polite');
 const empty=node('p','Keine Termine an diesem Tag.',widget,'workspace-empty');
 node('div',null,widget,'month-calendar-entries');
 const iso=(y,m,d)=>String(y)+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
 const dates=new Map();
 for(const row of rows)if(row.event_date)dates.set(row.event_date,(dates.get(row.event_date)||0)+1);
 function draw(){
   const [y,m]=calendarDay.split('-').map(Number);
   title.textContent=new Intl.DateTimeFormat('de-DE',{month:'long',year:'numeric'}).format(new Date(y,m-1,1));
   grid.replaceChildren();
   for(const weekday of ['Mo','Di','Mi','Do','Fr','Sa','So'])node('span',weekday,grid,'month-weekday');
   const first=new Date(y,m-1,1),count=new Date(y,m,0).getDate();
   for(let i=0;i<(first.getDay()+6)%7;i++)node('span',null,grid);
   for(let d=1;d<=count;d++){
     const date=iso(y,m,d),countForDay=dates.get(date)||0;
     const button=node('button',String(d),grid,countForDay?'has-date':'');
     button.type='button';
     button.dataset.calendarDay=date;
     button.setAttribute('aria-label',fmtDate(date)+(countForDay?' · '+countForDay+' Termine':''));
     button.setAttribute('aria-pressed',String(date===calendarDay));
     if(date===today)button.setAttribute('aria-current','date');
     button.onclick=()=>{calendarDay=date;draw();grid.querySelector('[aria-pressed="true"]')?.focus()};
   }
   dayHeading.textContent='Termine am '+fmtDate(calendarDay);
   empty.hidden=dates.has(calendarDay);
   for(const item of root.querySelectorAll('[data-appointment-date]'))item.hidden=item.dataset.appointmentDate!==calendarDay;
   const dateField=root.querySelector('input[name="event_date"]');
   if(dateField&&!root.querySelector('form[data-dirty="true"]')&&!calendarWorkspace.edit)dateField.value=calendarDay;
 }
 function shift(delta){
   const [y,m]=calendarDay.split('-').map(Number);
   const date=new Date(y,m-1+delta,1);
   calendarDay=iso(date.getFullYear(),date.getMonth()+1,1);
   draw();
 }
 prev.onclick=()=>shift(-1);
 next.onclick=()=>shift(1);
 draw();
}
const calendarWorkspace={root:'calendarWorkspace',table:'umbau_appointments',title:'Eigene Termine',description:'Termine mit optionalem Raum, Gewerk und Aufgabe. Erinnerungen werden serverseitig geprüft. Push auf diesem Gerät aktivieren und Terminerinnerungen auswählen.',fields:[{key:'title',label:'Bezeichnung',required:true},{key:'category',label:'Kategorie',type:'select',options:['Handwerker','Lieferung','Besprechung','Wartung','Sonstiges'].map(x=>[x,x]),required:true},{key:'room_id',label:'Raum',type:'room'},{key:'trade',label:'Gewerk'},{key:'task_id',label:'Verknüpfte Aufgabe',type:'task'},{key:'event_date',label:'Datum',type:'date',default:()=>calendarDay||todayLocal(),required:true},{key:'event_time',label:'Uhrzeit',type:'time',default:'09:00',required:true},{key:'notes',label:'Notizen',type:'textarea'},{key:'reminders',label:'Erinnerungen',type:'reminders',default:()=>[1440,60]}],sort:(a,b)=>(a.event_date+a.event_time).localeCompare(b.event_date+b.event_time),details:r=>[fmtDate(r.event_date),r.event_time?.slice(0,5)+' Uhr',r.category,r.task_id?'Aufgabe: '+(allRooms().find(x=>x.id===r.room_id)?.tasks||[]).find(t=>t.id===r.task_id)?.text:'',(r.reminders||[]).map(m=>reminderOptions.find(x=>x[0]===m)?.[1]).filter(Boolean).join(', ')||'Keine Erinnerung'],rows:[],pid:null,edit:null,busy:false,summary:renderCalendarSummary};
workspaces.push(calendarWorkspace);window.panageiRenderCalendar=()=>{if(calendarWorkspace.pid===cloud.project&&!calendarWorkspace.busy&&!$('calendarWorkspace')?.querySelector('form[data-dirty="true"]'))renderWorkspace(calendarWorkspace)};
function requestRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render()})}
function distance(){const p=[...touches.values()];return p.length<2?null:Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1])}
c.onpointerdown=e=>{if(taskMode()){taskTap={id:e.pointerId,x:e.clientX,y:e.clientY};return;}e.preventDefault();modelTap=touches.size?null:{id:e.pointerId,x:e.clientX,y:e.clientY};touches.set(e.pointerId,[e.clientX,e.clientY]);if(c.setPointerCapture)c.setPointerCapture(e.pointerId);pinchDistance=distance()};
c.onpointermove=e=>{if(taskMode()){if(taskTap&&Math.hypot(e.clientX-taskTap.x,e.clientY-taskTap.y)>12)taskTap=null;return;}if(!touches.has(e.pointerId))return;e.preventDefault();if(modelTap&&Math.hypot(e.clientX-modelTap.x,e.clientY-modelTap.y)>10)modelTap=null;const old=touches.get(e.pointerId);touches.set(e.pointerId,[e.clientX,e.clientY]);if(touches.size>=2){let now=distance();if(pinchDistance>0)zoom=Math.max(.4,Math.min(4,zoom*now/pinchDistance));pinchDistance=now}else{if(tilt!==Math.PI/2){angle+=(e.clientX-old[0])*.008;tilt=Math.max(.1,Math.min(Math.PI/2,tilt+(e.clientY-old[1])*.008))}}requestRender()};
function taskMode(){return !!c.closest('#panageiTaskCanvas')}
const normalizeRoom=n=>String(n).trim().toLocaleLowerCase('de-DE');
let taskTap=null;
function insidePolygon(x,y,p){let hit=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [a,b]=p[i],[u,v]=p[j];if((b>y)!==(v>y)&&x<(u-a)*(y-b)/(v-b)+a)hit=!hit;}return hit;}
function drawOG(){ctx.clearRect(0,0,c.width,c.height);ctx.lineJoin="round";for(const [index,r] of ogRegions.entries()){const pts=r[1].map(([x,y])=>project([x,y,0]));ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=["Treppenhaus","Podest"].includes(r[0])?"#d3dad5":r[0]==="Flur"?"#c6dcd2":index%2?"#e0ebe5":"#edf3ef";ctx.fill();const x=pts.reduce((a,p)=>a+p[0],0)/pts.length,y=pts.reduce((a,p)=>a+p[1],0)/pts.length;ctx.font=`600 ${Math.max(9,S*.4)}px system-ui`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle="#153e34";ctx.fillText(r[0]==="Hauswirtschaftsraum"?"HWR":r[0],x,y);}
for(const b of D.elements.filter(b=>b.level===2&&b.kind==='wall'&&Math.abs(b.z-D.levels[2].z)<.05)){const p=project([b.x,b.y,0]),q=project([b.x+b.w,b.y+b.d,0]);ctx.fillStyle="#344d43";ctx.fillRect(p[0],p[1],q[0]-p[0],q[1]-p[1]);}}
function drawOtherPlan(l){ctx.clearRect(0,0,c.width,c.height);const rect=(x,y,w,d,color)=>{const p=project([x,y,0]),q=project([x+w,y+d,0]);ctx.fillStyle=color;ctx.fillRect(p[0],p[1],q[0]-p[0],q[1]-p[1]);};for(const b of D.elements.filter(b=>b.level===l&&b.kind==='slab'))rect(b.x,b.y,b.w,b.d,'#edf3ef');if(l===1)for(const [i,r] of taskRegions.entries())rect(r[1],r[2],r[3]-r[1],r[4]-r[2],r[0]==='Flur'?'#c6dcd2':i%2?'#e0ebe5':'#edf3ef');for(const b of D.elements.filter(b=>b.level===l)){if(b.kind==='wall'&&Math.abs(b.z-D.levels[l].z)<.05)rect(b.x,b.y,b.w,b.d,'#344d43');if(['step','landing'].includes(b.kind))rect(b.x,b.y,b.w,b.d,'#c2ccc6');}if(l===1){ctx.font=`600 ${Math.max(9,S*.4)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#153e34';for(const r of taskRegions){const p=project([(r[1]+r[3])/2,(r[2]+r[4])/2,0]);ctx.fillText(r[0],p[0],p[1]);}}}
let highlightedTaskRoom='';
let taskPlanTransform=null;
function importedWallModel(){
 return historicState.pid===cloud.project&&cloud.role&&cloud.token?
   historicState.models.map(row=>row.payload?.wallModel).find(model=>model?.format==='panagei-wall-model'):null;
}
function wallModelRooms(floor,model){
 const stored=model?.roomRegions?.filter(r=>r.floor===floor)||[];
 const fallback=floor===1?taskRegions.map(([name,x0,y0,x1,y1,aliases])=>({name,bounds:[x0,y0,x1,y1],aliases})):[];
 return (stored.length?stored:fallback).map(region=>({...region,roomId:allRooms().find(room=>Number(room.floor)===floor&&[region.name,...(region.aliases||[])].some(name=>normalizeRoom(name)===normalizeRoom(room.name)))?.id}));
}
function wallModelPlanItems(model,floor){
 const items=model?.floorPlans?.filter(row=>row[0]===floor)||[];
 if(items.length||floor!==4)return items;
 return (model?.geometry||[]).filter(([level,color,vertices])=>level===4&&vertices.length>=3&&vertices.every(point=>Math.abs(point[2]-10.8)<.0001))
   .map(([level,color,vertices])=>[level,null,vertices.map(([x,y])=>[x,y]),'#c8c8d5']);
}
function paintWallPlan(ctx,items,rooms,convert,selectedRoom){
 const chosen=rooms.find(room=>selectedRoom&&(room.roomId===selectedRoom||room===selectedRoom));
 if(chosen){
   const [x0,y0,x1,y1]=chosen.bounds,p=convert(x0,y0),q=convert(x1,y1);
   ctx.fillStyle='#c4e4d0';ctx.fillRect(p[0],p[1],q[0]-p[0],q[1]-p[1]);
 }
 const paths=new Map();
 for(const [,id,vertices,material] of items){
   const color=material||(id?'#344d43':'#aab5af');
   if(!paths.has(color))paths.set(color,new Path2D());
   const path=paths.get(color);
   vertices.forEach(([x,y],i)=>path[i?'lineTo':'moveTo'](...convert(x,y)));
   path.closePath();
 }
 for(const [color,path] of paths){ctx.fillStyle=color;ctx.fill(path)}
 ctx.fillStyle='#153e34';ctx.font='600 '+Math.max(9,Math.min(13,Math.abs(convert(1,0)[0]-convert(0,0)[0])*.34))+'px system-ui';
 ctx.textAlign='center';ctx.textBaseline='middle';
 for(const r of rooms){
   const [x0,y0,x1,y1]=r.bounds;
   ctx.fillText(r.name,...convert((x0+x1)/2,(y0+y1)/2));
 }
}
function drawImportedTaskPlan(floor){
 taskPlanTransform=null;
 const model=importedWallModel(),items=wallModelPlanItems(model,floor);
 if(!items?.length)return false;
 const points=items.flatMap(row=>row[2]),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 const scale=Math.min((c.width-18)/(x1-x0),(c.height-18)/(y1-y0));
 const ox=c.width/2-(x0+x1)/2*scale,oy=c.height/2-(y0+y1)/2*scale;
 const rooms=wallModelRooms(floor,model);
 taskPlanTransform={floor,ox,oy,scale,rooms};
 ctx.clearRect(0,0,c.width,c.height);
 paintWallPlan(ctx,items,rooms,(x,y)=>[ox+x*scale,oy+y*scale],highlightedTaskRoom);
 return true;
}
function activatePlanRoom(e){
 if(taskPlanTransform?.floor===Number(selected)){
   const {ox,oy,scale,rooms}=taskPlanTransform,rect=c.getBoundingClientRect();
   const x=((e.clientX-rect.left)*c.width/rect.width-ox)/scale,y=((e.clientY-rect.top)*c.height/rect.height-oy)/scale;
   const region=rooms.find(({bounds:[a,b,d,f]})=>x>=a&&x<=d&&y>=b&&y<=f);
   if(region?.roomId)openRoomSearch(region.roomId);
   else if(region)$('panageiPlanNotice').textContent='Für '+region.name+' ist noch keine Raumkarte angelegt.';
   return;
 }
 if(!D||selected==='all')return;
 const rect=c.getBoundingClientRect();if(!rect.width||!rect.height||!S)return;
 const px=(e.clientX-rect.left)*c.width/rect.width,py=(e.clientY-rect.top)*c.height/rect.height;
 const u=(px-c.width/2)/S,w=(py-c.height/2)/S;
 if(Math.abs(Math.cos(tilt))<.001)return;
 const v=w/Math.cos(tilt),x=modelPayload.dimensions.length/2+u*Math.cos(angle)+v*Math.sin(angle),y=modelPayload.dimensions.width/2-u*Math.sin(angle)+v*Math.cos(angle);
 if(![1,2].includes(+selected))return;
 let region=+selected===2?ogRegions.find(r=>insidePolygon(x,y,r[1])):taskRegions.find(r=>x>=r[1]&&x<=r[3]&&y>=r[2]&&y<=r[4]);
 if(!region)return;
 const rooms=getRooms(+selected),index=rooms.findIndex(r=>(region[5]||region[2]).some(n=>normalizeRoom(n)===normalizeRoom(r.name)));
 const cards=[...panel.querySelectorAll('.roomCard')],card=cards[index];
 if(!card){const msg=document.getElementById('panageiPlanNotice');if(msg)msg.textContent='Für '+region[0]+' ist noch keine passende Raumkarte vorhanden.';return;}
 const msg=document.getElementById('panageiPlanNotice');if(msg)msg.textContent='';
 cards.forEach(d=>d.open=d===card);card.scrollIntoView({behavior:'smooth',block:'start'});
}
function endTouch(e){touches.delete(e.pointerId);pinchDistance=distance()}
c.onpointerup=e=>{if(taskMode()){if(taskTap?.id===e.pointerId&&Math.hypot(e.clientX-taskTap.x,e.clientY-taskTap.y)<=12)activatePlanRoom(e);taskTap=null;return;}if(modelTap?.id===e.pointerId&&Math.hypot(e.clientX-modelTap.x,e.clientY-modelTap.y)<=10)pickModel(e);modelTap=null;endTouch(e)};c.onpointercancel=e=>{taskTap=null;modelTap=null;endTouch(e)};c.onlostpointercapture=endTouch;
$('zoomIn').onclick=()=>{zoom=Math.min(4,zoom*1.2);requestRender()};$('zoomOut').onclick=()=>{zoom=Math.max(.4,zoom/1.2);requestRender()};
c.onwheel=e=>{if(taskMode())return;e.preventDefault();zoom=Math.max(.4,Math.min(4,zoom*Math.exp(-e.deltaY*.001)));render()};
$('obj').onclick=()=>{if(!D)return;let lines=['# Gesamthaus 2026; meters; Z up; provisional stair and roof geometry'],n=1;for(let b of D.elements){if(!visible(b))continue;lines.push('g L'+b.level+'_'+b.kind);let v=vertices(b);for(let p of v)lines.push('v '+p.join(' '));for(let f of indices)lines.push('f '+f.map(i=>i+n).join(' '));n+=8}if(showRoof&&!onlyStairs&&(selected==='all'||+selected>=3)){for(let f of roofFaces()){for(let p of f)lines.push('v '+p.join(' '));lines.push('f '+f.map((_,i)=>n+i).join(' '));n+=f.length}}let url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain'})),a=document.createElement('a');a.href=url;a.download='Gesamthaus_2026.obj';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};window.onresize=render;render();if(window.ResizeObserver)new ResizeObserver(render).observe(c);requestAnimationFrame(render);
drafts=createPanageiDrafts({
 context:()=>({user:cloud.user?.id,project:cloud.project}),
 writable:()=>['owner','editor'].includes(cloud.role),
 snapshot:()=>({data:cloud.dirty?projectData:null,baseline:cloud.dirty?cloud.lastSnapshot:null,roomInputs:Object.entries(roomTaskDrafts).map(([room,text])=>({room,text}))}),
 busy:()=>cloud.pushing||modelSaving||workspaces.some(w=>w.busy),
 retry:()=>{cloudSchedule();},
 online:async()=>{if(cloud.refresh&&await cloudRefreshToken()){if(!cloud.project)await cloudInit();else if(cloud.dirty&&!drafts.hasConflict)cloudSchedule();}},
 reload:async()=>{roomTaskDrafts={};document.querySelectorAll('.newTask').forEach(el=>el.value='');cloud.dirty=false;clearTimeout(cloud.timer);document.querySelectorAll('form[data-dirty="true"]').forEach(f=>f.dataset.dirty='false');await cloudLoad();},
 restore:async draft=>{roomTaskDrafts=Object.fromEntries((draft.roomInputs||[]).map(row=>[row.room,row.text]));if(draft.data){projectData=draft.data;cloud.lastSnapshot=draft.baseline||'{}';cloud.dirty=true;updatePanel();renderRenovation();refreshModelRooms();}await loadWorkspaces();for(const row of draft.roomInputs||[]){const room=modelRoomById(row.room);if(!room)continue;selected=String(room.floor);$('level').value=selected;$('panageiTaskLevel').value=selected;window.panageiOpenPage?.('aufgaben');updatePanel();const card=[...panel.querySelectorAll('.roomCard[data-room-id]')].find(el=>el.dataset.roomId===row.room);if(card){card.open=true;card.querySelector('.newTask').value=row.text;}}roomTaskDrafts=Object.fromEntries((draft.roomInputs||[]).map(row=>[row.room,row.text]));},
 prepareForm:async(id,draft)=>{const w=workspaces.find(w=>w.root===id);if(w){w.edit=draft.edit||null;renderWorkspace(w);}else if(id==='modelDimensionForm'&&draft.room){modelSelection={kind:'room',id:draft.room};showModelSelection();}}
});
}catch(error){document.getElementById("view").style.display="none";document.getElementById("modelFallback").style.display="block";document.getElementById("modelStatus").textContent="Hausmodell konnte nicht starten: "+error.message+"";console.error(error)}})();

