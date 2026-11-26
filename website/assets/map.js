/* SokoData price map.
   Draws Tanzania's regions (data/tz_regions.json, simplified from geoBoundaries / Tanzania NBS, CC BY 4.0),
   colours each region by the selected crop's price in the selected week, and shows a tooltip on hover
   and a detail panel on click or tap. Uses the globals from app.js: D, S, T, fmt, esc, cropName, CROP_KEYS, pct. */
"use strict";

Object.assign(T.sw, {
  mapTitle: c => `Ramani ya bei ya ${c}`, mapSub: "Gusa au elekeza kipanya kwenye mkoa kuona bei zake zote",
  mapNoData: "Hakuna bei wiki hii", mapZnz: "Zanzibar haimo kwenye taarifa ya Wizara ya Kilimo (Tanzania Bara)",
  mapLegend: "TZS kwa kilo", mapPick: "Chagua mkoa kwenye ramani", mapAll: "Bei zote za mkoa huu, wiki hii",
  mapTrend: c => `${c}: mwenendo wa wiki zote`, mapRank: (r, n) => `Nafasi ya ${r} kati ya mikoa ${n} (1 = rahisi zaidi)`,
  mapCredit: "Mipaka ya mikoa: NBS Tanzania kupitia geoBoundaries (CC BY 4.0)"
});
Object.assign(T.en, {
  mapTitle: c => `${c} price map`, mapSub: "Tap or point at a region to see all its prices",
  mapNoData: "No price this week", mapZnz: "Zanzibar is not covered by the Ministry of Agriculture report (Mainland only)",
  mapLegend: "TZS per kg", mapPick: "Choose a region on the map", mapAll: "All prices in this region, this week",
  mapTrend: c => `${c}: trend over all weeks`, mapRank: (r, n) => `Ranked ${r} of ${n} regions (1 = cheapest)`,
  mapCredit: "Region boundaries: Tanzania NBS via geoBoundaries (CC BY 4.0)"
});

const MAP = { shapes: null, region: "Dar es Salaam", colors: ["#f2ead0", "#d6e3ad", "#9fcb88", "#55a473", "#1d6b52"] };
const ZNZ = /Pemba|Unguja|Magharibi/;
const mapName = n => n === "Dar-es-salaam" ? "Dar es Salaam" : n;

function classes(vals) {
  // up to 5 colour bands; ties never produce two bands with the same range
  const u = [...new Set(vals)].sort((a, b) => a - b);
  if (u.length <= 5) return u.map(v => [v, v]);
  const v = [...vals].sort((a, b) => a - b), cuts = [];
  for (let i = 1; i < 5; i++) { const c = v[Math.floor(v.length * i / 5)]; if (!cuts.includes(c) && c > v[0]) cuts.push(c); }
  const bands = []; let lo = v[0];
  cuts.forEach(c => { bands.push([lo, Math.max(...v.filter(x => x < c))]); lo = c; });
  bands.push([lo, v[v.length - 1]]);
  return bands;
}

function mapRows() {
  return D.crops.filter(r => r.week_start === S.week);
}

function renderMap() {
  const box = $("mapSvg");
  if (!box || !MAP.shapes || !S.week) return;
  const t = T[S.lang], rows = mapRows();
  const price = {};
  rows.filter(r => r.crop === S.crop && r.price != null).forEach(r => { price[r.region] = r.price; });
  const vals = Object.values(price);
  const bands = classes(vals.length ? vals : [0]);
  const pal = bands.length >= 5 ? MAP.colors : MAP.colors.filter((c, i) => [[], [4], [1, 4], [0, 2, 4], [0, 1, 3, 4]][bands.length].includes(i));
  const color = v => pal[Math.max(0, bands.findIndex(b => v >= b[0] && v <= b[1]))];
  $("mapTitle").textContent = t.mapTitle(cropName(S.crop));
  let s = `<svg viewBox="0 0 ${MAP.shapes.W} ${MAP.shapes.H}" role="img" aria-label="${esc(t.mapTitle(cropName(S.crop)))}"><defs><pattern id="nodata" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="var(--map-empty)"/><line x1="0" y1="0" x2="0" y2="6" stroke="var(--line)" stroke-width="2"/></pattern></defs><g id="mapRegions">`;
  for (const [raw, d] of Object.entries(MAP.shapes.paths)) {
    const name = mapName(raw), v = price[name], znz = ZNZ.test(raw);
    const fill = v != null ? color(v) : "url(#nodata)";
    s += `<path d="${d}" data-r="${esc(name)}" data-z="${znz ? 1 : 0}" fill="${fill}" class="reg${name === MAP.region ? " on" : ""}" tabindex="0"><title>${esc(name)}</title></path>`;
  }
  s += `</g><g id="mapLabels" aria-hidden="true"></g></svg>`;
  box.innerHTML = s;
  // price labels at the centre of each region's largest shape
  const lab = $("mapLabels");
  box.querySelectorAll("path.reg").forEach(p => {
    const name = p.dataset.r, v = price[name];
    if (v == null) return;
    const b = p.getBBox();
    if (b.width < 22) return;
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    const dark = color(v) === MAP.colors[4] || color(v) === MAP.colors[3];
    lab.insertAdjacentHTML("beforeend", `<text x="${x}" y="${y + 4}" text-anchor="middle" class="mlab${dark ? " light" : ""}">${fmt(v)}</text>`);
  });
  // legend
  $("mapLegend").innerHTML = `<span class="lt">${t.mapLegend}</span>` + bands.map((b, i) =>
    `<span class="lg"><i style="background:${pal[i]}"></i>${b[0] === b[1] ? fmt(b[0]) : fmt(b[0]) + "–" + fmt(b[1])}</span>`).join("") +
    `<span class="lg"><i class="nd"></i>${t.mapNoData}</span>`;
  // events
  box.querySelectorAll("path.reg").forEach(p => {
    p.addEventListener("mousemove", e => showTip(e, p));
    p.addEventListener("mouseleave", hideTip);
    p.addEventListener("click", () => { if (matchMedia("(hover: none)").matches) hideTip(); selectRegion(p.dataset.r, p.dataset.z === "1"); });
    p.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectRegion(p.dataset.r, p.dataset.z === "1"); } });
  });
  $("mapCredit").textContent = t.mapCredit;
  renderPanel();
}

function regionCard(name, znz) {
  const t = T[S.lang];
  if (znz) return `<b>${esc(name)}</b><span class="tz">${t.mapZnz}</span>`;
  const rows = mapRows().filter(r => r.region === name);
  if (!rows.length) return `<b>${esc(name)}</b><span class="tz">${t.mapNoData}</span>`;
  return `<b>${esc(name)}</b><table class="tt">` + CROP_KEYS.map(k => {
    const r = rows.find(x => x.crop === k) || {};
    return `<tr class="${k === S.crop ? "sel" : ""}"><td>${cropName(k)}</td><td>${fmt(r.price)}</td><td>${r.price != null ? chg(r.change) : ""}</td></tr>`;
  }).join("") + `</table>`;
}

function showTip(e, p) {
  const tip = $("mapTip"), wrap = $("mapWrap").getBoundingClientRect();
  tip.innerHTML = regionCard(p.dataset.r, p.dataset.z === "1");
  tip.hidden = false;
  let x = e.clientX - wrap.left + 14, y = e.clientY - wrap.top + 14;
  if (x + tip.offsetWidth > wrap.width) x = e.clientX - wrap.left - tip.offsetWidth - 14;
  if (y + tip.offsetHeight > wrap.height) y = Math.max(0, wrap.height - tip.offsetHeight);
  tip.style.left = x + "px"; tip.style.top = y + "px";
}
function hideTip() { $("mapTip").hidden = true; }

function selectRegion(name, znz) {
  MAP.region = name; MAP.znz = znz;
  $("mapSvg").querySelectorAll("path.reg").forEach(p => p.classList.toggle("on", p.dataset.r === name));
  renderPanel();
}

function renderPanel() {
  const t = T[S.lang], panel = $("mapPanel");
  if (!MAP.region) { panel.innerHTML = `<p class="pick">${t.mapPick}</p>`; return; }
  let h = `<div class="pcard">${regionCard(MAP.region, MAP.znz)}</div>`;
  if (!MAP.znz) {
    // rank among regions for the selected crop this week
    const list = mapRows().filter(r => r.crop === S.crop && r.price != null).sort((a, b) => a.price - b.price);
    const i = list.findIndex(r => r.region === MAP.region);
    if (i >= 0) h += `<p class="rank">${t.mapRank(i + 1, list.length)}</p>`;
    // sparkline of the selected crop in this region over all weeks
    const weeks = D.meta.crop_weeks || [];
    const pts = weeks.map(w => (D.crops.find(r => r.week_start === w && r.region === MAP.region && r.crop === S.crop && r.price != null) || {}).price).map((v, k) => ({ w: weeks[k], v })).filter(p => p.v != null);
    if (pts.length > 1) {
      const W = 300, H = 90, L = 34, R = 8, T0 = 10, B = 18;
      const t0 = Date.parse(pts[0].w), t1 = Date.parse(pts[pts.length - 1].w);
      const vmin = Math.min(...pts.map(p => p.v)), vmax = Math.max(...pts.map(p => p.v)), pad = (vmax - vmin) * 0.15 || 50;
      const x = w => L + (Date.parse(w) - t0) / Math.max(1, t1 - t0) * (W - L - R);
      const y = v => T0 + (1 - (v - vmin + pad) / (vmax - vmin + 2 * pad)) * (H - T0 - B);
      const path = pts.map((p, k) => `${k && Date.parse(p.w) - Date.parse(pts[k - 1].w) <= 35 * 864e5 ? "L" : "M"}${x(p.w).toFixed(1)} ${y(p.v).toFixed(1)}`).join("");
      const last = pts[pts.length - 1];
      h += `<h4>${t.mapTrend(cropName(S.crop))}</h4><svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t.mapTrend(cropName(S.crop)))}">
        <text x="${L - 6}" y="${y(vmax) + 4}" text-anchor="end">${fmt(vmax)}</text><text x="${L - 6}" y="${y(vmin) + 4}" text-anchor="end">${fmt(vmin)}</text>
        <line x1="${L}" x2="${W - R}" y1="${y(vmax)}" y2="${y(vmax)}" class="g"/><line x1="${L}" x2="${W - R}" y1="${y(vmin)}" y2="${y(vmin)}" class="g"/>
        <path d="${path}" class="ln"/>${pts.map(p => `<circle cx="${x(p.w)}" cy="${y(p.v)}" r="2.2" class="pt"/>`).join("")}
        <text x="${L}" y="${H - 3}">${pts[0].w.slice(0, 7)}</text><text x="${W - R}" y="${H - 3}" text-anchor="end">${last.w.slice(0, 7)}</text></svg>`;
    }
  }
  panel.innerHTML = h;
}

(async function initMap() {
  try {
    MAP.shapes = await fetch("data/tz_regions.json").then(r => r.json());
  } catch (e) { const s = $("mapSection"); if (s) s.hidden = true; return; }
  const _rc = renderCrops;
  renderCrops = function () { _rc(); renderMap(); };
  if (S.week) renderMap();
})();
