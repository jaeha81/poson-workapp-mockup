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
  '월 업무량 집계', '거래처 관리', '직원 · 권한', '관리자 페이지', '로그인',
  '실서버 세팅', '화면 전체 · 그 밖'
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

/* ===========================================================
   실서버 세팅 — 팀장님께 여쭙는 것 (2026-08-03 신설)

   지금 이 앱은 「보여드리는 견본(목업)」입니다. 적으신 내용은 이 컴퓨터 안에만 남고
   회사 서버에 쌓이지 않습니다. 실제로 업무에 쓰려면 자료가 쌓일 곳을 따로 만들어야 합니다.

   ⛔ 여기서는 「할지 말지 · 누구 이름으로 · 언제」 만 정합니다.
      실제 가입 화면은 목업에 넣지 않았습니다 → setup-실앱용.js (실서버 앱에서 씁니다)
      견본을 보시다가 실수로 진짜 회사 계정이 만들어지는 것을 막기 위해서입니다.
   =========================================================== */
const SETUPQ_LS = 'poson_setupq_v1';

const SETUP_Q = [
  { k: 'owner', t: '계정을 누구 이름으로 만들까요',
    d: `앱을 24시간 띄워둘 곳(Vercel)과 자료가 쌓일 곳(Supabase), 두 곳에 가입해야 합니다.`,
    o: ['포스온 회사 이메일로 만든다', '팀장님 개인 계정으로 만든다', '아직 못 정했습니다'],
    warn: `⛔ 개발자 개인 계정으로 만들면 안 됩니다. 나중에 회사로 넘기려면 결제수단부터 다시 넣어야 하고,
           넘기는 동안 앱이 멈출 수 있습니다. <b>처음부터 포스온 이름으로 만들고 개발자는 초대만 받는 것</b>이
           안전합니다. 그러면 열쇠(비밀번호·키)를 주고받을 일도 없습니다.` },

  { k: 'mail', t: '가입에 쓸 회사 이메일 주소', kind: 'text', ph: '예) admin@poson.co.kr',
    d: `이 주소로 가입 확인 메일과 요금 청구서가 갑니다.
        담당자가 바뀌어도 계속 쓰는 주소가 좋습니다 (개인 지메일 말고 회사 주소).` },

  { k: 'cost', t: '월 이용료를 승인해 주시겠습니까',
    d: `앱 도는 곳 약 <b>2.8만원</b> + 자료 쌓이는 곳 약 <b>3.5만원</b> = <b>월 6~7만원</b>
        (달러 결제라 환율에 따라 조금 달라집니다). 회사 카드로 매달 자동 결제됩니다.`,
    o: ['승인합니다', '금액을 다시 상의하고 싶습니다', '무료로 먼저 써보고 정하겠습니다'],
    warn: `⚠️ 무료로는 회사 업무에 쓸 수 없습니다. 앱 쪽 무료 요금제는 <b>회사 업무용 사용이 규정상 금지</b>이고,
           자료 쪽 무료는 <b>일주일 안 쓰면 멈추고 용량이 500MB뿐</b>이라 현장 사진이 몇 달 치도 안 들어갑니다.` },

  { k: 'when', t: '언제 시작할까요',
    d: `계정이 만들어지면 개발자가 표 만들기 · 앱 올리기 · 주소 연결까지 <b>3~4주</b> 걸립니다.
        그동안 지금 쓰시던 방식은 그대로 두고, 다 되면 2주쯤 같이 써보고 넘어갑니다.`,
    o: ['이번 달에 시작', '다음 달에 시작', '당분간 견본으로만 보겠습니다'] },

  { k: 'domain', t: '접속 주소는 무엇으로 할까요',
    d: `직원들이 주소창에 칠 주소입니다. 회사 홈페이지 주소를 관리하는 곳에 한 줄만 추가하면 됩니다.`,
    o: ['work.poson.co.kr 로 합니다', '다른 주소로 하고 싶습니다 (아래 적어주세요)', '개발자가 정해주세요'] }
];

let SQ = { ans: {}, note: '', sent: '' };
try{ const o = JSON.parse(localStorage.getItem(SETUPQ_LS) || 'null'); if(o) SQ = Object.assign(SQ, o); }catch(e){}
function saveSQ(){ try{ localStorage.setItem(SETUPQ_LS, JSON.stringify(SQ)); }catch(e){} }

function setSQ(k, v){ SQ.ans[k] = v; saveSQ(); }
function setSQNote(v){ SQ.note = v; saveSQ(); }

function sqDone(){ return SETUP_Q.filter(q => SQ.ans[q.k]).length; }

function sqText(){
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return [
    '포스온 업무관리 — 실서버 세팅 컨펌',
    `작성자: ${fbWho() || '(이름 없음)'}`,
    `작성일: ${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`,
    '─'.repeat(42),
    ...SETUP_Q.map((q, i) => `${i + 1}. ${q.t}\n   → ${SQ.ans[q.k] || '(답 없음)'}`),
    '─'.repeat(42),
    '남기신 말씀: ' + (SQ.note || '(없음)')
  ].join('\n');
}

function sendSetupQ(btn){
  const body = document.getElementById('sqNote');
  if(body){ SQ.note = body.value.trim(); saveSQ(); }
  if(!sqDone()){ toast('한 가지라도 골라주세요'); return; }
  if(!CONFIRM_ENDPOINT){ copySetupQ(); return; }

  const back = () => { if(btn){ btn.disabled = false; btn.textContent = '개발자에게 보내기'; } };
  if(btn){ btn.disabled = true; btn.textContent = '보내는 중…'; }

  fetch(CONFIRM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ key: CONFIRM_KEY, who: fbWho(), at: new Date().toISOString(),
                           answers: { screen: '실서버 세팅', kind: '세팅 컨펌', body: sqText() },
                           text: sqText() })
  })
  .then(r => { if(!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
  .then(t => {
    if(String(t).indexOf('ok') === -1) throw new Error('응답 확인 실패');
    const d = new Date(), p = n => String(n).padStart(2, '0');
    SQ.sent = `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    saveSQ(); toast('보냈습니다 — 확인하고 연락드리겠습니다'); render();
  })
  .catch(() => { back(); copySetupQ(); toast('전송이 막혀 복사했습니다 — 메일·카톡에 붙여넣어 주세요'); });
}

function copySetupQ(){
  const body = document.getElementById('sqNote');
  if(body){ SQ.note = body.value.trim(); saveSQ(); }
  const t = sqText(), ok = () => toast('복사했습니다 — 카톡·메일에 붙여넣으세요');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(ok, () => copyFallback(t, ok));
  } else copyFallback(t, ok);
}

function setupQPanel(){
  const done = sqDone(), all = SETUP_Q.length;

  const box = (q, i) => {
    const picked = SQ.ans[q.k] || '';
    const input = q.kind === 'text'
      ? `<input type="text" class="sq-in" value="${esc(picked)}" placeholder="${esc(q.ph || '')}"
           oninput="setSQ('${q.k}', this.value)">`
      : `<div class="fb-o">${q.o.map(v => `
          <label><input type="radio" name="sq-${q.k}" ${picked === v ? 'checked' : ''}
            onchange="setSQ('${q.k}', this.value)" value="${esc(v)}">${esc(v)}</label>`).join('')}</div>`;

    return `
    <div class="sq-q ${picked ? 'on' : ''}">
      <div class="sq-h"><span class="sq-n">${i + 1}</span><b>${esc(q.t)}</b></div>
      <div class="sq-d">${q.d}</div>
      ${q.warn ? `<div class="note w sq-w">${q.warn}</div>` : ''}
      ${input}
    </div>`;
  };

  return `
  <style>
    .sq-q{border:1px solid var(--line);border-left:3px solid var(--line);border-radius:10px;
          padding:13px 15px;margin-top:10px;background:var(--card)}
    .sq-q.on{border-left-color:var(--green,#2e9e5b)}
    .sq-h{display:flex;align-items:center;gap:9px;font-size:15px}
    .sq-n{flex:none;width:22px;height:22px;border-radius:50%;background:var(--navy-50);color:var(--navy);
          font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center}
    .sq-d{font-size:13.5px;color:var(--t2);line-height:1.65;margin:8px 0 10px}
    .sq-w{margin-bottom:10px;font-size:13px;line-height:1.6}
    .sq-in{width:100%;box-sizing:border-box;padding:9px 11px;border:1px solid var(--line);
           border-radius:8px;font:inherit;font-size:13.5px}
  </style>

  <div class="mprog">
    <div class="r"><b>실서버 세팅 — 정해주셔야 할 것</b><span class="pc">${done}/${all} 답함</span></div>
    <div style="font-size:12px;color:var(--t3)">
      지금 보고 계신 것은 <b>견본</b>입니다. 적으신 내용은 이 컴퓨터에만 남고 회사 서버에 쌓이지 않습니다.
      실제 업무에 쓰려면 자료가 쌓일 곳을 따로 마련해야 합니다 — 아래 다섯 가지만 정해주시면
      나머지는 개발자가 합니다. <b>지금 여기서 가입하실 것은 없습니다.</b>
    </div>
  </div>

  <div class="panel" style="margin-top:10px">
    ${SETUP_Q.map(box).join('')}

    <div class="f" style="margin-top:14px"><label>더 하실 말씀 (선택)</label>
      <textarea id="sqNote" class="fb-n" rows="3" oninput="setSQNote(this.value)"
        placeholder="예) 회사 카드는 경리팀을 거쳐야 해서 다음 주에 답 드리겠습니다."
      >${esc(SQ.note)}</textarea></div>

    <div class="formbtns" style="margin-top:0">
      <button class="btn pri" onclick="sendSetupQ(this)">개발자에게 보내기</button>
      <button class="btn" onclick="copySetupQ()">복사하기</button>
      ${SQ.sent ? `<span style="font-size:12.5px;margin-left:6px">✓ ${esc(SQ.sent)} 에 보냈습니다</span>` : ''}
    </div>
  </div>`;
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

  ${(SQ.sent && sqDone() === SETUP_Q.length)
    ? `<div class="mprog"><div class="r"><b>실서버 세팅 — 답해 주셔서 감사합니다</b>
         <span class="pc">${esc(SQ.sent)} 보냄</span></div>
       <div style="font-size:12px;color:var(--t3)">
         ${esc(SQ.ans.owner || '')} · ${esc(SQ.ans.when || '')} · ${esc(SQ.ans.cost || '')}
         <button class="btn" style="margin-left:8px;padding:2px 9px;font-size:12px"
           onclick="SQ.sent='';saveSQ();render()">다시 답하기</button></div></div>`
    : setupQPanel()}

  <div class="mprog" style="margin-top:10px">
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
