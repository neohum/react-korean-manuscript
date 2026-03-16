/** FormattedCell: 단순 문자열 또는 특수 셀 객체 */
export type FormattedCell =
  | string  // 일반 글자 또는 빈 칸('')
  | OverflowPunctCell
  | EllipsisCell
  | QuoteCell
  | PunctWithQuoteCell
  | ExclCell
  | AutoBlankCell
  | UnderflowCell
  | IndentCell
  | BracketCell
  | DoubleCell
  | SingleCell;

export interface OverflowPunctCell {
  char: string;
  overflowPunct?: string;
  overflowQuote?: string;
}

export interface EllipsisCell {
  ellipsis: string;
}

export interface QuoteCell {
  quoteChar: string;
  isOpen: boolean;
}

export interface PunctWithQuoteCell {
  punctWithQuote: true;
  punct: string;
  quote: string;
}

export interface ExclCell {
  excl: string;
}

export interface AutoBlankCell {
  autoBlank: true;
}

export interface UnderflowCell {
  underflow: true;
}

export interface IndentCell {
  indent: true;
}

export interface BracketCell {
  bracketChar: string;
  isOpen: boolean;
}

export interface DoubleCell {
  double: string;
}

export interface SingleCell {
  single: string;
  type: 'alpha-num-single';
}

/** buildCursorMaps, buildFormattedCells 반환값 */
export interface CursorMaps {
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
export interface ManuscriptProps {
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
