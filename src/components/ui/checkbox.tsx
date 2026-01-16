import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded border border-slate-300 bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          "checked:bg-slate-900 checked:border-slate-900",
          "appearance-none cursor-pointer",
          className
        )}
        {...props}
      />
      <Check className="absolute left-0.5 top-0.5 h-3 w-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" />
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
