"use client"

import { useMemo, useState } from "react"
import { Star, Filter, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CommunityVideoItem } from "./types"

type FilterMode = "top" | "latest"

type CommunityGalleryProps = {
  items: CommunityVideoItem[]
  recipeName: string
}

export function CommunityGallery({ items, recipeName }: CommunityGalleryProps) {
  const [filter, setFilter] = useState<FilterMode>("top")

  const sorted = useMemo(() => {
    const copy = [...items]
    if (filter === "top") {
      copy.sort((a, b) => b.rating - a.rating || b.submittedAt - a.submittedAt)
    } else {
      copy.sort((a, b) => b.submittedAt - a.submittedAt)
    }
    return copy
  }, [items, filter])

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Community kitchen
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Videos for <span className="text-foreground font-medium">{recipeName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <Button
            type="button"
            size="sm"
            variant={filter === "top" ? "default" : "outline"}
            className={filter === "top" ? "gradient-button text-primary-foreground" : ""}
            onClick={() => setFilter("top")}
          >
            Top rated
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filter === "latest" ? "default" : "outline"}
            className={filter === "latest" ? "gradient-button text-primary-foreground" : ""}
            onClick={() => setFilter("latest")}
          >
            Latest
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12 rounded-xl border border-dashed border-border">
          No community videos yet. Be the first to upload yours!
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((item) => (
            <li
              key={item.id}
              className="group rounded-xl border border-border overflow-hidden bg-background/40 hover:border-primary/40 hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-video bg-muted">
                <video
                  src={item.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <span className="font-medium text-foreground truncate">{item.username}</span>
                <div className="flex items-center gap-0.5 shrink-0 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold text-foreground">{item.rating}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
