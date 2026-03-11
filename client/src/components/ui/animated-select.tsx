import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

const AnimatedSelect = SelectPrimitive.Root

const AnimatedSelectGroup = SelectPrimitive.Group

const AnimatedSelectValue = SelectPrimitive.Value

const AnimatedSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileFocus={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm transition-all duration-300 ease-out",
          "hover:border-blue-400 hover:shadow-sm",
          "focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          "data-[state=open]:border-blue-500 data-[state=open]:ring-4 data-[state=open]:ring-blue-100",
          "data-[placeholder]:text-gray-400",
          "[&>span]:line-clamp-1",
          className
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ChevronDown className="h-4 w-4 opacity-50" />
          </motion.div>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    </motion.div>
  )
})
AnimatedSelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const AnimatedSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-lg border bg-white text-gray-900 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-2",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
AnimatedSelectContent.displayName = SelectPrimitive.Content.displayName

const AnimatedSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <motion.div
    whileHover={{ x: 4, backgroundColor: "#f3f4f6" }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-md py-2.5 pl-10 pr-3 text-sm outline-none transition-colors duration-150",
        "focus:bg-blue-50 focus:text-blue-900 focus:outline-none",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Check className="h-4 w-4 text-blue-600" />
          </motion.div>
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  </motion.div>
))
AnimatedSelectItem.displayName = SelectPrimitive.Item.displayName

const AnimatedSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
    {...props}
  />
))
AnimatedSelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  AnimatedSelect,
  AnimatedSelectGroup,
  AnimatedSelectValue,
  AnimatedSelectTrigger,
  AnimatedSelectContent,
  AnimatedSelectItem,
  AnimatedSelectSeparator,
}