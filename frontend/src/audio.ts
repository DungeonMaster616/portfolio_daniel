export function setupAudio() {
  const enabled = document.querySelector<HTMLInputElement>('#sound')!
  const volume = document.querySelector<HTMLInputElement>('#volume')!
  try {
    enabled.checked = localStorage.getItem('portfolio-sound') === 'true'
    const saved = Number(localStorage.getItem('portfolio-volume') ?? .2)
    volume.value = String(Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : .2)
  } catch { /* Preferences are optional when storage is unavailable. */ }
  const save = () => { try { localStorage.setItem('portfolio-sound', String(enabled.checked)); localStorage.setItem('portfolio-volume', volume.value) } catch { /* Keep in-memory preferences. */ } }
  enabled.onchange = save; volume.oninput = save
  let context: AudioContext | undefined
  return {
    unlock() { if (enabled.checked) { context ??= new AudioContext(); void context.resume().catch(() => {}) } },
    play() {
      if (!enabled.checked || !context || context.state !== 'running') return
      const oscillator = context.createOscillator(), gain = context.createGain()
      oscillator.frequency.value = 440; oscillator.type = 'sine'
      gain.gain.setValueAtTime(Number(volume.value) * .15, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .12)
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .12)
    },
  }
}
