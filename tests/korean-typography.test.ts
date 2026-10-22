import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildFormattedCells } from '../src/core/formatter';
import { buildCursorMaps } from '../src/core/cursorMaps';
import {
  KOREAN_TYPOGRAPHY_CLASSES,
  KOREAN_TYPOGRAPHY_STYLES,
  KOREAN_TYPOGRAPHY_CSS_RULES,
  KOREAN_TYPOGRAPHY_STYLESHEET,
  getKoreanTypographyClass,
  getKoreanTypographyStyle,
  getKoreanTypographyCss,
} from '../src/core/typography';
import type { FormattedCell, KinsokuMode, WordWrapMode } from '../src/types';

// Node.js tsx 환경에서 CSS import 지원
const moduleWithExtensions = Module as unknown as {
  _extensions: Record<string, (mod: unknown, filename: string) => void>;
};
if (moduleWithExtensions._extensions) {
  moduleWithExtensions._extensions['.css'] = () => {};
}

/** 셀이 UnderflowCell인지 판별 */
function isUnderflowCell(cell: FormattedCell): boolean {
  return typeof cell === 'object' && cell !== null && 'underflow' in cell && cell.underflow === true;
}

/** 셀이 AutoBlankCell인지 판별 */
function isAutoBlankCell(cell: FormattedCell): boolean {
  return typeof cell === 'object' && cell !== null && 'autoBlank' in cell && cell.autoBlank === true;
}

/**
 * 양방향 커서 매핑 불변식(Invariant) 검증 헬퍼
 * 모든 (wordWrapMode, kinsokuMode) 조합에서 buildFormattedCells와 buildCursorMaps가
 * 정확히 동일한 셀 인덱스를 가리키는지 검증합니다.
 */
function assertCursorMapInvariants(
  text: string,
  options: {
    columns?: number;
    rows?: number;
    wordWrapMode?: WordWrapMode;
    kinsokuMode?: KinsokuMode;
  } = {},
): void {
  const cells = buildFormattedCells(text, options);
  const maps = buildCursorMaps(text, options);

  assert.equal(
    maps.cellToChar.length,
    cells.length,
    `cellToChar length (${maps.cellToChar.length}) must equal formattedCells length (${cells.length})`,
  );
  assert.equal(maps.charToCell.length, text.length + 1);

  // 단조 비감소(Monotonic non-decreasing) 불변식 확인
  for (let i = 1; i < maps.charToCell.length; i++) {
    assert.ok(
      maps.charToCell[i] >= maps.charToCell[i - 1],
      `charToCell must be monotonic non-decreasing at char ${i}: ${maps.charToCell[i - 1]} -> ${maps.charToCell[i]}`,
    );
  }
  for (let c = 1; c < maps.cellToChar.length; c++) {
    assert.ok(
      maps.cellToChar[c] >= maps.cellToChar[c - 1],
      `cellToChar must be monotonic non-decreasing at cell ${c}: ${maps.cellToChar[c - 1]} -> ${maps.cellToChar[c]}`,
    );
  }

  // 각 가시 문자(개행 제외)가 가리키는 셀이 실제 유효한 콘텐츠 셀이고 양방향 범위가 일치하는지 확인
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const cellIdx = maps.charToCell[i];
    assert.ok(cellIdx >= 0 && cellIdx < cells.length, `charToCell[${i}] out of bounds: ${cellIdx}`);

    if (ch === '\n') continue;

    // 자연 줄바꿈 직후 생략된 공백인 경우 다음 글자와 같은 셀을 가리킴
    const cell = cells[cellIdx];
    const isSkippedBoundarySpace =
      ch === ' ' && i + 1 < text.length && maps.charToCell[i + 1] === cellIdx && cell !== ' ';
    if (isSkippedBoundarySpace) continue;

    assert.ok(
      !isUnderflowCell(cell) && !isAutoBlankCell(cell) && cell !== '',
      `char[${i}] ('${ch}') mapped to non-content cell at index ${cellIdx}: ${JSON.stringify(cell)}`,
    );

    const charEnd = maps.cellToChar[cellIdx];
    const charStart = cellIdx > 0 ? maps.cellToChar[cellIdx - 1] : 0;
    assert.ok(
      i >= charStart && i < charEnd,
      `Bidirectional mismatch at char ${i} ('${ch}'): cell=${cellIdx} spans [${charStart}, ${charEnd})`,
    );
  }
}

describe('한국어 어절 줄바꿈(wordWrapMode) 및 행두/행말 금칙처리(kinsokuMode) 회귀 테스트', () => {
  it('AC-1: 기본 옵션(wordWrapMode="char", kinsokuMode="hang")은 옵션 미지정 시와 100% 동일하게 동작한다', () => {
    const sample = ' “한국어 타이포그래피 디테일!” 테스트... 2026년 ab12 완료.';
    const defaultCells = buildFormattedCells(sample);
    const explicitCells = buildFormattedCells(sample, {
      wordWrapMode: 'char',
      kinsokuMode: 'hang',
    });
    assert.deepEqual(explicitCells, defaultCells);

    const defaultMaps = buildCursorMaps(sample);
    const explicitMaps = buildCursorMaps(sample, {
      wordWrapMode: 'char',
      kinsokuMode: 'hang',
    });
    assert.deepEqual(explicitMaps, defaultMaps);
  });

  it('AC-1 & Step 3 AC-1: wordWrapMode="eojeol" 설정 시 한국어 어절 중간 끊김이 0건이며 남은 칸은 UnderflowCell로 채워진다', () => {
    // 10열 원고지: "한국어 어절"(6칸) + " "(1칸, col=6) -> 남은 칸 3칸(col 7,8,9)
    // 다음 어절 "줄바꿈을"(4칸)은 3칸에 들어가지 않으므로 col 7,8,9를 UnderflowCell로 채우고 다음 행(cell 10) 첫 칸으로 이동해야 함
    const text = '한국어 어절 줄바꿈을 정밀하게 보정합니다';
    const columns = 10;
    const cells = buildFormattedCells(text, {
      columns,
      rows: 10,
      wordWrapMode: 'eojeol',
      kinsokuMode: 'hang',
    });
    const maps = buildCursorMaps(text, {
      columns,
      rows: 10,
      wordWrapMode: 'eojeol',
      kinsokuMode: 'hang',
    });

    // 1행 col 7, 8, 9는 UnderflowCell이어야 함
    assert.ok(isUnderflowCell(cells[7]), 'cell 7 should be UnderflowCell');
    assert.ok(isUnderflowCell(cells[8]), 'cell 8 should be UnderflowCell');
    assert.ok(isUnderflowCell(cells[9]), 'cell 9 should be UnderflowCell');

    // "줄바꿈을"은 2행 첫 칸(cell 10)부터 시작해야 함
    assert.equal(cells[10], '줄');
    assert.equal(cells[11], '바');
    assert.equal(cells[12], '꿈');
    assert.equal(cells[13], '을');

    // 모든 어절(공백 기준 토큰)의 시작 셀과 끝 셀이 동일한 행(row)에 위치하는지(어절 중간 음절 끊김 0건) 검증
    const words = text.split(' ');
    let searchFrom = 0;
    for (const word of words) {
      const startIdx = text.indexOf(word, searchFrom);
      const endIdx = startIdx + word.length - 1;
      searchFrom = endIdx + 1;

      const startCell = maps.charToCell[startIdx];
      const endCell = maps.charToCell[endIdx];
      const startRow = Math.floor(startCell / columns);
      const endRow = Math.floor(endCell / columns);
      assert.equal(
        startRow,
        endRow,
        `어절 "${word}"이 행 경계에서 쪼개졌습니다: row ${startRow} (cell ${startCell}) -> row ${endRow} (cell ${endCell})`,
      );
    }

    assertCursorMapInvariants(text, {
      columns,
      rows: 10,
      wordWrapMode: 'eojeol',
      kinsokuMode: 'hang',
    });
  });

  it('Step 1 AC-2: 1행 전체 길이를 초과하는 초장문 어절 및 긴 URL은 무한 루프 없이 행 끝에 맞춰 안전하게 분할된다', () => {
    const text = '짧은어절 https://example.com/korean-typography-linebreak-detail 초장문한국어어절테스트입니다';
    const columns = 10;
    const cells = buildFormattedCells(text, {
      columns,
      rows: 10,
      wordWrapMode: 'eojeol',
      kinsokuMode: 'push',
    });

    // "짧은어절"(0..3), " "(4), col 5..9는 UnderflowCell
    for (let c = 5; c <= 9; c++) {
      assert.ok(isUnderflowCell(cells[c]), `cell ${c} should be UnderflowCell before long URL`);
    }

    // URL은 2행 첫 칸(cell 10)에서 시작하고 10칸을 채운 뒤 다음 행으로 안전 분할됨
    assert.deepEqual(cells[10], { double: 'ht' });
    assertCursorMapInvariants(text, {
      columns,
      rows: 10,
      wordWrapMode: 'eojeol',
      kinsokuMode: 'push',
    });
  });

  it('Step 3 AC-2: 행두 금칙 문자(마침표, 쉼표, 닫는 따옴표/괄호)와 행말 금칙 문자(여는 따옴표/괄호)가 hang 및 push 모드에서 의도대로 동작한다', () => {
    const columns = 10;

    // 1) 행두 금칙 문자: 10글자 뒤 마침표("가나다라마바사아자차.")
    const lineStartPunctText = '가나다라마바사아자차.';

    // hang 모드: 10번째 칸(cell 9)에 '차'와 overflowPunct '.'가 팬텀 셀로 걸침
    const hangCells = buildFormattedCells(lineStartPunctText, {
      columns,
      wordWrapMode: 'char',
      kinsokuMode: 'hang',
    });
    assert.deepEqual(hangCells[9], { char: '차', overflowPunct: '.' });
    assert.equal(hangCells[10], '');

    // push 모드: 10번째 칸(cell 9)은 UnderflowCell로 비워지고 '차'와 '.'가 함께 다음 행(cell 10, 11)으로 밀려남
    const pushCells = buildFormattedCells(lineStartPunctText, {
      columns,
      wordWrapMode: 'char',
      kinsokuMode: 'push',
    });
    assert.ok(isUnderflowCell(pushCells[9]), 'cell 9 in push mode must be UnderflowCell');
    assert.equal(pushCells[10], '차');
    assert.equal(pushCells[11], '.');

    // 2) 닫는 따옴표/괄호 행두 금칙 처리: "“가나다라마바사아자”" (여는 따옴표 + 9글자 + 닫는 따옴표)
    const closeQuoteText = '“가나다라마바사아자”';
    const hangQuoteCells = buildFormattedCells(closeQuoteText, {
      columns,
      wordWrapMode: 'char',
      kinsokuMode: 'hang',
    });
    assert.deepEqual(hangQuoteCells[9], { char: '자', overflowQuote: '”' });

    const pushQuoteCells = buildFormattedCells(closeQuoteText, {
      columns,
      wordWrapMode: 'char',
      kinsokuMode: 'push',
    });
    assert.ok(isUnderflowCell(pushQuoteCells[9]), 'cell 9 before closing quote in push mode must be UnderflowCell');
    assert.equal(pushQuoteCells[10], '자');
    assert.deepEqual(pushQuoteCells[11], { quoteChar: '”', isOpen: false });

    // 3) 행말 금칙 문자(여는 괄호/따옴표): 9글자 뒤 10번째 칸(col=9)에 여는 괄호 '('가 오면 UnderflowCell 삽입 후 다음 행 첫 칸(cell 10)에 배치
    const openBracketText = '가나다라마바사아자(괄호)';
    for (const kinsokuMode of ['hang', 'push'] as const) {
      const bracketCells = buildFormattedCells(openBracketText, {
        columns,
        wordWrapMode: 'char',
        kinsokuMode,
      });
      assert.ok(isUnderflowCell(bracketCells[9]), `cell 9 must be UnderflowCell in ${kinsokuMode} mode`);
      assert.deepEqual(bracketCells[10], { bracketChar: '(', isOpen: true });
      assert.equal(bracketCells[11], '괄');
      assertCursorMapInvariants(openBracketText, { columns, wordWrapMode: 'char', kinsokuMode });
    }

    assertCursorMapInvariants(lineStartPunctText, { columns, wordWrapMode: 'char', kinsokuMode: 'hang' });
    assertCursorMapInvariants(lineStartPunctText, { columns, wordWrapMode: 'char', kinsokuMode: 'push' });
    assertCursorMapInvariants(closeQuoteText, { columns, wordWrapMode: 'char', kinsokuMode: 'hang' });
    assertCursorMapInvariants(closeQuoteText, { columns, wordWrapMode: 'char', kinsokuMode: 'push' });
  });

  it('Step 1 AC-3 & Step 3 AC-1: 모든 (wordWrapMode × kinsokuMode) 조합에서 복합 문장의 양방향 커서 매핑 불변식이 100% 성립한다', () => {
    const complexTexts = [
      '한국어 디자인에서 줄바꿈은 가독성을 좌우합니다. “정말 그럴까요?” 네, 그렇습니다!',
      '긴 영문 URL https://github.com/neohum/react-korean-manuscript 과(괄호) [대괄호] 테스트입니다.',
      '첫째 줄입니다.\n 둘째 줄 들여쓰기와 말줄임표…… 그리고 ...... 확인!',
    ];

    const wrapModes: WordWrapMode[] = ['char', 'eojeol'];
    const kinsokuModes: KinsokuMode[] = ['hang', 'push'];

    for (const text of complexTexts) {
      for (const wordWrapMode of wrapModes) {
        for (const kinsokuMode of kinsokuModes) {
          assertCursorMapInvariants(text, {
            columns: 10,
            rows: 10,
            wordWrapMode,
            kinsokuMode,
          });
        }
      }
    }
  });

  it('Step 2 AC-1/AC-2 & Step 3 AC-3: typography.ts 유틸리티와 Manuscript 컴포넌트가 한국어 줄바꿈 4대 규칙 토큰을 모두 포함한다', async () => {
    // 클래스명 검증
    assert.equal(KOREAN_TYPOGRAPHY_CLASSES.proseKo, 'rkm-prose-ko');
    assert.equal(KOREAN_TYPOGRAPHY_CLASSES.headingBalance, 'rkm-heading-balance');
    assert.equal(KOREAN_TYPOGRAPHY_CLASSES.badgeNowrap, 'rkm-badge-nowrap');
    assert.equal(KOREAN_TYPOGRAPHY_CLASSES.preLine, 'rkm-pre-line');

    assert.equal(getKoreanTypographyClass('prose'), 'rkm-prose-ko');
    assert.equal(getKoreanTypographyClass('heading'), 'rkm-heading-balance');
    assert.equal(getKoreanTypographyClass('badge'), 'rkm-badge-nowrap');
    assert.equal(getKoreanTypographyClass('preLine'), 'rkm-pre-line');

    // 스타일 객체 검증
    assert.deepEqual(getKoreanTypographyStyle('prose'), {
      wordBreak: 'keep-all',
      overflowWrap: 'break-word',
      textWrap: 'pretty',
    });
    assert.deepEqual(getKoreanTypographyStyle('heading'), {
      wordBreak: 'keep-all',
      overflowWrap: 'break-word',
      textWrap: 'balance',
    });
    assert.deepEqual(getKoreanTypographyStyle('badge'), {
      whiteSpace: 'nowrap',
      flexShrink: 0,
    });
    assert.deepEqual(getKoreanTypographyStyle('preLine'), {
      whiteSpace: 'pre-line',
      wordBreak: 'keep-all',
      overflowWrap: 'break-word',
      textWrap: 'pretty',
    });

    // CSS 토큰 문자열 단언 (Step 3 AC-3 필수 토큰 확인)
    const fullCss = getKoreanTypographyCss();
    assert.ok(fullCss.includes('word-break: keep-all'));
    assert.ok(fullCss.includes('overflow-wrap: break-word'));
    assert.ok(fullCss.includes('text-wrap: balance'));
    assert.ok(fullCss.includes('text-wrap: pretty'));
    assert.ok(fullCss.includes('white-space: nowrap'));
    assert.ok(fullCss.includes('white-space: pre-line'));
    assert.equal(KOREAN_TYPOGRAPHY_STYLESHEET, fullCss);
    assert.ok(KOREAN_TYPOGRAPHY_CSS_RULES.prose.includes('word-break: keep-all'));
    assert.ok(KOREAN_TYPOGRAPHY_STYLES.prose.wordBreak === 'keep-all');

    // Manuscript.css 파일에 4대 유틸리티 클래스가 정의되어 있는지 검증
    const cssFileContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/Manuscript.css'),
      'utf8',
    );
    assert.ok(cssFileContent.includes('.rkm-prose-ko'));
    assert.ok(cssFileContent.includes('.rkm-heading-balance'));
    assert.ok(cssFileContent.includes('.rkm-badge-nowrap'));
    assert.ok(cssFileContent.includes('.rkm-pre-line'));
    assert.ok(cssFileContent.includes('word-break: keep-all'));
    assert.ok(cssFileContent.includes('overflow-wrap: break-word'));
    assert.ok(cssFileContent.includes('text-wrap: balance'));
    assert.ok(cssFileContent.includes('text-wrap: pretty'));
    assert.ok(cssFileContent.includes('white-space: nowrap'));

    // Manuscript 컴포넌트 SSR 렌더링 및 Props 연동 검증
    const { Manuscript } = await import('../src/index');
    const html = renderToStaticMarkup(
      React.createElement(Manuscript, {
        text: '한국어 어절 줄바꿈을 테스트합니다.',
        columns: 10,
        rows: 5,
        showRowNums: true,
        wordWrapMode: 'eojeol',
        kinsokuMode: 'push',
      }),
    );

    assert.ok(html.includes('data-word-wrap-mode="eojeol"'));
    assert.ok(html.includes('data-kinsoku-mode="push"'));
    assert.ok(html.includes('manuscript-row-num rkm-badge-nowrap'));
    assert.ok(html.includes('manuscript-page-num rkm-badge-nowrap'));
  });
});
