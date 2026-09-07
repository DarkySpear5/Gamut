import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PlayHistoryChart } from './PlayHistoryChart'

const twoDays = [
  { key: '2026-09-04', label: '09/04', start: new Date(2026, 8, 4), end: new Date(2026, 8, 4), seconds: 1_800 },
  { key: '2026-09-05', label: '09/05', start: new Date(2026, 8, 5), end: new Date(2026, 8, 5), seconds: 0 }
]

describe('PlayHistoryChart', () => {
  it('renders a zero-based overview with square fixed-width non-interactive bars', () => {
    const markup = renderToStaticMarkup(createElement(PlayHistoryChart, {
      title: 'Play history',
      timeFormat: 'units',
      selection: { baseline: null, buckets: twoDays }
    }))

    expect(markup).toContain('role="img"')
    expect(markup).toContain('play-history-chart__zero-line')
    expect(markup).toContain('width="24"')
    expect(markup).toContain('rx="0"')
    expect(markup).toContain('pointer-events="none"')
    expect(markup).not.toContain('tabindex="0"')
  })

  it('renders selectable dots but no bar rectangles in the zoomable detail chart', () => {
    const markup = renderToStaticMarkup(createElement(PlayHistoryChart, {
      title: 'Play history',
      timeFormat: 'clock',
      variant: 'line',
      zoomable: true,
      selection: { baseline: { date: '2020-01-01', seconds: 5_400, tooltip: 'Earlier playtime' }, buckets: twoDays }
    }))

    expect(markup).not.toContain('>Today</text>')
    expect(markup).not.toContain('<rect')
    expect(markup).toContain('play-history-chart__point')
    expect(markup).toContain('tabindex="0"')
    expect(markup).toContain('Showing 2 of 2 periods. Scroll up for fewer; down for more.')
  })
})
  it('keeps carry-over playtime out of the compact daily overview', () => {
    const markup = renderToStaticMarkup(createElement(PlayHistoryChart, {
      title: 'Play history',
      timeFormat: 'units',
      compact: true,
      selection: { baseline: { date: '2024-01-15', seconds: 5_400, tooltip: 'Earlier playtime' }, buckets: twoDays }
    }))

    expect(markup.match(/<rect/g)).toHaveLength(2)
  })

it('keeps the final Today label clear of the preceding date label', () => {
  const buckets = Array.from({ length: 30 }, (_, index) => ({
    key: `2026-08-${String(index + 1).padStart(2, '0')}`,
    label: index === 29 ? 'Today' : `D${index}`,
    start: new Date(2026, 7, index + 1),
    end: new Date(2026, 7, index + 1),
    seconds: 0
  }))
  const markup = renderToStaticMarkup(createElement(PlayHistoryChart, {
    title: 'Play history',
    timeFormat: 'units',
    compact: true,
    selection: { baseline: null, buckets }
  }))

  expect(markup).toContain('>Today</text>')
  expect(markup).not.toContain('>D28</text>')
})
