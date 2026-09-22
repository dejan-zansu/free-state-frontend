import { describe, expect, test } from 'vitest'
import { edgePath } from '../flow-layout'

describe('edgePath', () => {
  test('draws an elbow: horizontal first, then vertical', () => {
    expect(edgePath({ x: 10, y: 10 }, { x: 40, y: 30 })).toBe(
      'M 10 10 H 40 V 30'
    )
  })

  test('collapses to a straight line when aligned', () => {
    expect(edgePath({ x: 10, y: 10 }, { x: 40, y: 10 })).toBe('M 10 10 H 40')
    expect(edgePath({ x: 10, y: 10 }, { x: 10, y: 30 })).toBe('M 10 10 V 30')
  })
})
