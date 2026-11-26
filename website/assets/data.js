/* Data page: shows what data is held (counts from data/*.json) and the citation line.
   Data itself is sent on request through the form (see site.js and config.js). */
"use strict";
(function () {
  const $ = id => document.getElementById(id);
  const L = (sw, en) => `<span class="sw">${sw}</span><span class="en">${en}</span>`;
  const MON = { sw: ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Des"], en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] };
  const lang = () => document.documentElement.lang === "en" ? "en" : "sw";
  const day = (d, l) => `${Number(d.slice(8))} ${MON[l][Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`;
  const fmt = n => Number(n).toLocaleString("en-US");
  const today = () => new Date().toISOString().slice(0, 10);
  let D = null;
  function render() {
    const w = D.meta.crop_weeks || [];
    if (w.length) $("nCrops").innerHTML = L(`Bei ${fmt(D.crops.length)} za jumla · mazao 7 · mikoa 26 · wiki ${w.length}, ${day(w[0], "sw")} hadi ${day(w[w.length - 1], "sw")} · Wizara ya Kilimo`, `${fmt(D.crops.length)} wholesale prices · 7 crops · 26 regions · ${w.length} weeks, ${day(w[0], "en")} to ${day(w[w.length - 1], "en")} · Ministry of Agriculture`);
    $("nLive").innerHTML = L(`Bei ${fmt(D.livestock.length)} za minada ya ng'ombe, mbuzi na kondoo · Wizara ya Mifugo na Uvuvi`, `${fmt(D.livestock.length)} auction prices for cattle, goats and sheep · Ministry of Livestock and Fisheries`);
    $("nNews").innerHTML = L(`Takwimu ${fmt(D.news.length)} za bei kutoka The Citizen, Daily News, The Guardian na mengine`, `${fmt(D.news.length)} price figures from The Citizen, Daily News, The Guardian and others`);
    $("cite").textContent = `SokoData Tanzania (${new Date().getFullYear()}). ${lang() === "en" ? "Weekly wholesale crop prices by region, compiled from Ministry of Agriculture reports" : "Bei za jumla za mazao kwa mkoa kila wiki, kutoka taarifa za Wizara ya Kilimo"}. https://dismastumaini27-svg.github.io/sokodata/ (${lang() === "en" ? "accessed" : "imepatikana"} ${today()}).`;
  }
  Promise.all(["crops", "livestock", "news", "meta"].map(n => fetch(`data/${n}.json`, { cache: "no-cache" }).then(r => r.ok ? r.json() : []).catch(() => []))).then(([crops, livestock, news, meta]) => {
    D = { crops, livestock, news, meta: meta || {} };
    render();
    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  });
})();
