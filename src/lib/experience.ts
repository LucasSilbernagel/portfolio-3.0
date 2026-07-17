// Date formatting for the professional experience timeline.

// Parse date string (YYYY-MM-DD) as local date to avoid timezone issues:
// new Date('YYYY-MM-DD') is parsed as UTC midnight, which renders as the
// previous day (and potentially the previous month/year) in negative-offset
// timezones.
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  // month is 0-indexed in Date constructor
  return new Date(year, month - 1, day)
}

export type PeriodParts = {
  startMonth: string
  startYear: number
  endMonth: string | null
  endYear: number | null
  isPresent: boolean
  isSamePeriod: boolean
}

export const formatPeriod = (
  startDate: string,
  endDate: string | null
): PeriodParts => {
  const start = parseLocalDate(startDate)
  const startMonth = start.toLocaleDateString('en-US', { month: 'long' })
  const startYear = start.getFullYear()

  if (!endDate) {
    return {
      startMonth,
      startYear,
      endMonth: null,
      endYear: null,
      isPresent: true,
      isSamePeriod: false,
    }
  }

  const end = parseLocalDate(endDate)
  const endMonth = end.toLocaleDateString('en-US', { month: 'long' })
  const endYear = end.getFullYear()

  // If same month and year, return just the month and year
  if (startMonth === endMonth && startYear === endYear) {
    return {
      startMonth,
      startYear,
      endMonth: null,
      endYear: null,
      isPresent: false,
      isSamePeriod: true,
    }
  }

  return {
    startMonth,
    startYear,
    endMonth,
    endYear,
    isPresent: false,
    isSamePeriod: false,
  }
}
