# 컨펌 결과를 구글 시트로 받는 법 (임시 — 컨펌 끝나면 이 파일도 지웁니다)

목업은 GitHub Pages(정적 호스팅)라 서버가 없습니다. 그래서 **구글 Apps Script** 를 공짜 서버로 씁니다.
아래를 한 번만 해두면, 팀장님이 「보내기」를 누를 때마다 **구글 시트에 한 줄씩 쌓입니다.**

---

## 1) 구글 시트 만들기

1. https://sheets.google.com → **빈 스프레드시트**
2. 이름: `포스온 컨펌`

## 2) Apps Script 열기

시트 상단 메뉴 → **확장 프로그램** → **Apps Script**

## 3) 아래 코드를 통째로 붙여넣기 (기존 내용은 지우고)

```javascript
/* 시트에 넣기 전에 안전하게 다듬습니다.
   ⛔ = + - @ 로 시작하는 글은 구글 시트가 '수식'으로 실행합니다.
      주소를 아는 사람은 누구나 보낼 수 있으니, 앞에 ' 를 붙여 글자로만 저장합니다. */
function safeCell(v) {
  var s = (v === null || v === undefined) ? '' : String(v);
  if (s.length > 20000) s = s.slice(0, 20000);   // 지나치게 긴 글은 자릅니다
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;       // 수식으로 실행되지 않게
  return s;
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('컨펌') || ss.insertSheet('컨펌');

  var d = {};
  try { d = JSON.parse(e.postData.contents); }
  catch (err) { d = { text: e.postData ? e.postData.contents : '' }; }

  // 우리 앱이 보낸 것만 받습니다 (떠도는 로봇의 무작위 전송을 걸러냅니다)
  // ⚠️ 이 값은 data-confirm.js 의 CONFIRM_KEY 와 같아야 합니다
  if (d.key !== 'poson-confirm-2026') return ContentService.createTextOutput('ng');

  if (sh.getLastRow() === 0) {
    sh.appendRow(['받은 시각', '작성자', '정리본', '원본(JSON)']);
  }
  sh.appendRow([
    new Date(),
    safeCell(d.who).slice(0, 100),
    safeCell(d.text),
    safeCell(JSON.stringify(d.answers || {}))
  ]);

  return ContentService.createTextOutput('ok');
}
```

### 왜 여기서 메일을 안 보내나 (중요)

주소가 공개되어 있으니 **아무나 이 주소로 수천 번 보낼 수 있습니다.** 여기서 바로 메일을 쏘면
받은편지함이 도배되고 **구글 하루 발송 한도가 말라서 진짜 컨펌 알림까지 안 옵니다.**
그래서 **메일은 아래처럼 15분마다 한 통으로 묶어서** 보냅니다. 몇 번을 보내든 메일은 15분에 1통입니다.

## 3-2) 알림 코드 — 위 코드 아래에 이어서 붙여넣기

```javascript
/* 새로 들어온 컨펌이 있으면 15분에 한 통으로 묶어 알립니다.
   ⛔ 제목의 [포스온컨펌] 은 그대로 두세요 — 이 표시로 메일을 찾아 자동 처리합니다. */
var 받는사람 = 'dltkddlf231@gmail.com';   // ← 받으실 주소
var 하루최대 = 20;                        // 하루 이만큼만 보냅니다 (도배 방지)
var 한번에   = 5;                         // 한 통에 담는 최대 건수 (메일이 너무 커지지 않게)
var 글자상한 = 3000;                      // 한 건당 본문 글자 수 (넘으면 잘라 쓰고 시트에서 보세요)

function notifyNew() {
  var pr = PropertiesService.getScriptProperties();
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('컨펌');
  if (!sh) return;

  var last = Number(pr.getProperty('lastNotified') || 1);   // 1행은 제목줄
  var now  = sh.getLastRow();
  if (now <= last) return;                                   // 새 글 없음

  var today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
  var cnt = (pr.getProperty('mailDate') === today) ? Number(pr.getProperty('mailCount') || 0) : 0;
  if (cnt >= 하루최대) return;   // ⛔ 커서를 그대로 둡니다 — 오늘 못 보낸 건 내일 보냅니다

  var end  = Math.min(now, last + 한번에);                   // 한 번에 최대 5건씩만
  var rows = sh.getRange(last + 1, 1, end - last, 3).getValues();
  var body = rows.map(function (r) {
    var t = String(r[2] || '');
    if (t.length > 글자상한) t = t.slice(0, 글자상한) + '\n…(길어서 줄임 — 전체는 시트에서 보세요)';
    return '■ ' + r[0] + ' / ' + r[1] + '\n' + t;
  }).join('\n\n────────────────────\n\n');

  try {
    MailApp.sendEmail({
      to: 받는사람,
      subject: '[포스온컨펌] 새 응답 ' + rows.length + '건',
      body: body + '\n\n— 포스온 목업 컨펌 화면에서 자동 발송'
    });
    pr.setProperty('mailDate', today);
    pr.setProperty('mailCount', String(cnt + 1));
  } catch (err) {
    // 메일이 실패해도 원본은 시트에 그대로 있습니다
  }

  // 실패했더라도 다음 줄로 넘깁니다 — 안 그러면 같은 묶음에 갇혀 알림이 영영 안 옵니다
  pr.setProperty('lastNotified', String(end));
}

/* ⛔ 트리거를 걸기 전에 이 함수를 딱 한 번 실행하세요.
   이미 시트에 쌓여 있던 줄을 한꺼번에 메일로 쏘는 것을 막습니다. */
function 커서초기화() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('컨펌');
  PropertiesService.getScriptProperties()
    .setProperty('lastNotified', String(sh ? sh.getLastRow() : 1));
}
```

## 3-3) 예약 걸기 전에 — `커서초기화` 한 번 실행

Apps Script 상단 함수 목록에서 **`커서초기화`** 를 고르고 **실행** ▶ 을 한 번 누릅니다.
(이미 시트에 줄이 있을 때, 그 과거 줄들이 한꺼번에 메일로 날아오는 것을 막습니다)

## 3-4) 15분마다 확인하도록 예약 걸기

Apps Script 왼쪽 **시계 아이콘(트리거)** → **트리거 추가**
- 실행할 함수: **notifyNew**
- 이벤트 소스: **시간 기반**
- 유형: **분 단위 타이머** → **15분마다**
- 저장

**저장**(디스크 아이콘 또는 Ctrl+S)

## 4) 웹앱으로 배포

1. 오른쪽 위 **배포** → **새 배포**
2. 톱니바퀴 → **웹 앱** 선택
3. 설정
   - 설명: `포스온 컨펌 수집`
   - **다음 사용자로 실행: 나(본인 계정)**
   - **액세스 권한이 있는 사용자: 모든 사용자** ← ⛔ 이걸 「모든 사용자」로 해야 팀장님이 보낼 수 있습니다
4. **배포** 클릭
5. 처음 1회 권한 승인 — "이 앱은 확인되지 않았습니다" 경고가 나오면
   **고급** → **(안전하지 않음) 이동** → **허용**
6. 나온 주소 복사 (`https://script.google.com/macros/s/AKfycb....../exec`)

## 5) 주소를 앱에 넣기

`data-confirm.js` 맨 위:

```javascript
const CONFIRM_ENDPOINT = '';   // ← 여기 따옴표 안에 붙여넣기
```

주소를 넣고 push 하면 **「보내기」 버튼이 생깁니다.** (비어 있으면 복사 버튼만 나옵니다 — 앱은 정상 동작)

---

## ⛔ 보안 — 꼭 읽어주세요

- 이 주소를 아는 사람은 **누구나 시트에 줄을 추가**할 수 있습니다. (시트 내용을 읽거나 지우지는 못합니다)
- 그래서 위 코드에 **방어 세 겹**이 들어 있습니다. 줄여 쓰지 마시고 그대로 붙여넣어 주세요.
  1. `safeCell()` — `=SUM(...)` 같은 **수식 공격을 글자로** 바꿔 막습니다
  2. `d.key` 확인 — 우리 앱이 보낸 것만 받습니다 (무작위 로봇 차단)
  3. **메일은 15분에 1통 · 하루 20통까지** — 도배해도 받은편지함과 구글 발송 한도가 안 터집니다
- 주소가 **공개 GitHub 저장소에 들어갑니다.** 검색 로봇이 주워 갈 수 있고, 그러면 광고성 줄이 들어올 수 있습니다.
- 그래서 **컨펌이 끝나면 반드시 배포를 중지**하세요 — Apps Script → 배포 → 배포 관리 → **보관처리**.
- 개인정보는 받지 않습니다(이름·직함과 업무 의견만).

## 확인 방법

배포 후 목업에서 「완료 → 보내기」를 눌러보고, 구글 시트 `컨펌` 탭에 줄이 생기면 성공입니다.
전송이 실패하면 화면에 `✕ 전송이 안 됐습니다` 가 뜨고, 「결과 복사하기」로 보내면 됩니다.
