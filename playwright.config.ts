import { defineConfig } from '@playwright/test';

const apiDir = process.env.API_DIR || '../housing-investment-api';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:4321',
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run db:push && npm start',
      port: 3001,
      cwd: apiDir,
      env: {
        PORT: '3001',
        TURSO_CONNECTION_URL: 'file:test.db',
        API_PASSWORD: 'admin',
        JWT_SECRET: 'test-secret',
      },
      timeout: 30000,
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev -- --port 4321',
      port: 4321,
      env: {
        PUBLIC_API_URL: 'http://localhost:3001',
      },
      timeout: 30000,
      reuseExistingServer: false,
    },
  ],
});
