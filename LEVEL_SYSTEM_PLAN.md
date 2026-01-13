# Rainbow Grammar: Spicy Level System Development Plan

## 1. 개요 (Overview)
*   **목표**: 기존 28일 코스를 '순한맛'으로 정의하고, 이를 클리어할 때마다 난이도가 상승하는 '매운맛(Spicy)' 레벨 시스템 도입.
*   **핵심 컨셉**: 
    *   **반복되는 28일 주기**: 각 레벨은 동일하게 28일(Day 1~28)로 구성됨.
    *   **고추 시스템**: Cycle 클리어 시 `🌶️` 획득. 최대 5개까지 수집.
    *   **점진적 과부하**: 문장 5형식 구조는 유지하되, 어휘/길이/문법적 깊이를 심화.

---

## 2. 난이도별 커리큘럼 (The 5 Spicy Levels)

각 레벨은 Day 1~28의 구성을 따르지만, 문장의 복잡도가 달라집니다.

### 🌶️ Level 0: 순한맛 (Mild) - "뼈대 세우기"
*   **현재 상태**: 기존 레인보우 그래머 콘텐츠.
*   **특징**:
    *   주어/동사/목적어의 구분이 명확.
    *   단문 위주 (5단어 내외).
    *   기초 단어 (CEFR A1-A2).
    *   직관적인 1:1 번역.
*   **예시**: "Birds sing." (새들이 노래한다.)

### 🌶️ Level 1: 약간 매운맛 (Spicy 1) - "살 붙이기"
*   **특징**:
    *   형용사, 부사 등 **수식어(Modifier)**의 적극적 활용.
    *   문장 길이 증가 (7~10단어).
    *   관사(a/the)와 전치사구의 정확한 사용.
*   **예시**: "The colorful birds sing happily in the morning." (그 다채로운 새들은 아침에 행복하게 노래한다.)

### 🌶️🌶️ Level 2: 중간 매운맛 (Spicy 2) - "시간과 태"
*   **특징**:
    *   다양한 **시제(Tense)** 변환 (현재완료, 과거진행 등).
    *   **수동태** 및 **조동사** 활용.
    *   상황에 따른 뉘앙스 차이 학습.
*   **예시**: "The birds have been singing strictly since dawn." (새들은 새벽부터 계속해서 노래하고 있다.)

### 🌶️🌶️🌶️ Level 3: 아주 매운맛 (Spicy 3) - "연결과 확장"
*   **특징**:
    *   **접속사**를 활용한 복문(Compound Sentences).
    *   관계대명사절 사용 (Chunk 덩어리가 커짐).
    *   추상적인 주제 다루기.
*   **예시**: "Birds sing because they want to attract mates." (새들은 짝을 유혹하고 싶어서 노래한다.)

### 🌶️🌶️🌶️🌶️ Level 4: 불닭맛 (Spicy 4) - "세련된 표현"
*   **특징**:
    *   원어민이 쓰는 **관용구(Idioms)** 및 구동사.
    *   비즈니스/학술적 어휘.
    *   도치 구문 등 고급 패턴.
*   **예시**: "It is essential for birds to exhibit their vocal prowess." (새들이 자신의 목소리 기량을 뽐내는 것은 필수적이다.)

### 🌶️🌶️🌶️🌶️🌶️ Level 5: 핵불닭맛 (Max Spicy) - "마스터리"
*   **특징**:
    *   뉴스, 연설문 수준의 호흡.
    *   문학적 표현.
    *   빠른 오디오 속도.

---

## 3. 기술적 구현 계획 (Technical Arch)

### A. 데이터 구조 개편 (Data Restructuring)
기존의 평면적인 파일 구조를 계층화합니다.

*   **AS-IS**: `/week1.json`
*   **TO-BE**:
    *   `/data/level0/day1.json` ... `day28.json`
    *   `/data/level1/day1.json` ...
    *   또는 `/data/level_data.json` 하나에 모든 레벨 데이터를 인덱싱 (로딩 속도 고려).

**JSON 구조 변경안**:
```json
{
  "level": 1, 
  "season_name": "Spicy 1",
  "curriculum": [ ... ] 
}
```

### B. 상태 관리 (State Management)
`js/state.js` 및 `localStorage` 업데이트가 필요합니다.

```javascript
const gameState = {
    currentLevel: 0,     // 0 ~ 5 (매운맛 단계)
    globalDayIndex: 0,   // 0 ~ 27 (28일 주기)
    totalSentences: 0,   // 누적 학습량
    // ...
};
```

### C. UI/UX 업데이트
1.  **레벨 표시기**: 상단 바에 현재 고추 개수 표시 (예: 🌶️ x 2).
2.  **레벨업 연출**: Day 28 클리어 시, 불꽃 애니메이션과 함께 고추 획득 모달 띄우기.
3.  **테마 변화**: 난이도가 올라갈수록 UI의 포인트 컬러가 점점 붉게 변화 (Blue -> Purple -> Red -> Dark Red).

---

## 4. 단계별 실행 계획 (Action Plan)

### Step 1: 데이터 구조 마이그레이션
1.  현재 `week1~4.json` 데이터를 `data/level0/` 폴더로 이동 및 통합.
2.  `js/game.js`의 데이터 로딩 로직을 폴더 기반으로 변경.

### Step 2: 레벨 시스템 로직 구현
1.  `js/state.js`에 `currentLevel` 속성 추가.
2.  Day 28 완료 시 점검 로직:
    *   `currentLevel < 5` 이면 `currentLevel++`, `globalDayIndex = 0`으로 초기화.
    *   축하 메시지 및 데이터 새로 로드.

### Step 3: Spicy 1 (Sample) 데이터 생성
1.  기존 Day 1~3 정도의 데이터를 '매운맛 1단계'로 변형하여 샘플 데이터 생성.
2.  레벨업 테스트 진행.

### Step 4: UI 고도화
1.  고추 아이콘 및 레벨 뱃지 디자인 적용.
2.  테마 색상 변경 로직 추가.

---

## 5. 예상 이슈 및 고려사항
*   **콘텐츠 제작량**: 28일 x 10문장 x 5레벨 = **1,400 문장**의 데이터가 필요함.
    *   *대안*: 우선 Level 1의 첫 며칠만 구현하고, 나머지는 "업데이트 예정"으로 막아두거나, AI를 활용해 기존 문장을 자동 변환하여 데이터를 채움.
*   **학습 이어하기**: 사용자가 Level 1을 하다가 너무 어려우면 Level 0으로 돌아갈 수 있어야 하는가? (자유 이동 모드 고려)
