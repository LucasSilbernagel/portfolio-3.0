import { describe, expect, it } from 'vitest'
import { formatPeriod, parseLocalDate } from './experience'

const YEAR_2023 = 2023
const YEAR_2024 = 2024
const YEAR_2025 = 2025
const JANUARY_INDEX = 0
const MARCH_INDEX = 2
const DECEMBER_INDEX = 11
const DAY_15 = 15
const DAY_31 = 31

describe('parseLocalDate', () => {
  it('parses YYYY-MM-DD as a local date', () => {
    const date = parseLocalDate('2024-03-15')

    expect(date.getFullYear()).toBe(YEAR_2024)
    expect(date.getMonth()).toBe(MARCH_INDEX) // 0-indexed
    expect(date.getDate()).toBe(DAY_15)
  })

  it('does not shift the date across timezones (unlike UTC parsing)', () => {
    // new Date('2024-01-01') is UTC midnight, which is Dec 31 2023 in
    // negative-offset timezones; parseLocalDate must stay on Jan 1 2024
    const date = parseLocalDate('2024-01-01')

    expect(date.getFullYear()).toBe(YEAR_2024)
    expect(date.getMonth()).toBe(JANUARY_INDEX)
    expect(date.getDate()).toBe(1)
  })

  it('handles the last day of the year', () => {
    const date = parseLocalDate('2023-12-31')

    expect(date.getFullYear()).toBe(YEAR_2023)
    expect(date.getMonth()).toBe(DECEMBER_INDEX)
    expect(date.getDate()).toBe(DAY_31)
  })
})

describe('formatPeriod', () => {
  it('formats a completed period spanning months and years', () => {
    const result = formatPeriod('2023-01-01', '2024-03-01')

    expect(result).toEqual({
      startMonth: 'January',
      startYear: YEAR_2023,
      endMonth: 'March',
      endYear: YEAR_2024,
      isPresent: false,
      isSamePeriod: false,
    })
  })

  it('marks a role with no end date as present', () => {
    const result = formatPeriod('2025-03-01', null)

    expect(result).toEqual({
      startMonth: 'March',
      startYear: YEAR_2025,
      endMonth: null,
      endYear: null,
      isPresent: true,
      isSamePeriod: false,
    })
  })

  it('collapses a period starting and ending in the same month and year', () => {
    const result = formatPeriod('2024-06-01', '2024-06-30')

    expect(result).toEqual({
      startMonth: 'June',
      startYear: YEAR_2024,
      endMonth: null,
      endYear: null,
      isPresent: false,
      isSamePeriod: true,
    })
  })

  it('keeps both parts when the month matches but the year differs', () => {
    const result = formatPeriod('2023-06-01', '2024-06-01')

    expect(result).toEqual({
      startMonth: 'June',
      startYear: YEAR_2023,
      endMonth: 'June',
      endYear: YEAR_2024,
      isPresent: false,
      isSamePeriod: false,
    })
  })

  it('keeps both parts when the year matches but the month differs', () => {
    const result = formatPeriod('2024-01-01', '2024-02-01')

    expect(result).toEqual({
      startMonth: 'January',
      startYear: YEAR_2024,
      endMonth: 'February',
      endYear: YEAR_2024,
      isPresent: false,
      isSamePeriod: false,
    })
  })

  it('reports the correct month for first-of-month dates in any timezone', () => {
    // Regression guard for the classic UTC off-by-one-day bug, where
    // '2024-03-01' would render as February in negative-offset timezones
    const result = formatPeriod('2024-03-01', null)

    expect(result.startMonth).toBe('March')
  })
})
