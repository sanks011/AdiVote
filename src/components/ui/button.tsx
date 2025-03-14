import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#33CC33] disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-[#33CC33] text-white shadow-lg shadow-[#33CC33]/20 hover:bg-[#33CC33]/90 after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:translate-x-[-200%] hover:after:translate-x-[200%] after:transition-transform after:duration-1000",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-500/90 after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:translate-x-[-200%] hover:after:translate-x-[200%] after:transition-transform after:duration-1000",
        outline:
          "border border-[#33CC33] bg-transparent hover:bg-[#33CC33]/10 text-[#33CC33] hover:text-[#33CC33] transition-colors after:content-[''] after:absolute after:inset-0 after:bg-[#33CC33]/5 after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300",
        secondary:
          "bg-[#232323] text-white hover:bg-[#232323]/90 shadow-lg shadow-[#232323]/10 after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:translate-x-[-200%] hover:after:translate-x-[200%] after:transition-transform after:duration-1000",
        ghost:
          "hover:bg-[#33CC33]/10 hover:text-[#33CC33] transition-colors after:content-[''] after:absolute after:inset-0 after:bg-[#33CC33]/5 after:scale-0 hover:after:scale-100 after:origin-center after:transition-transform after:duration-300",
        link: "text-[#33CC33] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8 text-base",
        icon: "h-9 w-9 p-0",
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
    
    // Hover animation variants
    const hoverAnimation = {
      rest: { scale: 1 },
      hover: { scale: 1.02 },
      tap: { scale: 0.98 }
    }

    // Ripple effect component
    const Ripple = () => {
      const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([])

      const addRipple = (event: React.MouseEvent) => {
        const button = event.currentTarget as HTMLButtonElement
        const rect = button.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        setRipples([...ripples, { x, y, id: Date.now() }])
      }

      React.useEffect(() => {
        const timeouts = ripples.map((ripple) =>
          setTimeout(() => {
            setRipples((prevRipples) =>
              prevRipples.filter((r) => r.id !== ripple.id)
            )
          }, 1000)
        )

        return () => {
          timeouts.forEach((timeout) => clearTimeout(timeout))
        }
      }, [ripples])

      return (
        <>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1 }}
              style={{
                position: "absolute",
                left: ripple.x,
                top: ripple.y,
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none"
              }}
            />
          ))}
        </>
      )
    }

    return (
      <motion.div
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={hoverAnimation}
        style={{ display: "inline-block" }}
      >
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          onClick={(e: React.MouseEvent) => {
            if (props.onClick) {
              props.onClick(e)
            }
            const button = e.currentTarget as HTMLButtonElement
            const ripple = button.querySelector(".ripple-container")
            if (ripple) {
              (ripple as any).addRipple(e)
            }
          }}
          {...props}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {props.children}
          </span>
          <div className="ripple-container absolute inset-0 overflow-hidden">
            <Ripple />
          </div>
        </Comp>
      </motion.div>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
