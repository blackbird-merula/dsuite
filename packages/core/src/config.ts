import type { Config, Hex } from './types'

export const defaultConfig: Config = {
  rpc: 'https://eth-mainnet.g.alchemy.com/v2/vkFW38SQaTEIwtfsCk0l0JSTMYbZ20OG',
  ipfs: 'http://127.0.0.1:5001',
  dmap: '0x90949c9937A11BA943C7A72C3FA073a37E3FdD96', // todo
  getStorageAt() {
    throw new Error('Config missing required "getStorageAt"')
  },
}

export function getEthersConfig(
  provider: {
    getStorage: (address: string, position: bigint | string) => Promise<string>
  },
  config?: Partial<Omit<Config, 'getStorageAt'>>,
): Config {
  return {
    ...defaultConfig,
    ...config,
    async getStorageAt(address, slot) {
      return (await provider.getStorage(address, slot)) as Hex
    },
  }
}

export function getViemConfig(
  publicClient: {
    getStorageAt: (params: { address: Hex; slot: Hex }) => Promise<Hex>
  },
  config?: Partial<Omit<Config, 'getStorageAt'>>,
): Config {
  return {
    ...defaultConfig,
    ...config,
    getStorageAt(address, slot) {
      return publicClient.getStorageAt({ address, slot })
    },
  }
}
