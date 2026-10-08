import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Bot, ChefHat, Heart, Sparkles, Users, Globe } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-button flex items-center justify-center">
              <ChefHat className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              About <span className="text-primary">CookMate AI</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We are revolutionizing home cooking with AI-powered assistance, making delicious 
              meals accessible to everyone regardless of their culinary experience.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                At CookMate AI, we believe that everyone deserves to enjoy home-cooked meals. 
                Our mission is to eliminate the barriers to cooking by providing intelligent, 
                step-by-step guidance that adapts to your skill level and available ingredients.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you are a beginner learning to cook your first dish or an experienced chef 
                looking for inspiration, our AI-powered platform is designed to make your 
                cooking journey enjoyable and successful.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 border border-border shadow-lg">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Users, value: "50K+", label: "Active Users" },
                  { icon: ChefHat, value: "10K+", label: "Recipes" },
                  { icon: Globe, value: "120+", label: "Countries" },
                  { icon: Heart, value: "4.9", label: "User Rating" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              What Makes Us <span className="text-primary">Different</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "AI-Powered Recognition",
                  description: "Upload a photo of your ingredients and our AI instantly identifies them, suggesting perfect recipes you can make."
                },
                {
                  icon: Bot,
                  title: "Virtual Robot Chef",
                  description: "Experience cooking in an immersive virtual kitchen with our friendly AI chef guiding you through every step."
                },
                {
                  icon: ChefHat,
                  title: "Personalized Guidance",
                  description: "Get step-by-step instructions with timers, tips, and real-time assistance tailored to your cooking style."
                }
              ].map((feature, index) => (
                <div key={index} className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 rounded-2xl gradient-button flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Built with <span className="text-destructive">Love</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              CookMate AI is developed by a passionate team of food enthusiasts, AI engineers, 
              and designers who believe in making cooking accessible and enjoyable for everyone.
            </p>
          </div>

          {/* CTA */}
          <div className="gradient-hero rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Your Cooking?
            </h2>
            <p className="text-foreground/80 mb-8 max-w-xl mx-auto">
              Join thousands of home cooks who are already creating delicious meals with CookMate AI.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl font-semibold text-lg hover:bg-foreground/90 transition-colors"
            >
              <ChefHat className="w-5 h-5" />
              Start Cooking Now
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
