import { build } from 'esbuild'

await build({
  entryPoints: ['bin/tf2calc.js'],
  outfile: 'dist/tf2calc.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
})
