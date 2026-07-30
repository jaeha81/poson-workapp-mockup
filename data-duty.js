/* ===========================================================
   전화 당직 일정
   출처: 「POSON 07월 전화 당직 일정」 표 그대로
   - 당직 인원은 전 직원이 아니라 지정된 사람만 (7월은 3명)
   - 야간당직: 월~일 매일 / 주말당직: 토·일만
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

/* 날짜 하나로 당직자 찾기 */
function dutyOf(dstr){
  const m = DUTY[(dstr || '').slice(0, 7)];
  if(!m) return null;
  for(const w of m.weeks){
    const base = new Date(w.from + 'T00:00:00');
    for(let i = 0; i < 7; i++){
      const d = new Date(base); d.setDate(base.getDate() + i);
      const p = n => String(n).padStart(2, '0');
      const key = `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
      if(key === dstr) return { week:w.no, night:w.night[i], weekend:w.weekend[i] };
    }
  }
  return null;
}
