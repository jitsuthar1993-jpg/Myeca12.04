import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  colorTheme?: "primary" | "blue" | "green" | "purple" | "orange" | "red" | "teal" | "slate";
}

const colorMap = {
  primary: { range: "bg-primary", thumb: "bg-primary border-primary" },
  blue: { range: "bg-blue-600", thumb: "bg-blue-600 border-blue-700" },
  green: { range: "bg-green-600", thumb: "bg-green-600 border-green-700" },
  purple: { range: "bg-purple-600", thumb: "bg-purple-600 border-purple-700" },
  orange: { range: "bg-orange-600", thumb: "bg-orange-600 border-orange-700" },
  red: { range: "bg-red-600", thumb: "bg-red-600 border-red-700" },
  teal: { range: "bg-teal-600", thumb: "bg-teal-600 border-teal-700" },
  slate: { range: "bg-[#0f172a]", thumb: "bg-[#0f172a] border-[#1e293b]" },
};

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, colorTheme = "slate", ...props }, ref) => {
  const theme = colorMap[colorTheme] || colorMap.slate;

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center py-2 cursor-pointer",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-3.5 w-full grow overflow-hidden rounded-full bg-slate-100 shadow-[inset_0_2px_5px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,1)] border border-slate-200/50">
        <SliderPrimitive.Range className={cn("absolute h-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_1px_1px_rgba(255,255,255,0.3)]", theme.range)} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={cn("block h-7 w-7 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.6)] border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:h-2.5 after:w-2.5 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.5),inset_0_-1px_2px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform", theme.thumb)} />
    </SliderPrimitive.Root>
  );
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
