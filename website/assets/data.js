/* Data page: full-file and filtered downloads, made in the browser from data/*.json. */
"use strict";
(function () {
  const $ = id => document.getElementById(id);
  const L = (sw, en) => `<span class="sw">${sw}</span><span class="en">${en}</span>`;
  const CROPS = [["mahindi", "Mahindi", "Maize"], ["mchele", "Mchele", "Rice"], ["maharage", "Maharage", "Beans"], ["mtama", "Mtama", "Sorghum"], ["uwele", "Uwele", "Bulrush millet"], ["ulezi", "Ulezi", "Finger millet"], ["viazi mviringo", "Viazi mviringo", "Potatoes"]];
  const EN = Object.fromEntries(CROPS.map(c => [c[0], c[2]]));
  const MON = { sw: ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Des"], en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] };
  const lang = () => document.documentElement.lang === "en" ? "en" : "sw";
  const day = d => `${Number(d.slice(8))} ${MON[lang()][Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`;
  const fmt = n => Number(n).toLocaleString("en-US");
  let D = null;

  const cropRows = rows => rows.map(r => ({
    week_start: r.week_start, week_end: r.week_end, region: r.region, crop: r.crop, crop_en: EN[r.crop] || "",
    price_tzs_per_kg: r.price, previous_week_tzs_per_kg: r.previous,
    change_pct: r.change == null ? null : Math.round(r.change * 10) / 10,
    needs_review: !!r.flag, source_url: (D.meta.crop_sources || {})[r.week_start] || ""
  }));
  const liveRows = rows => rows.map(r => ({ ...r, unit: "TZS per animal", source_url: (D.meta.livestock_sources || {})[r.week_start] || "" }));
  const csvCell = v => { if (v == null) return ""; const s = String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const toCSV = rows => { if (!rows.length) return ""; const k = Object.keys(rows[0]); return "﻿" + [k.join(","), ...rows.map(r => k.map(c => csvCell(r[c])).join(","))].join("\r\n") + "\r\n"; };
  function save(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  const today = () => new Date().toISOString().slice(0, 10);
  function download(rows, base, fmtName) {
    if (fmtName === "json") save(`${base}_${today()}.json`, JSON.stringify(rows, null, 1), "application/json");
    else save(`${base}_${today()}.csv`, toCSV(rows), "text/csv;charset=utf-8");
  }

  function selected() {
    const crops = [...document.querySelectorAll("#fCrops input:checked")].map(i => i.value);
    const reg = $("fRegion").value, a = $("fFrom").value, b = $("fTo").value;
    const lo = a < b ? a : b, hi = a < b ? b : a;
    return D.crops.filter(r => crops.includes(r.crop) && (!reg || r.region === reg) && r.week_start >= lo && r.week_start <= hi)
      .sort((x, y) => x.week_start.localeCompare(y.week_start) || x.region.localeCompare(y.region) || x.crop.localeCompare(y.crop));
  }
  function update() {
    const rows = selected(), weeks = new Set(rows.map(r => r.week_start)).size, regs = new Set(rows.map(r => r.region)).size;
    $("fSummary").innerHTML = rows.length
      ? L(`Bei <b>${fmt(rows.length)}</b> · wiki ${weeks} · mikoa ${regs}`, `<b>${fmt(rows.length)}</b> prices · ${weeks} weeks · ${regs} regions`)
      : L("Hakuna bei kwa uchaguzi huu. Badilisha zao, mkoa au kipindi.", "No prices for this choice. Change the crop, region or period.");
    $("fCsv").disabled = $("fJson").disabled = !rows.length;
    const show = cropRows(rows.slice(-8)).reverse();
    $("fPreview").innerHTML = show.length ? `<table><thead><tr><th>${L("Wiki", "Week")}</th><th style="text-align:left">${L("Mkoa", "Region")}</th><th style="text-align:left">${L("Zao", "Crop")}</th><th>TZS/kg</th><th>%</th></tr></thead><tbody>` +
      show.map(r => `<tr><td>${r.week_start}</td><td style="text-align:left">${r.region}</td><td style="text-align:left">${lang() === "en" ? r.crop_en : r.crop}</td><td>${r.price_tzs_per_kg == null ? "–" : fmt(r.price_tzs_per_kg)}</td><td>${r.change_pct == null ? "–" : r.change_pct}</td></tr>`).join("") +
      `</tbody></table><p class="missing">${L("Mfano: bei 8 za karibuni katika uchaguzi wako", "Sample: the 8 most recent prices in your choice")}</p>` : "";
  }
  function weekOptions() {
    const w = D.meta.crop_weeks || [];
    const opt = (x, sel) => `<option value="${x}"${sel ? " selected" : ""}>${day(x)}</option>`;
    const a = $("fFrom").value || w[0], b = $("fTo").value || w[w.length - 1];
    $("fFrom").innerHTML = w.map(x => opt(x, x === a)).join("");
    $("fTo").innerHTML = w.map(x => opt(x, x === b)).join("");
    const r = $("fRegion").value;
    $("fRegion").innerHTML = `<option value="">${lang() === "en" ? "All regions" : "Mikoa yote"}</option>` + [...new Set(D.crops.map(x => x.region))].sort().map(x => `<option${x === r ? " selected" : ""}>${x}</option>`).join("");
  }
  function counts() {
    const w = D.meta.crop_weeks || [];
    $("nCrops").innerHTML = L(`Bei ${fmt(D.crops.length)} · wiki ${w.length} · ${day(w[0])} hadi ${day(w[w.length - 1])} · Wizara ya Kilimo`, `${fmt(D.crops.length)} prices · ${w.length} weeks · ${day(w[0])} to ${day(w[w.length - 1])} · Ministry of Agriculture`);
    $("nLive").innerHTML = L(`Bei ${fmt(D.livestock.length)} za minada · Wizara ya Mifugo na Uvuvi (taarifa ya mwisho Nov 2025)`, `${fmt(D.livestock.length)} auction prices · Ministry of Livestock and Fisheries (last report Nov 2025)`);
    $("nNews").innerHTML = L(`Takwimu ${fmt(D.news.length)} za bei kutoka The Citizen, Daily News, The Guardian na mengine, kila moja na kiungo`, `${fmt(D.news.length)} price figures from The Citizen, Daily News, The Guardian and others, each with its link`);
    $("cite").textContent = `SokoData Tanzania (${new Date().getFullYear()}). ${lang() === "en" ? "Weekly wholesale crop prices by region, compiled from Ministry of Agriculture reports" : "Bei za jumla za mazao kwa mkoa kila wiki, kutoka taarifa za Wizara ya Kilimo"}. https://dismastumaini27-svg.github.io/sokodata/ (${lang() === "en" ? "accessed" : "imepatikana"} ${today()}).`;
  }

  Promise.all(["crops", "livestock", "news", "meta"].map(n => fetch(`data/${n}.json`, { cache: "no-cache" }).then(r => r.ok ? r.json() : []).catch(() => []))).then(([crops, livestock, news, meta]) => {
    D = { crops, livestock, news, meta: meta || {} };
    $("fCrops").innerHTML = CROPS.map(([k, sw, en], i) => `<label><input type="checkbox" value="${k}"${i === 0 ? " checked" : ""}>${L(sw, en)}</label>`).join("");
    weekOptions(); counts(); update();
    ["fRegion", "fFrom", "fTo"].forEach(id => $(id).addEventListener("change", update));
    $("fCrops").addEventListener("change", update);
    $("fCsv").addEventListener("click", () => download(cropRows(selected()), "sokodata_bei_mazao", "csv"));
    $("fJson").addEventListener("click", () => download(cropRows(selected()), "sokodata_bei_mazao", "json"));
    document.querySelectorAll("[data-full]").forEach(b => b.addEventListener("click", () => {
      const k = b.dataset.full, f = b.dataset.fmt || "csv";
      const rows = k === "crops" ? cropRows([...D.crops].sort((x, y) => x.week_start.localeCompare(y.week_start))) : k === "livestock" ? liveRows(D.livestock) : D.news;
      download(rows, { crops: "sokodata_bei_mazao_zote", livestock: "sokodata_bei_mifugo", news: "sokodata_bei_magazetini" }[k], f);
    }));
    new MutationObserver(() => { weekOptions(); counts(); update(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  });
})();
