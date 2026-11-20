const test=require('node:test');const assert=require('node:assert/strict');
const {readAll,revisionQuery,draftStore,ConflictError,transient}=require('../preview/js/safety.js');
test('pagination follows short server pages until empty and preserves project filter',async()=>{
 const rows=Array.from({length:1203},(_,id)=>({id})),queries=[];
 const result=await readAll(async q=>{const p=new URLSearchParams(q.slice(1));queries.push(p);return rows.slice(+p.get('offset'),+p.get('offset')+127)},'?project_id=eq.project&order=updated_at.asc');
 assert.equal(result.length,1203);assert.equal(result[1202].id,1202);assert.ok(queries.every(p=>p.get('project_id')==='eq.project'&&p.get('order')==='updated_at.asc,id.asc'));
});
test('explicitly bounded reads stay bounded',async()=>{let calls=0;await readAll(async()=>{calls++;return [1]},'?limit=100');assert.equal(calls,1)});
test('CAS is mandatory and retains row and project predicates',()=>{assert.throws(()=>revisionQuery('?id=eq.a',undefined),ConflictError);const p=new URLSearchParams(revisionQuery('?id=eq.a&project_id=eq.p',4));assert.equal(p.get('revision'),'eq.4');assert.equal(p.get('project_id'),'eq.p')});
test('draft recovery survives a new store and isolates account, project and channel',()=>{
 const values=new Map();const storage={get length(){return values.size},key:i=>[...values.keys()][i],getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const a=draftStore(storage,'user|project|preview','tab');a.save({data:{note:'unfinished'},forms:{}});
 assert.equal(draftStore(storage,'user|project|preview','new-tab').list()[0].data.note,'unfinished');assert.equal(draftStore(storage,'other|project|preview','tab').list().length,0);assert.equal(draftStore(storage,'user|project|live','tab').list().length,0);a.remove();assert.equal(a.list().length,0);
});
test('network and rate-limit failures do not invalidate the session',()=>{for(const status of [undefined,408,429,500,503])assert.equal(transient({status}),true);for(const status of [400,401,403])assert.equal(transient({status}),false)});
