import * as assert from 'node:assert'
import { describe, it } from 'node:test'
import type { PackBuilderObject, PackBuilderType } from '@dsuite/core/types'
import { CID } from 'kubo-rpc-client'
import { toHex } from 'multiformats/bytes'
import { PackBuilder } from '../src/packBuilder'
import artifact from './data/weth-ropsten-artifact.json'
import wethRopstenDpack from './data/weth_ropsten.dpack.json'

describe('PackBuilder', () => {
  const network = 'ropsten'
  const ipfs = 'http://127.0.0.1:5001'

  it('prepare', async () => {
    const objects: PackBuilderObject[] = [
      {
        objectname: 'weth',
        address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        typename: 'WETH9',
        artifact,
      },
      {
        objectname: 'weth9',
        address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        typename: 'WETH9',
        artifact,
      },
    ]
    const types: PackBuilderType[] = [
      {
        typename: 'WETH9',
        artifact,
      },
    ]
    const prepared = await PackBuilder.prepare({
      network,
      ipfs,
      objects,
      types,
      lock: false,
      pin: false,
    })

    assert.deepEqual(prepared.pack, wethRopstenDpack)

    assert.ok(prepared.cid instanceof CID)

    assert.equal(prepared.dmap.lock, false)
    assert.equal(
      toHex(prepared.dmap.meta),
      '0155122000000000000000000000000000000000000000000000000000000400', // not locked
    )
    assert.equal(
      toHex(prepared.dmap.data),
      '2501d8cdad5a89f5f568d67687313a0b9e1063d51d279c93d22f14df549c9122',
    )
  })
})
