import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      on('task', {
        authCreateCustomToken(data) {
          // Return or generate a custom token here
          return 'test-token';
        },
      });
      return config;
    },
  },
});