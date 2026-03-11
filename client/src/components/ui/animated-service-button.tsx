import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface AnimatedServiceButtonProps {
  children: ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
  color?: "green" | "blue" | "purple" | "orange" | "red";
}

export default function AnimatedServiceButton({ 
  children, 
  icon: Icon, 
  onClick, 
  href,
  variant = "primary",
  className = "",
  color = "blue"
}: AnimatedServiceButtonProps) {
  const colorClasses = {
    green: {
      primary: "bg-white text-green-600 hover:bg-green-50",
      secondary: "bg-white text-green-600 hover:bg-green-50"
    },
    blue: {
      primary: "bg-white text-blue-600 hover:bg-blue-50",
      secondary: "bg-white text-blue-600 hover:bg-blue-50"
    },
    purple: {
      primary: "bg-white text-purple-600 hover:bg-purple-50",
      secondary: "bg-white text-purple-600 hover:bg-purple-50"
    },
    orange: {
      primary: "bg-white text-orange-600 hover:bg-orange-50",
      secondary: "bg-white text-orange-600 hover:bg-orange-50"
    },
    red: {
      primary: "bg-white text-red-600 hover:bg-red-50",
      secondary: "bg-white text-red-600 hover:bg-red-50"
    }
  };

  const buttonClasses = `${colorClasses[color][variant]} px-8 py-4 text-lg font-semibold transition-all duration-300 ${className}`;

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        y: -2,
      }}
      whileTap={{ 
        scale: 0.98,
        y: 0
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }}
    >
      <Button 
        size="lg" 
        className={buttonClasses}
        onClick={onClick}
      >
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 1 }}
          whileHover={{ 
            x: variant === "primary" ? 2 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          {Icon && (
            <motion.div
              whileHover={{ 
                rotate: variant === "primary" ? 5 : -5,
                scale: 1.1
              }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="w-5 h-5 mr-2" />
            </motion.div>
          )}
          <span>{children}</span>
        </motion.div>
        
        {/* Booking animation - subtle pulse for booking-related buttons */}
        {variant === "primary" && (
          <motion.div
            className="absolute inset-0 rounded-md"
            style={{
              background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`,
              transform: "translateX(-100%)"
            }}
            animate={{
              transform: ["translateX(-100%)", "translateX(100%)"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "linear"
            }}
          />
        )}
      </Button>
    </motion.div>
  );
}