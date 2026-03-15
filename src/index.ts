// Components
export { Manuscript } from './components/Manuscript';
export { default as ManuscriptDefault } from './components/Manuscript';

// Core utilities
export { buildCursorMaps } from './core/cursorMaps';
export { buildFormattedCells, BLOCK_SIZE } from './core/formatter';

// Rules & helpers
export {
  isLineStartProhibited,
  isLineEndProhibited,
  advanceQuoteCount,
  canGroupWithNext,
  isLowerAlpha,
  isUpperAlpha,
  isNumber,
} from './core/rules';

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
} from './types';
export type { FormatterOptions } from './core/formatter';
