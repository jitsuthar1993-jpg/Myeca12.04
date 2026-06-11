import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg text-sm font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-brand-700 hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-red-700 hover:shadow-md",
        outline:
          "border border-border bg-background text-foreground shadow-sm hover:border-ring/40 hover:bg-accent hover:text-accent-foreground hover:shadow-md",
        secondary:
          "border border-border bg-secondary text-secondary-foreground shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md",
        ghost: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-brand-600 underline-offset-4 shadow-none hover:text-brand-700 hover:underline",
        success: "bg-success text-white shadow-sm hover:bg-success/90 hover:shadow-md",
        warning: "bg-warning text-white shadow-sm hover:bg-warning/90 hover:shadow-md",
        primary: "bg-primary text-primary-foreground shadow-sm hover:bg-brand-700 hover:shadow-md",
        brand: "bg-brand-600 text-white shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-brand-500/40",
        glass: "border border-border bg-background/90 text-foreground shadow-md backdrop-blur-sm hover:bg-background",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
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
