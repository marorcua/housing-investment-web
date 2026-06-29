import { defineConfig } from '@playwright/test';

const apiDir = process.env.API_DIR || '../housing-investment-api';

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
      command: 'npm run db:push && npm start',
      port: 3000,
      cwd: apiDir,
      env: {
        TURSO_CONNECTION_URL: 'file:test.db',
        API_PASSWORD: 'admin',
        JWT_SECRET: 'test-secret',
      },
      timeout: 30000,
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev -- --port 4321',
      port: 4321,
      timeout: 30000,
      reuseExistingServer: true,
    },
  ],
});
