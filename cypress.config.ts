import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    //run dev
    baseUrl: 'http://localhost:5173',
    // // Docker
    // baseUrl: 'http://localhost:8080',
    setupNodeEvents() {},
  },
})