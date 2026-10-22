import React from 'react';

/** FormattedCell: 단순 문자열 또는 특수 셀 객체 */
type FormattedCell = string | OverflowPunctCell | EllipsisCell | QuoteCell | PunctWithQuoteCell | ExclCell | AutoBlankCell | UnderflowCell | IndentCell | BracketCell | DoubleCell | SingleCell;
interface OverflowPunctCell {
    char: string;
    overflowPunct?: string;
    overflowQuote?: string;
}
interface EllipsisCell {
    ellipsis: string;
}
interface QuoteCell {
    quoteChar: string;
    isOpen: boolean;
}
interface PunctWithQuoteCell {
    punctWithQuote: true;
    punct: string;
    quote: string;
}
interface ExclCell {
    excl: string;
}
interface AutoBlankCell {
    autoBlank: true;
}
interface UnderflowCell {
    underflow: true;
}
interface IndentCell {
    indent: true;
}
interface BracketCell {
    bracketChar: string;
    isOpen: boolean;
}
interface DoubleCell {
    double: string;
}
interface SingleCell {
    single: string;
    type: 'alpha-num-single';
}
/** 한국어 어절 줄바꿈 모드 ('char': 1칸 1글자 기본, 'eojeol': 어절 단위 줄바꿈) */
type WordWrapMode = 'char' | 'eojeol';
/** 행두/행말 금칙처리 모드 ('hang': 걸침 팬텀 셀 기본, 'push': 다음 행 밀어내기) */
type KinsokuMode = 'hang' | 'push';
/** buildCursorMaps, buildFormattedCells 반환값 */
interface CursorMaps {
    /** charToCell[charIndex] = cellIndex: 문자 인덱스 → 셀 인덱스 */
    charToCell: number[];
    /** cellToChar[cellIndex] = charEnd: 셀 인덱스 → 문자 끝 인덱스(exclusive) */
    cellToChar: number[];
    /** 사용된 열 수 */
    columns: number;
    /** 사용된 행 수 */
    rows: number;
}
/** Manuscript 컴포넌트 Props */
interface ManuscriptProps {
    /** 렌더링할 텍스트 */
    text: string;
    /**
     * 한 행의 열(칸) 수 (기본값: 10)
     * 예) 20열 원고지 → columns={20}
     */
    columns?: number;
    /**
     * 한 블록(페이지)의 행 수 (기본값: 10)
     * 예) 5행만 → rows={5}
     */
    rows?: number;
    /** 공백 표시 여부 */
    showSpaceMarks?: boolean;
    /** 커서가 위치한 셀 인덱스 */
    cursorCell?: number | null;
    /** 커서 위치 ('left' | 'right') */
    cursorSide?: 'left' | 'right';
    /** 셀 클릭 핸들러 */
    onCellClick?: ((cellIndex: number, side: 'left' | 'right') => void) | null;
    /** 겹따옴표 초기 카운터 */
    dblQuoteInit?: number;
    /** 홑따옴표 초기 카운터 */
    sglQuoteInit?: number;
    /** 행 번호 표시 여부 */
    showRowNums?: boolean;
    /** 맞춤법 오류 셀 인덱스 집합 */
    errorCells?: Set<number>;
    /** TTS 읽기 중 강조할 셀 인덱스 집합 */
    highlightCells?: Set<number> | null;
    /** 특정 페이지만 렌더링 (썸네일 모드) */
    pageIndex?: number | null;
    /** 한국어 줄바꿈 모드 (기본값: 'char') */
    wordWrapMode?: WordWrapMode;
    /** 행두/행말 금칙처리 모드 (기본값: 'hang') */
    kinsokuMode?: KinsokuMode;
}

declare function Manuscript({ text, columns, rows, showSpaceMarks, cursorCell, cursorSide, onCellClick, dblQuoteInit, sglQuoteInit, showRowNums, errorCells, highlightCells, pageIndex, wordWrapMode, kinsokuMode, }: ManuscriptProps): React.ReactElement;

interface CursorMapsOptions {
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
declare function buildCursorMaps(text: string, options?: CursorMapsOptions): CursorMaps;

/** 기본 블록(페이지) 크기: 열 수 × 행 수 */
declare const DEFAULT_COLUMNS = 10;
declare const DEFAULT_ROWS = 10;
/** 기본 블록 크기 (하위 호환용) */
declare const BLOCK_SIZE: number;
interface FormatterOptions {
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
declare function buildFormattedCells(text: string, options?: FormatterOptions): FormattedCell[];

/** 한국어 타이포그래피 줄바꿈 프리셋 키 */
type KoreanTypographyPreset = 'prose' | 'heading' | 'badge' | 'preLine';
/** 한국어 타이포그래피 유틸리티 CSS 클래스명 상수 */
declare const KOREAN_TYPOGRAPHY_CLASSES: {
    /** 본문·미리보기·문장 카드: 어절 단위 줄바꿈 + 긴 영문/URL 안전 분할 + 문단 끝 고아 단어 방지 */
    readonly prose: "rkm-prose-ko";
    readonly proseKo: "rkm-prose-ko";
    /** 제목·섹션 헤더·배너: 어절 단위 줄바꿈 + 줄 길이 균형 */
    readonly heading: "rkm-heading-balance";
    readonly headingBalance: "rkm-heading-balance";
    /** 상태 배지·버튼·행/페이지 번호: 줄바꿈 금지 단일 행 유지 */
    readonly badge: "rkm-badge-nowrap";
    readonly badgeNowrap: "rkm-badge-nowrap";
    /** 줄바꿈 보존 텍스트: 개행(\n) 보존 + 한국어 어절 줄바꿈 */
    readonly preLine: "rkm-pre-line";
};
/** 한국어 타이포그래피 프리셋별 인라인 스타일 객체 */
declare const KOREAN_TYPOGRAPHY_STYLES: Record<KoreanTypographyPreset, React.CSSProperties>;
/** 한국어 타이포그래피 프리셋별 CSS 선언 문자열 토큰 */
declare const KOREAN_TYPOGRAPHY_CSS_RULES: Record<KoreanTypographyPreset, string>;
/** 전체 한국어 타이포그래피 유틸리티 스타일시트 문자열 */
declare const KOREAN_TYPOGRAPHY_STYLESHEET: string;
/** 프리셋에 해당하는 CSS 클래스명을 반환합니다. */
declare function getKoreanTypographyClass(preset?: KoreanTypographyPreset): string;
/** 프리셋에 해당하는 React 인라인 스타일 객체를 반환합니다. */
declare function getKoreanTypographyStyle(preset?: KoreanTypographyPreset): React.CSSProperties;
/** 프리셋에 해당하는 CSS 규칙 문자열(또는 전체 스타일시트)을 반환합니다. */
declare function getKoreanTypographyCss(preset?: KoreanTypographyPreset): string;

/** 영소문자 여부 */
declare const isLowerAlpha: (c: string) => boolean;
/** 영대문자 여부 */
declare const isUpperAlpha: (c: string) => boolean;
/** 숫자 여부 */
declare const isNumber: (c: string) => boolean;
/**
 * 영소문자/숫자 2글자를 한 칸에 배치할 수 있는지 여부
 * 표준 원고지 규칙: 영소문자·아라비아 숫자는 이종(혼합) 포함 2자 1칸
 */
declare function canGroupWithNext(c1: string, c2: string | undefined): boolean;
/**
 * 줄 끝 금지 (Underflow) 판별
 * 여는 괄호·따옴표가 행의 마지막 칸(col === columns-1)에 오는 경우
 */
declare function isLineEndProhibited(c: string, col: number, dblQ: number, sglQ: number, columns?: number): boolean;
/**
 * 줄 시작 금지 (Overflow) 판별
 * 구두점·닫는 괄호/따옴표가 자연 줄바꿈(justWrapped) 직후 행 첫 칸에 오는 경우
 */
declare function isLineStartProhibited(c: string, justWrapped: boolean, dblQ: number, sglQ: number, prevIsExcl: boolean): boolean;
/**
 * 따옴표 카운터 업데이트
 * @returns [새로운 dblQ, 새로운 sglQ]
 */
declare function advanceQuoteCount(c: string, dblQ: number, sglQ: number): [number, number];
/**
 * 현재 인덱스가 새로운 어절(공백/줄바꿈으로 구분된 토큰)의 시작인지 판별
 */
declare function isEojeolStart(chars: string[], index: number): boolean;
interface LogicalUnitMetrics {
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
declare function measureLogicalUnit(chars: string[], index: number, dblQ: number, sglQ: number, prevIsExcl?: boolean): LogicalUnitMetrics;
/**
 * 어절 단위 줄바꿈(wordWrapMode === 'eojeol') 시 현재 어절을 다음 행 첫 칸으로 넘기기 위해
 * 삽입해야 할 UnderflowCell 개수를 반환합니다.
 */
declare function countEojeolUnderflowCells(chars: string[], index: number, col: number, columns: number, dblQ: number, sglQ: number, kinsokuMode?: KinsokuMode): number;
/**
 * 밀어내기 금칙처리(kinsokuMode === 'push') 시
 * 현재 유닛 뒤에 이어지는 행두 금칙 문자(마침표, 쉼표, 닫는 따옴표/괄호 등)가
 * 다음 줄 첫 칸(col === 0)으로 떨어지는 것을 방지하기 위해 삽입할 UnderflowCell 개수를 반환합니다.
 */
declare function countKinsokuPushUnderflowCells(chars: string[], index: number, col: number, columns: number, dblQ: number, sglQ: number, prevIsExcl?: boolean): number;

/** 원고지 규칙 상수 */
/** 구두점: 줄 시작 금지 대상 (마침표, 쉼표, 느낌표, 물음표 등) */
declare const PUNCT: Set<string>;
/** 마침표·쉼표: 셀 좌하단 표시 대상 */
declare const SMALL_PUNCT: Set<string>;
/** 느낌표·물음표: 셀 중앙 표시 및 뒤에 자동 공백 삽입 */
declare const EXCL_PUNCT: Set<string>;
/** 모든 종류의 따옴표 */
declare const QUOTE_CHARS: Set<string>;
/** 닫는 따옴표 (줄 시작 금지) */
declare const CLOSE_QUOTE: Set<string>;
/** 여는 괄호·따옴표 (줄 끝 금지) */
declare const OPEN_BRACKETS: Set<string>;
/** 닫는 괄호·따옴표 (줄 시작 금지) */
declare const CLOSE_BRACKETS: Set<string>;

export { type AutoBlankCell, BLOCK_SIZE, type BracketCell, CLOSE_BRACKETS, CLOSE_QUOTE, type CursorMaps, type CursorMapsOptions, DEFAULT_COLUMNS, DEFAULT_ROWS, type DoubleCell, EXCL_PUNCT, type EllipsisCell, type ExclCell, type FormattedCell, type FormatterOptions, type IndentCell, KOREAN_TYPOGRAPHY_CLASSES, KOREAN_TYPOGRAPHY_CSS_RULES, KOREAN_TYPOGRAPHY_STYLES, KOREAN_TYPOGRAPHY_STYLESHEET, type KinsokuMode, type KoreanTypographyPreset, type LogicalUnitMetrics, Manuscript, Manuscript as ManuscriptDefault, type ManuscriptProps, OPEN_BRACKETS, type OverflowPunctCell, PUNCT, type PunctWithQuoteCell, QUOTE_CHARS, type QuoteCell, SMALL_PUNCT, type SingleCell, type UnderflowCell, type WordWrapMode, advanceQuoteCount, buildCursorMaps, buildFormattedCells, canGroupWithNext, countEojeolUnderflowCells, countKinsokuPushUnderflowCells, getKoreanTypographyClass, getKoreanTypographyCss, getKoreanTypographyStyle, isEojeolStart, isLineEndProhibited, isLineStartProhibited, isLowerAlpha, isNumber, isUpperAlpha, measureLogicalUnit };
