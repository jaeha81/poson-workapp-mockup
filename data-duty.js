/* ===========================================================
   전화 당직 일정 + 당직 수당
   출처: 「POSON 07월 전화 당직 일정」 / 「포스온 AS부서 7월 당직현황」

   ⚠️ 한 주의 기준이 월요일이 아니라 **금요일** 입니다.
      금요일에 정한 사람이 차주 목요일까지 7일을 그대로 섭니다.
      (당직현황표의 3~9일 / 10~16일 / 17~23일 / 24~30일 과 같은 구간)
   =========================================================== */
const DUTY_MEMBERS = ['김기홍', '김두혁', '임영준'];

/* 주당직 — 키는 시작 금요일, 값은 담당자. 7일(금~차주 목)을 한 사람이 맡습니다. */
let DUTY_ASSIGN = {
  '2026-06-26': '임영준',
  '2026-07-03': '김두혁',
  '2026-07-10': '김기홍',
  '2026-07-17': '김두혁',
  '2026-07-24': '임영준',
  '2026-07-31': '김기홍',
  '2026-08-07': '김두혁',
  '2026-08-14': '임영준',
  '2026-08-21': '김기홍'
};

/* 월별 특이사항 */
let DUTY_NOTE = {};

/* 지급 단가 — 당직현황표 좌측 상단 박스 */
let DUTY_PAY = { week: 100000, asVisit: 50000 };

/* 주당직 기간 밖에 나간 AS 방문 — 「7월 당직현황」 표의 AS 내역 그대로.
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

/* 그 날짜가 속한 주당직의 시작 금요일 */
function dutyWeekStart(dstr){
  const d = new Date(dstr + 'T00:00:00');
  d.setDate(d.getDate() - ((d.getDay() - 5 + 7) % 7));   /* 금=5 */
  return dyStr(d);
}
function dutyWeekEnd(fri){
  const d = new Date(fri + 'T00:00:00');
  d.setDate(d.getDate() + 6);
  return dyStr(d);
}

/* 날짜 하나로 당직자 찾기 */
function dutyOf(dstr){
  const from = dutyWeekStart(dstr);
  const name = DUTY_ASSIGN[from];
  return name ? { from, to: dutyWeekEnd(from), name } : null;
}

/* 그 달과 걸치는 주당직 전부 (달력에 그릴 목록) */
function dutyWeeksOfMonth(ym){
  const first = new Date(ym + '-01T00:00:00');
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  const out = [];
  let s = new Date(dutyWeekStart(ym + '-01') + 'T00:00:00');
  while(s <= last){
    const from = dyStr(s);
    out.push({ from, to: dutyWeekEnd(from), name: DUTY_ASSIGN[from] || null });
    s.setDate(s.getDate() + 7);
  }
  return out;
}

/* 그 달에 온전히 들어간 주당직만 = 그 달 지급 대상 */
function dutyPayWeeks(ym){
  return dutyWeeksOfMonth(ym).filter(w => w.from.slice(0,7) === ym && w.to.slice(0,7) === ym);
}

/* 월 이동 — '2026-07' + 1 → '2026-08' */
function shiftMonth(ym, n){
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${dyPad(d.getMonth()+1)}`;
}
