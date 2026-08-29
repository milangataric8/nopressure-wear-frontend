import test from "node:test";
import assert from "node:assert/strict";
import { normalizeWhitespace } from "./text.js";

// Run with:  npm test   (or: node --test src/utils/text.test.mjs)

const NBSP = String.fromCodePoint(0x00a0);
const ZWSP = String.fromCodePoint(0x200b);
const ZWNJ = String.fromCodePoint(0x200c);
const ZWJ = String.fromCodePoint(0x200d);
const BOM = String.fromCodePoint(0xfeff);
const SHY = String.fromCodePoint(0x00ad);

test("every space is &nbsp; -> all converted to ordinary spaces", () => {
  assert.equal(
    normalizeWhitespace("Be&nbsp;relaxed.&nbsp;Live&nbsp;Easy."),
    "Be relaxed. Live Easy.",
  );
});

test("&#160; and &#xA0; are handled the same as &nbsp;", () => {
  assert.equal(normalizeWhitespace("a&#160;b&#xA0;c"), "a b c");
});

test("literal non-breaking space (U+00A0) becomes an ordinary space", () => {
  assert.equal(normalizeWhitespace(`a${NBSP}b`), "a b");
});

test("zero-width characters and soft hyphens are removed", () => {
  assert.equal(
    normalizeWhitespace(`wo${ZWSP}rd${ZWNJ}${ZWJ}${BOM}${SHY}s`),
    "words",
  );
});

test("multiple consecutive spaces (and tabs) collapse to one", () => {
  assert.equal(normalizeWhitespace("a   b\t\tc"), "a b c");
});

test("leading and trailing whitespace is trimmed", () => {
  assert.equal(normalizeWhitespace("  hello  "), "hello");
});

test('null, undefined and "" are returned as-is without throwing', () => {
  assert.equal(normalizeWhitespace(null), null);
  assert.equal(normalizeWhitespace(undefined), undefined);
  assert.equal(normalizeWhitespace(""), "");
});
