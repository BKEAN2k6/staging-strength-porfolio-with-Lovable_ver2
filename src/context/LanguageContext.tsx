/**
 * LanguageContext — App-wide language state management
 *
 * The language is:
 * - Set when student registers (inherited from class language)
 * - Stored in the student's database record
 * - Locked for the entire app session (no switching)
 */
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

export type Language = "fi" | "sv" | "en";
export const LANGUAGES: Language[] = ["fi", "sv", "en"];
export const DEFAULT_LANGUAGE: Language = "fi";

export const LANGUAGE_LABEL: Record<Language, string> = {
  en: "English",
  fi: "Suomi",
  sv: "Svenska",
};

export const LANGUAGE_FLAG: Record<Language, string> = {
  en: "🇬🇧",
  fi: "🇫🇮",
  sv: "🇸🇪",
};

export function isLanguage(v: unknown): v is Language {
  return v === "en" || v === "fi" || v === "sv";
}

const STORAGE_KEY = "vahvuus.lang";
const STUDENT_STORAGE_KEY = "student_language";

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const a = window.localStorage.getItem(STUDENT_STORAGE_KEY);
  if (isLanguage(a)) return a;
  const b = window.localStorage.getItem(STORAGE_KEY);
  return isLanguage(b) ? b : DEFAULT_LANGUAGE;
}

interface LanguageContextType {
  language: Language;
  /** True while we are still resolving the student's class language. */
  loading: boolean;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(
    () => initialLanguage ?? readStoredLanguage(),
  );

  const setLanguage = useCallback((lang: Language) => {
    if (isLanguage(lang)) setLanguageState(lang);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, language);
      window.localStorage.setItem(STUDENT_STORAGE_KEY, language);
    }
  }, [language]);

  const value = useMemo<LanguageContextType>(
    () => ({ language, loading: false, setLanguage }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
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
