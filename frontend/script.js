/* ── CONFIG ────────────────────────────────────── */
const API_BASE = '/football-api/index.php';

/* ── DATI SQUADRE ──────────────────────────────── */
const TEAMS = {
  serie_a: ["lazio", "sassuolo", "ac_milan", "napoli", "udinese", "juventus", "as_roma", "sampdoria", "atalanta", "bologna", "fiorentina", "torino", "hellas_verona", "inter", "empoli", "salernitana", "spezia", "cremonese", "lecce", "monza", "cagliari", "genoa", "frosinone", "venezia", "parma", "como"],
  la_liga: ["barcelona", "atletico_madrid", "athletic_club", "valencia", "villarreal", "sevilla", "celta_vigo", "espanyol", "real_madrid", "real_betis", "getafe", "girona", "real_sociedad", "valladolid", "almeria", "cadiz", "osasuna", "rayo_vallecano", "elche", "mallorca", "las_palmas", "alaves", "granada_cf", "leganes"],
  premier_league: ["manchester_united", "newcastle", "bournemouth", "fulham", "wolves", "liverpool", "southampton", "arsenal", "everton", "leicester", "tottenham", "west_ham", "chelsea", "manchester_city", "brighton", "crystal_palace", "brentford", "leeds", "nottingham_forest", "aston_villa", "burnley", "sheffield_utd", "luton", "ipswich"],
  ligue_1: ["angers", "lille", "lyon", "marseille", "montpellier", "nantes", "nice", "paris_saint_germain", "monaco", "reims", "rennes", "strasbourg", "toulouse", "lorient", "ajaccio", "clermont_foot", "stade_brestois_29", "auxerre", "estac_troyes", "lens", "le_havre", "metz", "saint_etienne"],
  bundesliga: ["bayern_munchen", "hertha_bsc", "sc_freiburg", "vfl_wolfsburg", "werder_bremen", "borussia_monchengladbach", "fsv_mainz_05", "borussia_dortmund", "1899_hoffenheim", "bayer_leverkusen", "eintracht_frankfurt", "fc_augsburg", "vfb_stuttgart", "rb_leipzig", "fc_schalke_04", "hamburger_sv", "vfl_bochum", "union_berlin", "1_fc_koln", "fortuna_dusseldorf", "1_fc_heidenheim", "sv_darmstadt_98", "fc_st_pauli", "holstein_kiel", "sv_elversberg"]
};

const LABELS = {
  serie_a: "Serie A", la_liga: "La Liga",
  premier_league: "Premier League", bundesliga: "Bundesliga", ligue_1: "Ligue 1"
};

function labelTeam(slug) {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ── STATE ─────────────────────────────────────── */
let currentView = 'info';

/* ── DOM REFS ──────────────────────────────────── */
const selLeague = document.getElementById('sel-league');
const selTeam = document.getElementById('sel-team');
const selOpponent = document.getElementById('sel-opponent');
const selSeason = document.getElementById('sel-season');
const grpOpponent = document.getElementById('grp-opponent');
const btnGo = document.getElementById('btn-go');
const mainEl = document.getElementById('main');
const navBtns = document.querySelectorAll('.nav-btn');

/* ── NAV ────────────────────────────────────────── */
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    grpOpponent.style.display = currentView === 'head2head' ? 'flex' : 'none';
    document.getElementById('grp-season').style.display = currentView === 'head2head' ? 'none' : 'flex';

    // Se clicco su Preferiti, carica direttamente la lista e nascondi i controlli
    if (currentView === 'favorites') {
      document.getElementById('controls').style.display = 'none';
      renderFavorites();
    } else {
      document.getElementById('controls').style.display = 'flex';
      showWelcome();
    }
  });
});

/* ── LEAGUE → TEAM POPULATION ──────────────────── */
selLeague.addEventListener('change', () => {
  const lg = selLeague.value;
  const teams = TEAMS[lg] || [];

  [selTeam, selOpponent].forEach(sel => {
    sel.innerHTML = '<option value="">- Seleziona squadra -</option>';
    teams.sort().forEach(t => {
      const o = document.createElement('option');
      o.value = t; o.textContent = labelTeam(t);
      sel.appendChild(o);
    });
    sel.disabled = !lg;
  });
});

/* ── GO ─────────────────────────────────────────── */
btnGo.addEventListener('click', () => {
  const lg = selLeague.value;
  const tm = selTeam.value;
  const opp = selOpponent.value;
  const sea = selSeason.value;

  if (!lg || !tm) { flashError('Seleziona lega e squadra.'); return; }
  if (currentView === 'head2head' && !opp) { flashError('Seleziona anche l\'avversario.'); return; }
  if (currentView === 'head2head' && opp === tm) { flashError('Squadra e avversario non possono essere uguali.'); return; }

  fetchView(currentView, lg, tm, opp, sea);
});

/* ── FETCH + RENDER ─────────────────────────────── */
async function fetchView(view, league, team, opponent, season) {
  showLoader();
  try {
    let url = `${API_BASE}?url=${view}&league=${league}&team=${team}&season=${season}`;
    if (view === 'head2head') url += `&opponent=${opponent}`;

    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    if (!res.ok) { showError(data.error || 'Errore sconosciuto'); return; }

    switch (view) {
      case 'info': renderInfo(data, team); break;
      case 'standings': renderStandings(data, team, league); break;
      case 'fixtures': renderFixtures(data, team); break;
      case 'head2head': renderH2H(data, team, opponent); break;
      case 'favorites': renderFavorites(); break;
    }
  } catch (e) {
    showError('Impossibile contattare il server. Controlla la connessione.');
  }
}

/* ── RENDER: INFO ────────────────────────────────── */
async function renderInfo(d, teamSlug) {
  const c = d.club || {};
  const s = d.stadio || {};

  // Controlla se già nei preferiti
  const favRes = await fetch(`${API_BASE}?url=favorites`, { cache: 'no-store' });
  const favList = await favRes.json();
  const lg = selLeague.value;
  const isPreferita = favList.some(p => p.league === lg && p.team === teamSlug);

  mainEl.innerHTML = `
    <div class="fade-in">
      <div class="section-header">
        <span class="section-title">Scheda Squadra</span>
        <span class="section-badge">${c.paese || ''}</span>
        <button id="btn-fav" style="margin-left:auto;background:none;border:1px solid var(--border);
          border-radius:8px;padding:.4rem .9rem;cursor:pointer;font-size:.85rem;
          color:${isPreferita ? 'var(--accent)' : 'var(--muted)'}">
          ${isPreferita ? '★ Preferita' : '☆ Aggiungi ai preferiti'}
        </button>
      </div>
      <div class="info-grid">
        <div class="card">
          <div class="info-card-header">
            ${c.logo ? `<img src="${c.logo}" alt="${c.nome}">` : ''}
            <div>
              <div class="info-card-title">${c.nome || '—'}</div>
              <div class="info-card-sub">Informazioni Club</div>
            </div>
          </div>
          <div class="info-row"><span class="key">Paese</span><span class="val">${c.paese || '—'}</span></div>
          <div class="info-row"><span class="key">Anno Fondazione</span><span class="val">${c.fondazione || '—'}</span></div>
        </div>
        <div class="card">
          <div class="info-card-header">
            <div style="font-size:2.2rem">🏟️</div>
            <div>
              <div class="info-card-title">${s.nome || '—'}</div>
              <div class="info-card-sub">Stadio</div>
            </div>
          </div>
          <div class="info-row"><span class="key">Città</span><span class="val">${s.citta || '—'}</span></div>
          <div class="info-row"><span class="key">Indirizzo</span><span class="val">${s.indirizzo || '—'}</span></div>
          <div class="info-row"><span class="key">Capienza</span><span class="val">${s.capienza ? s.capienza.toLocaleString('it') + ' posti' : '—'}</span></div>
          <div class="info-row"><span class="key">Manto</span><span class="val">${s.manto ? capitalize(s.manto) : '—'}</span></div>
        </div>
      </div>
    </div>`;

  document.getElementById('btn-fav').addEventListener('click', function () {
    toggleFavorite(lg, teamSlug, this);
  });
}

/* ── RENDER: STANDINGS ──────────────────────────── */
function renderStandings(d, teamSlug, league) {
  const rows = d.classifica || [];
  const rowsHtml = rows.map(r => {
    const isHL = r.selezionata;
    const rankClass = r.posizione <= 3 ? 'top3' : (r.posizione >= rows.length - 2 ? 'relegation' : '');
    const formaHtml = (r.forma || []).map(f =>
      `<span class="form-dot form-${f}">${f}</span>`
    ).join('');
    return `
      <tr class="${isHL ? 'highlight' : ''}">
        <td><span class="rank-num ${rankClass}">${r.posizione}</span></td>
        <td><div class="team-cell">
          <img src="${r.logo}" alt="${r.squadra}" loading="lazy">
          <span class="tname">${r.squadra}</span>
          ${isHL ? '<span style="color:var(--primary);font-size:.7rem;margin-left:.3rem">◀</span>' : ''}
        </div></td>
        <td><b>${r.punti}</b></td>
        <td>${r.partite}</td>
        <td style="color:var(--primary)">${r.vittorie}</td>
        <td style="color:var(--accent)">${r.pareggi}</td>
        <td style="color:var(--red)">${r.sconfitte}</td>
        <td>${r.gol_fatti}</td>
        <td>${r.gol_subiti}</td>
        <td>${r.diff_reti > 0 ? '+' : ''}${r.diff_reti}</td>
        <td><div class="form-wrap">${formaHtml}</div></td>
      </tr>`;
  }).join('');

  mainEl.innerHTML = `
    <div class="fade-in">
      <div class="section-header">
        <span class="section-title">Classifica ${LABELS[league]}</span>
        <span class="section-badge">Stagione ${d.stagione}</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th style="text-align:left">Squadra</th>
              <th>Pts</th><th>G</th><th>V</th><th>N</th><th>P</th>
              <th>GF</th><th>GS</th><th>DR</th><th>Forma</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </div>`;
}

/* ── RENDER: FIXTURES ───────────────────────────── */
function renderFixtures(d, teamSlug) {
  const partite = d.partite || [];
  const cards = partite.map(p => {
    const score = p.risultato
      ? `<div class="fix-score">${p.risultato.casa} — ${p.risultato.trasferta}</div>`
      : `<div class="fix-score pending">${p.stato || 'N/D'}</div>`;
    return `
      <div class="fixture-card">
        <div class="fix-meta">
          <div class="round">${p.giornata || ''}</div>
          <div class="date">📅 ${formatDate(p.data)}</div>
          <div class="date" style="margin-top:.15rem">🏟️ ${p.stadio || '—'}</div>
        </div>
        <div class="fix-team home">
          <img src="${p.casa.logo}" alt="${p.casa.squadra}" loading="lazy">
          <span class="tname">${p.casa.squadra}</span>
        </div>
        ${score}
        <div class="fix-team away">
          <img src="${p.trasferta.logo}" alt="${p.trasferta.squadra}" loading="lazy">
          <span class="tname">${p.trasferta.squadra}</span>
        </div>
        <div class="fix-status">${p.stato || ''}</div>
      </div>`;
  }).join('');

  mainEl.innerHTML = `
    <div class="fade-in">
      <div class="section-header">
        <span class="section-title">Partite</span>
        <span class="section-badge">${partite.length} gare · ${d.stagione}</span>
      </div>
      <div class="fixtures-grid">${cards}</div>
    </div>`;
}

/* ── RENDER: HEAD2HEAD ──────────────────────────── */
function renderH2H(d, teamSlug, oppSlug) {
  const { vittorie = 0, pareggi = 0, sconfitte = 0 } = d.riepilogo || {};
  const partite = d.partite || [];

  const cards = partite.map(p => {
    const score = p.risultato
      ? `<div class="fix-score">${p.risultato.casa} — ${p.risultato.trasferta}</div>`
      : `<div class="fix-score pending">${p.stato}</div>`;
    const esitoBadge = p.esito
      ? `<div class="esito-badge esito-${p.esito}">${p.esito}</div>`
      : `<div class="esito-badge" style="opacity:.3">—</div>`;
    return `
      <div class="h2h-match">
        <div class="h2h-date">📅 ${formatDate(p.data)}</div>
        <div class="fix-team home">
          <img src="${p.casa.logo}" alt="${p.casa.squadra}" loading="lazy">
          <span class="tname">${p.casa.squadra}</span>
        </div>
        ${score}
        <div class="fix-team away">
          <img src="${p.trasferta.logo}" alt="${p.trasferta.squadra}" loading="lazy">
          <span class="tname">${p.trasferta.squadra}</span>
        </div>
        ${esitoBadge}
      </div>`;
  }).join('');

  mainEl.innerHTML = `
    <div class="fade-in">
      <div class="section-header">
        <span class="section-title">${labelTeam(teamSlug)} vs ${labelTeam(oppSlug)}</span>
        <span class="section-badge">Stagione ${d.stagione}</span>
      </div>
      <div class="h2h-summary">
        <div class="stat-tile wins">
          <div class="big">${vittorie}</div>
          <div class="label">Vittorie</div>
        </div>
        <div class="stat-tile draws">
          <div class="big">${pareggi}</div>
          <div class="label">Pareggi</div>
        </div>
        <div class="stat-tile losses">
          <div class="big">${sconfitte}</div>
          <div class="label">Sconfitte</div>
        </div>
      </div>
      ${cards}
    </div>`;
}

/* ── HELPERS ────────────────────────────────────── */
function showLoader() {
  mainEl.innerHTML = `<div class="loader"><div class="spinner"></div>Caricamento dati…</div>`;
}
function showError(msg) {
  mainEl.innerHTML = `
    <div class="msg-box fade-in">
      <div class="icon">⚠️</div>
      <h3>Errore</h3>
      <p>${msg}</p>
    </div>`;
}
function showWelcome() {
  mainEl.innerHTML = `
    <div class="welcome fade-in">
      <div class="welcome-icon">⚽</div>
      <h1>Football<span style="color:var(--primary)">Stats</span></h1>
      <p>Seleziona lega, squadra e stagione, poi premi <b>Cerca</b>.</p>
    </div>`;
}
function flashError(msg) {
  const old = btnGo.textContent;
  btnGo.style.background = 'var(--red)';
  btnGo.textContent = msg;
  setTimeout(() => { btnGo.style.background = ''; btnGo.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Cerca`; }, 2200);
}
function formatDate(s) {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

/* ── FAVORITES ──────────────────────────────────── */
async function toggleFavorite(league, team, btn) {
  const favRes = await fetch(`${API_BASE}?url=favorites`, { cache: 'no-store' });
  const favList = await favRes.json();
  const isPreferita = favList.some(p => p.league === league && p.team === team);

  const url = `${API_BASE}?url=favorites${isPreferita ? `&league=${encodeURIComponent(league)}&team=${encodeURIComponent(team)}` : ''}`;
  const options = {
    method: isPreferita ? 'DELETE' : 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  if (!isPreferita) {
    options.body = JSON.stringify({ league, team });
  }

  const res = await fetch(url, options);
  const data = await res.json();

  if (res.ok) {
    const aggiunta = data.azione === 'aggiunta';
    btn.textContent = aggiunta ? '★ Preferita' : '☆ Aggiungi ai preferiti';
    btn.style.color = aggiunta ? 'var(--accent)' : 'var(--muted)';
  } else {
    console.error('Errore:', data.error);
  }
}

async function renderFavorites() {
  showLoader();
  const res = await fetch(`${API_BASE}?url=favorites`, { cache: 'no-store' });
  const list = await res.json();

  if (!list.length) {
    mainEl.innerHTML = `
      <div class="msg-box fade-in">
        <div class="icon">⭐</div>
        <h3>Nessuna squadra preferita</h3>
        <p>Vai sulla scheda di una squadra e clicca "Aggiungi ai preferiti".</p>
      </div>`;
    return;
  }

  const cards = list.map(p => `
    <div class="card" style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-weight:600">${labelTeam(p.team)}</div>
        <div style="font-size:.8rem;color:var(--muted)">${LABELS[p.league]}</div>
      </div>
      <div style="display:flex;gap:.5rem">
        <button onclick="rimuoviPreferito('${p.league}','${p.team}')"
          style="background:transparent;border:1px solid var(--border);border-radius:8px;
                 padding:.4rem 1rem;font-weight:600;cursor:pointer;font-size:.85rem;
                 color:var(--red);transition:all .2s"
          onmouseover="this.style.background='rgba(239,68,68,.1)'"
          onmouseout="this.style.background='transparent'">
          ✕ Rimuovi
        </button>
        <button onclick="caricaSquadra('${p.league}','${p.team}')"
          style="background:var(--primary);border:none;border-radius:8px;
                 padding:.4rem 1rem;font-weight:700;cursor:pointer;font-size:.85rem;color:#000">
          Vai alla scheda →
        </button>
      </div>
    </div>`).join('');

  mainEl.innerHTML = `
    <div class="fade-in">
      <div class="section-header">
        <span class="section-title">Preferiti</span>
        <span class="section-badge">${list.length} squadre</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:.75rem">${cards}</div>
    </div>`;
}

function caricaSquadra(league, team) {
  document.getElementById('controls').style.display = 'flex';

  selLeague.value = league;
  selLeague.dispatchEvent(new Event('change'));
  setTimeout(() => {
    selTeam.value = team;
    navBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-view="info"]').classList.add('active');
    currentView = 'info';
    grpOpponent.style.display = 'none';
    document.getElementById('grp-season').style.display = 'flex';
    fetchView('info', league, team, null, selSeason.value);
  }, 50);
}

async function rimuoviPreferito(league, team) {
  const url = `${API_BASE}?url=favorites&league=${encodeURIComponent(league)}&team=${encodeURIComponent(team)}`;
  const res = await fetch(url, { method: 'DELETE', cache: 'no-store' });

  if (res.ok) {
    renderFavorites();
  } else {
    const data = await res.json();
    console.error('Errore:', data.error);
  }
}