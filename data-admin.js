/* ===========================================================
   관리자 페이지 — 관리자(팀장)만 들어옵니다

   1. 컨펌 체크리스트   … 개발자에게 수정 요청 보내기 (data-confirm.js)
   2. 앱 관리
      · 가이드북       … 실무자 가이드북을 앱 안에서 읽고 인쇄
      · 세팅 경로      … Vercel · Supabase 가입부터 표 만들기까지 한 줄로

   ⛔ 일반 직원에게는 이 메뉴가 아예 보이지 않습니다 (renderWho 에서 감춥니다).
   ⛔ 이 화면에는 어떤 키·비밀번호도 저장하지 않습니다. 값은 Vercel 환경변수 칸에만 넣습니다.
   =========================================================== */

const ADMIN_TABS = [
  { k: 'confirm', g: '',        l: '컨펌 체크리스트' },
  { k: 'guide',   g: '앱 관리', l: '가이드북' },
  { k: 'setup',   g: '앱 관리', l: '세팅 경로' }
];

/* ---------- 공통 도구 ---------- */
function copyText(s, msg){
  const done = () => toast(msg || '복사했습니다');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(s).then(done, () => fallbackCopy(s, done));
  } else fallbackCopy(s, done);
}
function fallbackCopy(s, done){
  const t = document.createElement('textarea');
  t.value = s; t.style.position = 'fixed'; t.style.opacity = '0';
  document.body.appendChild(t); t.select();
  try{ document.execCommand('copy'); done(); }catch(e){ toast('복사가 막혔습니다 — 직접 긁어서 복사해주세요'); }
  document.body.removeChild(t);
}
function openLink(url){ window.open(url, '_blank', 'noopener'); }
function setAdminTab(k){ cur.atab = k; render(); }

/* ===========================================================
   세팅 경로 — 가입부터 표 만들기까지
   =========================================================== */
const SETUP_LS = 'poson_setup_v1';
let SETUP = { done: {}, ref: '', project: 'poson-work', domain: 'work.poson.co.kr' };

function loadSetup(){
  try{
    const o = JSON.parse(localStorage.getItem(SETUP_LS) || 'null');
    if(o) SETUP = Object.assign(SETUP, o);
  }catch(e){}
}
function saveSetup(){
  try{ localStorage.setItem(SETUP_LS, JSON.stringify(SETUP)); }catch(e){}
}
loadSetup();

/* 프로젝트 주소를 한 번 넣어두면 아래 Supabase 링크가 모두 그 프로젝트로 바로 들어갑니다 */
function setSupaRef(v){
  const s = (v || '').trim();
  const m = s.match(/project\/([a-z0-9]{16,})/i) || s.match(/https?:\/\/([a-z0-9]{16,})\.supabase\.co/i)
         || s.match(/^([a-z0-9]{16,})$/i);
  SETUP.ref = m ? m[1] : '';
  saveSetup(); render();
  toast(SETUP.ref ? `프로젝트 연결 — 아래 링크가 ${SETUP.ref} 로 바로 갑니다`
                  : '프로젝트 주소를 알아보지 못했습니다 — 주소창의 주소를 그대로 붙여넣어 주세요');
}
function supaLink(tail){
  return SETUP.ref ? `https://supabase.com/dashboard/project/${SETUP.ref}${tail}`
                   : `https://supabase.com/dashboard/projects`;
}
function toggleStep(k){ SETUP.done[k] = !SETUP.done[k]; saveSetup(); render(); }
function setSetupField(k, v){ SETUP[k] = (v || '').trim(); saveSetup(); }
function resetSetup(){
  if(!confirm('세팅 진행 상태를 처음으로 되돌립니다. 계속할까요?')) return;
  SETUP = { done: {}, ref: '', project: 'poson-work', domain: 'work.poson.co.kr' };
  saveSetup(); render(); toast('세팅 진행 상태를 지웠습니다');
}

/* Vercel 환경변수 — 이름만 만들어 줍니다. 값은 각자 Vercel 칸에 넣습니다 */
function envTemplate(){
  return [
    '# Vercel → Settings → Environment Variables 에 이름 그대로 넣습니다',
    '# 값은 Supabase → Project Settings → API 에서 복사합니다',
    'NEXT_PUBLIC_SUPABASE_URL=' + (SETUP.ref ? `https://${SETUP.ref}.supabase.co` : 'https://<프로젝트>.supabase.co'),
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable(anon) 키를 여기에>',
    'SUPABASE_SERVICE_ROLE_KEY=<service_role 키 — 서버 전용, 절대 공개 금지>'
  ].join('\n');
}

/* 지금까지 한 것을 한 장으로 — 개발자에게 그대로 보내면 됩니다 */
function setupSummary(){
  const d = new Date(), p = n => String(n).padStart(2, '0');
  const lines = SETUP_STEPS.map((s, i) =>
    `${SETUP.done[s.k] ? '[완료]' : '[  ]'} ${i + 1}. ${s.t}`);
  return [
    '포스온 업무관리 — 실서버 세팅 진행 상황',
    `작성 ${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`,
    `Supabase 프로젝트: ${SETUP.ref || '(아직 없음)'}`,
    `접속 주소: ${SETUP.domain || '(아직 없음)'}`,
    '─'.repeat(42),
    ...lines
  ].join('\n');
}
function copySetupSummary(){ copyText(setupSummary(), '진행 상황을 복사했습니다'); }

/* 컨펌 창구와 같은 통로로 개발자에게 바로 보냅니다 */
function sendSetupStatus(btn){
  if(typeof CONFIRM_ENDPOINT === 'undefined' || !CONFIRM_ENDPOINT){ copySetupSummary(); return; }
  const back = () => { if(btn){ btn.disabled = false; btn.textContent = '개발자에게 알리기'; } };
  if(btn){ btn.disabled = true; btn.textContent = '보내는 중…'; }
  fetch(CONFIRM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      key: CONFIRM_KEY, who: (typeof fbWho === 'function' ? fbWho() : ''), at: new Date().toISOString(),
      answers: { screen: '세팅 경로', kind: '세팅 진행 상황', body: setupSummary() },
      text: setupSummary()
    })
  })
  .then(r => { if(!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
  .then(t => { if(String(t).indexOf('ok') === -1) throw new Error('응답 확인 실패');
               toast('보냈습니다 — 개발자가 확인하고 연락드립니다'); back(); })
  .catch(() => { copySetupSummary(); toast('전송이 막혀 복사했습니다 — 메일이나 카톡에 붙여넣어 주세요'); back(); });
}

/* ---------- 표(테이블) 만들기 SQL — Supabase SQL 편집기에 붙여넣고 Run ---------- */
const SETUP_SQL = `-- 포스온 업무관리 — 표 만들기 (한 번만 실행합니다)
-- Supabase → SQL Editor → 붙여넣고 오른쪽 아래 Run

create extension if not exists pgcrypto;

-- 1) 직원 ------------------------------------------------------
create table if not exists members (
  id         uuid primary key default gen_random_uuid(),
  auth_uid   uuid unique,                      -- 로그인 계정과 연결
  login_id   text unique not null,
  name       text not null,
  rank       text,
  role       text not null default 'engineer'
             check (role in ('admin','accounting','engineer')),
  is_duty    boolean default false,            -- 당직 대상
  has_car    boolean default false,            -- 차량 재고 보관
  is_rookie  boolean default false,            -- 신입
  is_off     boolean default false,            -- 미사용(퇴사)
  hired_on   date,
  created_at timestamptz default now()
);

-- 2) 거래처 ----------------------------------------------------
create table if not exists stores (
  code       text primary key,
  kind       text not null default '매장',     -- 매장 / 대리점
  name       text not null,
  addr       text,
  mgr        text,                             -- 관리업체(대리점)
  created_at timestamptz default now()
);
create index if not exists stores_name_idx on stores (name);

-- 3) 재고 ------------------------------------------------------
create table if not exists locations (
  id text primary key, name text not null, kind text not null default '창고'
);
create table if not exists items (
  id text primary key, cat text, name text not null, unit text, price integer
);
create table if not exists stock (
  item_id text references items(id) on delete cascade,
  loc_id  text references locations(id) on delete cascade,
  qty     integer not null default 0,
  primary key (item_id, loc_id)
);
create table if not exists inbound (
  id bigserial primary key, d date not null, item_id text references items(id),
  qty integer not null, loc_id text references locations(id),
  src text, memo text, by_name text, created_at timestamptz default now()
);
create table if not exists outbound (
  id bigserial primary key, d date not null, item_id text references items(id),
  qty integer not null, loc_id text references locations(id),
  to_name text, way text, memo text, by_name text, created_at timestamptz default now()
);
create table if not exists audits (
  id bigserial primary key, d date not null, item_id text references items(id),
  loc_id text references locations(id), was integer, now_qty integer,
  memo text, by_name text, created_at timestamptz default now()
);

-- 4) 업무 ------------------------------------------------------
create table if not exists tasks (
  id         bigserial primary key,
  store      text,
  work_date  date,
  work_time  time,
  kind       text,                             -- 콜업무 / AS방문 / 당직
  cat        text,                             -- POS / PC / NETWORK ...
  title      text not null,
  body       text,
  author     text,
  owners     text[] default '{}',              -- 오더 담당자
  status     text default 'doing',
  checks     text[] default '{}',              -- 붙인 체크리스트 항목
  checked    jsonb  default '{}'::jsonb,       -- 체크한 항목
  manual_on  boolean default true,
  created_at timestamptz default now()
);
create index if not exists tasks_date_idx on tasks (work_date);

create table if not exists task_acks (
  task_id bigint references tasks(id) on delete cascade,
  name text, note text, at timestamptz default now(),
  primary key (task_id, name)
);
create table if not exists task_reports (
  id bigserial primary key, task_id bigint references tasks(id) on delete cascade,
  kind text, body text, by_name text, at timestamptz default now()
);
create table if not exists task_used (
  id bigserial primary key, task_id bigint references tasks(id) on delete cascade,
  item_id text references items(id), qty integer, loc_id text references locations(id),
  confirmed boolean default false, at timestamptz default now()
);
create table if not exists task_expenses (
  id bigserial primary key, task_id bigint references tasks(id) on delete cascade,
  kind text, amount integer not null, memo text,
  receipt_url text,                            -- 영수증 사진
  by_name text, at timestamptz default now()
);

-- 5) 예정 업무 --------------------------------------------------
create table if not exists plans (
  id bigserial primary key, d date, store text, recv text,
  owner text, ack text, memo text, created_at timestamptz default now()
);
create table if not exists plan_notes (
  id bigserial primary key, plan_id bigint references plans(id) on delete cascade,
  body text, by_name text, at timestamptz default now()
);

-- 6) 당직 · 정산 ------------------------------------------------
create table if not exists duty_slots (
  ym text, week_no int, day_idx int, kind text,  -- night / weekend
  name text, primary key (ym, week_no, day_idx, kind)
);
create table if not exists duty_as (
  id bigserial primary key, d date, tm time, who text, title text,
  pay boolean default false, why text
);
create table if not exists duty_notes (
  id bigserial primary key, ym text, body text, by_name text,
  shared boolean default false, at timestamptz default now()
);
create table if not exists pay_state (
  ym text, name text, paid boolean default false, primary key (ym, name)
);
create table if not exists pay_rates (
  k text primary key, amount integer not null
);
insert into pay_rates (k, amount) values ('week', 100000), ('asVisit', 50000)
  on conflict (k) do nothing;

-- 7) 그 밖 ------------------------------------------------------
create table if not exists holidays (d date primary key, name text);
create table if not exists checklists (
  id bigserial primary key, cat text not null, item text not null, ord int default 0
);
create table if not exists feedback (
  id bigserial primary key, screen text, kind text, body text,
  who text, at timestamptz default now()
);

-- 8) 사진·영수증 보관함 -----------------------------------------
insert into storage.buckets (id, name, public)
  values ('receipts', 'receipts', false), ('photos', 'photos', false)
  on conflict (id) do nothing;

-- 9) 잠금(RLS) — 로그인한 직원만 읽고 씁니다 ---------------------
-- 세부 권한(본인 것만 / 관리자만)은 개발 단계에서 좁힙니다.
do $$
declare t text;
begin
  foreach t in array array[
    'members','stores','locations','items','stock','inbound','outbound','audits',
    'tasks','task_acks','task_reports','task_used','task_expenses',
    'plans','plan_notes','duty_slots','duty_as','duty_notes','pay_state','pay_rates',
    'holidays','checklists','feedback']
  loop
    execute format('alter table %I enable row level security', t);
    execute format($f$create policy "직원 전체 허용" on %I
                      for all to authenticated using (true) with check (true)$f$, t);
  end loop;
exception when duplicate_object then null;
end $$;

-- 끝. 왼쪽 Table Editor 에서 표 23개가 생겼는지 확인하세요.`;

/* ---------- 단계 ---------- */
const SETUP_STEPS = [
  {
    k: 'vercel', t: 'Vercel 가입 (앱이 도는 곳)',
    d: `앱을 24시간 띄워두는 회사입니다. <b>포스온 명의 회사 이메일</b>로 가입하세요.
        개발자 개인 계정으로 만들면 나중에 넘겨받기가 번거롭습니다.
        가입은 무료이고, 회사 카드는 Pro(월 약 3만원)로 올릴 때 넣습니다.`,
    btns: [['가입 페이지 열기', 'https://vercel.com/signup', 1], ['요금제 보기', 'https://vercel.com/pricing', 0]]
  },
  {
    k: 'supabase', t: 'Supabase 가입 (자료가 쌓이는 곳)',
    d: `업무·거래처·재고·경비가 쌓이는 창고입니다. 사진과 영수증도 여기 들어갑니다.
        <b>같은 회사 이메일</b>로 가입하세요.`,
    btns: [['가입 페이지 열기', 'https://supabase.com/dashboard/sign-up', 1], ['요금제 보기', 'https://supabase.com/pricing', 0]]
  },
  {
    k: 'project', t: '프로젝트 만들기 — 지역은 꼭 서울',
    d: `<b>New project</b> 를 누르고 아래 값을 넣습니다.<br>
        · Name : 아래 「이름 복사」<br>
        · Region : <b>Northeast Asia (Seoul)</b> ← 이걸 골라야 자료가 국내에 남습니다<br>
        · Database Password : 화면이 만들어 주는 값을 쓰고 <b>회사 금고나 비밀번호 관리함에 따로</b> 보관하세요`,
    warn: `⚠️ 데이터베이스 비밀번호와 API 키는 이 화면이나 카카오톡에 붙여넣지 마세요.
           한 번 새어 나가면 자료 전체가 열립니다. 보관은 회사 비밀번호 관리함에만 하세요.`,
    btns: [['새 프로젝트 만들기', 'https://supabase.com/dashboard/new', 1]],
    custom: 'ref'
  },
  {
    k: 'sql', t: '표 23개 자동으로 만들기',
    d: `아래 <b>「SQL 전체 복사」</b>를 누르고, <b>「SQL 편집기 열기」</b>에 붙여넣은 뒤 오른쪽 아래 <b>Run</b> 을 누르면 끝입니다.
        업무·거래처·재고·경비·당직·직원 표가 한 번에 만들어집니다. 손으로 만들 것이 없습니다.`,
    btns: [['SQL 편집기 열기', '@sql', 1]],
    custom: 'sql'
  },
  {
    k: 'deploy', t: '앱 올리기',
    d: `Vercel 에서 <b>New Project</b> → 저장소를 고르고 <b>환경변수 3개</b>만 넣으면 배포됩니다.
        이름은 아래 「환경변수 복사」로 그대로 가져가시고, <b>값은 Supabase → Project Settings → API</b> 에서 복사해
        Vercel 칸에 직접 붙여넣습니다.`,
    warn: `⚠️ 키 값은 반드시 <b>Vercel 환경변수 칸에만</b> 넣습니다. 이 앱 화면·코드·메신저에는 적지 않습니다.
           특히 <b>service_role</b> 키는 자료 전체를 여는 열쇠라 화면에 노출되면 안 됩니다.`,
    btns: [['Vercel 새 프로젝트', 'https://vercel.com/new', 1], ['API 키 있는 곳 열기', '@api', 0]],
    custom: 'env'
  },
  {
    k: 'domain', t: '접속 주소 연결 (work.poson.co.kr)',
    d: `Vercel 프로젝트 → <b>Settings → Domains</b> 에 주소를 넣고,
        <b>poson.co.kr 을 관리하는 곳</b>(도메인 등록업체)에 아래 한 줄을 추가하면 끝입니다.
        자물쇠(HTTPS)는 자동으로 붙습니다.`,
    btns: [['Vercel 대시보드 열기', 'https://vercel.com/dashboard', 1]],
    custom: 'dns'
  },
  {
    k: 'accounts', t: '관리자 · 직원 계정 만들기',
    d: `팀장님 관리자 계정을 먼저 만들고, 직원 10명 계정은 앱의 <b>「직원 · 권한」</b> 화면에서 직접 발급합니다.
        직원이 가입 신청하지 않습니다 — 관리자가 아이디와 임시 암호를 만들어 전달합니다.`,
    btns: [['직원 · 권한 화면으로', '@members', 1]]
  },
  {
    k: 'backup', t: '백업 확인 · 주 1회 내려받기',
    d: `Supabase 가 매일 자동으로 백업합니다(7일 보관). 그것과 별개로 <b>주 1회 파일로 내려받아 회사 PC에 1벌</b>
        두세요. "두 달 전 자료를 봐야 한다" 같은 경우에 필요합니다. 2분이면 됩니다.`,
    btns: [['백업 화면 열기', '@backup', 1]]
  }
];

function setupBtnUrl(u){
  if(u === '@sql')    return supaLink('/sql/new');
  if(u === '@api')    return supaLink('/settings/api');
  if(u === '@backup') return supaLink('/database/backups');
  return u;
}

function adminSetup(){
  const doneN = SETUP_STEPS.filter(s => SETUP.done[s.k]).length;
  const pct = Math.round(doneN / SETUP_STEPS.length * 100);

  const stepBox = (s, i) => {
    const on = !!SETUP.done[s.k];
    return `
    <div class="panel st-p ${on ? 'st-on' : ''}">
      <label class="st-h">
        <input type="checkbox" ${on ? 'checked' : ''} onchange="toggleStep('${s.k}')">
        <span class="st-n">${i + 1}</span>
        <b>${s.t}</b>
        ${on ? '<span class="cat k1">완료</span>' : ''}
      </label>
      <div class="st-d">${s.d}</div>
      ${s.warn ? `<div class="note w st-w">${s.warn}</div>` : ''}
      ${s.custom === 'ref' ? `
        <div class="f" style="margin-top:10px">
          <label>프로젝트 이름 · 만든 뒤 주소</label>
          <div class="cmtform" style="margin-top:0">
            <input value="${esc(SETUP.project)}" onchange="setSetupField('project', this.value)"
                   style="flex:0 0 150px" placeholder="poson-work">
            <button class="btn" onclick="copyText('${jsq(SETUP.project)}','프로젝트 이름을 복사했습니다')">이름 복사</button>
          </div>
          <div class="cmtform" style="margin-top:8px">
            <input id="supaRef" value="${esc(SETUP.ref)}"
                   placeholder="프로젝트를 만든 뒤 주소창 주소를 그대로 붙여넣으세요"
                   onkeydown="if(event.key==='Enter')setSupaRef(this.value)">
            <button class="btn pri" onclick="setSupaRef(document.getElementById('supaRef').value)">연결</button>
          </div>
          <p class="st-s">${SETUP.ref
            ? `✓ <b>${esc(SETUP.ref)}</b> 에 연결됐습니다 — 아래 단계의 Supabase 버튼이 이 프로젝트로 바로 들어갑니다.`
            : '주소를 한 번 넣어두면 다음 단계 버튼들이 <b>이 프로젝트 화면으로 바로</b> 열립니다.'}</p>
        </div>` : ''}
      ${s.custom === 'sql' ? `
        <div class="formbtns" style="margin-top:10px">
          <button class="btn pri" onclick="copyText(SETUP_SQL,'SQL 을 복사했습니다 — SQL 편집기에 붙여넣고 Run')">SQL 전체 복사</button>
          <button class="btn" onclick="cur.sqlOpen=!cur.sqlOpen;render()">${cur.sqlOpen ? '내용 접기' : '내용 미리보기'}</button>
        </div>
        ${cur.sqlOpen ? `<pre class="st-code">${esc(SETUP_SQL)}</pre>` : ''}` : ''}
      ${s.custom === 'env' ? `
        <div class="formbtns" style="margin-top:10px">
          <button class="btn pri" onclick="copyText(envTemplate(),'환경변수 이름을 복사했습니다')">환경변수 복사</button>
        </div>
        <pre class="st-code sm">${esc(envTemplate())}</pre>` : ''}
      ${s.custom === 'dns' ? `
        <div class="f" style="margin-top:10px">
          <label>쓰실 주소</label>
          <div class="cmtform" style="margin-top:0">
            <input value="${esc(SETUP.domain)}" onchange="setSetupField('domain', this.value)" style="flex:0 0 220px">
            <button class="btn" onclick="copyText('${jsq(SETUP.domain)}','주소를 복사했습니다')">주소 복사</button>
          </div>
        </div>
        <div class="tabwrap" style="margin-top:10px"><table class="ktab">
          <tr><th>종류</th><th>이름(Host)</th><th>값(Value)</th></tr>
          <tr><td>CNAME</td><td>work</td><td>cname.vercel-dns.com</td></tr>
        </table></div>
        <div class="formbtns" style="margin-top:10px">
          <button class="btn" onclick="copyText('CNAME\\twork\\tcname.vercel-dns.com','한 줄을 복사했습니다 — 도메인 관리 화면에 붙여넣으세요')">한 줄 복사</button>
        </div>` : ''}
      ${s.btns && s.btns.length ? `
        <div class="formbtns" style="margin-top:10px">
          ${s.btns.map(b => b[1] === '@members'
            ? `<button class="btn ${b[2] ? 'pri' : ''}" onclick="cur.view='members';render();markNav()">${b[0]}</button>`
            : `<button class="btn ${b[2] ? 'pri' : ''}" onclick="openLink('${setupBtnUrl(b[1])}')">${b[0]} ↗</button>`
          ).join('')}
        </div>` : ''}
    </div>`;
  };

  return `
  <div class="mprog">
    <div class="r"><b>세팅 경로 — 가입부터 표 만들기까지</b><span class="pc">${doneN}/${SETUP_STEPS.length} 완료</span></div>
    <div class="bar"><i style="width:${pct}%"></i></div>
    <div style="font-size:12px;color:var(--t3)">
      지금 보고 계신 것은 <b>화면 초안</b>이라 자료가 이 브라우저에만 남습니다.
      아래 8단계를 마치면 <b>회사 서버에 올라가 전 직원이 같은 자료를 봅니다.</b>
      비용은 <b>월 6~7만원</b>(Vercel 3만 + Supabase 3.5만) 수준이고, 인원이 10명이든 20명이든 거의 같습니다.
      체크는 이 브라우저에 저장되니 중간에 닫으셔도 됩니다.
    </div>
  </div>

  <div class="note i" style="margin-top:10px">
    <b>포스온에서 하실 일은 세 가지뿐입니다</b>
    <span style="display:block;margin-top:4px">① Vercel · Supabase 계정을 <b>포스온 명의</b>로 만들고 회사 카드 등록</span>
    <span style="display:block">② <b>work.poson.co.kr</b> 주소 한 줄 추가</span>
    <span style="display:block">③ 관리자 계정을 받아 직원 계정 발급</span>
    <span style="display:block;margin-top:4px;color:var(--t3)">나머지 — 표 만들기 · 앱 올리기 · 자물쇠(HTTPS) — 는 아래 버튼과 개발자가 합니다</span>
  </div>

  ${SETUP_STEPS.map(stepBox).join('')}

  <div class="panel">
    <h4>진행 상황 전달</h4>
    <div class="desc" style="margin:0 0 12px">
      어디까지 하셨는지 개발자에게 알려주시면 이어서 진행합니다. 계정 정보나 키는 담기지 않습니다 —
      <b>어느 단계까지 했는지와 프로젝트 이름만</b> 들어갑니다.
    </div>
    <div class="formbtns" style="margin-top:0">
      <button class="btn pri" onclick="sendSetupStatus(this)">개발자에게 알리기</button>
      <button class="btn" onclick="copySetupSummary()">진행 상황 복사</button>
      <button class="btn" onclick="window.print()">인쇄 · PDF</button>
      <button class="btn" style="margin-left:auto" onclick="resetSetup()">진행 상태 초기화</button>
    </div>
  </div>`;
}

/* ===========================================================
   가이드북 — 실무자 가이드북을 앱 안에서
   ⚠️ 본문은 index.html 의 <script type="text/markdown" id="guideMd"> 에 들어 있습니다.
      같은 내용이 실무자-가이드북.md 파일에도 있습니다 — 고칠 때 두 곳을 함께 고치세요.
   =========================================================== */
function guideSource(){
  const el = document.getElementById('guideMd');
  return el ? el.textContent : '';
}

/* 아주 작은 마크다운 → 화면 변환기 (제목·표·목록·굵게·코드만) */
function mdToHtml(md){
  const e = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inl = s => e(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  const L = md.split('\n');
  const out = [];
  let i = 0;
  while(i < L.length){
    const s = L[i];

    if(/^```/.test(s)){                              /* 코드 덩어리 */
      const buf = []; i++;
      while(i < L.length && !/^```/.test(L[i])) buf.push(L[i++]);
      i++; out.push(`<pre class="gd-code">${e(buf.join('\n'))}</pre>`); continue;
    }
    if(/^>/.test(s)){                                /* 인용 */
      const buf = [];
      while(i < L.length && /^>/.test(L[i])) buf.push(L[i++].replace(/^>\s?/, ''));
      out.push(`<div class="gd-q">${mdToHtml(buf.join('\n'))}</div>`); continue;
    }
    if(/^\|/.test(s) && /^\|[\s\-:|]+\|$/.test(L[i + 1] || '')){   /* 표 */
      const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(s); i += 2;
      const rows = [];
      while(i < L.length && /^\|/.test(L[i])) rows.push(cells(L[i++]));
      out.push(`<div class="tabwrap"><table class="ktab gd-t">
        <tr>${head.map(h => `<th>${inl(h)}</th>`).join('')}</tr>
        ${rows.map(r => `<tr>${r.map(c => `<td>${inl(c)}</td>`).join('')}</tr>`).join('')}
      </table></div>`); continue;
    }
    const h = s.match(/^(#{1,4})\s+(.*)$/);
    if(h){
      const n = h[1].length;
      const id = 'gh' + out.length;
      out.push(`<h${n + 1} class="gd-h gd-h${n}" id="${id}">${inl(h[2])}</h${n + 1}>`); i++; continue;
    }
    if(/^(-{3,}|\*{3,})\s*$/.test(s)){ out.push('<hr class="gd-hr">'); i++; continue; }
    if(/^\s*[-*]\s+/.test(s)){                       /* 글머리 목록 */
      const buf = [];
      while(i < L.length && /^\s*[-*]\s+/.test(L[i])){
        let t = L[i++].replace(/^\s*[-*]\s+/, '');
        t = t.replace(/^\[\s\]\s*/, '☐ ').replace(/^\[x\]\s*/i, '☑ ');
        buf.push(`<li>${inl(t)}</li>`);
      }
      out.push(`<ul class="gd-ul">${buf.join('')}</ul>`); continue;
    }
    if(/^\s*\d+\.\s+/.test(s)){                      /* 번호 목록 */
      const buf = [];
      while(i < L.length && /^\s*\d+\.\s+/.test(L[i]))
        buf.push(`<li>${inl(L[i++].replace(/^\s*\d+\.\s+/, ''))}</li>`);
      out.push(`<ol class="gd-ol">${buf.join('')}</ol>`); continue;
    }
    if(!s.trim()){ i++; continue; }
    const buf = [];                                  /* 문단 */
    while(i < L.length && L[i].trim() && !/^(#{1,4}\s|\||>|```|-{3,}|\s*[-*]\s|\s*\d+\.\s)/.test(L[i]))
      buf.push(L[i++]);
    out.push(`<p class="gd-p">${inl(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}

function downloadGuide(){
  const md = guideSource();
  if(!md){ toast('가이드북 내용을 찾지 못했습니다'); return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
  a.download = '포스온-실무자-가이드북.md';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  toast('가이드북 파일을 내려받았습니다');
}

function adminGuide(){
  const md = guideSource();
  if(!md) return `<div class="empty"><b>가이드북 내용을 찾지 못했습니다</b>
    <p>index.html 의 guideMd 블록이 지워졌는지 확인해주세요.</p></div>`;

  const q = (cur.gq || '').trim();
  /* 검색하면 그 말이 들어간 줄만 모아 보여줍니다 (어느 장인지 함께) */
  if(q){
    const L = md.split('\n');
    let sec = '';
    const hit = [];
    L.forEach(line => {
      const h = line.match(/^#{1,3}\s+(.*)$/);
      if(h) sec = h[1];
      else if(line.includes(q) && line.trim()) hit.push({ sec, line });
    });
    return guideHead(q) + (hit.length
      ? `<div class="panel">${hit.slice(0, 80).map(x => `
          <div class="gd-hit"><span class="gd-hs">${esc(x.sec)}</span>
            <div>${mdToHtml(x.line)}</div></div>`).join('')}
         ${hit.length > 80 ? `<p class="st-s">…앞 80줄만 보여드립니다. 더 좁혀서 찾아보세요.</p>` : ''}</div>`
      : `<div class="empty"><b>"${esc(q)}" 를 찾지 못했습니다</b><p>다른 낱말로 찾아보세요.</p></div>`);
  }

  /* 목차 — 큰 제목만. 책 제목과 「목차」 줄은 빼되, 본문에서 세는 자리는 그대로 둡니다 */
  const toc = md.split('\n').filter(l => /^#{1,2}\s/.test(l))
                .map((l, i) => ({ i, t: l.replace(/^#{1,2}\s+/, '') }))
                .filter(x => x.i > 0 && x.t !== '목차');

  return guideHead('') + `
  <div class="panel gd-toc">
    <h4>목차</h4>
    <div class="gd-tl">${toc.map(x =>
      `<button class="gd-tb" onclick="document.querySelectorAll('.gd-h1,.gd-h2')[${x.i}]?.scrollIntoView({behavior:'smooth'})">${esc(x.t)}</button>`
    ).join('')}</div>
  </div>
  <div class="panel gd-body">${mdToHtml(md)}</div>`;
}

function guideHead(q){
  return `
  <div class="mprog">
    <div class="r"><b>실무자 가이드북</b><span class="pc">직원에게 그대로 나눠주셔도 됩니다</span></div>
    <div style="font-size:12px;color:var(--t3)">
      앱 사용법 전부가 들어 있습니다. 신입에게는 <b>2장(하루 업무 흐름)</b>만 보여주셔도 하루가 돌아갑니다.
    </div>
  </div>
  <div class="stockbar">
    <div class="msearch" style="margin:0;flex:1;min-width:180px">
      <svg class="ic"><use href="#i-search"/></svg>
      <input value="${esc(q)}" placeholder="가이드북 안에서 찾기 (예: 반납, 당직, 실사)"
             oninput="cur.gq=this.value" onkeydown="if(event.key==='Enter')render()">
    </div>
    ${q ? `<button class="btn" onclick="cur.gq='';render()">지우기</button>` : ''}
    <button class="btn" onclick="window.print()">인쇄 · PDF</button>
    <button class="btn" onclick="downloadGuide()">파일로 내려받기</button>
  </div>`;
}

/* ===========================================================
   관리자 페이지 껍데기
   =========================================================== */
function viewAdmin(){
  if(!isAdmin()){
    return `<div class="empty"><div class="em"><svg class="ic ic-lg"><use href="#i-lock"/></svg></div>
      <b>관리자만 볼 수 있는 화면입니다</b>
      <p>고칠 곳이 보이시면 관리자에게 알려주세요.</p></div>`;
  }
  const tab = cur.atab || 'confirm';
  const body = tab === 'guide' ? adminGuide()
             : tab === 'setup' ? adminSetup()
             : (typeof viewConfirm === 'function' ? viewConfirm()
                : '<div class="empty"><b>컨펌 화면을 불러오지 못했습니다</b></div>');

  let lastG = null;
  const tabs = ADMIN_TABS.map(t => {
    const gl = (t.g && t.g !== lastG) ? `<span class="ad-g">${t.g}</span>` : '';
    lastG = t.g;
    return gl + `<button class="tab ${tab === t.k ? 'on' : ''}" onclick="setAdminTab('${t.k}')">${t.l}</button>`;
  }).join('');

  return `
  <style>
    .ad-tabs{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px}
    .ad-g{font-size:11px;font-weight:700;color:var(--t3);padding-left:8px;border-left:1px solid var(--line)}
    .st-p{border-left:3px solid var(--line)}
    .st-on{border-left-color:var(--green,#2e9e5b);background:var(--card)}
    .st-h{display:flex;align-items:center;gap:9px;font-size:15px;cursor:pointer}
    .st-h input{flex:none;width:17px;height:17px}
    .st-n{flex:none;width:22px;height:22px;border-radius:50%;background:var(--navy-50);color:var(--navy);
          font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center}
    .st-d{font-size:13.5px;color:var(--t2);line-height:1.65;margin-top:9px}
    .st-w{margin-top:10px;font-size:13px;line-height:1.6}
    .st-s{font-size:12px;color:var(--t3);margin:8px 0 0}
    .st-code{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:11px;
             font-family:ui-monospace,monospace;font-size:11.5px;line-height:1.55;
             max-height:340px;overflow:auto;white-space:pre;margin:10px 0 0}
    .st-code.sm{max-height:150px}
    .gd-body{line-height:1.75}
    .gd-h{margin:22px 0 10px;line-height:1.4}
    .gd-h1{font-size:20px;border-bottom:2px solid var(--navy);padding-bottom:7px}
    .gd-h2{font-size:17px;color:var(--navy);border-bottom:1px solid var(--line);padding-bottom:5px}
    .gd-h3{font-size:15px}
    .gd-h4{font-size:13.5px;color:var(--t2)}
    .gd-p{font-size:14px;color:var(--t1);margin:9px 0}
    .gd-ul,.gd-ol{margin:9px 0 9px 20px;font-size:14px}
    .gd-ul li,.gd-ol li{margin:4px 0;line-height:1.7}
    .gd-q{border-left:3px solid var(--navy-line);background:var(--navy-50);border-radius:0 8px 8px 0;
          padding:10px 14px;margin:12px 0}
    .gd-q .gd-p{margin:5px 0}
    .gd-hr{border:0;border-top:1px solid var(--line);margin:20px 0}
    .gd-code{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:12px;
             font-family:ui-monospace,monospace;font-size:12px;line-height:1.7;overflow:auto;white-space:pre}
    .gd-t{font-size:13px}
    .gd-t td{vertical-align:top}
    .gd-tl{display:flex;flex-wrap:wrap;gap:7px}
    .gd-tb{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:5px 11px;
           font:inherit;font-size:12.5px;cursor:pointer;color:var(--t2)}
    .gd-tb:hover{border-color:var(--navy);color:var(--navy)}
    .gd-hit{padding:9px 0;border-top:1px solid var(--line)}
    .gd-hit:first-child{border-top:0}
    .gd-hs{font-size:11px;font-weight:700;color:var(--navy);background:var(--navy-50);
           border:1px solid var(--navy-line);border-radius:999px;padding:2px 8px;display:inline-block;margin-bottom:4px}
    .gd-hit .gd-p{margin:2px 0}
    @media print{ .ad-tabs,.stockbar,.gd-toc{display:none!important} }
  </style>

  <div class="ad-tabs">${tabs}</div>
  ${body}`;
}
