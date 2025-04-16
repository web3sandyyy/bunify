import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import logo1 from "../assets/logo/logo1.png";
import logo2 from "../assets/logo/logo2.png";
import logo3 from "../assets/logo/logo3.png";
import logo4 from "../assets/logo/logo4.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const logos = [logo1, logo2, logo3, logo4];

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (currentLogoIndex < logos.length) {
      timeout = setTimeout(() => {
        setCurrentLogoIndex((prev) => prev + 1);
      }, 500);
    } else {
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onComplete, 500);
      }, 300);
    }

    return () => clearTimeout(timeout);
  }, [currentLogoIndex, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-background"
      animate={{ opacity: isAnimating ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
        <AnimatePresence mode="wait">
          {currentLogoIndex < logos.length && (
            <motion.img
              key={currentLogoIndex}
              src={logos[currentLogoIndex]}
              alt={`Bunify Logo ${currentLogoIndex + 1}`}
              className="absolute inset-0 w-full h-full object-contain"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                duration: 0.4,
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
