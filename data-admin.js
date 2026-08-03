/* ===========================================================
   관리자 페이지 — 관리자(팀장)만 들어옵니다

   1. 컨펌 체크리스트   … 개발자에게 수정 요청 보내기 (data-confirm.js)
   2. 앱 관리
      · 가이드북       … 실무자 가이드북을 앱 안에서 읽고 인쇄

   ⛔ 일반 직원에게는 이 메뉴가 아예 보이지 않습니다 (renderWho 에서 감춥니다).
   ⛔ 세팅 경로(Vercel·Supabase 가입 8단계)는 목업에서 뺐습니다 → setup-실앱용.js
      목업은 시연용이라 여기서 진짜 계정을 만들면 안 됩니다. 목업에서는
      「컨펌 체크리스트 › 실서버 세팅」 으로 할지 말지만 여쭙니다.
   =========================================================== */

const ADMIN_TABS = [
  { k: 'confirm', g: '',        l: '컨펌 체크리스트' },
  { k: 'guide',   g: '앱 관리', l: '가이드북' }
];

/* ---------- 공통 도구 ---------- */
function copyText(s, msg){
  const done = () => toast(msg || '복사했습니다');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(s).then(done, () => fallbackCopy(s, done));
  } else fallbackCopy(s, done);
}
function fallbackCopy(s, done){
  const t = document.createElement('textarea');
  t.value = s; t.style.position = 'fixed'; t.style.opacity = '0';
  document.body.appendChild(t); t.select();
  try{ document.execCommand('copy'); done(); }catch(e){ toast('복사가 막혔습니다 — 직접 긁어서 복사해주세요'); }
  document.body.removeChild(t);
}
function openLink(url){ window.open(url, '_blank', 'noopener'); }
function setAdminTab(k){ cur.atab = k; render(); }

/* ===========================================================
   가이드북 — 실무자 가이드북을 앱 안에서
   ⚠️ 본문은 index.html 의 <script type="text/markdown" id="guideMd"> 에 들어 있습니다.
      같은 내용이 실무자-가이드북.md 파일에도 있습니다 — 고칠 때 두 곳을 함께 고치세요.
   =========================================================== */
function guideSource(){
  const el = document.getElementById('guideMd');
  return el ? el.textContent : '';
}

/* 아주 작은 마크다운 → 화면 변환기 (제목·표·목록·굵게·코드만) */
function mdToHtml(md){
  const e = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inl = s => e(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  const L = md.split('\n');
  const out = [];
  let i = 0;
  while(i < L.length){
    const s = L[i];

    if(/^```/.test(s)){                              /* 코드 덩어리 */
      const buf = []; i++;
      while(i < L.length && !/^```/.test(L[i])) buf.push(L[i++]);
      i++; out.push(`<pre class="gd-code">${e(buf.join('\n'))}</pre>`); continue;
    }
    if(/^>/.test(s)){                                /* 인용 */
      const buf = [];
      while(i < L.length && /^>/.test(L[i])) buf.push(L[i++].replace(/^>\s?/, ''));
      out.push(`<div class="gd-q">${mdToHtml(buf.join('\n'))}</div>`); continue;
    }
    if(/^\|/.test(s) && /^\|[\s\-:|]+\|$/.test(L[i + 1] || '')){   /* 표 */
      const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(s); i += 2;
      const rows = [];
      while(i < L.length && /^\|/.test(L[i])) rows.push(cells(L[i++]));
      out.push(`<div class="tabwrap"><table class="ktab gd-t">
        <tr>${head.map(h => `<th>${inl(h)}</th>`).join('')}</tr>
        ${rows.map(r => `<tr>${r.map(c => `<td>${inl(c)}</td>`).join('')}</tr>`).join('')}
      </table></div>`); continue;
    }
    const h = s.match(/^(#{1,4})\s+(.*)$/);
    if(h){
      const n = h[1].length;
      const id = 'gh' + out.length;
      out.push(`<h${n + 1} class="gd-h gd-h${n}" id="${id}">${inl(h[2])}</h${n + 1}>`); i++; continue;
    }
    if(/^(-{3,}|\*{3,})\s*$/.test(s)){ out.push('<hr class="gd-hr">'); i++; continue; }
    if(/^\s*[-*]\s+/.test(s)){                       /* 글머리 목록 */
      const buf = [];
      while(i < L.length && /^\s*[-*]\s+/.test(L[i])){
        let t = L[i++].replace(/^\s*[-*]\s+/, '');
        t = t.replace(/^\[\s\]\s*/, '☐ ').replace(/^\[x\]\s*/i, '☑ ');
        buf.push(`<li>${inl(t)}</li>`);
      }
      out.push(`<ul class="gd-ul">${buf.join('')}</ul>`); continue;
    }
    if(/^\s*\d+\.\s+/.test(s)){                      /* 번호 목록 */
      const buf = [];
      while(i < L.length && /^\s*\d+\.\s+/.test(L[i]))
        buf.push(`<li>${inl(L[i++].replace(/^\s*\d+\.\s+/, ''))}</li>`);
      out.push(`<ol class="gd-ol">${buf.join('')}</ol>`); continue;
    }
    if(!s.trim()){ i++; continue; }
    const buf = [];                                  /* 문단 */
    while(i < L.length && L[i].trim() && !/^(#{1,4}\s|\||>|```|-{3,}|\s*[-*]\s|\s*\d+\.\s)/.test(L[i]))
      buf.push(L[i++]);
    out.push(`<p class="gd-p">${inl(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}

function downloadGuide(){
  const md = guideSource();
  if(!md){ toast('가이드북 내용을 찾지 못했습니다'); return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
  a.download = '포스온-실무자-가이드북.md';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  toast('가이드북 파일을 내려받았습니다');
}

function adminGuide(){
  const md = guideSource();
  if(!md) return `<div class="empty"><b>가이드북 내용을 찾지 못했습니다</b>
    <p>index.html 의 guideMd 블록이 지워졌는지 확인해주세요.</p></div>`;

  const q = (cur.gq || '').trim();
  /* 검색하면 그 말이 들어간 줄만 모아 보여줍니다 (어느 장인지 함께) */
  if(q){
    const L = md.split('\n');
    let sec = '';
    const hit = [];
    L.forEach(line => {
      const h = line.match(/^#{1,3}\s+(.*)$/);
      if(h) sec = h[1];
      else if(line.includes(q) && line.trim()) hit.push({ sec, line });
    });
    return guideHead(q) + (hit.length
      ? `<div class="panel">${hit.slice(0, 80).map(x => `
          <div class="gd-hit"><span class="gd-hs">${esc(x.sec)}</span>
            <div>${mdToHtml(x.line)}</div></div>`).join('')}
         ${hit.length > 80 ? `<p class="st-s">…앞 80줄만 보여드립니다. 더 좁혀서 찾아보세요.</p>` : ''}</div>`
      : `<div class="empty"><b>"${esc(q)}" 를 찾지 못했습니다</b><p>다른 낱말로 찾아보세요.</p></div>`);
  }

  /* 목차 — 큰 제목만. 책 제목과 「목차」 줄은 빼되, 본문에서 세는 자리는 그대로 둡니다 */
  const toc = md.split('\n').filter(l => /^#{1,2}\s/.test(l))
                .map((l, i) => ({ i, t: l.replace(/^#{1,2}\s+/, '') }))
                .filter(x => x.i > 0 && x.t !== '목차');

  return guideHead('') + `
  <div class="panel gd-toc">
    <h4>목차</h4>
    <div class="gd-tl">${toc.map(x =>
      `<button class="gd-tb" onclick="document.querySelectorAll('.gd-h1,.gd-h2')[${x.i}]?.scrollIntoView({behavior:'smooth'})">${esc(x.t)}</button>`
    ).join('')}</div>
  </div>
  <div class="panel gd-body">${mdToHtml(md)}</div>`;
}

function guideHead(q){
  return `
  <div class="mprog">
    <div class="r"><b>실무자 가이드북</b><span class="pc">직원에게 그대로 나눠주셔도 됩니다</span></div>
    <div style="font-size:12px;color:var(--t3)">
      앱 사용법 전부가 들어 있습니다. 신입에게는 <b>2장(하루 업무 흐름)</b>만 보여주셔도 하루가 돌아갑니다.
    </div>
  </div>
  <div class="stockbar">
    <div class="msearch" style="margin:0;flex:1;min-width:180px">
      <svg class="ic"><use href="#i-search"/></svg>
      <input value="${esc(q)}" placeholder="가이드북 안에서 찾기 (예: 반납, 당직, 실사)"
             oninput="cur.gq=this.value" onkeydown="if(event.key==='Enter')render()">
    </div>
    ${q ? `<button class="btn" onclick="cur.gq='';render()">지우기</button>` : ''}
    <button class="btn" onclick="window.print()">인쇄 · PDF</button>
    <button class="btn" onclick="downloadGuide()">파일로 내려받기</button>
  </div>`;
}

/* ===========================================================
   관리자 페이지 껍데기
   =========================================================== */
function viewAdmin(){
  if(!isAdmin()){
    return `<div class="empty"><div class="em"><svg class="ic ic-lg"><use href="#i-lock"/></svg></div>
      <b>관리자만 볼 수 있는 화면입니다</b>
      <p>고칠 곳이 보이시면 관리자에게 알려주세요.</p></div>`;
  }
  const tab = cur.atab || 'confirm';
  const body = tab === 'guide' ? adminGuide()
             : (typeof viewConfirm === 'function' ? viewConfirm()
                : '<div class="empty"><b>컨펌 화면을 불러오지 못했습니다</b></div>');

  let lastG = null;
  const tabs = ADMIN_TABS.map(t => {
    const gl = (t.g && t.g !== lastG) ? `<span class="ad-g">${t.g}</span>` : '';
    lastG = t.g;
    return gl + `<button class="tab ${tab === t.k ? 'on' : ''}" onclick="setAdminTab('${t.k}')">${t.l}</button>`;
  }).join('');

  return `
  <style>
    .ad-tabs{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px}
    .ad-g{font-size:11px;font-weight:700;color:var(--t3);padding-left:8px;border-left:1px solid var(--line)}
    .gd-body{line-height:1.75}
    .gd-h{margin:22px 0 10px;line-height:1.4}
    .gd-h1{font-size:20px;border-bottom:2px solid var(--navy);padding-bottom:7px}
    .gd-h2{font-size:17px;color:var(--navy);border-bottom:1px solid var(--line);padding-bottom:5px}
    .gd-h3{font-size:15px}
    .gd-h4{font-size:13.5px;color:var(--t2)}
    .gd-p{font-size:14px;color:var(--t1);margin:9px 0}
    .gd-ul,.gd-ol{margin:9px 0 9px 20px;font-size:14px}
    .gd-ul li,.gd-ol li{margin:4px 0;line-height:1.7}
    .gd-q{border-left:3px solid var(--navy-line);background:var(--navy-50);border-radius:0 8px 8px 0;
          padding:10px 14px;margin:12px 0}
    .gd-q .gd-p{margin:5px 0}
    .gd-hr{border:0;border-top:1px solid var(--line);margin:20px 0}
    .gd-code{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:12px;
             font-family:ui-monospace,monospace;font-size:12px;line-height:1.7;overflow:auto;white-space:pre}
    .gd-t{font-size:13px}
    .gd-t td{vertical-align:top}
    .gd-tl{display:flex;flex-wrap:wrap;gap:7px}
    .gd-tb{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:5px 11px;
           font:inherit;font-size:12.5px;cursor:pointer;color:var(--t2)}
    .gd-tb:hover{border-color:var(--navy);color:var(--navy)}
    .gd-hit{padding:9px 0;border-top:1px solid var(--line)}
    .gd-hit:first-child{border-top:0}
    .gd-hs{font-size:11px;font-weight:700;color:var(--navy);background:var(--navy-50);
           border:1px solid var(--navy-line);border-radius:999px;padding:2px 8px;display:inline-block;margin-bottom:4px}
    .gd-hit .gd-p{margin:2px 0}
    @media print{ .ad-tabs,.stockbar,.gd-toc{display:none!important} }
  </style>

  <div class="ad-tabs">${tabs}</div>
  ${body}`;
}
