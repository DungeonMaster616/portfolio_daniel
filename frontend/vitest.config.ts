import { defineConfig } from 'vitest/config'
export default defineConfig({ test: {
  include: ['src/**/*.test.ts'],
  reporters: ['default', 'junit'], outputFile: { junit: 'reports/unit.xml' },
  coverage: { provider: 'v8', include: ['src/snake.ts', 'src/tetris.ts', 'src/bomb-arena.ts'], reporter: ['text', 'lcov'], reportsDirectory: 'reports/coverage' },
} })
