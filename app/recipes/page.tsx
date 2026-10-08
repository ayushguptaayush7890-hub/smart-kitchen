import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { RecipeCard, type Recipe } from "@/components/recipe-card"
import { API_BASE_URL } from "@/lib/api"
import { Search, Filter, ChefHat, Video } from "lucide-react"
import Link from "next/link"

interface RecipesPageProps {
  searchParams?: Promise<{
    ingredients?: string
    tip?: string
  }>
}

async function fetchRecipes(
  searchParamsPromise?: RecipesPageProps["searchParams"]
): Promise<Recipe[]> {
  const searchParams = searchParamsPromise ? await searchParamsPromise : undefined
  const queryIngredients = searchParams?.ingredients

  try {
    if (queryIngredients) {
      const ingredients = queryIngredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean)

      if (ingredients.length === 0) {
        return []
      }

      const res = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients }),
        // Disable Next.js caching so searches are always fresh
        cache: "no-store",
      })

      if (!res.ok) {
        console.error("Failed to search recipes from backend")
        return []
      }

      const data = await res.json()
      let mapped = mapBackendRecipesToCards(data)
      // Shuffle so that repeated searches with the same
      // ingredients can still surface different recipes.
      mapped = mapped.sort(() => Math.random() - 0.5)
      return mapped.slice(0, 10)
    }

    const res = await fetch(`${API_BASE_URL}/recipes`, {
      cache: "no-store",
    })

    if (!res.ok) {
      console.error("Failed to load recipes from backend")
      return []
    }

    const data = await res.json()
    let mapped = mapBackendRecipesToCards(data)
    mapped = mapped.sort(() => Math.random() - 0.5)
    return mapped.slice(0, 10)
  } catch (error) {
    console.error("Error fetching recipes from backend:", error)
    return []
  }
}

function mapBackendRecipesToCards(data: any[]): Recipe[] {
  return data.map((item) => {
    const ingredients: string[] =
      typeof item.ingredients === "string"
        ? item.ingredients
            .split("|")
            .map((i: string) => i.trim())
            .filter(Boolean)
        : []

    const difficultyRaw = String(item.difficulty || "Easy")
    const allowedDifficulties = ["Easy", "Medium", "Hard"] as const
    const normalizedDifficulty =
      allowedDifficulties.find((d) => d.toLowerCase() === difficultyRaw.toLowerCase()) ?? "Easy"

    // Prefer the CSV image (already points to Unsplash with different queries),
    // and fall back to a generic food photo if missing.
    const backendImage = String(item.image || "").trim()
    const cacheBustedBackendImage = backendImage
      ? `${backendImage}${backendImage.includes("?") ? "&" : "?"}sig=${encodeURIComponent(String(item.id ?? ""))}`
      : ""
    const fallbackImage =
      "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=500&h=350&fit=crop"

    return {
      id: String(item.id),
      name: String(item.name ?? "Untitled Recipe"),
      image: cacheBustedBackendImage || fallbackImage,
      cookingTime: String(item.cooking_time ?? item.cookingTime ?? "N/A"),
      calories: Number(item.calories ?? 0),
      servings: Number(item.servings ?? 1),
      ingredients,
      difficulty: normalizedDifficulty,
      // Simple tags derived from difficulty and ingredient count
      tags: [
        normalizedDifficulty,
        ingredients.length <= 5 ? "Quick" : "Protein",
        ingredients.length >= 3 ? "Healthy" : "Vegetables",
      ],
    }
  })
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const resolved = searchParams ? await searchParams : undefined
  const recipes = await fetchRecipes(searchParams)
  const showAiReviewHint = resolved?.tip === "aireview"

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showAiReviewHint && (
            <div className="mb-8 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">CookMate AI Dish Review</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Koi bhi recipe card kholo — detail page par neeche scroll karke{" "}
                  <span className="text-foreground font-medium">Upload your dish</span> se video bhejo aur AI score dekho.
                </p>
              </div>
              <Link
                href="/recipes"
                className="text-sm font-medium text-primary hover:underline shrink-0 whitespace-nowrap"
              >
                Hint band karo
              </Link>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-button flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Recipe <span className="text-primary">Suggestions</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Based on your ingredients, here are some delicious recipes you can make
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search recipes..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground hover:bg-muted transition-colors">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["All", "Quick", "Healthy", "Spicy", "Vegetarian", "Protein"].map((tag) => (
              <button
                key={tag}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tag === "All"
                    ? "gradient-button text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Recipe Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 rounded-xl bg-card border border-border text-foreground hover:bg-muted transition-colors font-medium">
              Load More Recipes
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
