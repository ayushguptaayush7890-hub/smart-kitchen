import { Recipe } from "@/components/recipe-card"

export const recipes: Recipe[] = [
  {
    id: "1",
    name: "Classic Vegetable Omelette",
    image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=500&h=350&fit=crop",
    cookingTime: "15 min",
    calories: 280,
    servings: 2,
    ingredients: ["Eggs", "Tomato", "Onion", "Bell Pepper", "Cheese", "Salt", "Pepper", "Butter"],
    difficulty: "Easy",
    tags: ["Quick", "Protein", "Healthy"]
  },
  {
    id: "2",
    name: "Spicy Tomato Pasta",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&h=350&fit=crop",
    cookingTime: "25 min",
    calories: 420,
    servings: 4,
    ingredients: ["Pasta", "Tomatoes", "Garlic", "Olive Oil", "Basil", "Red Pepper Flakes", "Parmesan"],
    difficulty: "Easy",
    tags: ["Spicy", "Vegetables", "Quick"]
  },
  {
    id: "3",
    name: "Grilled Chicken Salad",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop",
    cookingTime: "30 min",
    calories: 350,
    servings: 2,
    ingredients: ["Chicken Breast", "Mixed Greens", "Cherry Tomatoes", "Cucumber", "Feta Cheese", "Olive Oil"],
    difficulty: "Medium",
    tags: ["Healthy", "Protein", "Vegetables"]
  },
  {
    id: "4",
    name: "Mushroom Risotto",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&h=350&fit=crop",
    cookingTime: "45 min",
    calories: 480,
    servings: 4,
    ingredients: ["Arborio Rice", "Mushrooms", "White Wine", "Parmesan", "Butter", "Onion", "Vegetable Stock"],
    difficulty: "Hard",
    tags: ["Vegetables", "Healthy"]
  },
  {
    id: "5",
    name: "Beef Tacos",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&h=350&fit=crop",
    cookingTime: "20 min",
    calories: 380,
    servings: 4,
    ingredients: ["Ground Beef", "Taco Shells", "Lettuce", "Tomato", "Cheese", "Sour Cream", "Salsa"],
    difficulty: "Easy",
    tags: ["Spicy", "Protein", "Quick"]
  },
  {
    id: "6",
    name: "Thai Green Curry",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500&h=350&fit=crop",
    cookingTime: "35 min",
    calories: 450,
    servings: 4,
    ingredients: ["Chicken", "Coconut Milk", "Green Curry Paste", "Bamboo Shoots", "Thai Basil", "Rice"],
    difficulty: "Medium",
    tags: ["Spicy", "Protein"]
  }
]

export interface RecipeStep {
  step: number
  title: string
  description: string
  duration?: string
  tips?: string
}

export interface RecipeDetails extends Recipe {
  description: string
  prepTime: string
  nutrition: {
    protein: string
    carbs: string
    fat: string
    fiber: string
  }
  steps: RecipeStep[]
}

export const recipeDetails: Record<string, RecipeDetails> = {
  "1": {
    ...recipes[0],
    description: "A fluffy and delicious vegetable omelette packed with fresh vegetables and melted cheese. Perfect for a nutritious breakfast or brunch.",
    prepTime: "5 min",
    nutrition: {
      protein: "18g",
      carbs: "8g",
      fat: "22g",
      fiber: "2g"
    },
    steps: [
      {
        step: 1,
        title: "Prepare Vegetables",
        description: "Wash and dice the tomatoes, onions, and bell peppers into small pieces. Set aside in separate bowls.",
        duration: "3 min",
        tips: "Use a sharp knife for cleaner cuts"
      },
      {
        step: 2,
        title: "Beat the Eggs",
        description: "Crack eggs into a bowl and whisk vigorously with a pinch of salt and pepper until well combined.",
        duration: "2 min",
        tips: "Add a splash of milk for extra fluffiness"
      },
      {
        step: 3,
        title: "Heat the Pan",
        description: "Place a non-stick pan over medium heat and add butter. Let it melt and coat the pan evenly.",
        duration: "2 min",
        tips: "Don't let the butter brown"
      },
      {
        step: 4,
        title: "Sauté Vegetables",
        description: "Add the diced onions first and cook until translucent, then add tomatoes and bell peppers.",
        duration: "4 min",
        tips: "Season vegetables lightly while cooking"
      },
      {
        step: 5,
        title: "Pour Eggs",
        description: "Pour the beaten eggs over the vegetables. Gently tilt the pan to spread evenly.",
        duration: "1 min",
        tips: "Let eggs set slightly before moving"
      },
      {
        step: 6,
        title: "Add Cheese & Fold",
        description: "Sprinkle grated cheese over half the omelette. Once the bottom is set, fold the omelette in half.",
        duration: "2 min",
        tips: "Use a spatula to help fold"
      },
      {
        step: 7,
        title: "Serve",
        description: "Slide the omelette onto a plate. Garnish with fresh herbs and serve immediately.",
        duration: "1 min",
        tips: "Best enjoyed hot!"
      }
    ]
  }
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find(recipe => recipe.id === id)
}

export function getRecipeDetailsById(id: string): RecipeDetails | undefined {
  return recipeDetails[id]
}
