## DEV LOG — 2026-03-09

### 작업 제목

메인 메뉴 좌우 레이아웃 변경, 이벤트 바인딩 추가, 로컬스토리지 안전성 개선


### 작업 목적



### 변경 파일

* js/game.js


### Before
* `localStorage`에 저장된 데이터가 손상되었을 때 `JSON.parse`가 예외를 던질 가능성이 있어 저장/불러오기 루틴에서 런타임 오류 발생 위험.

### After

* 테마 버튼에 `.theme-card` 클래스 추가하여 정사각 비율 유지(`aspect-ratio:1/1`).
* `index.html`에서 인라인 핸들러를 제거하고 `js/game.js`의 `bindUI()`에서 모든 UI 이벤트를 바인딩하도록 변경.
* `app/storage.js`의 `saveRanking` 함수에 `try/catch`를 추가하여 잘못된 로컬스토리지 데이터를 복구하고 `setItem` 실패를 안전하게 처리.


### 구현 내용

  - 테마 버튼에 `data-theme`, 난이도 버튼에 `data-difficulty` 속성 사용.

  - `.menu-container` (grid 1fr 1fr, gap:32px) 추가 및 `.theme-section`, `.difficulty-section` 스타일 정의.
  - `.theme-card { aspect-ratio:1/1 }`, `.difficulty-btn { padding:20px }`, `@media (max-width:768px)`에서 1열 전환 규칙 추가.

* `js/game.js`
  - `bindUI()` 추가: DOMContentLoaded 이후 또는 스크립트 초기화 시 `.theme-btn`, `.difficulty-btn`, `#ranking-btn`, `#restart-btn`, `#menu-btn` 등 요소에 이벤트리스너 등록.
  - 기존 인라인 핸들러 동작을 JS로 대체하여 구조 분리.

* `app/storage.js`
  - `saveRanking` 내부에 `try/catch`로 `JSON.parse` 오류를 방지하고, `localStorage.setItem` 실패 시 콘솔에 에러를 기록하도록 변경.


### 테스트 시나리오

3. 모바일(<=768px)에서 두 영역이 세로로 쌓여 표시되는지 확인한다.
4. 테마 버튼 클릭 시 테마가 적용되는지(콘솔 오류 없음) 확인한다.
5. 난이도 버튼 클릭 시 `startGame(diff)`가 호출되어 게임 화면으로 전환되는지 확인한다.
6. 랭킹 오픈/닫기, 다시 시작, 메뉴로 이동 버튼 동작 확인.
7. `localStorage`에 잘못된(손상된) JSON이 존재하는 상태에서 랭킹 저장 동작을 시도해도 예외가 발생하지 않는지 확인.


### 다음 작업

* 게임플레이 단계별(카드 두 번 클릭, 빠른 클릭, 뒤집기 중 추가 클릭, 매칭 로직) 정적/수동 테스트 및 발견된 문제에 대한 코드 패치 작성.


## DEV LOG — 2026-03-09

iPad 레이아웃 안정화 및 카드 보이지 않음 문제 완화


### 작업 목적

* iPad 세로(1024x1366) 및 기타 제한된 세로 공간(예: 1180x820)에서 카드가 보이지 않거나 보드가 잘리는 문제를 완화.

### 변경 파일

* css/board.css

### Before
* `.game-board-wrapper`가 고정된 `max-height:900px`과 `overflow:hidden`로 설정되어, 뷰포트 높이가 작아지면 보드 일부가 잘릴 수 있음.
* `#game-board` `max-width:700px`으로 제한되어 태블릿에서 활용 가능한 너비를 충분히 사용하지 못함.
* 카드의 `max-width`/`max-height`가 너무 작게 고정되어 있거나 반응형 감소 규칙이 없어 일부 해상도에서 가독성/터치 영역 문제가 발생할 수 있음.

### After

* `#game-board`의 `max-width`를 `min(90vw,1100px)`로 변경하여 태블릿 화면에서 더 넓은 보드 사용이 가능하도록 개선.
* `.card-container`의 `max-width`/`max-height`를 태블릿에서 140px로 증가시키고, 작은 높이 화면에 대응하는 미디어 쿼리를 추가하여 카드 크기를 동적으로 축소하도록 함.
* `#game-board`에 `grid-auto-rows:1fr`을 추가하여 그리드 행 높이가 균등 분배되도록 보완.


### 구현 내용

  - `.game-board-wrapper`에 `padding:8px` 추가 및 `.game-board-wrapper.scrollable` 규칙 추가.
  - `#game-board { max-width: min(90vw, 1100px); }`로 태블릿에서 가로폭 확장.
  - `.timer-bar-track` 너비를 `min(40vw,200px)`로 변경하여 작은 화면에서 타이머 바가 UI를 밀어내지 않도록 함.
* `css/board.css`
  - `.card-container`의 `max-width`/`max-height`를 140px로 증가.
  - `#game-board { grid-auto-rows:1fr; }` 추가.
  - `@media (max-width:1180px)` 및 `@media (max-height:700px)` 규칙 추가로 작은 화면에서 카드 크기 축소 및 간격 감소 적용.

### 테스트 시나리오
1. iPad 해상도(1024x1366)에서 페이지 열기: 테마/난이도 레이아웃과 게임 보드가 잘 보이는지 확인.
2. iPad-like 해상도(1180x820)에서 페이지 열기: 보드가 세로로 잘리지 않고 스크롤이 가능하거나 카드가 축소되어 보이는지 확인.
3. 난이도별(특히 `veryhard`)에서 8행 이상의 그리드가 작은 높이에서 보이는지 확인.
4. 통계(스코어/타이머) UI가 보드와 겹치지 않는지 확인. 타이머 바가 줄어들면서 레이아웃을 깨지 않아야 함.


### 다음 작업

* 브라우저에서 실제 iPad 시뮬레이션(또는 실기기)으로 레이아웃 확인 후 `game-board-wrapper`에 자동 `scrollable` 클래스를 JS로 토글하는 로직 적용 검토.
* 필요 시 `game-board-wrapper`의 `max-height`를 동적으로 계산하여 푸터/헤더 높이에 맞춰 조정.
* 게임플레이 테스트(카드 보기/클릭)를 수행하여 UI 변경이 인터랙션에 영향을 주지 않는지 확인.


### 2026-03-09 — 보드 자동 스크롤 토글 추가 (iPad 대응)

### 작업 제목

`game-board-wrapper`에 자동 `scrollable` 클래스 토글 로직 추가


### 작업 목적

* iPad나 세로 높이가 제한된 환경에서 보드가 잘리는 경우 자동으로 스크롤을 허용하여 카드 접근성을 개선.


### 변경 파일

* js/game.js


### Before

* 보드가 세로로 잘릴 때 자동으로 스크롤되지 않아 일부 카드를 볼 수 없는 문제가 발생 가능.

### After

* `js/game.js`에 `adjustBoardScrollable()` 함수를 추가하여 보드의 `scrollHeight`와 래퍼 `clientHeight`를 비교하고 필요시 `.scrollable` 클래스를 추가하도록 함.


### 구현 내용

* `js/game.js`
  - `adjustBoardScrollable()` 추가: DOM 측정 후 `.game-board-wrapper.scrollable` 클래스를 토글.
  - `window.resize` 이벤트에 바인딩하여 창 크기 변경 시 재평가.
  - 초기화 시 한 번 평가하도록 `setTimeout` 호출 추가.
  - 함수는 `window.adjustBoardScrollable`로 노출되어 수동 테스트 가능.


### 테스트 시나리오

1. iPad 해상도(1024x1366)에서 페이지 열기: 보드가 잘리지 않으면 `.game-board-wrapper`에 `scrollable` 클래스가 없는지 확인.
2. 작은 세로 높이(예: 1180x820)에서 페이지 열기: 보드가 래퍼보다 클 경우 `.game-board-wrapper`에 `scrollable` 클래스가 추가되어 스크롤이 가능한지 확인.
3. 창 크기 조절(리사이즈) 시 클래스가 토글되는지 확인.


### 다음 작업

* 실제 기기(아이패드) 또는 브라우저 디바이스 모드에서 결과를 확인하고 필요 시 `scrollable` 클래스의 스타일(예: `-webkit-overflow-scrolling: touch`)을 추가.
* 게임플레이 테스트(특히 많은 카드 그리드)로 스크롤 허용이 인터랙션에 문제를 일으키지 않는지 확인.


### 2026-03-09 — 매칭/스코어 관련 코드 방어적 수정

### 작업 제목

`checkMatch` 방어 처리 및 `updateStats`에서 점수 표기 수정


### 작업 목적

* 빠른 이벤트 흐름이나 비동기 상황에서 `checkMatch()`가 비정상적으로 호출되어 발생할 수 있는 undefined 참조 오류를 방지.
* UI의 `score-display`가 항상 '0'으로 표시되는 문제를 수정하여 실제 계산된 점수를 표시.


### 변경 파일

* js/board.js
* js/game.js


### Before

* `checkMatch()`에서 `MG.flippedCards` 길이가 2 미만인 상황에서 접근하면 `MG.cards[second]`가 undefined가 되어 오류가 발생할 가능성이 있음.
* `updateStats()`가 `score-display`에 하드코딩된 `'0'`을 쓰고 있어 실제 점수가 반영되지 않음.

### After

* `checkMatch()` 시작부에 `if(!MG.flippedCards || MG.flippedCards.length < 2) return;` 추가로 안전성 확보.
* `updateStats()`에서 `window.calculateScore()`가 있으면 이를 사용해 `score-display`에 점수를 출력하도록 변경.


### 구현 내용

* `js/board.js`
  - `checkMatch()`에 플립된 카드 수 검사 추가.

* `js/game.js`
  - `updateStats()`에서 `score-display`를 계산된 점수로 채우도록 변경. 기존 하드코딩을 제거.


### 테스트 시나리오

1. 빠른 연속 클릭 시 콘솔 오류(`Cannot read property 'matchKey' of undefined` 등)가 발생하지 않는지 확인.
2. 카드 매칭/불일치 시 정상적으로 동작하는지 확인.
3. 게임 진행 중 `score-display`가 변화하여 실제 점수가 표시되는지 확인.


### 다음 작업

* 브라우저에서 위 변경 사항을 확인하고, 추가적인 콘솔 오류가 있으면 보고 및 수정.
* iPad/모바일에서 인터랙션(빠른 클릭, 여러 터치) 테스트를 통해 레이스 컨디션 여부를 점검.


### 2026-03-09 — 방어적 코드 보강: flipCard 가드 및 formatTime 중복 방지

### 작업 제목

flipCard 인자 검사 추가 및 전역 `formatTime` 정의 충돌 방지


### 작업 목적

* `flipCard` 호출 시 잘못된 인덱스나 비어있는 카드 데이터로 인한 런타임 오류를 방지.
* 여러 파일에서 `formatTime`을 전역으로 선언하여 발생할 수 있는 충돌을 방지하고 단일 진입점을 보장.


### 변경 파일

* js/board.js
* js/timer.js


### Before

* `flipCard(index)`에서 `index`가 유효하지 않거나 `MG.cards[index]`가 없는 경우 런타임 에러가 발생할 수 있음.
* `formatTime`이 `timer.js`와 `game.js`에서 중복 선언되어 혼란 가능.

### After

* `flipCard` 시작부에 `typeof index` 및 카드 존재 여부 검사를 추가하여 안전하게 리턴하도록 수정.
* `timer.js`에서 `window.formatTime`이 이미 정의되어 있지 않을 경우에만 할당하도록 변경하여 중복 선언을 피함.


### 구현 내용

* `js/board.js`: `if(typeof index !== 'number' || !MG.cards || !MG.cards[index]) return;` 추가.
* `js/timer.js`: 기존 `formatTime`을 직접 선언하지 않고 `if(!window.formatTime) window.formatTime = ...` 방식으로 변경.


### 테스트 시나리오

1. 빠른 클릭/잘못된 DOM 상황에서 `flipCard`가 호출되어도 콘솔 오류가 발생하지 않는지 확인.
2. `formatTime`이 정상적으로 동작하며 `window.formatTime`이 예상되는 값을 반환하는지 확인.


### 다음 작업

* 전체 게임 시나리오(1~10 단계)에 대한 정적/수동 테스트를 시행하여 추가적인 레이스 컨디션 또는 콘솔 오류를 식별.
* 발견된 버그에 대해 우선순위를 정해 추가 패치를 적용.




