import { resolve } from 'node:path'
import { defineProject } from 'vitest/config'

export default defineProject({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@parser': resolve(__dirname, './src/parser'),
    },
  },
})
