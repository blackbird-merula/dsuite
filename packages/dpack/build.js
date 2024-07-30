import esbuild from 'esbuild'

const entryPoints = [
  { in: 'src/load.ts', out: 'file1' },
  { in: 'src/file2.ts', out: 'file2' },
]

esbuild
  .build({
    entryPoints: entryPoints.map((entry) => entry.in),
    outdir: 'dist',
    platform: 'node',
    format: 'cjs', // or 'esm' if you're using ES modules
    bundle: true,
    outbase: 'src',
  })
  .catch(() => process.exit(1))
