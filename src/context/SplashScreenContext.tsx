import React, { createContext, useContext, useState, useEffect } from "react";

interface SplashScreenContextType {
  hasSeenSplash: boolean;
  setHasSeenSplash: (value: boolean) => void;
}

const SplashScreenContext = createContext<SplashScreenContextType | undefined>(
  undefined
);

export function SplashScreenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check localStorage for whether splash screen has been shown before
  const [hasSeenSplash, setHasSeenSplash] = useState<boolean>(() => {
    const saved = localStorage.getItem("hasSeenSplash");
    return saved === "true";
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("hasSeenSplash", hasSeenSplash.toString());
  }, [hasSeenSplash]);

  return (
    <SplashScreenContext.Provider value={{ hasSeenSplash, setHasSeenSplash }}>
      {children}
    </SplashScreenContext.Provider>
  );
}

export function useSplashScreen() {
  const context = useContext(SplashScreenContext);
  if (context === undefined) {
    throw new Error(
      "useSplashScreen must be used within a SplashScreenProvider"
    );
  }
  return context;
}
