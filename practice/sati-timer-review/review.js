/* Sati Timer · Vietnamese review page. Loaded as a file: the site's CSP (script-src 'self') blocks inline scripts. */
/* ---------- settings ---------- */
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbyHEhRktChph6TSVuWKl3AxLywxLUTKAp0t3HqSrjUQh3nDQNOOfy4hsZZJln1WXpZ1/exec';            // Google Apps Script web app URL (…/exec). Empty = demo mode, saves on this device only.
const KEY = 'sati-vi-2026';     // must match KEY in the Apps Script
const DATA_URL = 'review-data.json';

/* ---------- small helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rich = s => esc(s).replace(/«(.+?)»/g, '<span class="noting">$1</span>').replace(/\{(.+?)\}/g, '<span class="ph">$1</span>');
const plain = s => String(s).replace(/[«»{}]/g, '');
const store = {
  get(k, d) { try { const v = localStorage.getItem('svr:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('svr:' + k, JSON.stringify(v)); } catch (e) {} }
};
const params = new URLSearchParams(location.search);

/* ---------- state ---------- */
let DATA, ITEMS = {}, ROUND, CHAPS;
const S = {
  rid: params.get('rid') || store.get('rid', null),
  name: store.get('name', ''),
  answers: store.get('answers', {}),
  queue: store.get('queue', []),
  fs: store.get('fs', 1),
  showEn: store.get('showEn', false),
  view: 'welcome', chap: null, pos: 0, editing: null, saveState: 'idle'
};
if (!S.rid) { S.rid = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)); }
store.set('rid', S.rid);
document.documentElement.style.setProperty('--fs', S.fs);

/* ---------- saving ---------- */
function persist() { store.set('answers', S.answers); store.set('queue', S.queue); }
function answer(id, verdict, suggestion = '', comment = '') {
  const it = ITEMS[id] || { v: '', vi: '', en: '' };
  S.answers[id] = { verdict, suggestion, comment, v: it.v, t: Date.now() };
  S.queue = S.queue.filter(q => q.item !== id);
  S.queue.push({ item: id, v: it.v, verdict, suggestion, comment, vi: plain(it.vi), en: plain(it.en) });
  persist(); flush();
}
let flushing = false, retryTimer = null;
async function flush() {
  if (!ENDPOINT) { setSave('local'); return; }
  if (flushing || !S.queue.length) { if (!S.queue.length) setSave('saved'); return; }
  flushing = true; setSave('saving');
  const batch = S.queue.slice(0, 50);
  try {
    const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ key: KEY, rid: S.rid, name: S.name, round: ROUND, answers: batch }) });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'not ok');
    // Drop exactly what was sent; an item re-answered while this was in flight stays queued.
    S.queue = S.queue.filter(q => !batch.includes(q));
    persist(); flushing = false;
    if (S.queue.length) flush(); else setSave('saved');
  } catch (e) {
    flushing = false; setSave('offline');
    clearTimeout(retryTimer); retryTimer = setTimeout(flush, 15000);
  }
}
window.addEventListener('online', flush);
function setSave(st) {
  S.saveState = st;
  const el = $('#save'); if (!el) return;
  el.className = 'save' + (st === 'offline' ? ' warn' : '');
  el.textContent = { saving: 'Đang lưu…', saved: 'Đã lưu', offline: 'Chưa gửi được, sẽ tự thử lại', local: 'Đã lưu trên máy này', idle: '' }[st] || '';
}
async function pull() {
  if (!ENDPOINT) return;
  try {
    const r = await fetch(ENDPOINT + '?key=' + encodeURIComponent(KEY) + '&rid=' + encodeURIComponent(S.rid));
    const j = await r.json();
    if (!j.ok) return;
    (j.answers || []).forEach(a => {
      if (!S.answers[a.item]) S.answers[a.item] = { verdict: a.verdict, suggestion: a.suggestion || '', comment: a.comment || '', v: a.v, t: 0 };
      if (a.name && !S.name) S.name = a.name;
    });
    store.set('name', S.name); persist();
  } catch (e) {}
}

/* ---------- chapters for this round ---------- */
function buildChapters() {
  const rk = params.get('vong') || store.get('round', '1');
  ROUND = DATA.rounds[rk] ? rk : '1';
  store.set('round', ROUND);
  const r = DATA.rounds[ROUND];
  if (r.groups) {
    CHAPS = r.chapters.map(id => ({ id, title: r.groups[id].title, intro: r.groups[id].intro, refs: r.groups[id].refs || [], items: r.groups[id].items.map(i => ITEMS[i]) }));
  } else {
    CHAPS = DATA.chapters.map(c => ({ ...c, items: DATA.items.filter(i => i.ch === c.id) }));
  }
  CHAPS.push({ id: 'final', refs: [], title: 'Lời nhắn cuối', intro: 'Một ô trống cho bất cứ điều gì khác quý vị muốn nói.', items: [ITEMS['general:comment']] });
  CHAPS.forEach(c => {
    // Quick items only make sense in bulk; with the group round everything gets its own card.
    c.quick = ROUND === '1' ? c.items.filter(i => i.quick) : [];
    c.cards = c.items.filter(i => !c.quick.includes(i));
    const words = c.items.reduce((n, i) => n + plain(i.vi).split(/\s+/).length, 0);
    c.minutes = Math.max(2, Math.round(words / 100 + c.cards.length * 0.15 + c.quick.length * 0.05));
  });
}
const doneIn = c => c.items.filter(i => S.answers[i.id]).length;
const totalMinutes = () => CHAPS.reduce((n, c) => n + (c.id === 'final' ? 0 : c.minutes), 0);

/* ---------- reference material ---------- */
const ext = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}<span class="ext" aria-hidden="true"> ↗</span></a>`;
function refList() {
  return `<ul class="refs">${DATA.refs.map(r => `<li>${ext(r.url, r.title)}<div class="small muted">${esc(r.sub)}</div></li>`).join('')}</ul>`;
}
function chapRefs(c) {
  return c.refs && c.refs.length ? `<div class="chrefs">${c.refs.map(([l, u]) => ext(u, l)).join('')}</div>` : '';
}

/* ---------- views ---------- */
function topbar(title, opts = {}) {
  const pct = opts.pct == null ? null : Math.round(opts.pct * 100);
  return `<div class="bar"><div class="bar-in">
    ${opts.back ? `<button class="iconbtn" data-act="${opts.back}" aria-label="Quay lại">${ICON.back}</button>` : ''}
    <div class="bar-title">${esc(title)}</div>
    <span id="save" class="save"></span>
    <button class="iconbtn" data-act="menu" aria-label="Tùy chọn">${ICON.menu}</button>
  </div>${pct == null ? '' : `<div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>`}</div>`;
}
const ICON = {
  back: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
  pen: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>'
};

function render() {
  const app = $('#app');
  if (S.view === 'welcome') app.innerHTML = vWelcome();
  else if (S.view === 'list') app.innerHTML = vList();
  else if (S.view === 'quick') app.innerHTML = vQuick();
  else if (S.view === 'card') app.innerHTML = vCard();
  else if (S.view === 'chapdone') app.innerHTML = vChapDone();
  setSave(S.saveState);
  window.scrollTo(0, 0);
  const f = $('[autofocus]'); if (f) f.focus();
}

function vWelcome() {
  const n = CHAPS.length - 1;
  const group = ROUND !== '1';
  return `<div class="wrap fade" style="padding-top:calc(28px + env(safe-area-inset-top))">
    <h1>Sati Timer<span class="dot">.</span></h1>
    <h2 style="margin-top:6px">Xin quý vị giúp xem lại bản tiếng Việt</h2>
    <p>Sati Timer là một ứng dụng hẹn giờ thiền miễn phí, kèm các bản hướng dẫn ngồi thiền, kinh hành và bái lạy trong chánh niệm theo lối dạy của Ngài Ajahn Tong Sirimangalo.</p>
    <p>Người làm ứng dụng không biết tiếng Việt. Vì vậy rất mong quý vị giúp xem bản dịch có tự nhiên, đúng nghĩa và phù hợp với một ứng dụng thiền hay không.</p>
    <div class="card">
      <ul class="how">
        <li>Mỗi lần chỉ hiện một câu. Quý vị chọn <b>Ổn</b>, <b>Cần sửa</b> hoặc <b>Chưa chắc</b>.</li>
        <li>Câu trả lời được lưu ngay. Có thể dừng bất cứ lúc nào; lần sau mở lại đường dẫn này sẽ tiếp tục đúng chỗ.</li>
        <li>Không cần phải chắc chắn tuyệt đối. Một cảm nhận như “nghe hơi lạ” cũng rất quý.</li>
        <li>${group ? `Có ${n} phần, mỗi phần khoảng ${Math.min(...work().map(c => c.minutes))} đến ${Math.max(...work().map(c => c.minutes))} phút. Quý vị có thể chỉ làm một phần.` : `Có ${n} phần ngắn, tổng cộng khoảng ${Math.round(totalMinutes() / 5) * 5} phút. Nên chia ra làm vài lần.`}</li>
      </ul>
    </div>
    <details class="card refbox"><summary><b>Tài liệu tham khảo</b> <span class="small muted">(mở trong thẻ mới)</span></summary>
      <p class="small muted" style="margin-top:8px">Các thuật ngữ theo sách “Thiền như thế nào”. Các bài hướng dẫn trên trang web là bản nháp, cùng nội dung với ứng dụng.</p>
      ${refList()}</details>
    <label class="f" for="name">Tên của quý vị</label>
    <input id="name" type="text" autocomplete="name" placeholder="Ví dụ: Lan" value="${esc(S.name)}">
    <p class="small muted">Để biết ai đã góp ý. Chỉ cần tên gọi.</p>
    <div style="margin-top:18px"><button class="btn" data-act="start">${Object.keys(S.answers).length ? 'Tiếp tục' : 'Bắt đầu'}</button></div>
  </div>`;
}

const work = () => CHAPS.filter(c => c.id !== 'final');
function vList() {
  const all = work().reduce((n, c) => n + c.items.length, 0), done = work().reduce((n, c) => n + doneIn(c), 0);
  return topbar('Các phần', { pct: done / all }) + `<div class="wrap fade">
    <p class="muted" style="margin-top:16px">${S.name ? 'Xin chào ' + esc(S.name) + '. ' : ''}Chọn một phần để bắt đầu. Làm theo thứ tự nào cũng được, nhưng phần đầu tiên nên xem trước.</p>
    ${CHAPS.map((c, i) => {
      const d = doneIn(c), t = c.items.length, full = d === t;
      return `<button class="card chap ${full ? 'done' : ''}" data-act="open" data-ch="${i}">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><h3>${esc(c.title)}</h3>
        ${c.id === 'final' && !full ? '' : `<span class="badge">${full ? 'Đã xong' : d ? 'Đang làm' : 'khoảng ' + c.minutes + ' phút'}</span>`}</div>
        <div class="muted small">${esc(c.intro)}</div>
        ${c.id === 'final' ? '' : `<div class="meta"><span>${t} mục</span><span>${d} / ${t}</span></div><div class="mini"><i style="width:${Math.round(d / t * 100)}%"></i></div>`}
      </button>`;
    }).join('')}
    <details class="card refbox"><summary><b>Tài liệu tham khảo</b></summary>${refList()}</details>
  </div>`;
}

function vQuick() {
  const c = CHAPS[S.chap];
  const flagged = S.quickFlags || {};
  return topbar(c.title, { back: 'list', pct: 0 }) + `<div class="wrap fade">
    <div class="card">
      <h2>Kiểm tra nhanh</h2>
      <p class="muted small">Đây là những chữ ngắn như tên nút. Chạm vào chữ nào cần sửa. Những chữ còn lại sẽ được ghi là ổn.</p>
      ${c.quick.map((i, n) => {
        const f = flagged[i.id];
        const head = n === 0 || c.quick[n - 1].where !== i.where ? `<div class="qhead">${esc(i.where)}</div>` : '';
        return head + `<div class="q ${f ? 'flag' : ''}" data-act="qflag" data-id="${esc(i.id)}">
          <div class="mark">${f ? ICON.pen : ICON.check}</div>
          <div class="t"><div class="qv">${rich(i.vi)}</div>
          <div class="qe">${S.showEn ? esc(plain(i.en)) : ''}</div>
          ${f ? `<div class="qedit" data-stop="1"><input type="text" data-q="${esc(i.id)}" value="${esc(f.suggestion != null ? f.suggestion : plain(i.vi))}" aria-label="Câu đề nghị"></div>` : ''}
          </div></div>`;
      }).join('')}
      <button class="en-toggle" data-act="en">${S.showEn ? 'Ẩn tiếng Anh' : 'Hiện tiếng Anh'}</button>
    </div>
    <button class="btn" data-act="qdone">Lưu và tiếp tục</button>
  </div>`;
}

function vCard() {
  const c = CHAPS[S.chap], it = c.cards[S.pos], a = S.answers[it.id];
  const isFinal = it.id === 'general:comment';
  const total = c.cards.length, pct = (S.pos + (a ? 1 : 0)) / total;
  const ed = S.editing;
  const long = plain(it.vi).length > 220;
  let body;
  if (isFinal) {
    body = `<label class="f" for="cm">Có điều gì khác quý vị muốn nhắn không? Về giọng văn chung, một từ hay gặp, hay bất cứ điều gì.</label>
      <textarea id="cm" autofocus>${esc(a ? a.comment : '')}</textarea>
      <div style="margin-top:14px"><button class="btn" data-act="final">Lưu</button></div>`;
  } else if (ed) {
    const fix = ed === 'fix';
    body = `<div class="card">
      ${fix ? `<label class="f" for="sg">Câu quý vị đề nghị</label>
      <textarea id="sg" autofocus style="min-height:${long ? 200 : 110}px">${esc(a && a.verdict === 'fix' ? a.suggestion : plain(it.vi))}</textarea>
      <p class="small muted">Có thể sửa trực tiếp ở trên, hoặc để nguyên và chỉ ghi chú bên dưới.</p>` : ''}
      <label class="f" for="cm">${fix ? 'Lý do hoặc ghi chú (không bắt buộc)' : 'Điều gì làm quý vị chưa chắc? (không bắt buộc)'}</label>
      <textarea id="cm" ${fix ? '' : 'autofocus'}>${esc(a && a.verdict === ed ? a.comment : '')}</textarea>
      <div class="row"><button class="btn ghost" data-act="cancel">Hủy</button><button class="btn" data-act="saveedit">Lưu và tiếp tục</button></div>
    </div>`;
  } else {
    const sel = v => a && a.verdict === v ? ' sel' : '';
    body = `<div class="answers">
      <button class="ans ok${sel('ok')}" data-act="ok">Ổn<small>đọc tự nhiên</small></button>
      <button class="ans fix${sel('fix')}" data-act="fix">Cần sửa<small>đề nghị câu khác</small></button>
      <button class="ans unsure${sel('unsure')}" data-act="unsure">Chưa chắc<small>ghi chú</small></button>
    </div>
    ${a && a.verdict !== 'ok' && (a.suggestion || a.comment) ? `<p class="small muted" style="margin-top:12px">Đã ghi: ${esc(a.suggestion || '')} ${a.comment ? '· ' + esc(a.comment) : ''}</p>` : ''}`;
  }
  return topbar(c.title, { back: 'list', pct }) + `<div class="wrap fade">
    <div class="card kind-${esc(it.kind)}">
      <div class="where"><span>${esc(it.where)}</span>${isFinal ? '' : `<span class="count">${S.pos + 1} / ${total}</span>`}</div>
      ${it.img ? `<img class="fig" src="../images/${esc(it.img)}" alt="" loading="lazy">` : ''}
      ${it.pali ? `<div class="pali">${esc(it.pali)}</div>` : ''}
      ${isFinal ? '' : `<div class="vi ${long ? 'long' : ''}">${rich(it.vi)}</div>
      <button class="en-toggle" data-act="en">${S.showEn ? 'Ẩn tiếng Anh' : 'Xem câu gốc tiếng Anh'}</button>
      ${S.showEn ? `<div class="en">${rich(it.en)}</div>` : ''}
      ${it.note ? `<div class="note"><b>Ghi chú:</b> ${rich(it.note)}</div>` : ''}`}
    </div>
    ${body}
    ${ed ? '' : `<div class="nav"><button class="link" data-act="prev" ${S.pos === 0 && !c.quick.length ? 'disabled' : ''}>‹ Câu trước</button>
      <button class="link" data-act="next">${a ? 'Câu sau ›' : 'Bỏ qua ›'}</button></div>
    ${chapRefs(c)}`}
  </div>`;
}

function vChapDone() {
  const c = CHAPS[S.chap];
  const allDone = work().every(x => doneIn(x) === x.items.length);
  let next = CHAPS.findIndex((x, i) => i > S.chap && x.id !== 'final' && doneIn(x) < x.items.length);
  if (next < 0) next = CHAPS.findIndex(x => x.id !== 'final' && doneIn(x) < x.items.length);
  if (next < 0 && c.id !== 'final' && !S.answers['general:comment']) next = CHAPS.length - 1;
  const skipped = c.items.length - doneIn(c);
  return topbar(c.title, { back: 'list', pct: 1 }) + `<div class="wrap fade center" style="padding-top:40px">
    <h1>${allDone ? 'Đã xong tất cả' : 'Xong phần này'}<span class="dot">.</span></h1>
    <p style="margin-top:12px">${allDone ? 'Xin chân thành cảm ơn quý vị đã dành thời gian và sự chú tâm cho bản dịch này.' : 'Cảm ơn quý vị. Nghỉ một chút cũng được: lần sau mở lại đường dẫn này, quý vị sẽ tiếp tục đúng chỗ.'}</p>
    ${skipped ? `<p class="small muted">Còn ${skipped} câu đã bỏ qua trong phần này. Có thể quay lại bất cứ lúc nào.</p>` : ''}
    <div style="margin-top:24px;display:grid;gap:10px">
      ${next >= 0 ? `<button class="btn" data-act="open" data-ch="${next}">Phần tiếp theo: ${esc(CHAPS[next].title)}</button>` : ''}
      <button class="btn ghost" data-act="list">Về danh sách các phần</button>
    </div>
  </div>`;
}

function openMenu() {
  const link = location.origin + location.pathname + '?vong=' + encodeURIComponent(ROUND) + '&rid=' + encodeURIComponent(S.rid);
  const el = document.createElement('div');
  el.className = 'sheet';
  el.innerHTML = `<div class="panel" role="dialog" aria-label="Tùy chọn">
    <h2>Tùy chọn</h2>
    <label class="f">Cỡ chữ</label>
    <div class="sizes">${[[0.9, 'Nhỏ'], [1, 'Vừa'], [1.15, 'Lớn'], [1.3, 'Rất lớn']].map(([v, l]) => `<button data-fs="${v}" class="${S.fs == v ? 'on' : ''}">${l}</button>`).join('')}</div>
    <label class="f">Tài liệu tham khảo</label>
    ${refList()}
    <label class="f">Tiếp tục trên máy khác</label>
    <p class="small muted" style="margin-top:0">Mở đường dẫn này trên máy khác để tiếp tục với các câu trả lời đã lưu. Xin đừng chia sẻ cho người khác.</p>
    <div class="copy">${esc(link)}</div>
    <div class="row"><button class="btn ghost" data-copy="${esc(link)}">Sao chép đường dẫn</button></div>
    <div class="row"><button class="btn ghost" data-act="welcome">Về trang đầu</button><button class="btn" data-close="1">Đóng</button></div>
  </div>`;
  document.body.appendChild(el);
  el.addEventListener('click', ev => {
    const b = ev.target.closest('button');
    if (ev.target === el || (b && b.dataset.close)) { el.remove(); return; }
    if (!b) return;
    if (b.dataset.fs) { S.fs = +b.dataset.fs; store.set('fs', S.fs); document.documentElement.style.setProperty('--fs', S.fs);
      el.querySelectorAll('[data-fs]').forEach(x => x.classList.toggle('on', x === b)); }
    if (b.dataset.copy) { navigator.clipboard && navigator.clipboard.writeText(b.dataset.copy).then(() => { b.textContent = 'Đã sao chép'; }); }
    if (b.dataset.act === 'welcome') { el.remove(); S.view = 'welcome'; render(); }
  });
}

/* ---------- navigation ---------- */
function openChapter(i) {
  S.chap = i; S.editing = null;
  const c = CHAPS[i];
  const quickLeft = c.quick.some(q => !S.answers[q.id]);
  if (c.quick.length && quickLeft) {
    S.quickFlags = {};
    c.quick.forEach(q => { const a = S.answers[q.id]; if (a && a.verdict === 'fix') S.quickFlags[q.id] = { suggestion: a.suggestion }; });
    S.view = 'quick';
  } else {
    const first = c.cards.findIndex(x => !S.answers[x.id]);
    if (first < 0 && c.cards.length && doneIn(c) === c.items.length) { S.pos = 0; S.view = 'chapdone'; }
    else { S.pos = Math.max(0, first); S.view = 'card'; }
  }
  render();
}
function nextCard() {
  const c = CHAPS[S.chap];
  S.editing = null;
  if (S.pos < c.cards.length - 1) { S.pos++; S.view = 'card'; }
  else S.view = 'chapdone';
  render();
}

document.addEventListener('click', ev => {
  const q = ev.target.closest('[data-stop]'); if (q) return;
  const b = ev.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, c = CHAPS[S.chap];
  if (act === 'start') {
    S.name = ($('#name').value || '').trim(); store.set('name', S.name);
    S.view = 'list'; render(); return;
  }
  if (act === 'menu') return openMenu();
  if (act === 'list') { S.view = 'list'; S.editing = null; render(); return; }
  if (act === 'open') return openChapter(+b.dataset.ch);
  if (act === 'en') { S.showEn = !S.showEn; store.set('showEn', S.showEn); keepInputs(); render(); return; }
  if (act === 'qflag') {
    const id = b.dataset.id; keepInputs();
    if (S.quickFlags[id]) delete S.quickFlags[id]; else S.quickFlags[id] = { suggestion: null };
    render();
    const inp = document.querySelector(`[data-q="${CSS.escape(id)}"]`); if (inp) { inp.focus(); inp.select(); }
    return;
  }
  if (act === 'qdone') {
    keepInputs();
    c.quick.forEach(i => {
      const f = S.quickFlags[i.id];
      if (f) answer(i.id, 'fix', f.suggestion != null ? f.suggestion : plain(i.vi), '');
      else answer(i.id, 'ok');
    });
    S.quickFlags = {};
    if (c.cards.length) { const first = c.cards.findIndex(x => !S.answers[x.id]); S.pos = Math.max(0, first); S.view = 'card'; }
    else S.view = 'chapdone';
    render(); return;
  }
  const it = c && c.cards[S.pos];
  if (act === 'ok') { answer(it.id, 'ok'); setTimeout(nextCard, 180); b.classList.add('sel'); return; }
  if (act === 'fix' || act === 'unsure') { S.editing = act; render(); return; }
  if (act === 'cancel') { S.editing = null; render(); return; }
  if (act === 'saveedit') {
    const sg = $('#sg'), cm = $('#cm');
    answer(it.id, S.editing, sg ? sg.value.trim() : '', cm ? cm.value.trim() : '');
    nextCard(); return;
  }
  if (act === 'final') { answer(it.id, 'comment', '', ($('#cm').value || '').trim()); S.view = 'chapdone'; render(); return; }
  if (act === 'next') return nextCard();
  if (act === 'prev') {
    if (S.pos > 0) { S.pos--; S.view = 'card'; render(); }
    else if (c.quick.length) { S.quickFlags = {}; c.quick.forEach(q => { const a = S.answers[q.id]; if (a && a.verdict === 'fix') S.quickFlags[q.id] = { suggestion: a.suggestion }; }); S.view = 'quick'; render(); }
    return;
  }
});
function keepInputs() {
  document.querySelectorAll('[data-q]').forEach(inp => { if (S.quickFlags[inp.dataset.q]) S.quickFlags[inp.dataset.q].suggestion = inp.value; });
}
document.addEventListener('keydown', ev => {
  if (ev.target.matches('input,textarea')) return;
  if (S.view === 'card' && !S.editing) {
    if (ev.key === 'ArrowRight') nextCard();
    if (ev.key === 'ArrowLeft' && S.pos > 0) { S.pos--; render(); }
  }
});

/* ---------- start ---------- */
(async function init() {
  if (!ENDPOINT) $('#demo').classList.remove('hidden');
  try {
    DATA = await (await fetch(DATA_URL, { cache: 'no-cache' })).json();
  } catch (e) {
    $('#app').innerHTML = '<div class="wrap"><p style="padding-top:40px">Không tải được nội dung. Xin kiểm tra kết nối mạng rồi tải lại trang.</p></div>';
    return;
  }
  DATA.items.push({ id: 'general:comment', ch: 'final', kind: 'final', vi: '', en: '', where: 'Lời nhắn chung', note: '', v: '' });
  DATA.items.forEach(i => ITEMS[i.id] = i);
  buildChapters();
  await pull();
  if (params.get('rid')) { history.replaceState(null, '', location.pathname + '?vong=' + ROUND); }
  S.view = S.name && Object.keys(S.answers).length ? 'list' : 'welcome';
  render();
  flush();
})();
