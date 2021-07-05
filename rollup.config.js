// see https://github.com/rozek/build-configuration-study

import commonjs   from '@rollup/plugin-commonjs'
import resolve    from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

export default {
  input: './src/save-to-file.ts',
  output: [
    {
      file:     './dist/save-to-file.js',
      format:    'umd',
      name:      'saveToFile',
      noConflict:true,
      sourcemap: true,
      plugins: [terser({ format:{ comments:false, safari10:true } })],
    }
  ],
  plugins: [
    resolve(), commonjs(), typescript(),
  ],
};