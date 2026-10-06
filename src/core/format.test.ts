import { describe, expect, it } from 'vitest'
import { formatCost, formatDuration, formatNumber, formatRate } from './format'

describe('formatNumber', () => {
  it('shows plain integers below 1,000', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(7.9)).toBe('7')
    expect(formatNumber(999.99)).toBe('999')
  })

  it('uses scientific notation from 1,000', () => {
    expect(formatNumber(1000)).toBe('1.00e3')
    expect(formatNumber(1234567)).toBe('1.23e6')
    expect(formatNumber(1e100)).toBe('1.00e100')
  })

  it('handles negative and non-finite values', () => {
    expect(formatNumber(-5)).toBe('-5')
    expect(formatNumber(-25000)).toBe('-2.50e4')
    expect(formatNumber(Infinity)).toBe('Infinity')
    expect(formatNumber(NaN)).toBe('NaN')
  })
})

describe('formatDuration', () => {
  it('picks the two largest units', () => {
    expect(formatDuration(42)).toBe('42s')
    expect(formatDuration(303)).toBe('5m 3s')
    expect(formatDuration(4 * 3600 + 12 * 60)).toBe('4h 12m')
    expect(formatDuration(2 * 86400 + 3 * 3600 + 59)).toBe('2d 3h')
  })
})

describe('formatCost', () => {
  it('rounds small costs up', () => {
    expect(formatCost(11.2)).toBe('12')
    expect(formatCost(12)).toBe('12')
    expect(formatCost(2500)).toBe('2.50e3')
  })
})

describe('formatRate', () => {
  it('keeps decimals for small values', () => {
    expect(formatRate(0.4)).toBe('0.4')
    expect(formatRate(1.234)).toBe('1.23')
    expect(formatRate(12.34)).toBe('12.3')
    expect(formatRate(-0.5)).toBe('-0.5')
    expect(formatRate(456.7)).toBe('457')
    expect(formatRate(12345)).toBe('1.23e4')
  })
})
