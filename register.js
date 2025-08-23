const API_BASE = '/api';
function qs(s,el=document){return el.querySelector(s);}
function setYear(){ const el=qs('#year'); if(el) el.textContent=new Date().getFullYear(); }
setYear();

qs('#register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const pseudo = qs('#pseudo').value.trim();
  const email = qs('#email').value.trim();
  const password = qs('#password').value;
  const msg = qs('#msg');
  msg.textContent = 'Création en cours…';
  try {
    const res = await fetch(API_BASE + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ pseudo, email, password })
    });
    const body = await res.json().catch(()=> ({}));
    if (!res.ok) throw new Error(body?.error || 'Échec de l’inscription');
    msg.textContent = 'Compte créé ! Vous pouvez vous connecter.';
    setTimeout(() => window.location.href = './login.html', 800);
  } catch (err){
    msg.textContent = err.message;
    msg.classList.add('error');
  }
});
