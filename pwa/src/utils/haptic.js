const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator

function haptic(pattern) {
  if (canVibrate) navigator.vibrate(pattern)
}

export const haptics = {
  light:   () => haptic(8),
  medium:  () => haptic(15),
  heavy:   () => haptic([20, 10, 20]),
  success: () => haptic([10, 50, 10]),
  error:   () => haptic([20, 10, 20, 10, 20]),
  tap:     () => haptic(6),
}
