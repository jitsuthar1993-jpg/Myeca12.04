import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-gray-100 bg-white text-gray-900 shadow-lg shadow-gray-500/5 transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/10 hover:-translate-y-1",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-xl font-bold leading-tight tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-gray-600", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Premium Card Variants
const CardPremium = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-gray-100 bg-white text-gray-900 shadow-xl shadow-gray-500/10 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-500/15 hover:-translate-y-2 relative overflow-hidden",
      className
    )}
    {...props}
  />
))
CardPremium.displayName = "CardPremium"

const CardGlass = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl bg-white/70 backdrop-blur-lg border border-white/50 text-gray-900 shadow-xl shadow-gray-500/10 transition-all duration-300 hover:bg-white/80 hover:-translate-y-1",
      className
    )}
    {...props}
  />
))
CardGlass.displayName = "CardGlass"

const CardPopular = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border-2 border-indigo-200 bg-white text-gray-900 shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-2 relative overflow-hidden",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-50/50 before:to-purple-50/50 before:pointer-events-none",
      className
    )}
    {...props}
  />
))
CardPopular.displayName = "CardPopular"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardPremium,
  CardGlass,
  CardPopular
}
