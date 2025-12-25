import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  children, 
  className, 
  variant = "primary", 
  size = "md",
  ...props 
}, ref) => {
  const baseStyles = "font-display font-bold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-cyan-400 text-background hover:shadow-lg hover:shadow-primary/50 hover:scale-105",
    secondary: "bg-gradient-to-r from-secondary to-orange-600 text-white hover:shadow-lg hover:shadow-secondary/50 hover:scale-105",
    accent: "bg-gradient-to-r from-accent to-yellow-400 text-background hover:shadow-lg hover:shadow-accent/50 hover:scale-105",
    outline: "border-2 border-primary text-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/30",
    ghost: "text-primary hover:bg-primary/10"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };
  
  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;