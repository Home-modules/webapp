// preload.ts
import { plugin, type BunPlugin,type PluginBuilder } from 'bun';

const style: BunPlugin = {
    name: 'Sass Loader',
    async setup(build: PluginBuilder) {
        // implementation
        console.log('Running SASS Plugin...');

        const sass = await import('sass');

        // when a .scss file is imported...
        build.onLoad({ filter: /\.scss$/ }, ({ path, loader }) => {
            // read and compile it with the sass compiler
            const contents = sass.compile(path, {style: process.env.NODE_ENV == "production" ? "compressed" : "expanded"});
            const css = contents.css;
            console.log(path, loader)

            return {
                loader: "css",
                contents: css,
            };
        });
    },
};
export default style;
// await plugin(styleLoader(/* options here */));
