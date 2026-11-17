export type InventoryRow = {
  sku: string
  product: string
  expected: number
  counted: number
  warehouse: string
}

export type ExceptionType = 'MISSING_SKU' | 'NEGATIVE_STOCK' | 'QUANTITY_MISMATCH'
export type Severity = 'critical' | 'high' | 'medium'

export type InventoryException = {
  fingerprint: string
  sku: string
  product: string
  warehouse: string
  expected: number
  counted: number
  variance: number
  type: ExceptionType
  severity: Severity
}

export type ParseFailure = { row: number; reason: string }
export type ImportResult = {
  rows: InventoryRow[]
  errors: ParseFailure[]
  exceptions: InventoryException[]
}

const allowedColumns = ['sku', 'product', 'expected', 'counted', 'warehouse'] as const

export function parseCsv(source: string): string[][] {
  const result: string[][] = []
  let fields: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i]
    if (char === '"') {
      if (quoted && source[i + 1] === '"') {
        field += '"'
        i += 1
      } else if (quoted || field.length === 0) {
        quoted = !quoted
      } else {
        throw new Error('Unexpected quote in CSV')
      }
    } else if (char === ',' && !quoted) {
      fields.push(field)
      field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && source[i + 1] === '\n') i += 1
      fields.push(field)
      if (fields.some((value) => value.trim() !== '')) result.push(fields)
      fields = []
      field = ''
    } else {
      field += char
    }
  }
  if (quoted) throw new Error('Unterminated quoted CSV field')
  fields.push(field)
  if (fields.some((value) => value.trim() !== '')) result.push(fields)
  return result
}

export function fingerprintOf(row: InventoryRow, type: ExceptionType): string {
  return `${encodeURIComponent(row.warehouse.toUpperCase())}:${encodeURIComponent(row.sku.toUpperCase() || `MISSING-${row.product.trim().toUpperCase()}`)}:${type}`
}

export function detectExceptions(row: InventoryRow): InventoryException[] {
  const variance = row.counted - row.expected
  const base = { sku: row.sku, product: row.product, warehouse: row.warehouse, expected: row.expected, counted: row.counted, variance }
  const issues: InventoryException[] = []
  const add = (type: ExceptionType, severity: Severity) => {
    issues.push({ ...base, type, severity, fingerprint: fingerprintOf(row, type) })
  }
  if (!row.sku) add('MISSING_SKU', 'critical')
  if (row.counted < 0 || row.expected < 0) add('NEGATIVE_STOCK', 'critical')
  if (variance !== 0) add('QUANTITY_MISMATCH', Math.abs(variance) >= 10 ? 'high' : 'medium')
  return issues
}

export function reconcileCsv(source: string): ImportResult {
  const matrix = parseCsv(source.replace(/^\uFEFF/, ''))
  if (matrix.length === 0) throw new Error('The file is empty')
  const headers = matrix[0].map((header) => header.trim().toLowerCase())
  const missing = allowedColumns.filter((column) => !headers.includes(column))
  if (missing.length) throw new Error(`Missing columns: ${missing.join(', ')}`)
  if (new Set(headers).size !== headers.length) throw new Error('Duplicate column headers')
  if (matrix.length > 1001) throw new Error('Import limit: 1,000 inventory rows')
  const rows: InventoryRow[] = []
  const errors: ParseFailure[] = []
  const seen = new Set<string>()
  for (let i = 1; i < matrix.length; i += 1) {
    const cells = matrix[i]
    if (cells.length !== headers.length) {
      errors.push({ row: i + 1, reason: 'Incorrect column count' })
      continue
    }
    const value = (key: typeof allowedColumns[number]) => cells[headers.indexOf(key)].trim()
    const expectedText = value('expected')
    const countedText = value('counted')
    const expected = Number(expectedText)
    const counted = Number(countedText)
    if (!expectedText || !countedText || !Number.isSafeInteger(expected) || !Number.isSafeInteger(counted)) {
      errors.push({ row: i + 1, reason: 'Quantities must be safe whole numbers' })
      continue
    }
    const product = value('product')
    const warehouse = value('warehouse')
    const sku = value('sku').toUpperCase()
    if (!product || !warehouse || [product, warehouse, sku].some((v) => v.length > 160)) {
      errors.push({ row: i + 1, reason: 'Invalid product, SKU, or warehouse' })
      continue
    }
    const key = `${warehouse.toUpperCase()}|${sku}`
    if (sku && seen.has(key)) {
      errors.push({ row: i + 1, reason: 'Duplicate SKU in warehouse' })
      continue
    }
    if (sku) seen.add(key)
    rows.push({ sku, product, expected, counted, warehouse })
  }
  return { rows, errors, exceptions: rows.flatMap(detectExceptions) }
}

export const demoCsv = `sku,product,expected,counted,warehouse
A1042,Wireless Adapter,48,31,West
B2087,USB-C Hub,32,0,West
C3051,Desk Organizer,21,21,East
D9001,Standing Desk Mat,14,13,East
,Unlabeled Cable,9,9,West
E5020,Portable Charger,10,-2,East
F3030,Notebook Stand,28,28,West
G4010,Bluetooth Receiver,20,37,West
H7200,USB Keyboard,7,7,East
I8110,Travel Mouse,19,16,East`
