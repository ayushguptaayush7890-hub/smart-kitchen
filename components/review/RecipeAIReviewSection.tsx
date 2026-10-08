"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Video, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReviewRecipeCard } from "./ReviewRecipeCard"
import { UploadModal } from "./UploadModal"
import { AIReviewCard } from "./AIReviewCard"
import { CommunityGallery } from "./CommunityGallery"
import { simulateAIReview, delay, type AIReviewResult } from "./simulateAIReview"
import type { CommunityVideoItem } from "./types"

const SAMPLE_CLIP =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"

function loadDummyCommunity(recipeId: string): CommunityVideoItem[] {
  const now = Date.now()
  return [
    {
      id: `dummy-${recipeId}-1`,
      username: "Maya Cooks",
      rating: 5,
      submittedAt: now - 86400000 * 2,
      videoUrl: SAMPLE_CLIP,
    },
    {
      id: `dummy-${recipeId}-2`,
      username: "ChefDevDan",
      rating: 4,
      submittedAt: now - 86400000 * 5,
      videoUrl: SAMPLE_CLIP,
    },
    {
      id: `dummy-${recipeId}-3`,
      username: "HomeKitchen_Amy",
      rating: 4,
      submittedAt: now - 3600000 * 8,
      videoUrl: SAMPLE_CLIP,
    },
  ]
}

type RecipeAIReviewSectionProps = {
  recipeId: string
  recipeName: string
  ingredients: string[]
  steps: string[]
}

export function RecipeAIReviewSection({
  recipeId,
  recipeName,
  ingredients,
  steps,
}: RecipeAIReviewSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [reviewResult, setReviewResult] = useState<AIReviewResult | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [communityExtras, setCommunityExtras] = useState<CommunityVideoItem[]>([])

  const baseCommunity = useMemo(() => loadDummyCommunity(recipeId), [recipeId])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = useCallback((file: File | null) => {
    setVideoFile(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
    setReviewResult(null)
    setShowSuccess(false)
  }, [])

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file)
      const v = document.createElement("video")
      v.preload = "metadata"
      v.onloadedmetadata = () => {
        URL.revokeObjectURL(url)
        resolve(Number.isFinite(v.duration) ? v.duration : 45)
      }
      v.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(45)
      }
      v.src = url
    })
  }

  const handleSubmitReview = async () => {
    if (!videoFile || !previewUrl) return
    setIsAnalyzing(true)
    setReviewResult(null)
    setShowSuccess(false)

    const duration = await getVideoDuration(videoFile)
    await delay(1800 + Math.random() * 1200)

    const result = simulateAIReview(duration)
    setReviewResult(result)
    setIsAnalyzing(false)
    setShowSuccess(true)
    setModalOpen(false)

    // Dedicated blob URL for gallery so clearing the modal preview does not revoke it
    const galleryUrl = URL.createObjectURL(videoFile)
    const newItem: CommunityVideoItem = {
      id: `user-${recipeId}-${Date.now()}`,
      username: "You",
      rating: result.rating,
      submittedAt: Date.now(),
      videoUrl: galleryUrl,
    }

    setCommunityExtras((prev) => [newItem, ...prev])

    setVideoFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)

    setTimeout(() => setShowSuccess(false), 3200)
  }

  const allCommunity = useMemo(
    () => [...communityExtras, ...baseCommunity],
    [communityExtras, baseCommunity]
  )

  return (
    <section id="cookmate-ai-review" className="mt-16 pt-12 border-t border-border scroll-mt-24">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
            CookMate AI Review System
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Get feedback on your cooking video
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Upload a clip of your dish. Our simulated AI scores presentation and technique — perfect
            for demos and portfolio shots.
          </p>
        </div>

        <ReviewRecipeCard name={recipeName} ingredients={ingredients} steps={steps} />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <Button
            type="button"
            size="lg"
            className="gap-2 gradient-button text-primary-foreground text-base py-6 px-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all"
            onClick={() => setModalOpen(true)}
          >
            <Video className="w-5 h-5" />
            Upload your dish 📹
          </Button>
          {isAnalyzing && (
            <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm font-medium">AI is analyzing your video…</span>
            </div>
          )}
          {showSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 shrink-0" />
              <span className="text-sm font-semibold text-foreground">Upload complete — review ready!</span>
            </div>
          )}
        </div>

        <UploadModal
          open={modalOpen}
          onClose={() => !isAnalyzing && setModalOpen(false)}
          videoFile={videoFile}
          previewUrl={previewUrl}
          onFileChange={handleFileChange}
          onSubmit={handleSubmitReview}
          isAnalyzing={isAnalyzing}
        />

        {reviewResult && <AIReviewCard result={reviewResult} />}

        <CommunityGallery items={allCommunity} recipeName={recipeName} />
      </div>
    </section>
  )
}
