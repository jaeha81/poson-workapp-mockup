/* ===========================================================
   수정 요청 보내기 — 관리자 전용 (김기홍 팀장 요청 2026-08-03)

   회차 컨펌(1~4차)은 끝났습니다. 이 화면은 이제 상시 창구입니다 —
   쓰다가 고칠 곳이 나오면 관리자가 여기에 적어 개발자에게 바로 보냅니다.
   보낸 내용은 구글 시트에 쌓이고, 개발자 메일로도 전달됩니다.

   ⚠️ 실제 운영에 들어가도 이 화면은 남깁니다 (재하님 지시 2026-08-03).
      메뉴는 「관리자 전용」 묶음에 있어 일반 직원에게는 보이지 않습니다.
   =========================================================== */

/* ⬇⬇ 구글 Apps Script 웹앱 주소. 비워 두면 「보내기」 대신 복사만 됩니다.
   받는 곳 설정은 CONFIRM-수집-설정.md 를 보세요. */
const CONFIRM_ENDPOINT = 'https://script.google.com/macros/s/AKfycby0FsUwG5mB7sbTEBUJd3fjnF2igeMJVfuuIZzOq7vvmTf6p1dC5ZrJZbg-PNZS9QUPQg/exec';

/* 구글 쪽에서 "우리 앱이 보낸 것"인지 1차로 걸러내는 표시입니다.
   ⚠️ 진짜 비밀번호가 아닙니다(앱 소스에 그대로 들어갑니다). 로봇의 무작위 전송을 막는 용도입니다. */
const CONFIRM_KEY = 'poson-confirm-2026';

const FEEDBACK_LS = 'poson_feedback_v1';   /* 쓰다 만 글 · 보낸 내역을 이 브라우저에 보관 */

/* 어느 화면에 대한 요청인지 — 사이드바 메뉴와 같은 이름입니다 */
const FEEDBACK_SCREENS = [
  '오늘 업무', '내 오더', '예정 업무', '당직 일정', '경비 정산',
  '재고 현황', '입고 등록', '출고 현황', '재고 실사',
  '필드 매뉴얼', 'TIPS 매뉴얼', '이슈 공유', 'ERP 주간요약', '공휴일',
  '월 업무량 집계', '거래처 관리', '직원 · 권한', '관리자 페이지', '로그인', '화면 전체 · 그 밖'
];

const FEEDBACK_KINDS = [
  '안 됩니다 (오류)',
  '이렇게 바꿔주세요 (수정)',
  '이런 기능이 필요합니다 (추가)',
  '물어볼 것이 있습니다'
];

let FB_DRAFT = { screen: FEEDBACK_SCREENS[0], kind: FEEDBACK_KINDS[0], body: '', who: '' };
let FB_SENT  = [];    /* 보낸 내역 — { at, screen, kind, body } */
let FB_MSG   = '';    /* 전송 결과 안내문 */

/* ---------- 브라우저 보관 ---------- */
function loadFeedbackLocal(){
  try{
    const o = JSON.parse(localStorage.getItem(FEEDBACK_LS) || 'null');
    if(!o) return;
    if(o.draft) FB_DRAFT = Object.assign(FB_DRAFT, o.draft);
    if(Array.isArray(o.sent)) FB_SENT = o.sent;
  }catch(e){ /* 시크릿 모드 등에서 막히면 그냥 넘어갑니다 */ }
}
function saveFeedbackLocal(){
  try{ localStorage.setItem(FEEDBACK_LS, JSON.stringify({ draft:FB_DRAFT, sent:FB_SENT.slice(0, 20) })); }
  catch(e){}
}
loadFeedbackLocal();

/* ---------- 입력 즉시 저장 (화면을 옮겨도 쓰던 글이 남습니다) ---------- */
function setFbScreen(v){ FB_DRAFT.screen = v; saveFeedbackLocal(); }
function setFbKind(v){   FB_DRAFT.kind   = v; saveFeedbackLocal(); }
function setFbBody(v){   FB_DRAFT.body   = v; saveFeedbackLocal(); }
function setFbWho(v){    FB_DRAFT.who    = v.trim(); saveFeedbackLocal(); }

function fbWho(){
  if(FB_DRAFT.who) return FB_DRAFT.who;
  try{ const m = meObj(); return `${m.name} ${m.rank}`; }catch(e){ return ''; }
}

function fbText(){
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return [
    '포스온 업무관리 — 수정 요청',
    `작성자: ${fbWho() || '(이름 없음)'}`,
    `작성일: ${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`,
    `화면: ${FB_DRAFT.screen}`,
    `종류: ${FB_DRAFT.kind}`,
    '─'.repeat(42),
    FB_DRAFT.body || '(내용 없음)'
  ].join('\n');
}

/* ---------- 화면 ---------- */
function viewConfirm(){
  if(!isAdmin()){
    return `<div class="empty"><div class="em"><svg class="ic ic-lg"><use href="#i-lock"/></svg></div><b>관리자만 볼 수 있는 화면입니다</b>
      <p>고칠 곳이 보이시면 관리자에게 알려주세요. 관리자가 이 화면에서 개발자에게 전달합니다.</p></div>`;
  }

  return `
  <style>
    .fb-t{font-weight:600;font-size:15px;margin-bottom:4px}
    .fb-o{display:flex;flex-direction:column;gap:7px}
    .fb-o label{display:flex;align-items:flex-start;gap:8px;font-size:14px;cursor:pointer;line-height:1.5}
    .fb-o input{margin-top:3px;flex:none}
    .fb-n{width:100%;box-sizing:border-box;padding:9px 11px;border:1px solid var(--line);
          border-radius:8px;font:inherit;font-size:13.5px;resize:vertical}
    .fb-s{display:flex;gap:10px;padding:11px 0;border-top:1px solid var(--line);font-size:13px;line-height:1.6}
    .fb-s:first-child{border-top:0}
    .fb-sk{flex:none;align-self:flex-start;font-size:11px;font-weight:700;color:var(--navy);
           border:1px solid var(--navy-line);background:var(--navy-50);border-radius:999px;padding:2px 8px}
    .fb-sb{white-space:pre-wrap}
    .fb-sb i{display:block;font-style:normal;color:var(--t3);font-size:12px;margin-top:2px}
  </style>

  <div class="mprog">
    <div class="r"><b>수정 요청 보내기</b><span class="pc">개발자에게 전달</span></div>
    <div style="font-size:12px;color:var(--t3)">
      쓰시다가 <b>안 되는 것 · 고쳤으면 하는 것</b>이 있으면 여기에 적어주세요. 개발자에게 바로 전달됩니다.
      적는 즉시 이 브라우저에 저장되니 중간에 닫으셔도 글이 남습니다.
      급한 것은 보내신 뒤 전화로 한 번 더 알려주시면 빠릅니다.
    </div>
  </div>

  <div class="panel" style="margin-top:10px">
    <div class="grid2">
      <div class="f"><label>어느 화면입니까</label>
        <select id="fbScreen" onchange="setFbScreen(this.value)">
          ${FEEDBACK_SCREENS.map(s => `<option ${FB_DRAFT.screen === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}
        </select></div>
      <div class="f"><label>작성자</label>
        <input type="text" id="fbWho" value="${esc(fbWho())}" placeholder="이름 · 직함" oninput="setFbWho(this.value)"></div>
    </div>

    <div class="f"><label>어떤 요청입니까</label>
      <div class="fb-o">${FEEDBACK_KINDS.map(k => `
        <label><input type="radio" name="fbKind" value="${esc(k)}"
          onchange="setFbKind(this.value)" ${FB_DRAFT.kind === k ? 'checked' : ''}>${esc(k)}</label>`).join('')}</div></div>

    <div class="f"><label>내용</label>
      <textarea id="fbBody" class="fb-n" rows="7" oninput="setFbBody(this.value)"
        placeholder="예) 경비 정산에서 7월 주당직이 두 번 나옵니다. 김OO 씨가 7/3~7/9 한 주기만 섰는데 두 줄로 보입니다."
      >${esc(FB_DRAFT.body)}</textarea>
      <p style="font-size:12px;color:var(--t3);margin:6px 0 0">
        <b>무엇을 · 어디서 · 어떻게 하면 그렇게 되는지</b> 세 가지만 적어주시면 고치기 쉽습니다.</p></div>

    <div class="formbtns" style="margin-top:0">
      ${CONFIRM_ENDPOINT ? `<button class="btn pri" onclick="sendFeedback(this)">보내기</button>` : ''}
      <button class="btn ${CONFIRM_ENDPOINT ? '' : 'pri'}" onclick="copyFeedback()">복사하기</button>
      ${FB_DRAFT.body ? `<button class="btn" onclick="clearFeedback()">지우기</button>` : ''}
      ${FB_MSG ? `<span style="font-size:12.5px;margin-left:6px">${esc(FB_MSG)}</span>` : ''}
    </div>
    <p style="font-size:12px;color:var(--t3);margin-top:8px">
      보내기가 안 되면 「복사하기」로 카카오톡·메일에 붙여넣어 주셔도 그대로 반영됩니다.</p>
  </div>

  ${FB_SENT.length ? `
  <div class="panel" style="margin-top:10px">
    <h4>보낸 내역 <span style="color:var(--t3);font-weight:500">— 이 브라우저에 남은 최근 ${FB_SENT.length}건</span></h4>
    ${FB_SENT.map(s => `
      <div class="fb-s">
        <span class="fb-sk">${esc(s.screen)}</span>
        <div class="fb-sb">${esc(s.body)}<i>${esc(s.kind)} · ${esc(s.at)}</i></div>
      </div>`).join('')}
  </div>` : ''}`;
}

/* ---------- 동작 ---------- */
function collectFeedback(){
  const b = document.getElementById('fbBody');  if(b) FB_DRAFT.body   = b.value.trim();
  const w = document.getElementById('fbWho');   if(w) FB_DRAFT.who    = w.value.trim();
  const s = document.getElementById('fbScreen');if(s) FB_DRAFT.screen = s.value;
  const k = document.querySelector('input[name="fbKind"]:checked');
  if(k) FB_DRAFT.kind = k.value;
  saveFeedbackLocal();
}

function clearFeedback(){
  FB_DRAFT.body = ''; FB_MSG = '';
  saveFeedbackLocal(); render(); toast('지웠습니다');
}

/* 구글 시트로 전송 — 시트에 쌓이고 15분마다 개발자 메일로 묶여 나갑니다.
   ⛔ no-cors 로 보내면 안 됩니다. 서버가 403·500 을 줘도 성공으로 보여서
      "보냈습니다" 라고 거짓 안내를 하게 됩니다. 응답을 실제로 읽어 확인합니다. */
function sendFeedback(btn){
  if(!CONFIRM_ENDPOINT) return;
  collectFeedback();
  if(!FB_DRAFT.body){ toast('내용을 적어주세요'); return; }

  const back = () => { if(btn){ btn.disabled = false; btn.textContent = '보내기'; } };
  if(btn){ btn.disabled = true; btn.textContent = '보내는 중…'; }

  fetch(CONFIRM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ key: CONFIRM_KEY, who: fbWho(), at: new Date().toISOString(),
                           answers: { screen: FB_DRAFT.screen, kind: FB_DRAFT.kind, body: FB_DRAFT.body },
                           text: fbText() })
  })
  .then(r => { if(!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
  .then(t => {
    if(String(t).indexOf('ok') === -1) throw new Error('응답 확인 실패');
    const d = new Date(), p = n => String(n).padStart(2, '0');
    FB_SENT.unshift({ at: `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`,
                      screen: FB_DRAFT.screen, kind: FB_DRAFT.kind, body: FB_DRAFT.body });
    FB_SENT = FB_SENT.slice(0, 20);
    FB_DRAFT.body = '';
    FB_MSG = '✓ 보냈습니다. 확인 후 연락드리겠습니다.';
    saveFeedbackLocal();
    toast('보냈습니다 — 감사합니다'); render();
  })
  .catch(() => {
    back();
    FB_MSG = '✕ 전송이 확인되지 않았습니다 — 「복사하기」로 보내주세요.';
    toast('전송 실패 — 복사해서 보내주세요'); render();
  });
}

function copyFeedback(){
  collectFeedback();
  const t = fbText();
  const ok = () => toast('복사했습니다 — 카톡·메일에 붙여넣으세요');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(ok, () => copyFallback(t, ok));
  } else copyFallback(t, ok);
}
function copyFallback(t, ok){
  const ta = document.createElement('textarea');
  ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  /* execCommand 는 실패해도 예외 없이 false 만 돌려줍니다 — 반환값까지 봐야 합니다 */
  let done = false;
  try { done = document.execCommand('copy') === true; } catch(e){ done = false; }
  document.body.removeChild(ta);
  if(done) ok();
  else toast('복사가 막혀 있습니다 — 위 내용을 직접 드래그해 복사해주세요');
}
