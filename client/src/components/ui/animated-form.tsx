import * as React from "react"
import { m, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const MotionDiv = m.div as any
const MotionForm = m.form as any

interface AnimatedFormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  success?: string
  isLoading?: boolean
  required?: boolean
  children: React.ReactNode
}

const AnimatedFormField = React.forwardRef<HTMLDivElement, AnimatedFormFieldProps>(
  ({ className, label, error, success, isLoading, required, children, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)

    return (
      <MotionDiv
        ref={ref}
        className={cn("space-y-2", className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        {...props}
      >
        {/* Animated Label */}
        {label && (
          <m.label
            className={cn(
              "block text-sm font-medium transition-colors duration-200",
              isFocused ? "text-blue-600" : "text-gray-700",
              error && "text-red-600",
              success && "text-green-600"
            )}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {label}
            {required && (
              <m.span
                className="text-red-500 ml-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
              >
                *
              </m.span>
            )}
          </m.label>
        )}

        {/* Form Field Container */}
        <m.div
          className="relative"
          onFocus={handleFocus}
          onBlur={handleBlur}
          whileHover={{ scale: 1.005 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {children}
          
          {/* Loading Indicator */}
          <AnimatePresence>
            {isLoading && (
              <m.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              </m.div>
            )}
          </AnimatePresence>

          {/* Success Indicator */}
          <AnimatePresence>
            {success && !isLoading && (
              <m.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                initial={{ opacity: 0, scale: 0, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
              </m.div>
            )}
          </AnimatePresence>

          {/* Error Indicator */}
          <AnimatePresence>
            {error && !isLoading && (
              <m.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                initial={{ opacity: 0, scale: 0, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <AlertCircle className="h-4 w-4 text-red-500" />
              </m.div>
            )}
          </AnimatePresence>
        </m.div>

        {/* Animated Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <m.div
              key="error"
              className="flex items-center space-x-2 text-sm text-red-600"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </m.div>
          )}
          
          {success && !error && (
            <m.div
              key="success"
              className="flex items-center space-x-2 text-sm text-green-600"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>{success}</span>
            </m.div>
          )}
        </AnimatePresence>
      </MotionDiv>
    )
  }
)
AnimatedFormField.displayName = "AnimatedFormField"

interface AnimatedFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

const AnimatedForm = React.forwardRef<HTMLFormElement, AnimatedFormProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <MotionForm
        ref={ref}
        className={cn("space-y-6", className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        {...props}
      >
        {children}
      </MotionForm>
    )
  }
)
AnimatedForm.displayName = "AnimatedForm"

export { AnimatedForm, AnimatedFormField }
