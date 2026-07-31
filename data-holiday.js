/* ===========================================================
   대한민국 법정공휴일

   ⚠️ 설날 · 추석 · 부처님오신날은 음력이라 해마다 날짜가 바뀝니다.
      대체공휴일도 그 해 요일에 따라 달라집니다.
      → 코드를 고치지 않고 **앱 안 「공휴일」 화면에서** 찾아보고 고칠 수 있습니다.
      고친 내용은 이 브라우저에 저장되어 다음에 열어도 그대로입니다.

   대체공휴일 규칙 (2023년 개정 기준)
   - 설날·추석 연휴, 삼일절, 어린이날, 부처님오신날, 광복절, 개천절, 한글날,
     성탄절이 토·일과 겹치면 다음 첫 평일이 대체공휴일
   - 신정(1/1)과 현충일(6/6)은 대체공휴일 대상이 아닙니다
   =========================================================== */

/* 기본 표 — 앱에서 고쳐도 이 표는 그대로 남습니다(되돌리기 기준) */
const HOLIDAYS_BASE = {
  /* ---------- 2026년 ---------- */
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴',
  '2026-02-17': '설날',
  '2026-02-18': '설날 연휴',
  '2026-03-01': '삼일절',
  '2026-03-02': '삼일절 대체',      /* 3/1 이 일요일 */
  '2026-05-05': '어린이날',
  '2026-05-24': '부처님오신날',
  '2026-05-25': '부처님오신날 대체', /* 5/24 가 일요일 */
  '2026-06-06': '현충일',            /* 토요일 — 현충일은 대체공휴일 없음 */
  '2026-08-15': '광복절',
  '2026-08-17': '광복절 대체',       /* 8/15 가 토요일 */
  '2026-09-24': '추석 연휴',
  '2026-09-25': '추석',
  '2026-09-26': '추석 연휴',
  '2026-09-28': '추석 대체',         /* 9/26 이 토요일 */
  '2026-10-03': '개천절',
  '2026-10-05': '개천절 대체',       /* 10/3 이 토요일 */
  '2026-10-09': '한글날',
  '2026-12-25': '성탄절',

  /* ---------- 2027년 (잠정 — 확정 공고 나오면 앱에서 고쳐 주세요) ---------- */
  '2027-01-01': '신정',
  '2027-02-05': '설날 연휴',
  '2027-02-06': '설날',
  '2027-02-07': '설날 연휴',
  '2027-02-08': '설날 대체',         /* 2/6 토 · 2/7 일 겹침 */
  '2027-02-09': '설날 대체',
  '2027-03-01': '삼일절',
  '2027-05-05': '어린이날',
  '2027-05-13': '부처님오신날',
  '2027-06-06': '현충일',
  '2027-08-15': '광복절',
  '2027-08-16': '광복절 대체',       /* 8/15 가 일요일 */
  '2027-09-14': '추석 연휴',
  '2027-09-15': '추석',
  '2027-09-16': '추석 연휴',
  '2027-10-03': '개천절',
  '2027-10-04': '개천절 대체',       /* 10/3 이 일요일 */
  '2027-10-09': '한글날',
  '2027-10-11': '한글날 대체',       /* 10/9 가 토요일 */
  '2027-12-25': '성탄절',
  '2027-12-27': '성탄절 대체'        /* 12/25 가 토요일 */
};

/* 앱에서 고친 것만 따로 모읍니다.
   { '2027-02-08': '설날 대체' } = 추가·수정,  { '2027-02-09': null } = 지움 */
let HOLIDAY_EDITS = {};

/* 실제로 쓰이는 표 — 기본 표 + 고친 것 */
let HOLIDAYS = {};

const HOLIDAY_STORE = 'poson-holiday-edits';

function loadHolidayEdits(){
  try {
    const raw = localStorage.getItem(HOLIDAY_STORE);
    HOLIDAY_EDITS = raw ? JSON.parse(raw) : {};
  } catch(e){ HOLIDAY_EDITS = {}; }
  buildHolidays();
}
function saveHolidayEdits(){
  try { localStorage.setItem(HOLIDAY_STORE, JSON.stringify(HOLIDAY_EDITS)); } catch(e){}
}
function buildHolidays(){
  HOLIDAYS = Object.assign({}, HOLIDAYS_BASE);
  Object.keys(HOLIDAY_EDITS).forEach(d => {
    if(HOLIDAY_EDITS[d]) HOLIDAYS[d] = HOLIDAY_EDITS[d];
    else delete HOLIDAYS[d];
  });
}

/* 추가 · 수정 */
function setHoliday(dstr, name){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dstr)) return '날짜는 2026-10-03 처럼 적어 주세요';
  if(isNaN(new Date(dstr + 'T00:00:00'))) return '없는 날짜입니다';
  if(!String(name || '').trim()) return '공휴일 이름을 적어 주세요';
  HOLIDAY_EDITS[dstr] = String(name).trim();
  saveHolidayEdits(); buildHolidays();
  return null;
}
/* 지움 — 기본 표에 있던 날이면 '지움' 표시를 남겨야 다시 안 살아납니다 */
function removeHoliday(dstr){
  if(HOLIDAYS_BASE[dstr]) HOLIDAY_EDITS[dstr] = null;
  else delete HOLIDAY_EDITS[dstr];
  saveHolidayEdits(); buildHolidays();
}
/* 기본 표로 되돌리기 */
function resetHolidays(){
  HOLIDAY_EDITS = {};
  saveHolidayEdits(); buildHolidays();
}
function isEditedHoliday(dstr){ return Object.prototype.hasOwnProperty.call(HOLIDAY_EDITS, dstr); }

/* 그 해 공휴일 — 날짜순 */
function holidaysOfYear(year){
  const y = String(year);
  return Object.keys(HOLIDAYS).filter(d => d.startsWith(y)).sort()
    .map(d => ({ d, name: HOLIDAYS[d] }));
}
/* 표에 들어 있는 연도들 */
function holidayYears(){
  const ys = new Set();
  Object.keys(HOLIDAYS).forEach(d => ys.add(d.slice(0, 4)));
  Object.keys(HOLIDAYS_BASE).forEach(d => ys.add(d.slice(0, 4)));
  return [...ys].sort();
}
/* 검색 — 이름이든 날짜든 일부만 쳐도 찾습니다 ('추석', '10-03', '2027') */
function searchHolidays(q){
  const s = String(q || '').trim();
  if(!s) return [];
  const hit = Object.keys(HOLIDAYS).filter(d =>
    d.includes(s) || d.replace(/-/g, '').includes(s.replace(/[-.\/]/g, '')) ||
    HOLIDAYS[d].includes(s));
  return hit.sort().map(d => ({ d, name: HOLIDAYS[d] }));
}

/* 공휴일 이름 — 공휴일이 아니면 null */
function holidayName(dstr){ return HOLIDAYS[dstr] || null; }

/* 달력에 빨갛게 칠할 날 = 공휴일 또는 일요일 */
function isRedDay(dstr){
  if(!dstr) return false;
  if(HOLIDAYS[dstr]) return true;
  const dt = new Date(dstr + 'T00:00:00');
  return !isNaN(dt) && dt.getDay() === 0;
}
/* 토요일 = 파랑 (공휴일이면 빨강이 이깁니다) */
function isBlueDay(dstr){
  if(!dstr || HOLIDAYS[dstr]) return false;
  const dt = new Date(dstr + 'T00:00:00');
  return !isNaN(dt) && dt.getDay() === 6;
}

loadHolidayEdits();
