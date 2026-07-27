import { TRANSLATIONS, translateFinnish } from "./src/lib/i18n/translations-generated";
const keys = [
  "Love to-do -lista 1/3",
  "→ Love to-do -lista seuraavalla sivulla.",
  "Love to-do -lista",
  "Kuvakollaasi 1/2",
  "Kuvakollaasi 2/2",
  "vapaa-ajalla",
];
for (const k of keys) {
  const entry = TRANSLATIONS[k];
  if (!entry) { console.log("MISSING", k); continue; }
  console.log(`FI: ${k}`);
  console.log(`EN: ${translateFinnish(k, "en")}`);
  console.log(`SV: ${translateFinnish(k, "sv")}`);
  console.log("---");
}
