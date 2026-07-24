// Re-export shim so components can import from "@/context/LanguageContext".
// The real implementation lives in "@/lib/i18n" to keep a single source
// of truth for language state, storage, and UI/content translators.
export {
  LanguageProvider,
  useLanguage,
  isLanguage,
  LANGUAGES,
  LANGUAGE_LABEL,
  LANGUAGE_FLAG,
  DEFAULT_LANGUAGE,
  type Language,
} from "@/lib/i18n";
