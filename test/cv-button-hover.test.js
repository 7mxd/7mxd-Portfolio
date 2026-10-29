// test/cv-button-hover.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = (f) => readFileSync(new URL(`../css/${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

// base.css's a:hover outranks .cv-button, so without its own hover colour the
// label turned the fill's colour and the button went blank under the pointer.
// And because a phone keeps :hover after a tap, the hover fill has to sit
// behind (hover: hover) or the button stays blue once tapped.
test('the CV button keeps its label colour on hover and only fills on real hover', () => {
  const base = css('base.css');
  const sections = css('sections.css');
  assert.match(base, /a:hover\s*\{[^}]*color/, 'base.css no longer colours a:hover; this test can go');
  assert.match(sections, /\.cv-button:hover\s*\{\s*color:\s*var\(--ground\);\s*\}/, '.cv-button:hover must restate the label colour');
  const outsideHover = sections.replace(/@media \(hover: hover\)\s*\{[\s\S]*?\}\s*\}/g, '');
  assert.doesNotMatch(outsideHover, /\.cv-button:hover\s*\{[^}]*background/, 'hover fill outside (hover: hover) sticks after a tap');
  assert.match(sections, /@media \(hover: hover\)\s*\{\s*\.cv-button:hover\s*\{\s*background/, 'hover fill missing for pointer devices');
});
