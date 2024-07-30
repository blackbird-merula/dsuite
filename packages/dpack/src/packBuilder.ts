import { need } from '@dsuite/core'
import type {
  DPack,
  ObjectInfo,
  PackBuilderManifest,
  PackBuilderObject,
  PackBuilderType,
  TypeInfo,
} from '@dsuite/core/types'
import { type KuboRPCClient, create } from 'kubo-rpc-client'
import type { CID } from 'multiformats'
import { prepareCID } from './cid'
import { addObject, addType, blank, merge } from './pack'

export class PackBuilder {
  /**
   * Prepare a pack for use on dmap. Given a manifest:
   * - create a new pack
   * - validate and add all types and objects with IPFS
   * - validate and put the built pack on IPFS
   * - return the CID, the dmap-encoded meta/data, and the pack
   * @param manifest PackBuilder manifest
   */
  static async prepare({
    ipfs,
    network,
    types,
    objects,
    pin = true,
    lock = false,
  }: PackBuilderManifest) {
    const client = create({ url: ipfs })
    const builder = new PackBuilder(network, client)
    return builder
      .addTypes(types, pin)
      .then((b) => b.addObjects(objects, pin))
      .then((b) => b.put(pin))
      .then((b) => ({
        dmap: b.dmapEncode(lock),
        cid: b.cid,
        pack: b.build(),
      }))
  }

  pack: DPack
  cid: CID | null = null

  constructor(
    readonly network: string,
    readonly client: KuboRPCClient,
  ) {
    need(
      network !== 'mainnet',
      "You may not use 'mainnet' as a network name. You might mean 'ethereum'.",
    )
    need(network !== '', 'Network name cannot be empty.')
    this.pack = blank(network)
  }

  merge(...packs: DPack[]) {
    this.pack = merge(this.pack, ...packs)
    return this
  }

  async put(pin = true) {
    const pack = this.build()
    const cid = await this.addJSON(pack, pin)
    need(cid.multihash.size <= 32, 'Hash exceeds 256 bits')
    this.cid = cid as CID
    return this
  }

  async addObjects(objects: PackBuilderObject[], pin = true) {
    await Promise.all(objects.map((obj) => this.addObject(obj, pin)))
    return this
  }

  async addTypes(types: PackBuilderType[], pin = true) {
    await Promise.all(types.map((type) => this.addType(type, pin)))
    return this
  }

  async addObject({ alsoPackType, ...obj }: PackBuilderObject, pin = true) {
    const cid = await this.addJSON(obj.artifact)
    const objectInfo: ObjectInfo = {
      ...structuredClone(obj),
      artifact: { '/': cid.toString() },
    }

    this.pack = addObject(this.pack, objectInfo)

    if (alsoPackType) {
      this.pack = addType(this.pack, {
        typename: objectInfo.typename,
        artifact: objectInfo.artifact,
      })
    }

    return this
  }

  async addType({ artifact, typename }: PackBuilderType, pin = true) {
    const cid = await this.addJSON(artifact, pin)
    const typeInfo: TypeInfo = {
      typename,
      artifact: { '/': cid.toString() },
    }

    this.pack = addType(this.pack, typeInfo)

    return this
  }

  build() {
    return structuredClone(this.pack)
  }

  dmapEncode(lock: boolean) {
    if (!this.cid) throw new Error('CID not defined yet; must put() first')

    const { meta, data } = prepareCID(this.cid, lock)
    return { meta, data, lock }
  }

  private async addJSON(jsonObject: object, pin = false) {
    // It's not clear why Nikolai used add(json string) over dag.put(json object),
    // but for full compatibility with the original, we are adding json strings
    return this.client
      .add(JSON.stringify(jsonObject), { cidVersion: 1, pin })
      .then((res) => res.cid)
  }
}
