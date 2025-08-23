const API_BASE = '/api';

function qs(sel, el=document){ return el.querySelector(sel); }
function qsa(sel, el=document){ return Array.from(el.querySelectorAll(sel)); }

function fmtDateTime(iso){
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}
function fmtPrice(cents){
  return (cents/100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function renderTrips(list){
  const container = qs('#results');
  container.innerHTML = '';
  if (!list || list.length === 0){
    container.innerHTML = '<p class="muted">Aucun trajet pour ces critères.</p>';
    return;
  }
  for (const t of list){
    const el = document.createElement('article');
    el.className = 'trip';
    el.innerHTML = `
      <div>
        <h3>${t.origin_city} → ${t.destination_city}</h3>
        <div class="meta">
          Départ: ${fmtDateTime(t.departure_time)} · Arrivée: ${fmtDateTime(t.arrival_time)}
        </div>
        <div class="meta">
          Chauffeur: <b>${t.driver_pseudo}</b>
          <span class="rating">★ ${Number(t.driver_avg_rating || 0).toFixed(1)} (${t.driver_reviews || 0})</span>
          ${t.is_ecologic ? '<span class="badge eco">éco</span>' : ''}
          <span class="badge">${t.seats_available}/${t.seats_total} places</span>
        </div>
      </div>
      <div style="text-align:right">
        <div class="price">${fmtPrice(t.price_cents)}</div>
        <a class="btn" href="./trip.html?id=${t.id}">Détails</a>
      </div>
    `;
    container.appendChild(el);
  }
}

function renderSuggestion(dateIso){
  const box = qs('#suggestion');
  if (!dateIso){
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }
  const d = new Date(dateIso);
  box.classList.remove('hidden');
  box.innerHTML = `
    <strong>Astuce :</strong> aucun trajet à cette date. Prochaine disponibilité vers le
    <b>${d.toLocaleString('fr-FR', { dateStyle:'full', timeStyle:'short' })}</b>.
  `;
}

async function searchTrips(params){
  const url = new URL(API_BASE + '/trips', window.location.origin);
  Object.entries(params).forEach(([k,v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
  if (!res.ok){
    const txt = await res.text();
    throw new Error('Erreur API ' + res.status + ': ' + txt);
  }
  return res.json();
}

function getFormValues(){
  const from = qs('#from').value.trim();
  const to = qs('#to').value.trim();
  const date = qs('#date').value; // yyyy-mm-dd
  const eco = qs('#eco').checked ? 'true' : undefined;
  const priceMax = qs('#priceMax').value;
  const durationMax = qs('#durationMax').value;
  const ratingMin = qs('#ratingMin').value;
  return { from, to, date, eco, priceMax, durationMax, ratingMin, limit: 20, offset: 0 };
}

function setYear(){
  const y = new Date().getFullYear();
  const el = qs('#year');
  if (el) el.textContent = y;
}

function setTodayDefault(){
  const el = qs('#date');
  if (!el) return;
  if (!el.value){
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const dd = String(now.getDate()).padStart(2,'0');
    el.value = `${yyyy}-${mm}-${dd}`;
  }
}

function attachForm(){
  const form = qs('#search-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const results = qs('#results');
    results.innerHTML = '<p class="muted">Recherche en cours…</p>';
    try {
      const params = getFormValues();
      const { data, nextAvailableDate } = await searchTrips(params);
      renderTrips(data);
      renderSuggestion(nextAvailableDate);
    } catch (err){
      console.error(err);
      results.innerHTML = `<p class="error">Une erreur est survenue : ${err.message}</p>`;
    }
  });

  form?.addEventListener('reset', () => {
    qs('#results').innerHTML = '';
    renderSuggestion(null);
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  setYear();
  setTodayDefault();
  attachForm();
});
