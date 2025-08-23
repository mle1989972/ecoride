const API = '/api';
function qs(s,el=document){return el.querySelector(s);}
function el(tag, attrs={}, children=[]){
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  });
  children.forEach(c => e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return e;
}
function token(){ return localStorage.getItem('token'); }
function authHeaders(){ const t=token(); return t? { 'Authorization':'Bearer '+t } : {}; }
function setYear(){ const y=qs('#year'); if (y) y.textContent=new Date().getFullYear(); }

async function api(path, options={}){
  const res = await fetch(API + path, { ...options, headers:{ 'Accept':'application/json', ...(options.headers||{}) } });
  const body = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(body?.error || ('Erreur API ' + res.status));
  return body;
}

async function loadIncidents(){
  const status = qs('#f-status').value || '';
  const { data } = await api('/incidents' + (status ? ('?status=' + encodeURIComponent(status)) : ''), { headers: { ...authHeaders() } });
  const box = qs('#incidents'); box.innerHTML = '';
  const list = el('div', { class:'results' });
  data.forEach(i => {
    const item = el('article', { class:'trip' }, [
      el('div', {}, [
        el('h3', {}, [ `${i.origin_city} → ${i.destination_city}` ]),
        el('div', { class:'meta' }, [ `Départ: ${new Date(i.departure_time).toLocaleString('fr-FR')}` ]),
        el('div', { class:'meta' }, [ `Par: ${i.reporter_pseudo} · ${i.summary}` ]),
        el('div', { class:'meta' }, [ `Statut: ${i.status}` ]),
      ]),
      el('div', {}, [
        el('select', { id:`st-${i.id}` }, [
          el('option', { value:'open', ...(i.status==='open'?{selected:''}:{}) }, ['open']),
          el('option', { value:'in_review', ...(i.status==='in_review'?{selected:''}:{}) }, ['in_review']),
          el('option', { value:'closed', ...(i.status==='closed'?{selected:''}:{}) }, ['closed'])
        ]),
        el('button', { class:'btn', onclick: () => updateIncident(i.id) }, ['Modifier'])
      ])
    ]);
    list.appendChild(item);
  });
  box.appendChild(list);
}

async function updateIncident(id){
  const sel = qs('#st-' + id);
  try {
    await api('/incidents/' + id, {
      method:'PATCH',
      headers: { 'Content-Type':'application/json', ...authHeaders() },
      body: JSON.stringify({ status: sel.value })
    });
    alert('Statut mis à jour');
    loadIncidents();
  } catch (e) { alert(e.message); }
}

async function loadPendingReviews(){
  const { data } = await api('/reviews/pending', { headers: { ...authHeaders() } });
  const box = qs('#reviews'); box.innerHTML = '';
  if (data.length === 0){ box.innerHTML = '<p class="muted">Aucun avis à modérer.</p>'; return; }
  const list = el('div', { class:'results' });
  data.forEach(r => {
    const item = el('article', { class:'trip' }, [
      el('div', {}, [
        el('h3', {}, [ `Avis #${r.id.slice(0,8)} — ★ ${r.rating}` ]),
        el('div', { class:'meta' }, [ `Par: ${r.reviewer_pseudo} · À propos de: ${r.driver_pseudo}` ]),
        el('div', { class:'meta' }, [ r.comment || '' ]),
      ]),
      el('div', {}, [
        el('button', { class:'btn', onclick: () => moderate(r.id) }, ['Approuver'])
      ])
    ]);
    list.appendChild(item);
  });
  box.appendChild(list);
}

async function moderate(id){
  try {
    await api('/reviews/' + id + '/moderate', { method:'POST', headers: { ...authHeaders() } });
    loadPendingReviews();
  } catch (e){ alert(e.message); }
}

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  qs('#btn-load')?.addEventListener('click', loadIncidents);
  loadIncidents();
  loadPendingReviews();
});
