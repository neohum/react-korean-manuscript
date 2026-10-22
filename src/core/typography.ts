import type React from 'react';

/** 한국어 타이포그래피 줄바꿈 프리셋 키 */
export type KoreanTypographyPreset = 'prose' | 'heading' | 'badge' | 'preLine';

/** 한국어 타이포그래피 유틸리티 CSS 클래스명 상수 */
export const KOREAN_TYPOGRAPHY_CLASSES = {
  /** 본문·미리보기·문장 카드: 어절 단위 줄바꿈 + 긴 영문/URL 안전 분할 + 문단 끝 고아 단어 방지 */
  prose: 'rkm-prose-ko',
  proseKo: 'rkm-prose-ko',
  /** 제목·섹션 헤더·배너: 어절 단위 줄바꿈 + 줄 길이 균형 */
  heading: 'rkm-heading-balance',
  headingBalance: 'rkm-heading-balance',
  /** 상태 배지·버튼·행/페이지 번호: 줄바꿈 금지 단일 행 유지 */
  badge: 'rkm-badge-nowrap',
  badgeNowrap: 'rkm-badge-nowrap',
  /** 줄바꿈 보존 텍스트: 개행(\n) 보존 + 한국어 어절 줄바꿈 */
  preLine: 'rkm-pre-line',
} as const;

/** 한국어 타이포그래피 프리셋별 인라인 스타일 객체 */
export const KOREAN_TYPOGRAPHY_STYLES: Record<KoreanTypographyPreset, React.CSSProperties> = {
  prose: {
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
    textWrap: 'pretty',
  } as React.CSSProperties,
  heading: {
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
    textWrap: 'balance',
  } as React.CSSProperties,
  badge: {
    whiteSpace: 'nowrap',
    flexShrink: 0,
  } as React.CSSProperties,
  preLine: {
    whiteSpace: 'pre-line',
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
    textWrap: 'pretty',
  } as React.CSSProperties,
};

/** 한국어 타이포그래피 프리셋별 CSS 선언 문자열 토큰 */
export const KOREAN_TYPOGRAPHY_CSS_RULES: Record<KoreanTypographyPreset, string> = {
  prose: 'word-break: keep-all; overflow-wrap: break-word; text-wrap: pretty;',
  heading: 'word-break: keep-all; overflow-wrap: break-word; text-wrap: balance;',
  badge: 'white-space: nowrap; flex-shrink: 0;',
  preLine: 'white-space: pre-line; word-break: keep-all; overflow-wrap: break-word; text-wrap: pretty;',
};

/** 전체 한국어 타이포그래피 유틸리티 스타일시트 문자열 */
export const KOREAN_TYPOGRAPHY_STYLESHEET = `
.rkm-prose-ko {
  word-break: keep-all;
  overflow-wrap: break-word;
  text-wrap: pretty;
}
.rkm-heading-balance {
  word-break: keep-all;
  overflow-wrap: break-word;
  text-wrap: balance;
}
.rkm-badge-nowrap {
  white-space: nowrap;
  flex-shrink: 0;
}
.rkm-pre-line {
  white-space: pre-line;
  word-break: keep-all;
  overflow-wrap: break-word;
  text-wrap: pretty;
}
`.trim();

/** 프리셋에 해당하는 CSS 클래스명을 반환합니다. */
export function getKoreanTypographyClass(preset: KoreanTypographyPreset = 'prose'): string {
  return KOREAN_TYPOGRAPHY_CLASSES[preset];
}

/** 프리셋에 해당하는 React 인라인 스타일 객체를 반환합니다. */
export function getKoreanTypographyStyle(
  preset: KoreanTypographyPreset = 'prose',
): React.CSSProperties {
  return { ...KOREAN_TYPOGRAPHY_STYLES[preset] };
}

/** 프리셋에 해당하는 CSS 규칙 문자열(또는 전체 스타일시트)을 반환합니다. */
export function getKoreanTypographyCss(preset?: KoreanTypographyPreset): string {
  if (!preset) return KOREAN_TYPOGRAPHY_STYLESHEET;
  return KOREAN_TYPOGRAPHY_CSS_RULES[preset];
}
