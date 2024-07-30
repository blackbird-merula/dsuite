export type Hex = `0x${string}`

/**
 * Parsed dpath, without any data/meta or other content
 */
export type DPath = { locked: boolean; name: string }[]

/**
 * Parsed dmap entry
 */
export type Entry = {
  meta: Hex
  data: Hex
  name: string
  zone: Hex
  locked: boolean
}

/**
 * Global config for interacting with dmap/dpack
 */
export type Config = {
  /**
   * Selected RPC URL (e.g. http://localhost:8545)
   */
  rpc: string

  /**
   * Selected IPFS Node (e.g. http://localhost:5001)
   */
  ipfs: string

  /**
   * Dmap contract address
   */
  dmap: Hex

  /**
   * getStorageAt function from a web3 library, wrapped if necessary
   * @param address
   * @param slot
   */
  getStorageAt(address: Hex, slot: Hex): Promise<Hex>
}

export type WalkOptions = {
  trace?: boolean
}

export type IpfsLink = {
  '/': string
}

export type TypeInfo = {
  /**
   * The name of the type (ie, the Solidity class)
   */
  typename: string

  /**
   * A DAG-JSON link to this type's "artifacts" json file (output of solc/hardhat/foundry)
   */
  artifact: IpfsLink
}

export type ObjectInfo = {
  /**
   * The name of the object (a deployed 'contract' with a specific address)
   */
  objectname: string

  /**
   * The address of the object
   */
  address: string

  /**
   * The name of the type (ie, the Solidity class)
   */
  typename: string

  /**
   * A DAG-JSON link to this object's type's "artifacts" json file (output of solc/hardhat/foundry)
   */
  artifact: IpfsLink
}

export type DPack = {
  format: 'dpack-1'

  /**
   * The name of the network on which the objects in this dpack are deployed. Future formats will support multi-network packs.
   */
  network: string

  /**
   * A collection of named contract types ("classes").
   *
   * Note that 'typename' is redundant with key used to name this type in this pack.
   * Typenames are mixedcase alphanumeric and underscores, but must start with an uppercase alphabetic.
   */
  types: { [typename: string]: TypeInfo }

  /**
   * A collection of named EVM contract instances.
   * Each object descriptor stores both object information (object name and address)
   * as well as its type information (artifacts and typename).
   *
   * If an object's typename matches one of the types declared in this same scope (the same dpack),
   * or if multiple objects have the same typename, then the artifacts must also match. This means
   * some typenames and CID's will be recorded redundantly in the pack.
   */
  objects: { [objectname: string]: ObjectInfo }
}

export type Artifact = {
  abi: string
  bytecode?: string
}

export type Bundle = { [cid: string]: Artifact }

export type ResolvedPack = DPack & {
  _bundle: Bundle
  _resolved: boolean
}

export type PackBuilderObject = {
  objectname: string
  address: string
  typename: string
  artifact: Artifact
  alsoPackType?: boolean
}

export type PackBuilderType = { typename: string; artifact: Artifact }

export type PackBuilderManifest = {
  ipfs: string
  network: string
  types: PackBuilderType[]
  objects: PackBuilderObject[]
  pin?: boolean
  lock?: boolean
}
