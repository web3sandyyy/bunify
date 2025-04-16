import { useState } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./components/Home";
import "./App.css";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <div className="h-[100dvh] w-full">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen onComplete={handleSplashComplete} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-full bg-background p-4"
          >
            <Home />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
