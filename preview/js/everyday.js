(function(){
'use strict';
const API='https://evvfenvbvctcvyscooyp.supabase.co',KEY='sb_publishable_ju52qhrdcwX4PzwC6ied_A_w7f5YQDB';
const app=document.getElementById('panageiApp');
if(!app)return;
const style=document.createElement('style');style.textContent=`
#panageiApp:not([data-context="alltag"]) #panageiTabs [data-panagei-tab="shopping"]{display:none!important}
#panageiEveryday #shopDetail[hidden],#panageiEveryday #shopMatches[hidden]{display:none!important}
#shopFilters{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem;margin:1rem 0}
#shopFilters button[aria-pressed="true"]{outline:2px solid currentColor;outline-offset:1px}
#shopMatches{display:grid;gap:.4rem;margin:.75rem 0}
#shopStatus{display:inline-flex;align-items:center;gap:.5em;font-weight:700}
#shopStatus::before{content:'';width:1em;height:1em;border-radius:50%;border:1px solid #555;background:var(--shop-color)}
#shopStatus[data-state="open"]{--shop-color:#facc15}
#shopStatus[data-state="started"]{--shop-color:#ef4444}
#shopStatus[data-state="complete"]{--shop-color:#22c55e}
#panageiEveryday .shop-fields{display:grid;grid-template-columns:5em minmax(0,1fr) 8em;gap:8px}
#panageiEveryday label.shop-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #adc2ce}
#panageiEveryday label.shop-item input{width:21px;min-height:21px}
.shop-item span{flex:1;overflow-wrap:anywhere}.shop-item:has(:checked) span{text-decoration:line-through}
@media(max-width:560px){#panageiEveryday .shop-fields{grid-template-columns:5em minmax(0,1fr)}.shop-fields label:last-child{grid-column:1/-1}}
#panageiTabs[hidden]{display:none!important}
#panageiContextSwitch{display:flex;gap:8px;padding:12px max(16px,calc((100vw - 1160px)/2));background:#e4eee7}
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
@media(max-width:500px){#panageiContextSwitch button{max-width:none}#panageiEveryday .everyday-panel{padding:13px}}
/* V75.1: consistent per-mode color treatment */
#panageiApp:has(#panageiEveryday[hidden]) #panageiContextSwitch{
 background:#dcebe0;
 border-bottom:1px solid #88ab97;
 box-shadow:0 3px 12px #123b2618;
}
#panageiApp:has(#panageiEveryday[hidden]) #panageiContextSwitch button{
 background:#f1f8f2;
 border:2px solid #80aa8b;
 color:#173e2d;
}
#panageiApp:has(#panageiEveryday[hidden]) #panageiContextSwitch button[aria-pressed=true]{
 background:#20533b;
 border-color:#20533b;
 color:#fff;
}
#panageiApp:has(#panageiEveryday:not([hidden])) #panageiEveryday{
 background:#dceaf6;
 border:1px solid #abc4d8;
 box-shadow:0 5px 18px #173e5c1a;
}
#panageiApp:has(#panageiEveryday:not([hidden])) #panageiEveryday .everyday-panel{
 background:#eef5fc;
 border:1px solid #9eb9cf;
}
#panageiApp:has(#panageiEveryday:not([hidden])) #panageiEveryday .workspace-form{
 background:#e2eef9;
 border:1px solid #a5c3db;
}
#panageiApp:has(#panageiEveryday:not([hidden])) #panageiEveryday .everyday-fields{
 background:#e5f0fa;
 border-radius:10px;
 padding:12px;
}
/* V75: clearly differentiated blue-grey everyday workspace */
#panageiApp:has(#panageiEveryday:not([hidden])){background:#e9f1f8;color:#1a3854}
#panageiApp:has(#panageiEveryday:not([hidden]))>header{background:#254969}
#panageiContextSwitch{position:relative;z-index:13;background:#ddeaf5;border-bottom:1px solid #aebfd0;box-shadow:0 3px 12px #152e4212}
#panageiContextSwitch button{border:2px solid #a0b4c6;background:#f8fbff;color:#1b405e;min-height:46px}
#panageiContextSwitch button[aria-pressed=true]{background:#254d71;color:#fff;border-color:#254d71}
#panageiEveryday{background:#e9f1f8;color:#1a3854;border-radius:16px}
#panageiEveryday h2,#panageiEveryday h3{color:#173b59}
#panageiEveryday>p{color:#50677c}
#panageiEveryday .everyday-panel{background:#fff;border:1px solid #b5c8d9;box-shadow:0 4px 14px #1c395414}
#panageiEveryday .everyday-tabs button{flex:1;border:1px solid #a9bfd1;background:#f8fbfe;color:#224966;font-weight:650}
#panageiEveryday .everyday-tabs button[aria-selected=true]{background:#254d71;color:#fff;border-color:#254d71}
#panageiEveryday :is(input,select,textarea){background:#fff!important;color:#193b58!important;border:1px solid #93abc0!important}
#panageiEveryday :is(input,select,textarea):focus-visible{outline:3px solid #4b8bbd!important;outline-offset:2px}
#panageiEveryday button{background:#f1f6fb;color:#234666;border:1px solid #a3bbce}
#panageiEveryday button[type=submit]{background:#254d71;color:#fff;border-color:#254d71;font-weight:700}
#panageiEveryday .everyday-entry{border-color:#c9d7e3}
#panageiEveryday .everyday-entry small{color:#456277}
#panageiEveryday .everyday-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
#panageiEveryday .everyday-fields label{min-width:0;font-weight:550}
#panageiEveryday .everyday-wide{grid-column:1/-1}
#panageiEveryday .everyday-reminders{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
#panageiEveryday .everyday-reminders label{display:flex;gap:8px;align-items:center;font-weight:400}
#panageiEveryday .everyday-reminders input[type=checkbox]{width:19px;height:19px;min-height:19px;flex:none;accent-color:#254d71}
#panageiEveryday .everyday-calendar .has-events{border-color:#3579aa}
#panageiEveryday .everyday-calendar button[aria-pressed=true]{background:#254d71;color:#fff}
#panageiEveryday .everyday-status{font-size:13px;color:#234c6c}
@media(min-width:761px){#panageiContextSwitch{margin-left:0;padding:12px 16px}#panageiEveryday{margin:18px auto;max-width:min(980px,calc(100% - 36px))}}
@media(max-width:760px){#panageiEveryday{margin:10px;padding:12px;border-radius:12px}#panageiContextSwitch{padding:10px 12px}}
@media(max-width:500px){#panageiEveryday .everyday-fields,#panageiEveryday .everyday-reminders{grid-template-columns:1fr}#panageiEveryday .everyday-wide{grid-column:1}}


/* V76 -- identical app shell, sidebar and content dimensions in both contexts */
#panageiApp:has(#panageiEveryday:not([hidden])){background:radial-gradient(ellipse at 65% 17%,#244862,#152f43 65%,#102736);color:#ecf4fa}
#panageiApp:has(#panageiEveryday:not([hidden]))>header{background:#122d40!important;border-right-color:#5c7d95}
#panageiApp:has(#panageiEveryday:not([hidden])) #panageiTabs{display:flex!important;background:linear-gradient(165deg,#102b3f,#17384f);border-right-color:#6d91a8}
#panageiApp:has(#panageiEveryday:not([hidden])) #panageiTabs button{color:#eff6fb}
#panageiApp:has(#panageiEveryday:not([hidden])) #panageiTabs button[aria-selected=true]{background:linear-gradient(110deg,#cde6fb,#81a9ca);color:#143650;border-color:#bbd7ed}
#panageiApp:has(#panageiEveryday:not([hidden])) #panageiTabs button[aria-selected=true] svg{color:#214966}
#panageiApp:has(#panageiEveryday:not([hidden])) #panageiTabs button svg{color:#c2deed}
#panageiApp:has(#panageiEveryday:not([hidden])) #panageiContextSwitch{background:#dce9f5}
#panageiApp #panageiEveryday.panagei-page{
 width:calc(100% - 32px);max-width:1450px;min-width:0;
 margin:20px auto;box-sizing:border-box;padding:clamp(13px,2vw,25px);
 background:#e3edf7!important;border:1px solid #a9c2d7!important;border-radius:18px!important;
 color:#1b3c56;box-shadow:0 12px 36px #051c2e42;
}
#panageiEveryday .everyday-page-title{font-size:clamp(25px,3vw,36px);font-weight:730;letter-spacing:-.035em;margin:0 0 6px}
#panageiEveryday .everyday-lead{font-size:14px;color:#526e83;margin:0 0 20px}
#panageiEveryday .everyday-panel{padding:clamp(12px,2vw,22px);border-radius:12px}
#panageiEveryday .everyday-dashboard-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
#panageiEveryday .everyday-dashboard-stats>div{background:#e1edf8;border:1px solid #b1c8dc;border-radius:10px;padding:14px;min-width:0}
#panageiEveryday .everyday-dashboard-stats strong{display:block;font-size:clamp(18px,2.5vw,28px);color:#1b496b}
#panageiEveryday .everyday-dashboard-stats small{font-size:12px;color:#456680}
#panageiEveryday .everyday-shortcuts{display:flex;flex-wrap:wrap;gap:10px}
#panageiEveryday .everyday-shortcuts button{min-width:180px;text-align:left}
#panageiEveryday .everyday-placeholder{min-height:240px}
#panageiEveryday #everydayStatus{margin:0 0 10px;font-size:13px;color:#3c627e}
#panageiEveryday .everyday-tabs{display:none!important}
@media(max-width:760px){
 #panageiApp #panageiEveryday.panagei-page{width:calc(100% - 20px);padding:12px;margin:12px auto 20px;border-radius:14px!important}
 #panageiEveryday .everyday-dashboard-stats{grid-template-columns:1fr 1fr}
 #panageiEveryday .everyday-shortcuts button{flex:1}
}
@media(max-width:380px){#panageiEveryday .everyday-dashboard-stats{grid-template-columns:1fr}}


/* V78: Alltag navigation includes Dashboard, Aufgaben, Kalender, Einstellungen. Umbau unchanged. */
#panageiApp[data-context="alltag"] #panageiTabs button:not([data-panagei-tab="dashboard"]):not([data-panagei-tab="aufgaben"]):not([data-panagei-tab="calendar"]):not([data-panagei-tab="settings"]):not([data-panagei-tab="shopping"]){display:none!important}
#panageiApp[data-context="alltag"] #panageiTabs button{color:#eaf4fc!important;border-color:transparent!important;background:transparent!important}
#panageiApp[data-context="alltag"] #panageiTabs button:hover{background:#2b5472!important}
#panageiApp[data-context="alltag"] #panageiTabs button[aria-selected="true"]{background:#7baed1!important;color:#102f47!important;border-color:#b3d7ed!important;box-shadow:0 4px 16px #2a67984d!important}
#panageiApp[data-context="alltag"] #panageiTabs button svg{color:#bddaf0!important}
#panageiApp[data-context="alltag"] #panageiTabs button[aria-selected="true"] svg{color:#1e4c72!important}
#panageiApp[data-context="alltag"] #panageiEveryday button,
#panageiApp[data-context="alltag"] #panageiEveryday .panagei-panel button{background:#e3effb!important;color:#173d59!important;border:1px solid #7ca7c8!important;border-radius:9px}
#panageiApp[data-context="alltag"] #panageiEveryday button:hover{background:#c6e1f5!important;border-color:#427fae!important}
#panageiApp[data-context="alltag"] #panageiEveryday button[type="submit"],
#panageiApp[data-context="alltag"] #panageiEveryday button[aria-pressed="true"],
#panageiApp[data-context="alltag"] #panageiEveryday button[aria-selected="true"]{background:#255d8d!important;color:#fff!important;border-color:#255d8d!important}
#panageiApp[data-context="alltag"] #panageiEveryday button:focus-visible,
#panageiApp[data-context="alltag"] #panageiTabs button:focus-visible{outline:3px solid #4da1df!important;outline-offset:2px}
#panageiApp[data-context="alltag"] #panageiEveryday input[type="checkbox"]{accent-color:#286e9f!important}
#panageiApp[data-context="alltag"] #panageiEveryday label,
#panageiApp[data-context="alltag"] #panageiEveryday .workspace-field{color:#1c4666!important}
#panageiApp[data-context="alltag"] #panageiEveryday .everyday-fields{background:#e5f0fa!important}
#panageiApp[data-context="alltag"] #panageiEveryday .workspace-form{background:#d8e9f8!important}


/* V79: readable dashboard lists and shared settings in blue everyday shell */
#panageiApp[data-context="alltag"]{background:radial-gradient(ellipse at 65% 17%,#244862,#152f43 65%,#102736)!important}
#panageiApp[data-context="alltag"]>header{background:#122d40!important;border-right-color:#5c7d95!important}
#panageiApp[data-context="alltag"] #panageiTabs{background:linear-gradient(165deg,#102b3f,#17384f)!important;border-right-color:#6d91a8!important}
#panageiApp[data-context="alltag"] #panageiContextSwitch{background:#dce9f5!important;border-color:#abc5db!important}
#panageiApp[data-context="alltag"] #everydayCurrentTasks,
#panageiApp[data-context="alltag"] #everydayUpcoming{color:#1b3c56!important;font-size:14px;line-height:1.6;min-height:26px}
#panageiApp[data-context="alltag"] #everydayCurrentTasks .everyday-entry,
#panageiApp[data-context="alltag"] #everydayUpcoming .everyday-entry{color:#183d5a!important;background:#e6f0fa!important;border:1px solid #b6cadc!important;border-radius:9px;padding:11px 13px;margin:7px 0}
#panageiApp[data-context="alltag"] #everydayCurrentTasks .everyday-entry strong,
#panageiApp[data-context="alltag"] #everydayUpcoming .everyday-entry strong{display:block;color:#173951!important;font-size:15px}
#panageiApp[data-context="alltag"] #everydayCurrentTasks .everyday-entry small,
#panageiApp[data-context="alltag"] #everydayUpcoming .everyday-entry small{display:block;color:#365d7c!important;font-size:13px;margin-top:3px}
#panageiApp[data-context="alltag"] #panageiSettingsPage{
 background:#e3edf7!important;color:#1a3d58!important;border:1px solid #aac3d6!important;
 border-radius:18px!important;max-width:1450px!important;margin:20px auto!important;padding:clamp(13px,2vw,25px)!important;
}
#panageiApp[data-context="alltag"] #panageiSettingsPage h2,
#panageiApp[data-context="alltag"] #panageiSettingsPage h3,
#panageiApp[data-context="alltag"] #panageiSettingsPage summary{color:#173e5b!important}
#panageiApp[data-context="alltag"] #panageiSettingsPage :is(.panagei-panel,details,.settings-inner){
 background:#eef5fb!important;border-color:#abc3d8!important;color:#1b405b!important
}
#panageiApp[data-context="alltag"] #panageiSettingsPage :is(button,select,input:not([type="checkbox"]),textarea){
 background:#e2eef9!important;border:1px solid #82aac9!important;color:#173e59!important
}
#panageiApp[data-context="alltag"] #panageiSettingsPage button:hover{background:#cbe3f4!important}
#panageiApp[data-context="alltag"] #panageiSettingsPage :is(input[type="checkbox"]){accent-color:#286e9f!important}
#panageiApp[data-context="alltag"] #panageiSettingsPage :is(.settings-line,.settings-info,small,p,label){color:#284b65!important;border-color:#b6ccdd!important}
@media(max-width:760px){
 #panageiApp[data-context="alltag"] #panageiSettingsPage{width:calc(100% - 20px)!important;margin:12px auto 20px!important;padding:12px!important;border-radius:14px!important}
}

/* V80.1 readable selected calendar day titles */
#panageiApp[data-context="alltag"] #everydaySelectedDay{margin-top:14px;padding:14px;background:#f8fbff;border:1px solid #9dbbd3;border-radius:10px;color:#173d59!important}
#panageiApp[data-context="alltag"] #everydaySelectedDay h4{font-size:16px;font-weight:700;color:#173d59!important;margin:0 0 9px}
#panageiApp[data-context="alltag"] #everydaySelectedDay .everyday-day-event{padding:11px 12px;margin:7px 0;border:1px solid #b3ccdf;border-radius:8px;background:#eaf3fc;color:#173d59!important}
#panageiApp[data-context="alltag"] #everydaySelectedDay .everyday-day-event strong{display:block;font-size:15px;font-weight:700;color:#173d59!important}
#panageiApp[data-context="alltag"] #everydaySelectedDay .everyday-day-event small{display:block;font-size:13px;color:#3c607c!important;margin-top:3px}


/* V82: explicit contrast for event titles in the full calendar list */
#panageiApp[data-context="alltag"] #panageiEveryday #everydayList .everyday-entry{color:#193d59!important;border-color:#bbcedf!important}
#panageiApp[data-context="alltag"] #panageiEveryday #everydayList .everyday-entry .everyday-row strong{
 color:#183a58!important;opacity:1!important;font-size:16px;font-weight:750;
 text-shadow:none!important;filter:none!important
}
#panageiApp[data-context="alltag"] #panageiEveryday #everydayList .everyday-entry>small{
 color:#355c79!important;opacity:1!important;font-size:13px
}
#panageiApp[data-context="alltag"] #panageiEveryday #everydayList .everyday-entry>p{color:#284f6d!important}
#panageiApp[data-context="alltag"] #panageiEveryday #everydaySelectedDay h4{
 color:#173d59!important;opacity:1!important
}


/* V84: shared event card for dashboard, calendar and selected day */
#panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card{
 background:#edf6fd!important;color:#173b59!important;border:1px solid #a8c8e0!important;
 border-radius:10px;padding:14px 16px;margin:9px 0;min-width:0;
}
#panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card .everyday-event-title{
 display:block;font-size:16px;font-weight:750;color:#133957!important;opacity:1!important;
}
#panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card .everyday-event-meta{
 margin-top:5px;font-size:13px;color:#315d7b!important;opacity:1!important;
}
#panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card .everyday-event-notes{
 margin-top:10px;border-top:1px solid #b8d0e4;padding-top:9px;color:#204762!important;
}
#panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card .everyday-event-notes-label{
 display:block;font-size:12px;font-weight:750;color:#285877!important;
}
#panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card .everyday-event-notes p{
 margin:3px 0;white-space:pre-wrap;overflow-wrap:anywhere;color:#204762!important;font-size:14px;
}
#panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card .everyday-event-reminders{
 font-size:12px;color:#386181!important;margin-top:8px;
}
#panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card .everyday-event-actions{
 margin-top:11px;justify-content:flex-start;gap:8px!important;
}
#panageiApp[data-context="alltag"] #panageiEveryday #everydayFormDisclosure{
 padding:0!important;overflow:hidden;
}
#panageiApp[data-context="alltag"] #panageiEveryday #everydayFormDisclosure>summary{
 cursor:pointer;display:flex;align-items:center;justify-content:space-between;
 gap:14px;padding:15px 18px;list-style:none;font-weight:750;
 color:inherit!important;font-size:16px;min-height:56px;
}
#panageiApp[data-context="alltag"] #panageiEveryday #everydayFormDisclosure>summary::-webkit-details-marker{display:none}
#panageiApp[data-context="alltag"] #panageiEveryday #everydayFormDisclosure>summary:after{
 content:"▾";margin-left:auto;font-size:18px;
}
#panageiApp[data-context="alltag"] #panageiEveryday #everydayFormDisclosure:not([open])>summary:after{content:"▸"}
#panageiApp[data-context="alltag"] #panageiEveryday #everydayFormDisclosure .everyday-disclosure-hint{
 font-weight:400;font-size:12px;opacity:.78;
}
#panageiApp[data-context="alltag"] #panageiEveryday #everydayFormDisclosure form{
 margin:0 12px 12px;
}
html[data-theme="dark"] #panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card{
 background:#254968!important;border-color:#527c9d!important;color:#f0f8ff!important;
}
html[data-theme="dark"] #panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card .everyday-event-title,
html[data-theme="dark"] #panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card .everyday-event-notes p,
html[data-theme="dark"] #panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card .everyday-event-notes-label{
 color:#f3f9ff!important;
}
html[data-theme="dark"] #panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card :is(.everyday-event-meta,.everyday-event-reminders){
 color:#c9e0f4!important;
}
html[data-theme="dark"] #panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card .everyday-event-notes{
 border-color:#567d9d!important;color:#e5f3ff!important;
}
@media(max-width:500px){
 #panageiApp[data-context="alltag"] #panageiEveryday #everydayFormDisclosure>summary{padding:12px;flex-wrap:wrap}
 #panageiApp[data-context="alltag"] #panageiEveryday #everydayFormDisclosure .everyday-disclosure-hint{font-size:11px}
 #panageiApp[data-context="alltag"] #panageiEveryday .everyday-event-card{padding:12px}
}

`;document.head.appendChild(style);
const switcher=document.createElement('div');switcher.id='panageiContextSwitch';switcher.hidden=true;
switcher.innerHTML='<button type="button" data-context="umbau" aria-pressed="true">Umbau</button><button type="button" data-context="alltag" aria-pressed="false">Alltag</button>';
const tabs=document.getElementById('panageiTabs');tabs.before(switcher);
const root=document.createElement('div');root.id='panageiEveryday';root.hidden=true;
root.innerHTML=`<h2>Alltag</h2><p>Eigene Aufgaben und Termine, getrennt vom Umbau. Synchronisiert über das gemeinsame Projekt.</p>
<div class="everyday-tabs" role="tablist"><button type="button" data-view="task" aria-selected="true">Aufgaben</button><button type="button" data-view="event" aria-selected="false">Kalender</button></div>
<div id="everydayStatus" role="status" aria-live="polite"></div>
<details id="everydayFormDisclosure" class="everyday-panel" open><summary id="everydayFormSummary"><span id="everydayFormTitle">Neue Aufgabe</span><span class="everyday-disclosure-hint">Felder anzeigen / ausblenden</span></summary><form id="everydayForm" class="workspace-form"><div class="everyday-fields">
<label class="everyday-wide">Bezeichnung<input name="title" required maxlength="240" autocomplete="off"></label>
<label class="everyday-wide">Notizen<textarea name="notes" maxlength="5000"></textarea></label>
<label id="everydayPriorityLabel">Priorität<select name="priority"><option value="low">Niedrig</option><option value="normal" selected>Normal</option><option value="high">Hoch</option><option value="urgent">Dringend</option></select></label><label id="everydayDateLabel">Frist<input name="due_date" type="date"></label>
<label id="everydayStartLabel" hidden>Datum<input name="event_date" type="date"></label><label id="everydayTimeLabel" hidden>Uhrzeit<input name="event_time" type="time" value="09:00"></label>
<label id="everydayCategoryLabel" hidden>Kategorie<select name="category"><option>Besprechung</option><option>Arzttermin</option><option>Privat</option><option>Familie</option><option>Wartung</option><option>Sonstiges</option></select></label><div class="everyday-wide" id="everydayRemindersLabel" hidden><strong>Erinnerungen</strong><div class="everyday-reminders"><label><input type="checkbox" name="reminder_10080">1 Woche vorher</label><label><input type="checkbox" name="reminder_1440" checked>24 Stunden vorher</label><label><input type="checkbox" name="reminder_120">2 Stunden vorher</label><label><input type="checkbox" name="reminder_60" checked>1 Stunde vorher</label><label><input type="checkbox" name="reminder_30">30 Minuten vorher</label><label><input type="checkbox" name="reminder_15">15 Minuten vorher</label><label><input type="checkbox" name="reminder_0">Zum Terminbeginn</label></div><small>Neue Termine benachrichtigen andere Projektmitglieder mit aktiviertem Push. Zeitgesteuerte Erinnerungen für Alltagstermine sind noch nicht aktiv.</small></div>
<label id="everydayAssigneeLabel">Zuständig<select name="assignee"><option value="">Nicht zugewiesen</option><option value="all">Gemeinsam</option></select></label>
</div><div class="everyday-row"><button type="submit" id="everydaySave">Aufgabe hinzufügen</button><button type="button" id="everydayCancel" hidden>Abbrechen</button></div>
</form></details>
<div id="everydayCalendarBox" class="everyday-panel" hidden></div>
<div class="everyday-panel"><div class="everyday-row"><h3 id="everydayListTitle">Aufgaben</h3><button type="button" id="everydayReload">Aktualisieren</button></div>
<div id="everydayFilterLabel" class="everyday-fields"><label>Zuständigkeit<select id="everydayFilter"><option value="">Alle</option><option value="me">Meine Aufgaben</option><option value="all">Gemeinsam</option><option value="unassigned">Nicht zugewiesen</option></select></label><label>Status<select id="everydayStatusFilter"><option value="open">Offen</option><option value="done">Erledigt</option><option value="all">Alle</option></select></label></div>
<div id="everydayList"></div></div>`;
tabs.after(root);
root.className='panagei-page';
const everydayWork=document.createElement('div');everydayWork.id='everydayWork';
while(root.firstChild)everydayWork.appendChild(root.firstChild);
root.appendChild(everydayWork);
const everydayDashboard=document.createElement('div');everydayDashboard.id='everydayDashboard';everydayDashboard.hidden=true;
everydayDashboard.innerHTML='<h2 class="everyday-page-title">Alltagsübersicht</h2><p class="everyday-lead">Aufgaben und Termine auf einen Blick.</p><section class="everyday-panel"><h3>Schnellaktionen</h3><div class="everyday-shortcuts"><button type="button" data-everyday-shortcut="aufgaben">＋ Neue Aufgabe</button><button type="button" data-everyday-shortcut="calendar">＋ Neuer Termin</button></div></section><section class="everyday-panel"><h3>Dein Alltag</h3><div class="everyday-dashboard-stats"><div><strong id="everydayOpenCount">0</strong><small>Offene Aufgaben</small></div><div><strong id="everydayDoneCount">0</strong><small>Erledigte Aufgaben</small></div><div><strong id="everydayFutureCount">0</strong><small>Bevorstehende Termine</small></div></div><h3 style="margin-top:22px">Aktuelle Aufgaben</h3><div id="everydayCurrentTasks">Noch keine offenen Aufgaben.</div><h3 style="margin-top:22px">Nächste Termine</h3><div id="everydayUpcoming">Noch keine anstehenden Termine.</div></section>';
root.prepend(everydayDashboard);
const everydayPlaceholder=document.createElement('div');everydayPlaceholder.id='everydayPlaceholder';everydayPlaceholder.hidden=true;
everydayPlaceholder.innerHTML='<h2 class="everyday-page-title" id="everydayPlaceholderTitle"></h2><p class="everyday-lead">Dieser Bereich ist für die Alltagsansicht vorgesehen.</p><section class="everyday-panel everyday-placeholder"><h3>Noch keine Einträge</h3><p>Hier wird der entsprechende Alltagsbereich später eingerichtet. Deine Umbaudaten bleiben unverändert.</p></section>';
root.appendChild(everydayPlaceholder);
let everydayPage='dashboard';
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
function localDay(value){const d=new Date(value);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dateLabel(record){if(record.kind==='task')return (record.due_date?'Frist: '+new Date(record.due_date+'T12:00:00').toLocaleDateString('de-DE'):'Ohne Frist')+' · '+({low:'Niedrig',normal:'Normal',high:'Hoch',urgent:'Dringend'}[record.priority]||'Normal');return new Date(record.starts_at).toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'})+' · '+(record.category||'Sonstiges')}
function option(select,value,label){const o=document.createElement('option');o.value=value;o.textContent=label;select.appendChild(o)}
function fillMembers(){const choices=$('everydayForm').elements.assignee;const f=$('everydayFilter');const old=choices.value,filter=f.value;choices.replaceChildren();option(choices,'','Nicht zugewiesen');option(choices,'all','Gemeinsam');for(const m of members)option(choices,m.user_id,m.display_name+(m.user_id===identity?' (ich)':''));choices.value=old;f.replaceChildren();[['','Alle'],['me','Meine Aufgaben'],['all','Gemeinsam'],['unassigned','Nicht zugewiesen'],...members.map(m=>[m.user_id,m.display_name])].forEach(([v,l])=>option(f,v,l));f.value=filter}
async function load(force=false){
 const s=auth(),p=selectedProject();if(!p){status('Projekt wird geladen.');return}
 if(loading)return; if(!force&&p===project&&identity===s.user.id&&Date.now()-lastRefresh<10000)return;
 loading=true;status('Synchronisiere Alltag …');
 try{
 const changed=p!==project||identity!==s.user.id;project=p;identity=s.user.id;
 if(changed){rows=[];role='viewer';shoppingId='';shoppingFilter='';shoppingForm.reset();$('shopMessage').textContent='';renderShopping();edit=null;resetForm()}
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
function resetForm(){edit=null;const form=$('everydayForm');form.reset();if(view==='event')form.elements.event_date.value=selectedDate||localDay(new Date());$('everydayCancel').hidden=true;$('everydayFormTitle').textContent=view==='task'?'Neue Aufgabe':'Neuer Termin';$('everydaySave').textContent=view==='task'?'Aufgabe hinzufügen':'Termin hinzufügen';$('everydayFormDisclosure').open=view==='task'}
function selectView(which){view=which;resetForm();root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.view===view)));for(const id of ['everydayDateLabel','everydayPriorityLabel','everydayAssigneeLabel','everydayFilterLabel'])$(id).hidden=view!=='task';for(const id of ['everydayStartLabel','everydayTimeLabel','everydayCategoryLabel','everydayRemindersLabel','everydayCalendarBox'])$(id).hidden=view!=='event';$('everydayListTitle').textContent=view==='task'?'Aufgaben':'Termine';render()}
function element(tag,className,text,parent){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined&&text!==null)el.textContent=text;if(parent)parent.appendChild(el);return el}
function visibleRows(){const filter=$('everydayFilter').value,doneFilter=$('everydayStatusFilter').value;return rows.filter(r=>!r.shopping_number&&(view!=='task'||doneFilter==='all'||r.done===(doneFilter==='done'))&&r.kind===view&&(!selectedDate||view!=='event'||localDay(r.starts_at)===selectedDate)&&(!filter||view!=='task'||(filter==='me'?(r.assigned_to===identity||r.assigned_to_all):filter==='all'?r.assigned_to_all:filter==='unassigned'?!r.assigned_to&&!r.assigned_to_all:r.assigned_to===filter)))}
function reminderText(minutes){
 const labels={0:'Zum Terminbeginn',5:'5 Minuten',15:'15 Minuten',30:'30 Minuten',60:'1 Stunde',120:'2 Stunden',1440:'24 Stunden',2880:'2 Tage',10080:'1 Woche'};
 return labels[minutes]||minutes+' Minuten';
}
function appendEventCard(parent,r,withActions=false){
 const card=element('article','everyday-event-card',null,parent);
 element('strong','everyday-event-title',r.title,card);
 const when=new Date(r.starts_at).toLocaleString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
 element('div','everyday-event-meta',when+' Uhr · '+(r.category||'Sonstiges'),card);
 if(r.notes&&r.notes.trim()){
  const notes=element('div','everyday-event-notes',null,card);
  element('span','everyday-event-notes-label','Notizen',notes);
  element('p','',r.notes,notes);
 }
 if(Array.isArray(r.reminders)&&r.reminders.length){
  element('div','everyday-event-reminders','Erinnerungen: '+r.reminders.map(reminderText).join(', '),card);
 }
 if(withActions&&role!=='viewer'){
  const buttons=element('div','everyday-row everyday-event-actions',null,card);
  const editButton=element('button','','Bearbeiten',buttons);editButton.type='button';editButton.onclick=()=>startEdit(r);
  const remove=element('button','','Löschen',buttons);remove.type='button';remove.onclick=()=>{if(confirm('Termin wirklich löschen?'))void deleteEntry(r)};
 }
 return card;
}
function renderDashboardEveryday(){
 const open=rows.filter(r=>!r.shopping_number&&r.kind==='task'&&!r.done).length,done=rows.filter(r=>!r.shopping_number&&r.kind==='task'&&r.done).length;
 const future=rows.filter(r=>r.kind==='event'&&new Date(r.starts_at)>=new Date()).sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at));
 $('everydayOpenCount').textContent=String(open);
 $('everydayDoneCount').textContent=String(done);
 $('everydayFutureCount').textContent=String(future.length);
 const taskList=$('everydayCurrentTasks');taskList.replaceChildren();
 const currentTasks=rows.filter(r=>!r.shopping_number&&r.kind==='task'&&!r.done).sort((a,b)=>String(a.due_date||'9999-12-31').localeCompare(String(b.due_date||'9999-12-31')));
 if(!currentTasks.length)taskList.textContent='Keine offenen Aufgaben.';
 for(const task of currentTasks.slice(0,6)){const item=document.createElement('div');item.className='everyday-entry';const name=document.createElement('strong');name.textContent=task.title;item.appendChild(name);const details=document.createElement('small');details.textContent=dateLabel(task)+' · '+memberName(task);item.appendChild(details);taskList.appendChild(item)}
 const upcoming=$('everydayUpcoming');upcoming.replaceChildren();
 if(!future.length){upcoming.textContent='Keine anstehenden Termine.';return}
 for(const r of future.slice(0,5))appendEventCard(upcoming,r,false);
}
function render(){
 renderShopping();
 renderDashboardEveryday();
 const list=$('everydayList');list.replaceChildren();
 const items=visibleRows().sort((a,b)=>view==='task'?Number(a.done)-Number(b.done)||String(a.due_date||'9999').localeCompare(String(b.due_date||'9999')):String(a.starts_at).localeCompare(String(b.starts_at)));
 if(!items.length)element('p','',view==='task'?'Keine Aufgaben für diesen Filter.':'Keine Termine für diese Auswahl.',list);
 for(const r of items){
 if(view==='event'){appendEventCard(list,r,true);continue}

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
 const b=element('button',count?'has-events':'',String(day)+(count?' •':''),grid);b.type='button';b.setAttribute('aria-pressed',String(selectedDate===key));b.setAttribute('aria-label',key+(count?' · '+count+' Termine':''));b.onclick=()=>{selectedDate=selectedDate===key?'':key;if(!edit)$('everydayForm').elements.event_date.value=key;render()};
 }

 const chosen=selectedDate||localDay(new Date());
 const dayBox=element('section','',null,box);dayBox.id='everydaySelectedDay';
 element('h4','Termine am '+new Date(chosen+'T12:00:00').toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}),dayBox);
 const dayEvents=rows.filter(r=>r.kind==='event'&&localDay(r.starts_at)===chosen).sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at));
 if(!dayEvents.length)element('p','','Keine Termine an diesem Tag.',dayBox);
 for(const r of dayEvents)appendEventCard(dayBox,r,false);
}
function startEdit(r){
 edit=r;$('everydayFormDisclosure').open=true;$('everydayFormTitle').textContent='Eintrag bearbeiten';$('everydaySave').textContent='Änderungen speichern';$('everydayCancel').hidden=false;
 const f=$('everydayForm').elements;f.title.value=r.title;f.notes.value=r.notes||'';f.due_date.value=r.due_date||'';f.priority.value=r.priority||'normal';f.category.value=r.category||'Sonstiges';f.event_date.value=r.starts_at?localDay(r.starts_at):'';f.event_time.value=r.starts_at?toLocal(r.starts_at).slice(11,16):'09:00';for(const m of [10080,1440,120,60,30,15,0])f['reminder_'+m].checked=(r.reminders||[]).includes(m);f.assignee.value=r.assigned_to_all?'all':r.assigned_to||'';root.scrollIntoView({block:'start',behavior:'smooth'});
}
function toLocal(value){const d=new Date(value),t=new Date(d.getTime()-d.getTimezoneOffset()*60000);return t.toISOString().slice(0,16)}
async function mutate(r,fields){
 try{await request('panagei_everyday_entries?id=eq.'+encodeURIComponent(r.id)+'&project_id=eq.'+encodeURIComponent(project)+'&updated_at=eq.'+encodeURIComponent(r.updated_at),'PATCH',{...fields,updated_at:new Date().toISOString()},{'Prefer':'return=representation'}).then(data=>{if(!data?.length)throw Error('Eintrag wurde zwischenzeitlich geändert. Bitte aktualisieren.')});await load(true)}
 catch(e){status('Speichern fehlgeschlagen: '+e.message);throw e}
}
async function removeEntry(r){const out=await request('panagei_everyday_entries?id=eq.'+encodeURIComponent(r.id)+'&project_id=eq.'+encodeURIComponent(project)+'&updated_at=eq.'+encodeURIComponent(r.updated_at),'DELETE',null,{'Prefer':'return=representation'});if(!out?.length)throw Error('Eintrag inzwischen geändert')}
async function deleteEntry(r){try{await removeEntry(r);resetForm();await load(true)}catch(e){status('Löschen fehlgeschlagen: '+e.message)}}
$('everydayForm').onsubmit=async e=>{
 e.preventDefault();if(role==='viewer'){status('Keine Schreibberechtigung');return}
 const f=e.currentTarget.elements,p=selectedProject();if(!p)return;
 const payload={title:f.title.value.trim(),notes:f.notes.value.trim(),kind:view,project_id:p};
 if(!payload.title)return;
 if(view==='task'){payload.due_date=f.due_date.value||null;payload.priority=f.priority.value;payload.assigned_to=f.assignee.value&&f.assignee.value!=='all'?f.assignee.value:null;payload.assigned_to_all=f.assignee.value==='all'}
 else{if(!f.event_date.value||!f.event_time.value){status('Bitte Datum und Uhrzeit angeben');return}payload.starts_at=new Date(f.event_date.value+'T'+f.event_time.value).toISOString();payload.ends_at=null;payload.category=f.category.value;payload.reminders=[10080,1440,120,60,30,15,0].filter(m=>f['reminder_'+m].checked)}
 const save=$('everydaySave');save.disabled=true;
 try{if(edit){await mutate(edit,payload)}else{await request('panagei_everyday_entries','POST',payload);await load(true)}resetForm();status('Gespeichert und synchronisiert')}catch(e){status('Speichern fehlgeschlagen: '+e.message)}finally{save.disabled=false}
};
$('everydayCancel').onclick=resetForm;
$('everydayReload').onclick=()=>void load(true);
$('everydayFilter').onchange=render;$('everydayStatusFilter').onchange=render;
root.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>selectView(b.dataset.view));
const shoppingTab=element('button');
shoppingTab.type='button';
shoppingTab.dataset.panageiTab='shopping';
shoppingTab.setAttribute('role','tab');
shoppingTab.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 4h2l3 12h11l2-9H6M9 20h1m7 0h1"/></svg><span><strong>Einkaufsliste</strong></span>';
tabs.querySelector('[data-panagei-tab="calendar"]').after(shoppingTab);
const shop=element('div','',null,root);
shop.hidden=true;
shop.innerHTML=`<h2 class="everyday-page-title">Einkaufsliste</h2>
<section class="everyday-panel"><button id="shopNew" type="button">Neue Einkaufsliste</button>
<p id="shopMessage" role="status"></p><label>Einkaufsliste wählen<select id="shopSelect"></select></label>
<div id="shopFilters" role="group" aria-label="Einkaufslisten nach Status"></div>
<div id="shopMatches" hidden></div></section>
<section id="shopDetail" class="everyday-panel" hidden><h3 id="shopTitle"></h3><p id="shopStatus" role="status"></p>
<form id="shopForm"><div class="shop-fields"><label>Menge<input name="quantity" type="number" min="1" step="1" required value="1"></label>
<label>Bezeichnung<input name="article" list="shopSuggestions" required maxlength="160" autocomplete="off" placeholder="Artikel suchen oder eingeben"></label>
<datalist id="shopSuggestions"></datalist><label>Geschäft<select name="store"><option>Edeka</option><option>Aldi</option><option>Sonstiges</option></select></label></div>
<button type="submit">Artikel hinzufügen</button></form><div id="shopItems"></div><button id="shopDelete" type="button">Einkaufsliste löschen</button></section>`;
let shoppingId='',shoppingFilter='',shoppingBusy=false;
const shoppingGroups={all:'Gesamt',open:'🟡 Offen',started:'🔴 In Bearbeitung',complete:'🟢 Erledigt'};
for(const [key,label] of Object.entries(shoppingGroups)){
 const button=element('button','',label,$('shopFilters'));
 button.type='button';
 button.dataset.filter=key;
 button.onclick=()=>{
  shoppingFilter=shoppingFilter===key?'':key;
  chooseList('');
 };
}
const shoppingForm=shop.querySelector('form');
const knownArticles=new Map();
function shoppingRecord(){return rows.find(r=>r.id===shoppingId && r.shopping_number)}
function chooseList(id){
 shoppingId=id;
 shoppingForm.reset();
 showEverydayPage('shopping');
}
const shoppingDate=new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'numeric',year:'2-digit',timeZone:'Europe/Berlin'});
function shoppingTitle(list){return 'Einkaufsliste '+shoppingDate.format(new Date(list.created_at))}
function shoppingStatus(list){
 const total=list.shopping_items.length;
 const checked=list.shopping_items.filter(item=>item.done).length;
 if(total && checked===total)return {key:'complete',symbol:'🟢',label:'Erledigt'};
 if(checked)return {key:'started',symbol:'🔴',label:'In Bearbeitung'};
 return {key:'open',symbol:'🟡',label:'Offen'};
}
function renderShopping(){
 const lists=rows.filter(r=>r.shopping_number).sort((a,b)=>b.shopping_number-a.shopping_number);
 const select=$('shopSelect');
 const active=shoppingRecord();
 if(active && shoppingFilter && shoppingFilter!=='all')shoppingFilter=shoppingStatus(active).key;
 const counts={all:lists.length,open:0,started:0,complete:0};
 const matches=$('shopMatches');
 matches.replaceChildren();
 matches.hidden=!shoppingFilter;
 select.replaceChildren();
 option(select,'','Bitte wählen …');
 for(const list of lists){
  const state=shoppingStatus(list);
  counts[state.key]++;
  if(shoppingFilter && shoppingFilter!=='all' && shoppingFilter!==state.key)continue;
  const title=state.symbol+' '+shoppingTitle(list)+' · '+state.label;
  option(select,list.id,title);
  if(shoppingFilter){
   const button=element('button','',title,matches);
   button.type='button';
   button.disabled=shoppingBusy;
   button.onclick=()=>chooseList(list.id);
  }
 }
 if(shoppingFilter && !counts[shoppingFilter])element('p','','Keine Einkaufslisten in dieser Ansicht.',matches);
 for(const button of $('shopFilters').children){
  const key=button.dataset.filter;
  button.textContent=shoppingGroups[key]+' ('+counts[key]+')';
  button.setAttribute('aria-pressed',String(shoppingFilter===key));
  button.disabled=shoppingBusy;
 }
 shoppingId=active?.id||'';
 select.value=shoppingId;
 $('shopDetail').hidden=!active;
 const writable=!shoppingBusy && project===selectedProject() && identity===session()?.user?.id && role!=='viewer';
 $('shopNew').disabled=!writable;
 select.disabled=shoppingBusy;
 knownArticles.clear();
 for(const list of lists)for(const item of [...list.shopping_items].reverse()){
  const key=item.name.toLocaleLowerCase('de');
  if(!knownArticles.has(key))knownArticles.set(key,item);
 }
 const suggestions=$('shopSuggestions');suggestions.replaceChildren();
 for(const item of knownArticles.values())option(suggestions,item.name,item.store);
 if(!active)return;
 $('shopTitle').textContent=shoppingTitle(active);
 const state=shoppingStatus(active);
 $('shopStatus').dataset.state=state.key;
 $('shopStatus').textContent=state.label+' · '+active.shopping_items.filter(item=>item.done).length+' von '+active.shopping_items.length+' abgehakt';
 shoppingForm.hidden=role==='viewer';
 for(const field of shoppingForm.elements)field.disabled=!writable;
 const box=$('shopItems');box.replaceChildren();
 if(!active.shopping_items.length)element('p','','Noch keine Artikel.',box);
 for(const item of active.shopping_items){
  const label=element('label','shop-item',null,box);
  const check=element('input','',null,label);check.type='checkbox';check.checked=item.done;check.disabled=!writable;
  element('span','',item.quantity+' × '+item.name,label);
  element('small','',item.store,label);
  check.onchange=()=>shopAction(()=>updateShop(active,{shopping_items:active.shopping_items.map(i=>i.id===item.id?{...i,done:check.checked}:i)}));
 }
 $('shopDelete').hidden=role==='viewer';
 $('shopDelete').disabled=!writable;
}
async function updateShop(record,fields){
 const items=fields.shopping_items;
 await mutate(record,{...fields,done:items.length>0 && items.every(item=>item.done)});
}
async function shopAction(action){
 if(shoppingBusy || role==='viewer' || project!==selectedProject() || identity!==session()?.user?.id)return;
 shoppingBusy=true;
 $('shopMessage').textContent='';
 try{const result=action();renderShopping();await result}
 catch(error){$('shopMessage').textContent=error.message;await load(true)}
 finally{shoppingBusy=false;renderShopping()}
}
$('shopSelect').onchange=e=>chooseList(e.target.value);
$('shopNew').onclick=()=>shopAction(async()=>{
 const p=project;
 const record=await request('rpc/panagei_new_shopping_list','POST',{p_project_id:p});
 if(p!==selectedProject())return;
 rows=[record,...rows.filter(r=>r.id!==record.id)];
 shoppingFilter='';chooseList(record.id);await load(true);
});
$('shopDelete').onclick=()=>{
 const record=shoppingRecord();
 if(record && confirm(shoppingTitle(record)+' mit allen Artikeln löschen?')){
  shopAction(async()=>{
   await removeEntry(record);
   rows=rows.filter(row=>row.id!==record.id);
   shoppingForm.reset();
   await load(true);
  });
 }
};
shoppingForm.elements.article.oninput=e=>{
 const item=knownArticles.get(e.target.value.trim().toLocaleLowerCase('de'));
 if(item)shoppingForm.elements.store.value=item.store;
};
shoppingForm.onsubmit=e=>{
 e.preventDefault();
 const r=shoppingRecord(),fields=shoppingForm.elements,name=fields.article.value.trim(),quantity=Number(fields.quantity.value);
 if(!r||!name||!Number.isSafeInteger(quantity)||quantity<1)return;
 const item={id:crypto.randomUUID(),name,quantity,store:fields.store.value,done:false};
 shopAction(async()=>{await updateShop(r,{shopping_items:[...r.shopping_items,item]});shoppingForm.reset();});
};
const pageNames={dashboard:'Projektübersicht',historie:'Bauhistorie',bauteile:'Raumzentrale',infos:'Dokumente',aufgaben:'Aufgaben',modell:'Hausmodell',kosten:'Kosten',calendar:'Kalender',settings:'Einstellungen',admin:'Administration'};
function showEverydayPage(name){
 if(mode!=='alltag')return;
 everydayPage=['dashboard','aufgaben','calendar','shopping','settings'].includes(name)?name:'dashboard';
 const settingsPage=$('panageiSettingsPage');
 const settingsActive=everydayPage==='settings';
 root.hidden=settingsActive;
 shop.hidden=everydayPage!=='shopping';
 if(shop.hidden){shoppingId='';shoppingFilter='';shoppingForm.reset()}
 if(!shop.hidden)renderShopping();
 settingsPage.hidden=!settingsActive;
 everydayDashboard.hidden=everydayPage!=='dashboard';
 everydayWork.hidden=!['aufgaben','calendar'].includes(everydayPage);
 everydayPlaceholder.hidden=true;
 if(settingsActive)window.panageiRenderSettings?.();
 $('everydayPlaceholderTitle').textContent=pageNames[everydayPage]||'Alltag';
 if(!everydayWork.hidden){
   selectView(everydayPage==='aufgaben'?'task':'event');
   const heading=everydayWork.querySelector('h2');if(heading){heading.textContent=pageNames[everydayPage];heading.classList.add('everyday-page-title')}
   const lead=everydayWork.querySelector('p');if(lead){lead.textContent=everydayPage==='aufgaben'?'Alltagsaufgaben mit Priorität, Frist und Zuständigkeit.':'Deine Alltagstermine und Erinnerungen.';lead.classList.add('everyday-lead')}
 }
 document.querySelectorAll('[data-panagei-tab]').forEach(b=>{const selected=b.dataset.panageiTab===everydayPage;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1});
 if(everydayPage==='dashboard')renderDashboardEveryday();
 window.scrollTo(0,0);
}
tabs.addEventListener('click',event=>{
 if(mode!=='alltag')return;
 const button=event.target.closest('[data-panagei-tab]');if(!button)return;
 event.preventDefault();event.stopImmediatePropagation();showEverydayPage(button.dataset.panageiTab);
},true);
tabs.addEventListener('keydown',event=>{
 if(mode!=='alltag'||!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
 const button=event.target.closest('[data-panagei-tab]');if(!button)return;
 event.preventDefault();event.stopImmediatePropagation();
 const buttons=[...tabs.querySelectorAll('[data-panagei-tab]')].filter(x=>!x.hidden && x.getClientRects().length);
 const i=buttons.indexOf(button);
 const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+buttons.length)%buttons.length;
 buttons[next].focus();showEverydayPage(buttons[next].dataset.panageiTab);
},true);
root.querySelectorAll('[data-everyday-shortcut]').forEach(b=>b.onclick=()=>{showEverydayPage(b.dataset.everydayShortcut);$('everydayFormDisclosure').open=true;$('everydayFormDisclosure').scrollIntoView({behavior:'smooth',block:'start'});});
function setMode(which){
 if(which===mode)return;
 mode=which;const everyday=which==='alltag';
 app.dataset.context=which;
 root.hidden=!everyday;
 tabs.hidden=false;
 const pages=app.querySelectorAll('.panagei-page,#panageiModelPage');
 pages.forEach(p=>{if(everyday&&p!==root)p.hidden=true});
 switcher.querySelectorAll('[data-context]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.context===which)));
 if(!everyday){$('panageiSettingsPage').hidden=true;window.panageiOpenPage?.('dashboard')}else{selectedDate='';showEverydayPage('dashboard');void load(true)}
}
switcher.querySelectorAll('[data-context]').forEach(b=>b.onclick=()=>setMode(b.dataset.context));
function tick(){
 const s=session();const ready=!app.hidden&&!!s?.user?.id&&!!selectedProject();
 switcher.hidden=!ready;
 if(!ready){if(mode==='alltag'){mode='umbau';app.dataset.context='umbau';root.hidden=true;tabs.hidden=false;window.panageiOpenPage?.('dashboard')}project=null;identity=null;rows=[];const header=app.querySelector('header h1');if(header)header.textContent='Digitale Gebäudeakte';return}
 if(mode==='alltag'&&(project!==selectedProject()||identity!==s.user.id||Date.now()-lastRefresh>30000))void load(true);
}
setInterval(tick,1500);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&mode==='alltag')void load(true)});tick();
})();
