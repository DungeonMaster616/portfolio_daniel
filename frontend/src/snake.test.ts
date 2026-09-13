import { describe, it, expect } from 'vitest'
import { Snake } from './snake'
describe('Snake — DEC-02', () => {
  it('TC-003: pause freezes time; resume and restart reset timers', () => {
    const game = new Snake(() => 0); game.start(); game.update(80); game.pause()
    const body = structuredClone(game.body)
    game.update(10000); expect(game.body).toEqual(body); expect(game.score).toBe(0)
    game.resume(); game.update(80); expect(game.body).toEqual(body)
    game.update(80); expect(game.body[0]!.x).toBe(11)
    game.start(); expect(game.body).toEqual(body); expect(game.score).toBe(0)
    game.end(); game.update(1000); expect(game.body).toEqual(body)
  })
  it('TC-005: food grows body, scores, and respawns in a free cell', () => {
    const game = new Snake(() => 0); game.start(); game.food = { x: 11, y: 10 }
    game.update(160); expect(game.score).toBe(10); expect(game.body).toHaveLength(4)
    expect(game.body).not.toContainEqual(game.food)
  })
  it('TC-005: rapid turns cannot reverse into the body', () => {
    const game = new Snake(); game.start(); game.turn('left'); game.turn('up'); game.turn('left')
    game.update(160); expect(game.body[0]).toEqual({ x: 10, y: 9 })
  })
  it('TC-006: wall collision ends updates', () => {
    const game = new Snake(() => 0); game.start(); game.update(1600)
    expect(game.status).toBe('over')
    const body = structuredClone(game.body); game.update(160); expect(game.body).toEqual(body)
  })
  it('TC-006: body collision ends the game, departing tail is legal', () => {
    const game = new Snake(); game.start()
    game.body = [{x:2,y:2},{x:2,y:3},{x:3,y:3},{x:3,y:2}]
    game.food = {x:0,y:0}; game.update(160); expect(game.status).toBe('running')
    game.body = [{x:2,y:2},{x:3,y:2},{x:3,y:3},{x:2,y:3}]
    game.update(160); expect(game.status).toBe('over')
  })
  it('TC-007: speed progresses and has a minimum', () => {
    const game = new Snake(); expect(game.tickMs).toBe(160)
    game.score = 10; expect(game.tickMs).toBe(155)
    game.score = 10000; expect(game.tickMs).toBe(70)
  })
})
