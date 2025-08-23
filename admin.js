const API = '/api';
function qs(s,el=document){return el.querySelector(s);}
function setYear(){ const y=qs('#year'); if (y) y.textContent=new Date().getFullYear(); }
function token(){ return localStorage.getItem('token'); }
function authHeaders(){ const t=token(); return t? { 'Authorization':'Bearer '+t } : {}; }

async function api(path, options={}){
  const res = await fetch(API + path, { ...options, headers: { 'Accept':'application/json', ...(options.headers||{}) } });
  const body = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(body?.error || ('Erreur API ' + res.status));
  return body;
}

function drawLine(canvas, points){
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const P = points;
  if (!P.length) return;
  const pad = 24;
  const w = canvas.width - pad*2;
  const h = canvas.height - pad*2;
  const maxY = Math.max(1, ...P.map(p => p.y));
  ctx.beginPath();
  for (let i=0; i<P.length; i++){
    const x = pad + (w * i / Math.max(1,(P.length-1)));
    const y = pad + h - (h * (P[i].y / maxY));
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.lineWidth = 2;
  ctx.stroke();
  // axes
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, pad+h);
  ctx.lineTo(pad+w, pad+h);
  ctx.stroke();
}

async function loadStats(){
  try {
    const { data } = await api('/admin/stats', { headers: { ...authHeaders() } });
    const tripsPts = (data.trips || []).map((d,i) => ({ x:i, y:Number(d.trips||0) }));
    const creditsPts = (data.credits || []).map((d,i) => ({ x:i, y:Number(d.credits_gained||0) }));
    drawLine(qs('#chart-trips'), tripsPts);
    drawLine(qs('#chart-credits'), creditsPts);
    qs('#total-credits').textContent = (Number(data.totalCredits||0)).toLocaleString('fr-FR');
  } catch (e){ alert(e.message); }
}

function attachCreateEmployee(){
  qs('#emp-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: qs('#e-email').value.trim(),
        pseudo: qs('#e-pseudo').value.trim(),
        password: qs('#e-pass').value || undefined
      };
      const { data } = await api('/admin/employees', {
        method:'POST',
        headers: { 'Content-Type':'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      qs('#emp-msg').textContent = `Employé créé: ${data.email} (${data.role})`;
      e.target.reset();
    } catch (err){ alert(err.message); }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  attachCreateEmployee();
  loadStats();
});
