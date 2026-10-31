export function setupAudio() {
  const enabled = document.querySelector<HTMLInputElement>('#sound')!
  const volume = document.querySelector<HTMLInputElement>('#volume')!
  try {
    enabled.checked = localStorage.getItem('portfolio-sound') !== 'false'
    const saved = Number(localStorage.getItem('portfolio-volume') ?? .2)
    volume.value = String(Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : .2)
  } catch { /* Preferences are optional when storage is unavailable. */ }
  const snakeMusic = new Audio('/sound/snake/music.mp3')
  const tetrisMusic = new Audio('/sound/tetris/tetris.mp3')
  const moveSound = new Audio('/sound/snake/move.mp3')
  const foodSound = new Audio('/sound/snake/food.mp3')
  const gameOverSound = new Audio('/sound/snake/game over.mp3')
  snakeMusic.loop = true
  tetrisMusic.loop = true
  let currentGame = 'snake'
  let musicActive = false
  const currentMusic = () => (currentGame === 'tetris' ? tetrisMusic : currentGame === 'snake' ? snakeMusic : null)
  const getVolume = () => Math.min(1, Math.max(0, Number(volume.value) || 0))
  const syncVolume = () => {
    const v = getVolume()
    snakeMusic.volume = v
    tetrisMusic.volume = v
    moveSound.volume = v
    foodSound.volume = v
    gameOverSound.volume = v
  }
  syncVolume()
  const save = () => {
    syncVolume()
    const active = currentMusic()
    if (!enabled.checked || !active) {
      snakeMusic.pause()
      tetrisMusic.pause()
    } else if (musicActive) {
      void active.play().catch(() => {})
    }
    try {
      localStorage.setItem('portfolio-sound', String(enabled.checked))
      localStorage.setItem('portfolio-volume', volume.value)
    } catch { /* Keep in-memory preferences. */ }
  }
  enabled.onchange = save
  volume.oninput = save
  const playEffect = (audio: HTMLAudioElement) => {
    if (!enabled.checked || currentGame !== 'snake') return
    audio.volume = getVolume()
    try { audio.currentTime = 0 } catch { /* Ignore if media is not loaded yet. */ }
    void audio.play().catch(() => {})
  }
  return {
    setGame(slug: string) {
      if (currentGame !== slug) {
        this.stopMusic(true)
        currentGame = slug
      }
    },
    unlock() { syncVolume() },
    startMusic() {
      const active = currentMusic()
      if (!active) {
        this.stopMusic(true)
        return
      }
      musicActive = true
      if (!enabled.checked) return
      const other = currentGame === 'tetris' ? snakeMusic : tetrisMusic
      other.pause()
      active.volume = getVolume()
      void active.play().catch(() => {})
    },
    stopMusic(reset = false) {
      musicActive = false
      snakeMusic.pause()
      tetrisMusic.pause()
      if (reset) {
        try { snakeMusic.currentTime = 0 } catch { /* Ignore if media is not loaded yet. */ }
        try { tetrisMusic.currentTime = 0 } catch { /* Ignore if media is not loaded yet. */ }
      }
    },
    move() { playEffect(moveSound) },
    food() { playEffect(foodSound) },
    play() { playEffect(foodSound) },
    gameOver() {
      this.stopMusic(true)
      playEffect(gameOverSound)
    },
  }
}
