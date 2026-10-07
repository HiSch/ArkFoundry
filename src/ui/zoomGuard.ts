/**
 * The game is a fixed, phone-sized interface; zooming only shifts the fixed
 * resource bar and tab bar. The viewport meta tag disables pinch zoom on most
 * browsers, but iOS Safari ignores it, so pinch gestures are blocked here.
 */
export function preventZoom(): void {
  const block = (event: Event) => event.preventDefault()
  for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(type, block, { passive: false })
  }
  // Two-finger touch moves are pinch gestures on browsers without gesture events.
  document.addEventListener(
    'touchmove',
    (event) => {
      if (event.touches.length > 1) event.preventDefault()
    },
    { passive: false },
  )
}
