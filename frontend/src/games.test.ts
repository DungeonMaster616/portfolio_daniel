import { describe, it, expect } from 'vitest'
import { Tetris } from './tetris'
import { BombArena } from './bomb-arena'
describe('Tetris DEC-02', () => {
  it('TC-008 movement and rotation respect walls', () => {
    const g = new Tetris(() => 0); g.start()
    for (let i = 0; i < 20; i++) g.move(-1)
    expect(g.x).toBe(0); g.rotate(); expect(g.x).toBeGreaterThanOrEqual(0)
    g.drop(); expect(g.y).toBe(1)
  })
  it('TC-009 removes multiple complete rows once and scores by level', () => {
    const g = new Tetris(); g.start(); g.piece = [[1, 1], [1, 1]]; g.x = 0; g.y = 18
    g.board[18] = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1]; g.board[19] = [...g.board[18]!]
    g.drop(); expect(g.lines).toBe(2); expect(g.score).toBe(300)
    expect(g.board.every(row => row.every(cell => cell === 0))).toBe(true)
    g.update(1); expect(g.score).toBe(300)
  })
  it('TC-010 preview becomes next piece and blocked spawn ends game', () => {
    const g = new Tetris(); g.start(); const next = structuredClone(g.next)
    g.hardDrop(); expect(g.piece).toEqual(next)
    g.board[0]!.fill(1); g.board[0]![0] = 0; g.hardDrop(); expect(g.status).toBe('over')
  })
  it('TC-003 pause freezes gravity and restart clears board', () => {
    const g = new Tetris(); g.start(); g.pause(); g.update(5000); expect(g.y).toBe(0)
    g.resume(); g.update(800); expect(g.y).toBe(1); g.start(); expect(g.y).toBe(0)
  })
})
describe('Bomb Arena DEC-02', () => {
  it('TC-011 movement blocks walls and crates', () => {
    const g = new BombArena(); g.start(); g.move('left'); expect(g.player).toEqual({ x: 1, y: 1 })
    g.board[1]![2] = 2; g.move('right'); expect(g.player.x).toBe(1)
  })
  it('TC-012 fuse respects pause and crate blocks propagation', () => {
    const g = new BombArena(); g.start(); g.board[1]![2] = 2; g.plant(); g.player = { x: 1, y: 4 }
    g.pause(); g.update(3000); expect(g.bombs).toHaveLength(1); g.resume()
    g.update(1999); expect(g.flames).toHaveLength(0); g.update(1)
    expect(g.crates).toBe(1); expect(g.flames.some(f => f.x === 3 && f.y === 1)).toBe(false)
    expect(g.flames.some(f => f.x === 0)).toBe(false)
  })
  it('TC-013 player death precedes simultaneous victory', () => {
    const g = new BombArena(); g.start(); g.enemies = [{ ...g.player, direction: 0 }]
    g.bombs = [{ ...g.player, range: 2, time: 1 }]; g.update(1); expect(g.status).toBe('over'); expect(g.score).toBe(100)
  })
  it('TC-013 last enemy defeat wins once', () => {
    const g = new BombArena(); g.start(); g.enemies = [{ x: 3, y: 1, direction: 0 }]
    g.bombs = [{ x: 3, y: 1, range: 1, time: 1 }]; g.player = { x: 1, y: 3 }; g.update(1)
    expect(g.status).toBe('won'); const score = g.score; g.update(1000); expect(g.score).toBe(score)
  })
  it('TC-014 crate reveals a range item collected only once', () => {
    const g = new BombArena(); g.start(); g.board[1]![2] = 2; g.plant(); g.player = { x: 1, y: 4 }
    g.update(2500); expect(g.items).toContainEqual({ x: 2, y: 1 })
    g.player = { x: 1, y: 1 }; g.move('right'); expect(g.range).toBe(3); expect(g.items).toHaveLength(0)
  })
})
