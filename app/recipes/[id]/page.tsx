import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { RecipeAIReviewSection } from "@/components/review/RecipeAIReviewSection"
import { API_BASE_URL } from "@/lib/api"
import { Clock, Flame, Users, ChefHat, Utensils, Tv, ArrowLeft, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PageProps {
  params: Promise<{ id: string }>
}

async function fetchRecipe(id: string) {
  const res = await fetch(`${API_BASE_URL}/recipe/${id}`, { cache: "no-store" })
  if (!res.ok) {
    return null
  }
  return res.json()
}

export default async function RecipeDetailsPage({ params }: PageProps) {
  const { id } = await params
  const recipe = await fetchRecipe(id)

  if (!recipe) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Recipe not found</h1>
          <Link href="/recipes" className="text-primary hover:underline mt-4 inline-block">
            Back to recipes
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const ingredients: string[] =
    typeof recipe.ingredients === "string"
      ? recipe.ingredients
          .split("|")
          .map((i: string) => i.trim())
          .filter(Boolean)
      : []

  const steps: string[] =
    typeof recipe.steps === "string"
      ? recipe.steps
          .split("|")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : []

  const difficultyRaw = String(recipe.difficulty || "Easy")
  const difficultyColor: Record<string, string> = {
    Easy: "bg-accent/20 text-accent",
    Medium: "bg-secondary text-secondary-foreground",
    Hard: "bg-destructive/20 text-destructive",
  }
  const normalizedDifficulty =
    Object.keys(difficultyColor).find(
      (d) => d.toLowerCase() === difficultyRaw.toLowerCase()
    ) ?? "Easy"

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link 
            href="/recipes"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to recipes
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Side - Image and Info */}
            <div>
              <div className="relative rounded-3xl overflow-hidden shadow-xl mb-6">
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className={`${difficultyColor[normalizedDifficulty]} font-medium text-sm px-3 py-1`}>
                    {normalizedDifficulty}
                  </Badge>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {recipe.name}
              </h1>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-card rounded-2xl p-4 text-center border border-border">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Cook Time</p>
                  <p className="font-semibold text-foreground">
                    {recipe.cooking_time ?? recipe.cookingTime ?? "N/A"}
                  </p>
                </div>
                <div className="bg-card rounded-2xl p-4 text-center border border-border">
                  <Flame className="w-6 h-6 mx-auto mb-2 text-destructive" />
                  <p className="text-sm text-muted-foreground">Calories</p>
                  <p className="font-semibold text-foreground">
                    {recipe.calories ? `${recipe.calories} cal` : "N/A"}
                  </p>
                </div>
                <div className="bg-card rounded-2xl p-4 text-center border border-border">
                  <Users className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <p className="text-sm text-muted-foreground">Servings</p>
                  <p className="font-semibold text-foreground">
                    {recipe.servings ?? "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Ingredients and Mode Selection */}
            <div>
              {/* Ingredients */}
              <div className="bg-card rounded-2xl p-6 border border-border mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  Ingredients
                </h3>
                <ul className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cooking Steps Preview */}
              {steps.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Cooking Steps ({steps.length} steps)
                  </h3>
                  <div className="space-y-3">
                    {steps.slice(0, 3).map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full gradient-button flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="font-medium text-foreground">{step}</p>
                      </div>
                    ))}
                    {steps.length > 3 && (
                      <p className="text-sm text-muted-foreground ml-11">
                        +{steps.length - 3} more steps...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Mode Selection */}
              <div className="bg-muted rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Choose Your Cooking Mode
                </h3>
                <div className="space-y-4">
                  <Link href={`/cooking/${id}`}>
                    <Button className="w-full gradient-button text-primary-foreground py-6 text-lg justify-start gap-4 hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                        <ChefHat className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Normal Cooking Guide</p>
                        <p className="text-sm opacity-80">Step-by-step instructions</p>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href={`/virtual-kitchen?recipe=${id}`}>
                    <Button className="w-full bg-foreground text-background py-6 text-lg justify-start gap-4 hover:bg-foreground/90 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-background/20 flex items-center justify-center">
                        <Tv className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Virtual Kitchen Experience</p>
                        <p className="text-sm opacity-80">Cook with AI Robot Chef</p>
                      </div>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <RecipeAIReviewSection
            recipeId={id}
            recipeName={String(recipe.name)}
            ingredients={ingredients}
            steps={steps}
          />
        </div>
      </section>

      <Footer />
    </main>
  )
}
