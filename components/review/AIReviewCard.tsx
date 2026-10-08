"use client"

import { Star } from "lucide-react"
import type { AIReviewResult } from "./simulateAIReview"

type AIReviewCardProps = {
  result: AIReviewResult
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-6 h-6 sm:w-7 sm:h-7 ${
            i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
          }`}
        />
      ))}
    </div>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function AIReviewCard({ result }: AIReviewCardProps) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/10 p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-foreground mb-4">AI review</h3>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <StarRow rating={result.rating} />
        <span className="text-sm text-muted-foreground">
          Overall <span className="font-bold text-foreground">{result.rating}</span>/5
        </span>
      </div>
      <div className="space-y-4 mb-5">
        <ScoreBar label="Presentation" value={result.presentation} />
        <ScoreBar label="Cooking accuracy" value={result.cookingAccuracy} />
      </div>
      <p className="text-sm leading-relaxed text-foreground/90 rounded-xl bg-background/50 border border-border/60 p-4">
        {result.feedback}
      </p>
    </div>
  )
}
