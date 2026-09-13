export type Point = { x: number; y: number }
export type Direction = 'up' | 'down' | 'left' | 'right'
export type Status = 'ready' | 'running' | 'paused' | 'over' | 'won'
const vectors: Record<Direction, Point> = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
  left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
}
export class Snake {
  readonly size = 20
  body: Point[] = []
  food: Point | null = null
  direction: Direction = 'right'
  status: Status = 'ready'
  score = 0
  private queued: Direction | null = null
  private elapsed = 0
  private random: () => number
  constructor(random: () => number = Math.random) {
    this.random = random
    this.reset()
  }
  get tickMs() { return Math.max(70, 160 - this.score / 10 * 5) }
  reset() {
    this.body = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
    this.direction = 'right'
    this.queued = null
    this.elapsed = 0
    this.score = 0
    this.status = 'ready'
    this.placeFood()
  }
  start() { this.reset(); this.status = 'running' }
  pause() { if (this.status === 'running') { this.status = 'paused'; this.elapsed = 0 } }
  resume() { if (this.status === 'paused') { this.status = 'running'; this.elapsed = 0 } }
  end() { this.status = 'over'; this.elapsed = 0 }
  turn(next: Direction) {
    if (this.status !== 'running' || this.queued || next === this.direction) return
    const a = vectors[this.direction], b = vectors[next]
    if (a.x + b.x === 0 && a.y + b.y === 0) return
    this.queued = next
  }
  update(deltaMs: number) {
    if (this.status !== 'running' || !Number.isFinite(deltaMs) || deltaMs < 0) return
    this.elapsed += deltaMs
    while (this.status === 'running' && this.elapsed >= this.tickMs) {
      this.elapsed -= this.tickMs
      this.step()
    }
  }
  private step() {
    this.direction = this.queued ?? this.direction
    this.queued = null
    const v = vectors[this.direction], first = this.body[0]!
    const head = { x: first.x + v.x, y: first.y + v.y }
    const grows = this.food?.x === head.x && this.food?.y === head.y
    const occupied = grows ? this.body : this.body.slice(0, -1)
    if (head.x < 0 || head.y < 0 || head.x >= this.size || head.y >= this.size ||
      occupied.some(p => p.x === head.x && p.y === head.y)) { this.end(); return }
    this.body.unshift(head)
    if (grows) { this.score += 10; this.placeFood() } else this.body.pop()
  }
  private placeFood() {
    const free: Point[] = []
    for (let y = 0; y < this.size; y++) for (let x = 0; x < this.size; x++) {
      if (!this.body.some(p => p.x === x && p.y === y)) free.push({ x, y })
    }
    this.food = free[Math.floor(this.random() * free.length)] ?? null
    if (!this.food) this.status = 'won'
  }
}
