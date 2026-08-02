/* ===========================================================
   컨펌 체크리스트 — ⚠️ 임시 화면입니다. 컨펌이 끝나면 통째로 지웁니다.

   지우는 법 (3곳):
     ① 이 파일 삭제
     ② index.html — <script src="data-confirm.js"></script> 한 줄
     ③ index.html — 사이드바 <a data-view="confirm"> 와 그 위 nav-label 두 줄
     ④ index.html — render() 의 else if(cur.view==='confirm') 한 줄
   =========================================================== */

/* 지금은 3차입니다. 회차가 바뀌면 이 숫자를 올리세요 —
   팀장님 브라우저에 남아 있던 지난 회차 답이 자동으로 비워집니다. */
const CONFIRM_ROUND = 3;

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

  { sec:'2차 반영 (8건)',
    desc:'1차 때 자유 의견으로 적어주신 8가지입니다. 다시 확인하지 않으셔도 됩니다.',
    done:[
      { t:'직원 가입 신청 → 관리자 승인', w:'직원 · 권한',
        d:'※ 3차 컨펌에서 「관리자가 계정을 만들어 전달」로 바꿨습니다. 아래 3차 목록을 봐주세요.' },
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

  { sec:'3차 반영 (13건) — 이번에 새로 넣은 것',
    desc:'2026-08-02 저녁에 주신 2차 답변을 전부 반영했습니다. 아래 질문은 이것들이 실제와 맞는지만 봐주시면 됩니다.',
    done:[
      { t:'로그인을 아이디 · 암호 방식으로', w:'첫 화면',
        d:'앱을 열면 로그인 화면이 먼저 나옵니다. 「자동 로그인」을 켜두면 다음부터 바로 들어옵니다. 오른쪽 위에 로그아웃 버튼을 뒀습니다. (시연 계정 — 아이디 kkh · 암호 1234)' },
      { t:'가입 신청 방식을 없애고 관리자가 계정을 만들어 전달', w:'직원 · 권한',
        d:'말씀대로 이메일 연동은 뺐습니다. 관리자가 이름 · 직급 · 아이디 · 임시 암호를 넣어 계정을 만들고, 그것을 직원에게 알려주면 됩니다. 암호 초기화도 관리자가 합니다.' },
      { t:'거래처 전체 삭제', w:'거래처 관리',
        d:'엑셀로 새 목록을 통째로 올리기 전에 씁니다. 되돌릴 수 없어서 두 번 확인합니다.' },
      { t:'등록된 거래처 수정', w:'거래처 관리',
        d:'줄 오른쪽 「수정」을 누르면 위 등록 칸이 그 거래처 내용으로 채워집니다. 이름을 바꾸면 이미 등록된 업무의 매장 이름도 같이 바뀝니다.' },
      { t:'업무 등록에 관리자(본인)도 담당자로 표시', w:'업무 등록',
        d:'담당자 목록에서 본인이 빠져 있던 것을 고쳤습니다. 이제 전원이 나오고 본인 옆에 「나」 표시가 붙습니다.' },
      { t:'재고 수량 전부 0으로 초기화', w:'재고 현황',
        d:'시연용으로 넣어둔 수량을 모두 지웠습니다. 실제 수량은 「입고 등록」과 「재고 실사」로 채우시면 됩니다.' },
      { t:'입고는 더하기 · 재고 실사는 현재고 맞추기', w:'입고 등록 · 재고 실사',
        d:'입고 등록은 적은 수량만큼 더합니다. 재고 실사는 세어본 수량으로 현재고를 그대로 바꾸고, 얼마에서 얼마로 바뀌었는지 이력에 남깁니다.' },
      { t:'출고 현황 신설 — 수기 등록', w:'출고 현황',
        d:'택배로 보낸 것이나 손으로 내보낸 것을 직접 적습니다. 품목 · 수량 · 어디서 뺄지 · 받는 곳 · 보낸 방법(택배/직접 전달 등)을 넣으면 재고에서 자동으로 빠집니다.' },
      { t:'경비 정산에 지급 담당자 특이사항 메모', w:'경비 정산',
        d:'「총 지급액」 아래에 메모 칸을 넣었습니다. 관리자와 회계담당자가 그 달 정산에 남길 말을 적습니다.' },
      { t:'매장에서 지급하는 항목 삭제', w:'경비 정산 · 업무 상세',
        d:'출장비 · 부품비를 경비 항목에서 아예 뺐습니다. 남은 항목은 주차/톨비 · 식대 · 숙박비 · 택배비 · 기타입니다.' },
      { t:'당직 일정 날짜 배경색을 진하게', w:'당직 일정',
        d:'날짜 줄 배경을 한 단계 진하게 하고, 아래 특이사항 칸도 같은 색으로 맞췄습니다.' },
      { t:'당직 특이사항 옆 안내 문구 삭제', w:'당직 일정',
        d:'제목 옆에 붙어 있던 설명을 뺐습니다.' },
      { t:'회계담당자는 관리자가 지정', w:'직원 · 권한',
        d:'말씀대로입니다 — 「직원 · 권한」에서 권한 버튼을 눌러 뷰어 → 회계담당자 → 관리자로 바꿉니다. 이미 되어 있어 따로 손대지 않았습니다.' }
    ] },

  { sec:'3차 — 새로 만든 것이 실제와 맞습니까',
    desc:'이번에 넣은 것들이 실제 업무와 맞는지만 봐주시면 됩니다. 모르시면 비워두셔도 됩니다.' },

  { id:'login', q:'로그인 방식이 쓰시기에 맞습니까?',
    sub:'지금 방식 — 아이디 · 암호로 로그인, 「자동 로그인」 체크. 계정은 관리자가 만들어 전달. 시연 계정은 아이디 kkh · 암호 1234 입니다.',
    opts:['맞습니다', '고칠 곳이 있습니다 (아래에 적어주세요)', '암호를 직원이 직접 바꿀 수 있어야 합니다'] },

  { id:'account', q:'계정 만들 때 넣어야 할 칸이 더 있습니까?',
    sub:'지금 받는 것 — 이름 · 직급 · 아이디 · 임시 암호. 권한은 만든 뒤 「뷰어 → 회계담당자 → 관리자」로 바꿉니다.',
    opts:['이만하면 됩니다', '더 필요합니다 (아래에 적어주세요 — 예: 사번 · 연락처 · 입사일)'] },

  { id:'outbound', q:'출고 등록 칸이 실제 출고와 맞습니까?',
    sub:'지금 받는 것 — 품목 · 어디서 뺄지 · 수량 · 출고일 · 보낸 방법(택배/직접 전달/기사 방문/기타) · 받는 곳 · 비고.',
    opts:['맞습니다', '칸이 더 필요합니다 (아래에 적어주세요 — 예: 송장번호 · 택배사)', '고칠 곳이 있습니다 (아래에 적어주세요)'] },

  { id:'stockzero', q:'재고를 0으로 비웠습니다. 실제 수량은 어떻게 채울까요?',
    sub:'지금은 「입고 등록」으로 더하거나 「재고 실사」로 맞추는 두 가지입니다.',
    opts:['재고 실사로 한 번에 넣겠습니다', '입고 등록으로 하나씩 넣겠습니다',
          '엑셀로 한 번에 올리게 해주세요', '아직 정하지 못했습니다'] },

  { id:'paynote', q:'지급 특이사항 메모 자리가 맞습니까?',
    sub:'「경비 정산」 화면 맨 아래 총 지급액 밑에 넣었습니다. 관리자와 회계담당자만 적을 수 있습니다.',
    opts:['맞습니다', '자리를 옮겨주세요 (아래에 적어주세요)', '사람마다 따로 적을 수 있어야 합니다'] },

  { id:'expkind', q:'경비 항목이 이제 맞습니까?',
    sub:'출장비 · 부품비를 뺐습니다. 남은 항목 — 주차/톨비 · 식대 · 숙박비 · 택배비 · 기타.',
    opts:['맞습니다', '더 넣어야 합니다 (아래에 적어주세요)', '더 빼야 합니다 (아래에 적어주세요)'] },

  { sec:'실제 서버로 넘어가는 이야기',
    desc:'2차에서 「여러 사람이 같이 쓰게 (실제 서버 붙이기)」를 가장 급한 것으로 골라주셨습니다. 이건 목업이 아니라 실제 개발입니다 — 지금 화면 그대로 서버에 올리면 여러 대에서 같은 자료를 보게 됩니다. 아래만 알려주시면 일정과 비용을 정리해 드리겠습니다.' },

  { id:'server', q:'실제로 쓰실 인원과 기기는 어떻게 됩니까?',
    sub:'몇 명이 · 무엇으로(사무실 PC · 휴대폰) 쓰실지 알려주시면 됩니다.',
    opts:['지금 5명 그대로 · PC 위주', '지금 5명 그대로 · 휴대폰도 함께',
          '늘어납니다 (아래에 인원을 적어주세요)', '아직 정하지 못했습니다'] },

  { id:'priority3', q:'서버 붙이기 전에 목업에서 더 볼 것이 있습니까?',
    opts:['없습니다 — 서버 작업으로 넘어가시죠',
          '알림 (당직 · 오더 · 긴급 업무를 휴대폰으로)',
          '사진 첨부 (현장 사진 · 영수증)',
          '휴대폰 화면 최적화',
          '엑셀 내려받기 (경비 · 업무량 집계)',
          '그 밖 (아래에 적어주세요)'] },

  { id:'free3', q:'그 밖에 하고 싶은 말씀을 자유롭게 적어주세요.', opts:[] }
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

/* 상단 띠의 「의견 남기기」 버튼 — 화면을 옮기지 않고 위에 겹쳐 띄웁니다.
   보시던 화면이 그대로 남아 있어야 확인하면서 답하기 편합니다. */
function goConfirm(e){
  if(e) e.preventDefault();
  openConfirmPanel();
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
