/* ===========================================================
   전화 당직 일정 + 당직 수당
   출처: 「POSON 07월 전화 당직 일정」 / 「포스온 AS부서 7월 당직현황」

   ⚠️ 한 주의 기준은 **월요일** 입니다 (원본 표 그대로).
      야간당직은 매일, 주말당직은 토·일에만 섭니다.
      한 주 안에서도 담당자가 갈립니다 (월~목 / 금~일).
   =========================================================== */
const DUTY_MEMBERS = ['김기홍', '김두혁', '임영준'];

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

let DUTY = { '2026-07': DUTY_2026_07 };

/* 지급 단가 — 야간·주말은 하루치, AS 방문은 한 건당 */
let DUTY_PAY = { night: 15000, weekend: 30000, asVisit: 50000 };

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

/* 월 이동 — '2026-07' + 1 → '2026-08' */
function shiftMonth(ym, n){
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${dyPad(d.getMonth()+1)}`;
}
