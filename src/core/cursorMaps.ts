import {
  PUNCT, SMALL_PUNCT, EXCL_PUNCT, QUOTE_CHARS, OPEN_BRACKETS, CLOSE_BRACKETS,
} from './constants';
import {
  isLowerAlpha, isUpperAlpha, isNumber,
  canGroupWithNext, isLineEndProhibited, advanceQuoteCount,
} from './rules';
import { DEFAULT_COLUMNS, DEFAULT_ROWS } from './formatter';
import type { CursorMaps } from '../types';

export interface CursorMapsOptions {
  /**
   * 한 행의 열(칸) 수 (기본값: 10)
   * formatter와 동일한 값을 사용해야 매핑이 일치합니다.
   */
  columns?: number;
  /**
   * 한 블록(페이지)의 행 수 (기본값: 10)
   */
  rows?: number;
}

/**
 * 텍스트 커서 위치(char index) ↔ 원고지 셀 인덱스 양방향 매핑을 빌드합니다.
 *
 * - `charToCell[i]`: i번째 문자가 위치한 셀 인덱스
 * - `cellToChar[n]`: n번째 셀의 끝 문자 인덱스 (exclusive)
 *
 * @param text - 전체 텍스트
 * @param options - columns/rows 설정 (buildFormattedCells와 동일해야 함)
 * @returns CursorMaps 객체
 */
export function buildCursorMaps(text: string, options: CursorMapsOptions = {}): CursorMaps {
  const { columns = DEFAULT_COLUMNS, rows = DEFAULT_ROWS } = options;
  const blockSize = columns * rows;

  const chars = text.split('');
  const charToCell: number[] = [];
  const cellToChar: number[] = [];
  let col = 0, dblQ = 0, sglQ = 0;
  let isLineStart = true;
  let justWrapped = false;
  let prevIsExcl = false;

  const advCol = (): void => {
    justWrapped = col === columns - 1;
    col = (col + 1) % columns;
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

    // ── 행말 금칙어 (여는 따옴표/괄호 - Underflow)
    if (isLineEndProhibited(c, col, dblQ, sglQ, columns)) {
      cellToChar.push(i); // 빈 칸 삽입
      advCol();
      isLineStart = false;
    }

    // ── 줄 시작 금지 (Overflow)
    // col===0이면 (justWrapped 여부 무관) PUNCT·닫는따옴표를 이전 셀에 합침
    // Manuscript.jsx의 overflow 처리와 동기화 (col===0일 때 항상 적용)
    const isOverflowChar = col === 0 && cellToChar.length > 0 && (
      PUNCT.has(c) || (
        CLOSE_BRACKETS.has(c) && (
          (c === '"' || c === '\u201C' || c === '\u201D' || c === '\u201E')
            ? (prevIsExcl || dblQ % 2 !== 0)
            : (c === "'" || c === '\u2018' || c === '\u2019' || c === '\u201A')
              ? (prevIsExcl || sglQ % 2 !== 0)
              : true
        )
      )
    );
    if (isOverflowChar) {
      charToCell[i] = cellToChar.length - 1;
      cellToChar[cellToChar.length - 1] = i + 1;
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
        cellToChar.push(i + 2);
        charToCell[i + 1] = cellToChar.length - 1;
        if (QUOTE_CHARS.has(chars[i + 1])) [dblQ, sglQ] = advanceQuoteCount(chars[i + 1], dblQ, sglQ);
        advCol();
        prevIsExcl = false;
        i += 1;
        continue;
      }
    }

    // ── 말줄임표 6점 (……)
    if (c === '…' && chars[i + 1] === '…') {
      cellToChar.push(i + 1); advCol();
      charToCell[i + 1] = cellToChar.length;
      cellToChar.push(i + 2); advCol();
      prevIsExcl = false;
      i += 1;
      continue;
    }
    // ── 말줄임표 6점 (......)
    if (
      c === '.' && chars[i + 1] === '.' && chars[i + 2] === '.' &&
      chars[i + 3] === '.' && chars[i + 4] === '.' && chars[i + 5] === '.'
    ) {
      cellToChar.push(i + 3);
      charToCell[i + 1] = charToCell[i + 2] = cellToChar.length - 1;
      advCol();
      cellToChar.push(i + 6);
      charToCell[i + 3] = charToCell[i + 4] = charToCell[i + 5] = cellToChar.length - 1;
      advCol();
      prevIsExcl = false;
      i += 5;
      continue;
    }
    // ── 말줄임표 3점
    if (c === '.' && chars[i + 1] === '.' && chars[i + 2] === '.') {
      cellToChar.push(i + 3);
      charToCell[i + 1] = charToCell[i + 2] = cellToChar.length - 1;
      advCol();
      prevIsExcl = false;
      i += 2;
      continue;
    }

    // ── 느낌표·물음표 + 자동 공백
    if (EXCL_PUNCT.has(c)) {
      charToCell[i] = cellToChar.length;
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
      cellToChar.push(i + 2);
      charToCell[i + 1] = cellToChar.length - 1;
      advCol();
      isLineStart = false;
      prevIsExcl = false;
      i += 1;
      continue;
    }

    // ── 일반 글자
    cellToChar.push(i + 1);
    advCol();
    isLineStart = false;
    prevIsExcl = EXCL_PUNCT.has(c);
  }

  charToCell[chars.length] = cellToChar.length;
  while (cellToChar.length < blockSize) cellToChar.push(chars.length);

  return { charToCell, cellToChar, columns, rows };
}
