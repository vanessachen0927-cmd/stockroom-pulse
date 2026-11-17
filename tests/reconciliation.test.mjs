import test from 'node:test'
import assert from 'node:assert/strict'
import { parseCsv, reconcileCsv, detectExceptions, demoCsv } from '../src/domain/reconciliation.ts'

test('parses quoted commas, escaped quotes and multiline cells', () => {
  assert.deepEqual(parseCsv('a,b\n"one,two","hello ""world"""\n"line\nbreak",x'), [['a','b'],['one,two','hello "world"'],['line\nbreak','x']])
})

test('rejects an unterminated quoted field', () => {
  assert.throws(() => parseCsv('a,b\n"hello,x'), /Unterminated/)
})

test('detects expected exceptions in demo data', () => {
  const result = reconcileCsv(demoCsv)
  assert.equal(result.rows.length, 10)
  assert.equal(result.errors.length, 0)
  assert.equal(result.exceptions.length, 8)
})

test('reports row-numbered validation errors and rejects duplicate SKUs', () => {
  const result = reconcileCsv('sku,product,expected,counted,warehouse\nA,One,1,2,West\nA,Two,1,2,West\nB,Three,1.2,2,East')
  assert.deepEqual(result.errors.map(({row}) => row), [3,4])
})

test('distinguishes missing SKU from negative inventory', () => {
  const issues = detectExceptions({ sku:'', product:'Demo', expected:1, counted:-1, warehouse:'West' })
  assert.deepEqual(issues.map(({type})=>type), ['MISSING_SKU','NEGATIVE_STOCK','QUANTITY_MISMATCH'])
})

test('uses stable fingerprints for the same warehouse, SKU and issue', () => {
  const first = reconcileCsv('sku,product,expected,counted,warehouse\nA,One,1,2,West').exceptions[0]
  const second = reconcileCsv('sku,product,expected,counted,warehouse\na,One,10,20,West').exceptions[0]
  assert.equal(first.fingerprint, second.fingerprint)
})

test('rejects missing headers and unsafe numbers', () => {
  assert.throws(() => reconcileCsv('sku,product\nA,One'), /Missing columns/)
  assert.equal(reconcileCsv('sku,product,expected,counted,warehouse\nA,One,9007199254740993,1,West').errors.length, 1)
})

test('keeps different unlabeled products separate', () => {
  const issues = reconcileCsv('sku,product,expected,counted,warehouse\n,Unlabeled Cable,1,1,West\n,Unlabeled Adapter,1,1,West').exceptions
  assert.equal(new Set(issues.map((issue) => issue.fingerprint)).size, 2)
})
