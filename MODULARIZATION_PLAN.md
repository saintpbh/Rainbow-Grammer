# Rainbow Grammar 모듈화 리팩토링 계획 (Modularization Plan)

## 1. 현황 분석 (Current Status)
현재 `index.html` 파일이 약 2,300줄에 달하며, 다음 요소들이 혼재되어 있어 유지보수가 어렵습니다.
- **구조 (HTML)**
- **스타일 (CSS)**: 약 800줄
- **데이터 (JSON)**: 일부 하드코딩 및 로딩 로직
- **게임 로직 (JS)**: 상태 관리, 정답 체크, 레벨 진행
- **UI 로직 (JS)**: DOM 조작, 모달 제어, 애니메이션
- **오디오 로직 (JS)**: TTS 제어

## 2. 목표 구조 (Target Architecture)
프로젝트를 역할별로 분리하여 **확장성**과 **안정성**을 확보합니다.

```
Rainbow Grammar/
├── index.html              # 진입점 (깡통 HTML)
├── css/                    # 스타일 시트
│   ├── main.css            # 기본 레이아웃, 변수
│   ├── components.css      # 버튼, 카드, 모달 등 UI 컴포넌트
│   └── animations.css      # 애니메이션 효과
├── js/                     # 자바스크립트 모듈 (ES Modules 사용)
│   ├── main.js             # 앱 초기화 및 메인 컨트롤러
│   ├── game.js             # 게임 규칙, 상태 관리 (Engine)
│   ├── ui.js               # 화면 업데이트, 이벤트 처리 (View)
│   ├── audio.js            # 음성 합성(TTS) 및 효과음 관리
│   ├── data.js             # 커리큘럼 데이터 로딩 및 저장 (Persistence)
│   └── utils.js            # 유틸리티 함수 (Shuffle 등)
└── data/                   # 데이터 파일
    └── curriculum.json     # 학습 콘텐츠 데이터
```

## 3. 상세 역할 분담

### 1) Data Module (`js/data.js`)
- `grammar_data.json` 로딩
- `localStorage` 관리 (진도 저장을 `game.js`에서 분리)
- Practice Mode vs Normal Mode 데이터 필터링 제공

### 2) UI Module (`js/ui.js`)
- `innerHTML` 생성을 전담
- 점수판 업데이트, 모달 표시/숨김 함수 제공
- **이점**: 게임 로직 개발자는 더 이상 HTML 구조를 신경 쓰지 않고 `ui.updateScore()`만 호출하면 됨.

### 3) Audio Module (`js/audio.js`)
- `SpeechSynthesis` API 래핑
- 속도 조절(0.75x ~ 1.5x) 로직 캡슐화
- 효과음 재생

### 4) Game Module (`js/game.js`)
- 현재 레벨(`currentGlobalLevelIndex`) 관리
- 정답 체크 로직 (`checkAnswer`)
- 점수 계산 로직

## 4. 진행 단계 (Execution Roadmap)

- **Phase 1: 스타일 분리 (CSS Extraction)**
  - `index.html`의 `<style>` 태그 내용을 `css/*.css` 파일로 분리
  - `index.html` 가독성 즉시 개선

- **Phase 2: 유틸리티 및 데이터 분리 (JS Refactoring 1)**
  - 의존성이 적은 `utils.js`, `audio.js` 먼저 분리
  - `data.js`를 만들어 데이터 로딩 부분 이관

- **Phase 3: 핵심 로직 분리 (JS Refactoring 2)**
  - UI 조작 코드와 게임 상태 코드를 분리 (`ui.js` / `game.js`)
  - `main.js`에서 모듈 조립

## 5. 기대 효과
1. **버그 감소**: UI 수정이 게임 로직을 망가뜨리지 않음 (반대도 마찬가지).
2. **협업 용이**: 디자이너는 CSS만, 개발자는 JS만 작업 가능.
3. **기능 확장**: 추후 '타이핑 모드'나 '단어장' 추가 시 기존 코드를 재사용하기 쉬움.
