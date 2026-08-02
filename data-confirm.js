/* ===========================================================
   컨펌 체크리스트 — ⚠️ 임시 화면입니다. 컨펌이 끝나면 통째로 지웁니다.

   지우는 법 (3곳):
     ① 이 파일 삭제
     ② index.html — <script src="data-confirm.js"></script> 한 줄
     ③ index.html — 사이드바 <a data-view="confirm"> 와 그 위 nav-label 두 줄
     ④ index.html — render() 의 else if(cur.view==='confirm') 한 줄
   =========================================================== */

/* 지금은 2차입니다. 회차가 바뀌면 이 숫자를 올리세요 —
   팀장님 브라우저에 남아 있던 지난 회차 답이 자동으로 비워집니다. */
const CONFIRM_ROUND = 2;

/* sec 만 있으면 구분 제목, id 가 있으면 질문, done 이 있으면 "처리 완료" 목록입니다.
   opts 가 비어 있으면 자유 입력만 받습니다. */
const CONFIRM_ITEMS = [
  { sec:'지금까지 무엇을 했나 — 1차 반영 (7건)',
    desc:'2026-08-02 에 주신 컨펌을 두 번에 나눠 반영했습니다. 먼저 급하다고 하신 것부터 넣은 것이 아래 7건입니다. 다시 확인하지 않으셔도 됩니다.',
    done:[
      { t:'넣은 내용이 새로고침해도 남게', w:'모든',
        d:'가장 급하다고 하신 것입니다. 이 브라우저에 그대로 저장돼 창을 닫았다 켜도 남습니다. 처음으로 돌리려면 위 띠의 「처음으로 되돌리기」를 누르세요.' },
      { t:'당직 단가 정정', w:'경비 정산',
        d:'주당직은 금~목 한 주기에 100,000원, AS 외근은 건당 50,000원. 주당직자는 AS 외근 수당에서 빼되, 건마다 적용/미적용을 켤 수 있게 했습니다.' },
      { t:'경비 정산을 인원별 지급액 표로', w:'경비 정산',
        d:'주당직 · AS 외근 건수 · 업무 경비(주차비 · 식대 · 숙박 · 기타)를 한 줄에서 봅니다. 매장에 청구하는 출장비 · 부품비는 회사 경비 합계에서 뺐습니다.' },
      { t:'금요일 당직자를 정하면 다음 목요일까지 자동 입력', w:'당직 일정',
        d:'토 · 일과 다음 주 월~목이 같은 사람으로 채워집니다. 칸마다 따로 고치는 것도 그대로 됩니다.' },
      { t:'법정공휴일은 주간당직도 배정', w:'당직 일정',
        d:'평일이어도 공휴일이면 주간당직 칸이 열립니다. 「주말당직」→「주간당직」, 「전화 당직」→「당직」으로 이름도 고쳤습니다.' },
      { t:'당직 일정을 여러 달 미리 만들기', w:'당직 일정',
        d:'‹ › 로 달을 넘기고, 표가 없는 달은 「N월 표 만들기」로 바로 만듭니다.' },
      { t:'예정 업무를 업무 등록에서 만들기', w:'예정 업무',
        d:'업무 등록창의 「예정 업무로 등록」에 체크하면 예정 업무로 갑니다. 그 카드를 눌러 업무일을 넣으면 처리할 업무로 넘어갑니다.' }
    ] },

  { sec:'2차 반영 (8건) — 이번에 새로 넣은 것',
    desc:'자유 의견으로 적어주신 8가지입니다. 아래 질문은 이것들이 실제와 맞는지만 봐주시면 됩니다.',
    done:[
      { t:'직원 가입 신청 → 관리자 승인', w:'직원 · 권한',
        d:'직원이 회사 이메일로 신청하면 대기 목록에 쌓이고, 관리자가 승인해야 계정이 열립니다. 거절도 됩니다.' },
      { t:'거래처 삭제 · 엑셀 업로드', w:'거래처 관리',
        d:'줄마다 삭제 버튼이 생겼습니다. 엑셀에서 세 칸(코드 · 거래처명 · 주소)을 복사해 붙여넣거나 CSV 파일을 골라 한 번에 올립니다.' },
      { t:'체크리스트를 등록자가 고르고 새로 만들기', w:'업무 등록',
        d:'분류를 고르면 항목이 뜨고 필요한 것만 남기면 됩니다. 없는 항목은 그 자리에서 만들면 다음부터 목록에 남습니다. 말씀대로 AI 자동 추천은 데이터가 쌓인 뒤에 붙이겠습니다.' },
      { t:'신입 매뉴얼을 옵션으로', w:'업무 등록 · 직원 · 권한',
        d:'업무마다 「신입에게 매뉴얼 붙이기」 체크를 풀 수 있고, 「직원 · 권한」에서 통째로 끌 수도 있습니다. 매뉴얼 원본 보강은 말씀대로 나중에 하겠습니다.' },
      { t:'당직 특이사항을 메모장처럼 + 공유', w:'당직 일정',
        d:'여러 줄로 쌓이고 작성자 · 시각이 남습니다. 「전원 공유」를 누르면 그 줄이 전 직원 알림으로 나갑니다.' },
      { t:'업무 수정 권한을 관리자까지', w:'업무 상세',
        d:'등록한 사람 · 오더 담당자 · 관리자가 고칠 수 있습니다.' },
      { t:'경비를 본인 것만 보이게 · 회계담당자 권한 신설', w:'경비 정산 · 직원 · 권한',
        d:'일반 직원은 자기 것만 봅니다. 「회계담당자」 권한을 새로 만들어, 그 사람은 전 직원 정산을 보고 지급 처리까지 합니다.' },
      { t:'당직 인원을 직원 등록 후 지정', w:'직원 · 권한',
        d:'관리자가 사람마다 당직 대상을 켭니다. 켠 사람만 당직표에서 고를 수 있습니다.' }
    ] },

  { sec:'2차 — 새로 만든 것이 실제와 맞습니까',
    desc:'이번에 넣은 것들이 실제 업무와 맞는지만 봐주시면 됩니다. 모르시면 비워두셔도 됩니다.' },

  { id:'signup', q:'직원 가입 · 승인 방식이 실제 입사 절차와 맞습니까?',
    sub:'지금 방식 — 직원이 회사 이메일로 신청 → 「직원 · 권한」에 대기로 쌓임 → 관리자가 승인해야 계정이 열림. 승인되면 뷰어로 시작.',
    opts:['맞습니다', '고칠 곳이 있습니다 (아래에 적어주세요)', '가입을 관리자가 직접 만들어 주는 편이 낫습니다'] },

  { id:'storexls', q:'거래처 엑셀 양식이 쓰시는 파일과 맞습니까?',
    sub:'지금 받는 순서 — 거래처코드 · 거래처명 · 주소. 엑셀에서 세 칸을 복사해 붙여넣거나 CSV 파일을 고르면 됩니다. 같은 코드는 덮어씁니다.',
    opts:['맞습니다', '칸이 더 필요합니다 (아래에 적어주세요)', '순서가 다릅니다 (아래에 적어주세요)'] },

  { id:'checklist', q:'체크리스트 기본 항목이 현장과 맞습니까?',
    sub:'분류(POS · 관리프로그램 · APP/PDA · 신규/교육/오픈 등)마다 기본 항목이 붙어 있습니다. 빼야 할 것이나 꼭 넣어야 할 것을 알려주세요.',
    opts:['맞습니다', '고칠 것이 있습니다 (아래에 적어주세요)', '현장에서 더 써보고 알려드리겠습니다'] },

  { id:'acct', q:'회계담당자 권한을 누구에게 줄까요?',
    sub:'회계담당자는 전 직원 경비 정산을 보고 지급 처리까지 합니다. 직원 관리 · 재고에는 손대지 못합니다.',
    opts:['관리자만 있으면 됩니다', '따로 지정하겠습니다 (아래에 이름을 적어주세요)', '아직 정하지 못했습니다'] },

  { id:'dutynote', q:'당직 특이사항 메모, 실제로 쓰시겠습니까?',
    sub:'당직 중 생긴 일을 여러 줄로 남기고, 공유할 것만 골라 전 직원 알림으로 보냅니다.',
    opts:['쓰겠습니다', '공유 없이 기록만 하겠습니다', '안 씁니다'] },

  { id:'exproom', q:'경비 정산에서 빠진 것이 아직 있습니까?',
    sub:'지금 항목 — 주당직(금~목 주기) · AS 외근 건수 · 업무 경비(출장비 · 주차/톨비 · 식대 · 숙박 · 기타). 매장 청구분(출장비 · 부품비)은 회사 경비 합계에서 뺐습니다.',
    opts:['없습니다', '있습니다 (아래에 적어주세요)'] },

  { sec:'다음에 무엇부터 만들까요', desc:'하나만 골라주세요. 고른 것부터 먼저 만듭니다.' },

  { id:'priority2', q:'다음으로 가장 급한 것 하나를 골라주세요.',
    opts:['알림 (당직 · 오더 · 긴급 업무를 휴대폰으로)',
          '사진 첨부 (현장 사진 · 영수증)',
          '휴대폰 화면 최적화',
          '여러 사람이 같이 쓰게 (실제 서버 붙이기)',
          '엑셀 내려받기 (경비 · 업무량 집계)',
          '그 밖 (아래에 적어주세요)'] },

  { id:'free2', q:'그 밖에 하고 싶은 말씀을 자유롭게 적어주세요.', opts:[] }
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
      /* 회차가 바뀌었으면 지난 회차 답은 비웁니다 (이미 처리된 질문에 또 답하지 않게) */
      if((o.round || 1) !== CONFIRM_ROUND){ CONFIRM_ANS = {}; if(o.who) CONFIRM_WHO = o.who; return; }
      CONFIRM_ANS = o.ans || {};
      if(o.who) CONFIRM_WHO = o.who;
    }
  }catch(e){ /* 시크릿 모드 등에서 막히면 그냥 넘어갑니다 */ }
}
function saveConfirmLocal(){
  try{ localStorage.setItem(CONFIRM_LS, JSON.stringify({ round:CONFIRM_ROUND, who:CONFIRM_WHO, ans:CONFIRM_ANS })); }
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

/* 처리 완료 목록 — 팀장님이 "무엇이 이미 됐는지" 를 바로 알아보게 합니다 */
function doneBlock(list){
  return `<div class="panel cf-done">
    ${list.map(d => `
      <div class="cf-d">
        <span class="cf-dk">완료</span>
        <div class="cf-db">
          <b>${esc(d.t)}</b>${d.w ? `<span class="cf-dw">${esc(d.w)} 화면</span>` : ''}
          <div>${esc(d.d)}</div>
        </div>
      </div>`).join('')}
  </div>`;
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
    .cf-done{margin-top:10px;display:flex;flex-direction:column;gap:0}
    .cf-d{display:flex;gap:10px;padding:11px 0;border-top:1px solid var(--line)}
    .cf-d:first-child{border-top:0;padding-top:2px}
    .cf-dk{flex:none;align-self:flex-start;font-size:11px;font-weight:700;color:var(--green);
           border:1px solid var(--green);border-radius:999px;padding:2px 8px;line-height:1.5}
    .cf-db{font-size:13px;line-height:1.6}
    .cf-db b{font-size:13.5px}
    .cf-db>div{color:var(--t3);font-size:12.5px;margin-top:3px}
    .cf-dw{margin-left:7px;font-size:11px;color:var(--navy);border:1px solid var(--navy-line);
           background:var(--navy-50);border-radius:999px;padding:2px 7px;white-space:nowrap}
    .cf-out{white-space:pre-wrap;font-family:ui-monospace,Consolas,monospace;font-size:12.5px;
            line-height:1.7;background:var(--surface-3);border:1px solid var(--line);
            border-radius:8px;padding:14px;max-height:520px;overflow:auto}
  </style>

  <div class="mprog">
    <div class="r"><b>컨펌 체크리스트 — ${CONFIRM_ROUND}차</b>
      <span class="pc" id="cfCnt">${done} / ${total} 응답</span></div>
    <div style="font-size:12px;color:var(--t3)">
      <b>1차에 주신 의견은 15가지 전부 반영했습니다.</b> 무엇을 했는지는 바로 아래에 목록으로 적어두었습니다 —
      읽어보시고, <b>새로 만든 것이 실제와 맞는지만</b> 답해주시면 됩니다.
      적는 즉시 이 브라우저에 저장되니 중간에 닫았다 열어도 이어서 하실 수 있고,
      다 고르신 뒤 맨 아래 <b>「완료 — 정리하기」</b> 를 누르시면 됩니다.
    </div>
  </div>

  <div class="panel" style="margin-top:10px">
    <div class="cf-t">작성자</div>
    <input id="cfWho" class="cf-n" value="${esc(CONFIRM_WHO)}" placeholder="이름 · 직함"
      oninput="setConfirmWho(this.value)">
  </div>

  ${CONFIRM_ITEMS.map(it => it.sec
    ? `<div class="mprog" style="margin-top:16px"><div class="r"><b>${esc(it.sec)}</b></div>
       ${it.desc ? `<div style="font-size:12px;color:var(--t3)">${esc(it.desc)}</div>` : ''}</div>
       ${it.done ? doneBlock(it.done) : ''}`
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
    `포스온 업무관리 목업 — 컨펌 결과 (${CONFIRM_ROUND}차)`,
    `작성자: ${CONFIRM_WHO || '(이름 없음)'}`,
    `작성일: ${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`,
    '─'.repeat(42)
  ];
  CONFIRM_ITEMS.forEach(it => {
    if(it.sec){
      lines.push('', `【${it.sec}】`);
      /* 이미 처리한 항목은 제목만 한 줄씩 — 무엇이 끝났는지 받는 쪽도 알게 */
      if(it.done) it.done.forEach(x => lines.push(`   ✓ ${x.t}`));
      return;
    }
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
