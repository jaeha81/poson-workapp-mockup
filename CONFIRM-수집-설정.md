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
- 그래서 위 코드에 `safeCell()` 이 들어 있습니다 — `=SUM(...)` 같은 **수식 공격을 글자로 바꿔** 막습니다.
  코드를 줄여 쓰지 마시고 그대로 붙여넣어 주세요.
- 주소가 **공개 GitHub 저장소에 들어갑니다.** 검색 로봇이 주워 갈 수 있고, 그러면 광고성 줄이 들어올 수 있습니다.
- 그래서 **컨펌이 끝나면 반드시 배포를 중지**하세요 — Apps Script → 배포 → 배포 관리 → **보관처리**.
- 개인정보는 받지 않습니다(이름·직함과 업무 의견만).

## 확인 방법

배포 후 목업에서 「완료 → 보내기」를 눌러보고, 구글 시트 `컨펌` 탭에 줄이 생기면 성공입니다.
전송이 실패하면 화면에 `✕ 전송이 안 됐습니다` 가 뜨고, 「결과 복사하기」로 보내면 됩니다.
