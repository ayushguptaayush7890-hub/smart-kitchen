"use client"

import { useState } from "react"
import { Mic, Send, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RobotChefProps {
  message?: string
  isTalking?: boolean
  showInput?: boolean
  variant?: "light" | "dark"
}

export function RobotChef({ 
  message = "Hello! I'm your AI chef assistant. What would you like to cook today?",
  isTalking = false,
  showInput = true,
  variant = "light"
}: RobotChefProps) {
  const [inputValue, setInputValue] = useState("")

  const bgClass = variant === "dark" ? "bg-card/80" : "bg-secondary/20"
  const bubbleBgClass = variant === "dark" ? "bg-secondary/90" : "bg-secondary"

  return (
    <div className={`rounded-2xl p-6 ${bgClass}`}>
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full gradient-button flex items-center justify-center animate-pulse-glow">
            <Bot className="w-8 h-8 text-primary-foreground" />
          </div>
          {isTalking && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full animate-talking" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-foreground">Chef Bot</h4>
            {isTalking && (
              <span className="text-xs text-accent font-medium">Speaking...</span>
            )}
          </div>
          
          <div className={`${bubbleBgClass} rounded-2xl rounded-tl-none p-4 shadow-sm`}>
            <p className="text-secondary-foreground leading-relaxed">{message}</p>
          </div>
        </div>
      </div>

      {showInput && (
        <div className="mt-4 flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask the chef anything..."
              className="pr-10 bg-card border-border"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <Button className="gradient-button text-primary-foreground">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
