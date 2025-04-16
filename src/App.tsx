import { useState } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-background p-4"
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-contrast mb-8">
              Welcome to Bunify
            </h1>
            <p className="text-lg text-contrast/80">
              Your cute social space is loading...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
