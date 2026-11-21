const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const A=require('../preview/js/assignments.js');
const members=[{user_id:'a',display_name:'Anna'},{user_id:'b',display_name:'Ben'}];
test('reassignment clears the opposite mode and unassignment clears both',()=>{
 assert.deepEqual(A.patch('all'),{assigned_to:null,assigned_to_all:true});
 assert.deepEqual(A.patch('b'),{assigned_to:'b',assigned_to_all:false});
 assert.deepEqual(A.patch(''),{assigned_to:null,assigned_to_all:false});
});
test('my tasks include shared tasks but exclude tasks assigned to others',()=>{
 const tasks=[A.patch('a'),A.patch('b'),A.patch('all'),A.patch('')];
 assert.deepEqual(tasks.map(t=>A.matches(t,'me','a')),[true,false,true,false]);
 assert.deepEqual(tasks.map(t=>A.matches(t,'unassigned','a')),[false,false,false,true]);
 assert.deepEqual(tasks.map(t=>A.matches(t,'all','a')),[false,false,true,false]);
 assert.deepEqual(tasks.map(t=>A.matches(t,'b','a')),[false,true,false,false]);
 assert.equal(A.matches(A.patch('all'),'me',undefined),false);
});
test('former members keep a readable retained selection',()=>{
 assert.equal(A.label(A.patch('b'),members),'Ben');
 assert.equal(A.label(A.patch('former'),members),'Ehemaliges Mitglied');
 assert.ok(A.options(members,'a','former').some(([id])=>id==='former'));
 assert.ok(A.options(members,'a').some(([id,label])=>id==='a'&&label==='Anna (ich)'));
});
test('room synchronization preserves assignments and only changes assignment fields',()=>{
 const source=fs.readFileSync(require.resolve('../preview/js/app.js'),'utf8');
 const start=source.indexOf('function syncRows('),end=source.indexOf('async function cloudPush()',start);
 const ctx={numeric:v=>v===''||v==null?null:Number(v)};
 vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);
 const rid='00000000-0000-4000-8000-000000000001',tid='00000000-0000-4000-8000-000000000002';
 const task={id:tid,text:'Test',done:false,assigned_to:'a',assigned_to_all:false};
 const data={'1':[{id:rid,name:'Test room',tasks:[task]}]};
 const before=ctx.syncRows(data,'project').tasks.get(tid);
 assert.equal(before.assigned_to,'a');
 Object.assign(task,A.patch('all'));
 const after=ctx.syncRows(data,'project').tasks.get(tid);
 assert.deepEqual(JSON.parse(JSON.stringify(ctx.changedFields(before,after))),A.patch('all'));
});
