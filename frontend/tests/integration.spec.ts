import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('TC-025 / TC-020: register, play, retry lost finish response, ranking, profile and logout', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Cadastro', exact: true }).click()
  const username = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  await page.getByLabel('Nome de usuário', { exact: true }).fill(username)
  await page.getByLabel('E-mail (para cadastro)').fill(username + '@example.test')
  await page.getByLabel('Senha', { exact: true }).fill('E2e-safe-password-826!')
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click()
  await expect(page.locator('#username')).toHaveText(username)
  // Simulate the server committing a result but the response getting lost.
  await page.route('**/game-sessions/*/finish/', async route => {
    await route.fetch(); await route.abort()
    await page.unroute('**/game-sessions/*/finish/')
  })
  await page.getByRole('link', { name: 'Jogos', exact: true }).click()
  await page.getByRole('link', { name: 'Jogar Snake' }).click()
  await page.getByRole('button', { name: 'Iniciar', exact: true }).click()
  await expect(page.locator('#online-message')).toContainText('Sessão online ativa')
  await expect(page.locator('#status')).toHaveText('Partida encerrada', { timeout: 10000 })
  const retry = page.getByRole('button', { name: /Resultado não confirmado/ })
  await expect(retry).toBeEnabled(); await retry.click()
  await expect(page.locator('#results')).toContainText('resultado salvo')
  await expect(page.locator('#ranking-rows')).toContainText(username)
  await page.getByRole('link', { name: 'Cadastro', exact: true }).click()
  await expect(page.locator('#records')).toContainText('1 partidas')
  await expect(page.locator('#achievements')).toContainText('Obtida: Primeira partida')
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page.locator('#auth-form')).toBeVisible()
  await expect(page.locator('#profile')).toBeHidden()
})

for (const game of ['Tetris', 'Bomb Arena']) {
  test('TC-002 / TC-003: guest ' + game + ' starts and pauses without backend', async ({ page }) => {
    await page.route('**/api/**', route => route.abort()); await page.goto('/#jogos')
    await page.getByRole('link', { name: 'Jogar ' + game }).click()
    await page.getByRole('button', { name: 'Iniciar', exact: true }).click()
    await page.locator('canvas').press('ArrowRight')
    await page.locator('canvas').press('Space')
    await page.locator('canvas').press('p')
    await expect(page.locator('#status')).toHaveText('Partida pausada')
    await page.getByRole('button', { name: 'Reiniciar', exact: true }).click()
    await expect(page.locator('#score')).toHaveText('0')
  })
}
test('TC-004: preferences persist and unavailable storage does not prevent play', async ({ page }) => {
  await page.goto('/#jogos'); await page.getByLabel('Ativar sons').check(); await page.reload()
  await expect(page.getByLabel('Ativar sons')).toBeChecked()
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('Unavailable') }; Storage.prototype.setItem = () => { throw new Error('Unavailable') } })
  await page.reload(); await page.getByRole('button', { name: 'Iniciar', exact: true }).click()
  await expect(page.locator('#status')).toHaveText('Em jogo')
})
test('TC-105: automated WCAG AA interface audit', async ({ page }) => {
  await page.goto('/#cadastro'); await expect(page.locator('#account-message')).not.toBeEmpty()
  await page.goto('/')
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations).toEqual([])
  await page.screenshot({ path: 'reports/portfolio.png', fullPage: true })
})
