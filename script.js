/* =========================================================
   LEVON & JANNA — wedding invitation
   Edit the CONFIG block to change date, music, RSVP delivery.
   ========================================================= */
(() => {
  'use strict';

  const CONFIG = {
    year: 2026, month: 12, day: 1,
    time: '12:00:00',            // countdown target (first event of the day)
    timezone: '+04:00',          // Yerevan
    music: 'music.mp3',          // put your song next to index.html
    volume: 0.6,
    monthNames: ['Հունվար','Փետրվար','Մարտ','Ապրիլ','Մայիս','Հունիս','Հուլիս','Օգոստոս','Սեպտեմբեր','Հոկտեմբեր','Նոյեմբեր','Դեկտեմբեր'],
    weekdays: ['Երկ','Երք','Չրք','Հնգ','Ուրբ','Շբթ','Կիր'],   // Monday first
    countdownDone: 'Այսօր մեր օրն է',

    // RSVP delivery (leave empty to disable). Both can be used together.
    rsvpWhatsApp: '37493699204',            // e.g. '37477123456'  (country code, no + or spaces)
    rsvpEndpoint: ''             // e.g. a Formspree / Google Apps Script URL (POST JSON)
  };

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = n => String(n).padStart(2, '0');

  /* ---------- 1. Missing-image fallbacks ---------- */
  function watchImage(img, onMissing) {
    const miss = () => { img.classList.add('is-missing'); onMissing && onMissing(); };
    if (img.complete && img.naturalWidth === 0) miss();
    else img.addEventListener('error', miss, { once: true });
  }
  $$('.ph').forEach(f => watchImage($('img', f), () => f.classList.add('is-missing')));

  /* ---------- 2. Opening animation trigger ---------- */
  const heroImg = $('.hero__photo img');
  let started = false;
  const startIntro = () => {
    if (started) return;
    started = true;
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
  };
  watchImage(heroImg, startIntro);
  if (heroImg.complete) startIntro();
  else heroImg.addEventListener('load', startIntro, { once: true });
  setTimeout(startIntro, 2500);

  /* ---------- 3. Hero parallax ---------- */
  const hero = $('#hero');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const p = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
      hero.style.setProperty('--p', p.toFixed(3));
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 4. Torn paper edges (cover + wide photo) ---------- */
  function tear(el, idx) {
    const mode = el.dataset.torn;                      // 'b' or 'tb'
    let seed = 7919 * (idx + 3);
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const n = 46, amp = 15;
    const top = [], bot = [];
    for (let i = 0; i <= n; i++) {
      const x = (i * 100 / n).toFixed(2) + '%';
      const jag = (rnd() * amp * (i % 2 ? 1 : .45)).toFixed(1);
      top.push(`${x} ${mode === 'tb' ? jag + 'px' : '0px'}`);
    }
    for (let i = n; i >= 0; i--) {
      const x = (i * 100 / n).toFixed(2) + '%';
      const jag = (rnd() * amp * (i % 2 ? 1 : .45)).toFixed(1);
      bot.push(`${x} calc(100% - ${jag}px)`);
    }
    el.style.clipPath = `polygon(${top.concat(bot).join(',')})`;
  }
  $$('.torn').forEach(tear);

  /* ---------- 5. «ՍԵՐ լիքը ՍԵՐ» vertical title: split each segment into letters ---------- */
  const title = $('#storyTitle');
  let li = 0;
  $$('.seg', title).forEach(seg => {
    const txt = seg.textContent;
    seg.textContent = '';
    seg.setAttribute('aria-hidden', 'true');
    [...txt].forEach(ch => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.style.setProperty('--i', li++);
      s.textContent = ch;
      seg.appendChild(s);
    });
  });

  /* ---------- 6. Scroll reveals ---------- */
  const reveal = new IntersectionObserver(entries => {
    let k = 0;
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (el.classList.contains('frame') || el.classList.contains('stagger')) {
        el.style.transitionDelay = (k++ * 0.16) + 's';
      }
      el.classList.add('in');
      reveal.unobserve(el);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, .frame, .story__title, .wave').forEach(el => reveal.observe(el));

  /* ---------- 7. Countdown ---------- */
  const target = new Date(
    `${CONFIG.year}-${pad(CONFIG.month)}-${pad(CONFIG.day)}T${CONFIG.time}${CONFIG.timezone}`
  ).getTime();
  const units = {
    days: $('[data-unit="days"]'), hours: $('[data-unit="hours"]'),
    minutes: $('[data-unit="minutes"]'), seconds: $('[data-unit="seconds"]')
  };
  function tick() {
    let diff = Math.floor((target - Date.now()) / 1000);
    if (diff <= 0) { diff = 0; $('#countTitle').textContent = CONFIG.countdownDone; }
    units.days.textContent    = pad(Math.floor(diff / 86400));
    units.hours.textContent   = pad(Math.floor(diff % 86400 / 3600));
    units.minutes.textContent = pad(Math.floor(diff % 3600 / 60));
    units.seconds.textContent = pad(diff % 60);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- 8. Calendar ---------- */
  (function buildCalendar() {
    const { year, month, day } = CONFIG;
    $('#calTitle').textContent = CONFIG.monthNames[month - 1];
    const offset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
    const total  = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const heart =
      '<svg class="heart" viewBox="0 0 48 44" aria-hidden="true"><path pathLength="1" ' +
      'd="M24 41C12 31 3 24 3 14.5 3 8.6 7.6 4 13.2 4c4.2 0 8 2.4 10.8 6.4C26.8 6.4 30.6 4 34.8 4 40.4 4 45 8.6 45 14.5 45 24 36 31 24 41z"/></svg>';
    let html = '<div class="cal__head">' + CONFIG.weekdays.map(d => `<span>${d}</span>`).join('') + '</div><div class="cal__days">';
    for (let i = 0; i < offset; i++) html += '<span></span>';
    for (let d = 1; d <= total; d++) {
      const on = d === day;
      html += `<span class="cal__day${on ? ' cal__day--on' : ''}">${d}${on ? heart : ''}</span>`;
    }
    $('#cal').innerHTML = html + '</div>';
  })();

  /* ---------- 9. RSVP form ---------- */
  (function rsvp() {
    const form = $('#rsvp'), msg = $('#formMsg'), send = $('#send'), nameInput = $('#fullname');
    const state = { side: '', attend: '' };

    $$('.choice').forEach(group => {
      group.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        $$('button', group).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        state[group.dataset.name] = b.dataset.value;
        group.classList.remove('is-error');
      });
    });
    nameInput.addEventListener('input', () => nameInput.classList.remove('is-error'));

    const say = (t, err) => { msg.textContent = t; msg.classList.toggle('err', !!err); };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name = nameInput.value.trim();
      let ok = true;
      if (!name) { nameInput.classList.add('is-error'); ok = false; }
      ['side', 'attend'].forEach(k => { if (!state[k]) { $(`.choice[data-name="${k}"]`).classList.add('is-error'); ok = false; } });
      if (!ok) { say('Խնդրում ենք լրացնել բոլոր դաշտերը։', true); return; }

      const data = { name, side: state.side, attend: state.attend, wedding: `${pad(CONFIG.day)}.${pad(CONFIG.month)}.${CONFIG.year}` };
      send.disabled = true;

      if (CONFIG.rsvpEndpoint) {
        try {
          await fetch(CONFIG.rsvpEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        } catch (err) {
          send.disabled = false;
          say('Չհաջողվեց ուղարկել։ Խնդրում ենք կրկին փորձել։', true);
          return;
        }
      }
      let waUrl = '';
      if (CONFIG.rsvpWhatsApp) {
        const text = `Բարև, ես ${name} եմ (${state.side}). ` + (state.attend === 'Այո' ? 'Կմասնակցեմ հարսանիքին։' : 'Ցավոք, չեմ կարող մասնակցել։');
        waUrl = `https://wa.me/${CONFIG.rsvpWhatsApp}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank', 'noopener');
      }
      say('Շնորհակալություն։ Խնդրում ենք WhatsApp-ում սեղմել «Ուղարկել»։', false);
      if (waUrl) {
        const a = document.createElement('a');
        a.href = waUrl; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = ' Բացել WhatsApp-ը';
        a.style.textDecoration = 'underline';
        msg.appendChild(a);
      }
    });
  })();

  /* ---------- 10. Music (starts after first interaction) ---------- */
  const btn = $('#music');
  const audio = new Audio(CONFIG.music);
  audio.loop = true; audio.preload = 'auto'; audio.volume = CONFIG.volume;

  let playing = false, resumeAfterHide = false, armed = true;
  const paint = () => {
    btn.classList.toggle('is-playing', playing);
    btn.classList.remove('is-idle');
    btn.setAttribute('aria-pressed', String(playing));
    btn.setAttribute('aria-label', playing ? 'Դադարեցնել երաժշտությունը' : 'Միացնել երաժշտությունը');
  };
  const play = () => audio.play().then(() => { playing = true; paint(); }).catch(() => { playing = false; paint(); });
  const pause = () => { audio.pause(); playing = false; paint(); };

  audio.addEventListener('error', () => { btn.hidden = true; });
  btn.addEventListener('click', () => { disarm(); playing ? pause() : play(); });

  const FIRST = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
  function firstInteraction(e) {
    if (!armed) return;
    disarm();
    if (btn.contains(e.target)) return;
    play();
  }
  function disarm() { armed = false; FIRST.forEach(t => window.removeEventListener(t, firstInteraction, true)); }
  FIRST.forEach(t => window.addEventListener(t, firstInteraction, true));

  // Try to start right away. Browsers usually refuse until the visitor touches the page,
  // in which case the first tap or click starts it (listeners above).
  audio.play().then(() => { playing = true; disarm(); paint(); }).catch(() => {});

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { resumeAfterHide = playing; if (playing) audio.pause(); }
    else if (resumeAfterHide) { audio.play().catch(() => {}); resumeAfterHide = false; }
  });
})();
