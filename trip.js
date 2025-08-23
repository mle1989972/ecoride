const API_BASE = '/api';

function qs(s,el=document){return el.querySelector(s);}
function fmtDateTime(iso){ const d=new Date(iso); return d.toLocaleString('fr-FR', { dateStyle:'medium', timeStyle:'short' }); }
function fmtPrice(cents){ return (cents/100).toLocaleString('fr-FR', { style:'currency', currency:'EUR' }); }
function setYear(){ const el=qs('#year'); if(el) el.textContent=new Date().getFullYear(); }

function getTripId(){
  const u = new URL(window.location.href);
  return u.searchParams.get('id');
}

async function loadTrip(){
  const id = getTripId();
  if (!id){ qs('#trip').innerHTML = '<p class="error">Trajet introuvable (pas d’ID).</p>'; return; }
  const res = await fetch(`${API_BASE}/trips/${id}`, { headers: { 'Accept': 'application/json' } });
  const body = await res.json().catch(()=>({}));
  if (!res.ok){ qs('#trip').innerHTML = `<p class="error">Erreur ${res.status} — ${body?.error || 'chargement du trajet'}</p>`; return; }

  const t = body.data;
  qs('#trip').innerHTML = `
    <h2>${t.origin_city} → ${t.destination_city}</h2>
    <p class="meta">Départ: ${fmtDateTime(t.departure_time)} · Arrivée: ${fmtDateTime(t.arrival_time)}</p>
    <p class="meta">Chauffeur: <b>${t.driver_pseudo}</b> — Note: ★ ${Number(t.driver_avg_rating || 0).toFixed(1)} (${t.driver_reviews || 0})</p>
    <p class="meta">Véhicule: ${t.make || '-'} ${t.model || ''} (${t.energy || '-'}) ${t.color ? '· ' + t.color : ''}</p>
    <p class="meta">Places dispo: ${t.seats_available}/${t.seats_total} · Prix: <b>${fmtPrice(t.price_cents)}</b></p>
    <div class="actions">
      <button id="btn-join" class="btn primary">Participer</button>
      <a class="btn" href="./index.html">Retour</a>
    </div>
  `;

  // Render reviews
  const rv = t.reviews || [];
  const box = qs('#reviews');
  box.innerHTML = '<h3>Avis du conducteur</h3>' + (rv.length ? '' : '<p class="muted">Pas encore d’avis.</p>');
  for (const r of rv){
    const p = document.createElement('p');
    p.innerHTML = `★ ${r.rating} — <b>${r.reviewer_pseudo}</b> : ${r.comment || ''}`;
    box.appendChild(p);
  }

  const btn = qs('#btn-join');
  btn?.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token){
      if (confirm('Vous devez être connecté pour participer. Aller à la page de connexion ?')){
        window.location.href = './login.html';
      }
      return;
    }
    if (!confirm('Confirmez-vous vouloir participer à ce trajet ?')) return;
    if (!confirm('Dernière confirmation : participer va débiter vos crédits si accepté. Continuer ?')) return;

    btn.disabled = true; btn.textContent = 'Envoi…';
    try {
      const res = await fetch(`${API_BASE}/trips/${id}/participations`, {
        method:'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const body = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(body?.error || 'Erreur de participation');
      alert('Demande envoyée ! Statut: ' + (body?.data?.status || 'pending'));
    } catch (err){
      alert(err.message);
    } finally {
      btn.disabled = false; btn.textContent = 'Participer';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  loadTrip();
});
