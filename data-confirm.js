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

let CONFIRM_ANS  = {};      /* id -> { pick, note } */
let CONFIRM_WHO  = '김기홍 팀장';
let CONFIRM_DONE = false;

/* ---------- 화면 ---------- */
function viewConfirm(){
  const done = CONFIRM_ITEMS.filter(it => it.id && CONFIRM_ANS[it.id] &&
                (CONFIRM_ANS[it.id].pick || CONFIRM_ANS[it.id].note)).length;
  const total = CONFIRM_ITEMS.filter(it => it.id).length;

  if(CONFIRM_DONE) return confirmResult(done, total);

  const q = it => `
    <div class="panel cf-q">
      <div class="cf-t">${esc(it.q)}</div>
      ${it.sub ? `<div class="cf-s">${esc(it.sub)}</div>` : ''}
      ${it.opts.length ? `<div class="cf-o">${it.opts.map((o, i) => `
        <label><input type="radio" name="cf_${it.id}" value="${esc(o)}"
          ${CONFIRM_ANS[it.id] && CONFIRM_ANS[it.id].pick === o ? 'checked' : ''}>${esc(o)}</label>`).join('')}</div>` : ''}
      <textarea id="cfn_${it.id}" class="cf-n" rows="${it.opts.length ? 2 : 4}"
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
      <span class="pc">${done} / ${total} 응답</span></div>
    <div style="font-size:12px;color:var(--t3)">
      개발 확인용 임시 화면입니다. 컨펌이 끝나면 지웁니다.
      다 고르신 뒤 맨 아래 <b>「완료 — 정리하기」</b> 를 누르면 한 장으로 정리됩니다.
      ⚠️ 새로고침하면 답이 사라지니 한 번에 끝까지 진행해 주세요.
    </div>
  </div>

  <div class="panel" style="margin-top:10px">
    <div class="cf-t">작성자</div>
    <input id="cfWho" class="cf-n" value="${esc(CONFIRM_WHO)}" placeholder="이름 · 직함">
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
      아래 내용을 <b>복사</b>해서 카카오톡이나 메일로 보내주시면 그대로 반영합니다.
      ${done < total ? `<b style="color:var(--red)"> · 아직 답하지 않은 항목 ${total - done}개가 있습니다.</b>` : ''}
    </div>
  </div>

  <div class="panel" style="margin-top:10px;display:flex;gap:8px;align-items:center">
    <button class="btn pri" onclick="copyConfirm()">결과 복사하기</button>
    <button class="btn" onclick="editConfirm()">다시 고치기</button>
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

function submitConfirm(){ collectConfirm(); CONFIRM_DONE = true; render(); toast('정리했습니다 — 복사해서 보내주세요'); }
function editConfirm(){ CONFIRM_DONE = false; render(); }
function resetConfirm(){ CONFIRM_ANS = {}; CONFIRM_DONE = false; render(); toast('전부 지웠습니다'); }

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
  try { document.execCommand('copy'); ok(); }
  catch(e){ toast('복사가 막혀 있습니다 — 아래 글을 직접 드래그해 복사해주세요'); }
  document.body.removeChild(ta);
}
