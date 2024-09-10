import * as React from "react"

import { cn } from "../../lib/utils";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (<div
      className={cn(
        "relative flex w-full rounded-md border-input bg-background",
        className
      )}
    >
      <MagnifyingGlassIcon
        className="absolute pointer-events-none w-6 h-6 p-2 box-content text-gray-500"
      />
      <input
        type={type}
        className={cn(
          "flex h-10 w-full border border-input bg-background p-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>)
  }
)
SearchInput.displayName = "Input"

export { SearchInput }
