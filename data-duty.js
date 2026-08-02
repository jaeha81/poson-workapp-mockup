/* ===========================================================
   전화 당직 일정 + 당직 수당
   출처: 「POSON 07월 전화 당직 일정」 / 「포스온 AS부서 7월 당직현황」

   ⚠️ 한 주의 기준은 **월요일** 입니다 (원본 표 그대로).
      야간당직은 매일, 주말당직은 토·일에만 섭니다.
      한 주 안에서도 담당자가 갈립니다 (월~목 / 금~일).
   =========================================================== */
/* 당직 대상자는 고정이 아닙니다. 「직원 · 권한」에서 관리자가 켠 사람만 당직 표에 나옵니다.
   (김기홍 팀장 요청 2026-08-02 — 직원 등록 후 적용) */
function dutyMembers(){ return TEAM.filter(t => t.duty).map(t => t.name); }

/* 주차별 [월,화,수,목,금,토,일] — 비어 있으면 그 달에 없는 날 */
const DUTY_2026_07 = {
  month: '2026-07',
  weeks: [
    /* from 은 그 주의 월요일. 7/1 이 수요일이라 1주차는 6/29(월)부터 셉니다. */
    { no:1, from:'2026-06-29',
      night:  [null, null, '임영준', '임영준', '김두혁', '김두혁', '김두혁'],
      weekend:[null, null, null,     null,     null,     '김두혁', '김두혁'] },
    { no:2, from:'2026-07-06',
      night:  ['김두혁','김두혁','김두혁','김두혁','김기홍','김기홍','김기홍'],
      weekend:[null,    null,    null,    null,    null,   '김기홍','김기홍'] },
    { no:3, from:'2026-07-13',
      night:  ['김기홍','김기홍','김기홍','김기홍','김두혁','김두혁','김두혁'],
      weekend:[null,    null,    null,    null,    null,   '김두혁','김두혁'] },
    { no:4, from:'2026-07-20',
      night:  ['김두혁','김두혁','김두혁','김두혁','임영준','임영준','임영준'],
      weekend:[null,    null,    null,    null,    null,   '임영준','임영준'] },
    { no:5, from:'2026-07-27',
      night:  ['임영준','임영준','임영준','임영준','김기홍','김기홍','김기홍'],
      weekend:[null,    null,    null,    null,    null,   '김기홍','김기홍'] }
  ],
  note: ''
};

/* 8월 — 7월 5주차에서 이어지는 순번 그대로입니다.
   (금~일을 선 사람이 다음 주 월~목을 서는 7월 규칙을 따랐습니다) */
const DUTY_2026_08 = {
  month: '2026-08',
  weeks: [
    /* 8/1 이 토요일이라 1주차는 7/27(월)부터 셉니다. 7월에 든 날은 비워 둡니다. */
    { no:1, from:'2026-07-27',
      night:  [null, null, null, null, null, '김기홍', '김기홍'],
      weekend:[null, null, null, null, null, '김기홍', '김기홍'] },
    { no:2, from:'2026-08-03',
      night:  ['김기홍','김기홍','김기홍','김기홍','김두혁','김두혁','김두혁'],
      weekend:[null,    null,    null,    null,    null,   '김두혁','김두혁'] },
    { no:3, from:'2026-08-10',
      night:  ['김두혁','김두혁','김두혁','김두혁','임영준','임영준','임영준'],
      weekend:[null,    null,    null,    null,    null,   '임영준','임영준'] },
    { no:4, from:'2026-08-17',
      night:  ['임영준','임영준','임영준','임영준','김기홍','김기홍','김기홍'],
      weekend:[null,    null,    null,    null,    null,   '김기홍','김기홍'] },
    { no:5, from:'2026-08-24',
      night:  ['김기홍','김기홍','김기홍','김기홍','김두혁','김두혁','김두혁'],
      weekend:[null,    null,    null,    null,    null,   '김두혁','김두혁'] },
    /* 8/31(월) 하루만 8월입니다. 9/1 부터는 9월 표에서 셉니다. */
    { no:6, from:'2026-08-31',
      night:  ['김두혁', null, null, null, null, null, null],
      weekend:[null,     null, null, null, null, null, null] }
  ],
  note: ''
};

let DUTY = { '2026-07': DUTY_2026_07, '2026-08': DUTY_2026_08 };

/* 지급 단가 (김기홍 팀장 확인 2026-08-02)
   주당직은 금~목 한 주기당 10만원, AS 외근은 한 건당 5만원입니다.
   주당직자는 그 주기의 AS 외근 수당에서 빠집니다 — 다만 업무에 따라 줄 수도 있어
   건별로 켜고 끕니다(아래 DUTY_AS 의 pay). */
let DUTY_PAY = { week: 100000, asVisit: 50000 };

/* 당직 기간 밖에 나간 AS 방문 — 「7월 당직현황」 표의 AS 내역 그대로.
   pay:true 인 건만 수당 지급 대상입니다(관리자가 화면에서 켜고 끕니다). */
let DUTY_AS = [
  { d:'2026-07-04', who:'김두혁', t:'스마일유통 — 긴급 포스용지 50롤 직배', pay:false },
  { d:'2026-07-04', who:'김두혁', t:'디데이산타 김포본점 — 포스용지 50롤 직배', pay:false },
  { d:'2026-07-17', who:'김두혁', t:'반땅구리 — 판매/서버 PC교체 · SQL2000 설치 · DB이관', pay:false },
  { d:'2026-07-19', who:'김두혁', t:'자이화장품(구월동) — 중고일체형 포스 교체 · SQL2000 설치 · DB이관 · 결제테스트',
    pay:true, why:'자이화장품 오후 7시 방문으로 인해 지급필요' },
  { d:'2026-07-25', who:'임영준', t:'행촌칼국수 — 포스 전원불량 아답터 교체 완료', pay:false }
];

/* ---------- 날짜 도우미 (한국시간 기준 — toISOString 은 하루 밀립니다) ---------- */
function dyPad(n){ return String(n).padStart(2, '0'); }
function dyStr(d){ return `${d.getFullYear()}-${dyPad(d.getMonth()+1)}-${dyPad(d.getDate())}`; }

/* 날짜 하나로 당직자 찾기 */
function dutyOf(dstr){
  const m = DUTY[(dstr || '').slice(0, 7)];
  if(!m) return null;
  for(const w of m.weeks){
    const base = new Date(w.from + 'T00:00:00');
    for(let i = 0; i < 7; i++){
      const d = new Date(base); d.setDate(base.getDate() + i);
      if(dyStr(d) === dstr) return { week:w.no, night:w.night[i], weekend:w.weekend[i] };
    }
  }
  return null;
}

/* 그 달에 사람별로 선 야간·주말 당직 일수 — 경비 정산의 지급 근거입니다.
   주차가 달에 걸치면 그 달에 든 날만 셉니다. */
function dutyDayCount(ym){
  const m = DUTY[ym];
  const out = {};
  if(!m) return out;
  m.weeks.forEach(w => {
    const base = new Date(w.from + 'T00:00:00');
    for(let i = 0; i < 7; i++){
      const d = new Date(base); d.setDate(base.getDate() + i);
      const ds = dyStr(d);
      if(ds.slice(0, 7) !== ym) continue;
      ['night', 'weekend'].forEach(k => {
        const n = w[k][i];
        if(!n) return;
        out[n] = out[n] || { night:0, weekend:0, nd:[], wd:[] };
        out[n][k]++;
        out[n][k === 'night' ? 'nd' : 'wd'].push(ds);
      });
    }
  });
  return out;
}

/* 아직 표가 없는 달을 빈 표로 만들어 둡니다 — 당직은 미리 짜두는 편이라
   앞뒤 어느 달로 넘어가도 바로 배정할 수 있게 합니다.
   그 달 1일이 든 주의 월요일부터 7일씩 끊습니다(기존 표와 같은 방식). */
function makeDutyMonth(ym){
  if(DUTY[ym]) return DUTY[ym];
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const last  = new Date(y, m, 0);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));   /* 그 주 월요일 */
  const weeks = [];
  const d = new Date(start);
  for(let no = 1; d <= last; no++){
    weeks.push({ no, from: dyStr(d),
                 night:  [null, null, null, null, null, null, null],
                 weekend:[null, null, null, null, null, null, null] });
    d.setDate(d.getDate() + 7);
  }
  DUTY[ym] = { month: ym, weeks, note: '' };
  return DUTY[ym];
}

/* 사람별 주당직 주기 수 — 한 주기는 금요일에 시작해 다음 목요일에 끝납니다.
   (김기홍 팀장 확인: 금요일에 지정된 사람이 토~목까지 이어서 섭니다)
   그 달에 든 금요일만 세므로, 주가 달에 걸쳐도 두 번 계산되지 않습니다. */
function dutyWeekCount(ym){
  const m = DUTY[ym];
  const out = {};
  if(!m) return out;
  m.weeks.forEach(w => {
    const fri = new Date(w.from + 'T00:00:00');
    fri.setDate(fri.getDate() + 4);           /* from 은 월요일 — +4 가 금요일 */
    const ds = dyStr(fri);
    if(ds.slice(0, 7) !== ym) return;
    const n = w.night[4] || w.weekend[4];     /* 금요일 칸의 담당자 */
    if(!n) return;
    out[n] = out[n] || { weeks:0, fd:[] };
    out[n].weeks++;
    out[n].fd.push(ds);
  });
  return out;
}

/* 월 이동 — '2026-07' + 1 → '2026-08' */
function shiftMonth(ym, n){
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${dyPad(d.getMonth()+1)}`;
}
