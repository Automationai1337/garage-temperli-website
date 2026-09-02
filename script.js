const menu=document.querySelector('.menu');
const nav=document.querySelector('.nav nav');
if(menu&&nav){menu.addEventListener('click',()=>nav.classList.toggle('open'));nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')))}

const fab=document.querySelector('.chat-fab');
const chat=document.querySelector('.chat');
const close=document.querySelector('.chat-close');
const form=document.querySelector('.chat-form');
const input=form?.querySelector('input');
const messages=document.querySelector('.messages');
const chips=document.querySelectorAll('.chips button');
const state={
  conversationId:sessionStorage.getItem('temperliConversationId')||('c-'+Date.now()+'-'+Math.random().toString(36).slice(2)),
  visitorId:localStorage.getItem('temperliVisitorId')||('v-'+Date.now()+'-'+Math.random().toString(36).slice(2)),
  history:[],
  sending:false
};
sessionStorage.setItem('temperliConversationId',state.conversationId);
localStorage.setItem('temperliVisitorId',state.visitorId);

if(fab&&chat)fab.addEventListener('click',()=>{chat.classList.add('open');input?.focus()});
if(close&&chat)close.addEventListener('click',()=>chat.classList.remove('open'));

function add(text,user=false,status=false){
  if(!messages)return null;
  const d=document.createElement('div');
  d.className='bubble '+(user?'user':'bot')+(status?' status':'');
  d.textContent=text;
  messages.appendChild(d);
  messages.scrollTop=messages.scrollHeight;
  return d;
}
function setBusy(busy){
  state.sending=busy;
  if(input)input.disabled=busy;
  const button=form?.querySelector('button');
  if(button)button.disabled=busy;
  chips.forEach(button=>button.disabled=busy);
}
async function sendMessage(raw){
  const message=String(raw||'').trim().slice(0,2000);
  if(!message||state.sending)return;
  add(message,true);
  state.history.push({sender:'user',text:message});
  if(input)input.value='';
  setBusy(true);
  const waiting=add('Einen Moment bitte …',false,true);
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),25000);
    const response=await fetch('chat-proxy.php',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        message,
        conversationId:state.conversationId,
        visitorId:state.visitorId,
        messageId:(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random()),
        history:state.history.slice(-20)
      }),
      signal:controller.signal
    });
    clearTimeout(timeout);
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result.reply)throw new Error(result.error||'CHAT_FAILED');
    waiting?.remove();
    add(result.reply);
    state.history.push({sender:'assistant',text:result.reply});
    if(result.conversationId){
      state.conversationId=result.conversationId;
      sessionStorage.setItem('temperliConversationId',state.conversationId);
    }
    if(result.escalate)add('Ihre Anfrage wurde an das Garage-Temperli-Team weitergeleitet.',false,true);
  }catch(error){
    waiting?.remove();
    add('Der Assistent ist gerade nicht erreichbar. Rufen Sie uns bitte unter 044 725 43 82 an oder schreiben Sie an info@garagetemperli.ch.');
  }finally{setBusy(false);input?.focus()}
}
if(form&&input)form.addEventListener('submit',event=>{event.preventDefault();sendMessage(input.value)});
chips.forEach(button=>button.addEventListener('click',()=>sendMessage(button.textContent)));
