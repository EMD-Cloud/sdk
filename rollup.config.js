import dts from 'rollup-plugin-dts';
import esbuild, { minify } from 'rollup-plugin-esbuild';

const bundle = (config) => ({
  ...config,
  input: 'src/index.ts',
  external: (id) => !/^[./]/.test(id),
});

export default [
  bundle({
    plugins: [esbuild(), minify()],
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
    plugins: [esbuild()],
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
    plugins: [dts()],
    output: {
      dir: 'dist',
      format: 'es',
      exports: 'named',
      preserveModules: true,
    },
  }),
];
