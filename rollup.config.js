import dts from 'rollup-plugin-dts';
import esbuild, { minify } from 'rollup-plugin-esbuild';
import alias from '@rollup/plugin-alias';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dependencyNames = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const isExternal = (id) => {
  if (id.startsWith('\0')) {
    return false;
  }

  if (id === 'src' || id.startsWith('src/')) {
    return false;
  }

  if (id.startsWith('.') || path.isAbsolute(id)) {
    return false;
  }

  if (id.startsWith('node:')) {
    return true;
  }

  return dependencyNames.some((dependency) => id === dependency || id.startsWith(`${dependency}/`));
};

const bundle = (config) => ({
  ...config,
  input: 'src/index.ts',
  external: isExternal,
});

const esbuildPlugin = esbuild({ target: 'es2019' });

export default [
  bundle({
    plugins: [
      esbuildPlugin,
      alias({
        entries: [
          { find: 'src', replacement: path.resolve(__dirname, 'src') },
        ],
      }),
      nodeResolve({ extensions: ['.ts', '.js'] }),
      commonjs(),
      minify(),
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
      esbuild({ target: 'es2019', minify: true }),
      alias({
        entries: [
          { find: 'src', replacement: path.resolve(__dirname, 'src') },
        ],
      }),
      nodeResolve({ extensions: ['.ts', '.js'] }),
      commonjs(),
    ],
    output: [
      {
        dir: 'dist',
        format: 'es',
        exports: 'named',
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: 'src',
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
      preserveModulesRoot: 'src',
    },
  }),
];
