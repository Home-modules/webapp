import style from './preload';
import  "../hub/node_modules/@types/bun/index.d.ts"

console.log(await Bun.build({
    entrypoints: ['./src/index.html'],
    outdir: './build',
    plugins: [style],
    minify: true,
    splitting: true,
    metafile: {
      json: "./build/meta.json",
      markdown: "./build/meta.md",
    },
}));