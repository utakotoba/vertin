import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

export default defineConfig([
  {
    input: './src/index.ts',
    tsconfig: './tsconfig.json',
    plugins: [
      dts({
        sourcemap: true,
      }),
    ],
    output: {
      dir: 'dist',
      format: 'es',
      sourcemap: true,
    },
  },
  {
    input: './src/parser/index.ts',
    tsconfig: './tsconfig.json',
    plugins: [
      dts({
        sourcemap: true,
      }),
    ],
    output: {
      dir: 'dist/parser',
      format: 'es',
      sourcemap: true,
    },
  },
])
