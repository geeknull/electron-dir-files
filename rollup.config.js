import babel from 'rollup-plugin-babel';
import commonjs from "rollup-plugin-commonjs";

let babelConfig = {
  "presets": [
    [
      "env", {
        "modules": false,
        "targets": {
          "browsers": ["chrome > 40", "safari >= 7"]
        }
      }
    ]
  ],
  "plugins": ["external-helpers"]
}

export default {
  input : 'src/index.js',
  output : {
    file: 'dist/bundle.umd.js',
    name: 'electronDirFiles',
    format: 'umd',
    external: ['mimeTypes'],
    sourcemap: true
  },
  plugins : [
    commonjs(),
    babel({
      babelrc: false,
      presets: babelConfig.presets,
      plugins: babelConfig.plugins,
      exclude: 'node_modules/**' // only transpile our source code
    })
  ]
};
