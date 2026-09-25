import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../data/projects.json', import.meta.url)));
const ids = data.items.map((p) => p.id);

test('selected work is the audit platform, HiSalon, Stmnt, and the kernel RLS research', () => {
  assert.deepEqual(ids, ['saal-audit-platform', 'hisalon', 'stmnt', 'kernel-rls']);
});

// HiSalon came back once the April 2026 CV named it; Wafa did not.
test('Wafa stays removed', () => {
  assert.equal(/Wafa/i.test(JSON.stringify(data)), false);
});

test('HiSalon is excluded from the timeline, since the Join Future role represents it', () => {
  assert.equal(data.items.find((p) => p.id === 'hisalon').timeline, false);
});

// A storefront in the path sends every reader to one country's store, which
// then shows prices and availability for the wrong region.
test('App Store links name no storefront', () => {
  const urls = JSON.stringify(data).match(/https:\/\/apps\.apple\.com\/[^"]*/g) ?? [];
  assert.ok(urls.length >= 3, `expected the App Store links, found ${urls.length}`);
  for (const url of urls) assert.match(url, /^https:\/\/apps\.apple\.com\/app\//, url);
});

test('no forbidden Join-Future product names anywhere', () => {
  const raw = JSON.stringify(data);
  assert.equal(/HiPay|joinfuture\.ai|joinCX/i.test(raw), false);
});

test('the audit platform is excluded from the timeline, since the role represents it', () => {
  const audit = data.items.find((p) => p.id === 'saal-audit-platform');
  assert.equal(audit.timeline, false);
});

test('Stmnt describes the real model chain: OpenRouter, Gemini primary, GPT fallback', () => {
  const stmnt = data.items.find((p) => p.id === 'stmnt');
  const text = stmnt.blocks.map((b) => b.content ?? '').join(' ');
  assert.match(text, /OpenRouter/);
  assert.match(text, /Gemini/);
  assert.match(text, /fallback/i);
  assert.equal(stmnt.links.ios, 'https://apps.apple.com/app/stmnt/id6760298169');
});

test('the kernel RLS benchmark is a table, not an ASCII chart', () => {
  const krls = data.items.find((p) => p.id === 'kernel-rls');
  const bench = krls.blocks.find((b) => b.type === 'benchmark');
  assert.ok(bench, 'benchmark block missing');
  assert.equal(bench.rows.length, 3);
  assert.ok(bench.rows.some((r) => r.highlight === true), 'no row is highlighted');
});
