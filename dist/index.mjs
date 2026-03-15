"use client";

// #style-inject:#style-inject
function styleInject(css, { insertAt } = {}) {
  if (!css || typeof document === "undefined") return;
  const head = document.head || document.getElementsByTagName("head")[0];
  const style = document.createElement("style");
  style.type = "text/css";
  if (insertAt === "top") {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

// src/components/Manuscript.css
styleInject('.manuscript-wrapper {\n  width: 100%;\n  max-width: 750px;\n  margin: 0 auto;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: flex-start;\n  flex: none;\n  min-height: max-content;\n  overflow: visible;\n}\n.manuscript-page-block {\n  width: 100%;\n  position: relative;\n  margin-bottom: 2rem;\n}\n.manuscript-page-block:last-child {\n  margin-bottom: 0;\n}\n.manuscript-row-nums {\n  position: absolute;\n  left: -1.6rem;\n  top: 0;\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n.manuscript-row-num {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  font-size: 0.6rem;\n  color: #b0b8c8;\n  font-family: monospace;\n  padding-right: 3px;\n  letter-spacing: 0;\n}\n.manuscript-page-num {\n  text-align: center;\n  font-size: 0.75rem;\n  color: #94a3b8;\n  margin-top: 0.4rem;\n  letter-spacing: 0.05em;\n  font-family: var(--font-serif, serif);\n}\n.manuscript-grid {\n  display: grid;\n  grid-template-columns: repeat(10, 1fr);\n  grid-template-rows: repeat(10, 1fr);\n  gap: 0;\n  background-color: var(--manuscript-grid-line, #c8b89a);\n  border: 3px solid var(--manuscript-grid-line, #c8b89a);\n  height: 100%;\n  aspect-ratio: 1;\n}\n.manuscript-cell {\n  aspect-ratio: 1;\n  background-color: var(--manuscript-cell-bg, #fffdf7);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-family: var(--manuscript-font-serif, serif);\n  font-size: 1.35rem;\n  font-weight: 500;\n  color: var(--manuscript-text-color, #1a1a1a);\n  position: relative;\n  border-right: 1px solid var(--manuscript-grid-line, #c8b89a);\n  border-bottom: 1px solid var(--manuscript-grid-line, #c8b89a);\n  box-sizing: border-box;\n}\n.manuscript-cell.cell-row-end {\n  border-right: none;\n}\n.manuscript-cell:nth-child(n+41):nth-child(-n+50) {\n  border-bottom: 2px solid var(--manuscript-grid-line, #c8b89a);\n}\n.cell-punct {\n  position: relative;\n}\n.punct-char {\n  position: absolute;\n  left: 25%;\n  top: 75%;\n  transform: translate(-50%, -50%);\n  font-size: 0.75em;\n}\n.cell-punct-open-quote {\n  position: relative;\n}\n.punct-char-open-quote {\n  position: absolute;\n  left: 75%;\n  top: 25%;\n  transform: translate(-50%, -50%);\n  font-size: 0.75em;\n}\n.cell-punct-close-quote {\n  position: relative;\n}\n.punct-char-close-quote {\n  position: absolute;\n  left: 25%;\n  top: 25%;\n  transform: translate(-50%, -50%);\n  font-size: 0.75em;\n}\n.cell-ellipsis {\n  position: relative;\n}\n.ellipsis-char {\n  font-size: 0.62em;\n  letter-spacing: -0.05em;\n  line-height: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n}\n.cell-auto-blank {\n  background-color: #f8fafc;\n  opacity: 0.85;\n}\n.cell-double {\n  position: relative;\n}\n.double-char {\n  font-size: 0.68em;\n  letter-spacing: -0.04em;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  font-weight: 500;\n}\n.cell-alpha-single {\n  font-size: 1.1em;\n  font-weight: 500;\n}\n.cell-indent {\n  background-color: #f0ede6;\n  position: relative;\n}\n.cell-indent::after {\n  content: "";\n  position: absolute;\n  inset: 20%;\n  border-radius: 2px;\n  background-color: #d4c9b0;\n  opacity: 0.5;\n}\n.indent-mark {\n  position: absolute;\n  color: #a89880;\n  font-size: 0.6em;\n  z-index: 2;\n  opacity: 0.7;\n}\n.space-mark-v {\n  color: #94a3b8;\n  font-size: 0.85em;\n  opacity: 0.7;\n}\n.cell-overflow-punct {\n  overflow: visible;\n}\n.overflow-phantom-cell {\n  position: absolute;\n  left: 100%;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  z-index: 5;\n}\n.phantom-excl {\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  font-size: 1em;\n}\n.manuscript-cell.cell-cursor,\n.manuscript-cell.cell-cursor-left {\n  background-color: #fffbeb;\n  cursor: text;\n}\n.manuscript-cell.cell-cursor::before,\n.manuscript-cell.cell-cursor-left::before {\n  content: "";\n  position: absolute;\n  left: 3px;\n  top: 10%;\n  bottom: 10%;\n  width: 2px;\n  background: #374151;\n  animation: rkm-blink-cursor 1s step-end infinite;\n  z-index: 5;\n}\n@keyframes rkm-blink-cursor {\n  0%, 100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0;\n  }\n}\n.manuscript-cell[onclick] {\n  cursor: text;\n}\n.cell-spell-error {\n  background-color: var(--manuscript-error-bg, #fef2f2) !important;\n  box-shadow: inset 0 -3px 0 0 var(--manuscript-error-color, #ef4444);\n}\n');

// src/core/constants.ts
var PUNCT = /* @__PURE__ */ new Set([".", ",", "\u3002", "\u3001", "\uFF0E", "\uFF0C", "!", "?", "\uFF01", "\uFF1F"]);
var SMALL_PUNCT = /* @__PURE__ */ new Set([".", ",", "\u3002", "\u3001", "\uFF0E", "\uFF0C"]);
var EXCL_PUNCT = /* @__PURE__ */ new Set(["!", "?", "\uFF01", "\uFF1F"]);
var QUOTE_CHARS = /* @__PURE__ */ new Set([
  '"',
  "\u201C",
  "\u201D",
  "\u201E",
  "'",
  "\u2018",
  "\u2019",
  "\u201A"
]);
var CLOSE_QUOTE = /* @__PURE__ */ new Set(["\u201D", "\u201E", "\u2019", "\u201A"]);
var OPEN_BRACKETS = /* @__PURE__ */ new Set([
  "(",
  "[",
  "{",
  "<",
  "\u201C",
  "\u2018",
  '"',
  "'"
]);
var CLOSE_BRACKETS = /* @__PURE__ */ new Set([
  ")",
  "]",
  "}",
  ">",
  "\u201D",
  "\u2019",
  '"',
  "'"
]);

// src/core/rules.ts
var isLowerAlpha = (c) => c >= "a" && c <= "z";
var isUpperAlpha = (c) => c >= "A" && c <= "Z";
var isNumber = (c) => c >= "0" && c <= "9";
function canGroupWithNext(c1, c2) {
  if (!c2) return false;
  const a = isLowerAlpha(c1) || isNumber(c1);
  const b = isLowerAlpha(c2) || isNumber(c2);
  return a && b;
}
function isLineEndProhibited(c, col, dblQ, sglQ, columns = 10) {
  if (col !== columns - 1) return false;
  if (!OPEN_BRACKETS.has(c)) return false;
  if (c === '"' || c === "\u201C" || c === "\u201D" || c === "\u201E") {
    return dblQ % 2 === 0;
  }
  if (c === "'" || c === "\u2018" || c === "\u2019" || c === "\u201A") {
    return sglQ % 2 === 0;
  }
  return true;
}
function isLineStartProhibited(c, justWrapped, dblQ, sglQ, prevIsExcl) {
  if (!justWrapped) return false;
  if (PUNCT.has(c)) return true;
  if (CLOSE_BRACKETS.has(c)) {
    if (c === '"' || c === "\u201C" || c === "\u201D" || c === "\u201E") {
      return prevIsExcl || dblQ % 2 !== 0;
    }
    if (c === "'" || c === "\u2018" || c === "\u2019" || c === "\u201A") {
      return prevIsExcl || sglQ % 2 !== 0;
    }
    return true;
  }
  return false;
}
function advanceQuoteCount(c, dblQ, sglQ) {
  if (c === '"' || c === "\u201C" || c === "\u201D" || c === "\u201E") {
    return [dblQ + 1, sglQ];
  }
  if (c === "'" || c === "\u2018" || c === "\u2019" || c === "\u201A") {
    return [dblQ, sglQ + 1];
  }
  return [dblQ, sglQ];
}

// src/core/formatter.ts
var DEFAULT_COLUMNS = 10;
var DEFAULT_ROWS = 10;
var BLOCK_SIZE = DEFAULT_COLUMNS * DEFAULT_ROWS;
function buildFormattedCells(text, options = {}) {
  const {
    dblQuoteInit = 0,
    sglQuoteInit = 0,
    columns = DEFAULT_COLUMNS,
    rows = DEFAULT_ROWS
  } = options;
  const blockSize = columns * rows;
  const chars = text.split("");
  const formattedCells = [];
  let currentColumn = 0;
  let dblQuoteCount = dblQuoteInit;
  let sglQuoteCount = sglQuoteInit;
  let isLineStart = true;
  let justWrapped = false;
  const pushCell = (cell) => {
    formattedCells.push(cell);
    const wasColLast = currentColumn === columns - 1;
    currentColumn = (currentColumn + 1) % columns;
    isLineStart = false;
    justWrapped = wasColLast;
  };
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (char === "\n") {
      if (!(currentColumn === 0 && justWrapped)) {
        const remaining = columns - currentColumn;
        for (let j = 0; j < remaining; j++) formattedCells.push("");
      }
      currentColumn = 0;
      isLineStart = true;
      justWrapped = false;
      continue;
    }
    if (char === " " && justWrapped) {
      justWrapped = false;
      continue;
    }
    if (isLineEndProhibited(char, currentColumn, dblQuoteCount, sglQuoteCount, columns)) {
      formattedCells.push({ underflow: true });
      const wasColLast = currentColumn === columns - 1;
      currentColumn = (currentColumn + 1) % columns;
      isLineStart = false;
      justWrapped = wasColLast;
    }
    let isCloseQuoteOverflow = false;
    if (currentColumn === 0 && justWrapped && formattedCells.length > 0 && CLOSE_BRACKETS.has(char)) {
      let prevIdx = formattedCells.length - 1;
      while (prevIdx >= 0) {
        const pc = formattedCells[prevIdx];
        if (pc === "") {
          prevIdx--;
          continue;
        }
        if (typeof pc === "object" && (pc.autoBlank || pc.underflow)) {
          prevIdx--;
          continue;
        }
        break;
      }
      const prevCell = prevIdx >= 0 ? formattedCells[prevIdx] : null;
      const prevIsExcl = prevCell !== null && typeof prevCell === "object" && "excl" in prevCell && !!prevCell.excl;
      if (char === '"' || char === "\u201C" || char === "\u201D" || char === "\u201E") {
        if (prevIsExcl || dblQuoteCount % 2 !== 0) {
          isCloseQuoteOverflow = true;
          dblQuoteCount++;
        }
      } else if (char === "'" || char === "\u2018" || char === "\u2019" || char === "\u201A") {
        if (prevIsExcl || sglQuoteCount % 2 !== 0) {
          isCloseQuoteOverflow = true;
          sglQuoteCount++;
        }
      } else {
        isCloseQuoteOverflow = true;
      }
    }
    if ((PUNCT.has(char) || isCloseQuoteOverflow) && currentColumn === 0 && formattedCells.length > 0) {
      const field = isCloseQuoteOverflow ? "overflowQuote" : "overflowPunct";
      let targetIdx = formattedCells.length - 1;
      while (targetIdx >= 0) {
        const tc = formattedCells[targetIdx];
        if (tc === "") {
          targetIdx--;
          continue;
        }
        if (typeof tc === "object" && (tc.autoBlank || tc.underflow)) {
          targetIdx--;
          continue;
        }
        break;
      }
      if (targetIdx >= 0) {
        const prev = formattedCells[targetIdx];
        if (typeof prev === "string" && prev !== "") {
          formattedCells[targetIdx] = { char: prev, [field]: char };
        } else if (typeof prev === "object") {
          const prevAny = prev;
          formattedCells[targetIdx] = { ...prevAny, [field]: (prevAny[field] || "") + char };
        } else {
          pushCell(char);
        }
      } else {
        pushCell(char);
      }
      continue;
    }
    if (QUOTE_CHARS.has(char)) {
      let isOpen;
      if (char === '"' || char === "\u201C" || char === "\u201D" || char === "\u201E") {
        isOpen = dblQuoteCount % 2 === 0;
        dblQuoteCount++;
      } else {
        isOpen = sglQuoteCount % 2 === 0;
        sglQuoteCount++;
      }
      if (!isOpen && formattedCells.length > 0) {
        const prev = formattedCells[formattedCells.length - 1];
        if (typeof prev === "string" && SMALL_PUNCT.has(prev)) {
          formattedCells[formattedCells.length - 1] = { punctWithQuote: true, punct: prev, quote: char };
          continue;
        }
      }
      pushCell({ quoteChar: char, isOpen });
      continue;
    }
    if (EXCL_PUNCT.has(char)) {
      pushCell({ excl: char });
      const nextChar = chars[i + 1];
      if (nextChar && nextChar !== " " && nextChar !== "\n" && !CLOSE_BRACKETS.has(nextChar)) {
        const wasColLast = currentColumn === columns - 1;
        formattedCells.push({ autoBlank: true });
        currentColumn = (currentColumn + 1) % columns;
        isLineStart = false;
        justWrapped = wasColLast;
      }
      continue;
    }
    if (char === "\u2026" && chars[i + 1] === "\u2026") {
      pushCell({ ellipsis: "\u2026" });
      pushCell({ ellipsis: "\u2026" });
      i += 1;
      continue;
    }
    if (char === "." && chars[i + 1] === "." && chars[i + 2] === "." && chars[i + 3] === "." && chars[i + 4] === "." && chars[i + 5] === ".") {
      pushCell({ ellipsis: "..." });
      pushCell({ ellipsis: "..." });
      i += 5;
      continue;
    }
    if (char === "." && chars[i + 1] === "." && chars[i + 2] === ".") {
      pushCell({ ellipsis: "..." });
      i += 2;
      continue;
    }
    if (OPEN_BRACKETS.has(char) || CLOSE_BRACKETS.has(char)) {
      const isOpen = OPEN_BRACKETS.has(char);
      pushCell({ bracketChar: char, isOpen });
      continue;
    }
    if (canGroupWithNext(char, chars[i + 1])) {
      pushCell({ double: char + chars[i + 1] });
      i += 1;
      continue;
    }
    if (isNumber(char) || isLowerAlpha(char) || isUpperAlpha(char)) {
      pushCell({ single: char, type: "alpha-num-single" });
      continue;
    }
    if (char === " " && justWrapped) {
      justWrapped = false;
      continue;
    }
    if (char === " " && isLineStart) {
      pushCell({ indent: true });
      continue;
    }
    pushCell(char);
  }
  const totalCells = formattedCells.length;
  const remainder = totalCells % blockSize;
  if (remainder !== 0 || totalCells === 0) {
    const paddingNeeded = totalCells === 0 ? blockSize : blockSize - remainder;
    for (let i = 0; i < paddingNeeded; i++) {
      formattedCells.push("");
    }
  }
  return formattedCells;
}

// src/components/Manuscript.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var EXCL_PUNCT_SET = EXCL_PUNCT;
function Manuscript({
  text,
  columns = DEFAULT_COLUMNS,
  rows = DEFAULT_ROWS,
  showSpaceMarks = false,
  cursorCell = null,
  cursorSide = "right",
  onCellClick = null,
  dblQuoteInit = 0,
  sglQuoteInit = 0,
  showRowNums = false,
  errorCells = /* @__PURE__ */ new Set(),
  pageIndex = null
}) {
  const blockSize = columns * rows;
  const formattedCells = buildFormattedCells(text, { dblQuoteInit, sglQuoteInit, columns, rows });
  const renderCell = (cell, index) => {
    const hasCursor = cursorCell === index;
    const handleClick = onCellClick ? (e) => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const clickedLeft = e.clientX - rect.left < rect.width / 2;
      onCellClick(index, clickedLeft ? "left" : "right");
    } : void 0;
    const cursorClass = hasCursor ? cursorSide === "left" ? " cell-cursor-left" : " cell-cursor" : "";
    const isRowEnd = (index + 1) % columns === 0;
    const rowEndClass = isRowEnd ? " cell-row-end" : "";
    const errorClass = errorCells.has(index) ? " cell-spell-error" : "";
    if (typeof cell === "object" && cell !== null && "char" in cell) {
      const oc = cell;
      const opChar = oc.overflowPunct || "";
      const oqChar = oc.overflowQuote || "";
      const isExclOverflow = EXCL_PUNCT_SET.has(opChar);
      const baseIsSmallPunct = SMALL_PUNCT.has(oc.char);
      const basePunctClass = baseIsSmallPunct ? " cell-punct" : "";
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `manuscript-cell cell-overflow-punct${basePunctClass}${cursorClass}${rowEndClass}${errorClass}`,
          onClick: handleClick,
          children: [
            baseIsSmallPunct ? /* @__PURE__ */ jsx("span", { className: "punct-char", children: oc.char }) : oc.char,
            (opChar || oqChar) && /* @__PURE__ */ jsxs("div", { className: "overflow-phantom-cell", children: [
              opChar && (isExclOverflow ? /* @__PURE__ */ jsx("span", { className: "phantom-excl", children: opChar }) : /* @__PURE__ */ jsx("span", { className: "punct-char", children: opChar })),
              oqChar && /* @__PURE__ */ jsx("span", { className: "punct-char-open-quote", children: oqChar })
            ] })
          ]
        },
        index
      );
    }
    if (typeof cell === "object" && cell !== null && "ellipsis" in cell) {
      return /* @__PURE__ */ jsx("div", { className: `manuscript-cell cell-ellipsis${cursorClass}${rowEndClass}${errorClass}`, onClick: handleClick, children: /* @__PURE__ */ jsx("span", { className: "ellipsis-char", children: cell.ellipsis }) }, index);
    }
    if (typeof cell === "object" && cell !== null && "punctWithQuote" in cell) {
      return /* @__PURE__ */ jsxs("div", { className: `manuscript-cell cell-punct${cursorClass}${rowEndClass}${errorClass}`, onClick: handleClick, children: [
        /* @__PURE__ */ jsx("span", { className: "punct-char", children: cell.punct }),
        /* @__PURE__ */ jsx("span", { className: "punct-char-close-quote", children: cell.quote })
      ] }, index);
    }
    if (typeof cell === "object" && cell !== null && "excl" in cell) {
      return /* @__PURE__ */ jsx("div", { className: `manuscript-cell${cursorClass}${rowEndClass}${errorClass}`, onClick: handleClick, children: cell.excl }, index);
    }
    if (typeof cell === "object" && cell !== null && "autoBlank" in cell) {
      return /* @__PURE__ */ jsx("div", { className: `manuscript-cell cell-auto-blank${cursorClass}${rowEndClass}${errorClass}`, onClick: handleClick }, index);
    }
    if (typeof cell === "object" && cell !== null && "underflow" in cell) {
      return /* @__PURE__ */ jsx("div", { className: `manuscript-cell cell-auto-blank${cursorClass}${rowEndClass}${errorClass}`, onClick: handleClick }, index);
    }
    if (typeof cell === "object" && cell !== null && "indent" in cell) {
      return /* @__PURE__ */ jsx("div", { className: `manuscript-cell cell-indent${cursorClass}${rowEndClass}${errorClass}`, onClick: handleClick, children: showSpaceMarks && /* @__PURE__ */ jsx("span", { className: "indent-mark", children: "\u21B5" }) }, index);
    }
    if (typeof cell === "object" && cell !== null && "quoteChar" in cell) {
      const qClass = cell.isOpen ? " cell-punct-open-quote" : " cell-punct-close-quote";
      const qSpanClass = cell.isOpen ? "punct-char-open-quote" : "punct-char-close-quote";
      return /* @__PURE__ */ jsx("div", { className: `manuscript-cell${qClass}${cursorClass}${rowEndClass}${errorClass}`, onClick: handleClick, children: /* @__PURE__ */ jsx("span", { className: qSpanClass, children: cell.quoteChar }) }, index);
    }
    if (typeof cell === "object" && cell !== null && "bracketChar" in cell) {
      return /* @__PURE__ */ jsx("div", { className: `manuscript-cell${cursorClass}${rowEndClass}${errorClass}`, onClick: handleClick, children: cell.bracketChar }, index);
    }
    if (typeof cell === "object" && cell !== null && "double" in cell) {
      return /* @__PURE__ */ jsx("div", { className: `manuscript-cell cell-double${cursorClass}${rowEndClass}${errorClass}`, onClick: handleClick, children: /* @__PURE__ */ jsx("span", { className: "double-char", children: cell.double }) }, index);
    }
    if (typeof cell === "object" && cell !== null && "single" in cell) {
      return /* @__PURE__ */ jsx("div", { className: `manuscript-cell cell-alpha-single${cursorClass}${rowEndClass}${errorClass}`, onClick: handleClick, children: cell.single }, index);
    }
    const isSmallPunct = typeof cell === "string" && SMALL_PUNCT.has(cell);
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: `manuscript-cell${isSmallPunct ? " cell-punct" : ""}${cursorClass}${rowEndClass}${errorClass}`,
        onClick: handleClick,
        children: cell === " " ? showSpaceMarks ? /* @__PURE__ */ jsx("span", { className: "space-mark-v", children: "v" }) : "" : isSmallPunct ? /* @__PURE__ */ jsx("span", { className: "punct-char", children: cell }) : cell
      },
      index
    );
  };
  const pageBlocks = [];
  for (let i = 0; i < formattedCells.length; i += blockSize) {
    pageBlocks.push(formattedCells.slice(i, i + blockSize));
  }
  const blocksToRender = pageIndex !== null && pageIndex !== void 0 ? pageBlocks[pageIndex] ? [pageBlocks[pageIndex]] : [[]] : pageBlocks;
  return /* @__PURE__ */ jsx("div", { className: "manuscript-wrapper", children: blocksToRender.map((blockCells, localIdx) => {
    const actualPageIndex = pageIndex !== null && pageIndex !== void 0 ? pageIndex : localIdx;
    const globalIndexOffset = actualPageIndex * BLOCK_SIZE;
    return /* @__PURE__ */ jsxs("div", { className: "manuscript-page-block", children: [
      showRowNums && /* @__PURE__ */ jsx("div", { className: "manuscript-row-nums", children: Array.from({ length: rows }, (_, i) => /* @__PURE__ */ jsx("div", { className: "manuscript-row-num", children: i + 1 }, i)) }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "manuscript-grid",
          style: {
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          },
          children: blockCells.map((cell, i) => renderCell(cell, globalIndexOffset + i))
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "manuscript-page-num", children: [
        "- ",
        actualPageIndex + 1,
        " -"
      ] })
    ] }, `page-${actualPageIndex}`);
  }) });
}
var Manuscript_default = Manuscript;

// src/core/cursorMaps.ts
function buildCursorMaps(text, options = {}) {
  const { columns = DEFAULT_COLUMNS, rows = DEFAULT_ROWS } = options;
  const blockSize = columns * rows;
  const chars = text.split("");
  const charToCell = [];
  const cellToChar = [];
  let col = 0, dblQ = 0, sglQ = 0;
  let isLineStart = true;
  let justWrapped = false;
  let prevIsExcl = false;
  const advCol = () => {
    justWrapped = col === columns - 1;
    col = (col + 1) % columns;
  };
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === "\n") {
      charToCell[i] = cellToChar.length;
      if (!(col === 0 && justWrapped)) {
        const remaining = columns - col;
        for (let j = 0; j < remaining; j++) cellToChar.push(i + 1);
      }
      col = 0;
      isLineStart = true;
      justWrapped = false;
      prevIsExcl = false;
      continue;
    }
    if (c === " " && justWrapped) {
      charToCell[i] = cellToChar.length;
      justWrapped = false;
      prevIsExcl = false;
      continue;
    }
    if (isLineEndProhibited(c, col, dblQ, sglQ, columns)) {
      cellToChar.push(i);
      advCol();
      isLineStart = false;
    }
    const isOverflowChar = col === 0 && cellToChar.length > 0 && (PUNCT.has(c) || CLOSE_BRACKETS.has(c) && (c === '"' || c === "\u201C" || c === "\u201D" || c === "\u201E" ? prevIsExcl || dblQ % 2 !== 0 : c === "'" || c === "\u2018" || c === "\u2019" || c === "\u201A" ? prevIsExcl || sglQ % 2 !== 0 : true));
    if (isOverflowChar) {
      charToCell[i] = cellToChar.length - 1;
      cellToChar[cellToChar.length - 1] = i + 1;
      if (QUOTE_CHARS.has(c)) [dblQ, sglQ] = advanceQuoteCount(c, dblQ, sglQ);
      prevIsExcl = false;
      continue;
    }
    if (QUOTE_CHARS.has(c)) [dblQ, sglQ] = advanceQuoteCount(c, dblQ, sglQ);
    charToCell[i] = cellToChar.length;
    if (SMALL_PUNCT.has(c) && chars[i + 1] && QUOTE_CHARS.has(chars[i + 1]) && CLOSE_BRACKETS.has(chars[i + 1])) {
      const nc = chars[i + 1];
      let nextIsClose = false;
      if (nc === '"' || nc === "\u201C" || nc === "\u201D" || nc === "\u201E") {
        nextIsClose = dblQ % 2 !== 0;
      } else {
        nextIsClose = sglQ % 2 !== 0;
      }
      if (nextIsClose) {
        cellToChar.push(i + 2);
        charToCell[i + 1] = cellToChar.length - 1;
        if (QUOTE_CHARS.has(chars[i + 1])) [dblQ, sglQ] = advanceQuoteCount(chars[i + 1], dblQ, sglQ);
        advCol();
        prevIsExcl = false;
        i += 1;
        continue;
      }
    }
    if (c === "\u2026" && chars[i + 1] === "\u2026") {
      cellToChar.push(i + 1);
      advCol();
      charToCell[i + 1] = cellToChar.length;
      cellToChar.push(i + 2);
      advCol();
      prevIsExcl = false;
      i += 1;
      continue;
    }
    if (c === "." && chars[i + 1] === "." && chars[i + 2] === "." && chars[i + 3] === "." && chars[i + 4] === "." && chars[i + 5] === ".") {
      cellToChar.push(i + 3);
      charToCell[i + 1] = charToCell[i + 2] = cellToChar.length - 1;
      advCol();
      cellToChar.push(i + 6);
      charToCell[i + 3] = charToCell[i + 4] = charToCell[i + 5] = cellToChar.length - 1;
      advCol();
      prevIsExcl = false;
      i += 5;
      continue;
    }
    if (c === "." && chars[i + 1] === "." && chars[i + 2] === ".") {
      cellToChar.push(i + 3);
      charToCell[i + 1] = charToCell[i + 2] = cellToChar.length - 1;
      advCol();
      prevIsExcl = false;
      i += 2;
      continue;
    }
    if (EXCL_PUNCT.has(c)) {
      charToCell[i] = cellToChar.length;
      const nextChar = chars[i + 1];
      if (nextChar && nextChar !== " " && nextChar !== "\n" && !CLOSE_BRACKETS.has(nextChar)) {
        cellToChar.push(i + 1);
        advCol();
        cellToChar.push(i + 1);
        advCol();
        isLineStart = false;
        prevIsExcl = true;
        continue;
      }
    }
    if (canGroupWithNext(c, chars[i + 1])) {
      cellToChar.push(i + 2);
      charToCell[i + 1] = cellToChar.length - 1;
      advCol();
      isLineStart = false;
      prevIsExcl = false;
      i += 1;
      continue;
    }
    cellToChar.push(i + 1);
    advCol();
    isLineStart = false;
    prevIsExcl = EXCL_PUNCT.has(c);
  }
  charToCell[chars.length] = cellToChar.length;
  while (cellToChar.length < blockSize) cellToChar.push(chars.length);
  return { charToCell, cellToChar, columns, rows };
}
export {
  BLOCK_SIZE,
  CLOSE_BRACKETS,
  CLOSE_QUOTE,
  EXCL_PUNCT,
  Manuscript,
  Manuscript_default as ManuscriptDefault,
  OPEN_BRACKETS,
  PUNCT,
  QUOTE_CHARS,
  SMALL_PUNCT,
  advanceQuoteCount,
  buildCursorMaps,
  buildFormattedCells,
  canGroupWithNext,
  isLineEndProhibited,
  isLineStartProhibited,
  isLowerAlpha,
  isNumber,
  isUpperAlpha
};
