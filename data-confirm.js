/* ===========================================================
   컨펌 체크리스트 — ⚠️ 임시 화면입니다. 컨펌이 끝나면 통째로 지웁니다.

   지우는 법 (3곳):
     ① 이 파일 삭제
     ② index.html — <script src="data-confirm.js"></script> 한 줄
     ③ index.html — 사이드바 <a data-view="confirm"> 와 그 위 nav-label 두 줄
     ④ index.html — render() 의 else if(cur.view==='confirm') 한 줄
   =========================================================== */

/* sec 만 있으면 구분 제목, id 가 있으면 질문입니다.
   opts 가 비어 있으면 자유 입력만 받습니다. */
const CONFIRM_ITEMS = [
  { sec:'1. 넣어둔 값이 맞습니까', desc:'아래 값들은 개발자가 임의로 넣었거나 추정한 것입니다. 실제와 다르면 알려주세요.' },

  { id:'rate', q:'당직 단가가 이 값이 맞습니까?',
    sub:'지금 화면 적용값 — 야간당직 15,000원/일 · 주말당직 30,000원/일 · AS 방문 50,000원/건',
    opts:['맞습니다', '다릅니다 (실제 단가를 아래에 적어주세요)', '아직 정해지지 않았습니다'] },

  { id:'aug', q:'8월 당직 순번이 맞습니까?',
    sub:'7월 규칙(금~일 선 사람이 다음 주 월~목)으로 추정해 채웠습니다. 실제 배정표와 다를 수 있습니다.',
    opts:['맞습니다', '다릅니다 (실제 순번을 아래에 적어주세요)', '8월 배정표가 아직 없습니다'] },

  { id:'asaug', q:'8월 AS 방문(당직 기간 밖 출동) 내역이 있습니까?',
    sub:'지금은 7월 내역만 들어 있습니다. 있으면 날짜·담당자·내용을 적어주세요.',
    opts:['없습니다', '있습니다 (아래에 적어주세요)'] },

  { id:'member', q:'당직 인원 3명(김기홍 · 김두혁 · 임영준)이 맞습니까?',
    opts:['맞습니다', '바뀝니다 (아래에 적어주세요)'] },

  { sec:'2. 화면이 쓸 만합니까', desc:'실제로 매일 쓸 때 불편할 것 같은 곳을 짚어주세요.' },

  { id:'dutymove', q:'당직 일정에서 달을 넘겨 보는 기능이 필요합니까?',
    sub:'지금은 ‹ › 버튼으로 7월·8월을 오갈 수 있습니다.',
    opts:['필요합니다', '이번 달만 보이면 됩니다', '상관없습니다'] },

  { id:'expense', q:'경비 정산 표에 빠진 항목이 있습니까?',
    sub:'현재 항목 — 야간당직 일수 · 주말당직 일수 · AS 방문 건수 · 업무 경비(출장비/주차·톨비)',
    opts:['없습니다', '있습니다 (아래에 적어주세요)'] },

  { id:'planmemo', q:'예정 업무에 메모를 남기는 기능, 실제로 쓰시겠습니까?',
    sub:'카드를 누르면 그 자리에서 펼쳐지고, 작성자와 시각이 함께 남습니다.',
    opts:['쓰겠습니다', '안 씁니다', '써봐야 알겠습니다'] },

  { id:'taskedit', q:'업무 내용을 고칠 수 있는 사람 범위가 맞습니까?',
    sub:'지금 설정 — 업무를 등록한 사람 · 오더 담당자 · 관리자',
    opts:['맞습니다', '더 넓혀야 합니다 (아래에 적어주세요)', '더 좁혀야 합니다 (아래에 적어주세요)'] },

  { id:'miss', q:'지금 화면에 없는데 꼭 있어야 하는 기능이 있습니까?',
    opts:['없습니다', '있습니다 (아래에 적어주세요)'] },

  { sec:'3. 다음에 무엇부터 만들까요', desc:'하나만 골라주세요. 고른 것부터 먼저 만듭니다.' },

  { id:'priority', q:'다음으로 가장 급한 것 하나를 골라주세요.',
    opts:['입력한 내용이 새로고침해도 남게 (실제 저장)',
          '알림 (당직·오더·긴급 업무)',
          '사진 첨부 (현장 사진·영수증)',
          '휴대폰 화면 최적화',
          '그 밖 (아래에 적어주세요)'] },

  { id:'free', q:'그 밖에 하고 싶은 말씀을 자유롭게 적어주세요.', opts:[] }
];

/* ⬇⬇ 여기에 구글 Apps Script 웹앱 주소를 붙여넣으면 「보내기」 버튼이 살아납니다.
   비워 두면 복사 방식만 동작합니다 (앱은 정상 작동합니다).
   주소 예: https://script.google.com/macros/s/AKfycb....../exec           */
const CONFIRM_ENDPOINT = 'https://script.google.com/macros/s/AKfycby0FsUwG5mB7sbTEBUJd3fjnF2igeMJVfuuIZzOq7vvmTf6p1dC5ZrJZbg-PNZS9QUPQg/exec';

/* 구글 쪽에서 "우리 앱이 보낸 것"인지 1차로 걸러내는 표시입니다.
   ⚠️ 진짜 비밀번호가 아닙니다(앱 소스에 그대로 들어갑니다). 떠도는 로봇의 무작위 전송을 막는 용도입니다.
      진짜 방어는 구글 쪽 코드에 있습니다 — 메일은 15분마다 최대 1통, 하루 상한도 걸어 둡니다. */
const CONFIRM_KEY = 'poson-confirm-2026';

const CONFIRM_LS = 'poson_confirm_v1';   /* 브라우저에 임시 보관 — 닫았다 켜도 답이 남습니다 */

let CONFIRM_ANS  = {};      /* id -> { pick, note } */
let CONFIRM_WHO  = '김기홍 팀장';
let CONFIRM_DONE = false;
let CONFIRM_SENT = '';      /* 전송 결과 안내문 */

/* ---------- 브라우저 보관 ---------- */
function loadConfirmLocal(){
  try{
    const raw = localStorage.getItem(CONFIRM_LS);
    if(!raw) return;
    const o = JSON.parse(raw);
    if(o && typeof o === 'object'){
      CONFIRM_ANS = o.ans || {};
      if(o.who) CONFIRM_WHO = o.who;
    }
  }catch(e){ /* 시크릿 모드 등에서 막히면 그냥 넘어갑니다 */ }
}
function saveConfirmLocal(){
  try{ localStorage.setItem(CONFIRM_LS, JSON.stringify({ who:CONFIRM_WHO, ans:CONFIRM_ANS })); }
  catch(e){}
}
loadConfirmLocal();

/* ---------- 입력 즉시 저장 (화면을 옮겨도 답이 남습니다) ---------- */
function ansOf(id){ return CONFIRM_ANS[id] || (CONFIRM_ANS[id] = { pick:'', note:'' }); }
function setConfirmPick(id, v){ ansOf(id).pick = v;          saveConfirmLocal(); confirmCount(); }
function setConfirmNote(id, v){ ansOf(id).note = v.trim();   saveConfirmLocal(); confirmCount(); }
function setConfirmWho(v){      CONFIRM_WHO = v.trim();      saveConfirmLocal(); }
function confirmCount(){
  const el = document.getElementById('cfCnt');
  if(el) el.textContent = `${confirmDoneCount()} / ${CONFIRM_ITEMS.filter(i=>i.id).length} 응답`;
}
function confirmDoneCount(){
  return CONFIRM_ITEMS.filter(it => it.id && CONFIRM_ANS[it.id] &&
         (CONFIRM_ANS[it.id].pick || CONFIRM_ANS[it.id].note)).length;
}

/* 상단 띠의 「의견 남기기」 버튼 — 어느 화면에서든 컨펌 화면으로 들어갑니다 */
function goConfirm(e){
  if(e) e.preventDefault();
  cur.view = 'confirm';
  location.hash = '#confirm';
  render(); markNav();
}

/* ---------- 화면 ---------- */
function viewConfirm(){
  const done = confirmDoneCount();
  const total = CONFIRM_ITEMS.filter(it => it.id).length;

  if(CONFIRM_DONE) return confirmResult(done, total);

  const q = it => `
    <div class="panel cf-q">
      <div class="cf-t">${esc(it.q)}</div>
      ${it.sub ? `<div class="cf-s">${esc(it.sub)}</div>` : ''}
      ${it.opts.length ? `<div class="cf-o">${it.opts.map(o => `
        <label><input type="radio" name="cf_${it.id}" value="${esc(o)}"
          onchange="setConfirmPick('${it.id}', this.value)"
          ${CONFIRM_ANS[it.id] && CONFIRM_ANS[it.id].pick === o ? 'checked' : ''}>${esc(o)}</label>`).join('')}</div>` : ''}
      <textarea id="cfn_${it.id}" class="cf-n" rows="${it.opts.length ? 2 : 4}"
        oninput="setConfirmNote('${it.id}', this.value)"
        placeholder="${it.opts.length ? '보충 설명이 있으면 적어주세요 (선택)' : '자유롭게 적어주세요'}"
      >${esc(CONFIRM_ANS[it.id] ? CONFIRM_ANS[it.id].note : '')}</textarea>
    </div>`;

  return `
  <style>
    .cf-q{margin-top:10px}
    .cf-t{font-weight:600;font-size:15px;margin-bottom:4px}
    .cf-s{font-size:12.5px;color:var(--t3);margin-bottom:10px;line-height:1.55}
    .cf-o{display:flex;flex-direction:column;gap:7px;margin-bottom:10px}
    .cf-o label{display:flex;align-items:flex-start;gap:8px;font-size:14px;cursor:pointer;line-height:1.5}
    .cf-o input{margin-top:3px;flex:none}
    .cf-n{width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid var(--line);
          border-radius:8px;font:inherit;font-size:13px;resize:vertical}
    .cf-out{white-space:pre-wrap;font-family:ui-monospace,Consolas,monospace;font-size:12.5px;
            line-height:1.7;background:var(--surface-3);border:1px solid var(--line);
            border-radius:8px;padding:14px;max-height:520px;overflow:auto}
  </style>

  <div class="mprog">
    <div class="r"><b>컨펌 체크리스트</b>
      <span class="pc" id="cfCnt">${done} / ${total} 응답</span></div>
    <div style="font-size:12px;color:var(--t3)">
      개발 확인용 임시 화면입니다. 컨펌이 끝나면 지웁니다.
      다 고르신 뒤 맨 아래 <b>「완료 — 정리하기」</b> 를 누르면 한 장으로 정리됩니다.
      적는 즉시 이 브라우저에 저장되니, 중간에 닫았다 다시 열어도 이어서 하실 수 있습니다.
    </div>
  </div>

  <div class="panel" style="margin-top:10px">
    <div class="cf-t">작성자</div>
    <input id="cfWho" class="cf-n" value="${esc(CONFIRM_WHO)}" placeholder="이름 · 직함"
      oninput="setConfirmWho(this.value)">
  </div>

  ${CONFIRM_ITEMS.map(it => it.sec
    ? `<div class="mprog" style="margin-top:16px"><div class="r"><b>${esc(it.sec)}</b></div>
       ${it.desc ? `<div style="font-size:12px;color:var(--t3)">${esc(it.desc)}</div>` : ''}</div>`
    : q(it)).join('')}

  <div class="panel" style="margin-top:14px;display:flex;gap:8px;align-items:center">
    <button class="btn pri" onclick="submitConfirm()">완료 — 정리하기</button>
    <button class="btn" onclick="resetConfirm()">전부 지우기</button>
    <span style="font-size:12px;color:var(--t3)">정리한 뒤에도 「다시 고치기」로 돌아올 수 있습니다.</span>
  </div>`;
}

function confirmResult(done, total){
  const txt = confirmText();
  return `
  <style>
    .cf-out{white-space:pre-wrap;font-family:ui-monospace,Consolas,monospace;font-size:12.5px;
            line-height:1.7;background:var(--surface-3);border:1px solid var(--line);
            border-radius:8px;padding:14px;max-height:560px;overflow:auto}
  </style>
  <div class="mprog">
    <div class="r"><b>컨펌 결과 정리</b><span class="pc">${done} / ${total} 응답</span></div>
    <div style="font-size:12px;color:var(--t3)">
      ${CONFIRM_ENDPOINT
        ? '<b>「보내기」</b> 를 누르면 담당자에게 바로 전달됩니다. 안 되면 <b>「복사하기」</b> 로 카카오톡·메일에 붙여넣어 주세요.'
        : '아래 내용을 <b>복사</b>해서 카카오톡이나 메일로 보내주시면 그대로 반영합니다.'}
      ${done < total ? `<b style="color:var(--red)"> · 아직 답하지 않은 항목 ${total - done}개가 있습니다.</b>` : ''}
    </div>
  </div>

  <div class="panel" style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
    ${CONFIRM_ENDPOINT ? `<button class="btn pri" onclick="sendConfirm(this)">보내기</button>` : ''}
    <button class="btn ${CONFIRM_ENDPOINT ? '' : 'pri'}" onclick="copyConfirm()">결과 복사하기</button>
    <button class="btn" onclick="editConfirm()">다시 고치기</button>
    ${CONFIRM_SENT ? `<span style="font-size:12.5px">${esc(CONFIRM_SENT)}</span>` : ''}
  </div>

  <div class="panel" style="margin-top:10px">
    <div class="cf-out" id="cfOut">${esc(txt)}</div>
  </div>`;
}

/* ---------- 동작 ---------- */
function collectConfirm(){
  const who = document.getElementById('cfWho');
  if(who) CONFIRM_WHO = who.value.trim();
  CONFIRM_ITEMS.forEach(it => {
    if(!it.id) return;
    const r = document.querySelector(`input[name="cf_${it.id}"]:checked`);
    const n = document.getElementById('cfn_' + it.id);
    CONFIRM_ANS[it.id] = { pick: r ? r.value : '', note: n ? n.value.trim() : '' };
  });
}

function submitConfirm(){
  collectConfirm(); saveConfirmLocal();
  CONFIRM_DONE = true; CONFIRM_SENT = ''; render();
  toast(CONFIRM_ENDPOINT ? '정리했습니다 — 「보내기」를 눌러주세요' : '정리했습니다 — 복사해서 보내주세요');
}
function editConfirm(){ CONFIRM_DONE = false; render(); }
function resetConfirm(){
  CONFIRM_ANS = {}; CONFIRM_DONE = false; CONFIRM_SENT = '';
  try{ localStorage.removeItem(CONFIRM_LS); }catch(e){}
  render(); toast('전부 지웠습니다');
}

/* 구글 시트로 전송 — 주소가 비어 있으면 버튼 자체가 안 나옵니다.
   ⛔ no-cors 로 보내면 안 됩니다. 서버가 403·500 을 줘도 성공으로 보여서
      "보냈습니다" 라고 거짓 안내를 하게 됩니다. 응답을 실제로 읽어 확인합니다.
      (text/plain 이라 사전요청(preflight)이 없고, Apps Script 는 응답에 CORS 허용을 붙여줍니다) */
function sendConfirm(btn){
  if(!CONFIRM_ENDPOINT) return;
  const back = () => { if(btn){ btn.disabled = false; btn.textContent = '보내기'; } };
  if(btn){ btn.disabled = true; btn.textContent = '보내는 중…'; }
  fetch(CONFIRM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ key: CONFIRM_KEY, who: CONFIRM_WHO, at: new Date().toISOString(),
                           answers: CONFIRM_ANS, text: confirmText() })
  })
  .then(r => { if(!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
  .then(t => {
    if(String(t).indexOf('ok') === -1) throw new Error('응답 확인 실패');
    CONFIRM_SENT = '✓ 보냈습니다. 확인 후 연락드리겠습니다.';
    toast('보냈습니다 — 감사합니다'); render();
  })
  .catch(() => {
    back();
    CONFIRM_SENT = '✕ 전송이 확인되지 않았습니다 — 「결과 복사하기」로 보내주세요.';
    toast('전송 실패 — 복사해서 보내주세요'); render();
  });
}

function confirmText(){
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  const lines = [
    `포스온 업무관리 목업 — 컨펌 결과`,
    `작성자: ${CONFIRM_WHO || '(이름 없음)'}`,
    `작성일: ${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`,
    '─'.repeat(42)
  ];
  CONFIRM_ITEMS.forEach(it => {
    if(it.sec){ lines.push('', `【${it.sec}】`); return; }
    const a = CONFIRM_ANS[it.id] || { pick:'', note:'' };
    lines.push(`· ${it.q}`);
    if(it.opts.length) lines.push(`   답: ${a.pick || '(고르지 않음)'}`);
    if(a.note) lines.push(`   메모: ${a.note.replace(/\n/g, '\n         ')}`);
    if(!it.opts.length && !a.note) lines.push('   (작성 없음)');
  });
  return lines.join('\n');
}

function copyConfirm(){
  const t = confirmText();
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
  else toast('복사가 막혀 있습니다 — 아래 글을 직접 드래그해 복사해주세요');
}
