import type { ReactNode } from "react";
import { StickyNote } from "@/components/StickyNote";
import { WORLDS } from "@/lib/screens";

// Prologi screens 3–6: the workbook intro. Screens 1–2 are still
// placeholders until Batch 3; gating only requires 3–6 to advance to /7.

export const PROLOGI_GATED = [3, 4, 5, 6] as const;

export function isPrologiContentScreen(n: number): boolean {
  return (PROLOGI_GATED as readonly number[]).includes(n);
}

function Screen3() {
  const modules = WORLDS.filter((w) => w.id.startsWith("m"));
  return (
    <div className="space-y-6">
      <StickyNote tone="yellow" seed="s3-intro">
        <h1 className="text-3xl mb-2">Vahvuusseikkailun maailmat</h1>
        <p className="text-base leading-relaxed">
          Tervetuloa! Seikkailusi vie sinut kuuden maailman läpi. Jokaisessa maailmassa keräät
          <strong> vahvuuskarkkeja</strong> — pieniä makeisia, jotka kuvaavat omia vahvuuksiasi.
          Kerätyt karkit putoavat omaan <strong>vahvuusportfolioosi</strong>, lasipurkkiin, joka
          täyttyy matkan edetessä. Matkan lopussa purkki on täynnä ja olet rakentanut itsellesi
          oman vahvuuskartan.
        </p>
      </StickyNote>

      <div className="grid gap-3 sm:grid-cols-2">
        {modules.map((w) => (
          <StickyNote key={w.id} seed={`mod-${w.id}`} tone={w.tone === "purple" ? "white" : w.tone}>
            <div className="flex items-start gap-3">
              <div className="text-3xl leading-none">{w.emoji}</div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide opacity-70">{w.title}</div>
                <div className="font-display text-lg leading-tight">{w.subtitle}</div>
                <p className="mt-1 text-sm opacity-90">{moduleBlurb(w.id)}</p>
              </div>
            </div>
          </StickyNote>
        ))}
      </div>
    </div>
  );
}

function moduleBlurb(id: string): string {
  switch (id) {
    case "m1": return "Tutustu 24 luonteenvahvuuteen ja löydä omat ydinvahvuutesi.";
    case "m2": return "Poimi vahvuuskarkit, jotka kuvaavat sinua juuri nyt.";
    case "m3": return "Katso itseäsi toisten silmin — mitä läheiset sinussa näkevät?";
    case "m4": return "Mitkä asiat ovat sinulle tärkeitä? Mikä saa sydämen sykkimään?";
    case "m5": return "Bongaa kaverisi vahvuuksia ja anna vahvuuspalautetta.";
    case "m6": return "Kokoa oppimasi — mitä viet seikkailusta mukanasi?";
    default: return "";
  }
}

function Screen4() {
  return (
    <div className="space-y-5">
      <StickyNote tone="coral" seed="s4-candy">
        <div className="text-5xl mb-2">🍬</div>
        <h1 className="text-3xl mb-3">Vahvuuskarkit</h1>
        <p className="text-base leading-relaxed">
          Kuvittele, että jokainen sinun vahvuutesi on oma <strong>karkki</strong>. Toiset karkit
          maistuvat tutuilta — niitä käytät joka päivä ilman, että edes huomaat. Toiset ovat
          uudempia makuja, joita olet vasta opettelemassa.
        </p>
      </StickyNote>
      <StickyNote seed="s4-howto" tone="white">
        <p className="text-base leading-relaxed">
          Matkalla bongaat karkkeja itsestäsi, ystävistäsi ja läheisistäsi. Joka kerta, kun
          tunnistat vahvuuden, <strong>poimit karkin talteen</strong>. Karkki ei katoa — se
          siirtyy suoraan omaan vahvuusportfolioosi.
        </p>
      </StickyNote>
    </div>
  );
}

function Screen5() {
  return (
    <div className="space-y-5">
      <StickyNote tone="mint" seed="s5-jar">
        <div className="text-5xl mb-2">🫙</div>
        <h1 className="text-3xl mb-3">Vahvuusportfolio — sinun purkkisi</h1>
        <p className="text-base leading-relaxed">
          <strong>Vahvuusportfolio</strong> on kuin iso lasipurkki, joka kulkee mukanasi koko
          seikkailun ajan. Jokainen karkki, jonka poimit, putoaa purkkiin kilahtaen.
        </p>
      </StickyNote>
      <StickyNote seed="s5-why" tone="white">
        <p className="text-base leading-relaxed">
          Purkki ei ole arvosana eikä tutkielma. Se on <strong>oma kokoelmasi</strong> — todiste
          siitä, mitä sinussa jo on. Kun joskus epäilet itseäsi, voit avata purkin ja muistaa,
          mistä on tehty.
        </p>
      </StickyNote>
    </div>
  );
}

function Screen6() {
  return (
    <div className="space-y-5">
      <StickyNote tone="yellow" seed="s6-go">
        <div className="text-5xl mb-2">🗺️</div>
        <h1 className="text-3xl mb-3">Valmiina lähtöön?</h1>
        <p className="text-base leading-relaxed">
          Seuraavaksi avautuu <strong>Maailma 1: Vahvuuksien maa</strong>. Siellä tutustut
          kahteenkymmeneenneljään luonteenvahvuuteen ja alat poimia ensimmäisiä karkkejasi
          purkkiin.
        </p>
      </StickyNote>
      <StickyNote seed="s6-tips" tone="white">
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Voit liikkua vapaasti edestakaisin nuolilla.</li>
          <li>Vastauksesi tallentuvat automaattisesti — näet sen oikealla ylhäällä.</li>
          <li>Voit jatkaa milloin tahansa siitä, mihin jäit.</li>
        </ul>
      </StickyNote>
    </div>
  );
}

export function PrologiScreen({ n }: { n: number }): ReactNode {
  if (n === 3) return <Screen3 />;
  if (n === 4) return <Screen4 />;
  if (n === 5) return <Screen5 />;
  if (n === 6) return <Screen6 />;
  return null;
}