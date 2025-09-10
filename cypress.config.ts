import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'https://dummyjson.com',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    defaultCommandTimeout: 8000,
    requestTimeout: 15000,
    retries: { runMode: 1, openMode: 0 },
    video: false
  }
})
