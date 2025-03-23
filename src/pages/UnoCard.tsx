import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface UnoCardProps {
  couleur: "red" | "blue" | "green" | "yellow" | "black";
  valeur: string;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
}

export const UnoCard = ({
  couleur,
  valeur,
  onClick,
  isPlayable = true,
  className,
}: UnoCardProps) => {
  const baseCardStyle =
    "w-24 h-36 rounded-xl flex items-center justify-center text-white font-bold text-2xl select-none cursor-pointer transition-transform duration-200 shadow-lg";

  const couleurClasses = {
    red: "bg-uno-red",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    black: "bg-gray-900",
  };

  return (
    <motion.div
      whileHover={isPlayable ? { y: -8 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      className={cn(
        baseCardStyle,
        couleurClasses[couleur],
        !isPlayable && "opacity-75 cursor-not-allowed",
        className
      )}
      onClick={isPlayable ? onClick : undefined}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute inset-2 border-2 border-white/20 rounded-lg" />
        <span className="text-xl">{valeur}</span>
      </div>
    </motion.div>
  );
};
