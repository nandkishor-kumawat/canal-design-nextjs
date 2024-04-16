import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        type="text"
        className={cn(
          "w-20 px-0 text-center bg-slate-800 rounded-none border-0 border-b-2 border-b-[rgb(122 136 164)] focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-2 focus:border-b-[#00ff00]",
          className
        )}
        ref={ref}
        onInput={e => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9.]/g, '')}
        {...props}
        autoComplete="off"
      />
    )
  }
)

NumberInput.displayName = "NumberInput"

export { Input, NumberInput }
