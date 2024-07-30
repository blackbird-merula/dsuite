import { keccak_256 } from '@noble/hashes/sha3'
import { toHex } from 'multiformats/bytes'
import type { Hex } from './types'

export function fail(s: string) {
  throw new Error(s)
}

export function need<B>(b: B, s: string) {
  return b || fail(s)
}

export function strToHex(str: string): Hex {
  return `${str.startsWith('0x') ? '' : '0x'}${str
    .split('')
    .map((c) => c.charCodeAt(0))
    .map((c) => c.toString(16))
    .join('')}` as Hex
}

export function hexToArrayBuffer(hex: string) {
  const bytes = []
  for (let c = 2; c < hex.length; c += 2)
    bytes.push(Number.parseInt(hex.slice(c, c + 2), 16))
  return new Uint8Array(bytes)
}

export function hexZeroPad(value: string, length: number) {
  let hex = value

  if (hex.length > 2 * length + 2) {
    throw new Error('Value too big')
  }

  while (hex.length < 2 * length + 2) {
    hex = `0x0${hex.substring(2)}`
  }

  return hex
}

const hexCharacters = '0123456789abcdef'

export function hexlify(value: number | string | bigint) {
  if (typeof value === 'bigint') {
    const hex = value.toString(16)
    if (hex.length % 2) {
      return `0x0${hex}`
    }
    return `0x${hex}`
  }

  if (typeof value === 'number') {
    let hex = ''
    let valueN = value
    while (valueN) {
      hex = hexCharacters[valueN & 0xf] + hex
      valueN = Math.floor(valueN / 16) // can bitshift instead
    }

    if (hex.length) {
      if (hex.length % 2) {
        hex = `0${hex}`
      }
      return `0x${hex}`
    }
    return '0x00'
  }

  return strToHex(value)
}

// Assumes value is a hex encoded string for now, or already a byte array
export function keccak256(value: string | Uint8Array) {
  if (typeof value === 'string') {
    return `0x${toHex(keccak_256(new Uint8Array(toBytes(value))))}`
  }
  // add back in prefix and return as unsigned 1byte int array
  return `0x${toHex(keccak_256(value))}`
}

export function toBytes(value: string | Uint8Array) {
  return typeof value === 'string' ? hexToArrayBuffer(value) : value
}
