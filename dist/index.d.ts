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
}

declare function Manuscript({ text, columns, rows, showSpaceMarks, cursorCell, cursorSide, onCellClick, dblQuoteInit, sglQuoteInit, showRowNums, errorCells, highlightCells, pageIndex, }: ManuscriptProps): React.ReactElement;

interface CursorMapsOptions {
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
declare function buildCursorMaps(text: string, options?: CursorMapsOptions): CursorMaps;

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
}
/**
 * 텍스트를 원고지 셀 배열로 변환합니다.
 *
 * @param text - 변환할 텍스트
 * @param options - 따옴표 초기 카운터 등 옵션
 * @returns FormattedCell 배열 (길이는 항상 BLOCK_SIZE의 배수)
 */
declare function buildFormattedCells(text: string, options?: FormatterOptions): FormattedCell[];

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

export { type AutoBlankCell, BLOCK_SIZE, type BracketCell, CLOSE_BRACKETS, CLOSE_QUOTE, type CursorMaps, type DoubleCell, EXCL_PUNCT, type EllipsisCell, type ExclCell, type FormattedCell, type FormatterOptions, type IndentCell, Manuscript, Manuscript as ManuscriptDefault, type ManuscriptProps, OPEN_BRACKETS, type OverflowPunctCell, PUNCT, type PunctWithQuoteCell, QUOTE_CHARS, type QuoteCell, SMALL_PUNCT, type SingleCell, type UnderflowCell, advanceQuoteCount, buildCursorMaps, buildFormattedCells, canGroupWithNext, isLineEndProhibited, isLineStartProhibited, isLowerAlpha, isNumber, isUpperAlpha };
