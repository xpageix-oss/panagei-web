
(function(){
const landing=document.getElementById('panageiLanding'),app=document.getElementById('panageiApp'),logo=document.getElementById('panageiLogo'),form=document.getElementById('panageiAuth'),message=document.getElementById('panageiMessage');
function showLogin(){app.hidden=true;landing.hidden=false;landing.classList.add('expanded');form.hidden=false;logo.setAttribute('aria-expanded','true');}
function showLanding(){app.hidden=true;landing.hidden=false;landing.classList.remove('expanded');form.hidden=true;logo.setAttribute('aria-expanded','false');message.textContent='';}
function showApp(){const entering=app.hidden;landing.hidden=true;app.hidden=false;if(entering){window.panageiOpenPage?.(window.panageiPreferences?.start||'dashboard');window.scrollTo(0,0);window.panageiWelcome?.();}window.dispatchEvent(new Event('resize'));}
window.panageiWelcome=()=>{const ctx=window.panageiSettingsContext?.();if(!ctx?.user||!ctx.name)return;try{if(sessionStorage.getItem('panagei-welcome-account')===ctx.user)return;sessionStorage.setItem('panagei-welcome-account',ctx.user)}catch{};document.getElementById('panageiWelcome')?.remove();const welcome=document.createElement('div');welcome.id='panageiWelcome';welcome.setAttribute('role','status');const greeting=document.createElement('strong');greeting.textContent='Hallo '+ctx.name+'!';const subtitle=document.createElement('div');subtitle.textContent='Willkommen in deinem digitalen Hauszwilling.';const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Willkommensnachricht schließen');close.onclick=()=>welcome.remove();welcome.append(greeting,subtitle,close);app.append(welcome);setTimeout(()=>welcome.remove(),5000)};window.panageiGate={showLogin,showLanding,showApp,message:(txt)=>{message.textContent=txt}};
logo.addEventListener('click',()=>{if(form.hidden){showLogin();setTimeout(()=>document.getElementById('panageiEmail').focus(),280)}else document.getElementById('panageiEmail').focus()});
form.addEventListener('submit',e=>{e.preventDefault();runGateAuth('login')});
async function runGateAuth(mode){
 if(!form.reportValidity())return;
 const signIn=document.getElementById('panageiSignIn'),signUp=document.getElementById('panageiSignUp');
 if(typeof window.panageiCloudAuth!=='function'){message.textContent='Anmeldung noch nicht bereit. Bitte Seite neu laden.';return}
 document.getElementById('cloudEmail').value=document.getElementById('panageiEmail').value.trim();
 document.getElementById('cloudPassword').value=document.getElementById('panageiPassword').value;
 signIn.disabled=true;signUp.disabled=true;message.textContent=mode==='signup'?'Registrierung läuft …':'Anmeldung läuft …';
 try{await window.panageiCloudAuth(mode)}catch(e){message.textContent='Fehler: '+e.message}
 finally{signIn.disabled=false;signUp.disabled=false}
}

})();
