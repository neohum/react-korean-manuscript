import { PUNCT, CLOSE_BRACKETS, QUOTE_CHARS, EXCL_PUNCT, OPEN_BRACKETS, SMALL_PUNCT } from './constants';
import type { KinsokuMode } from '../types';

/** 영소문자 여부 */
export const isLowerAlpha = (c: string): boolean => c >= 'a' && c <= 'z';

/** 영대문자 여부 */
export const isUpperAlpha = (c: string): boolean => c >= 'A' && c <= 'Z';

/** 숫자 여부 */
export const isNumber = (c: string): boolean => c >= '0' && c <= '9';

/**
 * 영소문자/숫자 2글자를 한 칸에 배치할 수 있는지 여부
 * 표준 원고지 규칙: 영소문자·아라비아 숫자는 이종(혼합) 포함 2자 1칸
 */
export function canGroupWithNext(c1: string, c2: string | undefined): boolean {
  if (!c2) return false;
  const a = isLowerAlpha(c1) || isNumber(c1);
  const b = isLowerAlpha(c2) || isNumber(c2);
  return a && b;
}

/**
 * 줄 끝 금지 (Underflow) 판별
 * 여는 괄호·따옴표가 행의 마지막 칸(col === columns-1)에 오는 경우
 */
export function isLineEndProhibited(
  c: string,
  col: number,
  dblQ: number,
  sglQ: number,
  columns: number = 10,
): boolean {
  if (col !== columns - 1) return false;
  if (!OPEN_BRACKETS.has(c)) return false;
  if (c === '"' || c === '\u201C' || c === '\u201D' || c === '\u201E') {
    return dblQ % 2 === 0;
  }
  if (c === "'" || c === '\u2018' || c === '\u2019' || c === '\u201A') {
    return sglQ % 2 === 0;
  }
  return true;
}

/**
 * 줄 시작 금지 (Overflow) 판별
 * 구두점·닫는 괄호/따옴표가 자연 줄바꿈(justWrapped) 직후 행 첫 칸에 오는 경우
 */
export function isLineStartProhibited(
  c: string,
  justWrapped: boolean,
  dblQ: number,
  sglQ: number,
  prevIsExcl: boolean,
): boolean {
  if (!justWrapped) return false;
  if (PUNCT.has(c)) return true;
  if (CLOSE_BRACKETS.has(c)) {
    if (c === '"' || c === '\u201C' || c === '\u201D' || c === '\u201E') {
      return prevIsExcl || dblQ % 2 !== 0;
    }
    if (c === "'" || c === '\u2018' || c === '\u2019' || c === '\u201A') {
      return prevIsExcl || sglQ % 2 !== 0;
    }
    return true; // 일반 닫는 괄호
  }
  return false;
}

/**
 * 따옴표 카운터 업데이트
 * @returns [새로운 dblQ, 새로운 sglQ]
 */
export function advanceQuoteCount(
  c: string,
  dblQ: number,
  sglQ: number,
): [number, number] {
  if (c === '"' || c === '\u201C' || c === '\u201D' || c === '\u201E') {
    return [dblQ + 1, sglQ];
  }
  if (c === "'" || c === '\u2018' || c === '\u2019' || c === '\u201A') {
    return [dblQ, sglQ + 1];
  }
  return [dblQ, sglQ];
}

/**
 * 현재 인덱스가 새로운 어절(공백/줄바꿈으로 구분된 토큰)의 시작인지 판별
 */
export function isEojeolStart(chars: string[], index: number): boolean {
  const c = chars[index];
  if (!c || c === ' ' || c === '\n') return false;
  if (index === 0) return true;
  const prev = chars[index - 1];
  return prev === ' ' || prev === '\n';
}

export interface LogicalUnitMetrics {
  /** 소비하는 문자(char) 수 */
  charSpan: number;
  /** 차지하는 총 셀(칸) 수 (느낌표/물음표 뒤 자동 공백 포함) */
  cellSpan: number;
  /** 글리프 자체가 차지하는 셀 수 (자동 공백 제외) */
  glyphCells: number;
  /** 이 유닛 처리 후 겹따옴표 카운트 */
  nextDblQ: number;
  /** 이 유닛 처리 후 홑따옴표 카운트 */
  nextSglQ: number;
  /** 행두 금칙 대상 여부 (마침표, 쉼표, 느낌표, 물음표, 닫는 괄호/따옴표) */
  isLineStartForbidden: boolean;
  /** 행말 금칙 대상 여부 (여는 괄호/따옴표) */
  isLineEndForbidden: boolean;
  /** hang 모드에서 이전 셀 우측 팬텀 셀로 걸칠 수 있는지 여부 */
  canHangAtLineEnd: boolean;
  /** 느낌표/물음표 여부 */
  endsWithExcl: boolean;
}

/**
 * 특정 문자 인덱스에서 시작하는 원고지 논리 유닛(1칸 또는 2칸 단위)의 메트릭을 계산합니다.
 */
export function measureLogicalUnit(
  chars: string[],
  index: number,
  dblQ: number,
  sglQ: number,
  prevIsExcl: boolean = false,
): LogicalUnitMetrics {
  const c = chars[index];
  const next = chars[index + 1];

  // 1. 마침표/쉼표 + 닫는 따옴표 합침 (punctWithQuote -> 1칸)
  if (
    SMALL_PUNCT.has(c) &&
    next &&
    QUOTE_CHARS.has(next) &&
    CLOSE_BRACKETS.has(next)
  ) {
    const isDbl = next === '"' || next === '\u201C' || next === '\u201D' || next === '\u201E';
    const nextIsClose = isDbl ? dblQ % 2 !== 0 : sglQ % 2 !== 0;
    if (nextIsClose) {
      const [nextDblQ, nextSglQ] = advanceQuoteCount(next, dblQ, sglQ);
      return {
        charSpan: 2,
        cellSpan: 1,
        glyphCells: 1,
        nextDblQ,
        nextSglQ,
        isLineStartForbidden: true,
        isLineEndForbidden: false,
        canHangAtLineEnd: true,
        endsWithExcl: false,
      };
    }
  }

  // 2. 말줄임표 6점 (……) -> 2칸
  if (c === '…' && next === '…') {
    return {
      charSpan: 2,
      cellSpan: 2,
      glyphCells: 2,
      nextDblQ: dblQ,
      nextSglQ: sglQ,
      isLineStartForbidden: false,
      isLineEndForbidden: false,
      canHangAtLineEnd: false,
      endsWithExcl: false,
    };
  }

  // 3. 말줄임표 6점 (......) -> 2칸
  if (
    c === '.' &&
    chars[index + 1] === '.' &&
    chars[index + 2] === '.' &&
    chars[index + 3] === '.' &&
    chars[index + 4] === '.' &&
    chars[index + 5] === '.'
  ) {
    return {
      charSpan: 6,
      cellSpan: 2,
      glyphCells: 2,
      nextDblQ: dblQ,
      nextSglQ: sglQ,
      isLineStartForbidden: false,
      isLineEndForbidden: false,
      canHangAtLineEnd: false,
      endsWithExcl: false,
    };
  }

  // 4. 말줄임표 3점 (...) -> 1칸
  if (c === '.' && chars[index + 1] === '.' && chars[index + 2] === '.') {
    return {
      charSpan: 3,
      cellSpan: 1,
      glyphCells: 1,
      nextDblQ: dblQ,
      nextSglQ: sglQ,
      isLineStartForbidden: false,
      isLineEndForbidden: false,
      canHangAtLineEnd: false,
      endsWithExcl: false,
    };
  }

  // 5. 느낌표·물음표 (+ 자동 공백 가능)
  if (EXCL_PUNCT.has(c)) {
    const hasAutoBlank = Boolean(
      next && next !== ' ' && next !== '\n' && !CLOSE_BRACKETS.has(next),
    );
    return {
      charSpan: 1,
      cellSpan: hasAutoBlank ? 2 : 1,
      glyphCells: 1,
      nextDblQ: dblQ,
      nextSglQ: sglQ,
      isLineStartForbidden: true,
      isLineEndForbidden: false,
      canHangAtLineEnd: !hasAutoBlank,
      endsWithExcl: true,
    };
  }

  // 6. 영소문자/숫자 2자 1칸 그룹핑
  if (canGroupWithNext(c, next)) {
    return {
      charSpan: 2,
      cellSpan: 1,
      glyphCells: 1,
      nextDblQ: dblQ,
      nextSglQ: sglQ,
      isLineStartForbidden: false,
      isLineEndForbidden: false,
      canHangAtLineEnd: false,
      endsWithExcl: false,
    };
  }

  // 7. 일반 1글자 (한글, 영대문자, 단독 영소문자/숫자, 구두점, 괄호, 따옴표)
  const isStartForbidden = isLineStartProhibited(c, true, dblQ, sglQ, prevIsExcl);
  const isEndForbidden = isLineEndProhibited(c, 9, dblQ, sglQ, 10);
  const [nextDblQ, nextSglQ] = QUOTE_CHARS.has(c)
    ? advanceQuoteCount(c, dblQ, sglQ)
    : [dblQ, sglQ];

  return {
    charSpan: 1,
    cellSpan: 1,
    glyphCells: 1,
    nextDblQ,
    nextSglQ,
    isLineStartForbidden: isStartForbidden,
    isLineEndForbidden: isEndForbidden,
    canHangAtLineEnd: isStartForbidden,
    endsWithExcl: false,
  };
}

/**
 * 어절 단위 줄바꿈(wordWrapMode === 'eojeol') 시 현재 어절을 다음 행 첫 칸으로 넘기기 위해
 * 삽입해야 할 UnderflowCell 개수를 반환합니다.
 */
export function countEojeolUnderflowCells(
  chars: string[],
  index: number,
  col: number,
  columns: number,
  dblQ: number,
  sglQ: number,
  kinsokuMode: KinsokuMode = 'hang',
): number {
  if (col === 0 || !isEojeolStart(chars, index)) return 0;

  const remaining = columns - col;
  let k = index;
  let curDblQ = dblQ;
  let curSglQ = sglQ;
  let prevExcl = false;
  const units: LogicalUnitMetrics[] = [];

  while (k < chars.length && chars[k] !== ' ' && chars[k] !== '\n') {
    const u = measureLogicalUnit(chars, k, curDblQ, curSglQ, prevExcl);
    units.push(u);
    curDblQ = u.nextDblQ;
    curSglQ = u.nextSglQ;
    prevExcl = u.endsWithExcl;
    k += u.charSpan;
  }

  if (units.length === 0) return 0;

  const totalCells = units.reduce((sum, u) => sum + u.cellSpan, 0);

  let requiredCells = totalCells;
  if (kinsokuMode === 'hang' && units.length >= 2) {
    const lastUnit = units[units.length - 1];
    if (lastUnit.canHangAtLineEnd) {
      requiredCells = totalCells - lastUnit.cellSpan;
    }
  }

  if (requiredCells > remaining) {
    return remaining;
  }
  return 0;
}

/**
 * 밀어내기 금칙처리(kinsokuMode === 'push') 시
 * 현재 유닛 뒤에 이어지는 행두 금칙 문자(마침표, 쉼표, 닫는 따옴표/괄호 등)가
 * 다음 줄 첫 칸(col === 0)으로 떨어지는 것을 방지하기 위해 삽입할 UnderflowCell 개수를 반환합니다.
 */
export function countKinsokuPushUnderflowCells(
  chars: string[],
  index: number,
  col: number,
  columns: number,
  dblQ: number,
  sglQ: number,
  prevIsExcl: boolean = false,
): number {
  if (col === 0) return 0;
  const c = chars[index];
  if (!c || c === ' ' || c === '\n') return 0;

  const u0 = measureLogicalUnit(chars, index, dblQ, sglQ, prevIsExcl);

  // 현재 유닛이 여는 괄호/따옴표인 경우 뒤따르는 첫 글자 + 행두 금칙 문자까지 함께 확인
  let cursor = index + u0.charSpan;
  let curDblQ = u0.nextDblQ;
  let curSglQ = u0.nextSglQ;
  let curPrevExcl = u0.endsWithExcl;
  let baseCells = u0.cellSpan;

  if (u0.isLineEndForbidden && cursor < chars.length && chars[cursor] !== ' ' && chars[cursor] !== '\n') {
    const uNext = measureLogicalUnit(chars, cursor, curDblQ, curSglQ, curPrevExcl);
    baseCells += uNext.cellSpan;
    cursor += uNext.charSpan;
    curDblQ = uNext.nextDblQ;
    curSglQ = uNext.nextSglQ;
    curPrevExcl = uNext.endsWithExcl;
  }

  let trailingForbiddenCells = 0;
  while (cursor < chars.length && chars[cursor] !== ' ' && chars[cursor] !== '\n') {
    const uFollow = measureLogicalUnit(chars, cursor, curDblQ, curSglQ, curPrevExcl);
    if (!uFollow.isLineStartForbidden) break;
    trailingForbiddenCells += uFollow.glyphCells;
    cursor += uFollow.charSpan;
    curDblQ = uFollow.nextDblQ;
    curSglQ = uFollow.nextSglQ;
    curPrevExcl = uFollow.endsWithExcl;
  }

  if (
    trailingForbiddenCells > 0 &&
    col + baseCells <= columns &&
    col + baseCells + trailingForbiddenCells > columns
  ) {
    return columns - col;
  }

  return 0;
}
