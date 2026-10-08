"use client"

import { ChefHat, ListOrdered, ShoppingBasket } from "lucide-react"

type ReviewRecipeCardProps = {
  name: string
  ingredients: string[]
  steps: string[]
}

/** Compact recipe summary for the AI Review section (distinct from list `RecipeCard`) */
export function ReviewRecipeCard({ name, ingredients, steps }: ReviewRecipeCardProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-lg">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <ChefHat className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{name}</h2>
          <p className="text-sm text-muted-foreground mt-1">CookMate AI Review System</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-xl bg-background/60 border border-border/60 p-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <ShoppingBasket className="w-4 h-4 text-accent" />
            Ingredients
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-background/60 border border-border/60 p-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <ListOrdered className="w-4 h-4 text-primary" />
            Steps
          </h3>
          <ol className="text-sm text-muted-foreground space-y-2 max-h-48 overflow-y-auto pr-1 list-none">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
