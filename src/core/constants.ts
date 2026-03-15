/** 원고지 규칙 상수 */

/** 구두점: 줄 시작 금지 대상 (마침표, 쉼표, 느낌표, 물음표 등) */
export const PUNCT = new Set(['.', ',', '。', '、', '．', '，', '!', '?', '！', '？']);

/** 마침표·쉼표: 셀 좌하단 표시 대상 */
export const SMALL_PUNCT = new Set(['.', ',', '。', '、', '．', '，']);

/** 느낌표·물음표: 셀 중앙 표시 및 뒤에 자동 공백 삽입 */
export const EXCL_PUNCT = new Set(['!', '?', '！', '？']);

/** 모든 종류의 따옴표 */
export const QUOTE_CHARS = new Set([
  '"', '\u201C', '\u201D', '\u201E',
  "'", '\u2018', '\u2019', '\u201A',
]);

/** 닫는 따옴표 (줄 시작 금지) */
export const CLOSE_QUOTE = new Set(['\u201D', '\u201E', '\u2019', '\u201A']);

/** 여는 괄호·따옴표 (줄 끝 금지) */
export const OPEN_BRACKETS = new Set([
  '(', '[', '{', '<', '\u201C', '\u2018', '"', "'",
]);

/** 닫는 괄호·따옴표 (줄 시작 금지) */
export const CLOSE_BRACKETS = new Set([
  ')', ']', '}', '>', '\u201D', '\u2019', '"', "'",
]);
