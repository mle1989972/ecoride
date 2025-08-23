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
function user(){ try{ return JSON.parse(localStorage.getItem('user')||'null'); }catch{ return null; } }
function authHeaders(){ const t=token(); return t? { 'Authorization': 'Bearer ' + t } : {}; }
function fmtPriceEur(e){ return Number(e).toLocaleString('fr-FR', { style:'currency', currency:'EUR' }); }
function setYear(){ const y=qs('#year'); if (y) y.textContent=new Date().getFullYear(); }

async function api(path, options={}){
  const res = await fetch(API + path, {
    ...options,
    headers: { 'Accept': 'application/json', ...(options.headers||{}) }
  });
  const body = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(body?.error || ('Erreur API ' + res.status));
  return body;
}

function requireLogin(){
  if (!token()){
    alert('Connectez-vous d’abord.');
    window.location.href = './login.html';
    return false;
  }
  return true;
}

async function loadUser(){
  const u = user();
  qs('#user-info').textContent = u ? `${u.pseudo} — rôle: ${u.role}` : 'Non connecté.';
}

async function loadVehicles(){
  if (!requireLogin()) return;
  const box = qs('#vehicles');
  box.textContent = 'Chargement…';
  try {
    const { data } = await api('/vehicles', { headers: { ...authHeaders() } });
    box.innerHTML = '';
    const list = el('div', { class: 'results' });
    data.forEach(v => {
      list.appendChild(el('article', { class: 'trip' }, [
        el('div', {}, [
          el('h3', {}, [ `${v.make} ${v.model}` ]),
          el('div', { class: 'meta' }, [ `${v.energy} · ${v.color || '—'} · ${v.seats} places` ])
        ]),
        el('div', {}, [
          el('button', { class: 'btn', onclick: () => delVehicle(v.id) }, [ 'Supprimer' ])
        ])
      ]));
    });
    box.appendChild(list);

    // hydrate select for trip creation
    const sel = qs('#t-vehicle');
    sel.innerHTML = '<option value="">— Choisir —</option>' + data.map(v => `<option value="${v.id}">${v.make} ${v.model}</option>`).join('');
  } catch (e) {
    box.textContent = e.message;
  }
}

async function delVehicle(id){
  if (!confirm('Supprimer ce véhicule ?')) return;
  try {
    await api('/vehicles/' + id, { method: 'DELETE', headers: { ...authHeaders() } });
    loadVehicles();
  } catch (e) { alert(e.message); }
}

function attachVehicleForm(){
  const f = qs('#vehicle-form');
  f?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = {
        make: qs('#v-make').value.trim(),
        model: qs('#v-model').value.trim(),
        color: qs('#v-color').value.trim() || null,
        energy: qs('#v-energy').value,
        seats: Number(qs('#v-seats').value)
      };
      await api('/vehicles', {
        method:'POST',
        headers: { 'Content-Type':'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      alert('Véhicule ajouté');
      e.target.reset();
      loadVehicles();
    } catch (err){ alert(err.message); }
  });
}

async function loadPrefs(){
  if (!requireLogin()) return;
  try {
    const { data } = await api('/preferences', { headers: { ...authHeaders() } });
    qs('#p-smoke').checked = !!data.smoke_allowed;
    qs('#p-animals').checked = !!data.animals_allowed;
    qs('#p-notes').value = data.notes || '';
  } catch (e){ console.error(e); }
}

function attachPrefsForm(){
  const f = qs('#prefs-form');
  f?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = {
        smoke_allowed: qs('#p-smoke').checked,
        animals_allowed: qs('#p-animals').checked,
        notes: qs('#p-notes').value || null
      };
      await api('/preferences', {
        method:'PUT',
        headers: { 'Content-Type':'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      alert('Préférences enregistrées');
    } catch (err){ alert(err.message); }
  });
}

function toISO(dtLocal){
  const d = new Date(dtLocal);
  return d.toISOString();
}

function attachTripForm(){
  const f = qs('#trip-form');
  f?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!requireLogin()) return;
    try {
      const payload = {
        vehicle_id: qs('#t-vehicle').value,
        origin_city: qs('#t-from').value.trim(),
        destination_city: qs('#t-to').value.trim(),
        departure_time: toISO(qs('#t-depart').value),
        arrival_time: toISO(qs('#t-arrive').value),
        price_cents: Math.round(Number(qs('#t-price').value || 0) * 100),
        seats_total: Number(qs('#t-seats').value)
      };
      const { data } = await api('/trips', {
        method:'POST',
        headers: { 'Content-Type':'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      alert('Trajet créé: ' + data.id);
      loadMyTrips();
  loadPassengerTrips();
    } catch (err){ alert(err.message); }
  });
}

async function loadMyTrips(){
  if (!requireLogin()) return;
  const box = qs('#my-trips');
  box.textContent = 'Chargement…';
  try {
    const u = user();
    const today = new Date();
    const yyyy = today.getFullYear(), mm = String(today.getMonth()+1).padStart(2,'0'), dd = String(today.getDate()).padStart(2,'0');
    const { data } = await api('/trips/mine?upcoming=true&role=driver', { headers: { ...authHeaders() } });
    const mine = data;
    if (mine.length === 0){ box.innerHTML = '<p class="muted">Aucun trajet à venir.</p>'; return; }
    box.innerHTML = '';
    const list = el('div', { class:'results' });
    mine.forEach(t => {
      const a = el('article', { class: 'trip' }, [
        el('div', {}, [
          el('h3', {}, [ `${t.origin_city} → ${t.destination_city}` ]),
          el('div', { class:'meta' }, [ `Départ: ${new Date(t.departure_time).toLocaleString('fr-FR')}` ])
        ]),
        el('div', {}, [
          el('button', { class:'btn', onclick: () => cancelTrip(t.id) }, [ 'Annuler' ]),
          el('a', { class:'btn', href:`./trip.html?id=${t.id}` }, [ 'Détails' ])
        ])
      ]);
      list.appendChild(a);
    });
    box.appendChild(list);
  } catch (e){ box.textContent = e.message; }
}

async function cancelTrip(id){
  if (!confirm('Annuler ce trajet ?')) return;
  try {
    await api(`/trips/${id}/cancel`, { method:'POST', headers: { ...authHeaders() } });
    loadMyTrips();
  loadPassengerTrips();
  } catch (e){ alert(e.message); }
}

function attachLogout(){
  qs('#logout')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  loadUser();
  attachVehicleForm();
  attachPrefsForm();
  attachTripForm();
  attachLogout();
  loadVehicles();
  loadPrefs();
  loadMyTrips();
  loadPassengerTrips();
});

async function loadPassengerTrips(){
  if (!requireLogin()) return;
  const box = qs('#my-trips-passenger');
  if (!box) return;
  box.textContent = 'Chargement…';
  try {
    const { data } = await api('/trips/mine?upcoming=true&role=passenger', { headers: { ...authHeaders() } });
    if (!data.length){ box.innerHTML = '<p class="muted">Aucun trajet à venir en tant que passager.</p>'; return; }
    box.innerHTML = '';
    const list = el('div', { class:'results' });
    data.forEach(t => {
      const a = el('article', { class:'trip' }, [
        el('div', {}, [
          el('h3', {}, [ `${t.origin_city} → ${t.destination_city}` ]),
          el('div', { class:'meta' }, [ `Départ: ${new Date(t.departure_time).toLocaleString('fr-FR')}` ]),
          el('div', { class:'meta' }, [ `Chauffeur: ${t.driver_pseudo}` ])
        ]),
        el('div', {}, [
          el('a', { class:'btn', href:`./trip.html?id=${t.id}` }, [ 'Détails' ])
        ])
      ]);
      list.appendChild(a);
    });
    box.appendChild(list);
  } catch (e){ box.textContent = e.message; }
}
