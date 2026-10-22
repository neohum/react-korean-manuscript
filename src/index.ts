// Components
export { Manuscript } from './components/Manuscript';
export { default as ManuscriptDefault } from './components/Manuscript';

// Core utilities
export { buildCursorMaps } from './core/cursorMaps';
export { buildFormattedCells, BLOCK_SIZE, DEFAULT_COLUMNS, DEFAULT_ROWS } from './core/formatter';

// Korean typography utilities
export {
  KOREAN_TYPOGRAPHY_CLASSES,
  KOREAN_TYPOGRAPHY_STYLES,
  KOREAN_TYPOGRAPHY_CSS_RULES,
  KOREAN_TYPOGRAPHY_STYLESHEET,
  getKoreanTypographyClass,
  getKoreanTypographyStyle,
  getKoreanTypographyCss,
} from './core/typography';
export type { KoreanTypographyPreset } from './core/typography';

// Rules & helpers
export {
  isLineStartProhibited,
  isLineEndProhibited,
  advanceQuoteCount,
  canGroupWithNext,
  isLowerAlpha,
  isUpperAlpha,
  isNumber,
  isEojeolStart,
  measureLogicalUnit,
  countEojeolUnderflowCells,
  countKinsokuPushUnderflowCells,
} from './core/rules';
export type { LogicalUnitMetrics } from './core/rules';

// Constants
export {
  PUNCT,
  SMALL_PUNCT,
  EXCL_PUNCT,
  QUOTE_CHARS,
  CLOSE_QUOTE,
  OPEN_BRACKETS,
  CLOSE_BRACKETS,
} from './core/constants';

// Types
export type {
  ManuscriptProps,
  CursorMaps,
  FormattedCell,
  OverflowPunctCell,
  EllipsisCell,
  QuoteCell,
  PunctWithQuoteCell,
  ExclCell,
  AutoBlankCell,
  UnderflowCell,
  IndentCell,
  BracketCell,
  DoubleCell,
  SingleCell,
  WordWrapMode,
  KinsokuMode,
} from './types';
export type { FormatterOptions } from './core/formatter';
export type { CursorMapsOptions } from './core/cursorMaps';
