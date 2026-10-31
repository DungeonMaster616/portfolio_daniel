import { Snake, type Direction, type Status } from './snake'
import { Tetris } from './tetris'
import { BombArena } from './bomb-arena'
import { api, errorMessage } from './api'
import { signedIn, accountRevision, refreshProfile, loadRanking } from './account'
import { setupAudio } from './audio'

export const catalog = [
  { slug: 'snake', name: 'Snake', description: 'Uma grade, uma direção e mais um alimento. Até onde você consegue chegar?', controls: 'Setas ou WASD para mover. Colete alimentos (+10), evite paredes e o próprio corpo. A velocidade aumenta a cada alimento.', technical: 'Colisões em grade, entrada limitada por tick e geração de alimento em células livres.', art: '▰▰▰<br>　　▰<br>　　▰　▪', style: 'snake-art' },
  { slug: 'tetris', name: 'Tetris', description: 'Encaixe peças, complete linhas e acompanhe o ritmo aumentar.', controls: '← → ou A/D movem; ↑ ou W gira; ↓ ou S acelera; Espaço faz queda instantânea. Complete linhas para pontuar.', technical: 'Sete peças em sacola embaralhada, rotação com ajuste horizontal, linhas e níveis progressivos.', art: '　▣<br>▣▣▣', style: 'tetris-art' },
  { slug: 'bomb-arena', name: 'Bomb Arena', description: 'Explore uma arena original com obstáculos, bombas e decisões no tempo certo.', controls: 'Setas ou WASD movem; Espaço planta uma bomba (2 segundos). Afaste-se da explosão! Derrote os 3 inimigos para vencer. Blocos +10, inimigos +100, vitória +500.', technical: 'Mapa e arte geométrica originais, explosões com obstáculos, patrulhas e itens de alcance.', art: '▧　▧<br>　✦<br>▧　▧', style: 'bomb-art' },
]
type Engine = Snake | Tetris | BombArena
type Result = { score: number; metadata: Record<string, string | number> }
type Run = { slug: string; session: Promise<string | null>; abandoned: boolean; finished: boolean; duration: number; revision: number }
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
export function setupPlayground() {
  let slug = 'snake', game: Engine = new Snake(), run: Run | null = null
  const canvas = $<HTMLCanvasElement>('board'), context = canvas.getContext('2d')!
  const audio = setupAudio()
  const pending: { run: Run; result: Result; button: HTMLButtonElement; busy: boolean }[] = []
  let last = performance.now(), lastScore = 0, lastStatus: Status = 'ready'
  const labels = { ready: 'Pronto para começar', running: 'Em jogo', paused: 'Partida pausada', over: 'Partida encerrada', won: 'Você venceu!' }
  async function abandon(previous: Run | null) {
    if (!previous || previous.finished || previous.abandoned) return
    previous.abandoned = true
    const id = await previous.session
    if (id && previous.revision === accountRevision) {
      try { await api(`/game-sessions/${id}/abandon/`, {}) } catch { /* Expired sessions cannot produce a local score. */ }
    }
  }
  async function send(item: typeof pending[number]) {
    if (item.busy) return
    item.busy = true; item.button.disabled = true
    try {
      const id = await item.run.session
      if (!id) { item.button.textContent = 'Partida local: resultado não enviado'; return }
      if (item.run.revision !== accountRevision) { item.button.textContent = 'Conta alterada: resultado não enviado'; return }
      await api(`/game-sessions/${id}/finish/`, item.result)
      item.button.textContent = catalog.find(g => g.slug === item.run.slug)!.name + ': resultado salvo (' + item.result.score + ')'
      await refreshProfile(); await loadRanking()
    } catch (error) {
      item.button.textContent = 'Resultado não confirmado. Tentar novamente: ' + errorMessage(error)
      item.button.disabled = false
    } finally { item.busy = false }
  }
  function result(): Result {
    const metadata: Result['metadata'] = { outcome: game.status, duration_ms: Math.floor(run?.duration ?? 0) }
    if (game instanceof Snake) metadata.foods = game.score / 10
    else if (game instanceof Tetris) metadata.lines = game.lines
    else { metadata.crates = game.crates; metadata.enemies = game.defeated }
    return { score: game.score, metadata }
  }
  function finish() {
    if (!run || run.finished || run.abandoned || !['over', 'won'].includes(game.status)) return
    run.finished = true
    const button = document.createElement('button')
    button.textContent = 'Verificando envio do resultado…'; button.disabled = true
    $('results').append(button)
    const item = { run, result: result(), button, busy: false }; pending.push(item)
    button.onclick = () => { void send(item) }; void send(item)
  }
  function drawCell(x: number, y: number, width: number, height: number, color: string) {
    context.fillStyle = color; context.fillRect(x * width + 2, y * height + 2, width - 4, height - 4)
  }
  function draw() {
    context.fillStyle = '#0b1419'; context.fillRect(0, 0, 500, 500)
    if (game instanceof Snake) {
      game.body.forEach((p, i) => drawCell(p.x, p.y, 25, 25, i ? '#79be55' : '#c5ff80'))
      if (game.food) drawCell(game.food.x, game.food.y, 25, 25, '#ffad75')
    } else if (game instanceof Tetris) {
      // Painel lateral e margem visível delimitando a área horizontal das peças (10 colunas = 250px)
      context.fillStyle = '#142029'; context.fillRect(250, 0, 250, 500)
      context.strokeStyle = '#182832'; context.lineWidth = 1
      for (let col = 1; col < 10; col++) {
        context.beginPath(); context.moveTo(col * 25, 0); context.lineTo(col * 25, 500); context.stroke()
      }
      for (let row = 1; row < 20; row++) {
        context.beginPath(); context.moveTo(0, row * 25); context.lineTo(250, row * 25); context.stroke()
      }
      game.board.forEach((row, y) => row.forEach((cell, x) => { if (cell) drawCell(x, y, 25, 25, '#9981d0') }))
      const current = game
      game.piece.forEach((row, y) => row.forEach((cell, x) => { if (cell) drawCell(current.x + x, current.y + y, 25, 25, '#c9b3ff') }))
      context.strokeStyle = '#b6ef85'; context.lineWidth = 3
      context.strokeRect(1.5, 1.5, 247, 497)
      context.fillStyle = '#b6ef85'; context.fillRect(250, 0, 4, 500)
      context.fillStyle = '#e9eef2'; context.font = '16px system-ui'; context.fillText('Próxima peça', 290, 40)
      game.next.forEach((row, y) => row.forEach((cell, x) => { if (cell) drawCell(12 + x, 3 + y, 25, 25, '#b6ef85') }))
      context.fillText('Nível ' + game.level, 290, 220); context.fillText('Linhas ' + game.lines, 290, 250)
    } else {
      const colors = ['#13232b', '#62727c', '#a36c47']
      game.board.forEach((row, y) => row.forEach((cell, x) => drawCell(x, y, 500 / 13, 500 / 11, colors[cell]!)))
      game.items.forEach(p => drawCell(p.x, p.y, 500 / 13, 500 / 11, '#c7a8ff'))
      game.bombs.forEach(p => { drawCell(p.x, p.y, 500 / 13, 500 / 11, '#eaeef2'); context.fillStyle = '#10171d'; context.font = '20px monospace'; context.fillText('●', p.x * 500 / 13 + 10, p.y * 500 / 11 + 30) })
      game.flames.forEach(p => drawCell(p.x, p.y, 500 / 13, 500 / 11, '#ffbd80'))
      game.enemies.forEach(p => { drawCell(p.x, p.y, 500 / 13, 500 / 11, '#ff808b'); context.fillStyle = '#10171d'; context.fillText('×', p.x * 500 / 13 + 10, p.y * 500 / 11 + 30) })
      drawCell(game.player.x, game.player.y, 500 / 13, 500 / 11, '#b6ef85')
    }
    if ($('score').textContent !== String(game.score)) $('score').textContent = String(game.score)
    if ($('status').textContent !== labels[game.status]) $('status').textContent = labels[game.status]
    $<HTMLButtonElement>('pause').disabled = !['running', 'paused'].includes(game.status)
    $<HTMLButtonElement>('end').disabled = !['running', 'paused'].includes(game.status)
    const pauseLabel = game.status === 'paused' ? 'Retomar' : 'Pausar'
    const startLabel = game.status === 'ready' ? 'Iniciar' : 'Reiniciar'
    if ($('pause').textContent !== pauseLabel) $('pause').textContent = pauseLabel
    if ($('start').textContent !== startLabel) $('start').textContent = startLabel
    if (game.score > lastScore && game instanceof Snake) audio.food()
    lastScore = game.score
    if (game.status !== lastStatus) {
      if (game.status === 'over') {
        if (game instanceof Snake) audio.gameOver()
        else audio.stopMusic(true)
      }
      else if (game.status === 'running' && !(game instanceof BombArena)) audio.startMusic()
      else audio.stopMusic(game.status !== 'paused')
      lastStatus = game.status
    }
  }
  function select(next: string) {
    void abandon(run); run = null; audio.stopMusic(true); lastStatus = 'ready'
    slug = next; audio.setGame(slug); game = slug === 'snake' ? new Snake() : slug === 'tetris' ? new Tetris() : new BombArena()
    const entry = catalog.find(g => g.slug === slug)!
    $('game-title').textContent = 'Vamos jogar ' + entry.name + '.'
    $('instructions').textContent = entry.controls
    canvas.setAttribute('aria-label', 'Tabuleiro de ' + entry.name)
    $('special').hidden = slug === 'snake'; $('special').textContent = slug === 'tetris' ? 'Queda instantânea' : 'Plantar bomba'
    $<HTMLSelectElement>('game-select').value = slug
    lastScore = 0; last = performance.now(); draw()
  }
  $<HTMLSelectElement>('game-select').onchange = event => select((event.target as HTMLSelectElement).value)
  document.querySelectorAll<HTMLAnchorElement>('[data-game]').forEach(link => { link.onclick = () => { select(link.dataset.game!); canvas.focus({ preventScroll: true }) } })
  $('start').onclick = () => {
    void abandon(run); audio.stopMusic(true); lastStatus = 'ready'; game.start(); audio.unlock(); last = performance.now()
    const current: Run = { slug, abandoned: false, finished: false, duration: 0, revision: accountRevision,
      session: signedIn ? api<{ id: string }>('/game-sessions/', { game: slug, client_version: '1.0.0' }).then(r => r.id).catch(() => {
        if (run === current) $('online-message').textContent = 'Sessão online indisponível. Esta partida será local.'
        return null
      }) : Promise.resolve(null) }
    run = current
    $('online-message').textContent = signedIn ? 'Registrando sessão online…' : 'Partida local. Entre antes de iniciar para salvar no ranking.'
    void current.session.then(id => { if (run === current && id) $('online-message').textContent = 'Sessão online ativa. O resultado será enviado ao fim natural da partida.' })
    canvas.focus(); draw()
  }
  function pause() { if (game.status === 'paused') game.resume(); else game.pause(); last = performance.now(); draw() }
  $('pause').onclick = pause
  $('end').onclick = () => { void abandon(run); game.end(); $('online-message').textContent = 'Partida encerrada manualmente, sem envio ao ranking.'; draw() }
  function direction(next: Direction) {
    if (game.status === 'running' && game instanceof Snake) audio.move()
    if (game instanceof Snake) game.turn(next)
    else if (game instanceof BombArena) game.move(next)
    else if (next === 'up') game.rotate(); else if (next === 'down') game.drop(); else game.move(next === 'left' ? -1 : 1)
    finish(); draw()
  }
  function special() {
    if (game instanceof Tetris) game.hardDrop(); else if (game instanceof BombArena) game.plant(); finish(); draw()
  }
  $('special').onclick = () => { special(); canvas.focus({ preventScroll: true }) }
  const keys: Record<string, Direction> = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }
  canvas.onkeydown = event => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
    if (keys[key]) { event.preventDefault(); direction(keys[key]) }
    if (key === ' ') { event.preventDefault(); if (!event.repeat) special() }
    if (key === 'p') { event.preventDefault(); if (!event.repeat) pause() }
  }
  document.querySelectorAll<HTMLButtonElement>('[data-dir]').forEach(button => { button.onclick = () => { direction(button.dataset.dir as Direction); canvas.focus({ preventScroll: true }) } })
  $('snake').addEventListener('focusout', event => {
    if (event.relatedTarget instanceof Node && !$('snake').contains(event.relatedTarget)) { game.pause(); draw() }
  })
  document.addEventListener('pointerdown', event => { if (event.target instanceof Node && !$('snake').contains(event.target)) { game.pause(); draw() } })
  window.addEventListener('blur', () => { game.pause(); draw() })
  document.addEventListener('visibilitychange', () => { if (document.hidden) game.pause(); last = performance.now(); draw() })
  function frame(now: number) {
    const delta = Math.max(0, Math.min(now - last, 200)); last = now
    if (run && game.status === 'running') run.duration += delta
    game.update(delta); finish(); draw(); requestAnimationFrame(frame)
  }
  select('snake'); requestAnimationFrame(frame)
}
