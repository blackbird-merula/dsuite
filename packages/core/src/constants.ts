import type { Hex } from './types'

export const FLAG_LOCK = 1 as const

export const zeroHash: Hex = `0x${'00'.repeat(32)}`
export const zeroAddress: Hex = `0x${'00'.repeat(20)}`
