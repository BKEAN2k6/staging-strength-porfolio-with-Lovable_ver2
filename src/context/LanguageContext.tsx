/**
 * LanguageContext — App-wide language state management
 * 
 * The language is:
 * - Set when student registers (inherited from class language)
 * - Stored in the student's database record
 * - Locked for the entire app session (no switching)
 */
import { createContext, useContext, ReactNode, useState, useEffect } from "react";

export type Language = "fi" | "sv" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export function LanguageProvider({
  children,
  initialLanguage = "fi",
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  useEffect(() => {
    // When component mounts, check if there's a stored language preference
    // (This will be populated when student registers with a class code)
    const storedLanguage = localStorage.getItem("student_language") as Language | null;
    if (storedLanguage && ["fi", "sv", "en"].includes(storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use language context in any component
 * Usage: const { language, setLanguage } = useLanguage();
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
