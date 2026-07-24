import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { StickyNote } from "@/components/StickyNote";
import { MeterPicker } from "@/components/MeterPicker";
import {
  METER_STRENGTHS, VIRTUES, strengthForScreen, fieldKeyFor,
  METER_FIRST_SCREEN, METER_STRENGTH_FIRST, METER_SUMMARY, METER_REFLECT, METER_TOP,
  strengthsByVirtue,
} from "@/lib/meter-data";
import {
  loadAllMeterScores, computeVirtueSubtotals, computeTop5, computeBottom3,
  type StrengthScore,
} from "@/lib/meter";
import { useAutosave, loadResponse, type SaveState } from "@/hooks/use-autosave";
import { cn } from "@/lib/utils";
import { getStrengthName } from "@/lib/strengths-i18n";
import { useLanguage } from "@/context/LanguageContext";

/** Resolve the canonical strength number (1–26) for a meter-strength id. */
function strengthNrForId(id: string): number {
  const idx = METER_STRENGTHS.findIndex((s) => s.id === id);
  return idx + 1;
}

type Props = { onSaveStateChange?: (s: SaveState) => void };

/* ---------- S77: Intro ---------- */
function MeterIntro() {
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow">
        <div className="text-xs font-bold uppercase tracking-widest opacity-70">Vahvuusmittari</div>
        <h1 className="font-display text-3xl leading-tight">
          Lukiolainen, aloita vahvuusmittarin täyttäminen
        </h1>
      </StickyNote>
      <StickyNote tone="white">
        <p className="text-sm leading-relaxed mb-2">
          <strong>Ohjeita:</strong> Voit selvittää omia ydinvahvuuksiasi käyttämällä alla olevaa
          vahvuusmittaria.
        </p>
        <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1.5">
          <li>
            Sinun kannattaa ennen mittarin täyttämistä valita viisi vahvuutta (vahvuuskarkit),
            jotka mielestäsi kuvaavat sinua parhaimmillasi.
          </li>
          <li>
            Pyydä myös muita ihmisiä miettimään, mitkä ovat heidän mielestään sinun
            vahvuuksiasi. Haastattele ystäviäsi, perheenjäseniä tai esimerkiksi valmentajaasi.
          </li>
          <li>Vertaa muiden arvioita omiisi ja lopuksi mittarista saamaasi tulokseen. Yllätyitkö?</li>
          <li>Ovatko tulokset yhteneväiset mittarin ja omien valintojesi kanssa?</li>
          <li>Antoiko mittari eri vastauksia kuin mitä itse valitsit? Entä opettajat, ystävät ja läheiset?</li>
          <li>Yllätyitkö mittarin tuloksista tai muiden valinnoista? Miten?</li>
        </ul>
        <p className="mt-3 text-sm italic">
          Tervetuloa tekemään omien vahvuuksien itsearviointia! Valitse kuhunkin otsikkona
          olevaan väittämään sinulle sopivin vaihtoehto.
        </p>
      </StickyNote>
    </div>
  );
}

/* ---------- S78–S103: one strength per screen ---------- */
function MeterStrengthScreen({ n, onSaveStateChange }: { n: number } & Props) {
  const s = strengthForScreen(n)!;
  const { language } = useLanguage();
  const strengthNr = useMemo(() => strengthNrForId(s.id), [s.id]);
  const displayName = useMemo(() => getStrengthName(strengthNr, language), [strengthNr, language]);
  const [s1, setS1] = useState<number | null>(null);
  const [s2, setS2] = useState<number | null>(null);
  // Load initial scores for the live tally (taking reverse into account)
  useEffect(() => {
    (async () => {
      const a = await loadResponse<number>(fieldKeyFor(s.id, 0));
      const b = await loadResponse<number>(fieldKeyFor(s.id, 1));
      if (typeof a === "number") setS1(s.statements[0].reversed ? 6 - a : a);
      if (typeof b === "number") setS2(s.statements[1].reversed ? 6 - b : b);
    })();
  }, [s.id, s.statements]);

  const total = (s1 ?? 0) + (s2 ?? 0);
  const both = s1 !== null && s2 !== null;

  return (
    <div className="space-y-4">
      <StickyNote tone="coral" className="text-center">
        <div className="text-xs font-bold uppercase tracking-widest opacity-80">{s.virtue}</div>
        <h1 className="font-display text-3xl leading-tight">{displayName}</h1>
        <div className="mt-2 inline-block rounded-full bg-white/25 px-4 py-1 text-sm font-display font-semibold">
          {both ? `${displayName}-pisteet: ${total} / 10` : `Pisteet: ${total} / 10 — vastaa molempiin`}
        </div>
      </StickyNote>

      <StickyNote tone="white">
        <MeterPicker
          fieldKey={fieldKeyFor(s.id, 0)}
          statement={s.statements[0].text}
          reversed={s.statements[0].reversed}
          onSaveStateChange={onSaveStateChange}
          onScoreChange={setS1}
        />
      </StickyNote>
      <StickyNote tone="white">
        <MeterPicker
          fieldKey={fieldKeyFor(s.id, 1)}
          statement={s.statements[1].text}
          reversed={s.statements[1].reversed}
          onSaveStateChange={onSaveStateChange}
          onScoreChange={setS2}
        />
      </StickyNote>

      <p className="text-center text-sm opacity-80">
        Laske yhteen {displayName.toLowerCase()}-pisteesi.
      </p>
    </div>
  );
}

/* ---------- S104: Yhteenveto (virtue subtotals) ---------- */
function MeterSummary() {
  const [scores, setScores] = useState<StrengthScore[] | null>(null);
  useEffect(() => { loadAllMeterScores().then(setScores); }, []);
  const subtotals = useMemo(() => scores ? computeVirtueSubtotals(scores) : [], [scores]);

  return (
    <div className="space-y-4">
      <StickyNote tone="yellow">
        <h1 className="font-display text-3xl leading-tight">Yhteenveto</h1>
        <p className="text-sm">Kirjoita saamasi pisteet tähän listaan — mittari laskee summat puolestasi.</p>
      </StickyNote>

      {!scores && <p className="text-center opacity-70">Lasketaan…</p>}
      {scores && (
        <div className="grid gap-3 sm:grid-cols-2">
          {subtotals.map((v) => (
            <StickyNote key={v.virtue} tone="white">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-xl">{v.virtue}</h2>
                <div className="font-display text-lg">
                  Yht. <strong>{v.total}</strong> / {v.max}
                </div>
              </div>
              <ol className="mt-2 space-y-1 text-sm">
                {v.strengths.map((s, i) => (
                  <li key={s.id} className="flex justify-between gap-3">
                    <span>{i + 1}. {s.name}</span>
                    <span className={cn("font-mono", s.complete ? "" : "opacity-40")}>
                      {s.complete ? s.total : "—"}
                    </span>
                  </li>
                ))}
              </ol>
            </StickyNote>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- S105: Ydinvahvuuksien pohtiminen (auto top + bottom) ---------- */
function MeterReflect() {
  const [scores, setScores] = useState<StrengthScore[] | null>(null);
  useEffect(() => { loadAllMeterScores().then(setScores); }, []);
  const top = useMemo(() => scores ? computeTop5(scores) : [], [scores]);
  const bot = useMemo(() => scores ? computeBottom3(scores) : [], [scores]);

  return (
    <div className="space-y-4">
      <StickyNote tone="coral">
        <h1 className="font-display text-2xl leading-tight">Ydinvahvuuksien pohtiminen</h1>
        <p className="text-sm leading-relaxed mt-2">
          Sait kenties 3–7 kohtaa, joiden pistemäärä on 9 tai 10. Nämä ovat tämän mittarin
          mukaan sinun ydinvahvuuksiasi. Joillain meistä näitä ydinvahvuuksia on paljon
          enemmän! Kirjoita ydinvahvuutesi ylös ja tarkastele niitä. Katso myös, mistä
          kohdista sait matalimmat pisteet. Nämä ovat todennäköisesti kasvuvahvuuksiasi,
          joita voit tarkastella kehittymisen näkökulmasta.
        </p>
      </StickyNote>

      {scores && (
        <>
          <StickyNote tone="yellow">
            <h2 className="font-display text-lg mb-2">Ydinvahvuutesi (mittarin mukaan)</h2>
            <ul className="space-y-1 text-sm">
              {top.map((s) => (
                <li key={s.id} className="flex justify-between">
                  <span><strong>{s.name}</strong> <span className="opacity-70">— {s.virtue}</span></span>
                  <span className="font-mono">{s.total}/10</span>
                </li>
              ))}
            </ul>
          </StickyNote>
          <StickyNote tone="mint">
            <h2 className="font-display text-lg mb-2">Kasvuvahvuutesi</h2>
            <ul className="space-y-1 text-sm">
              {bot.map((s) => (
                <li key={s.id} className="flex justify-between">
                  <span><strong>{s.name}</strong> <span className="opacity-70">— {s.virtue}</span></span>
                  <span className="font-mono">{s.total}/10</span>
                </li>
              ))}
            </ul>
          </StickyNote>
        </>
      )}
    </div>
  );
}

/* ---------- S106: Top 5 + Top 3 confirmation + reveal vs candy picks ---------- */
function MeterTop({ onSaveStateChange }: Props) {
  const [scores, setScores] = useState<StrengthScore[] | null>(null);
  const [top5, setTop5] = useState<string[]>([]);
  const [growth3, setGrowth3] = useState<string[]>([]);
  const [candyPicks, setCandyPicks] = useState<number[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const sc = await loadAllMeterScores();
      setScores(sc);
      const savedTop = await loadResponse<string[]>("meter2_top5");
      const savedGr = await loadResponse<string[]>("meter2_growth3");
      const candy = await loadResponse<number[]>("screen_12_karkkikauppa_picks");
      setTop5(Array.isArray(savedTop) && savedTop.length ? savedTop : computeTop5(sc).map((s) => s.id));
      setGrowth3(Array.isArray(savedGr) && savedGr.length ? savedGr : computeBottom3(sc).map((s) => s.id));
      setCandyPicks(Array.isArray(candy) ? candy : null);
      setLoaded(true);
    })();
  }, []);

  const sTop = useAutosave("meter2_top5", top5, { enabled: loaded });
  const sGr = useAutosave("meter2_growth3", growth3, { enabled: loaded });
  useEffect(() => { onSaveStateChange?.(sTop); }, [sTop, onSaveStateChange]);
  useEffect(() => { onSaveStateChange?.(sGr); }, [sGr, onSaveStateChange]);

  function toggleTop(id: string) {
    setTop5((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 5 ? cur : [...cur, id]);
  }
  function toggleGrowth(id: string) {
    setGrowth3((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 3 ? cur : [...cur, id]);
  }

  // Candy picks were stored as indices into screen_12 strengths list. We don't
  // re-map them to meter IDs because the candy list uses different keys, so we
  // just count overlap by name if we can. Skip if candy list isn't available.

  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" className="text-center">
        <h1 className="font-display text-3xl leading-tight">Vahvuustulokseni</h1>
        <p className="text-sm opacity-90">
          Top 5 ydinvahvuuttani ja Top 3 kasvuvahvuuttani, joiden kehittämisestä on hyötyä.
        </p>
      </StickyNote>

      <StickyNote tone="white">
        <h2 className="font-display text-xl mb-2">Top 5 ydinvahvuuttani</h2>
        <p className="text-xs opacity-70 mb-2">Valittu {top5.length} / 5</p>
        <div className="flex flex-wrap gap-2">
          {METER_STRENGTHS.map((s) => {
            const active = top5.includes(s.id);
            const atMax = !active && top5.length >= 5;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleTop(s.id)}
                disabled={atMax}
                className={cn(
                  "candy-chip rounded-full border-2 px-3 py-1.5 text-sm font-semibold",
                  active
                    ? "is-active bg-[color:var(--coral)] border-[color:var(--coral)] text-white"
                    : "bg-white text-slate-900 border-white/40",
                  atMax && "opacity-40 cursor-not-allowed",
                )}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </StickyNote>

      <StickyNote tone="white">
        <h2 className="font-display text-xl mb-2">Top 3 kasvuvahvuuttani</h2>
        <p className="text-xs opacity-70 mb-2">Valittu {growth3.length} / 3</p>
        <div className="flex flex-wrap gap-2">
          {METER_STRENGTHS.map((s) => {
            const active = growth3.includes(s.id);
            const atMax = !active && growth3.length >= 3;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleGrowth(s.id)}
                disabled={atMax}
                className={cn(
                  "candy-chip rounded-full border-2 px-3 py-1.5 text-sm font-semibold",
                  active
                    ? "is-active bg-[color:var(--mint)] border-[color:var(--mint)] text-[color:var(--ink)]"
                    : "bg-white text-slate-900 border-white/40",
                  atMax && "opacity-40 cursor-not-allowed",
                )}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </StickyNote>

      {scores && candyPicks !== null && (
        <StickyNote tone="coral" className="text-center">
          <h2 className="font-display text-2xl">🎉 Vahvuusmittari suoritettu!</h2>
          <p className="text-sm mt-2">
            Vastasivatko mittarin tulokset omaa karkkikauppa-valintaasi? Vertaa Top 5 -listaa
            näytön 12 valintoihin ja pohdi yhtäläisyyksiä ja eroja.
          </p>
        </StickyNote>
      )}
    </div>
  );
}

/* ---------- Registry helper ---------- */
export function meterContentFor(n: number, props: Props): ReactNode | null {
  if (n < METER_FIRST_SCREEN || n > METER_TOP) return null;
  if (n === METER_FIRST_SCREEN) return <MeterIntro />;
  if (n >= METER_STRENGTH_FIRST && n <= METER_STRENGTH_FIRST + METER_STRENGTHS.length - 1) {
    return <MeterStrengthScreen n={n} onSaveStateChange={props.onSaveStateChange} />;
  }
  if (n === METER_SUMMARY) return <MeterSummary />;
  if (n === METER_REFLECT) return <MeterReflect />;
  if (n === METER_TOP) return <MeterTop {...props} />;
  return null;
}

// Re-export so screen-content.tsx doesn't need a circular import
export { VIRTUES, strengthsByVirtue };
