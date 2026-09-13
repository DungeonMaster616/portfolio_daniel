import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
const python = existsSync('../backend/venv/Scripts/python.exe') ? '"' + resolve('../backend/venv/Scripts/python.exe') + '"' : 'python'
export default defineConfig({
  testDir: './tests',
  workers: 1,
  retries: 0,
  reporter: [['list'], ['junit', { outputFile: 'reports/e2e.xml' }]],
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'off', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    { command: python + ' ../scripts/e2e_server.py', url: 'http://127.0.0.1:8000/api/v1/health/', reuseExistingServer: false, timeout: 60000 },
    { command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
  ],
})
