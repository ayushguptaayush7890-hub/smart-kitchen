"use client"

import { useState } from "react"
import Link from "next/link"
import { Clock, Flame, Users, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface Recipe {
  id: string
  name: string
  image: string
  cookingTime: string
  calories: number
  servings: number
  ingredients: string[]
  difficulty: "Easy" | "Medium" | "Hard"
  tags: string[]
}

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [imgSrc, setImgSrc] = useState(recipe.image)
  const [triedFallback, setTriedFallback] = useState(false)

  const difficultyColor = {
    Easy: "bg-accent/20 text-accent",
    Medium: "bg-secondary text-secondary-foreground",
    Hard: "bg-destructive/20 text-destructive",
  }

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      "Vegetables": "bg-accent/20 text-accent",
      "Spicy": "bg-destructive/20 text-destructive",
      "Quick": "bg-secondary text-secondary-foreground",
      "Healthy": "bg-accent/20 text-accent",
      "Protein": "bg-primary/20 text-primary",
    }
    return colors[tag] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="group bg-card rounded-3xl shadow-lg border border-border overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={recipe.name}
            loading="lazy"
            onError={() => {
              if (!triedFallback) {
                const keywords = encodeURIComponent(
                  recipe.ingredients.slice(0, 3).join(",") || recipe.name
                )
                setTriedFallback(true)
                setImgSrc(
                  `https://source.unsplash.com/800x600/?food,${keywords}&sig=${encodeURIComponent(
                    recipe.id
                  )}`
                )
              } else {
                // Second failure: stop trying URLs and show gradient placeholder.
                setImgSrc("")
              }
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
            <span className="text-sm font-semibold text-foreground/70">
              {recipe.name}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className={`${difficultyColor[recipe.difficulty]} font-medium`}>
            {recipe.difficulty}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
          {recipe.name}
        </h3>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-primary" />
            {recipe.cookingTime}
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-destructive" />
            {recipe.calories} cal
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-accent" />
            {recipe.servings}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} className={`${getTagColor(tag)} text-xs font-medium`}>
              {tag}
            </Badge>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {recipe.ingredients.slice(0, 4).join(", ")}
          {recipe.ingredients.length > 4 && ` +${recipe.ingredients.length - 4} more`}
        </p>

        <Link href={`/recipes/${recipe.id}`}>
          <Button className="w-full gradient-button text-primary-foreground group-hover:shadow-lg transition-shadow">
            Select Recipe
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
