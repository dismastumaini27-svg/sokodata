/* Home page: Tanzania price map for the latest week, with a crop list beside it.
   Point at (or tap) a region to see all its prices. Reads data/crops.json, meta.json and tz_regions.json. */
"use strict";
(function () {
  const $ = id => document.getElementById(id);
  const L = (sw, en) => `<span class="sw">${sw}</span><span class="en">${en}</span>`;
  const CROPS = [["mahindi", "Mahindi", "Maize"], ["mchele", "Mchele", "Rice"], ["maharage", "Maharage", "Beans"], ["mtama", "Mtama", "Sorghum"], ["uwele", "Uwele", "Bulrush millet"], ["ulezi", "Ulezi", "Finger millet"], ["viazi mviringo", "Viazi mviringo", "Potatoes"]];
  const MON = { sw: ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Des"], en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] };
  const COLORS = ["#f2ead0", "#d6e3ad", "#9fcb88", "#55a473", "#1d6b52"];
  const ZNZ = /Pemba|Unguja|Magharibi/;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = n => n == null ? "–" : Math.round(n).toLocaleString("en-US");
  const day = (d, l) => `${Number(d.slice(8))} ${MON[l][Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`;
  const name = n => n === "Dar-es-salaam" ? "Dar es Salaam" : n;
  const mean = a => a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length / 10) * 10 : null;
  const chg = (a, b) => { if (a == null || !b) return ""; const p = (a - b) / b * 100, c = p > 0.05 ? "up" : p < -0.05 ? "down" : "flat"; return `<span class="chg ${c}">${p > 0.05 ? "▲" : p < -0.05 ? "▼" : "►"} ${Math.abs(p).toFixed(1)}%</span>`; };
  let rows = [], shapes = null, crop = "mahindi";

  function bandsOf(vals) {
    const u = [...new Set(vals)].sort((a, b) => a - b);
    if (u.length <= 5) return u.map(v => [v, v]);
    const v = [...vals].sort((a, b) => a - b), cuts = [];
    for (let i = 1; i < 5; i++) { const c = v[Math.floor(v.length * i / 5)]; if (!cuts.includes(c) && c > v[0]) cuts.push(c); }
    const out = []; let lo = v[0];
    cuts.forEach(c => { out.push([lo, Math.max(...v.filter(x => x < c))]); lo = c; });
    out.push([lo, v[v.length - 1]]);
    return out;
  }

  function list() {
    $("hmCrops").innerHTML = CROPS.map(([k, sw, en]) => {
      const rs = rows.filter(r => r.crop === k);
      const cur = mean(rs.filter(r => r.price != null).map(r => r.price)), prev = mean(rs.filter(r => r.previous != null).map(r => r.previous));
      return `<button type="button" data-k="${k}" aria-pressed="${k === crop}"><span class="n">${L(sw, en)}</span><span class="p">${fmt(cur)} <small>TZS/kg</small></span>${chg(cur, prev)}</button>`;
    }).join("");
    $("hmCrops").querySelectorAll("button").forEach(b => b.addEventListener("click", () => { crop = b.dataset.k; list(); draw(); }));
  }

  function card(region, znz) {
    if (znz) return `<b>${esc(region)}</b><span class="tz">${L("Zanzibar haimo kwenye taarifa ya Wizara ya Kilimo", "Zanzibar is not in the Ministry of Agriculture report")}</span>`;
    const rs = rows.filter(r => r.region === region);
    if (!rs.length) return `<b>${esc(region)}</b><span class="tz">${L("Hakuna bei wiki hii", "No prices this week")}</span>`;
    return `<b>${esc(region)}</b><table class="tt">` + CROPS.map(([k, sw, en]) => {
      const r = rs.find(x => x.crop === k) || {};
      return `<tr class="${k === crop ? "sel" : ""}"><td>${L(sw, en)}</td><td>${fmt(r.price)}</td></tr>`;
    }).join("") + `</table>`;
  }

  function draw() {
    const price = {};
    rows.filter(r => r.crop === crop && r.price != null).forEach(r => { price[r.region] = r.price; });
    const vals = Object.values(price), bands = bandsOf(vals.length ? vals : [0]);
    const pal = bands.length >= 5 ? COLORS : COLORS.filter((c, i) => [[], [4], [1, 4], [0, 2, 4], [0, 1, 3, 4]][bands.length].includes(i));
    const color = v => pal[Math.max(0, bands.findIndex(b => v >= b[0] && v <= b[1]))];
    let s = `<svg viewBox="0 0 ${shapes.W} ${shapes.H}" role="img" aria-label="Tanzania"><defs><pattern id="hmNd" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#eef0f1"/><line x1="0" y1="0" x2="0" y2="6" stroke="#dfe2e5" stroke-width="2"/></pattern></defs><g id="hmRegions">`;
    for (const [raw, d] of Object.entries(shapes.paths)) {
      const n = name(raw), v = price[n];
      s += `<path d="${d}" data-r="${esc(n)}" data-z="${ZNZ.test(raw) ? 1 : 0}" fill="${v != null ? color(v) : "url(#hmNd)"}" class="reg" tabindex="0"><title>${esc(n)}</title></path>`;
    }
    s += `</g><g id="hmLabels" aria-hidden="true"></g></svg>`;
    $("hmSvg").innerHTML = s;
    const lab = $("hmLabels");
    $("hmSvg").querySelectorAll("path.reg").forEach(p => {
      const v = price[p.dataset.r];
      if (v == null) return;
      const b = p.getBBox();
      if (b.width < 22) return;
      const dark = color(v) === COLORS[4] || color(v) === COLORS[3];
      lab.insertAdjacentHTML("beforeend", `<text x="${b.x + b.width / 2}" y="${b.y + b.height / 2 + 4}" text-anchor="middle" class="mlab${dark ? " light" : ""}">${fmt(v)}</text>`);
    });
    $("hmSvg").querySelectorAll("path.reg").forEach(p => {
      p.addEventListener("mousemove", e => tip(e, p));
      p.addEventListener("mouseleave", () => { $("hmTip").hidden = true; });
      p.addEventListener("click", e => tip(e, p));
    });
    $("hmLegend").innerHTML = `<span class="lt">TZS/kg</span>` + bands.map((b, i) => `<span><i style="background:${pal[i]}"></i>${b[0] === b[1] ? fmt(b[0]) : fmt(b[0]) + "–" + fmt(b[1])}</span>`).join("") + `<span><i class="nd"></i>${L("Hakuna bei", "No price")}</span>`;
  }

  function tip(e, p) {
    const t = $("hmTip"), w = $("hmWrap").getBoundingClientRect();
    t.innerHTML = card(p.dataset.r, p.dataset.z === "1");
    t.hidden = false;
    let x = e.clientX - w.left + 14, y = e.clientY - w.top + 14;
    if (x + t.offsetWidth > w.width) x = e.clientX - w.left - t.offsetWidth - 14;
    if (y + t.offsetHeight > w.height) y = Math.max(0, w.height - t.offsetHeight);
    t.style.left = x + "px"; t.style.top = y + "px";
  }

  Promise.all(["data/crops.json", "data/meta.json", "data/tz_regions.json"].map(u => fetch(u, { cache: "no-cache" }).then(r => r.json()))).then(([crops, meta, geo]) => {
    const weeks = meta.crop_weeks || [], last = weeks[weeks.length - 1];
    rows = crops.filter(r => r.week_start === last); shapes = geo;
    const end = (rows[0] || {}).week_end || last;
    $("stats").innerHTML =
      `<div><b>${weeks.length}</b><span>${L("wiki za bei", "weeks of prices")}</span></div>` +
      `<div><b>${new Set(crops.map(r => r.region)).size}</b><span>${L("mikoa", "regions")}</span></div>` +
      `<div><b>${fmt(crops.length)}</b><span>${L("bei zilizohifadhiwa", "prices on record")}</span></div>` +
      `<div><b>7</b><span>${L("mazao makuu", "main crops")}</span></div>`;
    $("latestSub").innerHTML = L(`Bei ya jumla, TZS kwa kilo · ${day(last, "sw")} – ${day(end, "sw")} · Wizara ya Kilimo`, `Wholesale, TZS per kg · ${day(last, "en")} – ${day(end, "en")} · Ministry of Agriculture`);
    list(); draw();
  }).catch(() => { const s = $("hmSection"); if (s) s.hidden = true; });
})();
