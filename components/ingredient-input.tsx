"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, Scan, Sparkles, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL } from "@/lib/api"

type ImageItem = {
  file: File
  previewUrl: string
}

export function IngredientInput() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState("")
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<ImageItem[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const filesRef = useRef<ImageItem[]>([])
  filesRef.current = uploadedFiles

  useEffect(() => {
    return () => {
      filesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list?.length) return

    const imageFiles = Array.from(list).filter((file) => file.type.startsWith("image/"))
    if (imageFiles.length === 0) return

    const newItems: ImageItem[] = imageFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setUploadedFiles((prev) => [...prev, ...newItems])
    e.target.value = ""
  }

  const removeImageAt = (index: number) => {
    setUploadedFiles((prev) => {
      const next = [...prev]
      const [removed] = next.splice(index, 1)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return next
    })
  }

  const clearAllImages = () => {
    uploadedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setUploadedFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const detectIngredients = async () => {
    if (uploadedFiles.length === 0) return

    setIsDetecting(true)

    try {
      // One FormData per image (current API: single file). For batch upload later:
      // const batch = new FormData(); files.forEach(f => batch.append("files", f)); ...
      for (const { file } of uploadedFiles) {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch(`${API_BASE_URL}/predict`, {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          throw new Error("Failed to detect ingredients")
        }

        const data = await res.json()
        const raw = typeof data.predicted_class === "string" ? data.predicted_class : ""
        const lower = raw.toLowerCase().trim()
        if (!lower) continue
        const display = lower.charAt(0).toUpperCase() + lower.slice(1)

        setDetectedIngredients((prev) => (prev.includes(display) ? prev : [...prev, display]))
      }
    } catch (error) {
      console.error("Error detecting ingredients:", error)
    } finally {
      setIsDetecting(false)
    }
  }

  const removeIngredient = (ingredient: string) => {
    setDetectedIngredients((prev) => prev.filter((i) => i !== ingredient))
  }

  const handleFindRecipes = () => {
    const allIngredients = [
      ...detectedIngredients,
      ...ingredients.split(",").map((i) => i.trim()).filter(Boolean),
    ]
    const params = new URLSearchParams({ ingredients: allIngredients.join(",") })
    router.push(`/recipes?${params.toString()}`)
  }

  const getIngredientColor = (ingredient: string) => {
    const colors: Record<string, string> = {
      Egg: "bg-secondary text-secondary-foreground",
      Tomato: "bg-destructive/20 text-destructive",
      Onion: "bg-primary/20 text-primary",
      Cheese: "bg-secondary text-secondary-foreground",
      "Bell Pepper": "bg-accent/20 text-accent",
    }
    return colors[ingredient] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="bg-card rounded-3xl shadow-xl border border-border p-6 md:p-8">
      <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" />
        Enter Your Ingredients
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Type ingredients (comma-separated)
          </label>
          <Input
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g., chicken, rice, garlic, onion..."
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-foreground mb-2">
            Or upload images of ingredients
          </label>

          {uploadedFiles.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Click to upload one or more images</p>
              <p className="text-sm text-muted-foreground mt-1">PNG, JPG, WebP — images only</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {uploadedFiles.map((item, index) => (
                  <div
                    key={`${item.previewUrl}-${index}`}
                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-primary/20 bg-muted/30 group"
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.file.name || `Ingredient ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageAt(index)}
                      className="absolute top-1.5 right-1.5 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-md opacity-90 group-hover:opacity-100"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-0 left-0 right-0 truncate text-[10px] sm:text-xs text-white bg-black/50 px-1 py-0.5">
                      {item.file.name || `Image ${index + 1}`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="w-4 h-4" />
                  Add more
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={clearAllImages}>
                  Clear all
                </Button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {uploadedFiles.length > 0 && (
          <Button
            onClick={detectIngredients}
            disabled={isDetecting}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Scan className="w-4 h-4 mr-2" />
            {isDetecting ? "Detecting..." : `Detect Ingredients (${uploadedFiles.length} image${uploadedFiles.length > 1 ? "s" : ""})`}
          </Button>
        )}

        {detectedIngredients.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Detected Ingredients</label>
            <div className="flex flex-wrap gap-2">
              {detectedIngredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  className={`${getIngredientColor(ingredient)} px-3 py-1 text-sm font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => removeIngredient(ingredient)}
                >
                  {ingredient}
                  <X className="w-3 h-3 ml-2" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleFindRecipes}
          className="w-full gradient-button text-primary-foreground text-lg py-6 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Find Recipes
        </Button>
      </div>
    </div>
  )
}
