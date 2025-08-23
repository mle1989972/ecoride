const API_BASE = '/api';
function qs(s,el=document){return el.querySelector(s);}
function setYear(){ const el=qs('#year'); if(el) el.textContent=new Date().getFullYear(); }
setYear();

qs('#login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = qs('#email').value.trim();
  const password = qs('#password').value;
  const msg = qs('#msg');
  msg.textContent = 'Connexion en cours…';
  try {
    const res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const body = await res.json().catch(()=> ({}));
    if (!res.ok) throw new Error(body?.error || 'Échec de la connexion');
    localStorage.setItem('token', body.data.token);
    localStorage.setItem('user', JSON.stringify(body.data.user));
    msg.textContent = 'Connecté ! Redirection…';
    setTimeout(() => window.location.href = './index.html', 600);
  } catch (err){
    msg.textContent = err.message;
    msg.classList.add('error');
  }
});
