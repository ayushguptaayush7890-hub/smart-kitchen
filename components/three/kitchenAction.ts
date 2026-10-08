export type KitchenAction = "idle" | "chop" | "heat" | "cook" | "stir"

/** Derive simulator action from recipe step text */
export function getKitchenActionFromStepText(text: string): KitchenAction {
  const lower = text.toLowerCase()
  if (/\b(stir|mix|whisk|beat|fold)\b/.test(lower)) return "stir"
  if (/\b(chop|slice|cut|dice|mince|grate|peel)\b/.test(lower)) return "chop"
  if (/\b(heat|preheat|warm|melt|boil|simmer)\b/.test(lower)) return "heat"
  if (/\b(cook|fry|saut[eé]|bake|grill|roast|brown|sear)\b/.test(lower)) return "cook"
  if (/\b(pan|pot|skillet|wok|oven|stove)\b/.test(lower)) return "heat"
  return "idle"
}
