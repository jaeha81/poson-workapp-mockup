/* ===========================================================
   거래처(매장) 마스터
   이름은 4월 업무 리포트에 실제로 나온 거래처를 그대로 옮겼습니다.
   코드는 TIPS 거래처 코드 규칙(숫자 5자리)을 따라 부여했고,
   주소는 리포트에 남아 있는 건만 채우고 나머지는 비워뒀습니다.
   =========================================================== */
const STORE_KINDS = ['매장', '대리점'];

let STORES = [
  {code:'10001', name:'산타아울렛모드니 (시흥)',      kind:'매장',   addr:''},
  {code:'10002', name:'OK마트 (수내)',                kind:'매장',   addr:''},
  {code:'10003', name:'스마일유통',                   kind:'매장',   addr:''},
  {code:'10004', name:'한국유통 단대점',              kind:'매장',   addr:''},
  {code:'10005', name:'암사큐마트',                   kind:'매장',   addr:''},
  {code:'10006', name:'영광물류 명륜점',              kind:'매장',   addr:''},
  {code:'10007', name:'영광물류 기업도시점',          kind:'매장',   addr:''},
  {code:'10008', name:'디데이산타아울렛 춘천',        kind:'매장',   addr:''},
  {code:'10009', name:'만종리퍼마켓 (제천)',          kind:'매장',   addr:''},
  {code:'10010', name:'하나아이스크림 망우 6호점',    kind:'매장',   addr:'용마산로 96길 33'},
  {code:'10011', name:'냥이와멍이 우장산점',          kind:'매장',   addr:''},
  {code:'10012', name:'냥이와멍이 까치산점',          kind:'매장',   addr:''},
  {code:'10013', name:'산타마트 가좌점',              kind:'매장',   addr:''},
  {code:'10014', name:'삼호할인마트',                 kind:'매장',   addr:''},
  {code:'10015', name:'포린푸드코리아',               kind:'매장',   addr:''},
  {code:'10016', name:'참조은생활마트 동해묵호점',    kind:'매장',   addr:''},
  {code:'10017', name:'광장슈퍼',                     kind:'매장',   addr:''},
  {code:'10018', name:'고덕한남마트',                 kind:'매장',   addr:''},
  {code:'10019', name:'정왕할인백화점',               kind:'매장',   addr:''},
  {code:'10020', name:'한사랑 할인마트 (숭의점)',     kind:'매장',   addr:''},
  {code:'10021', name:'생활DC백화점 (강릉포남점)',    kind:'매장',   addr:''},
  {code:'10022', name:'주식회사 거상',                kind:'매장',   addr:''},
  {code:'10023', name:'와이제이',                     kind:'매장',   addr:''},
  {code:'10024', name:'올데이',                       kind:'매장',   addr:''},
  {code:'10025', name:'선단다팜',                     kind:'매장',   addr:''},
  {code:'10026', name:'진로식자재마트 돌곶이',        kind:'매장',   addr:''},
  {code:'10027', name:'동일할인마트 (연희)',          kind:'매장',   addr:''},
  {code:'10028', name:'동일할인마트 (신당)',          kind:'매장',   addr:''},
  {code:'10029', name:'아이마트 (쌍령)',              kind:'매장',   addr:''},
  {code:'10030', name:'이플러스마트 (광릉)',          kind:'매장',   addr:''},
  {code:'10031', name:'자이화장품 (구월동)',          kind:'매장',   addr:''},
  {code:'10032', name:'고향식품',                     kind:'매장',   addr:''},
  {code:'10033', name:'인하할인마트',                 kind:'매장',   addr:''},
  {code:'10034', name:'오공마켓',                     kind:'매장',   addr:''},
  {code:'10035', name:'비엘라컴퍼니',                 kind:'매장',   addr:''},
  {code:'10036', name:'현대필마트',                   kind:'매장',   addr:''},
  {code:'10037', name:'아뜨레펫 (신정)',              kind:'매장',   addr:''},
  {code:'10038', name:'한마음마트 (봉담)',            kind:'매장',   addr:''},
  {code:'10039', name:'몽땅달콤아이스크림 (원종)',    kind:'매장',   addr:''},
  {code:'10040', name:'베스트시스템',                 kind:'매장',   addr:''},
  {code:'10041', name:'금강넷 (서산)',                kind:'매장',   addr:''},
  {code:'10042', name:'청라병원',                     kind:'매장',   addr:''},
  {code:'10043', name:'디데이산타 동두천',            kind:'매장',   addr:''},
  {code:'10044', name:'디데이산타 포천',              kind:'매장',   addr:''},
  {code:'20001', name:'대리점 효성',                  kind:'대리점', addr:''},
  {code:'20002', name:'포스코리아',                   kind:'대리점', addr:''},
  {code:'20003', name:'바른정보통신',                 kind:'대리점', addr:''},
  {code:'20004', name:'나우정보통신',                 kind:'대리점', addr:''},
  {code:'20005', name:'태통정보통신',                 kind:'대리점', addr:''},
  {code:'20006', name:'스카이정보통신',               kind:'대리점', addr:''},
  {code:'20007', name:'엠에이치큐 (화곡)',            kind:'대리점', addr:''},
  {code:'20008', name:'원주밝음신협',                 kind:'대리점', addr:''},
  {code:'20009', name:'우리마트 (씨유엔)',            kind:'대리점', addr:''},
  {code:'20010', name:'우리포스',                     kind:'대리점', addr:''}
];

/* 부분일치 검색 — 매장 이름을 다 다르게 부르기 때문에 앞글자만으로는 안 찾아집니다.
   "수내" 로도 "OK마트 (수내)" 가 나와야 합니다. */
function searchStores(q, limit){
  const s = (q || '').trim();
  if(!s) return STORES.slice(0, limit || 8);
  const k = s.toLowerCase().replace(/\s+/g, '');
  const hit = STORES.filter(x =>
    (x.name + x.code + x.addr).toLowerCase().replace(/\s+/g, '').includes(k));
  /* 이름 앞부분이 맞는 것을 위로 */
  hit.sort((a, b) => {
    const ai = a.name.toLowerCase().replace(/\s+/g,'').indexOf(k);
    const bi = b.name.toLowerCase().replace(/\s+/g,'').indexOf(k);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });
  return hit.slice(0, limit || 8);
}

function nextStoreCode(kind){
  const head = kind === '대리점' ? '2' : '1';
  const nums = STORES.filter(s => s.code.startsWith(head)).map(s => Number(s.code));
  return String((nums.length ? Math.max(...nums) : Number(head + '0000')) + 1);
}
