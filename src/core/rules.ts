import { PUNCT, CLOSE_BRACKETS, QUOTE_CHARS, EXCL_PUNCT, OPEN_BRACKETS, SMALL_PUNCT } from './constants';

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
