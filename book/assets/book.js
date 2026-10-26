/* AI, 일의 문법을 바꾸다 — ebook runtime (no dependencies) */

const BOOK = {
  title: 'AI, 일의 문법을 바꾸다',
  parts: [
    { label: '들어가며', chapters: [
      { id: 'preface', file: 'preface.html', short: '·', long: '서문', title: '왜 지금 이 책인가', ready: true },
    ]},
    { label: '1부', title: '지금, 최전선', chapters: [
      { n: 1, title: '2026년 가을, AI는 어디에 와 있나', ready: true },
      { n: 2, title: '프런티어 3강', ready: true },
      { n: 3, title: '오픈 웨이트, 중국, 그리고 한국의 모델', ready: true },
      { n: 4, title: 'MCP와 에이전트 생태계', ready: true },
      { n: 5, title: '보고 듣고 말하는 AI', ready: true },
    ]},
    { label: '2부', title: '원리 — 기술은 어떻게 발전하는가', chapters: [
      { n: 6, title: '언어 모델은 어떻게 작동하나', ready: true },
      { n: 7, title: '세 개의 스케일링 법칙', ready: true },
      { n: 8, title: '생각하는 기계', ready: true },
      { n: 9, title: '효율의 기술', ready: true },
      { n: 10, title: '데이터, 평가, 안전', ready: true },
    ]},
    { label: '3부', title: '기반 — 무엇이 떠받치나', chapters: [
      { n: 11, title: '연산의 경제학', ready: true },
      { n: 12, title: '화면 밖으로', ready: true },
    ]},
    { label: '4부', title: '실전 — 우리는 무엇을 할까', chapters: [
      { n: 13, title: '일하는 방식의 변화', ready: true },
      { n: 14, title: '산업별 적용 지도', ready: true },
      { n: 15, title: '규제와 리스크', ready: true },
      { n: 16, title: '조직의 AI 전환 플레이북', ready: true },
    ]},
    { label: '나가며', chapters: [
      { id: 'epilogue', file: 'epilogue.html', short: '·', long: '맺음말', title: '앞으로 1~3년, 무엇을 지켜볼 것인가', ready: true },
      { id: 'appendix-a', file: 'appendix-a.html', short: 'A', long: '부록 A', title: '2025~2026 주요 모델 출시 연표', ready: true },
      { id: 'appendix-b', file: 'appendix-b.html', short: 'B', long: '부록 B', title: '업무별 모델 선택 치트시트', ready: true },
      { id: 'glossary', file: 'glossary.html', short: 'C', long: '부록 C', title: '용어집', ready: true },
      { id: 'references', file: 'references.html', short: '·', long: '참고문헌', title: '참고문헌', ready: true },
    ]},
  ],
};

const allChapters = BOOK.parts.flatMap(p => p.chapters);
for (const ch of allChapters) {
  ch.id ??= String(ch.n);
  ch.file ??= `ch${String(ch.n).padStart(2, '0')}.html`;
  ch.short ??= String(ch.n);
  ch.long ??= `${ch.n}장`;
}
const current = document.body.dataset.chapter || '';
const partHeading = part => part.title ? `${part.label} · ${part.title}` : part.label;

/* ---------- Theme ---------- */

const THEMES = ['light', 'sepia', 'dark'];
function store(key, value) {
  try { return value === undefined ? localStorage.getItem(key) : localStorage.setItem(key, value); }
  catch { return null; }
}
function applyTheme(t) {
  if (t === 'light') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}
let theme = store('book-theme') ||
  (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(theme);

document.querySelector('.theme-btn')?.addEventListener('click', () => {
  theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  applyTheme(theme);
  store('book-theme', theme);
});

/* ---------- Section ids ---------- */

const sections = [...document.querySelectorAll('.chapter h2')];
sections.forEach((h, i) => { if (!h.id) h.id = `s${i + 1}`; });

/* ---------- Sidebar ---------- */

const sidebar = document.getElementById('sidebar');
if (sidebar) {
  let html = `<a class="side-book" href="index.html">${BOOK.title}</a>`;
  for (const part of BOOK.parts) {
    html += `<div class="side-part">${partHeading(part)}</div><ol>`;
    for (const ch of part.chapters) {
      const inner = `<span class="n">${ch.short}</span><span>${ch.title}</span>`;
      const isCur = ch.id === current;
      html += `<li class="side-ch${isCur ? ' current' : ''}">` +
        (ch.ready ? `<a href="${ch.file}">${inner}</a>` : `<span title="집필 예정">${inner}</span>`);
      if (isCur && sections.length) {
        html += '<div class="side-sec">' + sections.map(h => {
          const label = h.querySelector('.t')?.textContent || h.textContent;
          return `<a href="#${h.id}">${label}</a>`;
        }).join('') + '</div>';
      }
      html += '</li>';
    }
    html += '</ol>';
  }
  sidebar.innerHTML = html;
}

const scrim = document.querySelector('.scrim');
const menuBtn = document.querySelector('.menu-btn');
function setMenu(open) {
  sidebar?.classList.toggle('open', open);
  scrim?.classList.toggle('show', open);
  menuBtn?.setAttribute('aria-expanded', String(open));
}
menuBtn?.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
scrim?.addEventListener('click', () => setMenu(false));
sidebar?.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ---------- Scroll spy & progress ---------- */

const secLinks = sidebar ? [...sidebar.querySelectorAll('.side-sec a')] : [];
const bar = document.querySelector('.progress span');
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  if (bar) bar.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + '%';
  if (!secLinks.length) return;
  let active = -1;
  sections.forEach((h, i) => { if (h.getBoundingClientRect().top < innerHeight * 0.3) active = i; });
  secLinks.forEach((a, i) => a.classList.toggle('active', i === active));
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ---------- Footnote previews ---------- */

document.querySelectorAll('sup.fn a').forEach(a => {
  const note = document.querySelector(a.getAttribute('href'));
  if (note) a.title = note.textContent.replace('↩', '').trim();
});

/* ---------- Prev / next ---------- */

const nav = document.getElementById('chapter-nav');
if (nav && current) {
  const ready = allChapters.filter(c => c.ready);
  const i = ready.findIndex(c => c.id === current);
  const prev = ready[i - 1], next = ready[i + 1];
  const link = (c, cls, dir) => `<a class="${cls}" href="${c.file}"><span class="dir">${dir}</span>${c.long} ${c.title}</a>`;
  nav.innerHTML =
    (prev ? link(prev, 'prev', '이전') : `<a class="prev" href="index.html"><span class="dir">처음으로</span>표지와 차례</a>`) +
    (next ? link(next, 'next', '다음') : '');
}

/* ---------- Book TOC (index page) ---------- */

const toc = document.getElementById('book-toc');
if (toc) {
  toc.innerHTML = BOOK.parts.map(part =>
    `<div class="toc-part">${part.label}${part.title ? `<b>${part.title}</b>` : ''}</div><ol>` +
    part.chapters.map(ch => {
      const inner = `<span class="n">${ch.long}</span><span>${ch.title}</span><span class="st">${ch.ready ? '읽기' : '집필 예정'}</span>`;
      return ch.ready
        ? `<li class="ready"><a href="${ch.file}">${inner}</a></li>`
        : `<li><span>${inner}</span></li>`;
    }).join('') + '</ol>'
  ).join('');
}
