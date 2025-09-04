import dts from 'rollup-plugin-dts';
import esbuild, { minify } from 'rollup-plugin-esbuild';
import alias from '@rollup/plugin-alias';
import nodeResolve from '@rollup/plugin-node-resolve';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bundle = (config) => ({
  ...config,
  input: 'src/index.ts',
});

export default [
  bundle({
    plugins: [
      esbuild(),
      alias({
        entries: [
          { find: 'src', replacement: path.resolve(__dirname, 'src') },
        ],
      }),
      nodeResolve({ extensions: ['.ts', '.d.ts', '.js'] }),
      minify()
    ],
    output: [
      {
        entryFileNames: '[name].min.js',
        dir: 'dist',
        format: 'es',
        exports: 'named',
      },
    ],
  }),
  bundle({
    plugins: [
      esbuild(),
      alias({
        entries: [
          { find: 'src', replacement: path.resolve(__dirname, 'src') },
        ],
      }),
      nodeResolve({ extensions: ['.ts', '.d.ts', '.js'] })
    ],
    output: [
      {
        dir: 'dist',
        format: 'es',
        exports: 'named',
        sourcemap: true,
        preserveModules: true,
      },
    ],
  }),
  bundle({
    plugins: [
      dts({ tsconfig: './tsconfig.json' })
    ],
    output: {
      dir: 'dist',
      format: 'es',
      exports: 'named',
      preserveModules: true,
    },
  }),
];
