const menu=document.querySelector('.menu'),nav=document.querySelector('nav');
menu.addEventListener('click',()=>nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

document.querySelector('#contactForm').addEventListener('submit',e=>{e.preventDefault();document.querySelector('.form-note').textContent='Demo: Formular ist bereit für die echte E-Mail-/CRM-Anbindung.'});

const fab=document.querySelector('.chat-fab'),chat=document.querySelector('.chat'),close=document.querySelector('.chat-close');
fab.addEventListener('click',()=>chat.classList.add('open'));close.addEventListener('click',()=>chat.classList.remove('open'));

const msgs=document.querySelector('.messages'),form=document.querySelector('.chat-form'),input=form.querySelector('input');
function add(t,user=false){const d=document.createElement('div');d.className='bubble '+(user?'user':'bot');d.textContent=t;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight}
function answer(q){q=q.toLowerCase();if(q.includes('öff'))return 'Montag bis Freitag: 08:00–12:00 und 13:30–18:00.';if(q.includes('reifen')||q.includes('pneu'))return 'Gerne. Nennen Sie mir Fahrzeugmodell und gewünschte Woche für den Reifenwechsel.';if(q.includes('termin'))return 'Gerne. Nennen Sie Fahrzeug, Anliegen und zwei passende Zeitfenster.';if(q.includes('service'))return 'Für eine Service-Anfrage brauche ich Fahrzeugmodell, Kilometerstand und falls bekannt den letzten Service.';return 'In der Live-Version kann ich mit echtem Temperli-Wissen antworten und Anfragen direkt an die Garage übergeben.'}
form.addEventListener('submit',e=>{e.preventDefault();const q=input.value.trim();if(!q)return;add(q,true);input.value='';setTimeout(()=>add(answer(q)),220)});
document.querySelectorAll('.chips button').forEach(b=>b.addEventListener('click',()=>{add(b.textContent,true);setTimeout(()=>add(answer(b.textContent)),180)}));