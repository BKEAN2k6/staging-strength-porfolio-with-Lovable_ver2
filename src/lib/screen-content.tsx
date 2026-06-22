import type { ReactNode } from "react";
import { StickyNote } from "@/components/StickyNote";
import { WORLDS } from "@/lib/screens";
import { ReflectionTextarea, ReflectionInput } from "@/components/ReflectionTextarea";
import { SelectableChips } from "@/components/SelectableChips";
import type { SaveState } from "@/hooks/use-autosave";

// Screens 1–12: real content sourced from the workbook PDF
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
        />
      </div>
    </div>
  );
}

function ThreeSteps() {
  const steps = [
    { t: "Tunnista", emoji: "🔎", b: "Huomaa, milloin vahvuutesi pääsevät esiin arjessa.", tone: "yellow" as const },
    { t: "Kehitä",   emoji: "🌱", b: "Harjoittele uusia tapoja käyttää vahvuuksiasi.",     tone: "mint" as const },
    { t: "Hyödynnä", emoji: "🚀", b: "Käytä vahvuuksiasi opinnoissa, kotona ja ystävien kanssa.", tone: "coral" as const },
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s7-h">
        <h1 className="font-display text-2xl">Vahvuusmatkan kolme askelta</h1>
      </StickyNote>
      <div className="grid gap-3 sm:grid-cols-3">
        {steps.map((s) => (
          <StickyNote key={s.t} tone={s.tone} seed={`s7-${s.t}`} className="text-center">
            <div className="text-4xl mb-2">{s.emoji}</div>
            <div className="font-display text-xl mb-1">{s.t}</div>
            <p className="text-sm">{s.b}</p>
          </StickyNote>
        ))}
      </div>
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

function M1Intro() {
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s11-h" className="text-center">
        <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Moduuli 1</div>
        <h1 className="font-display text-4xl leading-tight">1. Omat ydinvahvuudet</h1>
        <div className="text-5xl mt-3">🌟</div>
      </StickyNote>
      <StickyNote seed="s11-b" tone="white">
        <p className="text-base leading-relaxed">
          Tässä moduulissa tutustut omiin <strong>ydinvahvuuksiisi</strong>. Opit
          tunnistamaan ne vahvuudet, jotka tekevät juuri sinusta sinut. Matkan varrella
          poimit niitä mukaasi <strong>vahvuuskarkkeina</strong> ja kokoat ne omaan
          vahvuusportfolioosi.
        </p>
      </StickyNote>
    </div>
  );
}

function Karkkikauppa() {
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s12-h" className="text-center">
        <div className="text-5xl mb-2">🍬🍭🍫</div>
        <h1 className="font-display text-3xl leading-tight">Ydinvahvuuksien karkkikauppa</h1>
      </StickyNote>
      <StickyNote seed="s12-b" tone="white">
        <p className="text-base leading-relaxed mb-2">
          Tervetuloa karkkikauppaan! Hyllyillä odottaa <strong>24 erilaista
          vahvuuskarkkia</strong> — yksi jokaiselle luonteenvahvuudelle. Pian saat
          poimia niistä <strong>viisi omaa ydinvahvuuskarkkiasi</strong>.
        </p>
        <p className="text-sm leading-relaxed opacity-90">
          Älä mieti liian pitkään: valitse ne karkit, jotka tuntuvat kaikkein
          eniten omilta. Niitä, joita käytät usein ja jotka antavat sinulle
          energiaa.
        </p>
      </StickyNote>
      <p className="text-center text-xs opacity-70">
        Seuraavissa näytöissä pääset valitsemaan omat karkkisi.
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
  12: () => <Karkkikauppa />,
};

export function hasContent(n: number): boolean {
  return n in REGISTRY;
}

export function ScreenContent({ n, onSaveStateChange }: { n: number } & Props): ReactNode {
  const Comp = REGISTRY[n];
  if (!Comp) return null;
  return Comp({ onSaveStateChange });
}