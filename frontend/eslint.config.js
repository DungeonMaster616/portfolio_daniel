import tseslint from 'typescript-eslint'
export default tseslint.config({ ignores: ['dist', 'playwright-report', 'test-results', 'reports'] }, ...tseslint.configs.recommended)
