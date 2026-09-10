/*
  Sati Timer — web companion.

  Ported from the real Android app's source (Session.kt, SessionController.kt,
  TimerConfig.kt, Preset.kt, BellSound.kt, Enso.kt, DurationDial.kt), not
  re-derived from scratch, so the timing behaviour and the ensō drawing
  match the app rather than approximating it.

  A session is planned once as a list of bell offsets from an anchor
  timestamp (Session.plan), then a small "pump" loop compares now to the
  next offset and fires anything due — the same design the app uses so
  that a backgrounded/throttled tab resyncs correctly instead of drifting,
  and a bell more than 30s overdue rings silently while the sit still
  advances (STALE_AFTER_MS in the real app).

  Unlike the app, a browser tab has no background-survival mechanism
  (no AlarmManager equivalent): if the tab is closed, the sit stops. The
  page says so once, plainly, near the top.
*/
(function () {
  'use strict';

  var LANG = document.documentElement.lang === 'nl' ? 'nl' : 'en';

  // ---------------- i18n ----------------

  var T = {
    en: {
      start: 'Start', pause: 'Pause', resume: 'Resume', stop: 'Stop', done: 'Done',
      off: 'Off', min: 'MIN', secondHour: 'second hour',
      countdownLabel: 'Countdown to start',
      countdownBody: 'Time to settle before the session begins. The starting bell rings when the countdown finishes.',
      intervalLabel: 'Interval bell',
      intervalBody: 'Rings during the session at this spacing.',
      bellsLabel: 'Bells', volumeLabel: 'Volume', bellVolumeLabel: 'Bell volume',
      volumeBody: 'Sets the level for every bell on this page.',
      startingBell: 'Starting bell', endingBell: 'Ending bell', betweenStages: 'Between stages',
      hearIt: 'Hear it', silent: 'Silent',
      addStage: 'Add a stage', add: 'Add', removeStage: function (n) { return 'Remove ' + n; },
      totalMin: function (n) { return 'Total ' + n + ' min'; },
      repeat: 'Repeat until stopped', keepScreenOn: 'Keep the screen on',
      savePreset: 'Save these settings as a preset', presetName: 'Preset name', save: 'Save',
      presetsTitle: 'My presets', presetsEmpty: 'No presets saved yet.',
      load: 'Load', delete: 'Delete',
      startingIn: 'Starting in', startingInSeconds: function (n) { return 'Starting in ' + n + ' seconds'; },
      round: function (n) { return 'Round ' + n; },
      stageOf: function (i, n) { return 'Stage ' + i + ' of ' + n; },
      completeTitle: 'Sitting complete',
      theme: 'Theme', themeLight: 'Light', themeDark: 'Dark', themeSystem: 'System',
      everyMin: function (n) { return 'every ' + n + ' min'; },
      seconds: function (n) { return n + ' sec'; },
      minutesFmt: function (n) { return n + ' min'; },
      percent: function (n) { return n + '%'; },
      stageChip: function (i, m) { return i + ' · ' + m + ' min'; },
      transitions: function (n) { return n + ' transitions'; }
    },
    nl: {
      start: 'Starten', pause: 'Pauzeren', resume: 'Hervatten', stop: 'Stoppen', done: 'Klaar',
      off: 'Uit', min: 'MIN', secondHour: 'tweede uur',
      countdownLabel: 'Aftellen voor start',
      countdownBody: 'Tijd om tot rust te komen voordat de sessie begint. De startbel klinkt zodra het aftellen is afgelopen.',
      intervalLabel: 'Intervalbel',
      intervalBody: 'Klinkt tijdens de sessie met dit interval.',
      bellsLabel: 'Bellen', volumeLabel: 'Volume', bellVolumeLabel: 'Volume van de bellen',
      volumeBody: 'Stelt het niveau in voor elke bel op deze pagina.',
      startingBell: 'Startbel', endingBell: 'Eindbel', betweenStages: 'Tussen fases',
      hearIt: 'Beluister', silent: 'Stil',
      addStage: 'Fase toevoegen', add: 'Toevoegen', removeStage: function (n) { return 'Verwijder ' + n; },
      totalMin: function (n) { return 'Totaal ' + n + ' min'; },
      repeat: 'Herhalen tot je stopt', keepScreenOn: 'Scherm aan houden',
      savePreset: 'Deze instellingen opslaan als voorinstelling', presetName: 'Naam van de voorinstelling', save: 'Opslaan',
      presetsTitle: 'Mijn voorinstellingen', presetsEmpty: 'Nog geen voorinstellingen opgeslagen.',
      load: 'Laden', delete: 'Verwijderen',
      startingIn: 'Begint over', startingInSeconds: function (n) { return 'Begint over ' + n + ' seconden'; },
      round: function (n) { return 'Ronde ' + n; },
      stageOf: function (i, n) { return 'Fase ' + i + ' van ' + n; },
      completeTitle: 'Sessie voltooid',
      theme: 'Thema', themeLight: 'Licht', themeDark: 'Donker', themeSystem: 'Systeem',
      everyMin: function (n) { return 'elke ' + n + ' min'; },
      seconds: function (n) { return n + ' sec'; },
      minutesFmt: function (n) { return n + ' min'; },
      percent: function (n) { return n + '%'; },
      stageChip: function (i, m) { return i + ' · ' + m + ' min'; },
      transitions: function (n) { return n + ' overgangen'; }
    }
  }[LANG];

  // ---------------- bells (BellSound.kt, real fundamentals) ----------------

  var BELLS = [
    { id: 'gong', hz: 98, name: { en: 'Gong', nl: 'Gong' }, short: { en: 'Gong', nl: 'Gong' } },
    { id: 'bowl-low', hz: 131, name: { en: 'Singing Bowl, low', nl: 'Klankschaal, laag' }, short: { en: 'Bowl low', nl: 'Schaal, laag' } },
    { id: 'bowl', hz: 196, name: { en: 'Singing Bowl', nl: 'Klankschaal' }, short: { en: 'Bowl', nl: 'Schaal' } },
    { id: 'bowl-small', hz: 294, name: { en: 'Singing Bowl, small', nl: 'Klankschaal, klein' }, short: { en: 'Bowl small', nl: 'Schaal, klein' } },
    { id: 'bell', hz: 392, name: { en: 'Bell', nl: 'Bel' }, short: { en: 'Bell', nl: 'Bel' } },
    { id: 'bell-small', hz: 494, name: { en: 'Bell, small', nl: 'Kleine bel' }, short: { en: 'Bell small', nl: 'Kleine bel' } }
  ];
  var DEFAULT_BELL = 'bowl', DEFAULT_INTERVAL_BELL = 'bell-small', DEFAULT_END_BELL = 'bowl-low';

  function bellById(id) {
    for (var i = 0; i < BELLS.length; i++) if (BELLS[i].id === id) return BELLS[i];
    return BELLS[2];
  }

  // ---------------- audio ----------------

  var AUDIO_EXT = (function () {
    var probe = document.createElement('audio');
    return probe.canPlayType && probe.canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : 'mp3';
  })();

  function playBell(id, volume) {
    try {
      var a = new Audio('audio/sati-timer/' + id + '.' + AUDIO_EXT);
      a.volume = Math.max(0, Math.min(1, volume));
      a.play().catch(function () {});
    } catch (e) { /* audio unavailable; the sit still advances */ }
  }

  // ---------------- ensō (Enso.kt, ported unchanged) ----------------

  var ENSO_START_DEG = -90, ENSO_SWEEP_DEG = 344, ENSO_SEGMENTS = 220;

  function wobble(t) {
    return Math.sin(t * 6.283 * 1.7 + 0.9) * 0.6 + Math.sin(t * 6.283 * 3.1 + 2.3) * 0.4;
  }
  function widthAt(t) {
    var tc = Math.max(0, Math.min(1, t));
    var body = Math.sin(Math.PI * (tc * 0.86 + 0.07));
    return 0.34 + 0.78 * body;
  }
  function inkAt(t) {
    var dry = Math.sin(t * 6.283 * 5.3 + 1.1) * 0.5 + 0.5;
    var lateness = Math.max(0, Math.min(1, (t - 0.55) / 0.45));
    return Math.max(0.25, Math.min(1, 1 - lateness * 0.55 * dry));
  }
  function pointOnEnso(cx, cy, radius, t, wobblePx) {
    var angle = (ENSO_START_DEG + ENSO_SWEEP_DEG * t) * (Math.PI / 180);
    var r = radius + wobble(t) * wobblePx;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  }
  function drawEnso(ctx, cx, cy, radius, strokeWidth, color, progress, alpha, wobblePx) {
    progress = progress === undefined ? 1 : Math.max(0, Math.min(1, progress));
    alpha = alpha === undefined ? 1 : alpha;
    wobblePx = wobblePx === undefined ? 3.5 : wobblePx;
    var end = Math.round(ENSO_SEGMENTS * progress);
    if (end <= 0) return;
    ctx.lineCap = 'round';
    for (var i = 0; i < end; i++) {
      var t0 = i / ENSO_SEGMENTS, t1 = (i + 1) / ENSO_SEGMENTS;
      var p0 = pointOnEnso(cx, cy, radius, t0, wobblePx);
      var p1 = pointOnEnso(cx, cy, radius, t1, wobblePx);
      ctx.globalAlpha = alpha * inkAt(t0);
      ctx.lineWidth = strokeWidth * widthAt(t0);
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ---------------- session engine (Session.kt / SessionController.kt) ----------------

  var DIAL_MIN = 1, DIAL_MAX = 120;
  var STALE_AFTER_MS = 30000;

  function planSession(config, anchorMs, completedRounds, firstRound) {
    var events = [], starts = [], ends = [];
    var begin = firstRound ? config.countdownSeconds * 1000 : 0;
    if (firstRound) events.push({ offset: begin, kind: 'start', stage: 0 });
    var t = begin;
    var last = config.stageMinutes.length - 1;
    config.stageMinutes.forEach(function (minutes, index) {
      var stageStart = t, stageEnd = stageStart + minutes * 60000;
      starts.push(stageStart); ends.push(stageEnd);
      if (config.intervalMinutes > 0) {
        var step = config.intervalMinutes * 60000;
        var at = stageStart + step;
        while (at < stageEnd) { events.push({ offset: at, kind: 'interval', stage: index }); at += step; }
      }
      events.push({ offset: stageEnd, kind: index === last ? 'end' : 'stage', stage: index });
      t = stageEnd;
    });
    return {
      config: config, events: events, stageStartOffsets: starts, stageEndOffsets: ends,
      nextIndex: 0, anchorMs: anchorMs, completedRounds: completedRounds, pausedAtOffset: null
    };
  }

  function Engine(opts) {
    this.onTick = opts.onTick || function () {};
    this.onComplete = opts.onComplete || function () {};
    this.onBell = opts.onBell || function () {};
    this.session = null;
    this.timer = null;
    var self = this;
    document.addEventListener('visibilitychange', function () { if (!document.hidden) self.pump(); });
  }

  Engine.prototype.start = function (config) {
    this.session = planSession(config, Date.now(), 0, true);
    this._drive();
    this.pump();
  };

  Engine.prototype._drive = function () {
    var self = this;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(function () { self.pump(); }, 250);
  };

  Engine.prototype.pause = function () {
    var s = this.session;
    if (!s || s.pausedAtOffset !== null) return;
    var offset = Math.max(0, Date.now() - s.anchorMs);
    s.pausedAtOffset = offset;
    this.onTick(this.snapshot());
  };

  Engine.prototype.resume = function () {
    var s = this.session;
    if (!s || s.pausedAtOffset === null) return;
    s.anchorMs = Date.now() - s.pausedAtOffset;
    s.pausedAtOffset = null;
    this.pump();
  };

  Engine.prototype.stop = function () {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.session = null;
  };

  Engine.prototype.pump = function () {
    var s = this.session;
    if (!s) return;
    if (s.pausedAtOffset !== null) { this.onTick(this.snapshot()); return; }
    var guard = 0;
    while (guard++ < 500) {
      var event = s.events[s.nextIndex];
      if (!event) break;
      var dueAt = s.anchorMs + event.offset;
      var now = Date.now();
      if (dueAt > now) break;
      var silent = (now - dueAt) > STALE_AFTER_MS;
      var result = this._fire(s, event, silent);
      if (result === null) { this.stop(); this.onComplete(); return; }
      s = result;
    }
    this.session = s;
    if (!s.events[s.nextIndex]) { this.onComplete(); this.stop(); return; }
    this.onTick(this.snapshot());
  };

  Engine.prototype._fire = function (s, event, silent) {
    var cfg = s.config;
    var self = this;
    function ring(bellId) { if (!silent) { self.onBell(bellId); playBell(bellId, cfg.volume); } }
    switch (event.kind) {
      case 'start':
        if (cfg.startBellEnabled) ring(cfg.startBellSound);
        return Object.assign({}, s, { nextIndex: s.nextIndex + 1 });
      case 'interval':
        ring(cfg.intervalBellSound);
        return Object.assign({}, s, { nextIndex: s.nextIndex + 1 });
      case 'stage':
        ring(cfg.stageBellSound);
        return Object.assign({}, s, { nextIndex: s.nextIndex + 1 });
      case 'end':
        if (cfg.endBellEnabled) ring(cfg.endBellSound);
        if (cfg.autoRestart) {
          return planSession(cfg, s.anchorMs + event.offset, s.completedRounds + 1, false);
        }
        return null;
    }
  };

  Engine.prototype.snapshot = function () {
    var s = this.session;
    if (!s) return null;
    var offset = s.pausedAtOffset !== null ? s.pausedAtOffset : (Date.now() - s.anchorMs);
    var sessionStart = s.stageStartOffsets[0];
    var counting = offset < sessionStart;
    var stageIndex = 0;
    for (var i = 0; i < s.stageEndOffsets.length; i++) { if (offset < s.stageEndOffsets[i]) { stageIndex = i; break; } stageIndex = i; }
    var total, remaining;
    if (counting) { total = sessionStart; remaining = sessionStart - offset; }
    else { total = s.stageEndOffsets[stageIndex] - s.stageStartOffsets[stageIndex]; remaining = s.stageEndOffsets[stageIndex] - offset; }
    var progress;
    if (counting) { progress = sessionStart <= 0 ? 0 : Math.max(0, Math.min(1, offset / sessionStart)); }
    else {
      var start = s.stageStartOffsets[stageIndex], span = s.stageEndOffsets[stageIndex] - start;
      progress = span <= 0 ? 1 : Math.max(0, Math.min(1, (offset - start) / span));
    }
    return {
      isPaused: s.pausedAtOffset !== null, isCountingDown: counting,
      stageIndex: stageIndex, stageCount: s.config.stageMinutes.length,
      completedRounds: s.completedRounds,
      totalSeconds: Math.max(0, Math.ceil(total / 1000)),
      remainingSeconds: Math.max(0, Math.ceil(remaining / 1000)),
      progress: progress
    };
  };

  // ---------------- presets (Preset.kt shape; lighter v1: save + delete) ----------------

  var PRESETS_KEY = 'satiTimerPresetsV1';
  function loadPresets() {
    try { var raw = JSON.parse(localStorage.getItem(PRESETS_KEY) || '[]'); return Array.isArray(raw) ? raw : []; }
    catch (e) { return []; }
  }
  function savePresets(list) {
    try { localStorage.setItem(PRESETS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  // ---------------- wake lock ----------------

  var wakeLock = null;
  function requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    navigator.wakeLock.request('screen').then(function (lock) { wakeLock = lock; }).catch(function () {});
  }
  function releaseWakeLock() {
    if (wakeLock) { wakeLock.release().catch(function () {}); wakeLock = null; }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && wakeLock === null && window.__satiKeepScreenOn) requestWakeLock();
  });

  // ---------------- UI ----------------

  function fmtClock(totalSeconds) {
    var m = Math.floor(totalSeconds / 60), s = totalSeconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function init() {
    var root = document.getElementById('timer-tool');
    if (!root) return;

    var draft = {
      stages: [20], stageBellSound: DEFAULT_BELL,
      countdownSeconds: 0, intervalMinutes: 0,
      startBellEnabled: true, startBellSound: DEFAULT_BELL,
      endBellEnabled: true, endBellSound: DEFAULT_END_BELL,
      intervalBellSound: DEFAULT_INTERVAL_BELL,
      autoRestart: false, keepScreenOn: false, volume: 0.7
    };
    var selectedStage = 0;

    var els = {
      setup: document.getElementById('timer-setup'),
      session: document.getElementById('timer-session'),
      complete: document.getElementById('timer-complete'),
      dialCanvas: document.getElementById('timer-dial-canvas'),
      dialMinutes: document.getElementById('timer-dial-minutes'),
      dialLap: document.getElementById('timer-dial-lap'),
      minutesInput: document.getElementById('timer-minutes-input'),
      chips: document.getElementById('timer-duration-chips'),
      stageRow: document.getElementById('timer-stage-row'),
      startBtn: document.getElementById('timer-start-btn'),
      countdownSummary: document.getElementById('timer-countdown-value'),
      countdownChips: document.getElementById('timer-countdown-chips'),
      intervalSummary: document.getElementById('timer-interval-value'),
      intervalChips: document.getElementById('timer-interval-chips'),
      bellsSummary: document.getElementById('timer-bells-value'),
      startBellToggle: document.getElementById('timer-start-bell-toggle'),
      startBellSelect: document.getElementById('timer-start-bell-select'),
      startBellHear: document.getElementById('timer-start-bell-hear'),
      intervalBellSelect: document.getElementById('timer-interval-bell-select'),
      intervalBellHear: document.getElementById('timer-interval-bell-hear'),
      intervalBellBlock: document.getElementById('timer-interval-bell-block'),
      stageBellBlock: document.getElementById('timer-stage-bell-block'),
      stageBellSelect: document.getElementById('timer-stage-bell-select'),
      stageBellHear: document.getElementById('timer-stage-bell-hear'),
      stageBellNote: document.getElementById('timer-stage-bell-note'),
      endBellToggle: document.getElementById('timer-end-bell-toggle'),
      endBellSelect: document.getElementById('timer-end-bell-select'),
      endBellHear: document.getElementById('timer-end-bell-hear'),
      volumeSummary: document.getElementById('timer-volume-value'),
      volumeSlider: document.getElementById('timer-volume-slider'),
      volumeHear: document.getElementById('timer-volume-hear'),
      repeatToggle: document.getElementById('timer-repeat-toggle'),
      keepScreenToggle: document.getElementById('timer-keep-screen-toggle'),
      presetNameInput: document.getElementById('timer-preset-name'),
      presetSaveBtn: document.getElementById('timer-preset-save'),
      presetList: document.getElementById('timer-preset-list'),
      themeBtn: document.getElementById('timer-theme-btn'),
      sessionStage: document.getElementById('timer-session-stage'),
      sessionTime: document.getElementById('timer-session-time'),
      sessionCanvas: document.getElementById('timer-session-canvas'),
      sessionHint: document.getElementById('timer-session-hint'),
      pauseBtn: document.getElementById('timer-pause-btn'),
      stopBtn: document.getElementById('timer-stop-btn'),
      doneBtn: document.getElementById('timer-done-btn')
    };

    // fill in static i18n text
    document.querySelectorAll('[data-t]').forEach(function (el) {
      var key = el.getAttribute('data-t');
      if (typeof T[key] === 'string') el.textContent = T[key];
    });
    document.querySelectorAll('[data-t-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-t-placeholder');
      if (typeof T[key] === 'string') el.setAttribute('placeholder', T[key]);
    });

    populateBellSelect(els.startBellSelect);
    populateBellSelect(els.intervalBellSelect);
    populateBellSelect(els.stageBellSelect);
    populateBellSelect(els.endBellSelect);

    function populateBellSelect(select) {
      if (!select) return;
      select.innerHTML = '';
      BELLS.forEach(function (b) {
        var o = document.createElement('option');
        o.value = b.id; o.textContent = b.name[LANG];
        select.appendChild(o);
      });
    }

    function config() {
      return {
        stageMinutes: draft.stages.slice(),
        stageBellSound: draft.stageBellSound,
        countdownSeconds: draft.countdownSeconds,
        intervalMinutes: draft.intervalMinutes,
        startBellEnabled: draft.startBellEnabled, startBellSound: draft.startBellSound,
        endBellEnabled: draft.endBellEnabled, endBellSound: draft.endBellSound,
        intervalBellSound: draft.intervalBellSound,
        autoRestart: draft.autoRestart, volume: draft.volume
      };
    }

    function renderDial() {
      var minutes = draft.stages[selectedStage];
      var within = ((minutes - 1) % 60) + 1;
      var sweep = within / 60;
      var lap = Math.floor((minutes - 1) / 60) + 1;
      els.dialMinutes.textContent = minutes;
      els.dialLap.textContent = lap > 1 ? T.secondHour : '';
      els.minutesInput.value = minutes;

      var canvas = els.dialCanvas;
      var size = canvas.width = canvas.height = canvas.clientWidth * (window.devicePixelRatio || 1);
      var ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, size, size);
      var cx = size / 2, cy = size / 2;
      var radius = size / 2 - size * 0.09;
      var stroke = size * 0.062;
      var style = getComputedStyle(root);
      var track = style.getPropertyValue('--line').trim() || '#D9DACE';
      var accent = style.getPropertyValue('--accent').trim() || '#4B5842';
      drawEnso(ctx, cx, cy, radius, stroke, track, 1);
      drawEnso(ctx, cx, cy, radius, stroke, accent, sweep);

      var knob = pointOnEnso(cx, cy, radius, sweep, 3.5);
      ctx.globalAlpha = 1;
      ctx.fillStyle = style.getPropertyValue('--bg').trim() || '#EDEEE7';
      ctx.beginPath(); ctx.arc(knob[0], knob[1], stroke * 0.78, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = size * 0.006; ctx.strokeStyle = accent;
      ctx.beginPath(); ctx.arc(knob[0], knob[1], stroke * 0.78, 0, Math.PI * 2); ctx.stroke();
    }

    function renderChips() {
      var shortcuts = [5, 10, 15, 20, 30, 45, 60];
      els.chips.innerHTML = '';
      shortcuts.forEach(function (m) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'timer-chip'; b.textContent = m;
        b.setAttribute('aria-pressed', String(draft.stages[selectedStage] === m));
        b.addEventListener('click', function () { setStageMinutes(selectedStage, m); });
        els.chips.appendChild(b);
      });
    }

    function renderStageRow() {
      els.stageRow.innerHTML = '';
      if (draft.stages.length === 1) {
        var addBtn = document.createElement('button');
        addBtn.type = 'button'; addBtn.className = 'timer-text-btn'; addBtn.textContent = T.addStage;
        addBtn.addEventListener('click', function () {
          draft.stages.push(5); selectedStage = draft.stages.length - 1; renderAll();
        });
        els.stageRow.appendChild(addBtn);
        return;
      }
      var chipsWrap = document.createElement('div');
      chipsWrap.className = 'timer-chips';
      draft.stages.forEach(function (m, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'timer-chip'; b.textContent = T.stageChip(i + 1, m);
        b.setAttribute('aria-pressed', String(i === selectedStage));
        b.addEventListener('click', function () { selectedStage = i; renderAll(); });
        chipsWrap.appendChild(b);
      });
      els.stageRow.appendChild(chipsWrap);

      var total = document.createElement('div');
      total.className = 'timer-stage-total';
      total.textContent = T.totalMin(draft.stages.reduce(function (a, b) { return a + b; }, 0));
      els.stageRow.appendChild(total);

      var actions = document.createElement('div');
      actions.className = 'timer-stage-actions';
      var add = document.createElement('button');
      add.type = 'button'; add.className = 'timer-text-btn'; add.textContent = T.add;
      add.addEventListener('click', function () { draft.stages.push(5); selectedStage = draft.stages.length - 1; renderAll(); });
      var remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'timer-text-btn'; remove.textContent = T.removeStage(selectedStage + 1);
      remove.addEventListener('click', function () {
        draft.stages.splice(selectedStage, 1);
        selectedStage = Math.max(0, selectedStage - 1);
        renderAll();
      });
      actions.appendChild(add); actions.appendChild(remove);
      els.stageRow.appendChild(actions);
      els.stageBellBlock.hidden = false;
      els.stageBellNote.textContent = T.transitions(draft.stages.length - 1);
    }

    function setStageMinutes(stage, minutes) {
      minutes = Math.max(DIAL_MIN, Math.min(DIAL_MAX, Math.round(minutes)));
      draft.stages[stage] = minutes;
      renderAll();
    }

    function renderSummaries() {
      els.countdownSummary.textContent = draft.countdownSeconds === 0 ? T.off : T.seconds(draft.countdownSeconds);
      els.intervalSummary.textContent = draft.intervalMinutes === 0 ? T.off : T.everyMin(draft.intervalMinutes);
      var parts = [];
      if (draft.startBellEnabled) parts.push(bellById(draft.startBellSound).short[LANG]);
      if (draft.intervalMinutes > 0) parts.push(bellById(draft.intervalBellSound).short[LANG]);
      if (draft.endBellEnabled) parts.push(bellById(draft.endBellSound).short[LANG]);
      els.bellsSummary.textContent = parts.length ? parts.join(' · ') : T.silent;
      els.volumeSummary.textContent = Math.round(draft.volume * 100) + '%';

      els.startBellToggle.checked = draft.startBellEnabled;
      els.startBellSelect.value = draft.startBellSound;
      els.intervalBellSelect.value = draft.intervalBellSound;
      els.intervalBellBlock.hidden = draft.intervalMinutes === 0;
      els.stageBellSelect.value = draft.stageBellSound;
      els.stageBellBlock.hidden = draft.stages.length <= 1;
      els.endBellToggle.checked = draft.endBellEnabled;
      els.endBellSelect.value = draft.endBellSound;
      els.volumeSlider.value = draft.volume;
      els.repeatToggle.checked = draft.autoRestart;
      els.keepScreenToggle.checked = draft.keepScreenOn;
    }

    function renderPresets() {
      var list = loadPresets();
      els.presetList.innerHTML = '';
      if (list.length === 0) {
        var empty = document.createElement('li');
        empty.className = 'timer-preset-empty';
        empty.textContent = T.presetsEmpty;
        els.presetList.appendChild(empty);
        return;
      }
      list.forEach(function (p, idx) {
        var li = document.createElement('li');
        var info = document.createElement('div');
        var name = document.createElement('span');
        name.className = 'timer-preset-name'; name.textContent = p.name;
        var meta = document.createElement('span');
        meta.className = 'timer-preset-meta';
        var mins = p.stages.reduce(function (a, b) { return a + b; }, 0);
        meta.textContent = T.minutesFmt(mins) + (p.stages.length > 1 ? ' · ' + p.stages.length : '');
        info.appendChild(name); info.appendChild(meta);

        var actions = document.createElement('div');
        var loadBtn = document.createElement('button');
        loadBtn.type = 'button'; loadBtn.className = 'timer-text-btn'; loadBtn.textContent = T.load;
        loadBtn.style.marginRight = '14px';
        loadBtn.addEventListener('click', function () {
          draft.stages = p.stages.slice();
          draft.stageBellSound = p.stageBellSound; draft.countdownSeconds = p.countdownSeconds;
          draft.intervalMinutes = p.intervalMinutes; draft.startBellEnabled = p.startBellEnabled;
          draft.startBellSound = p.startBellSound; draft.endBellEnabled = p.endBellEnabled;
          draft.endBellSound = p.endBellSound; draft.intervalBellSound = p.intervalBellSound;
          draft.autoRestart = p.autoRestart; draft.volume = p.volume;
          selectedStage = 0;
          renderAll();
        });
        var delBtn = document.createElement('button');
        delBtn.type = 'button'; delBtn.className = 'timer-text-btn'; delBtn.textContent = T.delete;
        delBtn.addEventListener('click', function () {
          var l = loadPresets(); l.splice(idx, 1); savePresets(l); renderPresets();
        });
        actions.appendChild(loadBtn); actions.appendChild(delBtn);

        li.appendChild(info); li.appendChild(actions);
        els.presetList.appendChild(li);
      });
    }

    function renderAll() {
      renderDial(); renderChips(); renderStageRow(); renderSummaries();
    }

    // ---- dial drag interaction ----
    (function () {
      var canvas = els.dialCanvas;
      var dragging = false, previousAngle = 0, accumulated = draft.stages[selectedStage];

      function angleAt(clientX, clientY) {
        var rect = canvas.getBoundingClientRect();
        var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        return Math.atan2(clientY - cy, clientX - cx);
      }

      canvas.addEventListener('pointerdown', function (e) {
        dragging = true; canvas.setPointerCapture(e.pointerId);
        previousAngle = angleAt(e.clientX, e.clientY);
        accumulated = draft.stages[selectedStage];
      });
      canvas.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var angle = angleAt(e.clientX, e.clientY);
        var delta = angle - previousAngle;
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;
        previousAngle = angle;
        accumulated = Math.max(DIAL_MIN, Math.min(DIAL_MAX, accumulated + (delta / (2 * Math.PI)) * 60));
        var rounded = Math.round(accumulated);
        if (rounded !== draft.stages[selectedStage]) { draft.stages[selectedStage] = rounded; renderAll(); }
      });
      canvas.addEventListener('pointerup', function () { dragging = false; });
      canvas.addEventListener('pointercancel', function () { dragging = false; });
      window.addEventListener('resize', renderDial);
    })();

    els.minutesInput.addEventListener('change', function () {
      var v = parseInt(els.minutesInput.value, 10);
      if (!isNaN(v)) setStageMinutes(selectedStage, v);
      else renderDial();
    });

    // ---- countdown / interval chip pickers ----
    function chipGroup(container, options, current, onSelect, labelFn) {
      container.innerHTML = '';
      options.forEach(function (opt) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'timer-chip'; b.textContent = labelFn(opt);
        b.setAttribute('aria-pressed', String(opt === current));
        b.addEventListener('click', function () { onSelect(opt); renderAll(); rebuildPickers(); });
        container.appendChild(b);
      });
    }
    function rebuildPickers() {
      chipGroup(els.countdownChips, [0, 5, 10, 15, 30], draft.countdownSeconds,
        function (v) { draft.countdownSeconds = v; }, function (v) { return v === 0 ? T.off : T.seconds(v); });
      chipGroup(els.intervalChips, [0, 5, 10, 15, 30, 60], draft.intervalMinutes,
        function (v) { draft.intervalMinutes = v; }, function (v) { return v === 0 ? T.off : T.minutesFmt(v); });
    }
    rebuildPickers();

    els.startBellToggle.addEventListener('change', function () { draft.startBellEnabled = els.startBellToggle.checked; renderSummaries(); });
    els.startBellSelect.addEventListener('change', function () { draft.startBellSound = els.startBellSelect.value; renderSummaries(); });
    els.startBellHear.addEventListener('click', function () { playBell(els.startBellSelect.value, draft.volume); });
    els.intervalBellSelect.addEventListener('change', function () { draft.intervalBellSound = els.intervalBellSelect.value; renderSummaries(); });
    els.intervalBellHear.addEventListener('click', function () { playBell(els.intervalBellSelect.value, draft.volume); });
    els.stageBellSelect.addEventListener('change', function () { draft.stageBellSound = els.stageBellSelect.value; renderSummaries(); });
    els.stageBellHear.addEventListener('click', function () { playBell(els.stageBellSelect.value, draft.volume); });
    els.endBellToggle.addEventListener('change', function () { draft.endBellEnabled = els.endBellToggle.checked; renderSummaries(); });
    els.endBellSelect.addEventListener('change', function () { draft.endBellSound = els.endBellSelect.value; renderSummaries(); });
    els.endBellHear.addEventListener('click', function () { playBell(els.endBellSelect.value, draft.volume); });
    els.volumeSlider.addEventListener('input', function () { draft.volume = parseFloat(els.volumeSlider.value); renderSummaries(); });
    els.volumeHear.addEventListener('click', function () { playBell(draft.startBellSound, draft.volume); });
    els.repeatToggle.addEventListener('change', function () { draft.autoRestart = els.repeatToggle.checked; });
    els.keepScreenToggle.addEventListener('change', function () {
      draft.keepScreenOn = els.keepScreenToggle.checked;
      window.__satiKeepScreenOn = draft.keepScreenOn;
      if (draft.keepScreenOn) requestWakeLock(); else releaseWakeLock();
    });

    els.presetSaveBtn.addEventListener('click', function () {
      var name = (els.presetNameInput.value || '').trim();
      if (!name) return;
      var list = loadPresets();
      list.push({
        name: name, stages: draft.stages.slice(), stageBellSound: draft.stageBellSound,
        countdownSeconds: draft.countdownSeconds, intervalMinutes: draft.intervalMinutes,
        startBellEnabled: draft.startBellEnabled, startBellSound: draft.startBellSound,
        endBellEnabled: draft.endBellEnabled, endBellSound: draft.endBellSound,
        intervalBellSound: draft.intervalBellSound, autoRestart: draft.autoRestart, volume: draft.volume,
        lastUsedAt: Date.now()
      });
      savePresets(list);
      els.presetNameInput.value = '';
      renderPresets();
    });

    // ---- theme toggle: light <-> dark, light by default regardless of the
    // visitor's system setting (a bare "system" mode used to jump straight
    // into dark for anyone with a dark OS theme, which read as jarring on
    // a page that otherwise always opens light) ----
    var THEME_KEY = 'satiTimerThemeV1';
    function applyTheme(mode) {
      root.closest('.timer-page').setAttribute('data-theme', mode);
      els.themeBtn.textContent = mode === 'dark' ? T.themeDark : T.themeLight;
      try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
    }
    var savedTheme = 'light';
    try { savedTheme = localStorage.getItem(THEME_KEY) || 'light'; } catch (e) {}
    applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
    els.themeBtn.addEventListener('click', function () {
      var current = document.querySelector('.timer-page').getAttribute('data-theme') || 'light';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });

    // ---- session engine wiring ----
    var engine = new Engine({
      onTick: function (snap) { renderSession(snap); },
      onComplete: function () {
        releaseWakeLock();
        els.session.hidden = true;
        els.complete.hidden = false;
      },
      onBell: function () {}
    });

    function renderSession(snap) {
      if (!snap) return;
      els.sessionStage.textContent = snap.stageCount > 1 ? T.stageOf(snap.stageIndex + 1, snap.stageCount) : '';
      if (snap.completedRounds > 0) {
        els.sessionStage.textContent = (els.sessionStage.textContent ? els.sessionStage.textContent + ' · ' : '') + T.round(snap.completedRounds + 1);
      }
      els.sessionTime.textContent = fmtClock(snap.remainingSeconds);
      els.sessionHint.textContent = snap.isCountingDown ? T.startingIn : '';
      els.pauseBtn.textContent = snap.isPaused ? T.resume : T.pause;

      var canvas = els.sessionCanvas;
      var size = canvas.width = canvas.height = canvas.clientWidth * (window.devicePixelRatio || 1);
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, size, size);
      var cx = size / 2, cy = size / 2, radius = size / 2 - size * 0.09, stroke = size * 0.05;
      var style = getComputedStyle(document.querySelector('.timer-page'));
      var track = style.getPropertyValue('--line').trim() || '#D9DACE';
      var accent = style.getPropertyValue('--accent').trim() || '#4B5842';
      drawEnso(ctx, cx, cy, radius, stroke, track, 1);
      drawEnso(ctx, cx, cy, radius, stroke, accent, snap.progress);
    }

    els.startBtn.addEventListener('click', function () {
      els.setup.hidden = true;
      els.complete.hidden = true;
      els.session.hidden = false;
      if (draft.keepScreenOn) requestWakeLock();
      engine.start(config());
    });
    els.pauseBtn.addEventListener('click', function () {
      var s = engine.session;
      if (!s) return;
      if (s.pausedAtOffset !== null) engine.resume(); else engine.pause();
    });
    els.stopBtn.addEventListener('click', function () {
      engine.stop();
      releaseWakeLock();
      els.session.hidden = true;
      els.setup.hidden = false;
    });
    els.doneBtn.addEventListener('click', function () {
      els.complete.hidden = true;
      els.setup.hidden = false;
    });

    // keyboard shortcuts
    document.addEventListener('keydown', function (e) {
      if (e.target && /input|select|textarea/i.test(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!els.session.hidden) els.pauseBtn.click();
        else if (els.setup.hidden === false) els.startBtn.click();
      } else if (e.key === 'Escape') {
        if (!els.session.hidden) els.stopBtn.click();
      }
    });

    renderAll();
    renderPresets();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
