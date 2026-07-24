/**
 * Vahvuusseikkailu — Complete i18n Strings (FI/SV/EN)
 * 
 * All UI chrome and recurring labels in all 3 languages.
 * Screen body content is handled separately via screen-content.tsx and your Excel workbook.
 * 
 * CRITICAL: No fallback. Each language is atomic and complete.
 */

export type Language = "fi" | "sv" | "en";

export const STRINGS: Record<string, Record<Language, string>> = {
  // ============================================================================
  // COMMON / CHROME
  // ============================================================================

  "common.loading": {
    fi: "Ladataan…",
    sv: "Laddar…",
    en: "Loading…",
  },

  "common.save.idle": {
    fi: "Valmis",
    sv: "Klar",
    en: "Ready",
  },

  "common.save.saving": {
    fi: "Tallennetaan…",
    sv: "Sparar…",
    en: "Saving…",
  },

  "common.save.saved": {
    fi: "Tallennettu",
    sv: "Sparad",
    en: "Saved",
  },

  "common.save.error": {
    fi: "Tallennus epäonnistui",
    sv: "Sparning misslyckades",
    en: "Save failed",
  },

  "common.previous": {
    fi: "Edellinen",
    sv: "Föregående",
    en: "Previous",
  },

  "common.next": {
    fi: "Seuraava",
    sv: "Nästa",
    en: "Next",
  },

  "common.continue": {
    fi: "Jatka",
    sv: "Fortsätt",
    en: "Continue",
  },

  "common.back": {
    fi: "Takaisin",
    sv: "Tillbaka",
    en: "Back",
  },

  "common.logout": {
    fi: "Kirjaudu ulos",
    sv: "Logga ut",
    en: "Log out",
  },

  "common.login": {
    fi: "Kirjaudu sisään",
    sv: "Logga in",
    en: "Log in",
  },

  "common.signup": {
    fi: "Rekisteröidy",
    sv: "Registrera",
    en: "Sign up",
  },

  "common.email": {
    fi: "Sähköposti",
    sv: "E-post",
    en: "Email",
  },

  "common.password": {
    fi: "Salasana",
    sv: "Lösenord",
    en: "Password",
  },

  "common.name": {
    fi: "Nimi",
    sv: "Namn",
    en: "Name",
  },

  "common.copy": {
    fi: "Kopioi",
    sv: "Kopiera",
    en: "Copy",
  },

  "common.refresh": {
    fi: "Päivitä",
    sv: "Uppdatera",
    en: "Refresh",
  },

  "common.print": {
    fi: "Tulosta",
    sv: "Skriv ut",
    en: "Print",
  },

  "common.locked": {
    fi: "Lukittu",
    sv: "Låst",
    en: "Locked",
  },

  // ============================================================================
  // APP SHELL
  // ============================================================================

  "app.title": {
    fi: "Vahvuusseikkailu",
    sv: "Styrkeabentyr",
    en: "Strength Adventure",
  },

  "app.tagline": {
    fi: "Huomaa hyvä! — vahvuusportfolio lukiolaiselle",
    sv: "Se det goda! — styrkeportfölj för gymnasiet",
    en: "See the Good! — strength portfolio for upper secondary students",
  },

  "app.screenOfTotal": {
    fi: "Näyttö {n} / {total}",
    sv: "Skärm {n} / {total}",
    en: "Screen {n} / {total}",
  },

  "app.screensSuffix": {
    fi: "näyttöä",
    sv: "skärmar",
    en: "screens",
  },

  "sidebar.general": {
    fi: "Yleiset",
    sv: "Allmänt",
    en: "General",
  },

  "sidebar.modules": {
    fi: "Moduulit",
    sv: "Moduler",
    en: "Modules",
  },

  "sidebar.worldmap": {
    fi: "Maailmankartta",
    sv: "Världskarta",
    en: "World map",
  },

  "nav.finishFirst": {
    fi: "Täytä ensin tämän sivun tehtävä, niin pääset jatkamaan.",
    sv: "Fyll först i denna sidas uppgift för att fortsätta.",
    en: "Complete this screen's task first to continue.",
  },

  // ============================================================================
  // WORLD MAP
  // ============================================================================

  "worldmap.title": {
    fi: "Maailmankartta",
    sv: "Världskarta",
    en: "World map",
  },

  "worldmap.subtitle": {
    fi: "Valitse maailma tai jatka siitä, mihin jäit.",
    sv: "Välj en värld eller fortsätt där du lämnade av.",
    en: "Choose a world or resume where you left off.",
  },

  "worldmap.resumeHeader": {
    fi: "Jatka seikkailua",
    sv: "Fortsätt äventyret",
    en: "Continue your adventure",
  },

  "worldmap.resumeAt": {
    fi: "{world} — näyttö {n}",
    sv: "{world} — skärm {n}",
    en: "{world} — screen {n}",
  },

  // ============================================================================
  // AUTH — LANDING & LOGIN
  // ============================================================================

  "auth.landing.loginBtn": {
    fi: "Kirjaudu sisään",
    sv: "Logga in",
    en: "Log in",
  },

  "auth.landing.signupBtn": {
    fi: "Luo opiskelija-tunnus",
    sv: "Skapa studentkonto",
    en: "Create student account",
  },

  "auth.idle.expired": {
    fi: "Istunto vanheni — kirjaudu sisään uudelleen.",
    sv: "Sessionen gick ut — logga in igen.",
    en: "Session expired — log in again.",
  },

  "auth.login.title": {
    fi: "Kirjaudu sisään",
    sv: "Logga in",
    en: "Log in",
  },

  "auth.login.submit": {
    fi: "Kirjaudu",
    sv: "Logga in",
    en: "Log in",
  },

  "auth.login.busy": {
    fi: "Hetki…",
    sv: "Vänta…",
    en: "One moment…",
  },

  "auth.login.wrong": {
    fi: "Sähköposti tai salasana ei ole oikea",
    sv: "E-post eller lösenord är inte korrekt",
    en: "Email or password is incorrect",
  },

  "auth.login.newAccount": {
    fi: "Luo uusi tunnus",
    sv: "Skapa nytt konto",
    en: "Create new account",
  },

  // ============================================================================
  // AUTH — STUDENT SIGNUP
  // ============================================================================

  "auth.student.title": {
    fi: "Luo opiskelija-tunnus",
    sv: "Skapa studentkonto",
    en: "Create student account",
  },

  "auth.student.subtitle": {
    fi: "Liity seikkailuun luokan koodilla",
    sv: "Gå med i äventyret med klassens kod",
    en: "Join the adventure with your class code",
  },

  "auth.student.submit": {
    fi: "Rekisteröidy opiskelijana",
    sv: "Registrera som student",
    en: "Register as student",
  },

  "auth.student.emailPh": {
    fi: "etunimi.sukunimi@koulu.fi",
    sv: "fornamn.efternamn@skola.se",
    en: "firstname.lastname@school.com",
  },

  "auth.student.passwordPh": {
    fi: "Luo vahva salasana",
    sv: "Skapa ett starkt lösenord",
    en: "Create a strong password",
  },

  "auth.student.passwordHint": {
    fi: "Vähintään 8 merkkiä. Sisällytä kirjaimia, numeroita ja erikoismerkkejä.",
    sv: "Minst 8 tecken. Inkludera bokstäver, siffror och specialtecken.",
    en: "At least 8 characters. Include letters, numbers, and special characters.",
  },

  "auth.student.nameLabel": {
    fi: "Nimi (Etunimi Sukunimi)",
    sv: "Namn (Förnamn Efternamn)",
    en: "Name (First Last)",
  },

  "auth.student.namePh": {
    fi: "esim. Anni Paatsila",
    sv: "t.ex. Anna Svensson",
    en: "e.g. Anna Johnson",
  },

  "auth.student.nameHint": {
    fi: "Kirjoita sinun etunimi ja sukunimi",
    sv: "Skriv ditt för- och efternamn",
    en: "Write your first and last name",
  },

  "auth.student.codeLabel": {
    fi: "Luokan koodi",
    sv: "Klassens kod",
    en: "Class code",
  },

  "auth.student.codePh": {
    fi: "esim. ABC123",
    sv: "t.ex. ABC123",
    en: "e.g. ABC123",
  },

  "auth.student.err.emailInvalid": {
    fi: "Sähköposti ei ole voimassa.",
    sv: "E-postadressen är inte giltig.",
    en: "Email is not valid.",
  },

  "auth.student.err.passwordShort": {
    fi: "Salasana pitää olla vähintään 8 merkkiä.",
    sv: "Lösenordet måste vara minst 8 tecken.",
    en: "Password must be at least 8 characters.",
  },

  "auth.student.err.nameMissing": {
    fi: "Anna nimesi.",
    sv: "Ange ditt namn.",
    en: "Enter your name.",
  },

  "auth.student.err.codeMissing": {
    fi: "Anna luokan koodi.",
    sv: "Ange klassens kod.",
    en: "Enter class code.",
  },

  "auth.student.err.emailTaken": {
    fi: "Tällä sähköpostilla on jo tunnus.",
    sv: "Det finns redan ett konto för denna e-post.",
    en: "There is already an account for this email.",
  },

  "auth.student.err.codeInvalid": {
    fi: "Koodi ei ole voimassa. Tarkista opettajaltasi.",
    sv: "Koden är inte giltig. Kontrollera med din lärare.",
    en: "Code is not valid. Check with your teacher.",
  },

  // ============================================================================
  // AUTH — TEACHER SIGNUP
  // ============================================================================

  "auth.teacher.title": {
    fi: "Opettajille",
    sv: "För lärare",
    en: "For teachers",
  },

  "auth.teacher.school": {
    fi: "Koulun nimi",
    sv: "Skolans namn",
    en: "School name",
  },

  "auth.teacher.schoolPh": {
    fi: "esim. Espoo High School",
    sv: "t.ex. Espoo Gymnasium",
    en: "e.g. Espoo High School",
  },

  "auth.teacher.teacherCode": {
    fi: "Opettajan koodi",
    sv: "Lärarens kod",
    en: "Teacher code",
  },

  "auth.teacher.teacherCodePh": {
    fi: "esim. OPETTAJA-2026",
    sv: "t.ex. LARARE-2026",
    en: "e.g. TEACHER-2026",
  },

  "auth.teacher.submit": {
    fi: "Rekisteröidy opettajana",
    sv: "Registrera som lärare",
    en: "Register as teacher",
  },

  "auth.teacher.err.badCode": {
    fi: "Opettajan koodi ei kelpaa. Pyydä koodi koulustasi.",
    sv: "Lärarens kod är inte giltig. Begär koden från din skola.",
    en: "Teacher code is not valid. Request code from your school.",
  },

  "auth.teacher.hasAccount": {
    fi: "Onko sinulla jo opettajatunnus?",
    sv: "Har du redan ett lärarkonto?",
    en: "Already have a teacher account?",
  },

  // ============================================================================
  // JOIN A CLASS
  // ============================================================================

  "join.title": {
    fi: "Liity yhteisöön",
    sv: "Gå med i gruppen",
    en: "Join group",
  },

  "join.subtitle": {
    fi: "Syötä opettajaltasi saamasi koodi.",
    sv: "Ange koden du fick från din lärare.",
    en: "Enter the code you received from your teacher.",
  },

  "join.codeLabel": {
    fi: "Luokan koodi",
    sv: "Klassens kod",
    en: "Class code",
  },

  "join.codePh": {
    fi: "esim. 9A-VAHVUUS-25",
    sv: "t.ex. 9A-STYRKA-25",
    en: "e.g. 9A-STRENGTH-25",
  },

  "join.submit": {
    fi: "Liity luokkaan",
    sv: "Gå med i klassen",
    en: "Join class",
  },

  "join.busy": {
    fi: "Liitytään…",
    sv: "Går med…",
    en: "Joining…",
  },

  "join.hint": {
    fi: "Et voi aloittaa seikkailua ennen kuin olet liittynyt opettajasi luokkaan.",
    sv: "Du kan inte börja äventyret förrän du har gått med i din lärarens klass.",
    en: "You cannot start the adventure until you have joined your teacher's class.",
  },

  "join.err.notFound": {
    fi: "Koodia ei löytynyt. Tarkista koodi opettajaltasi.",
    sv: "Koden hittades inte. Kontrollera koden hos din lärare.",
    en: "Code not found. Check the code with your teacher.",
  },

  "join.success": {
    fi: "Olet liittynyt luokkaan: {name}",
    sv: "Du har gått med i klassen: {name}",
    en: "You have joined the class: {name}",
  },

  // ============================================================================
  // TEACHER DASHBOARD
  // ============================================================================

  "teacher.title": {
    fi: "Opettajan näkymä",
    sv: "Lärarens vy",
    en: "Teacher view",
  },

  "teacher.create.title": {
    fi: "Luo uusi luokka",
    sv: "Skapa ny klass",
    en: "Create new class",
  },

  "teacher.create.hint": {
    fi: "Luokan koodin avulla oppilaat liittyvät luokkaan.",
    sv: "Med klassens kod kan elever gå med i klassen.",
    en: "With the class code, students can join the class.",
  },

  "teacher.create.nameLabel": {
    fi: "Luokan nimi",
    sv: "Klassens namn",
    en: "Class name",
  },

  "teacher.create.namePh": {
    fi: "esim. 9A — Vahvuusryhmä",
    sv: "t.ex. 9A — Styrkagrupp",
    en: "e.g. 9A — Strength Group",
  },

  "teacher.create.langLabel": {
    fi: "Luokan kieli",
    sv: "Klassens språk",
    en: "Class language",
  },

  "teacher.create.langHint": {
    fi: "Oppilaat näkevät sovelluksen tällä kielellä liittyessään luokkaan tällä koodilla.",
    sv: "Elever kommer att se programmet på detta språk när de går med i klassen med denna kod.",
    en: "Students will see the app in this language when they join the class with this code.",
  },

  "teacher.create.submit": {
    fi: "Luo luokka",
    sv: "Skapa klass",
    en: "Create class",
  },

  "teacher.create.busy": {
    fi: "Luodaan…",
    sv: "Skapar…",
    en: "Creating…",
  },

  "teacher.create.success": {
    fi: "Luokka luotu.",
    sv: "Klass skapad.",
    en: "Class created.",
  },

  "teacher.mine": {
    fi: "Luokkani ({n})",
    sv: "Mina klasser ({n})",
    en: "My classes ({n})",
  },

  "teacher.mine.empty": {
    fi: "Ei vielä luokkia. Luo ensimmäinen yllä.",
    sv: "Inga klasser ännu. Skapa den första ovan.",
    en: "No classes yet. Create the first one above.",
  },

  "teacher.classCard.class": {
    fi: "Luokka",
    sv: "Klass",
    en: "Class",
  },

  "teacher.classCard.joinCode": {
    fi: "Liittymiskoodi",
    sv: "Inträdescode",
    en: "Join code",
  },

  "teacher.classCard.language": {
    fi: "Kieli",
    sv: "Språk",
    en: "Language",
  },

  "teacher.classCard.students": {
    fi: "Oppilaita",
    sv: "Elever",
    en: "Students",
  },

  "teacher.classCard.avg": {
    fi: "Keskimäärin",
    sv: "Genomsnitt",
    en: "Average",
  },

  "teacher.classCard.screensAvg": {
    fi: "Näytöt täytetty (ka.)",
    sv: "Skärmar ifyllda (genomsn.)",
    en: "Screens completed (avg.)",
  },

  "teacher.classCard.lastActive": {
    fi: "Viimeksi aktiivinen",
    sv: "Senast aktiv",
    en: "Last active",
  },

  "teacher.classCard.sort": {
    fi: "Lajittele:",
    sv: "Sortera:",
    en: "Sort:",
  },

  "teacher.classCard.sort.progress": {
    fi: "Edistyminen (jäljessä ensin)",
    sv: "Framsteg (eftersatta först)",
    en: "Progress (behind first)",
  },

  "teacher.classCard.sort.nameAsc": {
    fi: "Nimi (A–Z)",
    sv: "Namn (A–Z)",
    en: "Name (A–Z)",
  },

  "teacher.classCard.sort.leastActive": {
    fi: "Vähiten aktiiviset ensin",
    sv: "Minst aktiva först",
    en: "Least active first",
  },

  "teacher.classCard.exportCsv": {
    fi: "Lataa tiedot (CSV)",
    sv: "Ladda ner data (CSV)",
    en: "Download data (CSV)",
  },

  "teacher.classCard.copyCode": {
    fi: "Kopioi koodi",
    sv: "Kopiera kod",
    en: "Copy code",
  },

  "teacher.classCard.copyCode.ok": {
    fi: "Koodi kopioitu.",
    sv: "Kod kopierad.",
    en: "Code copied.",
  },

  "teacher.classCard.copyCode.fail": {
    fi: "Kopiointi epäonnistui — kopioi käsin.",
    sv: "Kopieringen misslyckades — kopiera manuellt.",
    en: "Copy failed — copy manually.",
  },

  "teacher.classCard.empty": {
    fi: "Ei oppilaita vielä. Jaa luokan koodi oppilaiden kanssa.",
    sv: "Inga elever än. Dela klassens kod med eleverna.",
    en: "No students yet. Share the class code with students.",
  },

  "teacher.roster.student": {
    fi: "Oppilas",
    sv: "Elev",
    en: "Student",
  },

  "teacher.roster.progress": {
    fi: "Edistyminen",
    sv: "Framsteg",
    en: "Progress",
  },

  "teacher.roster.worlds": {
    fi: "Maailmat",
    sv: "Världar",
    en: "Worlds",
  },

  "teacher.roster.viewPortfolio": {
    fi: "Näytä portfolio",
    sv: "Visa portfölj",
    en: "View portfolio",
  },

  "teacher.roster.nameMissing": {
    fi: "Nimi puuttuu",
    sv: "Namn saknas",
    en: "Name missing",
  },

  "teacher.roster.worldScreens": {
    fi: "Maailma {w}, näytöt",
    sv: "Värld {w}, skärmar",
    en: "World {w}, screens",
  },

  // ============================================================================
  // STUDENT PORTFOLIO (TEACHER VIEW)
  // ============================================================================

  "portfolio.title": {
    fi: "{name} — Portfolio",
    sv: "{name} — Portfölj",
    en: "{name} — Portfolio",
  },

  "portfolio.progress": {
    fi: "Edistyminen",
    sv: "Framsteg",
    en: "Progress",
  },

  "portfolio.filledOfTotal": {
    fi: "{done} / {total} näyttöä täytetty",
    sv: "{done} / {total} skärmar ifyllda",
    en: "{done} / {total} screens completed",
  },

  "portfolio.currentScreen": {
    fi: "Nykyinen näyttö: {n} / {total}",
    sv: "Aktuell skärm: {n} / {total}",
    en: "Current screen: {n} / {total}",
  },

  "portfolio.meter": {
    fi: "Vahvuusmittari",
    sv: "Styrka mätare",
    en: "Strength meter",
  },

  "portfolio.meter.done": {
    fi: "Suoritettu ✓",
    sv: "Avslutad ✓",
    en: "Completed ✓",
  },

  "portfolio.meter.inProgress": {
    fi: "Kesken",
    sv: "Pågår",
    en: "In progress",
  },

  "portfolio.meter.top5": {
    fi: "Top 5 ydinvahvuutta",
    sv: "Top 5 kärnstyrkor",
    en: "Top 5 core strengths",
  },

  "portfolio.meter.growth3": {
    fi: "Top 3 kasvuvahvuutta",
    sv: "Top 3 tillväxtstyrkor",
    en: "Top 3 growth strengths",
  },

  "portfolio.result": {
    fi: "Vahvuustulos",
    sv: "Styrka resultat",
    en: "Strength result",
  },

  "portfolio.screenLabel": {
    fi: "Näyttö {n} — {world}",
    sv: "Skärm {n} — {world}",
    en: "Screen {n} — {world}",
  },

  "portfolio.print": {
    fi: "Tulosta Portfolio",
    sv: "Skriv ut portfölj",
    en: "Print portfolio",
  },

  // ============================================================================
  // WORLDS — MODULE TITLES & SUBTITLES
  // ============================================================================

  "world.prologi.title": {
    fi: "Prologi",
    sv: "Prolog",
    en: "Prologue",
  },

  "world.prologi.subtitle": {
    fi: "Tervetuloa",
    sv: "Välkommen",
    en: "Welcome",
  },

  "world.m1.title": {
    fi: "Moduuli 1",
    sv: "Modul 1",
    en: "Module 1",
  },

  "world.m1.subtitle": {
    fi: "Omat ydinvahvuudet",
    sv: "Mina kärnstyrkor",
    en: "My core strengths",
  },

  "world.m2.title": {
    fi: "Moduuli 2",
    sv: "Modul 2",
    en: "Module 2",
  },

  "world.m2.subtitle": {
    fi: "Omat vahvuudet lukiossa",
    sv: "Mina styrkor i gymnasiet",
    en: "My strengths at school",
  },

  "world.m3.title": {
    fi: "Moduuli 3",
    sv: "Modul 3",
    en: "Module 3",
  },

  "world.m3.subtitle": {
    fi: "Omat vahvuudet kotona",
    sv: "Mina styrkor hemma",
    en: "My strengths at home",
  },

  "world.m4.title": {
    fi: "Moduuli 4",
    sv: "Modul 4",
    en: "Module 4",
  },

  "world.m4.subtitle": {
    fi: "Omat vahvuudet vapaa-ajalla ja harrastuksissa",
    sv: "Mina styrkor på fritiden och i hobbyer",
    en: "My strengths in hobbies & free time",
  },

  "world.m5.title": {
    fi: "Moduuli 5",
    sv: "Modul 5",
    en: "Module 5",
  },

  "world.m5.subtitle": {
    fi: "Omat vahvuudet ystävyyssuhteissa",
    sv: "Mina styrkor i vänskapsrelationer",
    en: "My strengths in friendships",
  },

  "world.m6.title": {
    fi: "Moduuli 6",
    sv: "Modul 6",
    en: "Module 6",
  },

  "world.m6.subtitle": {
    fi: "Vahvuusportfolion kokoaminen",
    sv: "Sammanställning av styrkeportfolj",
    en: "Assembling strength portfolio",
  },

  "world.m7.title": {
    fi: "Vahvuusmittari",
    sv: "Styrka mätare",
    en: "Strength meter",
  },

  "world.m7.subtitle": {
    fi: "Itsearviointi ja tulokset",
    sv: "Självbedömning och resultat",
    en: "Self-assessment and results",
  },

  // ============================================================================
  // MODULE DESCRIPTIONS (BLURBS)
  // ============================================================================

  "module.m1.blurb": {
    fi: "Tutustut ja opit omista luonteenvahvuuksista.",
    sv: "Lär känna och utforska dina karaktärsstyrkor.",
    en: "Discover and learn about your character strengths.",
  },

  "module.m2.blurb": {
    fi: "Tutustut henkilökohtaisiin vahvuuksiin opiskelijana. Opit kysymään palautetta opettajilta ja opiskelukavereilta.",
    sv: "Utforska dina personliga styrkor som studerande. Lär dig att fråga om feedback från lärare och studiekamrater.",
    en: "Explore your personal strengths as a student. Learn to ask for feedback from teachers and classmates.",
  },

  "module.m3.blurb": {
    fi: "Tutustut henkilökohtaisiin vahvuuksiin kotona. Myös vanhemmat / läheiset kertovat sinun vahvuuksistasi.",
    sv: "Utforska dina personliga styrkor hemma. Föräldrar/närstående berättar också om dina styrkor.",
    en: "Explore your personal strengths at home. Parents/loved ones also share your strengths.",
  },

  "module.m4.blurb": {
    fi: "Tutustut omiin vahvuuksiin ja niiden hyödyntämiseen vapaa-ajalla.",
    sv: "Lär dig om dina styrkor och hur du använder dem på fritiden.",
    en: "Learn about your strengths and how to use them in hobbies and free time.",
  },

  "module.m5.blurb": {
    fi: "Tutustut omiin vahvuuksiin ystävyyssuhteissa. Opit kysymään ja antamaan palautetta.",
    sv: "Utforska dina styrkor i vänskapsrelationer. Lär dig att fråga om och ge feedback.",
    en: "Explore your strengths in friendships. Learn to ask for and give feedback.",
  },

  "module.m6.blurb": {
    fi: "Reflektoi oppimaasi ja hyödynnä omia vahvuuksiasi esimerkiksi kesätyönhaussa.",
    sv: "Reflektera över vad du har lärt dig och använd dina styrkor i t.ex. sommarbeslut.",
    en: "Reflect on what you have learned and use your strengths in future decisions.",
  },

  // ============================================================================
  // SCREEN TITLES (h1 on each screen, in order)
  // ============================================================================

  "screen_title_1": {
    fi: "Vahvuusportfolio lukiolaiselle",
    sv: "Styrkeportfölj för gymnasiet",
    en: "Strength Portfolio for Upper Secondary Students",
  },

  "screen_title_2": {
    fi: "Moduulit",
    sv: "Moduler",
    en: "Modules",
  },

  "screen_title_3": {
    fi: "Kasvat eniten niillä alueilla, joilla olet jo vahva.",
    sv: "Du växer mest på områden där du redan är stark.",
    en: "You grow most in areas where you are already strong.",
  },

  "screen_title_4": {
    fi: "Mitä vahvuudet ovat?",
    sv: "Vad är styrkor?",
    en: "What are strengths?",
  },

  "screen_title_5": {
    fi: "Tietoa vahvuuksista",
    sv: "Information om styrkor",
    en: "About strengths",
  },

  "screen_title_6": {
    fi: "Luonteenvahvuudet, joita voit tunnistaa itsessäsi ja toisissa",
    sv: "Karaktärsstyrkor som du kan känna igen hos dig själv och andra",
    en: "Character strengths you can recognize in yourself and others",
  },

  "screen_title_7": {
    fi: "Lukiolainen — joko tunnet omat vahvuutesi?",
    sv: "Gymnasieelev — känner du dina styrkor?",
    en: "Upper secondary student — do you know your strengths?",
  },

  "screen_title_8": {
    fi: "Kysy palautetta",
    sv: "Fråga om feedback",
    en: "Ask for feedback",
  },

  "screen_title_9": {
    fi: "Minä olen",
    sv: "Jag är",
    en: "I am",
  },

  "screen_title_11": {
    fi: "1. Omat ydinvahvuudet",
    sv: "1. Mina kärnstyrkor",
    en: "1. My core strengths",
  },

  "screen_title_12": {
    fi: "YDINVAHVUUKSIEN KARKKIKAUPPA",
    sv: "KÄRNSTYRKORNAS GODISAFFÄR",
    en: "CORE STRENGTHS CANDY STORE",
  },

  "screen_title_12b": {
    fi: "Väittämiä vastaavat luonteenvahvuudet",
    sv: "Karaktärsstyrkor som motsvarar påstor",
    en: "Character strengths that match the statements",
  },

  "screen_title_13": {
    fi: "Vahvuuskarkkini",
    sv: "Mina styrkegodisar",
    en: "My strength candies",
  },

  "screen_title_14": {
    fi: "Ydinvahvuuksien tiekartta",
    sv: "Väg för kärnstyrkor",
    en: "My core strengths roadmap",
  },

  "screen_title_15": {
    fi: "Voimavarani opiskelijana 1/2",
    sv: "Mina resurser som studerande 1/2",
    en: "My resources as a student 1/2",
  },

  "screen_title_16": {
    fi: "Voimavarani opiskelijana 2/2",
    sv: "Mina resurser som studerande 2/2",
    en: "My resources as a student 2/2",
  },

  "screen_title_17": {
    fi: "Haasteet ja vahvuudet",
    sv: "Utmaningar och styrkor",
    en: "Challenges and strengths",
  },

  "screen_title_18": {
    fi: "Vahvuuksien käyttökielto",
    sv: "Förbud mot användning av styrkor",
    en: "Strength ban",
  },

  "screen_title_19": {
    fi: "Idea: Vahvuusjulisteet",
    sv: "Ide: Styrka affischer",
    en: "Idea: Strength posters",
  },

  "screen_title_20": {
    fi: "Muistele onnistumista",
    sv: "Kom ihåg framgångar",
    en: "Remember successes",
  },

  "screen_title_21": {
    fi: "Pohdi onnistumisia ja täydennä!",
    sv: "Reflektera över framgångar och fyll i!",
    en: "Reflect on successes and fill in!",
  },

  "screen_title_22": {
    fi: "Tulevaisuuden muistelu",
    sv: "Framtida minnesminne",
    en: "Future memory",
  },

  "screen_title_23": {
    fi: "Ydinvahvuudet parin kanssa",
    sv: "Kärnstyrkor med en partner",
    en: "Core strengths with a partner",
  },

  "screen_title_24": {
    fi: "Anna palautetta ja kehuja täydentämällä seuraavia lauseenalkuja:",
    sv: "Ge feedback och beröm genom att fylla i följande frasöppningar:",
    en: "Give feedback and praise by completing the following sentence starters:",
  },

  "screen_title_25": {
    fi: "Tässä olen minä:",
    sv: "Här är jag:",
    en: "Here is me:",
  },

  "screen_title_26": {
    fi: "Omien vahvuuksien käyttö",
    sv: "Användning av egna styrkor",
    en: "Using my own strengths",
  },

  "screen_title_28": {
    fi: "2. Omat vahvuudet lukiossa",
    sv: "2. Mina styrkor i gymnasiet",
    en: "2. My strengths at school",
  },

  "screen_title_29": {
    fi: "Omat vahvuuteni lukiossa",
    sv: "Mina styrkor i gymnasiet",
    en: "My strengths at school",
  },

  "screen_title_30_quadrant_lahjakkuudet": {
    fi: "LAHJAKKUUDET",
    sv: "TALANGER",
    en: "TALENTS",
  },

  "screen_title_30_quadrant_taidot": {
    fi: "TAIDOT",
    sv: "FÄRDIGHETER",
    en: "SKILLS",
  },

  "screen_title_30_quadrant_kiinnostukset": {
    fi: "KIINNOSTUKSEN KOHTEET",
    sv: "INTRESSEN",
    en: "INTERESTS",
  },

  "screen_title_30_quadrant_resurssit": {
    fi: "RESURSSIT",
    sv: "RESURSER",
    en: "RESOURCES",
  },

  "screen_title_31": {
    fi: "Osaamisen osa-alueiden palapeli",
    sv: "Kunskapspussel",
    en: "Knowledge puzzle",
  },

  "screen_title_32": {
    fi: "Unelmien tiekartta opinnoissa",
    sv: "Väg för studiedrömmar",
    en: "Dream roadmap for studies",
  },

  "screen_title_33": {
    fi: "Täydennä kaikki erityistaitosi tähän listaan.",
    sv: "Fyll i alla dina specialfärdigheter i denna lista.",
    en: "Fill in all your special skills in this list.",
  },

  "screen_title_34": {
    fi: "Minä opiskelijana",
    sv: "Jag som studerande",
    en: "Me as a student",
  },

  "screen_title_35": {
    fi: "Koulu-kokemuksia",
    sv: "Skolerfarenheter",
    en: "School experiences",
  },

  "screen_title_36": {
    fi: "Tavoitteeni opiskelijana 1/2",
    sv: "Mina mål som studerande 1/2",
    en: "My goals as a student 1/2",
  },

  "screen_title_37": {
    fi: "Tavoitteeni opiskelijana 2/2",
    sv: "Mina mål som studerande 2/2",
    en: "My goals as a student 2/2",
  },

  "screen_title_38": {
    fi: "Vahvuuteni opiskelijana",
    sv: "Mina styrkor som studerande",
    en: "My strengths as a student",
  },

  "screen_title_39": {
    fi: "Vahvuuspalaute opiskelukavereilta",
    sv: "Styrka feedback från studiekamrater",
    en: "Strength feedback from classmates",
  },

  "screen_title_40": {
    fi: "Minä olen",
    sv: "Jag är",
    en: "I am",
  },

  "screen_title_41": {
    fi: "3. Omat vahvuudet kotona",
    sv: "3. Mina styrkor hemma",
    en: "3. My strengths at home",
  },

  "screen_title_42": {
    fi: "Vahvuudet perheessä",
    sv: "Styrkor i familjen",
    en: "Strengths in family",
  },

  "screen_title_43": {
    fi: "Minä perheenjäsenenä",
    sv: "Jag som familjemedlem",
    en: "Me as a family member",
  },

  "screen_title_44": {
    fi: "Muistele ja kysy vanhemmilta",
    sv: "Kom ihåg och fråga föräldrar",
    en: "Remember and ask parents",
  },

  "screen_title_45": {
    fi: "Pyydä vanhempaasi täydentämään!",
    sv: "Be din förälder att fylla i!",
    en: "Ask your parent to fill in!",
  },

  "screen_title_45b": {
    fi: "Kirjoita vahvuuskirje nuorellesi",
    sv: "Skriv ett styrka brev till ungdomen",
    en: "Write a strength letter to the young person",
  },

  "screen_title_47": {
    fi: "4. Omat vahvuudet vapaa-ajalla ja harrastuksissa",
    sv: "4. Mina styrkor på fritiden och i hobbyer",
    en: "4. My strengths in hobbies & free time",
  },

  "screen_title_48": {
    fi: "Minä vapaa-ajalla",
    sv: "Jag på fritiden",
    en: "Me in free time",
  },

  "screen_title_49": {
    fi: "Love to-do -lista 1/3",
    sv: "Älska att göra -lista 1/3",
    en: "Love to-do list 1/3",
  },

  "screen_title_50": {
    fi: "Love to-do -lista",
    sv: "Älska att göra -lista",
    en: "Love to-do list",
  },

  "screen_title_51": {
    fi: "Love to-do -lista",
    sv: "Älska att göra -lista",
    en: "Love to-do list",
  },

  "screen_title_52": {
    fi: "Kuvakollaasi 1/2",
    sv: "Bildkollage 1/2",
    en: "Photo collage 1/2",
  },

  "screen_title_53": {
    fi: "Kuvakollaasi 2/2",
    sv: "Bildkollage 2/2",
    en: "Photo collage 2/2",
  },

  "screen_title_55": {
    fi: "5. Omat vahvuudet ystävyyssuhteissa",
    sv: "5. Mina styrkor i vänskapsrelationer",
    en: "5. My strengths in friendships",
  },

  "screen_title_56": {
    fi: "Minä ystävänä",
    sv: "Jag som vän",
    en: "Me as a friend",
  },

  "screen_title_57": {
    fi: "Vahvuuspalaute ystäviltä",
    sv: "Styrka feedback från vänner",
    en: "Strength feedback from friends",
  },

  "screen_title_59": {
    fi: "6. Vahvuusportfolion kokoaminen",
    sv: "6. Sammanställning av styrkeportfolj",
    en: "6. Assembling my strength portfolio",
  },

  "screen_title_60": {
    fi: "Vahvuuksien yhteenveto",
    sv: "Sammanfattning av styrkor",
    en: "Summary of strengths",
  },

  "screen_title_61": {
    fi: "Pohdi ja hyödynnä saamaasi palautetta",
    sv: "Reflektera över och använd din feedback",
    en: "Reflect on and use your feedback",
  },

  "screen_title_62": {
    fi: "Visioni ja tavoitteeni",
    sv: "Min vision och mål",
    en: "My vision and goals",
  },

  "screen_title_63": {
    fi: "Kerro vahvuuksistasi videon tai esityksen avulla",
    sv: "Berätta om dina styrkor via video eller presentation",
    en: "Tell about your strengths via video or presentation",
  },

  "screen_title_64": {
    fi: "Muistiinpanoja",
    sv: "Anteckningar",
    en: "Notes",
  },

  "screen_title_65": {
    fi: "Muistiinpanoja",
    sv: "Anteckningar",
    en: "Notes",
  },

  "screen_title_66": {
    fi: "Muistiinpanoja",
    sv: "Anteckningar",
    en: "Notes",
  },

  "screen_title_67": {
    fi: "Anna itsellesi ja toisille palautetta!",
    sv: "Ge feedback till dig själv och andra!",
    en: "Give feedback to yourself and others!",
  },

  "screen_title_68": {
    fi: "5 vinkkiä sinulle",
    sv: "5 tips för dig",
    en: "5 tips for you",
  },

  "screen_title_69_prompt": {
    fi: "Täydennä vahvuusmittari ja vertaa tuloksia itse valitsemiisi vahvuuskarkkeihin.",
    sv: "Fyll i styrkemätaren och jämför resultaten med dina valda styrkegodis.",
    en: "Complete the strength meter and compare results with your chosen strength candies.",
  },

  "screen_title_69_reflect": {
    fi: "Reflektoi tuloksia",
    sv: "Reflektera över resultaten",
    en: "Reflect on the results",
  },

  "screen_title_end": {
    fi: "Kiitos seikkailusta! 🌟",
    sv: "Tack för äventyret! 🌟",
    en: "Thank you for the adventure! 🌟",
  },

  // ============================================================================
  // METER — VIRTUE CATEGORY LABELS
  // ============================================================================

  "meter.virtue.wisdom": {
    fi: "Viisaus ja tieto",
    sv: "Visdom och kunskap",
    en: "Wisdom & knowledge",
  },

  "meter.virtue.courage": {
    fi: "Rohkeus",
    sv: "Mod",
    en: "Courage",
  },

  "meter.virtue.humanity": {
    fi: "Inhimillisyys",
    sv: "Mänsklighet",
    en: "Humanity",
  },

  "meter.virtue.justice": {
    fi: "Oikeudenmukaisuus",
    sv: "Rättvisa",
    en: "Justice",
  },

  "meter.virtue.temperance": {
    fi: "Kohtuullisuus",
    sv: "Måttfullhet",
    en: "Temperance",
  },

  "meter.virtue.transcendence": {
    fi: "Henkisyys",
    sv: "Transcendens",
    en: "Transcendence",
  },
};

/**
 * Get a translated string for the specified language.
 * CRITICAL: No fallback. If language/key is missing, warns and returns key.
 */
export function t(key: string, language: Language = "fi"): string {
  const stringData = STRINGS[key];
  if (!stringData) {
    console.warn(`[i18n] Missing translation key: "${key}"`);
    return key;
  }

  const text = stringData[language];
  if (!text) {
    console.warn(`[i18n] Missing ${language} translation for key: "${key}"`);
    return key;
  }

  return text;
}

/**
 * Translate with variable substitution.
 * Usage: tFormat("app.screenOfTotal", "fi", { n: 5, total: 10 })
 */
export function tFormat(
  key: string,
  language: Language = "fi",
  vars: Record<string, string | number> = {}
): string {
  let text = t(key, language);
  Object.entries(vars).forEach(([varName, value]) => {
    text = text.replace(`{${varName}}`, String(value));
  });
  return text;
}
