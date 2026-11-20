
(function(){
'use strict';
const app=document.getElementById('panageiApp');
const model=document.getElementById('panageiModelPage');
const pages={calendar:document.getElementById('panageiCalendarPage'),settings:document.getElementById('panageiSettingsPage'),dashboard:document.getElementById('panageiDashboardPage'),modell:model,infos:document.getElementById('panageiInfoPage'),historie:document.getElementById('panageiHistoryPage'),bauteile:document.getElementById('panageiComponentsPage'),aufgaben:document.getElementById('panageiTasksPage'),kosten:document.getElementById('panageiCostPage'),admin:document.getElementById('panageiAdminPage')};
const nav=model.querySelector('nav');
const originalSection=model.querySelector('section');
const panel=document.getElementById('projectPanel');
const modelCanvas=document.getElementById('view');
const fallback=document.getElementById('modelFallback');
const modelHome=document.createElement('div');
modelHome.id='panageiModelHome';
originalSection.insertBefore(modelHome,fallback);modelHome.append(fallback,modelCanvas);
const importedModel=document.createElement('div');
importedModel.id='historicWorkspace';
importedModel.className='panagei-panel';
originalSection.insertBefore(importedModel,modelHome);
modelHome.style.display='none';
const inspector=document.getElementById('modelInspector');if(inspector)inspector.style.display='none';
nav.style.display='none';
// Historische Zeichnungen und Erläuterungen aus der Modell-Startansicht in Infos verschieben.
// Raumverwaltung dauerhaft im Reiter Aufgaben halten, auch wenn das Modell angezeigt wird.
document.getElementById('panageiTaskRooms').appendChild(panel);

const plan=document.getElementById('panageiExistingPlans');
if(plan)document.getElementById('panageiPlanSlot').appendChild(plan);
document.getElementById('panageiAdminSlot').appendChild(document.getElementById('cloudBox'));
const logout=document.getElementById('cloudLogout');
const header=app.querySelector('header');
const headrow=document.createElement('div');
headrow.className='panagei-headrow';
const heading=document.createElement('div');
heading.className='brand';heading.innerHTML='<div class="brand-name">PANAGEI<span>+</span></div><div class="brand-sub">Digitale Gebäudeakte</div><svg class="brand-art" viewBox="0 0 260 150" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="monitorFrame" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#acf5d1"/><stop offset="1" stop-color="#497f6e"/></linearGradient><linearGradient id="monitorScreen" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#204e43"/><stop offset="1" stop-color="#0b211e"/></linearGradient></defs><rect x="9" y="5" width="242" height="119" rx="10" fill="#142b28" stroke="url(#monitorFrame)" stroke-width="1.7"/><rect x="16" y="12" width="228" height="101" rx="5" fill="url(#monitorScreen)" stroke="#76c5aa" stroke-opacity=".45"/><rect x="23" y="19" width="97" height="87" rx="5" fill="#183b32" stroke="#75ae97" stroke-opacity=".4"/><rect x="126" y="19" width="111" height="87" rx="5" fill="#183b32" stroke="#75ae97" stroke-opacity=".4"/><g transform="translate(19 8) scale(.88)"><g stroke-linecap="round" stroke-linejoin="round"><path d="M16 66V36q0-4 4-4h23l8 8h34q4 0 4 4v59H16Z" fill="#a66f89" stroke="#e4b0c6" stroke-width="1.5"/><g transform="rotate(-10 48 62)"><rect x="28" y="23" width="49" height="64" rx="2" fill="#f1e5da" stroke="#c1b7ad"/><path d="M36 34h30M36 40h20M36 49h30v25H36Zm14 0v25m0-13h16" stroke="#8a9d93" stroke-width="1.2"/></g><g transform="rotate(9 68 62)"><rect x="46" y="32" width="41" height="58" rx="2" fill="#faeee4" stroke="#c9b8af"/><path d="M53 43h26M53 50h21M53 57h26M53 64h17" stroke="#a19d99" stroke-width="1.2"/></g><path d="M15 66q0-4 4-4h22l8-7h35q5 0 5 5l-5 43q0 4-4 4H20q-4 0-4-4Z" fill="#d39ab0" stroke="#f0c5d4" stroke-width="1.6"/><rect x="29" y="76" width="44" height="17" rx="2" fill="#f3dbe4"/><text x="51" y="87.5" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="8" fill="#744a60">BAUAKTE</text></g></g><g stroke="#91d8b6" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="137" y="32" width="34" height="29" rx="3" fill="#234c40"/><path d="M137 41h34M145 28v8m18-8v8"/><g fill="#85c4aa" stroke="none"><rect x="143" y="46" width="5" height="4" rx="1"/><rect x="152" y="46" width="5" height="4" rx="1"/><rect x="161" y="46" width="5" height="4" rx="1"/><rect x="143" y="53" width="5" height="4" rx="1"/><rect x="152" y="53" width="5" height="4" rx="1" fill="#d39ab0"/></g><path d="M181 36h43M181 43h30M181 53h38" opacity=".75"/><g fill="#244e41"><rect x="137" y="70" width="8" height="8" rx="2"/><rect x="137" y="84" width="8" height="8" rx="2"/></g><path d="m138.5 73.5 2 2 4-5m-4 16h0M151 74h24m-24 14h24"/><rect x="182" y="70" width="45" height="5" rx="2.5" fill="#365c4e" stroke="none"/><rect x="182" y="70" width="32" height="5" rx="2.5" fill="#81d8a9" stroke="none"/><rect x="182" y="84" width="45" height="5" rx="2.5" fill="#365c4e" stroke="none"/><rect x="182" y="84" width="20" height="5" rx="2.5" fill="#d39ab0" stroke="none"/></g><circle cx="130" cy="118" r="1.5" fill="#8bf6c6"/><path d="M116 124h28l5 12h-38Z" fill="#355f53" stroke="#78bba2"/><rect x="96" y="136" width="68" height="5" rx="2.5" fill="#6da58f"/></svg>';
header.replaceChildren(heading);const account=document.createElement('div');account.id='panageiAccount';account.hidden=true;const accountDot=document.createElement('i');accountDot.setAttribute('aria-hidden','true');const accountText=document.createElement('span');account.append(accountDot,accountText);header.append(account);window.panageiAccountIdentity=({name,role,user})=>{account.hidden=!user||!name;accountText.textContent=name;account.title=role?'Angemeldet als '+name+' · '+role:'Angemeldet als '+name;account.setAttribute('aria-label',account.title)};const logoutGroup=document.createElement('div');logoutGroup.id='panageiLogoutGroup';const version=document.createElement('span');version.id='panageiVersion';version.textContent=document.title.match(/v\d+(?:\.\d+)*$/)?.[0]||'';version.textContent+=' · TEST';version.setAttribute('aria-label','Testumgebung '+version.textContent);version.hidden=true;logoutGroup.append(account,logout,version);header.appendChild(logoutGroup);logout.setAttribute('aria-label','Abmelden');logout.title='Abmelden';const updateSidebarHeight=()=>{app.style.setProperty('--sidebar-head-height',Math.ceil(header.getBoundingClientRect().height)+'px')};if(typeof ResizeObserver!=='undefined')new ResizeObserver(updateSidebarHeight).observe(header);window.addEventListener('resize',updateSidebarHeight);updateSidebarHeight();
const level=document.getElementById('level');
const taskLevel=document.getElementById('panageiTaskLevel');
const adminTab=document.querySelector('[data-panagei-tab="admin"]');
const identity=document.getElementById('cloudIdentity');
const cloudLogged=document.getElementById('cloudLogged');
let current='dashboard';
function isOwner(){return !cloudLogged.hidden && window.panageiSettingsContext?.().role==='owner'}
function syncRole(){
  const owner=isOwner();
  adminTab.hidden=!owner;
  document.getElementById('cloudRefresh').hidden=!owner;
  document.getElementById('cloudInvite').hidden=!owner;
  if(current==='admin'&&!owner)show('historie');
}
let homeLevel='all';
function moveCanvas(toTasks){
  if(toTasks&&!modelCanvas.closest('#panageiTaskCanvas'))homeLevel=level.value;
  const dest=toTasks?document.getElementById('panageiTaskCanvas'):modelHome;
  dest.appendChild(fallback);
  dest.appendChild(modelCanvas);if(toTasks&&!document.getElementById('panageiPlanNotice')){const notice=document.createElement('div');notice.id='panageiPlanNotice';notice.setAttribute('role','status');dest.appendChild(notice);}
  if(toTasks){
    document.getElementById('panageiTaskRooms').appendChild(panel);
    const selected=taskLevel.value;
    level.value=selected;level.dispatchEvent(new Event('change',{bubbles:true}));
    document.getElementById('top').click();
  }else{level.value=homeLevel;level.dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('iso').click();}
  requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
}
function show(name){
  if(!pages[name]||(name==='admin'&&!isOwner()))name='historie';
  const tasks=name==='aufgaben';
  const previous=current;
  current=name;
  for(const [key,page] of Object.entries(pages))page.hidden=key!==name;if(name==='dashboard')window.panageiRenderDashboard?.();if(name==='bauteile')window.panageiRenderRoomCenter?.();if(name==='settings')window.panageiRenderSettings?.();if(name==='calendar')window.panageiRenderCalendar?.();if(name==='modell')window.panageiRenderHistoric?.();
  if(tasks&&previous!=='aufgaben'){moveCanvas(true)}
  else if(!tasks&&previous==='aufgaben'){moveCanvas(false)}
  document.querySelectorAll('[data-panagei-tab]').forEach(button=>{
    button.setAttribute('aria-selected',String(button.dataset.panageiTab===name));button.tabIndex=button.dataset.panageiTab===name?0:-1;
  });
  const activeTab=document.querySelector('[data-panagei-tab="'+name+'"]');if(activeTab&&matchMedia('(max-width:760px)').matches){const tabs=document.getElementById('panageiTabs');const br=activeTab.getBoundingClientRect(),tr=tabs.getBoundingClientRect();tabs.scrollLeft+=br.left-tr.left-(tr.width-br.width)/2;}if(previous!==name)window.scrollTo(0,0);
  if(name==='modell'||name==='aufgaben')requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
}
const tabButtons=[...document.querySelectorAll('[data-panagei-tab]')];for(const button of tabButtons){const name=button.dataset.panageiTab;button.id='tab-'+name;button.setAttribute('aria-controls',pages[name].id);pages[name].setAttribute('aria-labelledby',button.id);button.addEventListener('click',()=>show(name));button.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(e.key))return;const visible=tabButtons.filter(b=>!b.hidden),i=visible.indexOf(button);let next=e.key==='Home'?0:e.key==='End'?visible.length-1:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+visible.length)%visible.length;e.preventDefault();visible[next]?.focus();if(visible[next])show(visible[next].dataset.panageiTab)})}
taskLevel.addEventListener('change',()=>{
  level.value=taskLevel.value;
  level.dispatchEvent(new Event('change',{bubbles:true}));
  document.getElementById('top').click();
});

new MutationObserver(syncRole).observe(identity,{childList:true,characterData:true,subtree:true});
new MutationObserver(syncRole).observe(cloudLogged,{attributes:true,attributeFilter:['hidden']});
syncRole();
window.panageiOpenPage=show;
show('historie');
})();
