import type { FormattedCell } from '../types';
import {
  PUNCT, SMALL_PUNCT, EXCL_PUNCT, QUOTE_CHARS, OPEN_BRACKETS, CLOSE_BRACKETS,
} from './constants';
import {
  isLowerAlpha, isUpperAlpha, isNumber,
  canGroupWithNext, isLineEndProhibited, isLineStartProhibited, advanceQuoteCount,
} from './rules';

/** 기본 블록(페이지) 크기: 열 수 × 행 수 */
export const DEFAULT_COLUMNS = 10;
export const DEFAULT_ROWS = 10;
/** 기본 블록 크기 (하위 호환용) */
export const BLOCK_SIZE = DEFAULT_COLUMNS * DEFAULT_ROWS;

export interface FormatterOptions {
  /** 겹따옴표 초기 카운터 (이전 페이지에서 이어받는 경우) */
  dblQuoteInit?: number;
  /** 홑따옴표 초기 카운터 (이전 페이지에서 이어받는 경우) */
  sglQuoteInit?: number;
  /**
   * 한 행의 열(칸) 수 (기본값: 10)
   * 예) 20열 원고지 → columns: 20
   */
  columns?: number;
  /**
   * 한 블록(페이지)의 행 수 (기본값: 10)
   */
  rows?: number;
}

/**
 * 텍스트를 원고지 셀 배열로 변환합니다.
 *
 * @param text - 변환할 텍스트
 * @param options - 따옴표 초기 카운터 등 옵션
 * @returns FormattedCell 배열 (길이는 항상 BLOCK_SIZE의 배수)
 */
export function buildFormattedCells(
  text: string,
  options: FormatterOptions = {},
): FormattedCell[] {
  const {
    dblQuoteInit = 0,
    sglQuoteInit = 0,
    columns = DEFAULT_COLUMNS,
    rows = DEFAULT_ROWS,
  } = options;
  const blockSize = columns * rows;
  const chars = text.split('');
  const formattedCells: FormattedCell[] = [];
  let currentColumn = 0;
  let dblQuoteCount = dblQuoteInit;
  let sglQuoteCount = sglQuoteInit;
  let isLineStart = true;
  let justWrapped = false;

  const pushCell = (cell: FormattedCell): void => {
    formattedCells.push(cell);
    const wasColLast = currentColumn === columns - 1;
    currentColumn = (currentColumn + 1) % columns;
    isLineStart = false;
    justWrapped = wasColLast;
  };

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    // ── 줄바꿈
    if (char === '\n') {
      if (!(currentColumn === 0 && justWrapped)) {
        const remaining = columns - currentColumn;
        for (let j = 0; j < remaining; j++) formattedCells.push('');
      }
      currentColumn = 0;
      isLineStart = true;
      justWrapped = false;
      continue;
    }

    // ── 행 경계 공백 건너뜀 (자연 줄바꿈 직후 공백)
    if (char === ' ' && justWrapped) {
      justWrapped = false;
      continue;
    }

    // ── 행말 금칙어 (여는 따옴표/괄호 - Underflow)
    if (isLineEndProhibited(char, currentColumn, dblQuoteCount, sglQuoteCount, columns)) {
      formattedCells.push({ underflow: true });
      const wasColLast = currentColumn === columns - 1;
      currentColumn = (currentColumn + 1) % columns;
      isLineStart = false;
      justWrapped = wasColLast;
    }

    // ── 닫는 따옴표/괄호 줄 시작 금지 판정
    let isCloseQuoteOverflow = false;
    if (
      currentColumn === 0 && justWrapped &&
      formattedCells.length > 0 &&
      CLOSE_BRACKETS.has(char)
    ) {
      let prevIdx = formattedCells.length - 1;
      while (prevIdx >= 0) {
        const pc = formattedCells[prevIdx] as any;
        if (pc === '') { prevIdx--; continue; }
        if (typeof pc === 'object' && (pc.autoBlank || pc.underflow)) { prevIdx--; continue; }
        break;
      }
      const prevCell = prevIdx >= 0 ? formattedCells[prevIdx] : null;
      const prevIsExcl = prevCell !== null && typeof prevCell === 'object' && 'excl' in prevCell && !!(prevCell as any).excl;
      if (char === '"' || char === '\u201C' || char === '\u201D' || char === '\u201E') {
        if (prevIsExcl || dblQuoteCount % 2 !== 0) { isCloseQuoteOverflow = true; dblQuoteCount++; }
      } else if (char === "'" || char === '\u2018' || char === '\u2019' || char === '\u201A') {
        if (prevIsExcl || sglQuoteCount % 2 !== 0) { isCloseQuoteOverflow = true; sglQuoteCount++; }
      } else {
        isCloseQuoteOverflow = true;
      }
    }

    // ── 구두점·닫는 따옴표 줄 시작 금지 (overflow punct)
    if ((PUNCT.has(char) || isCloseQuoteOverflow) && currentColumn === 0 && formattedCells.length > 0) {
      const field = isCloseQuoteOverflow ? 'overflowQuote' : 'overflowPunct';
      let targetIdx = formattedCells.length - 1;
      while (targetIdx >= 0) {
        const tc = formattedCells[targetIdx] as any;
        if (tc === '') { targetIdx--; continue; }
        if (typeof tc === 'object' && (tc.autoBlank || tc.underflow)) { targetIdx--; continue; }
        break;
      }
      if (targetIdx >= 0) {
        const prev = formattedCells[targetIdx];
        if (typeof prev === 'string' && prev !== '') {
          formattedCells[targetIdx] = { char: prev, [field]: char };
        } else if (typeof prev === 'object') {
          const prevAny = prev as any;
          formattedCells[targetIdx] = { ...prevAny, [field]: ((prevAny[field] as string) || '') + char };
        } else {
          pushCell(char);
        }
      } else {
        pushCell(char);
      }
      continue;
    }

    // ── 따옴표 처리
    if (QUOTE_CHARS.has(char)) {
      let isOpen: boolean;
      if (char === '"' || char === '\u201C' || char === '\u201D' || char === '\u201E') {
        isOpen = dblQuoteCount % 2 === 0;
        dblQuoteCount++;
      } else {
        isOpen = sglQuoteCount % 2 === 0;
        sglQuoteCount++;
      }
      // 닫는 따옴표 + 앞 셀이 마침표/쉼표 → 한 칸에 합침
      if (!isOpen && formattedCells.length > 0) {
        const prev = formattedCells[formattedCells.length - 1];
        if (typeof prev === 'string' && SMALL_PUNCT.has(prev)) {
          formattedCells[formattedCells.length - 1] = { punctWithQuote: true, punct: prev, quote: char };
          continue;
        }
      }
      pushCell({ quoteChar: char, isOpen });
      continue;
    }

    // ── 느낌표·물음표: 중앙 표시 및 자동 공백 삽입
    if (EXCL_PUNCT.has(char)) {
      pushCell({ excl: char });
      const nextChar = chars[i + 1];
      if (nextChar && nextChar !== ' ' && nextChar !== '\n' && !CLOSE_BRACKETS.has(nextChar)) {
        const wasColLast = currentColumn === columns - 1;
        formattedCells.push({ autoBlank: true });
        currentColumn = (currentColumn + 1) % columns;
        isLineStart = false;
        justWrapped = wasColLast;
      }
      continue;
    }

    // ── 말줄임표 6점 (…… 또는 ......)
    if (char === '…' && chars[i + 1] === '…') {
      pushCell({ ellipsis: '…' });
      pushCell({ ellipsis: '…' });
      i += 1;
      continue;
    }
    if (
      char === '.' && chars[i + 1] === '.' && chars[i + 2] === '.' &&
      chars[i + 3] === '.' && chars[i + 4] === '.' && chars[i + 5] === '.'
    ) {
      pushCell({ ellipsis: '...' });
      pushCell({ ellipsis: '...' });
      i += 5;
      continue;
    }
    // ── 말줄임표 3점
    if (char === '.' && chars[i + 1] === '.' && chars[i + 2] === '.') {
      pushCell({ ellipsis: '...' });
      i += 2;
      continue;
    }

    // ── 일반 괄호 등 기타 기호
    if (OPEN_BRACKETS.has(char) || CLOSE_BRACKETS.has(char)) {
      const isOpen = OPEN_BRACKETS.has(char);
      pushCell({ bracketChar: char, isOpen });
      continue;
    }

    // ── 소문자/숫자 그룹핑 2글자 → 1칸
    if (canGroupWithNext(char, chars[i + 1])) {
      pushCell({ double: char + chars[i + 1] });
      i += 1;
      continue;
    }

    // ── 대문자 / 단독 소문자·숫자 → 1칸
    if (isNumber(char) || isLowerAlpha(char) || isUpperAlpha(char)) {
      pushCell({ single: char, type: 'alpha-num-single' });
      continue;
    }

    // ── 스페이스: 행 경계에서 생략
    if (char === ' ' && justWrapped) {
      justWrapped = false;
      continue;
    }

    // ── 스페이스: 문단 들여쓰기로 감지
    if (char === ' ' && isLineStart) {
      pushCell({ indent: true });
      continue;
    }

    // ── 일반 글자
    pushCell(char);
  }

  // blockSize의 배수로 패딩
  const totalCells = formattedCells.length;
  const remainder = totalCells % blockSize;
  if (remainder !== 0 || totalCells === 0) {
    const paddingNeeded = totalCells === 0 ? blockSize : blockSize - remainder;
    for (let i = 0; i < paddingNeeded; i++) {
      formattedCells.push('');
    }
  }

  return formattedCells;
}
