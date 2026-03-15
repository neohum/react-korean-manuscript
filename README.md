# react-korean-manuscript

한국어 원고지 React 컴포넌트 및 유틸리티 패키지입니다.

Korean manuscript paper (원고지) React components and utilities.

[![npm version](https://badge.fury.io/js/react-korean-manuscript.svg)](https://badge.fury.io/js/react-korean-manuscript)

## 설치 / Installation

```bash
npm install react-korean-manuscript
# or
pnpm add react-korean-manuscript
# or
yarn add react-korean-manuscript
```

## 기본 사용법 / Basic Usage

### `<Manuscript />` 컴포넌트

```tsx
import { Manuscript } from 'react-korean-manuscript';

export default function App() {
  return (
    <Manuscript
      text="옛날 옛적에 한 마을이 있었습니다."
      showRowNums={true}
    />
  );
}
```

### 커서 위치 표시

```tsx
import { Manuscript, buildCursorMaps } from 'react-korean-manuscript';
import { useState } from 'react';

export default function Editor() {
  const [text, setText] = useState('');
  const [cursorPos, setCursorPos] = useState(0);

  const { charToCell } = buildCursorMaps(text);
  const cursorCell = charToCell[cursorPos] ?? null;

  return (
    <Manuscript
      text={text}
      cursorCell={cursorCell}
      cursorSide="right"
      onCellClick={(cellIndex, side) => {
        // 셀 클릭 시 커서 이동 처리
        console.log('클릭된 셀:', cellIndex, '위치:', side);
      }}
    />
  );
}
```

### 맞춤법 오류 하이라이트

```tsx
import { Manuscript, buildCursorMaps } from 'react-korean-manuscript';

// spellErrors: [{ token: string, charOffset: number }]
function ManuscriptWithErrors({ text, spellErrors }) {
  const { charToCell } = buildCursorMaps(text);

  const errorCells = new Set<number>();
  spellErrors.forEach(err => {
    const idx = err.charOffset;
    for (let k = idx; k < idx + err.token.length; k++) {
      const cell = charToCell[k];
      if (cell !== undefined) errorCells.add(cell);
    }
  });

  return <Manuscript text={text} errorCells={errorCells} />;
}
```

## Props / API

### `<Manuscript />` Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `text` | `string` | 필수 | 렌더링할 텍스트 |
| `showSpaceMarks` | `boolean` | `false` | 공백 표시 여부 |
| `cursorCell` | `number \| null` | `null` | 커서 셀 인덱스 |
| `cursorSide` | `'left' \| 'right'` | `'right'` | 커서 위치 |
| `onCellClick` | `(cellIndex, side) => void` | `null` | 셀 클릭 핸들러 |
| `dblQuoteInit` | `number` | `0` | 겹따옴표 초기 카운터 |
| `sglQuoteInit` | `number` | `0` | 홑따옴표 초기 카운터 |
| `showRowNums` | `boolean` | `false` | 행 번호 표시 여부 |
| `errorCells` | `Set<number>` | `new Set()` | 오류 하이라이트 셀 |
| `pageIndex` | `number \| null` | `null` | 특정 페이지만 렌더링 (썸네일용) |

### `buildCursorMaps(text: string): CursorMaps`

문자 인덱스 ↔ 셀 인덱스 양방향 매핑을 생성합니다.

```ts
const { charToCell, cellToChar } = buildCursorMaps('가나다라마바사아자차');
// charToCell[0] === 0  // '가'는 셀 0
// charToCell[9] === 9  // '차'는 셀 9
```

### `buildFormattedCells(text: string, options?): FormattedCell[]`

원고지 서식이 적용된 셀 배열을 생성합니다.

## CSS 커스터마이징

CSS 변수로 스타일을 커스터마이징할 수 있습니다:

```css
:root {
  --manuscript-grid-line: #c8b89a;    /* 격자선 색상 */
  --manuscript-cell-bg: #fffdf7;      /* 셀 배경색 */
  --manuscript-font-serif: 'Noto Serif KR', serif; /* 폰트 */
  --manuscript-text-color: #1a1a1a;   /* 글자 색상 */
  --manuscript-error-bg: #fef2f2;     /* 오류 배경색 */
  --manuscript-error-color: #ef4444; /* 오류 표시색 */
}
```

## 라이선스 / License

MIT
