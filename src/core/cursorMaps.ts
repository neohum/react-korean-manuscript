import {
  PUNCT, SMALL_PUNCT, EXCL_PUNCT, QUOTE_CHARS, CLOSE_BRACKETS,
} from './constants';
import {
  canGroupWithNext, isLineEndProhibited, advanceQuoteCount,
  countEojeolUnderflowCells, countKinsokuPushUnderflowCells,
} from './rules';
import { DEFAULT_COLUMNS, DEFAULT_ROWS } from './formatter';
import type { CursorMaps, KinsokuMode, WordWrapMode } from '../types';

export interface CursorMapsOptions {
  /** 겹따옴표 초기 카운터 (formatter와 동일한 값을 사용) */
  dblQuoteInit?: number;
  /** 홑따옴표 초기 카운터 (formatter와 동일한 값을 사용) */
  sglQuoteInit?: number;
  /**
   * 한 행의 열(칸) 수 (기본값: 10)
   * formatter와 동일한 값을 사용해야 매핑이 일치합니다.
   */
  columns?: number;
  /**
   * 한 블록(페이지)의 행 수 (기본값: 10)
   */
  rows?: number;
  /**
   * 한국어 줄바꿈 모드 (기본값: 'char')
   * formatter와 동일한 값을 사용해야 매핑이 일치합니다.
   */
  wordWrapMode?: WordWrapMode;
  /**
   * 행두/행말 금칙처리 모드 (기본값: 'hang')
   * formatter와 동일한 값을 사용해야 매핑이 일치합니다.
   */
  kinsokuMode?: KinsokuMode;
}

/**
 * 텍스트 커서 위치(char index) ↔ 원고지 셀 인덱스 양방향 매핑을 빌드합니다.
 *
 * - `charToCell[i]`: i번째 문자가 위치한 셀 인덱스
 * - `cellToChar[n]`: n번째 셀의 끝 문자 인덱스 (exclusive)
 *
 * @param text - 전체 텍스트
 * @param options - columns/rows/wordWrapMode/kinsokuMode 설정 (buildFormattedCells와 동일해야 함)
 * @returns CursorMaps 객체
 */
export function buildCursorMaps(text: string, options: CursorMapsOptions = {}): CursorMaps {
  const {
    dblQuoteInit = 0,
    sglQuoteInit = 0,
    columns = DEFAULT_COLUMNS,
    rows = DEFAULT_ROWS,
    wordWrapMode = 'char',
    kinsokuMode = 'hang',
  } = options;
  const blockSize = columns * rows;

  const chars = text.split('');
  const charToCell: number[] = [];
  const cellToChar: number[] = [];
  let col = 0;
  let dblQ = dblQuoteInit;
  let sglQ = sglQuoteInit;
  let isLineStart = true;
  let justWrapped = false;
  let prevIsExcl = false;
  let lastContentCellIdx = -1;

  const advCol = (): void => {
    justWrapped = col === columns - 1;
    col = (col + 1) % columns;
  };

  const pushUnderflowCell = (charIdx: number): void => {
    cellToChar.push(charIdx);
    advCol();
    isLineStart = false;
  };

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];

    // ── 줄바꿈
    if (c === '\n') {
      charToCell[i] = cellToChar.length;
      if (!(col === 0 && justWrapped)) {
        const remaining = columns - col;
        for (let j = 0; j < remaining; j++) cellToChar.push(i + 1);
      }
      col = 0;
      isLineStart = true;
      justWrapped = false;
      prevIsExcl = false;
      continue;
    }

    // ── 행 경계 공백 건너뜀
    if (c === ' ' && justWrapped) {
      charToCell[i] = cellToChar.length;
      justWrapped = false;
      prevIsExcl = false;
      continue;
    }

    // ── 어절 단위 줄바꿈 (wordWrapMode: 'eojeol')
    if (wordWrapMode === 'eojeol') {
      const eojeolUnderflows = countEojeolUnderflowCells(
        chars,
        i,
        col,
        columns,
        dblQ,
        sglQ,
        kinsokuMode,
      );
      for (let u = 0; u < eojeolUnderflows; u++) {
        pushUnderflowCell(i);
      }
    }

    // ── 밀어내기 금칙처리 (kinsokuMode: 'push')
    if (kinsokuMode === 'push') {
      const pushUnderflows = countKinsokuPushUnderflowCells(
        chars,
        i,
        col,
        columns,
        dblQ,
        sglQ,
        prevIsExcl,
      );
      for (let u = 0; u < pushUnderflows; u++) {
        pushUnderflowCell(i);
      }
    }

    // ── 행말 금칙어 (여는 따옴표/괄호 - Underflow)
    if (isLineEndProhibited(c, col, dblQ, sglQ, columns)) {
      pushUnderflowCell(i);
    }

    // ── 줄 시작 금지 (Overflow - kinsokuMode: 'hang')
    const isCloseQuoteOverflow =
      kinsokuMode === 'hang' &&
      col === 0 &&
      justWrapped &&
      cellToChar.length > 0 &&
      CLOSE_BRACKETS.has(c) &&
      (
        (c === '"' || c === '\u201C' || c === '\u201D' || c === '\u201E')
          ? (prevIsExcl || dblQ % 2 !== 0)
          : (c === "'" || c === '\u2018' || c === '\u2019' || c === '\u201A')
            ? (prevIsExcl || sglQ % 2 !== 0)
            : true
      );

    const isEllipsisDots = c === '.' && chars[i + 1] === '.' && chars[i + 2] === '.';
    const isOverflowChar =
      kinsokuMode === 'hang' &&
      col === 0 &&
      justWrapped &&
      !isEllipsisDots &&
      cellToChar.length > 0 &&
      (PUNCT.has(c) || isCloseQuoteOverflow);

    if (isOverflowChar) {
      const targetIdx = lastContentCellIdx >= 0 ? lastContentCellIdx : cellToChar.length - 1;
      charToCell[i] = targetIdx;
      for (let k = targetIdx; k < cellToChar.length; k++) {
        cellToChar[k] = i + 1;
      }
      if (QUOTE_CHARS.has(c)) [dblQ, sglQ] = advanceQuoteCount(c, dblQ, sglQ);
      prevIsExcl = false;
      continue;
    }

    if (QUOTE_CHARS.has(c)) [dblQ, sglQ] = advanceQuoteCount(c, dblQ, sglQ);

    charToCell[i] = cellToChar.length;

    // ── 마침표/쉼표 + 닫는 따옴표 합침: 1칸으로 처리
    if (
      SMALL_PUNCT.has(c) &&
      chars[i + 1] &&
      QUOTE_CHARS.has(chars[i + 1]) &&
      CLOSE_BRACKETS.has(chars[i + 1])
    ) {
      const nc = chars[i + 1];
      let nextIsClose = false;
      if (nc === '"' || nc === '\u201C' || nc === '\u201D' || nc === '\u201E') {
        nextIsClose = dblQ % 2 !== 0;
      } else {
        nextIsClose = sglQ % 2 !== 0;
      }
      if (nextIsClose) {
        lastContentCellIdx = cellToChar.length;
        cellToChar.push(i + 2);
        charToCell[i + 1] = cellToChar.length - 1;
        if (QUOTE_CHARS.has(chars[i + 1])) [dblQ, sglQ] = advanceQuoteCount(chars[i + 1], dblQ, sglQ);
        advCol();
        isLineStart = false;
        prevIsExcl = false;
        i += 1;
        continue;
      }
    }

    // ── 말줄임표 6점 (……)
    if (c === '…' && chars[i + 1] === '…') {
      lastContentCellIdx = cellToChar.length;
      cellToChar.push(i + 1); advCol();
      charToCell[i + 1] = cellToChar.length;
      lastContentCellIdx = cellToChar.length;
      cellToChar.push(i + 2); advCol();
      isLineStart = false;
      prevIsExcl = false;
      i += 1;
      continue;
    }
    // ── 말줄임표 6점 (......)
    if (
      c === '.' && chars[i + 1] === '.' && chars[i + 2] === '.' &&
      chars[i + 3] === '.' && chars[i + 4] === '.' && chars[i + 5] === '.'
    ) {
      lastContentCellIdx = cellToChar.length;
      cellToChar.push(i + 3);
      charToCell[i + 1] = charToCell[i + 2] = cellToChar.length - 1;
      advCol();
      lastContentCellIdx = cellToChar.length;
      cellToChar.push(i + 6);
      charToCell[i + 3] = charToCell[i + 4] = charToCell[i + 5] = cellToChar.length - 1;
      advCol();
      isLineStart = false;
      prevIsExcl = false;
      i += 5;
      continue;
    }
    // ── 말줄임표 3점
    if (c === '.' && chars[i + 1] === '.' && chars[i + 2] === '.') {
      lastContentCellIdx = cellToChar.length;
      cellToChar.push(i + 3);
      charToCell[i + 1] = charToCell[i + 2] = cellToChar.length - 1;
      advCol();
      isLineStart = false;
      prevIsExcl = false;
      i += 2;
      continue;
    }

    // ── 느낌표·물음표 + 자동 공백
    if (EXCL_PUNCT.has(c)) {
      charToCell[i] = cellToChar.length;
      lastContentCellIdx = cellToChar.length;
      const nextChar = chars[i + 1];
      if (nextChar && nextChar !== ' ' && nextChar !== '\n' && !CLOSE_BRACKETS.has(nextChar)) {
        cellToChar.push(i + 1); advCol(); // 느낌표 셀
        cellToChar.push(i + 1); advCol(); // 자동 공백 셀
        isLineStart = false;
        prevIsExcl = true;
        continue;
      }
    }

    // ── 영소문자/숫자 그룹화 2글자 → 1칸
    if (canGroupWithNext(c, chars[i + 1])) {
      lastContentCellIdx = cellToChar.length;
      cellToChar.push(i + 2);
      charToCell[i + 1] = cellToChar.length - 1;
      advCol();
      isLineStart = false;
      prevIsExcl = false;
      i += 1;
      continue;
    }

    // ── 일반 글자
    lastContentCellIdx = cellToChar.length;
    cellToChar.push(i + 1);
    advCol();
    isLineStart = false;
    prevIsExcl = EXCL_PUNCT.has(c);
  }

  charToCell[chars.length] = cellToChar.length;
  const totalCells = cellToChar.length;
  const remainder = totalCells % blockSize;
  if (remainder !== 0 || totalCells === 0) {
    const paddingNeeded = totalCells === 0 ? blockSize : blockSize - remainder;
    for (let i = 0; i < paddingNeeded; i++) {
      cellToChar.push(chars.length);
    }
  }

  return { charToCell, cellToChar, columns, rows };
}
