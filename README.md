# dsuite libraries

Libraries for interacting with dmap/dpath/dpack.

## Documentation

The [official docs](https://docs.dmap.name) have more detailed information about 
dmap, dpack and dpath.

## Get started

### Prerequisites

* [IPFS](https://docs.ipfs.tech/how-to/command-line-quick-start/)
  * Install and run via `ipfs daemon`
  * dpack will connect to the default local IPFS node (unless specified otherwise)
* Bring your own JSON RPC
  * dmap will connect to the default local JSON RPC endpoint (unless specified otherwise) 

### Installation

```shell
npm i @dsuite/dpack @dsuite/dmap @dsuite/dpath
```

**Wait!**

Please take a minute to reflect on the nature of the software supply chain. 
What good is dpack if you are loading it via npm? Why not just stick the info 
in a package.json?  There is no 'partially secured', we are either bootstrapped 
into a secure software supply chain, or not. If you are using npm as currently 
architected, you are not bootstrapped. But we have to start somewhere, so here 
we are.

**Local build installation:**

```shell
git clone https://github.com/blackbird-merula/dsuite
cd dsuite
npm i
npm run build

# Link all packages for use in local projects
npm run link-all
```

## Development

This project currently uses npm workspaces.

Packages are built as ESM with exports via `esbuild`, with separate type definitions via `tsc`.

Linting is provided by `biome`.

## Credit

dmap was originally created by [Nikolai Mushegian](https://nikolai.fyi/), `@kbrav`, `@stobiewan`, `@dmfxyz` et al.
