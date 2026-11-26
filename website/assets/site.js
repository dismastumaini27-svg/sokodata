/* Shared site parts: header with navigation and language switch, footer with newsletter, form sending.
   Every page has <div id="site-header"></div> at the top and <div id="site-footer"></div> at the bottom,
   and <body data-page="home|prices|data|about|project">. Text in both languages uses
   <span class="sw">…</span><span class="en">…</span>; the stylesheet hides the other language. */
"use strict";
(function () {
  const CFG = window.SOKO_CONFIG || {};
  const L = (sw, en) => `<span class="sw">${sw}</span><span class="en">${en}</span>`;
  const page = document.body.dataset.page || "";
  const NAV = [
    ["home", "index.html", "Nyumbani", "Home"],
    ["prices", "prices.html", "Bei", "Prices"],
    ["data", "data.html", "Data", "Data"],
    ["about", "about.html", "Kuhusu sisi", "About us"],
    ["project", "project.html", "Mradi", "The project"]
  ];

  let lang = "sw";
  try { lang = localStorage.getItem("sd-lang") || "sw"; } catch (e) { /* storage unavailable */ }
  document.documentElement.lang = lang;

  const head = document.getElementById("site-header");
  if (head) head.outerHTML = `<header class="site-head"><div class="wrap">
    <a class="logo" href="index.html">Soko<span>Data</span><small>Tanzania</small></a>
    <nav class="site-nav" aria-label="Main">${NAV.map(([k, href, sw, en]) => `<a href="${href}"${k === page ? ' aria-current="page"' : ""}>${L(sw, en)}</a>`).join("")}</nav>
    <div class="head-tools"><div class="lang" role="group" aria-label="Language">
      <button id="lang-sw" type="button" aria-pressed="${lang === "sw"}">SW</button><button id="lang-en" type="button" aria-pressed="${lang === "en"}">EN</button>
    </div></div></div></header>`;

  const foot = document.getElementById("site-footer");
  if (foot) foot.outerHTML = `<footer class="site-foot">
    <section class="news-band" id="jarida"><div class="wrap">
      <div><h2>${L("Jiunge na jarida la SokoData", "Join the SokoData newsletter")}</h2>
      <p>${L("Muhtasari wa bei za wiki na data mpya, moja kwa moja kwenye barua pepe yako. Bila malipo, unaweza kujiondoa wakati wowote.", "A short weekly summary of prices and new data, straight to your inbox. Free, and you can leave at any time.")}</p></div>
      <form class="news-form" data-form="newsletter" novalidate>
        <input type="email" name="email" required autocomplete="email" data-ph-sw="Barua pepe yako" data-ph-en="Your email address" aria-label="Email">
        <input type="text" name="company" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="btn" type="submit">${L("Jiunge", "Subscribe")}</button>
        <p class="form-status" role="status"></p>
      </form>
    </div></section>
    <div class="wrap foot-cols">
      <div><a class="logo" href="index.html">Soko<span>Data</span><small>Tanzania</small></a>
        <p style="margin-top:8px">${L("Bei za mazao na mifugo Tanzania, zilizo wazi na zenye vyanzo.", "Tanzanian crop and livestock prices, open and sourced.")}</p></div>
      <div><h4>${L("Tovuti", "Site")}</h4><ul>${NAV.map(([k, href, sw, en]) => `<li><a href="${href}">${L(sw, en)}</a></li>`).join("")}</ul></div>
      <div><h4>Data</h4><ul>
        <li><a href="data.html#pakua">${L("Pakua data", "Download data")}</a></li>
        <li><a href="data.html#ombi">${L("Omba data", "Request data")}</a></li>
        <li><a href="prices.html#vyanzo">${L("Vyanzo", "Sources")}</a></li></ul></div>
      <div><h4>${L("Mradi", "Project")}</h4><ul>
        <li><a href="project.html#ramani">${L("Mpango wa kazi", "Roadmap")}</a></li>
        <li><a href="about.html#mawasiliano">${L("Wasiliana nasi", "Contact us")}</a></li>
        <li><a href="${CFG.repo || "#"}" rel="noopener">GitHub</a></li></ul></div>
    </div>
    <div class="foot-base"><div class="wrap">© ${new Date().getFullYear()} SokoData Tanzania · ${L("Toleo la majaribio. Bei zinatoka kwenye taarifa za wizara; si takwimu rasmi za serikali.", "Pilot version. Prices come from ministry reports; they are not official government statistics.")}</div></div>
  </footer>`;

  function applyPlaceholders() {
    const l = document.documentElement.lang === "en" ? "en" : "sw";
    document.querySelectorAll("[data-ph-sw]").forEach(el => { el.placeholder = el.dataset["ph" + (l === "en" ? "En" : "Sw")]; });
    document.querySelectorAll("option[data-sw]").forEach(o => { o.textContent = o.dataset[l]; });
    const t = document.querySelector("meta[name=title-" + l + "]");
    if (t) document.title = t.content;
    const sw = document.getElementById("lang-sw"), en = document.getElementById("lang-en");
    if (sw) sw.setAttribute("aria-pressed", l === "sw");
    if (en) en.setAttribute("aria-pressed", l === "en");
  }
  window.siteSetLang = function (l) {
    try { localStorage.setItem("sd-lang", l); } catch (e) { /* ignore */ }
    document.documentElement.lang = l;
    document.dispatchEvent(new CustomEvent("sd-lang", { detail: l }));
  };
  // The prices page has its own language handler in app.js (setLang); other pages use this one.
  ["sw", "en"].forEach(l => {
    const b = document.getElementById("lang-" + l);
    if (b) b.addEventListener("click", () => { if (typeof window.setLang !== "function") window.siteSetLang(l); });
  });
  new MutationObserver(applyPlaceholders).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  applyPlaceholders();

  /* Forms: <form data-form="newsletter|request">. Sent to CFG.formEndpoint when set; otherwise an email
     is prepared for CFG.contactEmail. */
  const MSG = {
    sending: ["Inatuma…", "Sending…"],
    ok: { newsletter: ["Asante! Umejiunga na jarida.", "Thank you! You are subscribed."], request: ["Asante! Ombi lako limepokelewa; tutakujibu kwa barua pepe.", "Thank you! Your request has arrived; we will reply by email."] },
    mail: ["Programu yako ya barua pepe imefunguliwa na ujumbe tayari. Bonyeza 'Tuma' kukamilisha.", "Your email app has opened with the message ready. Press Send to finish."],
    bad: ["Tafadhali andika barua pepe sahihi.", "Please enter a valid email address."],
    fail: ["Imeshindikana kutuma. Jaribu tena baadaye.", "Sending failed. Please try again later."],
    off: ["Fomu hii bado inaandaliwa. Tafadhali rudi hivi karibuni.", "This form is still being set up. Please come back soon."]
  };
  const say = (el, m, cls) => { el.className = "form-status" + (cls ? " " + cls : ""); el.innerHTML = L(m[0], m[1]); };
  document.addEventListener("submit", async ev => {
    const f = ev.target.closest("form[data-form]");
    if (!f) return;
    ev.preventDefault();
    const kind = f.dataset.form, st = f.querySelector(".form-status");
    const fd = new FormData(f);
    if (fd.get("company")) return; // filled only by bots
    fd.delete("company");
    const email = String(fd.get("email") || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say(st, MSG.bad, "err"); return; }
    fd.set("form", kind); fd.set("page", location.pathname); fd.set("language", document.documentElement.lang);
    if (CFG.formEndpoint) {
      say(st, MSG.sending);
      try {
        const r = await fetch(CFG.formEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
        if (!r.ok) throw new Error(r.status);
        f.reset(); say(st, MSG.ok[kind] || MSG.ok.request, "ok");
      } catch (e) { say(st, MSG.fail, "err"); }
      return;
    }
    if (CFG.contactEmail) {
      const subject = kind === "newsletter" ? "SokoData: jiunge na jarida / newsletter sign-up" : "SokoData: ombi la data / data request";
      const body = [...fd.entries()].map(([k, v]) => `${k}: ${v}`).join("\n");
      location.href = `mailto:${CFG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      say(st, MSG.mail, "ok");
      return;
    }
    say(st, MSG.off, "err");
  });
})();
