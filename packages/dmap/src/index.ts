import {
  hexToArrayBuffer,
  hexZeroPad,
  hexlify,
  keccak256,
  need,
  strToHex,
} from '@dsuite/core'
import { FLAG_LOCK, zeroAddress, zeroHash } from '@dsuite/core/constants'
import type { Config, Entry, Hex, WalkOptions } from '@dsuite/core/types'
import { parseDpath } from '@dsuite/dpath'

export async function walk(
  config: Config,
  path: string,
  opts: WalkOptions = {},
): Promise<Entry[]> {
  const dpath = parseDpath(path)

  if (dpath.length === 0) return []

  let locked = dpath[0].locked
  let zone: Hex
  let [meta, data]: [Hex, Hex] = await get(config, zeroHash)

  const trace: Entry[] = []

  for (const step of dpath) {
    zone = data.slice(0, 42) as Hex
    need(zone !== zeroAddress, 'zero register')

    const fullName: Hex = `${strToHex(step.name)}${'00'.repeat(32 - step.name.length)}`
    ;[meta, data] = await getByZoneAndName(config, zone, fullName)

    trace.push({ ...step, meta, data, zone })

    if (step.locked) {
      need(locked, `Encountered ':' in unlocked subpath`)
      need(
        (hexToArrayBuffer(meta)[31] & FLAG_LOCK) !== 0,
        'Entry is not locked',
      )
      locked = true
    }

    locked = step.locked
  }

  const last = trace.at(-1)
  if (!last) return []

  return opts.trace ? trace : [last]
}

export async function get(config: Config, slot: string): Promise<[Hex, Hex]> {
  const nextSlot = hexZeroPad(hexlify(BigInt(slot) + BigInt(1)), 32)
  return (await Promise.all(
    [slot, nextSlot].map((s) => getSlot(config, s as Hex)),
  )) as [Hex, Hex]
}

export async function getSlot(config: Config, slot: Hex) {
  return config.getStorageAt(config.dmap, slot)
}

export async function getByZoneAndName(
  config: Config,
  zone: Hex,
  name: Hex,
): Promise<[Hex, Hex]> {
  const slot = keccak256(encodeZoneAndName(zone, name))
  return get(config, slot)
}

function encodeZoneAndName(
  zone: Hex,
  name?: string | { toString(type: string): string },
) {
  // zone should be an address, start by zero-padding 12 bytes
  let params = `0x${'00'.repeat(12)}`
  if (zone.length === 0) {
    params = params + '00'.repeat(20)
  } else {
    params = params + zone.slice(2) // assume has leading 0x, prob shouldn't do this
  }
  if (name == null || (typeof name === 'string' && name.length === 0)) {
    params = params + '00'.repeat(32)
  } else if (typeof name === 'object') {
    params = params + name.toString('hex')
  } else {
    // if already a hex string, just drop the 0x
    params = params + name.slice(2)
  }
  return params
}
