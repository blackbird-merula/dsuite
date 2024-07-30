import { zeroHash } from '@dsuite/core/constants'
import type { Config, Hex } from '@dsuite/core/types'
import { walk } from '@dsuite/dmap'
import { toBytes } from '@noble/hashes/utils'
import { CID } from 'multiformats'

export function prepareCID(cid: CID, lock: boolean) {
  const prefixLen = cid.byteLength - cid.multihash.size
  const meta = new Uint8Array(32).fill(0)
  const data = new Uint8Array(32).fill(0)

  data.set(cid.bytes.slice(-cid.multihash.size), 32 - cid.multihash.size)
  meta.set(cid.bytes.slice(0, prefixLen))

  if (lock) meta[31] |= 1

  meta[30] = prefixLen

  return { meta, data }
}

export function unpackCID(meta: Hex, data: Hex): CID | undefined {
  if (meta === zeroHash || meta.length < 32 || data === zeroHash) {
    throw new Error('No CID defined')
  }

  const metaBytes = toBytes(meta)
  const dataBytes = toBytes(data)
  const prefixLen = metaBytes[30]
  const specs = CID.inspectBytes(metaBytes.slice(0, prefixLen))
  const hashLen = specs.digestSize
  const cidBytes = new Uint8Array(prefixLen + hashLen)

  cidBytes.set(metaBytes.slice(0, prefixLen), 0)
  cidBytes.set(dataBytes.slice(32 - hashLen), prefixLen)
  return CID.decode(cidBytes)
}

export function isCID(cidStr: string): boolean {
  try {
    CID.parse(cidStr)
    return true
  } catch {
    return false
  }
}

export async function parseDpathCID(config: Config, path: string) {
  const [entry] = await walk(config, path, { trace: false })
  if (!entry) throw new Error('No entry in path')

  try {
    return unpackCID(entry.meta, entry.data)
  } catch (error) {
    throw new Error('Unable to parse CID', error as Error)
  }
}
