import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/big-orcamento/', // <<< ESSA LINHA É ESSENCIAL
  plugins: [react()]
})