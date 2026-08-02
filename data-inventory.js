/* ===========================================================
   포스온 AS부서 운영 데이터
   출처: 구글시트 "포스온 AS부서 업무 리포트" (2026-04 기준)
   - 재고 실사 시트의 열 구조(사무실 + 담당자별)를 그대로 옮김
   =========================================================== */

/* 팀 — 시트 담당자 열 순서 그대로 */
const TEAM = [
  {id:'kkh', name:'김기홍', rank:'팀장', role:'admin',    car:true },
  {id:'kdh', name:'김두혁', rank:'과장', role:'admin',    car:true },
  {id:'lyj', name:'임영준', rank:'대리', role:'engineer', car:true },
  {id:'jdh', name:'장두환', rank:'대리', role:'engineer', car:true },
  {id:'kdw', name:'김동화', rank:'주임', role:'engineer', car:true }
];

/* 재고 보관 위치 = 창고(사무실) + 차량(담당자별)
   차량은 고정이 아닙니다. 직원 · 권한에서 "차량 재고"를 켠 사람만 열에 나타납니다. */
const OFFICE = {id:'office', name:'사무실', kind:'창고'};
const CAR_ORDER = ['kdh','kkh','lyj','kdw','jdh'];   /* 시트 열 순서 유지 */
const LOCATIONS = [OFFICE];
function rebuildLocations(){
  LOCATIONS.length = 1;                              /* 사무실만 남기고 */
  for(const id of CAR_ORDER){
    const t = TEAM.find(x => x.id === id);
    if(t && t.car) LOCATIONS.push({id:t.id, name:t.name, kind:'차량'});
  }
  return LOCATIONS;
}
rebuildLocations();

/* 업무 구분 · 분류 — 시트 드롭다운 그대로 */
const WORK_KINDS = ['콜업무', 'AS방문', '당직'];
const WORK_CATS  = ['POS', 'PC', 'NETWORK', 'SERVER', '관리프로그램', 'APP/PDA', '신규/교육/오픈'];

/* 업무 분류 → 신입에게 붙여줄 매뉴얼 학습 항목 */
const CAT_LESSONS = {
  '관리프로그램': ['1-4','2-1','2-3','4-1','7-1'],
  'APP/PDA'    : ['8-1','8-2','8-3','8-6'],
  'POS'        : ['3-6','4-14','1-16'],
  'SERVER'     : ['11-2','4-1'],
  'NETWORK'    : ['11-2'],
  'PC'         : ['11-6'],
  '신규/교육/오픈': ['1-1','1-2','1-4','11-2','11-3']
};

/* 경비 항목 */
const EXPENSE_KINDS = ['출장비', '주차/톨비', '식대', '숙박비', '부품비', '택배비', '기타'];

/* 매장에 청구하는 항목 — 회사가 직원에게 주는 경비가 아니라 매장에서 받는 돈입니다.
   (김기홍 팀장 확인 2026-08-02) 경비 정산에서 따로 셉니다. */
const STORE_BILLED = ['출장비', '부품비'];

/* 품목 마스터 + 위치별 수량 (2026-04 재고 실사 기준)
   price: 단가 — 시트에 없음. 관리자가 앱에서 입력하는 필드 */
const ITEMS = [
  /* ── POS장비 ── */
  {id:'P01', cat:'POS장비', name:'본체',                        unit:'EA', price:null, q:{office:0,  kdh:1, kkh:0, lyj:0, kdw:0, jdh:1}},
  {id:'P02', cat:'POS장비', name:'일체형 POS 15"',              unit:'EA', price:null, q:{office:9,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'P03', cat:'POS장비', name:'일체형 POS 17"',              unit:'EA', price:null, q:{office:3,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'P04', cat:'POS장비', name:'키오스크 21"',                unit:'EA', price:null, q:{office:0,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'P05', cat:'POS장비', name:'E1715S (델 17인치)',          unit:'EA', price:null, q:{office:7,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'P06', cat:'POS장비', name:'CPP-3000 (AHA영수프린터)',    unit:'EA', price:null, q:{office:4,  kdh:0, kkh:0, lyj:1, kdw:0, jdh:0}},
  {id:'P07', cat:'POS장비', name:'SLK-TE202 (패러럴영수프린터)',unit:'EA', price:null, q:{office:7,  kdh:0, kkh:0, lyj:1, kdw:0, jdh:0}},
  {id:'P08', cat:'POS장비', name:'SLK-TE202 (시리얼프린터)',    unit:'EA', price:null, q:{office:2,  kdh:0, kkh:0, lyj:0, kdw:1, jdh:1}},
  {id:'P09', cat:'POS장비', name:'TD1100 스캐너',               unit:'EA', price:null, q:{office:6,  kdh:1, kkh:1, lyj:1, kdw:1, jdh:0}},
  {id:'P10', cat:'POS장비', name:'SRP-B300II (빅슬론 시리얼프린터)', unit:'EA', price:null, q:{office:7, kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'P11', cat:'POS장비', name:'고정스캐너',                  unit:'EA', price:null, q:{office:0,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'P12', cat:'POS장비', name:'180도 스캐너',                unit:'EA', price:null, q:{office:2,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'P13', cat:'POS장비', name:'금전함',                      unit:'EA', price:null, q:{office:8,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'P14', cat:'POS장비', name:'마젤란 9300i',                unit:'EA', price:null, q:{office:7,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'P15', cat:'POS장비', name:'PLU키보드',                   unit:'EA', price:null, q:{office:6,  kdh:0, kkh:0, lyj:0, kdw:1, jdh:0}},

  /* ── VAN장비 ── */
  {id:'V01', cat:'VAN장비', name:'KIS-SR1000 (카트리지)',       unit:'EA', price:null, q:{office:1,  kdh:5, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'V02', cat:'VAN장비', name:'KIS-SR1000QN (IC리더기)',     unit:'EA', price:null, q:{office:0,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'V03', cat:'VAN장비', name:'KIS-SR1000N (IC리더기)',      unit:'EA', price:null, q:{office:0,  kdh:1, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'V04', cat:'VAN장비', name:'KIS-SR1000Q',                 unit:'EA', price:null, q:{office:1,  kdh:0, kkh:2, lyj:1, kdw:1, jdh:1}},
  {id:'V05', cat:'VAN장비', name:'KIS-SR1000',                  unit:'EA', price:null, q:{office:4,  kdh:0, kkh:0, lyj:0, kdw:1, jdh:0}},
  {id:'V06', cat:'VAN장비', name:'KIS-SP420QN (멀티패드)',      unit:'EA', price:null, q:{office:21, kdh:1, kkh:1, lyj:1, kdw:1, jdh:1}},
  {id:'V07', cat:'VAN장비', name:'KIS-SP420Q (멀티패드)',       unit:'EA', price:null, q:{office:0,  kdh:0, kkh:0, lyj:0, kdw:1, jdh:0}},
  {id:'V08', cat:'VAN장비', name:'KIS-1421 (3인치)',            unit:'EA', price:null, q:{office:2,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'V09', cat:'VAN장비', name:'KIS-2200 (2인치)',            unit:'EA', price:null, q:{office:17, kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'V10', cat:'VAN장비', name:'DD-SDR300 (IC리더기)',        unit:'EA', price:null, q:{office:7,  kdh:1, kkh:1, lyj:1, kdw:1, jdh:0}},
  {id:'V11', cat:'VAN장비', name:'DD-MP2000 (다우멀티패드)',    unit:'EA', price:null, q:{office:10, kdh:0, kkh:0, lyj:1, kdw:1, jdh:0}},
  {id:'V12', cat:'VAN장비', name:'DD2300 (다우데이터 3인치)',   unit:'EA', price:null, q:{office:7,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'V13', cat:'VAN장비', name:'DK9200 (다우 2인치)',         unit:'EA', price:null, q:{office:1,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'V14', cat:'VAN장비', name:'SMT-R231 (IC리더기)',         unit:'EA', price:null, q:{office:6,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:1}},
  {id:'V15', cat:'VAN장비', name:'SMT-Q453 (멀티패드)',         unit:'EA', price:null, q:{office:9,  kdh:0, kkh:0, lyj:1, kdw:0, jdh:0}},
  {id:'V16', cat:'VAN장비', name:'SMT-T250 (스마트로 3인치)',   unit:'EA', price:null, q:{office:10, kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'V17', cat:'VAN장비', name:'SMT-T225 (스마트로 2인치)',   unit:'EA', price:null, q:{office:0,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'V18', cat:'VAN장비', name:'KOVAN-SDR300 (IC리더기)',     unit:'EA', price:null, q:{office:5,  kdh:1, kkh:1, lyj:1, kdw:1, jdh:1}},
  {id:'V19', cat:'VAN장비', name:'KOVAN-SPD800 (멀티패드)',     unit:'EA', price:null, q:{office:6,  kdh:0, kkh:1, lyj:0, kdw:1, jdh:0}},
  {id:'V20', cat:'VAN장비', name:'KOVAN-7403S (3인치)',         unit:'EA', price:null, q:{office:16, kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},

  /* ── 주변기기 ── */
  {id:'A01', cat:'주변기기', name:'SSD 하드디스크 240GB',       unit:'EA', price:null, q:{office:0,  kdh:1, kkh:0, lyj:1, kdw:0, jdh:0}},
  {id:'A02', cat:'주변기기', name:'SSD 하드디스크 128GB',       unit:'EA', price:null, q:{office:4,  kdh:1, kkh:0, lyj:1, kdw:0, jdh:0}},
  {id:'A03', cat:'주변기기', name:'4GB 메모리 (DDR3)',          unit:'EA', price:null, q:{office:23, kdh:2, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'A04', cat:'주변기기', name:'8GB 메모리 (DDR3L)',         unit:'EA', price:null, q:{office:12, kdh:1, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'A05', cat:'주변기기', name:'8GB 메모리 (DDR4)',          unit:'EA', price:null, q:{office:2,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'A06', cat:'주변기기', name:'V504 (공유기)',              unit:'EA', price:null, q:{office:4,  kdh:1, kkh:1, lyj:1, kdw:1, jdh:0}},
  {id:'A07', cat:'주변기기', name:'T5004 (기가공유기)',         unit:'EA', price:null, q:{office:5,  kdh:1, kkh:1, lyj:1, kdw:0, jdh:0}},
  {id:'A08', cat:'주변기기', name:'XD5-40d (바코드프린터)',     unit:'EA', price:null, q:{office:4,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'A09', cat:'주변기기', name:'8포트 허브',                 unit:'EA', price:null, q:{office:2,  kdh:1, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'A10', cat:'주변기기', name:'5포트 허브',                 unit:'EA', price:null, q:{office:0,  kdh:1, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'A11', cat:'주변기기', name:'전자저울 (카스)',            unit:'EA', price:null, q:{office:8,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'A12', cat:'주변기기', name:'LK-P30II (세우)',            unit:'EA', price:null, q:{office:2,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'A13', cat:'주변기기', name:'PDA SL-20',                  unit:'EA', price:null, q:{office:0,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'A14', cat:'주변기기', name:'PDA SL-20+',                 unit:'EA', price:null, q:{office:2,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},

  /* ── 용지 ── */
  {id:'S01', cat:'용지', name:'스티커(흰색) 4x2.3',             unit:'롤', price:null, q:{office:174, kdh:2, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'S02', cat:'용지', name:'스티커(노랑) 5.8x3',             unit:'롤', price:null, q:{office:74,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'S03', cat:'용지', name:'스티커(노랑) 4x2',               unit:'롤', price:null, q:{office:3,   kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'S04', cat:'용지', name:'블랙마크(노랑) 4x3.5',           unit:'롤', price:null, q:{office:50,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'S05', cat:'용지', name:'블랙마크(노랑) 4.5x3',           unit:'롤', price:null, q:{office:50,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'S06', cat:'용지', name:'블랙마크(노랑) 5.8x3.2',         unit:'롤', price:null, q:{office:86,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'S07', cat:'용지', name:'블랙마크(노랑) 5x3',             unit:'롤', price:null, q:{office:102, kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'S08', cat:'용지', name:'무선(노랑스티커) 5.8x3.2',       unit:'롤', price:null, q:{office:381, kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'S09', cat:'용지', name:'무선(노랑블랙마크)',             unit:'롤', price:null, q:{office:570, kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'S10', cat:'용지', name:'무선(흰색블랙마크)',             unit:'롤', price:null, q:{office:390, kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}},
  {id:'S11', cat:'용지', name:'반지고리라벨지',                 unit:'롤', price:null, q:{office:61,  kdh:0, kkh:0, lyj:0, kdw:0, jdh:0}}
];

/* 사용 이력 — "어느 날 · 어떤 매장에 · 몇 개 나갔나"
   예상(선차감) → 확정 / 반납 상태가 함께 남습니다 */
let USAGE = [
  {date:'2026-07-25', store:'하나아이스크림 망우 6호점', itemId:'P13', qty:1, loc:'kdw', by:'김동화', state:'확정'},
  {date:'2026-07-29', store:'한국유통 단대점',          itemId:'A14', qty:1, loc:'lyj', by:'임영준', state:'확정'},
  {date:'2026-07-24', store:'디데이산타아울렛 춘천',     itemId:'V06', qty:2, loc:'office', by:'김두혁', state:'확정'},
  {date:'2026-07-23', store:'만종리퍼마켓 (제천)',      itemId:'S01', qty:4, loc:'office', by:'김두혁', state:'확정'},
  {date:'2026-07-22', store:'OK마트 (수내)',           itemId:'A02', qty:1, loc:'kdh', by:'김두혁', state:'확정'}
];

/* 입고 이력 — 품목 / 날짜 / 수량 / 입고 위치 */
const INBOUND = [
  {id:'IN04', date:'2026-04-24', itemId:'A12', qty:2,  loc:'office', from:'세우테크',  memo:'만종리퍼마켓 판매분 포함'},
  {id:'IN03', date:'2026-04-22', itemId:'P15', qty:10, loc:'office', from:'앱솔루션',  memo:'PLU키보드 발주분'},
  {id:'IN02', date:'2026-04-22', itemId:'A08', qty:2,  loc:'office', from:'아이코다',  memo:''},
  {id:'IN01', date:'2026-04-14', itemId:'V06', qty:5,  loc:'office', from:'KIS',       memo:'멀티패드 정기 입고'}
];
