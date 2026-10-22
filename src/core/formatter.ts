import type { FormattedCell, KinsokuMode, WordWrapMode } from '../types';
import {
  PUNCT, SMALL_PUNCT, EXCL_PUNCT, QUOTE_CHARS, OPEN_BRACKETS, CLOSE_BRACKETS,
} from './constants';
import {
  isLowerAlpha, isUpperAlpha, isNumber,
  canGroupWithNext, isLineEndProhibited,
  countEojeolUnderflowCells, countKinsokuPushUnderflowCells,
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
  /**
   * 한국어 줄바꿈 모드 (기본값: 'char')
   * - 'char': 전통 원고지 1칸 1글자 줄바꿈
   * - 'eojeol': 어절 중간 끊김 방지 (keep-all 대응, 남은 칸은 UnderflowCell로 채움)
   */
  wordWrapMode?: WordWrapMode;
  /**
   * 행두/행말 금칙처리 모드 (기본값: 'hang')
   * - 'hang': 행두 금칙 문자를 이전 행 마지막 칸 우측 팬텀 셀로 걸침
   * - 'push': 행두 금칙 문자와 앞 글자를 함께 다음 행으로 밀어냄
   */
  kinsokuMode?: KinsokuMode;
}

/**
 * 텍스트를 원고지 셀 배열로 변환합니다.
 *
 * @param text - 변환할 텍스트
 * @param options - 따옴표 초기 카운터, 어절 줄바꿈, 금칙처리 등 옵션
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
    wordWrapMode = 'char',
    kinsokuMode = 'hang',
  } = options;
  const blockSize = columns * rows;
  const chars = text.split('');
  const formattedCells: FormattedCell[] = [];
  let currentColumn = 0;
  let dblQuoteCount = dblQuoteInit;
  let sglQuoteCount = sglQuoteInit;
  let isLineStart = true;
  let justWrapped = false;
  let prevIsExcl = false;

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
      prevIsExcl = false;
      continue;
    }

    // ── 행 경계 공백 건너뜀 (자연 줄바꿈 직후 공백)
    if (char === ' ' && justWrapped) {
      justWrapped = false;
      prevIsExcl = false;
      continue;
    }

    // ── 어절 단위 줄바꿈 (wordWrapMode: 'eojeol')
    if (wordWrapMode === 'eojeol') {
      const eojeolUnderflows = countEojeolUnderflowCells(
        chars,
        i,
        currentColumn,
        columns,
        dblQuoteCount,
        sglQuoteCount,
        kinsokuMode,
      );
      for (let u = 0; u < eojeolUnderflows; u++) {
        pushCell({ underflow: true });
      }
    }

    // ── 밀어내기 금칙처리 (kinsokuMode: 'push')
    if (kinsokuMode === 'push') {
      const pushUnderflows = countKinsokuPushUnderflowCells(
        chars,
        i,
        currentColumn,
        columns,
        dblQuoteCount,
        sglQuoteCount,
        prevIsExcl,
      );
      for (let u = 0; u < pushUnderflows; u++) {
        pushCell({ underflow: true });
      }
    }

    // ── 행말 금칙어 (여는 따옴표/괄호 - Underflow)
    if (isLineEndProhibited(char, currentColumn, dblQuoteCount, sglQuoteCount, columns)) {
      pushCell({ underflow: true });
    }

    // ── 닫는 따옴표/괄호 줄 시작 금지 판정 (kinsokuMode: 'hang')
    let isCloseQuoteOverflow = false;
    if (
      kinsokuMode === 'hang' &&
      currentColumn === 0 &&
      justWrapped &&
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
      const cellPrevIsExcl =
        prevCell !== null &&
        typeof prevCell === 'object' &&
        'excl' in prevCell &&
        !!(prevCell as any).excl;
      if (char === '"' || char === '\u201C' || char === '\u201D' || char === '\u201E') {
        if (cellPrevIsExcl || dblQuoteCount % 2 !== 0) {
          isCloseQuoteOverflow = true;
          dblQuoteCount++;
        }
      } else if (char === "'" || char === '\u2018' || char === '\u2019' || char === '\u201A') {
        if (cellPrevIsExcl || sglQuoteCount % 2 !== 0) {
          isCloseQuoteOverflow = true;
          sglQuoteCount++;
        }
      } else {
        isCloseQuoteOverflow = true;
      }
    }

    // ── 구두점·닫는 따옴표 줄 시작 금지 (overflow punct - kinsokuMode: 'hang')
    const isEllipsisDots = char === '.' && chars[i + 1] === '.' && chars[i + 2] === '.';
    if (
      kinsokuMode === 'hang' &&
      justWrapped &&
      !isEllipsisDots &&
      (PUNCT.has(char) || isCloseQuoteOverflow) &&
      currentColumn === 0 &&
      formattedCells.length > 0
    ) {
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
          formattedCells[targetIdx] = {
            ...prevAny,
            [field]: ((prevAny[field] as string) || '') + char,
          };
        } else {
          pushCell(char);
        }
      } else {
        pushCell(char);
      }
      prevIsExcl = false;
      continue;
    }

    // ── 마침표/쉼표 + 닫는 따옴표 합침 (1칸으로 처리)
    if (
      SMALL_PUNCT.has(char) &&
      chars[i + 1] &&
      QUOTE_CHARS.has(chars[i + 1]) &&
      CLOSE_BRACKETS.has(chars[i + 1])
    ) {
      const nc = chars[i + 1];
      const isDbl = nc === '"' || nc === '\u201C' || nc === '\u201D' || nc === '\u201E';
      const nextIsClose = isDbl ? dblQuoteCount % 2 !== 0 : sglQuoteCount % 2 !== 0;
      if (nextIsClose) {
        if (isDbl) dblQuoteCount++;
        else sglQuoteCount++;
        pushCell({ punctWithQuote: true, punct: char, quote: nc });
        prevIsExcl = false;
        i += 1;
        continue;
      }
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
          formattedCells[formattedCells.length - 1] = {
            punctWithQuote: true,
            punct: prev,
            quote: char,
          };
          prevIsExcl = false;
          continue;
        }
      }
      pushCell({ quoteChar: char, isOpen });
      prevIsExcl = false;
      continue;
    }

    // ── 느낌표·물음표: 중앙 표시 및 자동 공백 삽입
    if (EXCL_PUNCT.has(char)) {
      pushCell({ excl: char });
      const nextChar = chars[i + 1];
      if (nextChar && nextChar !== ' ' && nextChar !== '\n' && !CLOSE_BRACKETS.has(nextChar)) {
        pushCell({ autoBlank: true });
      }
      prevIsExcl = true;
      continue;
    }

    // ── 말줄임표 6점 (…… 또는 ......)
    if (char === '…' && chars[i + 1] === '…') {
      pushCell({ ellipsis: '…' });
      pushCell({ ellipsis: '…' });
      prevIsExcl = false;
      i += 1;
      continue;
    }
    if (
      char === '.' && chars[i + 1] === '.' && chars[i + 2] === '.' &&
      chars[i + 3] === '.' && chars[i + 4] === '.' && chars[i + 5] === '.'
    ) {
      pushCell({ ellipsis: '...' });
      pushCell({ ellipsis: '...' });
      prevIsExcl = false;
      i += 5;
      continue;
    }
    // ── 말줄임표 3점
    if (char === '.' && chars[i + 1] === '.' && chars[i + 2] === '.') {
      pushCell({ ellipsis: '...' });
      prevIsExcl = false;
      i += 2;
      continue;
    }

    // ── 일반 괄호 등 기타 기호
    if (OPEN_BRACKETS.has(char) || CLOSE_BRACKETS.has(char)) {
      const isOpen = OPEN_BRACKETS.has(char);
      pushCell({ bracketChar: char, isOpen });
      prevIsExcl = false;
      continue;
    }

    // ── 소문자/숫자 그룹핑 2글자 → 1칸
    if (canGroupWithNext(char, chars[i + 1])) {
      pushCell({ double: char + chars[i + 1] });
      prevIsExcl = false;
      i += 1;
      continue;
    }

    // ── 대문자 / 단독 소문자·숫자 → 1칸
    if (isNumber(char) || isLowerAlpha(char) || isUpperAlpha(char)) {
      pushCell({ single: char, type: 'alpha-num-single' });
      prevIsExcl = false;
      continue;
    }

    // ── 스페이스: 행 경계에서 생략
    if (char === ' ' && justWrapped) {
      justWrapped = false;
      prevIsExcl = false;
      continue;
    }

    // ── 스페이스: 문단 들여쓰기로 감지
    if (char === ' ' && isLineStart) {
      pushCell({ indent: true });
      prevIsExcl = false;
      continue;
    }

    // ── 일반 글자
    pushCell(char);
    prevIsExcl = false;
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
