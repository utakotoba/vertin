import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

export default defineConfig({
  input: './src/index.ts',
  resolve: {
    tsconfigFilename: './tsconfig.json',
  },
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
})
