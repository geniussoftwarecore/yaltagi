import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary-blue text-white shadow-lg hover:bg-primary-blue/90 hover:shadow-xl transform hover:-translate-y-0.5",
        cta: "bg-green-cta text-white shadow-lg hover:bg-green-cta/90 hover:shadow-xl transform hover:-translate-y-0.5",
        ghost: "text-gray-700 hover:bg-sky-blue/50 hover:text-primary-blue",
        outline: "border-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        link: "text-primary-blue underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 py-2",
        default: "h-12 px-6 py-3",
        lg: "h-14 px-8 py-4 text-base",
        xl: "h-16 px-10 py-5 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
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