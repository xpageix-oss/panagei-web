(function(root){
 'use strict';
 const value=task=>task.assigned_to_all?'all':task.assigned_to||'';
 const patch=selection=>({assigned_to:selection&&selection!=='all'?selection:null,assigned_to_all:selection==='all'});
 const label=(task,members)=>task.assigned_to_all?'Gemeinsam':task.assigned_to?(members.find(m=>m.user_id===task.assigned_to)?.display_name||'Ehemaliges Mitglied'):'Nicht zugewiesen';
 function options(members,me,current=''){
  const list=[['','Nicht zugewiesen'],['all','Gemeinsam'],...members.map(m=>[m.user_id,m.display_name+(m.user_id===me?' (ich)':'')])];
  if(current&&!list.some(([id])=>id===current))list.push([current,'Ehemaliges Mitglied']);
  return list;
 }
 const matches=(task,filter,me)=>!filter||(filter==='me'?!!me&&(task.assigned_to===me||task.assigned_to_all===true):filter==='all'?task.assigned_to_all===true:filter==='unassigned'?!task.assigned_to&&!task.assigned_to_all:task.assigned_to===filter);
 const api={value,patch,label,options,matches};
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.PanageiAssignments=api;
})(typeof globalThis!=='undefined'?globalThis:this);
