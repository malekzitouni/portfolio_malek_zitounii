(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Footer year
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Nav: scrolled state, progress bar, active link
  const nav = $("#nav");
  const progress = $("#progress");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const links = $$("#links a");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  // Mobile menu
  const burger = $("#burger");
  const menu = $("#links");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  links.forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Typewriter
  const phrases = [
    "NLP / LLM Engineer",
    "Tokenizer adaptation for low-resource languages",
    "Fine-tuning LLMs on HPC with DeepSpeed",
    "RAG, agents & multimodal AI",
  ];
  const typed = $("#typed");
  if (reduce) {
    typed.textContent = phrases[0];
  } else {
    let p = 0, i = 0, del = false;
    const tick = () => {
      const full = phrases[p];
      typed.textContent = full.slice(0, i);
      let wait = del ? 28 : 55;
      if (!del && i === full.length) { del = true; wait = 1700; }
      else if (del && i === 0) { del = false; p = (p + 1) % phrases.length; wait = 350; }
      i += del ? -1 : 1;
      setTimeout(tick, wait);
    };
    tick();
  }

  // Tokenizer lab (conceptual illustration)
  const MODES = {
    generic: {
      tokens: ["Na", "ka", " nga", " d", "ef", "?", " Ma", "a", " ngi", " fi", " re", "kk", ",", " j", "ë", "rë", "j", "ëf", "."],
      note: "Words shredded into sub-word fragments → longer sequences, higher cost.",
    },
    adapted: {
      tokens: ["Naka", " nga", " def", "?", " Maa", " ngi", " fi", " rekk", ",", " jërëjëf", "."],
      note: "Frequent Wolof words become single tokens → shorter, cheaper, better modeling.",
    },
  };
  const box = $("#tokens");
  const count = $("#tokCount");
  const note = $("#tokNote");
  const segBtns = $$(".seg button");
  const render = (mode) => {
    const m = MODES[mode];
    box.innerHTML = "";
    m.tokens.forEach((t, idx) => {
      const el = document.createElement("span");
      el.className = `tok c${idx % 4}`;
      el.textContent = t;
      el.style.animationDelay = `${reduce ? 0 : idx * 35}ms`;
      box.appendChild(el);
    });
    count.textContent = m.tokens.length;
    note.textContent = m.note;
    segBtns.forEach((b) => {
      const on = b.dataset.mode === mode;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
    });
  };
  segBtns.forEach((b) => b.addEventListener("click", () => render(b.dataset.mode)));
  render("generic");
  if (!reduce) {
    // Auto-demo: flip once to the adapted vocabulary, unless the visitor interacts first.
    let touched = false;
    segBtns.forEach((b) => b.addEventListener("click", () => (touched = true)));
    setTimeout(() => { if (!touched) render("adapted"); }, 3600);
  }

  // Reveal on scroll
  const revealObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => revealObs.observe(el));

  // Counters
  const countObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = Number(el.dataset.count);
      if (reduce) { el.textContent = target; countObs.unobserve(el); return; }
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min((now - t0) / 1100, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObs.unobserve(el);
    }),
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => countObs.observe(el));

  // Spotlight effect on cards
  $$(".spot").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // BibTeX
  const copyBtn = $("#copyBib");
  const bib = $("#bib");
  if (copyBtn && bib) {
    copyBtn.addEventListener("click", async () => {
      bib.hidden = false;
      try {
        await navigator.clipboard.writeText(bib.textContent);
        copyBtn.textContent = "Copied ✓";
      } catch {
        const range = document.createRange();
        range.selectNodeContents(bib);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        copyBtn.textContent = "Select & copy ↑";
      }
      setTimeout(() => (copyBtn.textContent = "Copy BibTeX"), 2200);
    });
  }
})();
