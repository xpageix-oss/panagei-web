/* Device-local recovery, scoped to account, project, release channel and tab. */
(function(root){
 'use strict';
 root.createPanageiDrafts=function(options){
  const client=crypto.randomUUID(); // A fresh document ID prevents duplicated tabs from sharing a draft slot.
  let pending=null,conflict=false,storageError=false,recoveryError='',restoring=false,loadedContext='',offeredContext='',timer;
  let formDrafts={};
  const context=()=>{const c=options.context();return c?.user&&c?.project?c.user+'|'+c.project+'|'+location.pathname.replace(/index\.html$/,''):null};
  const store=()=>{const c=context();return c?PanageiSafety.draftStore(localStorage,c,client):null};
  const identity=form=>form.id||form.parentElement?.closest('[id]')?.id;
  function fields(form){return [...form.elements].filter(e=>e.name&&!['password','file','submit','button','hidden'].includes(e.type)).map(e=>({name:e.name,type:e.type,value:e.type==='checkbox'?e.checked:e.value}));}
  function collect(){for(const form of document.querySelectorAll('#panageiApp form')){const id=identity(form);if(!id)continue;if(form.dataset.dirty==='true')formDrafts[id]={fields:fields(form),edit:form.dataset.draftEdit||'',revision:form.dataset.expectedRevision,room:form.dataset.draftRoom||''};else if(!restoring)delete formDrafts[id];}}
  function persist(){
   if(!context()||!options.writable()||pending||restoring)return false;
   if(loadedContext&&loadedContext!==context())formDrafts={};loadedContext=context();
   collect();const snapshot=options.snapshot();
   try{const s=store();if(snapshot.data||snapshot.roomInputs?.length||Object.keys(formDrafts).length)s.save({...snapshot,forms:formDrafts});else s.remove();storageError=false;render();return true;}
   catch{storageError=true;render();return false;}
  }
  function panel(){let el=document.getElementById('draftRecovery');if(!el){el=document.createElement('section');el.id='draftRecovery';el.className='panagei-panel';el.setAttribute('aria-live','polite');document.getElementById('panageiApp').prepend(el)}return el;}
  function button(el,label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;el.append(b)}
  function download(value){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='PANAGEI_Entwurf.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  function render(){
   if(!context())return;const el=panel();el.replaceChildren();
   const text=document.createElement('p');el.append(text);
   if(recoveryError)text.textContent=recoveryError;
   else if(storageError)text.textContent='Entwurf konnte auf diesem Gerät nicht gesichert werden. Seite geöffnet lassen und Eingaben speichern.';
   else if(pending)text.textContent='Ein ungespeicherter Entwurf vom '+new Date(pending.savedAt).toLocaleString('de-DE')+' ist auf diesem Gerät vorhanden.';
   else if(conflict)text.textContent='Speicherkonflikt: Ein anderer Stand wurde gespeichert. Dein Entwurf wurde nicht überschrieben.';
   else text.textContent=options.snapshot().data||options.snapshot().roomInputs?.length||Object.keys(formDrafts).length?'Noch nicht gespeichert · Entwurf auf diesem Gerät gesichert.':'Änderungen gespeichert.';
   if(pending){button(el,'Entwurf wiederherstellen',restore);button(el,'Entwurf herunterladen',()=>download(pending));button(el,'Entwurf verwerfen',()=>{if(!confirm('Diesen Entwurf endgültig verwerfen?'))return;localStorage.removeItem(pending.key);pending=null;offeredContext='';offer()});}
   else if(conflict){button(el,'Entwurf herunterladen',()=>download({...options.snapshot(),forms:formDrafts}));button(el,'Aktuellen Stand laden',async()=>{if(!confirm('Lokale Änderungen verwerfen und aktuellen Stand laden? Entwurf vorher bei Bedarf herunterladen.'))return;discard();await options.reload();});}
   else if(options.snapshot().data)button(el,'Erneut speichern',()=>options.retry());
   el.hidden=!pending&&!conflict&&!storageError&&!options.snapshot().data&&!options.snapshot().roomInputs?.length&&!Object.keys(formDrafts).length;
  }
  function offer(){
   if(!options.writable())return;
   if(offeredContext!==context()&&!pending&&!options.snapshot().data){offeredContext=context();try{pending=store()?.list()[0]||null}catch{storageError=true}}
   render();
  }
  async function restore(){
   if(!pending)return;const value=pending;
   restoring=true;recoveryError='';
   try{
    await options.restore(value);
    formDrafts=value.forms||{};
    for(const [id,draft] of Object.entries(formDrafts)){
     await options.prepareForm(id,draft);
     const target=document.getElementById(id),form=target?.matches('form')?target:target?.querySelector('form');if(!form)continue;
     for(const data of draft.fields){const input=form.elements.namedItem(data.name);if(!input||['file','password'].includes(input.type))continue;if(input.type==='checkbox')input.checked=!!data.value;else input.value=data.value;input.dispatchEvent(new Event('change',{bubbles:true}));}
     if(draft.revision!=null)form.dataset.expectedRevision=draft.revision;
     form.dataset.dirty='true';
    }
    pending=null;localStorage.removeItem(value.key);loadedContext=context();
   }catch(error){recoveryError='Wiederherstellung fehlgeschlagen: '+error.message;}finally{restoring=false;persist();render();}
   // Restoring never writes to the server; the user explicitly resumes saving.
  }
  function discard(){try{store()?.remove()}catch{}formDrafts={};pending=null;conflict=false;render();}
  document.addEventListener('input',event=>{if(!event.target.closest('#panageiApp'))return;clearTimeout(timer);timer=setTimeout(persist,150)});
  document.addEventListener('change',event=>{if(event.target.closest('#panageiApp'))queueMicrotask(persist)});
  document.addEventListener('submit',event=>{if(event.target.closest('#panageiApp'))queueMicrotask(persist)});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)persist()});
  window.addEventListener('pagehide',persist);
  window.addEventListener('beforeunload',e=>{persist();if(options.busy()||options.snapshot().data||options.snapshot().roomInputs?.length||Object.keys(formDrafts).length){e.preventDefault();e.returnValue=''}});
  window.addEventListener('online',()=>options.online());
  return {persist,offer,render,discard,resetSession(){pending=null;conflict=false;formDrafts={};loadedContext='';offeredContext='';},conflict(){conflict=true;persist();render()},get pending(){return !!pending},get hasConflict(){return conflict}};
 };
})(globalThis);
