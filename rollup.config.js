import buble from 'rollup-plugin-buble';

export default {
    entry: 'src/index.js',
    plugins: [ buble() ],
    format: 'cjs',
    dest: 'dist/index.js'
};
