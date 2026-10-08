export type AIReviewResult = {
  rating: number
  presentation: number
  cookingAccuracy: number
  feedback: string
}

const FEEDBACK_BY_TIER: Record<string, string[]> = {
  low: [
    "Try slowing down key steps so the camera catches each technique clearly.",
    "Consider better lighting so we can judge color and doneness more accurately.",
    "Work on mise en place — having ingredients ready will show smoother flow.",
  ],
  mid: [
    "Solid attempt! A steadier camera angle would boost presentation scores.",
    "Timing looks reasonable; refine knife work for more consistent cuts.",
    "Good energy — next time show the pan temperature cues for extra accuracy points.",
  ],
  high: [
    "Impressive plating and confident movements — restaurant-worthy framing.",
    "Excellent technique visibility; your sear and toss timing look spot on.",
    "Chef-level clarity. This would inspire others trying the same recipe!",
  ],
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Dummy AI: rating influenced by video duration + jitter; scores and text derived from tier */
export function simulateAIReview(durationSeconds: number): AIReviewResult {
  const d = Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 30

  let base: number
  if (d < 15) base = 2
  else if (d < 45) base = 3
  else if (d < 120) base = 4
  else base = 5

  const jitter = Math.floor(Math.random() * 3) - 1
  const rating = clamp(base + jitter, 1, 5)

  const tier = rating <= 2 ? "low" : rating <= 3 ? "mid" : "high"
  const feedback = randomFrom(FEEDBACK_BY_TIER[tier])

  const spread = 8 + Math.random() * 12
  const presentation = clamp(Math.round(rating * 16 + spread + (Math.random() * 10 - 5)), 38, 99)
  const cookingAccuracy = clamp(
    Math.round(rating * 15 + spread * 0.9 + (Math.random() * 14 - 7)),
    35,
    99
  )

  return { rating, presentation, cookingAccuracy, feedback }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
