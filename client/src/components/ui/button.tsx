import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-slate-700 text-white font-semibold shadow-md hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
        destructive:
          "bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
        outline:
          "border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-200",
        secondary:
          "bg-gray-100 text-gray-800 border border-gray-200 shadow-sm hover:bg-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 shadow-none transition-colors duration-200",
        success: "bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
        warning: "bg-orange-600 text-white font-semibold shadow-md hover:bg-orange-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
        primary: "bg-slate-800 text-white font-semibold shadow-md hover:bg-slate-900 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
        glass: "bg-white/90 backdrop-blur-sm text-slate-700 border border-gray-200 shadow-md hover:bg-white hover:-translate-y-0.5 transition-all duration-200",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        sm: "h-8 px-4 text-xs rounded-lg",
        lg: "h-12 px-8 text-base rounded-xl",
        xl: "h-14 px-10 text-lg rounded-xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
