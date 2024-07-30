import type { Config, DPack, ResolvedPack } from '@dsuite/core/types'
import { isValidDpath } from '@dsuite/dpath'
import { create } from 'kubo-rpc-client'
import { CID } from 'multiformats'
import { isCID, parseDpathCID } from './cid'
import { unpack } from './unpack'
import { assertValidPack } from './validate'

export async function load(
  config: Config,
  path: string,
): Promise<ResolvedPack> {
  let dpack: DPack

  const client = create({ url: config.ipfs })

  // todo: if jams, load jams module and unpack

  const cid = isCID(path)
    ? CID.parse(path)
    : isValidDpath(path)
      ? await parseDpathCID(config, path)
      : null

  if (cid) {
    dpack = await client.dag.get(cid).then((res) => res.value)
  } else {
    try {
      dpack = await import(path)
    } catch (error) {
      throw new Error('Unable to import CID', error as Error)
    }
  }

  assertValidPack(dpack)

  return unpack(client, dpack)
}
