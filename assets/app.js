/* SokoData Tanzania website.
   Data comes from data/*.json, built by scripts/build_data.py from the SokoData master CSV files.
   Sections: crops (one week), history (trend over weeks), livestock, sources and news.
   To add a section: add a <section class="view" id="view-NAME"> in index.html, a tab link, a render
   function here, and its name in VIEWS. Text in both languages lives in T below. */
"use strict";

const VIEWS = ["mazao", "historia", "mifugo", "vyanzo"];
const CROP_KEYS = ["mahindi", "mchele", "maharage", "mtama", "uwele", "ulezi", "viazi mviringo"];
const CROP_EN = { mahindi: "Maize", mchele: "Rice", maharage: "Beans", mtama: "Sorghum", uwele: "Bulrush millet", ulezi: "Finger millet", "viazi mviringo": "Potatoes" };
const CROP_SW = { mahindi: "Mahindi", mchele: "Mchele", maharage: "Maharage", mtama: "Mtama", uwele: "Uwele", ulezi: "Ulezi", "viazi mviringo": "Viazi mviringo" };
const ANIMALS = [["Ng'ombe", "Cattle"], ["Mbuzi", "Goats"], ["Kondoo", "Sheep"]];
const MONTHS = { sw: ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Des"], en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] };

const T = {
  sw: {
    tagline: "Bei za mazao na mifugo, zilizo wazi na za kuaminika", proto: "Toleo la majaribio",
    tabCrops: "Mazao", tabHistory: "Historia ya bei", tabLive: "Mifugo", tabSources: "Vyanzo na habari",
    week: "Wiki", unit: "Kipimo", source: "Chanzo", crop: "Zao", region: "Mkoa", allRegions: "Wastani wa mikoa yote",
    unitCrop: "Bei ya jumla, TZS kwa kilo", natTitle: "Wastani wa bei za mikoa",
    natHint: "Wastani wa mikoa yote yenye bei wiki hii. Chagua zao kuona bei kila mkoa.",
    lgThis: "Wiki hii", lgPrev: "Wiki iliyopita", lgNat: "Wastani wa mikoa", lgFlag: "Inahitaji ukaguzi",
    tableTitle: "Bei zote kwa mkoa", tableSub: "TZS kwa kilo · asilimia ni badiliko la wiki",
    chartTitle: c => `Bei ya ${c} kwa mkoa`, chartSub: (n, hi, lo) => `Mikoa ${n} · juu kabisa ${hi} · chini kabisa ${lo}`,
    missing: l => `Hakuna bei wiki hii: ${l}.`, sourceLine: "Taarifa asili (PDF)",
    reviewH: "Bei zinazohitaji ukaguzi", reviewItem: (r, c, p, n, pct) => `${r}, ${c}: ${p} hadi ${n} (${pct}%) ndani ya wiki moja. Huenda ni kosa la uchapaji.`,
    reviewNone: "Hakuna bei iliyobadilika zaidi ya 30% wiki hii.",
    histTitle: "Mwenendo wa bei kwa muda", histChartTitle: (c, r) => `${c}: ${r}`, histSub: n => `Wiki ${n} zenye data · TZS kwa kilo`,
    histFew: "Historia itaonekana hapa wiki zaidi zikikusanywa. Kwa sasa kuna wiki moja tu.",
    unitLive: "TZS kwa mnyama mmoja (bei ya chini na ya juu)", liveTitle: "Bei za mifugo kwenye minada ya upili na mipakani",
    liveChartTitle: a => `Bei ya ${a.toLowerCase()} kwa mnada`, liveSub: "Kila mstari ni bei ya chini hadi ya juu; uzito uko kulia",
    liveNoteH: "Kumbuka", liveNote: "Hizi ni bei za wanyama hai mnadani, si bei ya nyama machinjioni. Uzito unatofautiana sana, kwa hiyo linganisha masoko kwa tahadhari.",
    weight: "Uzito", kg: "kg",
    aboutTitle: "Kuhusu data hii",
    aboutBody: `<p><strong>SokoData</strong> inakusanya bei rasmi za mazao na mifugo za Tanzania, inazisafisha, na kuziweka wazi pamoja na chanzo cha kila bei.</p>
<ul><li><strong>Mazao:</strong> Wizara ya Kilimo, Taarifa ya Wiki ya Mwenendo wa Bei za Mazao: bei za jumla kwa kilo katika soko kuu la kila mkoa.</li>
<li><strong>Mifugo:</strong> Wizara ya Mifugo na Uvuvi: bei za ng'ombe, mbuzi na kondoo kwenye minada ya upili na mipakani.</li>
<li><strong>Magazeti:</strong> bei zilizoripotiwa na magazeti zinahifadhiwa kando kama chanzo cha pili.</li>
<li><strong>Ukaguzi:</strong> bei inayobadilika zaidi ya 30% kwa wiki inawekwa alama ili ikaguliwe.</li>
<li><strong>"–":</strong> wizara haikupata bei. Hatujazi pengo kwa makadirio.</li></ul>
<p>Bei hizi si takwimu rasmi. Kwa matumizi rasmi tumia taarifa ya wizara husika.</p>`,
    coverage: (c, l, n, b) => `Data iliyopo: wiki ${c} za mazao, wiki ${l} za mifugo, takwimu ${n} za magazeti. Imesasishwa ${b}.`,
    newsTitle: "Bei zilizoripotiwa kwenye magazeti", newsSub: "Chanzo cha pili: kila takwimu ina kiungo chake",
    newsEmpty: "Takwimu za magazeti zitaonekana hapa zikikusanywa.",
    nCols: ["Tarehe", "Gazeti", "Bidhaa", "Mahali", "Bei", "Chanzo asili"],
    foot: "SokoData Tanzania · toleo la majaribio · bei kutoka taarifa za wizara, si takwimu rasmi"
  },
  en: {
    tagline: "Crop and livestock prices you can find, compare and trust", proto: "Pilot version",
    tabCrops: "Crops", tabHistory: "Price history", tabLive: "Livestock", tabSources: "Sources and news",
    week: "Week", unit: "Unit", source: "Source", crop: "Crop", region: "Region", allRegions: "Average of all regions",
    unitCrop: "Wholesale price, TZS per kg", natTitle: "Average across regions",
    natHint: "Average of all regions with a price this week. Choose a crop to see every region.",
    lgThis: "This week", lgPrev: "Previous week", lgNat: "Average of regions", lgFlag: "Needs review",
    tableTitle: "All prices by region", tableSub: "TZS per kg · percentage is the weekly change",
    chartTitle: c => `${c} price by region`, chartSub: (n, hi, lo) => `${n} regions · highest ${hi} · lowest ${lo}`,
    missing: l => `No price this week: ${l}.`, sourceLine: "Original report (PDF)",
    reviewH: "Prices that need checking", reviewItem: (r, c, p, n, pct) => `${r}, ${c}: ${p} to ${n} (${pct}%) in one week. Possibly a typing error.`,
    reviewNone: "No price moved more than 30% this week.",
    histTitle: "Price trends over time", histChartTitle: (c, r) => `${c}: ${r}`, histSub: n => `${n} weeks of data · TZS per kg`,
    histFew: "The trend appears here as more weeks are collected. So far there is only one week.",
    unitLive: "TZS per animal (low and high price)", liveTitle: "Livestock prices at secondary and border auctions",
    liveChartTitle: a => `${a} prices by auction market`, liveSub: "Each line runs from the low to the high price; weight is on the right",
    liveNoteH: "Note", liveNote: "These are live animal prices at auctions, not meat prices at abattoirs. Weights vary widely, so compare markets with care.",
    weight: "Weight", kg: "kg",
    aboutTitle: "About this data",
    aboutBody: `<p><strong>SokoData</strong> collects official Tanzanian crop and livestock prices, cleans them, and publishes them openly with the source of every price.</p>
<ul><li><strong>Crops:</strong> Ministry of Agriculture weekly crop price report: wholesale prices per kg at each region's main market.</li>
<li><strong>Livestock:</strong> Ministry of Livestock and Fisheries: cattle, goat and sheep prices at secondary and border auctions.</li>
<li><strong>Newspapers:</strong> prices reported in newspapers are kept separately as a secondary source.</li>
<li><strong>Review:</strong> any price that moves more than 30% in a week is flagged for checking.</li>
<li><strong>"–":</strong> the ministry had no price. We never fill gaps with estimates.</li></ul>
<p>These prices are not official statistics. For official use, refer to the relevant ministry's report.</p>`,
    coverage: (c, l, n, b) => `Data available: ${c} weeks of crop prices, ${l} weeks of livestock prices, ${n} newspaper figures. Updated ${b}.`,
    newsTitle: "Prices reported in newspapers", newsSub: "Secondary source: every figure keeps its link",
    newsEmpty: "Newspaper figures will appear here as they are collected.",
    nCols: ["Date", "Outlet", "Item", "Place", "Price", "Original source"],
    foot: "SokoData Tanzania · pilot version · prices from ministry reports, not official statistics"
  }
};

const S = { lang: "sw", crop: "mahindi", animal: "Ng'ombe", week: null, liveWeek: null, histCrop: "mahindi", histRegion: "" };
let D = { crops: [], livestock: [], news: [], meta: {} };
try { S.lang = localStorage.getItem("sd-lang") || "sw"; } catch (e) { /* storage unavailable */ }

const $ = id => document.getElementById(id);
const fmt = n => n == null ? "–" : n.toLocaleString("en-US");
const cropName = k => S.lang === "sw" ? CROP_SW[k] : CROP_EN[k];
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pct = (a, b) => (a && b) ? Math.round((a - b) / b * 1000) / 10 : null;
const mean = a => a.length ? Math.round(a.reduce((s, v) => s + v, 0) / a.length / 10) * 10 : null;
const weekLabel = (s, e) => { const m = MONTHS[S.lang]; const d = x => `${Number(x.slice(8))} ${m[Number(x.slice(5, 7)) - 1]}`; return `${d(s)} – ${d(e)} ${e.slice(0, 4)}`; };
const chg = p => {
  if (p == null) return "";
  const cls = p > 0 ? "up" : p < 0 ? "down" : "flat", sym = p > 0 ? "▲" : p < 0 ? "▼" : "►";
  return `<span class="chg ${cls}">${sym} ${Math.abs(p).toFixed(1)}%</span>`;
};

function applyText() {
  const t = T[S.lang];
  document.documentElement.lang = S.lang;
  document.querySelectorAll("[data-i18n]").forEach(el => { const v = t[el.dataset.i18n]; if (typeof v === "string") el.textContent = v; });
  document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t[el.dataset.i18nHtml]; });
  $("lang-sw").setAttribute("aria-pressed", S.lang === "sw");
  $("lang-en").setAttribute("aria-pressed", S.lang === "en");
}

function weekRows() { return D.crops.filter(r => r.week_start === S.week); }

function fillWeekSelect(id, weeks, rows, current) {
  const sel = $(id);
  sel.innerHTML = [...weeks].reverse().map(w => {
    const r = rows.find(x => x.week_start === w);
    return `<option value="${w}" ${w === current ? "selected" : ""}>${weekLabel(w, r.week_end)}</option>`;
  }).join("");
}

function renderTiles() {
  const rows = weekRows();
  $("tiles").innerHTML = CROP_KEYS.map(k => {
    const rs = rows.filter(r => r.crop === k);
    const cur = mean(rs.filter(r => r.price != null).map(r => r.price));
    const prev = mean(rs.filter(r => r.previous != null).map(r => r.previous));
    return `<button type="button" class="tile" data-crop="${k}" aria-pressed="${k === S.crop}">
      <span class="name">${cropName(k)}</span><span class="price">${fmt(cur)} <small>TZS/kg</small></span>${chg(pct(cur, prev))}</button>`;
  }).join("");
  $("tiles").querySelectorAll(".tile").forEach(b => b.addEventListener("click", () => { S.crop = b.dataset.crop; renderCrops(); }));
}

function renderReview() {
  const t = T[S.lang], f = weekRows().filter(r => r.flag);
  $("review").innerHTML = `<strong>${t.reviewH}</strong>` + (f.length
    ? f.map(r => `<span>${esc(t.reviewItem(r.region, cropName(r.crop), fmt(r.previous), fmt(r.price), r.change))}</span>`).join("")
    : `<span>${t.reviewNone}</span>`);
}

function renderCropChart() {
  const t = T[S.lang];
  const all = weekRows().filter(r => r.crop === S.crop);
  const rows = all.filter(r => r.price != null).sort((a, b) => b.price - a.price);
  const missing = all.filter(r => r.price == null).map(r => r.region);
  $("chartTitle").textContent = t.chartTitle(cropName(S.crop));
  if (!rows.length) { $("cropChart").innerHTML = `<p class="empty">–</p>`; $("chartSub").textContent = ""; return; }
  const avg = mean(rows.map(r => r.price));
  const max = Math.max(...rows.map(r => Math.max(r.price, r.previous || 0)), avg);
  const step = max > 2000 ? 500 : 250, top = Math.ceil(max * 1.05 / step) * step;
  const W = 720, L = 128, R = 70, rowH = 26, T0 = 34, H = T0 + rows.length * rowH + 12;
  const x = v => L + (v / top) * (W - L - R);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t.chartTitle(cropName(S.crop)))}">`;
  for (let v = 0; v <= top; v += step) s += `<line x1="${x(v)}" x2="${x(v)}" y1="${T0 - 6}" y2="${H - 8}" stroke="var(--line)"/><text x="${x(v)}" y="${T0 - 12}" text-anchor="middle" font-size="11.5" fill="var(--muted)">${fmt(v)}</text>`;
  rows.forEach((r, i) => {
    const y = T0 + i * rowH;
    if (r.flag) s += `<rect x="4" y="${y + 1}" width="${W - 8}" height="${rowH - 2}" rx="4" fill="var(--gold-soft)" stroke="var(--gold)" stroke-width="1.5"/>`;
    s += `<text x="${L - 10}" y="${y + 17}" text-anchor="end" font-size="13" fill="var(--ink)">${esc(r.region)}</text>`;
    s += `<rect x="${L}" y="${y + 6}" width="${Math.max(1, x(r.price) - L)}" height="14" rx="3" fill="var(--accent)"/>`;
    if (r.previous) s += `<line x1="${x(r.previous)}" x2="${x(r.previous)}" y1="${y + 3}" y2="${y + 23}" stroke="var(--ink)" stroke-width="2.5"/>`;
    s += `<text x="${x(Math.max(r.price, r.previous || 0)) + 8}" y="${y + 17}" font-size="12.5" font-weight="600" fill="var(--ink)">${fmt(r.price)}</text>`;
  });
  s += `<line x1="${x(avg)}" x2="${x(avg)}" y1="${T0 - 4}" y2="${H - 8}" stroke="var(--gold)" stroke-width="2" stroke-dasharray="5 4"/></svg>`;
  $("cropChart").innerHTML = s;
  const hi = rows[0], lo = rows[rows.length - 1];
  $("chartSub").textContent = t.chartSub(rows.length, `${hi.region} ${fmt(hi.price)}`, `${lo.region} ${fmt(lo.price)}`);
  $("missing").textContent = missing.length ? t.missing(missing.join(", ")) : "";
}

function renderTable() {
  const t = T[S.lang], rows = weekRows();
  const regions = [...new Set(rows.map(r => r.region))].sort();
  let h = `<thead><tr><th>${t.region}</th>${CROP_KEYS.map(k => `<th class="${k === S.crop ? "sel" : ""}">${cropName(k)}</th>`).join("")}</tr></thead><tbody>`;
  regions.forEach(reg => {
    h += `<tr><td>${esc(reg)}</td>`;
    CROP_KEYS.forEach(k => {
      const r = rows.find(x => x.region === reg && x.crop === k) || {};
      const cls = [k === S.crop ? "sel" : "", r.price == null ? "na" : "", r.flag ? "flag" : ""].join(" ").trim();
      h += `<td class="${cls}">${fmt(r.price)}${r.price != null ? `<small>${chg(r.change)}</small>` : ""}</td>`;
    });
    h += `</tr>`;
  });
  $("cropTable").innerHTML = h + `</tbody>`;
  const url = (D.meta.crop_sources || {})[S.week] || "";
  $("cropSource").innerHTML = url ? `${t.source}: <a href="${esc(url)}" rel="noopener">${t.sourceLine}</a>` : "";
}

function renderCrops() { if (!S.week) return; renderTiles(); renderReview(); renderCropChart(); renderTable(); }

function renderHistory() {
  const t = T[S.lang];
  $("histCrop").innerHTML = CROP_KEYS.map(k => `<option value="${k}" ${k === S.histCrop ? "selected" : ""}>${cropName(k)}</option>`).join("");
  const regions = [...new Set(D.crops.map(r => r.region))].sort();
  $("histRegion").innerHTML = `<option value="">${t.allRegions}</option>` + regions.map(r => `<option value="${esc(r)}" ${r === S.histRegion ? "selected" : ""}>${esc(r)}</option>`).join("");
  const weeks = D.meta.crop_weeks || [];
  const label = S.histRegion || t.allRegions;
  $("histChartTitle").textContent = t.histChartTitle(cropName(S.histCrop), label);
  const pts = weeks.map(w => {
    const rs = D.crops.filter(r => r.week_start === w && r.crop === S.histCrop && r.price != null && (!S.histRegion || r.region === S.histRegion));
    return { w, v: rs.length ? (S.histRegion ? rs[0].price : mean(rs.map(r => r.price))) : null };
  }).filter(p => p.v != null);
  $("histSub").textContent = t.histSub(pts.length);
  if (pts.length < 2) { $("histChart").innerHTML = `<p class="empty">${t.histFew}</p>`; return; }
  const W = 720, H = 300, L = 60, R = 24, T0 = 20, B = 40;
  const t0 = Date.parse(pts[0].w), t1 = Date.parse(pts[pts.length - 1].w);
  const vmax = Math.max(...pts.map(p => p.v)) * 1.1, step = vmax > 2000 ? 500 : 250, top = Math.ceil(vmax / step) * step;
  const x = w => L + (Date.parse(w) - t0) / Math.max(1, t1 - t0) * (W - L - R);
  const y = v => T0 + (1 - v / top) * (H - T0 - B);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc($("histChartTitle").textContent)}">`;
  for (let v = 0; v <= top; v += step) s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11.5" fill="var(--muted)">${fmt(v)}</text>`;
  const ticks = pts.filter((p, i) => i % Math.ceil(pts.length / 8) === 0 || i === pts.length - 1);
  ticks.forEach(p => { s += `<text x="${x(p.w)}" y="${H - 14}" text-anchor="middle" font-size="11.5" fill="var(--muted)">${Number(p.w.slice(8))} ${MONTHS[S.lang][Number(p.w.slice(5, 7)) - 1]} ${p.w.slice(2, 4)}</text>`; });
  const path = pts.map((p, i) => `${i ? "L" : "M"}${x(p.w).toFixed(1)} ${y(p.v).toFixed(1)}`).join("");
  s += `<path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>`;
  pts.forEach(p => { s += `<circle cx="${x(p.w)}" cy="${y(p.v)}" r="3.5" fill="var(--accent)"><title>${p.w}: ${fmt(p.v)} TZS/kg</title></circle>`; });
  const last = pts[pts.length - 1];
  s += `<text x="${x(last.w) - 6}" y="${y(last.v) - 10}" text-anchor="end" font-size="12.5" font-weight="700" fill="var(--ink)">${fmt(last.v)}</text></svg>`;
  $("histChart").innerHTML = s;
}

function renderLive() {
  const t = T[S.lang];
  const chips = $("animalChips");
  chips.innerHTML = ANIMALS.map(([sw, en]) => `<button type="button" data-a="${esc(sw)}" aria-pressed="${sw === S.animal}">${S.lang === "sw" ? sw : en}</button>`).join("");
  chips.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { S.animal = b.dataset.a; renderLive(); }));
  const name = ANIMALS.find(a => a[0] === S.animal)[S.lang === "sw" ? 0 : 1];
  $("liveChartTitle").textContent = t.liveChartTitle(name);
  const rows = D.livestock.filter(r => r.week_start === S.liveWeek && r.animal === S.animal && r.low && r.high).sort((a, b) => (b.low + b.high) - (a.low + a.high));
  if (!rows.length) { $("liveChart").innerHTML = `<p class="empty">–</p>`; return; }
  const max = Math.max(...rows.map(r => r.high)), step = max > 1000000 ? 500000 : 50000, top = Math.ceil(max * 1.02 / step) * step;
  const W = 720, L = 150, R = 150, rowH = 34, T0 = 34, H = T0 + rows.length * rowH + 10;
  const x = v => L + (v / top) * (W - L - R);
  const short = v => v >= 1000000 ? (v / 1000000).toFixed(2).replace(/\.?0+$/, "") + "M" : v ? Math.round(v / 1000) + "k" : "0";
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t.liveChartTitle(name))}">`;
  for (let v = 0; v <= top; v += step) s += `<line x1="${x(v)}" x2="${x(v)}" y1="${T0 - 6}" y2="${H - 8}" stroke="var(--line)"/><text x="${x(v)}" y="${T0 - 12}" text-anchor="middle" font-size="11.5" fill="var(--muted)">${short(v)}</text>`;
  s += `<text x="${W - 12}" y="${T0 - 12}" text-anchor="end" font-size="11.5" font-weight="600" fill="var(--muted)">${t.weight}</text>`;
  rows.forEach((r, i) => {
    const y = T0 + i * rowH + rowH / 2;
    s += `<text x="${L - 12}" y="${y - 2}" text-anchor="end" font-size="13" font-weight="600" fill="var(--ink)">${esc(r.market)}</text><text x="${L - 12}" y="${y + 12}" text-anchor="end" font-size="11.5" fill="var(--muted)">${esc(r.district)}</text>`;
    s += `<line x1="${x(r.low)}" x2="${x(r.high)}" y1="${y}" y2="${y}" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" opacity="0.35"/>`;
    s += `<circle cx="${x(r.low)}" cy="${y}" r="5" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"/><circle cx="${x(r.high)}" cy="${y}" r="5" fill="var(--accent)"/>`;
    s += `<text x="${x(r.high) + 10}" y="${y + 4}" font-size="12" fill="var(--ink)">${short(r.low)} – ${short(r.high)}</text><text x="${W - 12}" y="${y + 4}" text-anchor="end" font-size="12" fill="var(--muted)">${esc(r.weight)} ${t.kg}</text>`;
  });
  $("liveChart").innerHTML = s + `</svg>`;
}

function renderSources() {
  const t = T[S.lang], m = D.meta;
  $("coverage").innerHTML = m.rows ? `<p>${esc(t.coverage((m.crop_weeks || []).length, (m.livestock_weeks || []).length, m.rows.news, m.built))}</p>` : "";
  if (!D.news.length) { $("newsBox").innerHTML = `<p class="empty">${t.newsEmpty}</p>`; return; }
  const rows = [...D.news].sort((a, b) => (b.published_date || "").localeCompare(a.published_date || "")).slice(0, 200);
  $("newsBox").innerHTML = `<table class="news"><thead><tr>${t.nCols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>` +
    rows.map(r => `<tr><td>${esc(r.published_date)}</td><td><a href="${esc(r.url)}" rel="noopener">${esc(r.outlet)}</a></td><td>${esc(r.commodity)}</td><td>${esc(r.region_or_market)}</td><td>${esc(r.figure)} ${esc(r.unit)}</td><td>${esc(r.original_source_named)}</td></tr>`).join("") + `</tbody></table>`;
}

function route() {
  const v = (location.hash || "#mazao").slice(1), view = VIEWS.includes(v) ? v : "mazao";
  document.querySelectorAll("section.view").forEach(s => s.classList.toggle("on", s.id === "view-" + view));
  document.querySelectorAll("nav.tabs a").forEach(a => { if (a.dataset.view === view) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
}

function renderAll() {
  applyText();
  const cw = D.meta.crop_weeks || [], lw = D.meta.livestock_weeks || [];
  if (cw.length) fillWeekSelect("weekSel", cw, D.crops, S.week);
  if (lw.length) fillWeekSelect("liveWeekSel", lw, D.livestock, S.liveWeek);
  renderCrops(); renderHistory(); renderLive(); renderSources(); route();
}

function setLang(l) { S.lang = l; try { localStorage.setItem("sd-lang", l); } catch (e) { /* ignore */ } renderAll(); }

async function load() {
  const get = n => fetch(`data/${n}.json`, { cache: "no-cache" }).then(r => r.ok ? r.json() : null).catch(() => null);
  const [crops, livestock, news, meta] = await Promise.all(["crops", "livestock", "news", "meta"].map(get));
  D = { crops: crops || [], livestock: livestock || [], news: news || [], meta: meta || {} };
  const cw = D.meta.crop_weeks || [], lw = D.meta.livestock_weeks || [];
  S.week = cw[cw.length - 1] || null; S.liveWeek = lw[lw.length - 1] || null;
  renderAll();
}

$("lang-sw").addEventListener("click", () => setLang("sw"));
$("lang-en").addEventListener("click", () => setLang("en"));
$("weekSel").addEventListener("change", e => { S.week = e.target.value; renderCrops(); });
$("liveWeekSel").addEventListener("change", e => { S.liveWeek = e.target.value; renderLive(); });
$("histCrop").addEventListener("change", e => { S.histCrop = e.target.value; renderHistory(); });
$("histRegion").addEventListener("change", e => { S.histRegion = e.target.value; renderHistory(); });
window.addEventListener("hashchange", route);
applyText(); route(); load();
