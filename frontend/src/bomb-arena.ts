import type { Point, Direction, Status } from './snake'
type Bomb = Point & { time: number; range: number }
type Enemy = Point & { direction: number }
const vectors = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }]
const equal = (a: Point, b: Point) => a.x === b.x && a.y === b.y
export class BombArena {
  board: number[][] = [] // 0 floor, 1 wall, 2 crate
  player: Point = { x: 1, y: 1 }
  enemies: Enemy[] = []
  bombs: Bomb[] = []
  flames: (Point & { time: number })[] = []
  items: Point[] = []
  range = 2
  score = 0
  crates = 0
  defeated = 0
  status: Status = 'ready'
  private movement = 0
  private enemyTime = 0
  constructor() { this.reset() }
  reset() {
    this.board = Array.from({ length: 11 }, (_, y) => Array.from({ length: 13 }, (_, x) =>
      x === 0 || y === 0 || x === 12 || y === 10 || (x % 2 === 0 && y % 2 === 0) ? 1 :
        (x + y > 4 && x < 10 && y < 8 && (x + y) % 2 === 1 ? 2 : 0)))
    this.player = { x: 1, y: 1 }; this.enemies = [{ x: 11, y: 1, direction: 1 }, { x: 11, y: 9, direction: 2 }, { x: 1, y: 9, direction: 0 }]
    this.bombs = []; this.flames = []; this.items = []; this.range = 2
    this.score = 0; this.crates = 0; this.defeated = 0; this.movement = 0; this.enemyTime = 0; this.status = 'ready'
  }
  start() { this.reset(); this.status = 'running' }
  pause() { if (this.status === 'running') this.status = 'paused' }
  resume() { if (this.status === 'paused') this.status = 'running' }
  end() { this.status = 'over' }
  private free(p: Point) { return this.board[p.y]?.[p.x] === 0 && !this.bombs.some(b => equal(b, p)) }
  move(direction: Direction) {
    if (this.status !== 'running' || this.movement > 0) return
    const v = vectors[{ right: 0, down: 1, left: 2, up: 3 }[direction]]!
    const next = { x: this.player.x + v.x, y: this.player.y + v.y }
    if (this.free(next)) {
      this.player = next; this.movement = 120
      if (this.items.some(i => equal(i, next))) { this.range = Math.min(5, this.range + 1); this.items = this.items.filter(i => !equal(i, next)) }
      this.resolve()
    }
  }
  plant() {
    if (this.status === 'running' && !this.bombs.length) this.bombs.push({ ...this.player, time: 2000, range: this.range })
  }
  private explode(bomb: Bomb) {
    if (!this.bombs.includes(bomb)) return
    this.bombs = this.bombs.filter(b => b !== bomb)
    const hit: Point[] = [{ x: bomb.x, y: bomb.y }]
    for (const v of vectors) for (let step = 1; step <= bomb.range; step++) {
      const p = { x: bomb.x + v.x * step, y: bomb.y + v.y * step }
      const tile = this.board[p.y]?.[p.x]
      if (tile === undefined || tile === 1) break
      hit.push(p)
      if (tile === 2) {
        this.board[p.y]![p.x] = 0; this.crates++; this.score += 10
        if ((p.x + p.y) % 3 === 0) this.items.push(p)
        break
      }
    }
    this.flames.push(...hit.map(p => ({ ...p, time: 500 })))
    for (const other of [...this.bombs]) if (hit.some(p => equal(p, other))) this.explode(other)
  }
  private resolve() {
    const killed = this.enemies.filter(e => this.flames.some(f => equal(e, f)))
    this.defeated += killed.length; this.score += killed.length * 100
    this.enemies = this.enemies.filter(e => !killed.includes(e))
    if (this.flames.some(f => equal(f, this.player)) || this.enemies.some(e => equal(e, this.player))) this.end()
    else if (!this.enemies.length) { this.status = 'won'; this.score += 500 }
  }
  update(delta: number) {
    if (this.status !== 'running' || !Number.isFinite(delta) || delta < 0) return
    // Event boundaries preserve fuse/flame timing even with large injected deltas.
    let left = delta
    while (left > 0 && this.status === 'running') {
      const interval = Math.max(250, 650 - this.crates * 10)
      const step = Math.min(left, Math.max(0, interval - this.enemyTime), ...this.bombs.map(b => b.time), ...this.flames.map(f => f.time))
      left -= step; this.movement = Math.max(0, this.movement - step); this.enemyTime += step
      this.flames.forEach(f => { f.time -= step }); this.flames = this.flames.filter(f => f.time > 0)
      this.bombs.forEach(b => { b.time -= step })
      for (const bomb of [...this.bombs]) if (bomb.time <= 0) this.explode(bomb)
      this.resolve()
      if (this.status !== 'running') break
      if (this.enemyTime >= interval) {
        this.enemyTime = 0
        for (const enemy of this.enemies) {
          const v = vectors[enemy.direction]!, next = { x: enemy.x + v.x, y: enemy.y + v.y }
          if (this.free(next)) { enemy.x = next.x; enemy.y = next.y } else enemy.direction = (enemy.direction + 1) % 4
        }
        this.resolve()
      }
    }
  }
}
