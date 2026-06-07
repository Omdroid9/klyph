import "./styles.css";
import { injectLogos } from "./logos.js";

injectLogos();

const prefersReduced =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Scroll progress bar ---------- */
const progress = document.querySelector(".scroll-progress");
if (progress) {
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = `scaleX(${ratio})`;
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
}

/* ---------- Nav background on scroll ---------- */
const nav = document.querySelector(".site-nav");
window.addEventListener(
  "scroll",
  () => {
    if (!nav) return;
    if (window.scrollY > 24) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
    }
  },
  { passive: true },
);

/* ---------- Scroll reveal ---------- */
const revealElements = document.querySelectorAll("[data-reveal]");
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
);
revealElements.forEach((el) => revealObserver.observe(el));

/* ---------- Staggered child reveals ---------- */
const staggerContainers = document.querySelectorAll("[data-stagger]");
const staggerObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const children = entry.target.children;
        Array.from(children).forEach((child, i) => {
          child.style.animationDelay = `${i * 90}ms`;
          child.classList.add("stagger-in");
        });
        staggerObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.2 },
);
staggerContainers.forEach((el) => staggerObserver.observe(el));

/* ---------- Hero word stagger on load ---------- */
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".hero-title .word").forEach((word, i) => {
    word.style.animationDelay = `${i * 120 + 100}ms`;
    word.classList.add("word-in");
  });
});

/* ---------- Typewriter in hero capture mockup ---------- */
// Each phrase carries the time pill that should appear with it.
// `time: null` hides the pill cleanly.
const TYPE_PHRASES = [
  { text: "Call design team tomorrow at 3pm about launch assets", time: "Tomorrow · 3:00 PM" },
  { text: "Ship beta build to testers Friday 5pm",                time: "Friday · 5:00 PM" },
  { text: "Idea: keyboard shortcut for quick tag swap",            time: null },
  { text: "Standup notes — orb polish, onboarding fix",            time: "Tomorrow · 9:30 AM" },
  { text: "Email Sarah about Q3 roadmap next Monday 10am",         time: "Mon · 10:00 AM" },
];

function runTypewriter() {
  const root = document.querySelector("[data-typewriter] .typewriter-text");
  const timeEl = document.querySelector(".mock-capture-hero .mock-time");

  const setTime = (label) => {
    if (!timeEl) return;
    if (!label) {
      timeEl.classList.add("is-changing");
      setTimeout(() => {
        timeEl.classList.add("is-hidden");
        timeEl.textContent = "";
        timeEl.classList.remove("is-changing");
      }, 200);
      return;
    }
    timeEl.classList.add("is-changing");
    setTimeout(() => {
      timeEl.classList.remove("is-hidden");
      timeEl.textContent = label;
      timeEl.classList.remove("is-changing");
    }, 200);
  };

  if (!root || prefersReduced) {
    if (root) root.textContent = TYPE_PHRASES[0].text;
    if (timeEl) timeEl.textContent = TYPE_PHRASES[0].time || "";
    if (timeEl && !TYPE_PHRASES[0].time) timeEl.classList.add("is-hidden");
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;
  setTime(TYPE_PHRASES[0].time);

  const tick = () => {
    const phrase = TYPE_PHRASES[phraseIndex];
    if (!deleting) {
      charIndex++;
      root.textContent = phrase.text.slice(0, charIndex);
      if (charIndex >= phrase.text.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
      setTimeout(tick, 40 + Math.random() * 50);
    } else {
      charIndex--;
      root.textContent = phrase.text.slice(0, charIndex);
      // halfway through deletion, swap the time pill so it lands with the next phrase
      if (charIndex === Math.floor(phrase.text.length / 2)) {
        const nextIdx = (phraseIndex + 1) % TYPE_PHRASES.length;
        setTime(TYPE_PHRASES[nextIdx].time);
      }
      if (charIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % TYPE_PHRASES.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, 18);
    }
  };

  setTimeout(tick, 900);
}
runTypewriter();

/* ---------- Magnetic buttons ---------- */
if (!prefersReduced) {
  document.querySelectorAll(".magnetic").forEach((btn) => {
    const strength = 12;
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * strength;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * strength;
      btn.style.transform = `translate(${x}px, ${y}px)`;
      const inner = btn.querySelector("span");
      if (inner) inner.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
      const inner = btn.querySelector("span");
      if (inner) inner.style.transform = "";
    });
  });
}

/* ---------- Mouse tilt on product mockups ---------- */
if (!prefersReduced) {
  document.querySelectorAll(".tilt").forEach((card) => {
    const max = 8;
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -max;
      const ry = ((e.clientX - rect.left) / rect.width - 0.5) * max;
      card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* ---------- Animated counter ---------- */
const counters = document.querySelectorAll("[data-counter]");
const counterObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      const target = parseInt(el.dataset.counter || "0", 10);
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      counterObserver.unobserve(el);
    }
  },
  { threshold: 0.5 },
);
counters.forEach((el) => counterObserver.observe(el));

/* ---------- Hotkey press + ripple chip animation ---------- */
const hotkeyKeys = document.getElementById("hotkey-keys");
const hotkeyObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const kbds = entry.target.querySelectorAll("kbd");
      kbds.forEach((k, i) => {
        setTimeout(() => {
          k.classList.add("is-pressed");
          setTimeout(() => k.classList.remove("is-pressed"), 260);
        }, i * 220);
      });
      // loop the animation while in view
      const loop = setInterval(() => {
        kbds.forEach((k, i) => {
          setTimeout(() => {
            k.classList.add("is-pressed");
            setTimeout(() => k.classList.remove("is-pressed"), 260);
          }, i * 220);
        });
      }, 3200);
      entry.target.dataset.loop = String(loop);
    }
  },
  { threshold: 0.4 },
);
if (hotkeyKeys) hotkeyObserver.observe(hotkeyKeys);

/* ---------- Chip ripple (sequential glow) on capture mockup ---------- */
const rippleContainers = document.querySelectorAll("[data-ripple-chips]");
const rippleObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const chips = entry.target.querySelectorAll(".mock-chip-on");
      const run = () => {
        chips.forEach((chip, i) => {
          setTimeout(() => {
            chip.classList.add("is-pulse");
            setTimeout(() => chip.classList.remove("is-pulse"), 700);
          }, i * 220);
        });
      };
      run();
      setInterval(run, 3800);
    }
  },
  { threshold: 0.4 },
);
rippleContainers.forEach((el) => rippleObserver.observe(el));

/* ---------- Integrations slider ---------- */
const slider = document.querySelector("[data-slider]");
const sliderCaption = document.querySelector("[data-slider-caption]");
const sliderProgress = document.querySelector("[data-slider-progress]");

if (slider && sliderCaption) {
  const cards = Array.from(slider.querySelectorAll(".logo-card"));
  const ROTATE_MS = 3800;
  let active = 0;
  let timer = null;

  const centerActive = () => {
    if (slider.scrollWidth <= slider.clientWidth) return;
    const card = cards[active];
    const cardRect = card.getBoundingClientRect();
    const sliderRect = slider.getBoundingClientRect();
    const delta =
      cardRect.left + cardRect.width / 2 - (sliderRect.left + sliderRect.width / 2);
    slider.scrollBy({ left: delta, behavior: "smooth" });
  };

  const restartProgress = () => {
    if (!sliderProgress || prefersReduced) return;
    sliderProgress.classList.remove("is-running");
    // force reflow so the animation restarts cleanly
    void sliderProgress.offsetWidth;
    sliderProgress.classList.add("is-running");
  };

  const setActive = (idx, { force = false } = {}) => {
    const next = ((idx % cards.length) + cards.length) % cards.length;
    if (next === active && !force) return;
    active = next;
    cards.forEach((c, i) => {
      const on = i === active;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-selected", on ? "true" : "false");
      c.tabIndex = on ? 0 : -1;
    });
    const nextLabel = cards[active].dataset.label || "";
    sliderCaption.classList.add("is-changing");
    setTimeout(() => {
      sliderCaption.textContent = nextLabel;
      sliderCaption.classList.remove("is-changing");
    }, 220);
    centerActive();
    restartProgress();
  };

  const stopAuto = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };
  const startAuto = () => {
    stopAuto();
    if (prefersReduced) return;
    restartProgress();
    timer = setInterval(() => setActive(active + 1), ROTATE_MS);
  };

  cards.forEach((card, i) => {
    card.addEventListener("click", () => {
      setActive(i);
      startAuto();
    });
    card.addEventListener("focus", () => setActive(i));
  });

  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive(active + 1);
      cards[active].focus();
      startAuto();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive(active - 1);
      cards[active].focus();
      startAuto();
    }
  });

  slider.addEventListener("mouseenter", stopAuto);
  slider.addEventListener("mouseleave", startAuto);

  setActive(0, { force: true });

  // only auto-play once the slider is visible
  const sliderObs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) startAuto();
        else stopAuto();
      }
    },
    { threshold: 0.3 },
  );
  sliderObs.observe(slider);
}

/* ---------- Hero "Sent to ___" toast cycle ---------- */
const heroToast = document.querySelector("[data-hero-toast]");
if (heroToast) {
  const targets = [
    { name: "Slack", color: "#36C5F0" },
    { name: "Notion", color: "#ffffff" },
    { name: "Google Calendar", color: "#4285F4" },
    { name: "Discord", color: "#5865F2" },
  ];
  let i = 0;
  const text = heroToast.querySelector(".hero-toast-text");
  const cycle = () => {
    if (prefersReduced) return;
    heroToast.classList.remove("is-in");
    setTimeout(() => {
      const t = targets[i % targets.length];
      if (text) text.innerHTML = `Sent to <strong>${t.name}</strong>`;
      heroToast.style.setProperty("--toast-accent", t.color);
      heroToast.classList.add("is-in");
      i++;
    }, 300);
  };
  setTimeout(cycle, 1800);
  setInterval(cycle, 4200);
}

/* ---------- Smart-routing "Accept" button micro-interaction ---------- */
const smartSuggest = document.querySelector("[data-smart-suggest]");
if (smartSuggest) {
  const btn = smartSuggest.querySelector(".smart-suggest-btn");
  let cycleTimer = null;
  const acceptAnim = () => {
    if (!btn || prefersReduced) return;
    btn.classList.add("is-accepting");
    setTimeout(() => btn.classList.remove("is-accepting"), 1400);
  };
  const observe = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          acceptAnim();
          cycleTimer = setInterval(acceptAnim, 4000);
        } else if (cycleTimer) {
          clearInterval(cycleTimer);
          cycleTimer = null;
        }
      }
    },
    { threshold: 0.4 },
  );
  observe.observe(smartSuggest);
}

/* ---------- History search type-and-filter ---------- */
const historySearch = document.querySelector("[data-history-search]");
if (historySearch) {
  const input = historySearch.querySelector("[data-search-input]");
  const count = historySearch.querySelector("[data-search-count]");
  const rows = historySearch.parentElement.querySelectorAll("[data-row]");
  const QUERY = "friday";

  const run = () => {
    if (prefersReduced) {
      if (input) input.textContent = QUERY;
      rows.forEach((row) => {
        const match = row.textContent.toLowerCase().includes(QUERY);
        row.classList.toggle("is-dimmed", !match);
        row.classList.toggle("is-match", match);
      });
      if (count) count.textContent = "1 result";
      return;
    }

    // Type the query
    if (input) input.textContent = "";
    rows.forEach((r) => r.classList.remove("is-dimmed", "is-match"));
    if (count) count.textContent = `${rows.length} results`;

    let ci = 0;
    const typeStep = () => {
      if (!input) return;
      ci++;
      input.textContent = QUERY.slice(0, ci);
      if (ci < QUERY.length) {
        setTimeout(typeStep, 110);
      } else {
        // After typing, filter
        setTimeout(() => {
          let matches = 0;
          rows.forEach((row) => {
            const match = row.textContent.toLowerCase().includes(QUERY);
            row.classList.toggle("is-dimmed", !match);
            row.classList.toggle("is-match", match);
            if (match) matches++;
          });
          if (count) count.textContent = `${matches} result${matches === 1 ? "" : "s"}`;
        }, 300);
      }
    };
    setTimeout(typeStep, 400);
  };

  const obs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          run();
          obs.unobserve(entry.target);
          // re-loop every 7s
          setInterval(() => {
            rows.forEach((r) => r.classList.remove("is-dimmed", "is-match"));
            if (input) input.textContent = "";
            if (count) count.textContent = `${rows.length} results`;
            setTimeout(run, 800);
          }, 7000);
        }
      }
    },
    { threshold: 0.4 },
  );
  obs.observe(historySearch);
}

/* ---------- Page-load cinematic curtain ---------- */
window.addEventListener("load", () => {
  const curtain = document.querySelector(".page-curtain");
  if (!curtain) return;
  setTimeout(() => curtain.classList.add("is-out"), 600);
  setTimeout(() => curtain.remove(), 1500);
});

/* ---------- Cursor spotlight ---------- */
const spotlight = document.querySelector(".cursor-spotlight");
const hasFinePointer =
  typeof matchMedia === "function" && matchMedia("(pointer: fine)").matches;
if (spotlight && !prefersReduced && hasFinePointer) {
  spotlight.classList.add("is-ready");
  let rafSpot = null;
  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  window.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (rafSpot) return;
      rafSpot = requestAnimationFrame(() => {
        spotlight.style.setProperty("--mx", `${mx}px`);
        spotlight.style.setProperty("--my", `${my}px`);
        rafSpot = null;
      });
    },
    { passive: true },
  );
}

/* ---------- Section heading letter reveal ---------- */
const headings = document.querySelectorAll("main h2");

// Walk a node and wrap each word in <span class="char-word">, preserving
// nested inline elements like <br> and <span class="accent-serif">.
function splitTextNodes(node) {
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.nodeValue;
      if (!text || !text.trim()) continue;
      const frag = document.createDocumentFragment();
      for (const part of text.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement("span");
          span.className = "char-word";
          span.textContent = part;
          frag.appendChild(span);
        }
      }
      child.replaceWith(frag);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      // Recurse into inline children (span, em, strong, etc.) but skip <br>.
      if (child.tagName !== "BR") splitTextNodes(child);
    }
  }
}

headings.forEach((h) => {
  if (h.dataset.split === "true") return;
  h.dataset.split = "true";
  splitTextNodes(h);
});

const charObs = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const words = entry.target.querySelectorAll(".char-word");
      words.forEach((w, i) => {
        w.style.animationDelay = `${i * 70}ms`;
        w.classList.add("is-in");
      });
      charObs.unobserve(entry.target);
    }
  },
  { threshold: 0.25 },
);
headings.forEach((h) => charObs.observe(h));

/* ---------- Scroll-spy active nav ---------- */
const navLinks = document.querySelectorAll(".site-nav nav a");
const spyTargets = [];
navLinks.forEach((link) => {
  const id = (link.getAttribute("href") || "").replace("#", "");
  const section = id ? document.getElementById(id) : null;
  if (section) spyTargets.push({ link, section });
});

if (spyTargets.length) {
  const spyObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const item = spyTargets.find((t) => t.section === entry.target);
        if (!item) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("is-active"));
          item.link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
  );
  spyTargets.forEach((t) => spyObs.observe(t.section));
}

/* ---------- Click ripples on buttons ---------- */
document.addEventListener("click", (e) => {
  if (prefersReduced) return;
  const target = e.target.closest(
    ".btn, .nav-cta, .smart-suggest-btn, .logo-card",
  );
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.left = `${e.clientX - rect.left}px`;
  ripple.style.top = `${e.clientY - rect.top}px`;
  target.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
});

/* ---------- Flying chip on smart-suggest accept ---------- */
const smartFly = (() => {
  const smart = document.querySelector(".section-smart .mock-capture-smart");
  if (!smart) return () => {};
  return () => {
    if (prefersReduced) return;
    const timeMark = smart.querySelector(".time-mark");
    const gcalLogo = smart.querySelector(".smart-suggest .brand-logo");
    if (!timeMark || !gcalLogo) return;

    const a = timeMark.getBoundingClientRect();
    const b = gcalLogo.getBoundingClientRect();

    const fly = document.createElement("div");
    fly.className = "fly-chip";
    fly.textContent = timeMark.textContent.trim();
    fly.style.left = `${a.left + a.width / 2}px`;
    fly.style.top = `${a.top + a.height / 2}px`;
    document.body.appendChild(fly);

    requestAnimationFrame(() => {
      fly.classList.add("is-flying");
      fly.style.left = `${b.left + b.width / 2}px`;
      fly.style.top = `${b.top + b.height / 2}px`;
    });
    setTimeout(() => fly.remove(), 950);
  };
})();

// hook into the existing smart-suggest cycle by patching the observer above
const smartBtnExisting = document.querySelector(".smart-suggest-btn");
if (smartBtnExisting) {
  const _add = smartBtnExisting.classList.add.bind(smartBtnExisting.classList);
  smartBtnExisting.classList.add = (...args) => {
    if (args.includes("is-accepting")) smartFly();
    return _add(...args);
  };
}

/* ---------- Floating capture bubbles in the privacy orbit ---------- */
const privacyArt = document.querySelector(".privacy-art");
if (privacyArt && !prefersReduced) {
  const CAPTURES = [
    "Standup at 9am",
    "Email Sarah Friday",
    "Book Q3 review",
    "Idea: hotkey swap",
    "Call mom 5pm",
    "Ship beta build",
    "Read research doc",
  ];
  let cycle = 0;
  let cycleTimer = null;

  const launchBubble = () => {
    const satellites = privacyArt.querySelectorAll(".privacy-satellite");
    const center = privacyArt.querySelector(".privacy-center");
    if (!satellites.length || !center) return;
    const sat = satellites[cycle % satellites.length];

    const artRect = privacyArt.getBoundingClientRect();
    const satRect = sat.getBoundingClientRect();
    const centerRect = center.getBoundingClientRect();

    const bubble = document.createElement("div");
    bubble.className = "privacy-bubble";
    bubble.textContent = CAPTURES[cycle % CAPTURES.length];

    const startX = satRect.left - artRect.left + satRect.width / 2;
    const startY = satRect.top - artRect.top + satRect.height / 2;
    const endX = centerRect.left - artRect.left + centerRect.width / 2;
    const endY = centerRect.top - artRect.top + centerRect.height / 2;

    bubble.style.left = `${startX}px`;
    bubble.style.top = `${startY}px`;
    privacyArt.appendChild(bubble);

    requestAnimationFrame(() => {
      bubble.classList.add("is-flying");
      bubble.style.left = `${endX}px`;
      bubble.style.top = `${endY}px`;
    });

    setTimeout(() => bubble.remove(), 1700);
    cycle++;
  };

  const obs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (cycleTimer) clearInterval(cycleTimer);
          launchBubble();
          cycleTimer = setInterval(launchBubble, 1600);
        } else if (cycleTimer) {
          clearInterval(cycleTimer);
          cycleTimer = null;
        }
      }
    },
    { threshold: 0.3 },
  );
  obs.observe(privacyArt);
}

/* ---------- Bento card mouse spotlight ---------- */
if (!prefersReduced) {
  document.querySelectorAll(".bento-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });
}

/* ---------- Hero orb parallax ---------- */
const heroOrbBg = document.querySelector(".hero-orb-bg");
if (heroOrbBg && !prefersReduced) {
  window.addEventListener(
    "mousemove",
    (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      heroOrbBg.style.transform = `translate(${x}px, ${y}px)`;
    },
    { passive: true },
  );
}
