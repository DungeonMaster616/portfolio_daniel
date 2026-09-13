import { api, APIError, errorMessage } from './api'
type Profile = { username: string; email: string; records: { game__slug: string; best: number; matches: number }[]; matches: { game__slug: string; score: number }[] }
type Achievement = { name: string; description: string; unlocked_at: string | null }
export let signedIn = false
export let accountRevision = 0
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
export async function refreshProfile() {
  const revision = accountRevision
  const message = element('account-message')
  try {
    const profile = await api<Profile>('/users/me/')
    if (revision !== accountRevision) return
    signedIn = true
    element('auth-form').hidden = true; element('logout').hidden = false
    element('profile').hidden = false
    element('username').textContent = profile.username
    element('records').replaceChildren(...profile.records.map(record => {
      const li = document.createElement('li'); li.textContent = record.game__slug + ': ' + record.best + ' pontos · ' + record.matches + ' partidas'; return li
    }))
    element('history').replaceChildren(...profile.matches.map(match => {
      const li = document.createElement('li'); li.textContent = match.game__slug + ': ' + match.score + ' pontos'; return li
    }))
    const achievements = await api<Achievement[]>('/users/me/achievements/')
    if (revision !== accountRevision) return
    element('achievements').replaceChildren(...achievements.map(a => {
      const li = document.createElement('li'); li.textContent = (a.unlocked_at ? 'Obtida: ' : 'Bloqueada: ') + a.name + ' — ' + a.description; return li
    }))
    message.textContent = 'Conta conectada. Novas partidas podem registrar resultados.'
  } catch (error) {
    if (revision !== accountRevision) return
    if (error instanceof APIError && error.status === 403) {
      if (signedIn) accountRevision++
      signedIn = false; element('auth-form').hidden = false; element('logout').hidden = true; element('profile').hidden = true
      message.textContent = 'Entre para salvar resultados. Você pode jogar sem conta.'
    } else message.textContent = errorMessage(error) + ' Os jogos continuam disponíveis.'
  }
}
export function setupAccount() {
  element<HTMLFormElement>('auth-form').onsubmit = async event => {
    event.preventDefault()
    const form = event.currentTarget as HTMLFormElement
    const data = new FormData(form)
    const register = (event as SubmitEvent).submitter?.id === 'register'
    const body: Record<string, string> = { username: String(data.get('username')), password: String(data.get('password')) }
    if (register) {
      body.email = String(data.get('email'))
      if (!body.email) { element('account-message').textContent = 'Informe o e-mail para criar sua conta.'; return }
    }
    const buttons = form.querySelectorAll('button'); buttons.forEach(b => { b.disabled = true })
    try {
      await api('/auth/' + (register ? 'register/' : 'login/'), body)
      accountRevision++; form.reset(); await refreshProfile()
    } catch (error) { element('account-message').textContent = errorMessage(error) }
    finally { buttons.forEach(b => { b.disabled = false }) }
  }
  element('logout').onclick = async () => {
    try { await api('/auth/logout/', {}); accountRevision++; signedIn = false; await refreshProfile() }
    catch (error) { element('account-message').textContent = errorMessage(error) }
  }
  void refreshProfile()
}
let rankingRequest = 0
let rankingPage = 1
export async function loadRanking(page = 1) {
  const request = ++rankingRequest
  const slug = element<HTMLSelectElement>('ranking-game').value
  const period = element<HTMLSelectElement>('ranking-period').value
  element('ranking-message').textContent = 'Carregando ranking…'
  try {
    const ranking = await api<{ count: number; next: string | null; previous: string | null; results: { username: string; score: number }[] }>(`/games/${slug}/ranking/?page=${page}&period=${period}`)
    if (request !== rankingRequest) return
    rankingPage = page
    element('ranking-rows').replaceChildren(...ranking.results.map((r, i) => {
      const tr = document.createElement('tr')
      for (const value of [(page - 1) * 10 + i + 1, r.username, r.score]) { const td = document.createElement('td'); td.textContent = String(value); tr.append(td) }
      return tr
    }))
    element<HTMLButtonElement>('previous').disabled = !ranking.previous
    element<HTMLButtonElement>('next').disabled = !ranking.next
    element('ranking-message').textContent = ranking.count ? `Página ${page} · ${ranking.count} resultados` : 'Ainda não há resultados. Seja o primeiro!'
  } catch (error) { if (request === rankingRequest) { element('ranking-rows').replaceChildren(); element('ranking-message').textContent = errorMessage(error) } }
}
export function setupRanking() {
  element('ranking-game').onchange = () => { void loadRanking() }
  element('ranking-period').onchange = () => { void loadRanking() }
  element('ranking-refresh').onclick = () => { void loadRanking() }
  element('previous').onclick = () => { void loadRanking(rankingPage - 1) }
  element('next').onclick = () => { void loadRanking(rankingPage + 1) }
  void loadRanking()
}
