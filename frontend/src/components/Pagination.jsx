/**
 * Pagination component.
 * Props:
 *   page          — current 0-based page index
 *   totalPages    — total number of pages
 *   totalElements — total record count
 *   size          — current page size
 *   onPageChange  — (newPage: number) => void
 *   onSizeChange  — (newSize: number) => void
 */
export default function Pagination({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
  onSizeChange,
}) {
  if (totalPages <= 0) return null

  const from = page * size + 1
  const to   = Math.min((page + 1) * size, totalElements)

  return (
    <div className="pagination">
      <p className="pagination__info">
        Showing <span>{from}–{to}</span> of <span>{totalElements}</span> pets
      </p>

      {/* Prev */}
      <button
        className="pagination__btn pagination__btn--nav"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
      >
        ← Prev
      </button>

      {/* Page buttons */}
      {buildRange(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="pagination__ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`pagination__btn${p === page ? ' pagination__btn--active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p + 1}
          </button>
        )
      )}

      {/* Next */}
      <button
        className="pagination__btn pagination__btn--nav"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
      >
        Next →
      </button>

      {/* Page size picker */}
      {onSizeChange && (
        <div className="pagination__size">
          <span>Per page:</span>
          <select value={size} onChange={e => { onSizeChange(Number(e.target.value)); onPageChange(0) }}>
            {[4, 8, 12, 24].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}

/**
 * Build a page-number array with ellipses, e.g.:
 *   [0, 1, 2, '…', 9]  or  [0, '…', 4, 5, 6, '…', 9]
 */
function buildRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)

  const delta = 2
  const left  = current - delta
  const right = current + delta

  const pages = new Set([0, total - 1])
  for (let i = Math.max(1, left); i <= Math.min(total - 2, right); i++) pages.add(i)

  const sorted = [...pages].sort((a, b) => a - b)
  const range  = []

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) range.push('…')
    range.push(sorted[i])
  }

  return range
}
