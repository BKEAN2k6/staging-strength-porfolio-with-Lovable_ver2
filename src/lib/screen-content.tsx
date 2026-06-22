import { useEffect, useState, type ReactNode } from "react";
import { StickyNote } from "@/components/StickyNote";
import { WORLDS } from "@/lib/screens";
import { ReflectionTextarea, ReflectionInput } from "@/components/ReflectionTextarea";
import { SelectableChips } from "@/components/SelectableChips";
import { useAutosave, loadResponse, type SaveState } from "@/hooks/use-autosave";
import { useReportCompletion } from "@/lib/screen-completion";
import { cn } from "@/lib/utils";

// Screens 1–22: content sourced verbatim from the workbook PDF
// "Vahvuusportfolio lukiolaiselle" (Huomaa hyvä!®).

export const STRENGTHS_24 = [
  "Rohkeus", "Luovuus", "Innostus", "Reiluus",
  "Sisukkuus", "Myötätunto", "Huumorintaju", "Ystävällisyys",
  "Kauneuden ja erinomaisuuden arvostus", "Oppimisen ilo", "Rehellisyys",
  "Sosiaalinen älykkyys", "Sinnikkyys", "Kiitollisuus", "Henkisyys",
  "Johtajuus", "Toiveikkuus", "Anteeksiantavuus", "Arviointikyky",
  "Uteliaisuus", "Itsesäätely", "Rakkaus", "Näkökulmanottokyky",
  "Harkitsevaisuus", "Vaatimattomuus", "Ryhmätyötaidot",
];

type Props = { onSaveStateChange?: (s: SaveState) => void };

function Cover() {
  return (
    <div className="space-y-5">
      <StickyNote tone="yellow" seed="s1-cover" className="text-center">
        <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Huomaa hyvä!®</div>
        <h1 className="font-display text-4xl leading-tight mb-3">Vahvuusportfolio lukiolaiselle</h1>
        <div className="text-4xl mb-3">🐈‍⬛ 🏀 📚 💻</div>
        <p className="text-base leading-relaxed">
          Tervetuloa vahvuusseikkailuun! Tällä matkalla opit tunnistamaan, kehittämään ja
          hyödyntämään omia vahvuuksiasi — lukiossa, kotona, vapaa-ajalla ja ystävien kanssa.
        </p>
      </StickyNote>
      <StickyNote seed="s1-howto" tone="white">
        <p className="text-sm leading-relaxed">
          Etene näytöstä toiseen alalaidan nuolilla. Vastauksesi tallentuvat
          automaattisesti — voit aina jatkaa siitä, mihin jäit. Aloita painamalla
          <strong> Seuraava →</strong>.
        </p>
      </StickyNote>
    </div>
  );
}

function Modules() {
  const modules = WORLDS.filter((w) => w.id.startsWith("m"));
  const blurbs: Record<string, string> = {
    m1: "Tutustut ja opit omista luonteenvahvuuksista.",
    m2: "Tutustut henkilökohtaisiin vahvuuksiin opiskelijana. Opit kysymään palautetta opettajilta ja opiskelukavereilta.",
    m3: "Tutustut henkilökohtaisiin vahvuuksiin kotona. Myös vanhemmat / läheiset kertovat sinun vahvuuksistasi.",
    m4: "Tutustut omiin vahvuuksiin ja niiden hyödyntämiseen vapaa-ajalla.",
    m5: "Tutustut omiin vahvuuksiin ystävyyssuhteissa. Opit kysymään ja antamaan palautetta.",
    m6: "Reflektoi oppimaasi ja hyödynnä omia vahvuuksiasi esimerkiksi kesätyönhaussa.",
  };
  const titles: Record<string, string> = {
    m1: "Omat ydinvahvuudet",
    m2: "Omat vahvuudet lukiossa",
    m3: "Omat vahvuudet kotona",
    m4: "Omat vahvuudet vapaa-ajalla ja harrastuksissa",
    m5: "Omat vahvuudet ystävyyssuhteissa",
    m6: "Vahvuusportfolion kokoaminen",
  };
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s2-intro">
        <h1 className="font-display text-3xl mb-1">Moduulit</h1>
        <p className="text-sm opacity-90">Seikkailu kulkee kuuden moduulin läpi. Tässä on yleiskuva siitä, mitä edessä on.</p>
      </StickyNote>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((w, i) => (
          <StickyNote key={w.id} seed={`mod-${w.id}`} tone={mapTone(w.tone)}>
            <div className="text-xs font-bold opacity-70">Moduuli {i + 1}</div>
            <div className="font-display text-lg leading-tight mb-1">{titles[w.id]}</div>
            <p className="text-xs leading-snug opacity-90">{blurbs[w.id]}</p>
          </StickyNote>
        ))}
      </div>
    </div>
  );
}

function mapTone(tone: string): "white" | "yellow" | "mint" | "coral" {
  if (tone === "yellow" || tone === "mint" || tone === "coral") return tone;
  return "white";
}

function Quote() {
  return (
    <div className="space-y-5">
      <StickyNote tone="coral" seed="s3-q" className="text-center">
        <div className="text-sm italic mb-2 opacity-90">Panosta vahvuuksiisi.</div>
        <h1 className="font-display text-3xl leading-tight">
          Kasvat eniten niillä alueilla, joilla olet jo vahva.
        </h1>
        <div className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1 text-sm">
          MYÖTÄTUNTO 1000 kg 💛
        </div>
      </StickyNote>
      <p className="text-center text-xs opacity-70">Huomaa hyvä!®</p>
    </div>
  );
}

function Definition() {
  return (
    <StickyNote tone="mint" seed="s4-def">
      <h1 className="font-display text-2xl mb-3">Mitä vahvuudet ovat?</h1>
      <p className="text-base leading-relaxed mb-3">
        Vahvuudet eivät ole asioita tai ominaisuuksia, joissa olet hyvä — eivätkä
        heikkoudet niitä, joissa tunnet itsesi huonoksi.
      </p>
      <p className="text-base leading-relaxed">
        Sen sijaan <strong>vahvuudet tekevät kantajastaan vahvan</strong>, ja
        heikkoudet toimivat päinvastoin.
      </p>
    </StickyNote>
  );
}

function Tieto({ onSaveStateChange }: Props) {
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s5-info">
        <h1 className="font-display text-2xl mb-2">Tietoa vahvuuksista</h1>
        <p className="text-sm leading-relaxed mb-2">
          Luonteenvahvuudet ovat persoonan <strong>myönteisiä</strong> piirteitä, joita
          hyödyntämällä sinä, opiskelukaverisi ja yhteisösi voivat <strong>kukoistaa</strong>.
          Niitä ovat esimerkiksi <strong>sinnikkyys, uteliaisuus, rohkeus ja
          myötätuntoisuus</strong>. Jokaisella opiskelijalla on vahvuuksia ja
          kehittymässä olevaa vahvuuspotentiaalia.
        </p>
        <p className="text-sm leading-relaxed mb-2">
          Vahvuudet auttavat <strong>haasteiden kohtaamisessa</strong>. Taidot ovat
          opittuja, kun taas vahvuudet ovat itselle luontaisia ja tärkeitä ajattelu- ja
          toimintatapoja.
        </p>
        <p className="text-sm leading-relaxed">
          Jokaisella on omat <strong>ydinvahvuutensa</strong>, joihin kannattaa
          keskittyä ja joita on järkevää vahvistaa. Omien vahvuuksien tunteminen lisää
          tyytyväisyyttä, opiskelun mielekkyyttä ja hyvinvointia.
        </p>
        <p className="mt-3 font-display text-lg">Tervetuloa mukaan, lukiolainen!</p>
      </StickyNote>
      <StickyNote seed="s5-reflect" tone="white">
        <ReflectionTextarea
          fieldKey="screen_5_first_impression"
          label="Mikä tästä jäi mieleen? (vapaaehtoinen)"
          placeholder="Kirjoita muutama ajatus…"
          onSaveStateChange={onSaveStateChange}
        />
      </StickyNote>
    </div>
  );
}

function StrengthsList({ onSaveStateChange }: Props) {
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s6-h">
        <h1 className="font-display text-2xl mb-1">
          Luonteenvahvuudet, joita voit tunnistaa itsessäsi ja toisissa
        </h1>
        <p className="text-sm opacity-90">
          Valitse ne vahvuudet, jotka tunnistat itsessäsi tai läheisissäsi. Voit
          palata muokkaamaan valintaasi myöhemmin.
        </p>
      </StickyNote>
      <div className="rounded-3xl bg-white/10 p-4">
        <SelectableChips
          fieldKey="screen_6_known_strengths"
          options={STRENGTHS_24}
          onSaveStateChange={onSaveStateChange}
          min={1}
        />
      </div>
    </div>
  );
}

// S7 (PDF p7): only three short phrases on the page. No invented blurbs.
function ThreeSteps() {
  const steps = [
    { t: "Tunnista omia vahvuuksia", tone: "yellow" as const },
    { t: "Kehitä omia vahvuuksia",   tone: "mint" as const },
    { t: "Hyödynnä omia vahvuuksia", tone: "coral" as const },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {steps.map((s) => (
        <StickyNote key={s.t} tone={s.tone} seed={`s7-${s.t}`} className="text-center">
          <div className="font-display text-xl">{s.t}</div>
        </StickyNote>
      ))}
    </div>
  );
}

function JokoTunnet({ onSaveStateChange }: Props) {
  const qs = [
    { k: "s8_love", q: "Tiedätkö, mitä rakastat tehdä?" },
    { k: "s8_motivate", q: "Minkä alkamista odotat? Mistä koulutehtävistä motivoidut eniten?" },
    { k: "s8_freetime", q: "Mitkä ovat kiinnostuksen kohteesi vapaa-ajalla?" },
    { k: "s8_authentic", q: "Milloin koet olevasi aidoimmillasi ja onnistut sinulle tärkeissä asioissa?" },
    { k: "s8_persist", q: "Mitä tehdessä jaksat ponnistella sinnikkäästi ja ylittää haasteita?" },
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="mint" seed="s8-h">
        <h1 className="font-display text-2xl mb-1">Lukiolainen — joko tunnet omat vahvuutesi?</h1>
        <p className="text-sm opacity-90">Pohdi alla olevia kysymyksiä. Vastaa omin sanoin.</p>
      </StickyNote>
      <div className="grid gap-3">
        {qs.map((q) => (
          <ReflectionTextarea
            key={q.k}
            fieldKey={`screen_8_${q.k}`}
            label={q.q}
            rows={2}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

function KysyPalautetta({ onSaveStateChange }: Props) {
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s9-h">
        <h1 className="font-display text-2xl mb-1">Kysy palautetta</h1>
        <p className="text-sm opacity-90">
          Valitse 2–4 sinulle tärkeää henkilöä — läheinen, opettaja tai ystävä —
          jonka palautetta arvostat. Pyydä viestillä palautetta seuraavista
          lauseista ja täydennä saamasi vastaukset tähän.
        </p>
      </StickyNote>
      <div className="grid gap-3 sm:grid-cols-2">
        <ReflectionTextarea fieldKey="screen_9_best_sides" label="Parhaita puoliani ovat:" rows={3} onSaveStateChange={onSaveStateChange} />
        <ReflectionTextarea fieldKey="screen_9_strengths" label="Vahvuuksiani ovat mielestäni:" rows={3} onSaveStateChange={onSaveStateChange} />
        <ReflectionTextarea fieldKey="screen_9_learned" label="Olen oppinut sinulta seuraavia asioita:" rows={3} onSaveStateChange={onSaveStateChange} />
        <ReflectionTextarea fieldKey="screen_9_spotted" label="Olen bongannut niitä erityisesti kun:" rows={3} onSaveStateChange={onSaveStateChange} />
      </div>
    </div>
  );
}

function MinaOlen({ onSaveStateChange }: Props) {
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s10-h">
        <h1 className="font-display text-2xl mb-1">Minä olen</h1>
        <p className="text-sm opacity-90">
          Muuta muilta saamasi palaute lauseiksi minä-muotoon. <em>“Olet sinnikäs.”</em>
          → <strong>“Minä olen sinnikäs.”</strong>
        </p>
      </StickyNote>
      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <ReflectionInput
            key={i}
            fieldKey={`screen_10_mina_olen_${i + 1}`}
            prefix="Minä olen"
            placeholder="…"
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// S11 (PDF p15): pure title card.
function M1Intro() {
  return (
    <StickyNote tone="coral" seed="s11-h" className="text-center">
      <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Moduuli 1</div>
      <h1 className="font-display text-4xl leading-tight">1. Omat ydinvahvuudet</h1>
    </StickyNote>
  );
}

// ----- S12: Ydinvahvuuksien karkkikauppa (PDF p16–17) -----

// 26 statements verbatim from PDF p16 (preserves capitalisation and the
// "VAIKKA VAIKKA" repetition that appears in the source).
const KARKKIKAUPPA_STATEMENTS: string[] = [
  "SAAN USEIN KUULLA TOISILTA, ETTÄ KEKSIN OMAPERÄISIÄ IDEOITA",
  "HALUAN JATKUVASTI OPPIA UUTTA JA OLEN LAAJALTI KIINNOSTUNUT ASIOISTA, IHMISISTÄ, ILMIOISTÄ.",
  "PUOLUSTAN MIELIPIDETTÄNI JA USKALLAN KERTOA, MITÄ AJATTELEN, VAIKKA KOHTAISIN JYRKKÄÄKIN VASTUSTUSTA.",
  "JOS PÄÄTÄN JOTAIN, TEEN SEN, VAIKKA HAASTEITA JA VASTOINKÄYMISIÄ ILMENISI.",
  "OSOITAN LÄHEISILLENI VÄLITTÄMISTÄNI SANOIN, TEOIN JA VIETTÄMÄLLÄ PALJON AIKAA HEIDÄN KANSSAAN.",
  "MINULLE ON TÄRKEÄÄ KOHDELLA KAIKKIA TASAPUOLISESTI.",
  "TEEN AINA HARKITTUJA PÄÄTÖKSIÄ.",
  "PYSTYN SÄÄTELEMÄÄN TUNTEITANI JA KÄYTÖSTÄNI TILANTEISIIN SOPIVAKSI.",
  "HUOMAAN KAUNIITA YKSITYISKOHTIA JA PYSÄHDYN USEIN NIIDEN ÄÄRELLÄ.",
  "TEEN PÄÄTÖKSIÄ VASTA KUN TIEDÄN ASIASTA KAIKEN",
  "OLEN KIINNOSTUNUT LUKUISISTA ASIOISTA JA HALUAN JATKUVASTI OPPIA UUTTA.",
  "MINULTA PYYDETÄÄN USEIN NEUVOJA JA KOEN ETTÄ MIELIPITEITÄNI ARVOSTETAAN.",
  "PUHUN KAUNISTELEMATTA SEN PUOLESTA, MIKÄ ON MIELESTÄNI OIKEIN JA TOTTA.",
  "YSTÄVÄNI KUVAILISIVAT MINUA ENERGISEKSI, TARMOKKAAKSI JA HYVÄNTUULISEKSI.",
  "TEEN MITÄ TEHDÄ PITÄÄ, VAIKKA VAIKKA VASTOINKÄYMISIÄ ILMENISI.",
  "YKSI ELÄMÄÄNI ENITEN MERKITYSTÄ TUOVISTA ASIOISTA ON MUIDEN IHMISTEN AUTTAMINEN.",
  "OLEN MIELELLÄNI AVUKSI TAI HYÖDYKSI.",
  "PÄRJÄÄN HYVIN ERILAISISSA SOSIAALISISSA TILANTEISSA JA UUSIEN IHMISTEN PARISSA.",
  "PARHAAT PUOLENI PÄÄSEVÄT KÄYTTÖÖN RYHMÄSSÄ, JA MINUA MOTIVOI RYHMÄN ONNISTUMINEN.",
  "MINUA VOISI KUVAILLA VAHVAKSI JA REILUKSI JOHTAJAKSI.",
  "EN KAIVELE MENNEITÄ VAAN MINUN ON HELPPO IRROTTAUTUA NIISTÄ JA MENNÄ ELÄMÄSSÄ ETEENPÄIN.",
  "EN TEE ITSESTÄNI NUMEROA MISSÄÄN TILANTEISSA JA PITÄYDYN MIELELLÄNI TAUSTALLA.",
  "PERHEENI KERTOISI, ETTÄ KIITÄN USEIN JA OLEN VILPITTÖMÄSTI KIITOLLINEN.",
  "MINUN ON HELPPOA NÄHDÄ ASIOISSA NIIDEN HYVÄT PUOLET JA NÄEN TULEVAISUUDEN MYÖNTEISENÄ.",
  "LÖYDÄN VAIKEISTAKIN ELÄMÄNTILANTEISTA HUUMORIA JA PIENIÄ ILON PILKAHDUKSIA.",
  "AJATTELEN, ETTÄ ELÄMÄLLÄ ON JOKIN SYVEMPI TARKOITUS.",
];

// 26 strength names from PDF p17, in the same order. Hyphenated OCR
// line-wraps de-hyphenated (e.g. "ARVIOIN-TIKYKY" -> "ARVIOINTIKYKY").
const KARKKIKAUPPA_STRENGTHS: string[] = [
  "LUOVUUS", "UTELIAISUUS", "ARVIOINTIKYKY", "OPPIMISEN ILO",
  "NÄKÖKULMANOTTOKYKY", "ROHKEUS", "SINNIKKYYS", "REHELLISYYS",
  "INNOKKUUS", "SISUKKUUS", "MYÖTÄTUNTO", "RAKKAUS", "YSTÄVÄLLISYYS",
  "SOSIAALINEN ÄLYKKYYS", "RYHMÄTYÖTAITO", "REILUUS", "JOHTAJUUS",
  "ANTEEKSIANTAVUUS", "VAATIMATTOMUUS", "HARKITSEVUUS", "ITSESÄÄTELY",
  "KAUNEUDEN JA ERINOMAISUUDEN ARVOSTAMINEN", "KIITOLLISUUS",
  "TOIVEIKKUUS", "HUUMORINTAJU", "HENGELLISYYS",
];

const KARKKIKAUPPA_KEY = "screen_12_karkkikauppa_picks";

function Karkkikauppa({ onSaveStateChange }: Props) {
  const [picks, setPicks] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  const report = useReportCompletion();

  useEffect(() => {
    (async () => {
      const v = await loadResponse<number[]>(KARKKIKAUPPA_KEY);
      if (Array.isArray(v)) setPicks(v.filter((x) => Number.isInteger(x) && x >= 0 && x < KARKKIKAUPPA_STATEMENTS.length));
      setLoaded(true);
    })();
  }, []);

  const state = useAutosave(KARKKIKAUPPA_KEY, picks, { enabled: loaded });
  useEffect(() => { onSaveStateChange?.(state); }, [state, onSaveStateChange]);

  useEffect(() => {
    if (!loaded) return;
    report(KARKKIKAUPPA_KEY, picks.length === 5);
  }, [picks, loaded, report]);

  function toggle(i: number) {
    setPicks((cur) => {
      if (cur.includes(i)) return cur.filter((x) => x !== i);
      if (cur.length >= 5) return cur;
      return [...cur, i];
    });
  }

  const remaining = 5 - picks.length;
  const done = picks.length === 5;

  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s12-h" className="text-center">
        <h1 className="font-display text-3xl leading-tight mb-2">YDINVAHVUUKSIEN KARKKIKAUPPA</h1>
        <p className="text-sm leading-relaxed">
          Valitse itsellesi viisi tärkeintä väittämäkarkkia. Kun olet ruksinut ne,
          katso seuraavalta sivulta väittämiä vastaavat luonteenvahvuudet.
        </p>
      </StickyNote>

      <div className="sticky top-[5.5rem] z-[5] rounded-full bg-[color:var(--purple-dark)]/80 px-4 py-2 text-center text-xs font-medium backdrop-blur">
        {done
          ? "Valmista! Olet valinnut viisi väittämäkarkkia."
          : `Valittu ${picks.length} / 5 — valitse vielä ${remaining}.`}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {KARKKIKAUPPA_STATEMENTS.map((stmt, i) => {
          const active = picks.includes(i);
          const atMax = !active && picks.length >= 5;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                disabled={atMax}
                className={cn(
                  "w-full rounded-2xl border-2 px-3 py-2 text-left text-xs leading-snug transition-all",
                  active
                    ? "bg-[color:var(--coral)] border-[color:var(--coral)] text-white shadow-md"
                    : "bg-white/90 text-slate-900 border-white/40 hover:bg-white",
                  atMax && "opacity-40 cursor-not-allowed hover:bg-white/90",
                )}
                aria-pressed={active}
              >
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current align-middle text-[10px]">
                  {active ? "✓" : ""}
                </span>
                {stmt}
              </button>
            </li>
          );
        })}
      </ul>

      {done && (
        <StickyNote tone="mint" seed="s12-reveal">
          <h2 className="font-display text-xl mb-2">Väittämiä vastaavat luonteenvahvuudet</h2>
          <p className="text-xs opacity-80 mb-3">
            Numerot vastaavat väittämien järjestystä. Tunnistatko valitsemasi viisi?
          </p>
          <ol className="grid gap-1 text-sm sm:grid-cols-2">
            {KARKKIKAUPPA_STRENGTHS.map((s, i) => {
              const chosen = picks.includes(i);
              return (
                <li
                  key={i}
                  className={cn(
                    "flex items-baseline gap-2 rounded-lg px-2 py-1",
                    chosen && "bg-[color:var(--coral)]/20 font-bold",
                  )}
                >
                  <span className="font-mono text-xs opacity-60 w-6">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              );
            })}
          </ol>
        </StickyNote>
      )}
    </div>
  );
}

// ----- S13 (PDF p18): Vahvuuskarkkini -----
function S13({ onSaveStateChange }: Props) {
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s13-h">
        <h1 className="font-display text-2xl mb-1">Vahvuuskarkkini</h1>
        <p className="text-sm opacity-90">Pohdi omia vahvuuksia ja vastaa:</p>
      </StickyNote>

      <StickyNote tone="white" seed="s13-jar">
        <div className="mb-2 text-sm font-medium">Merkkaa tähän 5 vahvuuskarkkiasi!</div>
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <ReflectionInput
              key={i}
              fieldKey={`screen_13_karkki_${i + 1}`}
              placeholder="Vahvuuskarkki…"
              onSaveStateChange={onSaveStateChange}
            />
          ))}
        </div>
      </StickyNote>

      <ReflectionTextarea
        fieldKey="screen_13_examples"
        label="Ajattele itseäsi tekemässä tavanomaisia ja arkisia asioita tai tehtäviä. Miten olet näissä tekemisissä käyttänyt ydinvahvuuksiasi? Kirjoita muutama esimerkki tilanteista."
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_13_success"
        label="Missä onnistuit omia vahvuuksia hyödyntämällä?"
        rows={3}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_13_effect"
        label="Miten omien ydinvahvuuksien hyödyntäminen vaikutti itseesi tai toisiin?"
        rows={3}
        onSaveStateChange={onSaveStateChange}
      />
    </div>
  );
}

// ----- S14 (PDF p19): Ydinvahvuuksien tiekartta -----
function S14({ onSaveStateChange }: Props) {
  const qs = [
    "Mistä innostut?",
    "Minkä tekeminen tuntuu kevyeltä?",
    "Mistä luonteenvahvuuksista saat kiitosta ja palautetta toisilta?",
    "Mitä rakastat tehdä vapaa-ajalla?",
    "Minkä alkamista odotat eniten päivässäsi?",
    "Mitä tehdessä aika ja paikka unohtuvat ja pääset flow-tilaan?",
    "Mitkä vahvuudet vahvistavat sinua vapaa-ajalla?",
    "Mitkä vahvuudet tulevat lukioon, kun sinä tulet paikalle?",
    "Mitä vahvuuksia arvostat eniten itsessäsi?",
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="mint" seed="s14-h">
        <h1 className="font-display text-2xl">Ydinvahvuuksien tiekartta</h1>
      </StickyNote>
      <div className="grid gap-3">
        {qs.map((q, i) => (
          <ReflectionTextarea
            key={i}
            fieldKey={`screen_14_tiekartta_${i + 1}`}
            label={`${i + 1}. ${q}`}
            rows={2}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// ----- S15 (PDF p20): Voimavarani opiskelijana 1/2 — informational -----
function S15() {
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s15-h">
        <h1 className="font-display text-2xl mb-1">Voimavarani opiskelijana 1/2</h1>
        <p className="text-sm opacity-90">Pohdi ja täydennä omien voimavarojesi sydämet</p>
      </StickyNote>
      <StickyNote tone="white" seed="s15-b">
        <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
          <li>
            Mieti voimavarojasi, jotka auttavat sinua selviytymään hankalissa ja
            stressaavissa elämäntilanteissa, palautumaan vastoinkäymisistä ja olemaan
            toiveikas tulevaisuuden suhteen.
          </li>
          <li>
            Näitä tekijöitä voivat olla omat vahvuutesi, sosiaaliset suhteet, läheiset
            ihmiset, tunnetaidot, unelmasi tulevaisuuden suhteen, ajatuksesi, asenteesi,
            myötätuntoinen suhtautuminen itseesi ja aikaisemmat onnistumisen kokemukset.
          </li>
          <li>
            Listaa voimavarasi seuraavan sivun taulukkoon. Merkkaa sydämiin miten
            tärkeiksi voimarasi koet.
          </li>
        </ul>
      </StickyNote>
    </div>
  );
}

// ----- S16 (PDF p21): Voimavarani opiskelijana 2/2 -----
function S16({ onSaveStateChange }: Props) {
  const groups: Array<{ label: string; key: string }> = [
    { label: "KOULUSSA",       key: "screen_16_koulussa" },
    { label: "VAPAA-AJALLA",   key: "screen_16_vapaa_ajalla" },
    { label: "KOTONA",         key: "screen_16_kotona" },
    { label: "KAVERISUHTEISSA", key: "screen_16_kaverisuhteissa" },
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s16-h">
        <h1 className="font-display text-2xl">Voimavarani opiskelijana 2/2</h1>
      </StickyNote>
      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((g) => (
          <StickyNote key={g.key} tone="white" seed={g.key}>
            <ReflectionTextarea
              fieldKey={g.key}
              label={g.label}
              rows={4}
              onSaveStateChange={onSaveStateChange}
            />
          </StickyNote>
        ))}
      </div>
    </div>
  );
}

// ----- S17 (PDF p22): Haasteet ja vahvuudet -----
function S17({ onSaveStateChange }: Props) {
  return (
    <div className="space-y-4">
      <StickyNote tone="mint" seed="s17-h">
        <h1 className="font-display text-2xl mb-1">Haasteet ja vahvuudet</h1>
        <p className="text-sm font-medium">Pohdi ja kirjoita vastaukset</p>
      </StickyNote>
      <ReflectionTextarea
        fieldKey="screen_17_opetukset"
        label="Mitä vaikeudet ovat opettaneet vahvuuksistasi?"
        rows={3}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_17_kasvu"
        label="Miten olet kasvanut ja muuttunut ihmisenä vaikeuksien seurauksena?"
        rows={3}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_17_laheinen"
        label="Mitä sellainen läheinen ihminen, joka tuntee sinut hyvin, kertoisi olevan vahvuuksiasi ja voimavaroja, joiden avulla selviydyt tulevista haasteista?"
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
    </div>
  );
}

// ----- S18 (PDF p23): Vahvuuksien käyttökielto -----
function S18({ onSaveStateChange }: Props) {
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s18-h">
        <h1 className="font-display text-2xl mb-2">Vahvuuksien käyttökielto</h1>
        <p className="text-sm">
          Mieti tilannetta, jossa ydinvahvuutesi laitetaan seuraavaksi kuukaudeksi
          käyttökieltoon.
        </p>
      </StickyNote>
      <ReflectionTextarea
        fieldKey="screen_18_tunne"
        label="Miltä tämä tuntuisi?"
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_18_vaikutus"
        label="Miten tämä vaikuttaisi arkeesi, entä opintoihin?"
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
    </div>
  );
}

// ----- S19 (PDF p24): Idea: Vahvuusjulisteet — informational, no required input -----
function S19() {
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s19-h">
        <h1 className="font-display text-2xl mb-1">Idea: Vahvuusjulisteet</h1>
        <p className="text-sm leading-relaxed mb-2">
          Jokainen opiskelija tekee itsestään ja ydinvahvuuksistaan julisteen, jossa
          on oma kuva ja viisi ydinvahvuutta.
        </p>
        <p className="text-sm leading-relaxed mb-2">
          Millä tavoin voisit tehdä ydinvahvuutesi näkyväksi muille hauskalla ja
          luovalla tavalla?
        </p>
        <p className="text-sm leading-relaxed">
          Miten haluat visualisoida omat vahvuutesi? Ne parhaat puolesi, jotka tulevat
          mukanasi päivittäin lukioon.
        </p>
      </StickyNote>
      <StickyNote tone="white" seed="s19-karin">
        <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">
          Esimerkki — KARIN
        </div>
        <ul className="space-y-2 text-sm leading-snug">
          <li>
            <strong>SINNIKKYYS</strong>
            <ul className="ml-5 list-disc opacity-90">
              <li>säästämisessä</li>
              <li>kokeisiin lukemisessa</li>
              <li>treeneissä</li>
            </ul>
          </li>
          <li>
            <strong>YSTÄVÄLLISYYS</strong>
            <ul className="ml-5 list-disc opacity-90">
              <li>ystävällisyys tuntuu hyvältä</li>
              <li>sanon jos jonkun (Sannin) naamassa on räkää.</li>
            </ul>
          </li>
          <li>
            <strong>REILUUS</strong>
            <ul className="ml-5 list-disc opacity-90">
              <li>tiimipeluri</li>
              <li>tasa-arvo</li>
              <li>lojaali</li>
            </ul>
          </li>
          <li>
            <strong>HUUMORINTAJU</strong>
            <ul className="ml-5 list-disc opacity-90">
              <li>nauru pidentää ikää!</li>
              <li>asiat ei oo aina niin vakavia</li>
            </ul>
          </li>
          <li>
            <strong>MYÖTÄTUNTO</strong>
            <ul className="ml-5 list-disc opacity-90">
              <li>eläinsuojelutyö</li>
              <li>oikeuksien puolustaja</li>
            </ul>
          </li>
        </ul>
      </StickyNote>
    </div>
  );
}

// ----- S20 (PDF p25): Muistele onnistumista -----
function S20({ onSaveStateChange }: Props) {
  return (
    <div className="space-y-4">
      <StickyNote tone="mint" seed="s20-h">
        <h1 className="font-display text-2xl">Muistele onnistumista</h1>
      </StickyNote>
      <ReflectionTextarea
        fieldKey="screen_20_onnistuminen"
        label="Mieti jotain tilannetta opinnoissa tai vapaa-ajalla, joka sujui hyvin, josta olet ylpeä ja jossa huomasit onnistuvasi sinulle tärkeissä asioissa. Mitä silloin tapahtui? Mikä siinä meni hyvin? Minkälaista palautetta sait toisilta? Mikä siinä oli sinulle tärkeää?"
        rows={5}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_20_ydinvahvuudet"
        label="Mitä tämä onnistuminen kertoo ydinvahvuuksistasi: mitä omia ydinvahvuuksia käyttämällä onnistuit?"
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_20_tuki"
        label="Mieti onnistumista, jossa pystyit tukemaan ja auttamaan toisia omia vahvuuksiasi hyödyntämällä? Mitä teit ja kenen kanssa olit? Kerro esimerkki."
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_20_yhteinen"
        label="Mitä yhteistä hyvää vahvuutesi edistivät, miten?"
        rows={3}
        onSaveStateChange={onSaveStateChange}
      />
    </div>
  );
}

// ----- S21 (PDF p26): Pohdi onnistumisia ja täydennä! -----
function S21({ onSaveStateChange }: Props) {
  const stems: Array<{ k: string; label: string }> = [
    { k: "screen_21_ylpea",     label: "Tästä onnistumisesta olen ylpeä" },
    { k: "screen_21_sinnikas",  label: "Olin sinnikäs kun" },
    { k: "screen_21_kehut",     label: "Sain kehuja ja kannustusta seuraavista asioista" },
    { k: "screen_21_rohkea",    label: "Olin rohkea kohdatessani tämän uuden haasteen" },
    { k: "screen_21_tavoite",   label: "Saavutin tämän tärkeän tavoitteen" },
    { k: "screen_21_tunne",     label: "Minusta tuntuu tällä hetkellä tältä, kun muistelen kokemaani" },
    { k: "screen_21_vahvuudet", label: "Tunnistin nämä vahvuudet jotka mahdollistivat onnistumisen" },
    { k: "screen_21_uudet",     label: "Löysin itsestäni tilanteessa uusia tai yllättäviä puolia" },
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s21-h">
        <h1 className="font-display text-2xl">Pohdi onnistumisia ja täydennä!</h1>
      </StickyNote>
      <div className="grid gap-3">
        {stems.map((s) => (
          <ReflectionTextarea
            key={s.k}
            fieldKey={s.k}
            label={s.label}
            rows={2}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// ----- S22 (PDF p27): Tulevaisuuden muistelu -----
function S22({ onSaveStateChange }: Props) {
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s22-h">
        <h1 className="font-display text-2xl">Tulevaisuuden muistelu</h1>
      </StickyNote>
      <ReflectionTextarea
        fieldKey="screen_22_tulevaisuus"
        label="Mieti jotain tilannetta opinnoissa tai vapaa-ajalla, jossa voit lähitulevaisuudessa hyödyntää vahvuuksiasi? Mikä tulee menemään hyvin? Mistä voit huomata, että olet hyödyntänyt vahvuuksiasi tietoisemmin?"
        rows={5}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_22_oppi"
        label="Mieti jotain tilannetta, jossa et onnistunut hyödyntämään vahvuuksiasi, tai käytit niitä liikaa? Mitä tämä tilanne opetti sinulle?"
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
      <p className="text-center text-xs opacity-70">
        Seuraava osio rakennetaan seuraavassa vaiheessa.
      </p>
    </div>
  );
}

const REGISTRY: Record<number, (p: Props) => ReactNode> = {
  1: () => <Cover />,
  2: () => <Modules />,
  3: () => <Quote />,
  4: () => <Definition />,
  5: (p) => <Tieto {...p} />,
  6: (p) => <StrengthsList {...p} />,
  7: () => <ThreeSteps />,
  8: (p) => <JokoTunnet {...p} />,
  9: (p) => <KysyPalautetta {...p} />,
  10: (p) => <MinaOlen {...p} />,
  11: () => <M1Intro />,
  12: (p) => <Karkkikauppa {...p} />,
  13: (p) => <S13 {...p} />,
  14: (p) => <S14 {...p} />,
  15: () => <S15 />,
  16: (p) => <S16 {...p} />,
  17: (p) => <S17 {...p} />,
  18: (p) => <S18 {...p} />,
  19: () => <S19 />,
  20: (p) => <S20 {...p} />,
  21: (p) => <S21 {...p} />,
  22: (p) => <S22 {...p} />,
};

export function hasContent(n: number): boolean {
  return n in REGISTRY;
}

export function ScreenContent({ n, onSaveStateChange }: { n: number } & Props): ReactNode {
  const Comp = REGISTRY[n];
  if (!Comp) return null;
  return Comp({ onSaveStateChange });
}
