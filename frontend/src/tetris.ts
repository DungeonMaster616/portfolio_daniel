import type { Status } from './snake'
const shapes = [
  [[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]], [[1, 1, 0], [0, 1, 1]],
  [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]],
]
export class Tetris {
  board: number[][] = []
  piece: number[][] = []
  next: number[][] = []
  x = 3
  y = 0
  score = 0
  lines = 0
  status: Status = 'ready'
  private elapsed = 0
  private bag: number[] = []
  private random: () => number
  constructor(random = Math.random) { this.random = random; this.reset() }
  get level() { return 1 + Math.floor(this.lines / 10) }
  get tickMs() { return Math.max(100, 800 - (this.level - 1) * 60) }
  reset() {
    this.board = Array.from({ length: 20 }, () => Array<number>(10).fill(0))
    this.bag = []; this.score = 0; this.lines = 0; this.elapsed = 0
    this.status = 'ready'; this.next = this.take(); this.spawn()
  }
  start() { this.reset(); this.status = 'running' }
  pause() { if (this.status === 'running') { this.status = 'paused'; this.elapsed = 0 } }
  resume() { if (this.status === 'paused') { this.status = 'running'; this.elapsed = 0 } }
  end() { this.status = 'over'; this.elapsed = 0 }
  private take() {
    if (!this.bag.length) {
      this.bag = [0, 1, 2, 3, 4, 5, 6]
      for (let i = 6; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1))
        ;[this.bag[i], this.bag[j]] = [this.bag[j]!, this.bag[i]!]
      }
    }
    return shapes[this.bag.pop()!]!.map(row => [...row])
  }
  private valid(piece: number[][], x: number, y: number) {
    return piece.every((row, dy) => row.every((cell, dx) => !cell ||
      (x + dx >= 0 && x + dx < 10 && y + dy >= 0 && y + dy < 20 && !this.board[y + dy]![x + dx])))
  }
  private spawn() {
    this.piece = this.next; this.next = this.take(); this.x = Math.floor((10 - this.piece[0]!.length) / 2); this.y = 0
    if (!this.valid(this.piece, this.x, this.y)) this.end()
  }
  move(dx: number) {
    if (this.status === 'running' && this.valid(this.piece, this.x + dx, this.y)) this.x += dx
  }
  rotate() {
    if (this.status !== 'running') return
    const rotated = this.piece[0]!.map((_, i) => this.piece.map(row => row[i]!).reverse())
    for (const offset of [0, -1, 1, -2, 2]) {
      if (this.valid(rotated, this.x + offset, this.y)) { this.piece = rotated; this.x += offset; return }
    }
  }
  drop() {
    if (this.status !== 'running') return
    if (this.valid(this.piece, this.x, this.y + 1)) this.y++
    else this.lock()
  }
  hardDrop() {
    if (this.status !== 'running') return
    while (this.valid(this.piece, this.x, this.y + 1)) this.y++
    this.lock()
  }
  private lock() {
    this.piece.forEach((row, dy) => row.forEach((cell, dx) => { if (cell) this.board[this.y + dy]![this.x + dx] = 1 }))
    const remaining = this.board.filter(row => row.some(cell => !cell))
    const cleared = 20 - remaining.length
    this.score += [0, 100, 300, 500, 800][cleared]! * this.level
    this.lines += cleared
    this.board = [...Array.from({ length: cleared }, () => Array<number>(10).fill(0)), ...remaining]
    this.elapsed = 0; this.spawn()
  }
  update(delta: number) {
    if (this.status !== 'running' || !Number.isFinite(delta) || delta < 0) return
    this.elapsed += delta
    while (this.status === 'running' && this.elapsed >= this.tickMs) { this.elapsed -= this.tickMs; this.drop() }
  }
}
