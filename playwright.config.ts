import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4321',
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run dev -- --port 4321',
      port: 4321,
      timeout: 30000,
      reuseExistingServer: true,
    },
  ],
});
