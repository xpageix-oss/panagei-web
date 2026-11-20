/* Shared transport and persistence primitives. No credentials are stored here. */
(function (root) {
 'use strict';
 class ConflictError extends Error {
  constructor() { super('Zwischenzeitlich geändert oder gelöscht. Entwurf bleibt erhalten. Bitte aktuellen Stand laden und Änderungen vergleichen.'); this.name='ConflictError'; }
 }
 function revisionQuery(query, revision) {
  if (!Number.isSafeInteger(Number(revision)) || revision == null) throw new ConflictError();
  const p=new URLSearchParams(query.replace(/^\?/,''));p.set('revision','eq.'+revision);return '?'+p;
 }
 async function readAll(read, query='', order='id.asc') {
  const p=new URLSearchParams(query.replace(/^\?/,''));
  if(p.has('limit')||p.has('offset'))return read('?'+p);
  const sort=p.get('order');p.set('order',sort?sort+(sort.split(',').some(x=>x.split('.')[0]===order.split('.')[0])?'':','+order):order);
  const result=[];let offset=0;
  for(;;){p.set('limit','500');p.set('offset',String(offset));const rows=await read('?'+p);if(!Array.isArray(rows))throw Error('Ungültige Datenantwort');result.push(...rows);if(!rows.length)return result;offset+=rows.length;if(offset>100000)throw Error('Zu viele Einträge. Bitte Projekt eingrenzen.');}
 }
 function draftKey(context,client){return 'panagei-draft-v1:'+encodeURIComponent(context)+':'+client}
 function draftStore(storage, context, client) {
  const key=draftKey(context,client);
  return {
   save(value){storage.setItem(key,JSON.stringify({version:1,context,client,savedAt:new Date().toISOString(),...value}));},
   remove(){storage.removeItem(key)},
   list(){const rows=[];for(let i=0;i<storage.length;i++){const k=storage.key(i);if(!k?.startsWith('panagei-draft-v1:'))continue;try{const v=JSON.parse(storage.getItem(k));if(v.version===1&&v.context===context)rows.push({...v,key:k});}catch{}}return rows.sort((a,b)=>b.savedAt.localeCompare(a.savedAt));}
  };
 }
 function transient(error){return !error.status||error.status===408||error.status===429||error.status>=500;}
 root.PanageiSafety={ConflictError,revisionQuery,readAll,draftStore,transient};
 if(typeof module!=='undefined')module.exports=root.PanageiSafety;
})(globalThis);
