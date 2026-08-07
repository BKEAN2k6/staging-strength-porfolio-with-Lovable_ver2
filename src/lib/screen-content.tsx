import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { StickyNote } from "@/components/StickyNote";
import { WORLDS } from "@/lib/screens";
import { ReflectionTextarea, ReflectionInput } from "@/components/ReflectionTextarea";
import { SelectableChips } from "@/components/SelectableChips";
import { useAutosave, loadResponse, type SaveState } from "@/hooks/use-autosave";
import { useReportCompletion } from "@/lib/screen-completion";
import { cn } from "@/lib/utils";
import { useTr, useLanguage } from "@/lib/i18n";
import { getStrengthColor, getStrengthName } from "@/lib/strengths-i18n";

// Screens 1–22: content sourced verbatim from the workbook PDF
// "Vahvuusportfolio lukiolaiselle" (Huomaa hyvä!®).

export const STRENGTHS_24 = [
  "Rohkeus",
  "Luovuus",
  "Innostus",
  "Reiluus",
  "Sisukkuus",
  "Myötätunto",
  "Huumorintaju",
  "Ystävällisyys",
  "Kauneuden ja erinomaisuuden arvostus",
  "Oppimisen ilo",
  "Rehellisyys",
  "Sosiaalinen älykkyys",
  "Sinnikkyys",
  "Kiitollisuus",
  "Henkisyys",
  "Johtajuus",
  "Toiveikkuus",
  "Anteeksiantavuus",
  "Arviointikyky",
  "Uteliaisuus",
  "Itsesäätely",
  "Rakkaus",
  "Näkökulmanottokyky",
  "Harkitsevaisuus",
  "Vaatimattomuus",
  "Ryhmätyötaidot",
];

type Props = { onSaveStateChange?: (s: SaveState) => void };

// ------------------------------------------------------------------
// FIX: helper to translate multi-line strings ("\n" -> <br />) so that
// headings/paragraphs that used to be hardcoded JSX with <br /> can now
// be run through tr() as a single translatable string.
// ------------------------------------------------------------------
function trLines(
  tr: (key: string, params?: Record<string, string | number>) => string,
  text: string,
) {
  const translated = tr(text);
  const parts = translated.split("\n");
  return parts.map((line, i) => (
    <span key={i}>
      {line}
      {i < parts.length - 1 && <br />}
    </span>
  ));
}

function Cover() {
  const tr = useTr();

  return (
    <div className="relative flex h-full min-h-[620px] w-full flex-col overflow-hidden px-[5%] text-center font-display text-white">
      <div className="relative z-10 flex shrink-0 flex-col items-center pt-[7vh]">
        <div className="text-[clamp(24px,2.4vw,42px)] font-bold leading-none tracking-[0] text-white">
          {tr("Huomaa hyvä!®")}
        </div>

        <h1
          className="
            mt-[3vh]
            max-w-[900px]
            text-[clamp(30px,3.4vw,48px)]
            font-medium
            leading-[1.08]
            tracking-[0]
            text-white
          "
        >
          {" "}
          {trLines(tr, "Vahvuusportfolio\nlukiolaiselle")}
        </h1>
      </div>

      <div className="relative z-0 flex min-h-0 flex-1 items-end justify-center pb-[8vh] pt-[6vh]">
        <img
          src="/illustrations/naytto-1.png"
          alt=""
          aria-hidden="true"
          className="
    pointer-events-none
    block
    h-auto
    w-[900px]
    max-w-none
    object-contain
    object-center
    select-none
    translate-y-40
  "
        />
      </div>
    </div>
  );
}

//=============Tarot======================//

function Modules() {
  const tr = useTr();

  const moduleKeys = [
    {
      id: "m1",
      translationKey:
        "1 – Omat ydinvahvuudet | Tutustut ja opit omista luonteenvahvuuksista. | sivut 16–33",
    },
    {
      id: "m2",
      translationKey:
        "2 – Omat vahvuudet lukiossa | Tutustut henkilökohtaisiin vahvuuksiin opiskelijana. Opit kysymään palautetta opettajilta ja opiskelukavereilta. | sivut 34–46",
    },
    {
      id: "m3",
      translationKey:
        "3 – Omat vahvuudet kotona | Tutustut henkilökohtaisiin vahvuuksiin kotona. Myös vanhemmat / läheiset kertovat sinun vahvuuksistasi. | sivut 47–52",
    },
    {
      id: "m4",
      translationKey:
        "4 – Omat vahvuudet vapaa-ajalla ja harrastuksissa | Tutustut omiin vahvuuksiin ja niiden hyödyntämiseen vapaa-ajalla. | sivut 53–60",
    },
    {
      id: "m5",
      translationKey:
        "5 – Omat vahvuudet ystävyyssuhteissa | Tutustut omiin vahvuuksiin ystävyyssuhteissa. Opit kysymään ja antamaan palautetta. | sivut 61–64",
    },
    {
      id: "m6",
      translationKey:
        "6 – Vahvuusportfolion kokoaminen | Reflektoi oppimaasi ja hyödynnä omia vahvuuksiasi – esimerkiksi kesätyönhaussa. | sivut 65–76",
    },
  ] as const;

  const modules = WORLDS.filter((world) => moduleKeys.some((item) => item.id === world.id));

  return (
    <div className="relative min-h-[620px] w-full overflow-x-hidden overflow-y-auto px-[4%] pb-10 pt-8">
      <h1 className="mb-10 text-center font-display text-[clamp(28px,2.6vw,40px)] font-semibold leading-[1.15] tracking-[-0.02em] text-white">
        {tr("Taso")}
      </h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {modules.map((module, index) => {
          const moduleKey = moduleKeys.find((item) => item.id === module.id);
          const translated = moduleKey ? tr(moduleKey.translationKey) : "";
          const [rawTitle = "", description = ""] = translated.split(" | ");
          const title = rawTitle.replace(/^\d+\s*–\s*/, "");

          return (
            <div
              key={module.id}
              className="relative flex min-h-[330px] min-w-0 flex-col rounded-[22px] border-2 border-black bg-white px-4 pb-6 pt-11 text-center text-white"
            >
              <div className="absolute left-1/2 top-0 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-black bg-[#7755c9] text-[22px] font-semibold text-white">
                {index + 1}
              </div>

              <h2 className="mb-4 break-words font-display text-[clamp(16px,1.35vw,22px)] font-semibold leading-[1.15] text-[#7654ad]">
                {title}
              </h2>

              <p className="break-words text-[clamp(15px,1vw,18px)] leading-[1.3] text-[#7654ad]">
                {description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function mapTone(tone: string): "white" | "yellow" | "mint" | "coral" {
  if (tone === "yellow" || tone === "mint" || tone === "coral") return tone;
  return "white";
}

function Quote() {
  const tr = useTr();
  const { language } = useLanguage();

  const illustrationSrc =
    language === "en"
      ? "/illustrations/naytto-2-en.png"
      : language === "sv"
        ? "/illustrations/naytto-2-sv.png"
        : "/illustrations/naytto-2.png";

  return (
    <div className="grid min-h-[600px] w-full min-w-0 grid-cols-[60%_40%] overflow-hidden">
      <div className="flex min-w-0 flex-col justify-center pl-[2%] pr-[3%] text-white">
        <h1
          className="
            m-0
            text-center
            font-display
            font-normal
            tracking-[-0.01em]
            text-white
          "
        >
          <span
            className="
              block
              text-[clamp(34px,4vw,56px)]
              font-medium
              leading-[1.15]
            "
          >
            {tr("Panosta vahvuuksiisi.")}
          </span>

          <span
            className="
              mx-auto
              mt-4
              block
              max-w-[780px]
              text-[clamp(22px,2.5vw,36px)]
              font-normal
              leading-[1.3]
            "
          >
            {tr("Kasvat eniten niillä alueilla, joilla olet jo vahva.")}
          </span>
        </h1>
      </div>

      <div className="flex min-w-0 items-center justify-end pr-0">
        <img
          src={illustrationSrc}
          alt=""
          aria-hidden="true"
          className="
            pointer-events-none
            block
            h-auto
            max-h-full
            w-auto
            max-w-full
            object-contain
          "
        />
      </div>
    </div>
  );
}

function Definition() {
  const tr = useTr();

  return (
    <div className="relative flex min-h-[600px] w-full items-center justify-center overflow-hidden px-6 text-white">
      <h1
        className="
          mx-auto
          max-w-[1150px]
          text-center
          font-display
          font-normal
          tracking-[-0.01em]
          text-white
        "
      >
        <span
          className="
            block
            text-[clamp(30px,3.4vw,48px)]
            font-medium
            leading-[1.18]
          "
        >
          {tr(
            "Vahvuudet eivät ole ominaisuuksia, joissa olet hyvä, eivätkä heikkoudet niitä, joissa tunnet itsesi huonoksi.",
          )}
        </span>

        <span
          className="
            mx-auto
            mt-5
            block
            max-w-[980px]
            text-[clamp(22px,2.5vw,34px)]
            font-normal
            leading-[1.3]
          "
        >
          {tr(
            "Sen sijaan vahvuudet tekevät kantajastaan vahvan ja heikkoudet toimivat päinvastoin.",
          )}
        </span>
      </h1>
    </div>
  );
}

function Tieto({ onSaveStateChange: _onSaveStateChange }: Props) {
  const tr = useTr();

  return (
    <div
      className="
        relative
        min-h-[600px]
        w-full
        overflow-hidden
        px-[5%]
        pb-12
        pt-8
        text-white
      "
    >
      <div
        className="
          grid
          min-h-[540px]
          w-full
          grid-cols-[62%_38%]
          items-center
          gap-8
        "
      >
        {/* =========================
            BÊN TRÁI: TEXT
        ========================== */}
        <div className="min-w-0">
          {/* PHẦN CHỮ LỚN */}
          <div className="max-w-[900px]">
            <h1
              className="
                mb-5
                font-display
                text-[clamp(32px,3.2vw,48px)]
                font-medium
                leading-[1.12]
                tracking-[-0.015em]
                text-white
              "
            >
              {tr("Tietoa vahvuuksista")}
            </h1>

            <p
              className="
                font-display
                text-[clamp(21px,1.85vw,28px)]
                font-normal
                leading-[1.42]
                tracking-[-0.005em]
                text-white
              "
            >
              {tr(
                "Luonteenvahvuudet ovat persoonan myönteisiä piirteitä, joita hyödyntämällä sinä, opiskelukaverisi ja monenlaiset yhteisöt, kuten lukiot, voivat kukoistaa. Niitä ovat esimerkiksi sinnikkyys, uteliaisuus, rohkeus ja myötätuntoisuus. Jokaisella opiskelijalla on vahvuuksia ja kehittymässä olevaa vahvuuspotentiaalia. Vahvuuksien voi ajatella heijastelevan sitä, millainen kukin meistä on ihmisenä parhaimmillaan.",
              )}
            </p>
          </div>

          {/* PHẦN CHỮ NHỎ */}
          <div
            className="
              mt-7
              max-w-[880px]
              space-y-4
              font-display
              text-[clamp(16px,1.25vw,19px)]
              font-normal
              leading-[1.5]
              text-white
            "
          >
            <p>
              {tr(
                "Vahvuudet auttavat haasteiden kohtaamisessa ja edistävät niistä ylipääsemisessä eli selviytymisessä. Taidoilla ja vahvuuksilla on eroa. Taidot ovat opittuja, kun taas vahvuudet ovat itselle luontaisia ja tärkeitä ajattelu- ja toimintatapoja.",
              )}
            </p>

            <p>
              {tr(
                "Jokaisella on omat ydinvahvuutensa, joihin kannattaa keskittyä ja joita on järkevää vahvistaa! Omien vahvuuksien tunteminen ja niiden hyödyntäminen opiskelussa ja vapaa-ajalla lisää tyytyväisyyttä, opiskelun mielekkyyttä ja hyvinvointia.",
              )}
            </p>

            <p className="pt-1 font-medium">{tr("Tervetuloa mukaan lukiolainen!")}</p>
          </div>
        </div>

        {/* =========================
            BÊN PHẢI: ILLUSTRATION
        ========================== */}
        <div
          className="
            flex
            min-w-0
            items-center
            justify-center
          "
        >
          <img
            src="/illustrations/tieto-vahvuuksista.png"
            alt=""
            aria-hidden="true"
            className="
              pointer-events-none
              block
              h-auto
              w-full
              max-w-[430px]
              object-contain
              object-center
              select-none
            "
          />
        </div>
      </div>
    </div>
  );
}

// S6
function StrengthsList({ onSaveStateChange: _onSaveStateChange }: Props) {
  const tr = useTr();

  const strengths = [
    {
      id: 1,
      text: "Rohkeus",
      color: "#bfe9f7",
      border: "#48a9d0",
    },
    {
      id: 2,
      text: "Ystävällisyys",
      color: "#ffd9ad",
      border: "#ed8a32",
    },
    {
      id: 3,
      text: "Kiitollisuus",
      color: "#ffe7a1",
      border: "#e7ab1b",
    },
    {
      id: 4,
      text: "Itsesäätely",
      color: "#ccecf7",
      border: "#48a9d0",
    },

    {
      id: 5,
      text: "Luovuus",
      color: "#ccebcf",
      border: "#55a667",
    },
    {
      id: 6,
      text: "Henkisyys",
      color: "#bfe9f7",
      border: "#48a9d0",
    },
    {
      id: 7,
      text: "Rakkaus",
      color: "#ffd1d1",
      border: "#e36c6c",
    },
    {
      id: 8,
      text: "Innostus",
      color: "#ffd1d1",
      border: "#e36c6c",
    },

    {
      id: 9,
      text: "Johtajuus",
      color: "#ccebcf",
      border: "#55a667",
    },
    {
      id: 10,
      text: "Toiveikkuus",
      color: "#ffd1d1",
      border: "#e36c6c",
    },
    {
      id: 11,
      text: "Reiluus",
      color: "#ffd9ad",
      border: "#ed8a32",
    },
    {
      id: 12,
      text: "Oppimisen ilo",
      color: "#ffe7a1",
      border: "#e7ab1b",
    },

    {
      id: 13,
      text: "Anteeksiantavuus",
      color: "#ffe7a1",
      border: "#e7ab1b",
    },
    {
      id: 14,
      text: "Sisukkuus",
      color: "#ffe7a1",
      border: "#e7ab1b",
    },
    {
      id: 15,
      text: "Rehellisyys",
      color: "#bfe9f7",
      border: "#48a9d0",
    },
    {
      id: 16,
      text: "Arviointikyky",
      color: "#ffd9ad",
      border: "#ed8a32",
    },

    {
      id: 17,
      text: "Myötätunto",
      color: "#ccebcf",
      border: "#55a667",
    },
    {
      id: 18,
      text: "Sosiaalinen älykkyys",
      color: "#ded2f2",
      border: "#7654ad",
    },
    {
      id: 19,
      text: "Uteliaisuus",
      color: "#ffd1d1",
      border: "#e36c6c",
    },
    {
      id: 20,
      text: "Ryhmätyötaidot",
      color: "#bfe9f7",
      border: "#48a9d0",
    },
  ];

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  function toggleStrength(id: number) {
    setSelectedIds((currentIds) => {
      const alreadySelected = currentIds.includes(id);

      if (alreadySelected) {
        return currentIds.filter((selectedId) => selectedId !== id);
      }

      if (currentIds.length >= 3) {
        return currentIds;
      }

      return [...currentIds, id];
    });
  }

  const selectedStrengths = strengths.filter((strength) => selectedIds.includes(strength.id));

  const selectionIsFull = selectedIds.length >= 3;

  return (
    <div className="relative min-h-[620px] w-full overflow-hidden px-6 pb-5 pt-5 text-white">
      <div className="grid min-h-[570px] grid-cols-[0.58fr_2fr] items-center gap-6">
        <div className="relative flex min-w-0 flex-col items-center justify-center">
          <div className="relative h-[210px] w-full max-w-[190px]">
            <img
              src="/illustrations/naytto-3.png"
              alt={tr("Luonteenvahvuudet, joita voit tunnistaa itsessäsi ja toisissa ihmisissä")}
              className="absolute inset-0 h-full w-full object-contain"
            />

            <div className="absolute bottom-[30px] left-1/2 z-20 flex w-[180px] -translate-x-1/2 flex-col items-center gap-2">
              {selectedStrengths.map((strength, index) => (
                <button
                  key={strength.id}
                  type="button"
                  onClick={() => toggleStrength(strength.id)}
                  className={`
                    max-w-[165px]
                    rounded-full
                    border-2
                    px-4
                    py-2
                    text-center
                    text-[12px]
                    font-semibold
                    leading-[1.1]
                    shadow-sm
                    transition-transform
                    hover:scale-105
                    ${index === 0 ? "-rotate-3" : ""}
                    ${index === 1 ? "rotate-2" : ""}
                    ${index === 2 ? "-rotate-1" : ""}
                  `}
                  style={{
                    backgroundColor: strength.color,
                    borderColor: strength.border,
                  }}
                >
                  {tr(strength.text)}
                </button>
              ))}
            </div>
          </div>

          <div className="-mt-3 flex items-center justify-center gap-2 text-[#ffd12f]">
            <span className="rotate-[-30deg] text-[40px] leading-[1.12]">↗</span>

            <p className="text-center text-[14px] font-medium leading-[1.3]">
              {tr(
                "Valitse ne vahvuudet, jotka tunnistat itsessäsi tai läheisissäsi. Voit palata muokkaamaan valintaasi myöhemmin.",
              )}
            </p>
          </div>

          <p className="mt-2 text-[13px] font-medium text-white">
            {tr("Valittu {n} / {max}", {
              n: selectedIds.length,
              max: 3,
            })}
          </p>
        </div>

        <div className="min-w-0 pl-2">
          <h1 className="max-w-[950px] font-display text-[32px] font-semibold leading-[1.12]">
            {tr("Luonteenvahvuudet, joita voit tunnistaa itsessäsi ja toisissa ihmisissä")}
          </h1>

          <p className="mb-5 mt-2 text-[19px]">{tr("Keksitkö lisää?")}</p>

          <div className="grid grid-cols-4 justify-items-center gap-x-2 gap-y-5">
            {strengths.map((strength) => {
              const isSelected = selectedIds.includes(strength.id);

              const selectionDisabled = selectionIsFull && !isSelected;

              return (
                <button
                  key={strength.id}
                  type="button"
                  disabled={selectionDisabled}
                  onClick={() => toggleStrength(strength.id)}
                  className={`
                    group
                    flex
                    w-full
                    min-w-0
                    items-center
                    justify-center
                    transition-all
                    duration-150
                    ${isSelected ? "scale-105" : ""}
                    ${selectionDisabled ? "cursor-not-allowed opacity-35" : "hover:scale-105"}
                  `}
                >
                  <span
                    aria-hidden="true"
                    className="
                      h-[40px]
                      w-[18px]
                      shrink-0
                      [clip-path:polygon(100%_0,100%_100%,0_78%,30%_50%,0_22%)]
                    "
                    style={{
                      backgroundColor: strength.color,
                      border: `2px solid ${strength.border}`,
                    }}
                  />

                  <span
                    className={`
                      -mx-[2px]
                      flex
                      min-h-[48px]
                      w-[155px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-[50%]
                      border-2
                      px-2
                      py-1
                      text-center
                      text-[11px]
                      font-semibold
                      leading-[1.12]
                      whitespace-nowrap
                      shadow-[0_4px_0_rgba(0,0,0,0.08)]
                      ${isSelected ? "ring-4 ring-[#7755c9]/30" : ""}
                    `}
                    style={{
                      backgroundColor: strength.color,
                      borderColor: strength.border,
                    }}
                  >
                    <span>{tr(strength.text)}</span>
                  </span>

                  <span
                    aria-hidden="true"
                    className="
                      h-[40px]
                      w-[18px]
                      shrink-0
                      [clip-path:polygon(0_0,0_100%,100%_78%,70%_50%,100%_22%)]
                    "
                    style={{
                      backgroundColor: strength.color,
                      border: `2px solid ${strength.border}`,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// S7 (PDF p7): only three short phrases on the page. No invented blurbs.
function ThreeSteps() {
  const tr = useTr();

  return (
    <div className="relative min-h-[620px] w-full overflow-hidden">
      {/* LEFT */}
      <div className="absolute left-[5%] top-[9%] flex w-[30%] flex-col items-center">
        <div className="flex h-[430px] w-full items-center justify-center">
          <img
            src="/illustrations/illustration-left-transparent.png"
            alt={tr("Tunnista omia vahvuuksia")}
            className="
              h-[400px]
              w-auto
              max-w-full
              object-contain
            "
          />
        </div>

        <p
          className="
            mt-3
            text-center
            font-display
            text-[24px]
            font-semibold
            text-white
            [-webkit-text-stroke:1px_#000]
            [paint-order:stroke_fill]
          "
        >
          {tr("Tunnista omia vahvuuksia")}
        </p>
      </div>

      {/* CENTER */}
      <div className="absolute left-1/2 top-[4%] flex w-[30%] -translate-x-1/2 flex-col items-center">
        <div className="flex h-[430px] w-full items-center justify-center">
          <img
            src="/illustrations/illustration-center-transparent.png"
            alt={tr("Hyödynnä omia vahvuuksia")}
            className="
              h-[430px]
              w-auto
              max-w-full
              object-contain
            "
          />
        </div>

        <p
          className="
            mt-3
            whitespace-nowrap
            text-center
            font-display
            text-[24px]
            font-semibold
            text-white
            [-webkit-text-stroke:1px_#000]
            [paint-order:stroke_fill]
          "
        >
          {tr("Hyödynnä omia vahvuuksia")}
        </p>
      </div>

      {/* RIGHT */}
      <div className="absolute right-[5%] top-[9%] flex w-[30%] flex-col items-center">
        <div className="flex h-[430px] w-full items-center justify-center">
          <img
            src="/illustrations/illustration-right-transparent.png"
            alt={tr("Kehitä omia vahvuuksia")}
            className="
              h-[400px]
              w-auto
              max-w-full
              object-contain
            "
          />
        </div>

        <p
          className="
            mt-3
            text-center
            font-display
            text-[24px]
            font-semibold
            text-white
            [-webkit-text-stroke:1px_#000]
            [paint-order:stroke_fill]
          "
        >
          {tr("Kehitä omia vahvuuksia")}
        </p>
      </div>
    </div>
  );
}

function JokoTunnet({ onSaveStateChange }: Props) {
  const tr = useTr();

  const questions = [
    {
      fieldKey: "screen_8_s8_love",
      text: "Tiedätkö, mitä rakastat tehdä?",
    },
    {
      fieldKey: "screen_8_s8_freetime",
      text: "Mitkä ovat kiinnostuksen kohteesi vapaa-ajalla?",
    },
    {
      fieldKey: "screen_8_s8_motivate",
      text: "Minkä alkamista odotat, entä mistä koulutehtävistä motivoidut eniten?",
    },
    {
      fieldKey: "screen_8_s8_authentic",
      text: "Milloin ja mitä tehdessä koet, että olet aidoimmillasi, eniten oma itsesi ja onnistut sinulle tärkeissä asioissa?",
    },
    {
      fieldKey: "screen_8_s8_persist",
      text: "Mitä tehdessä jaksat ponnistella sinnikkäästi ja ylittää haasteita, sekä kestät epämiellyttäviä tunteita?",
    },
  ] as const;

  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto
        px-[4%]
        pb-10
        pt-5
        text-black
        [scrollbar-gutter:stable]
      "
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <h1
          className="
            max-w-[900px]
            font-display
            text-[clamp(28px,2.4vw,38px)]
            font-medium
            leading-[1.18]
            tracking-[-0.01em]
            text-white
          "
        >
          {tr("Lukiolainen – joko tunnet omat vahvuutesi?")}
        </h1>

        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
          "
        >
          {questions.map((item, index) => {
            const isLast = index === questions.length - 1;

            return (
              <section
                key={item.fieldKey}
                className={`
                  flex
                  min-h-[235px]
                  min-w-0
                  flex-col
                  rounded-[22px]
                  border-[3px]
                  border-black
                  bg-[#faf8ff]
                  px-5
                  pb-5
                  pt-5
                  shadow-[0_6px_0_rgba(0,0,0,0.18)]
                  ${isLast ? "md:col-span-2" : ""}
                `}
              >
                <h2
                  className="
                    min-h-[58px]
                    text-left
                    font-display
                    text-[clamp(17px,1.35vw,21px)]
                    font-medium
                    leading-[1.35]
                    tracking-[-0.005em]
                    text-black
                  "
                >
                  {tr(item.text)}
                </h2>

                <div
                  className="
                    mt-4
                    min-h-0
                    flex-1
                    overflow-hidden
                    rounded-[16px]
                    border-[2px]
                    border-black
                    bg-white

                    [&_label]:hidden

                    [&>div]:h-full
                    [&>div]:min-h-0

                    [&_div]:border-0
                    [&_div]:bg-transparent
                    [&_div]:p-0
                    [&_div]:shadow-none

                    [&_textarea]:h-full
                    [&_textarea]:w-full
                    [&_textarea]:resize-none
                    [&_textarea]:rounded-[14px]
                    [&_textarea]:border-0
                    [&_textarea]:bg-transparent
                    [&_textarea]:px-4
                    [&_textarea]:py-3
                    [&_textarea]:text-[16px]
                    [&_textarea]:font-normal
                    [&_textarea]:leading-[1.5]
                    [&_textarea]:text-[#241b3f]
                    [&_textarea]:outline-none
                    [&_textarea]:shadow-none
                    [&_textarea]:ring-0
                    [&_textarea]:placeholder:text-[#9a93a6]

                    [&_textarea:focus]:outline-none
                    [&_textarea:focus]:ring-0
                  "
                >
                  <ReflectionTextarea
                    fieldKey={item.fieldKey}
                    label=""
                    rows={isLast ? 4 : 3}
                    onSaveStateChange={onSaveStateChange}
                  />
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KysyPalautetta({ onSaveStateChange }: Props) {
  const tr = useTr();

  const questions = [
    {
      fieldKey: "screen_9_best_sides",
      text: "Mitä uutta opin palautteista?",
    },
    {
      fieldKey: "screen_9_strengths",
      text: "Mikä palautteessa on minulle tärkeää?",
    },
    {
      fieldKey: "screen_9_learned",
      text: "Millaisista asioista minut muistetaan / tunnistetaan parhaiten?",
    },
    {
      fieldKey: "screen_9_spotted",
      text: "Mitä hyvää vahvuuteni ystävänä ja läheisenä tuovat yhteisööni?",
    },
  ] as const;

  return (
    <div className="relative h-full min-h-0 w-full overflow-x-hidden overflow-y-auto px-[7%] pb-10 pt-9 text-black">
      <div className="mx-auto w-full max-w-[1150px] rounded-[30px] px-10 py-8 pb-12">
        <h1 className="font-display text-[38px] font-medium leading-[1.1] text-[#f1f1ef]">
          {tr("Kysy palautetta ja opi lisää itsestäsi")}
        </h1>

        <p className="mt-6 max-w-[980px] text-[19px] font-normal leading-[1.45] text-[#f1f1ef]">
          {tr(
            "Kysy 2–4 läheiseltä, opettajalta ja ystävältä palautetta vahvuuksistasi. Käytä sivua 10 pohjana. Pyydä heitä nimeämään vahvuutesi, joita he sinussa eniten arvostavat. Kysy myös, missä ja miten vahvuutesi näkyvät.",
          )}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
          {questions.map((item) => (
            <section
              key={item.fieldKey}
              className="
                relative
                flex
                min-h-[230px]
                min-w-0
                flex-col
                rounded-[22px]
                border-[3px]
                border-black
                bg-[#faf8ff]
                px-5
                pb-5
                pt-5
                shadow-[0_6px_0_rgba(0,0,0,0.18)]
              "
            >
              <h2
                className="
                  min-h-[56px]
                  text-left
                  font-display
                  text-[18px]
                  font-medium
                  leading-[1.35]
                  text-black
                "
              >
                {tr(item.text)}
              </h2>

              <div
                className="
                  mt-4
                  min-h-0
                  flex-1
                  overflow-hidden
                  rounded-[16px]
                  border-2
                  border-black
                  bg-white

                  [&_label]:hidden

                  [&>div]:h-full
                  [&>div]:min-h-0

                  [&_div]:border-0
                  [&_div]:bg-transparent
                  [&_div]:p-0
                  [&_div]:shadow-none

                  [&_textarea]:h-full
                  [&_textarea]:min-h-[120px]
                  [&_textarea]:w-full
                  [&_textarea]:resize-none
                  [&_textarea]:rounded-[14px]
                  [&_textarea]:border-0
                  [&_textarea]:bg-transparent
                  [&_textarea]:px-4
                  [&_textarea]:py-3
                  [&_textarea]:text-[16px]
                  [&_textarea]:font-normal
                  [&_textarea]:leading-[1.5]
                  [&_textarea]:text-[#241b3f]
                  [&_textarea]:outline-none
                  [&_textarea]:shadow-none
                  [&_textarea]:ring-0
                  [&_textarea]:placeholder:text-[#9a93a6]

                  [&_textarea:focus]:outline-none
                  [&_textarea:focus]:ring-0
                "
              >
                <ReflectionTextarea
                  fieldKey={item.fieldKey}
                  label=""
                  rows={3}
                  onSaveStateChange={onSaveStateChange}
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function MinaOlen({ onSaveStateChange }: Props) {
  const tr = useTr();

  const notes = [
    {
      id: 1,
      position: "left-[0%] top-[3%] h-[205px] w-[29%] -rotate-[2deg]",
    },
    {
      id: 2,
      position: "left-[35.5%] top-[0%] h-[205px] w-[29%] rotate-[1deg]",
    },
    {
      id: 3,
      position: "right-[0%] top-[3%] h-[205px] w-[29%] rotate-[2deg]",
    },
    {
      id: 4,
      position: "left-[2%] top-[34%] h-[195px] w-[29%] rotate-[1deg]",
    },
    {
      id: 5,
      position: "left-[36%] top-[32%] h-[195px] w-[29%] -rotate-[1deg]",
    },
    {
      id: 6,
      position: "right-[0%] top-[34%] h-[195px] w-[29%] -rotate-[2deg]",
    },
    {
      id: 7,
      position: "left-[35.5%] top-[64%] h-[190px] w-[29%] rotate-[1deg]",
    },
  ];

  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto
        px-[3%]
        pb-16
        pt-6
        text-white
        [scrollbar-gutter:stable]
      "
    >
      <div className="grid min-h-[760px] grid-cols-[0.25fr_0.75fr] gap-7">
        {/* CỘT TRÁI */}
        <div className="relative min-w-0">
          <h1
            className="
              font-display
              text-[42px]
              font-medium
              leading-[1.12]
              tracking-[-0.01em]
            "
          >
            {tr("Minä olen")}
          </h1>

          <p
            className="
              mt-8
              max-w-[290px]
              font-display
              text-[22px]
              font-medium
              leading-[1.4]
            "
          >
            {tr("Muuta muilta saamasi palaute lauseiksi minä muotoon:")}
          </p>

          <div
            className="
              mt-7
              max-w-[290px]
              text-[21px]
              font-normal
              leading-[1.45]
            "
          >
            {tr('"Olet sinnikäs" → "Minä olen sinnikäs."')}
          </div>

          {/* ILLUSTRATION TO HƠN */}
          <img
            src="/illustrations/mina-olen-character.png"
            alt={tr("Minä olen –övning")}
            className="
              pointer-events-none
              absolute
              bottom-[-55px]
              left-[-95px]
              h-[520px]
              w-auto
              max-w-none
              select-none
              object-contain
            "
          />
        </div>

        {/* CỘT PHẢI */}
        <div className="relative min-h-[760px] min-w-0">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`
                absolute
                flex
                flex-col
                overflow-hidden
                rounded-[18px_14px_24px_16px]
                border-[3px]
                border-black
                bg-[#fffefa]
                px-5
                pb-4
                pt-4
                text-black
                shadow-[0_10px_0_#4b326c]
                transition-all
                duration-200
                hover:z-30
                hover:-translate-y-1
                hover:scale-[1.02]
                focus-within:ring-2
                focus-within:ring-[#d5c2ef]
                ${note.position}
              `}
            >
              {/* TIÊU ĐỀ BOX */}
              <p
                className="
                  mb-3
                  shrink-0
                  text-center
                  font-display
                  text-[15px]
                  font-medium
                  uppercase
                  leading-[1.2]
                  tracking-[0.2px]
                  text-black
                "
              >
                {tr("Minä olen ...")}
              </p>

              {/* VÙNG NHẬP */}
              <div
                className="
                  relative
                  min-h-0
                  flex-1
                  overflow-hidden
                  rounded-[12px]
                  border-2
                  border-black
                  bg-[#fffefa]
                  [&_label]:hidden
                  [&>div]:h-full
                  [&>div]:min-h-0
                  [&_div]:border-0
                  [&_div]:bg-transparent
                  [&_div]:p-0
                  [&_div]:shadow-none
                  [&_textarea]:relative
                  [&_textarea]:z-10
                  [&_textarea]:h-full
                  [&_textarea]:min-h-[125px]
                  [&_textarea]:w-full
                  [&_textarea]:resize-none
                  [&_textarea]:rounded-[10px]
                  [&_textarea]:border-0
                  [&_textarea]:bg-transparent
                  [&_textarea]:px-3
                  [&_textarea]:py-2
                  [&_textarea]:text-[16px]
                  [&_textarea]:font-normal
                  [&_textarea]:leading-[29px]
                  [&_textarea]:text-[#241b3f]
                  [&_textarea]:outline-none
                  [&_textarea]:shadow-none
                  [&_textarea]:ring-0
                  [&_textarea]:placeholder:text-[#9b93a8]
                  [&_textarea:focus]:outline-none
                  [&_textarea:focus]:ring-0
                "
              >
                {/* DÒNG KẺ GIẤY */}
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-x-3
                    inset-y-2
                    z-0
                    opacity-35
                    [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_28px,#b7a8cc_29px)]
                  "
                />

                {/* TEXTAREA */}
                <div className="relative z-10 h-full [&>div]:h-full">
                  <ReflectionTextarea
                    fieldKey={`screen_10_mina_olen_${note.id}`}
                    label=""
                    rows={5}
                    onSaveStateChange={onSaveStateChange}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// FIX: description trước đây là JSX hard-code tiếng Phần Lan, không qua tr().
// Nay chuyển description sang string (dùng "\n" thay cho <br/>) và render bằng trLines().
function S11KehuJaKannusta() {
  const tr = useTr();
  const items = [
    {
      title: "1. Huomaa hyvää!",
      description:
        "Harjoittele tunnistamaan myönteistä toimintaa ihmisissä ympärilläsi.\nTee hyvän huomaamisesta tapa ja tottumus.",
    },
    {
      title: "2. Nimeä käytetty vahvuus ja sano palaute ääneen tai liitä viestiin somessa.",
      description: "“Olit todella rohkea.” “Kiitos ystävällisyydestä”. “Sinussa on myötätuntoa”.",
    },
    {
      title: "3. Syvennä ja kuvaile, miten käytetty vahvuus näkyy toisessa. Sanallista tunne.",
      description: "“Olit rohkea. Huomasin, että uskalsit nostaa esille vaikeita asioita.”",
    },
    {
      title: "4. Arvosta ja kerro, miten käytetty vahvuus vaikuttaa. Liitä mukaan tunnesana.",
      description:
        "“Kiitos rohkeudestasi tänään. Tapasi toimia vaikuttaa myönteisesti koko ryhmään.\nOlen susta ylpeä.”",
    },
    {
      title: "5. Huomaa, miten positiivinen palaute ja vahvuuksista puhuminen vaikuttaa toiseen.",
      description: "Miltä sinusta tuntui antaa kehuja ja kiitosta? Mikä oli tärkein oivalluksesi?",
    },
  ];

  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto
       
        text-white
        [scrollbar-gutter:stable]
      "
    >
      <div
        className="
          relative
          mx-auto
          min-h-[720px]
          w-full
          max-w-[1500px]
          overflow-hidden
          px-[8%]
          pb-20
          pt-14
        "
      >
        <div className="relative z-20 grid grid-cols-[72px_minmax(0,1fr)] gap-x-8">
          <div
            className="
              mt-1
              flex
              h-[150px]
              w-[66px]
              items-center
              justify-center
              rounded-[9px]
              bg-[#7654ad]
              text-white
            "
          >
            <span className="rotate-180 whitespace-nowrap [writing-mode:vertical-rl] font-display text-[22px] font-semibold">
              {tr("VINKKI!")}
            </span>
          </div>

          <div className="min-w-0">
            <h1
              className="
                max-w-[980px]
                font-display
                text-[clamp(38px,3.4vw,56px)]
                font-semibold
                leading-[1.08]
                text-[#FFD700]
              "
            >
              {trLines(tr, "Näin voit antaa toiselle kehuja ja\nkannustusta vahvuuksista:")}
            </h1>

            <div className="mt-7 max-w-[1160px] space-y-7">
              {items.map((item) => (
                <div key={tr(item.title)}>
                  <h2 className="text-[clamp(19px,1.55vw,26px)] font-semibold leading-[1.35]">
                    {tr(item.title)}
                  </h2>

                  <div className="text-[clamp(18px,1.45vw,25px)] leading-[1.42]">
                    {trLines(tr, item.description)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// FIX: alt text giờ bọc tr()
function S12VahvuuksiaEnemman() {
  const tr = useTr();

  return (
    <div
      className="
        relative
        h-full
        min-h-[620px]
        w-full
        overflow-hidden
        text-white
      "
    >
      <div
        className="
          relative
          mx-auto
          flex
          h-full
          min-h-[620px]
          w-full
          max-w-[1500px]
          flex-col
          overflow-hidden
          px-[4%]
          pb-0
          pt-8
        "
      >
        {/* TEXT */}
        <div
          className="
            relative
            z-20
            mx-auto
            w-full
            max-w-[1320px]
            shrink-0
          "
        >
          <h1
            className="
              mx-auto
              max-w-[1240px]
              text-center
              font-display
              text-[clamp(28px,2.45vw,42px)]
              font-semibold
              leading-[1.12]
              tracking-[-0.01em]
              text-white
            "
          >
            {tr(
              "Meissä kaikissa on paljon enemmän vahvuuksia kuin päällepäin näkyy. Omien vahvuuksien pohtiminen ja hyödyntäminen tukee itsetuntoa, antaa itsevarmuutta ja auttaa tekemään valintoja – esimerkiksi opiskeluun tai työpaikkaan liittyen.",
            )}
          </h1>
        </div>

        {/* ILLUSTRATION */}
        <div
          className="
            relative
            z-10
            mt-6
            flex
            min-h-0
            flex-1
            items-end
            justify-center
          "
        >
          <img
            src="/illustrations/s12-raised-hands.png"
            alt={tr("Erilaisia käsiä nostettuna ilmaan")}
            className="
              pointer-events-none
              block
              h-auto
              max-h-[370px]
              w-auto
              max-w-[100%]
              object-contain
              object-bottom
              select-none
            "
          />
        </div>
      </div>
    </div>
  );
}

function S13HyvatKysymykset({ onSaveStateChange }: Props) {
  const tr = useTr();
  const questions = [
    {
      fieldKey: "screen_13_hyva_tanaan",
      text: "Mikä tänään meni hyvin?",
    },
    {
      fieldKey: "screen_13_kolme_hyvaa",
      text: "Mieti kolme hyvää asiaa, jotka olet saanut kokea tänään.",
    },
    {
      fieldKey: "screen_13_vahvuudet_opinnoissa",
      text: "Mitä vahvuuksia hyödynsin opinnoissani?",
    },
    {
      fieldKey: "screen_13_osaan",
      text: "Mitä huomasin jo osaavani?",
    },
    {
      fieldKey: "screen_13_autoin",
      text: "Ketä autoin tänään? Miltä se tuntui?",
    },
    {
      fieldKey: "screen_13_hyvaa_toisissa",
      text: "Mitä hyvää huomasin toisissa?",
    },
    {
      fieldKey: "screen_13_auttoi_minua",
      text: "Kuka auttoi minua onnistumaan?",
    },
  ];

  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto
      
        text-white
        [scrollbar-gutter:stable]
      "
    >
      <div
        className="
          relative
          z-20
          mx-auto
          grid
          min-h-[1650px]
          w-full
          grid-cols-[70px_minmax(0,1fr)]
          gap-x-8
          px-[7.5%]
          pb-28
          pt-12
        "
      >
        <div
          className="
            mt-1
            flex
            h-[148px]
            w-[66px]
            items-center
            justify-center
            rounded-[9px]
            bg-[#7654ad]
            text-white
          "
        >
          <span
            className="
              rotate-180
              whitespace-nowrap
              [writing-mode:vertical-rl]
              font-display
              text-[22px]
              font-semibold
            "
          >
            {tr("VINKKI!")}
          </span>
        </div>

        <div className="relative min-w-0">
          <div className="max-w-[940px]">
            <h1
              className="
                font-display
                text-[clamp(32px,3vw,50px)]
                font-semibold
                leading-[1.08]
                text-[#ffd95d]
              "
            >
              {trLines(tr, "Nämä kysymykset auttavat sinua\nnäkemään hyviä puolia elämästäsi")}
            </h1>

            <p
              className="
                mt-7
                text-[clamp(18px,1.45vw,25px)]
                leading-[1.4]
              "
            >
              {tr("Kysy itseltäsi päivän aikana ja päätteeksi:")}
            </p>

            <div className="mt-8 space-y-8">
              {questions.map((question) => (
                <section
                  key={question.fieldKey}
                  className="
                    grid
                    grid-cols-[10px_minmax(0,1fr)]
                    items-start
                    gap-x-5
                  "
                >
                  <span
                    aria-hidden="true"
                    className="
                      mt-[12px]
                      h-[8px]
                      w-[8px]
                      rounded-full
                      bg-[#ffc936]
                    "
                  />

                  <div className="min-w-0">
                    <h2
                      className="
                        text-[clamp(18px,1.42vw,24px)]
                        font-medium
                        leading-[1.35]
                        text-white
                      "
                    >
                      {tr(question.text)}
                    </h2>

                    <div
                      className="
                        relative
                        mt-4
                        min-h-[165px]
                        w-full
                        max-w-[900px]
                        overflow-hidden
                        rounded-[18px]
                        border-2
                        border-black
                        bg-[#fffefa]
                        shadow-[0_5px_0_rgba(68,42,105,0.12)]

                        focus-within:border-black
                        focus-within:bg-white

                        [&_label]:hidden

                        [&>div]:h-full
                        [&>div]:min-h-0

                        [&_div]:border-0
                        [&_div]:bg-transparent
                        [&_div]:p-0
                        [&_div]:shadow-none

                        [&_textarea]:h-full
                        [&_textarea]:min-h-[165px]
                        [&_textarea]:w-full
                        [&_textarea]:resize-none
                        [&_textarea]:rounded-[16px]
                        [&_textarea]:border-0
                        [&_textarea]:bg-transparent
                        [&_textarea]:px-5
                        [&_textarea]:py-4
                        [&_textarea]:text-[17px]
                        [&_textarea]:leading-[30px]
                        [&_textarea]:text-[#241b3f]
                        [&_textarea]:outline-none
                        [&_textarea]:shadow-none
                        [&_textarea]:ring-0
                        [&_textarea]:placeholder:text-[#aaa1b5]

                        [&_textarea:focus]:outline-none
                        [&_textarea:focus]:ring-0
                      "
                    >
                      <div
                        aria-hidden="true"
                        className="
                          pointer-events-none
                          absolute
                          inset-x-5
                          inset-y-4
                          opacity-70
                          [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_29px,#ddd4ea_30px,#ddd4ea_31px)]
                        "
                      />

                      <div className="relative z-10 h-full">
                        <ReflectionTextarea
                          fieldKey={question.fieldKey}
                          label=""
                          rows={5}
                          onSaveStateChange={onSaveStateChange}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>

          <img
            src="/illustrations/s13-good-candy.png"
            alt={tr("See the Good Candy")}
            className="
              pointer-events-none
              absolute
              right-[-3%]
              top-[-10px]
              z-20
              h-[285px]
              w-auto
              max-w-[31%]
              object-contain
            "
          />
        </div>
      </div>
    </div>
  );
}

// S14 (PDF p15): pure title card.
function M1Intro() {
  const tr = useTr();
  return (
    <div className="relative flex h-full min-h-[620px] w-full items-center justify-center overflow-hidden px-8 text-white">
      <div className="absolute right-[4%] top-0 rounded-b-[12px] border-2 border-t-0 border-black bg-[#7654ad] px-5 py-3 text-white">
        <span className="font-display text-[20px] font-semibold">{tr("Taso 1")}</span>
      </div>

      <div className="pointer-events-none absolute left-[7%] top-[16%] h-28 w-28 rounded-full border-[14px] border-[#ffd95d]/45" />
      <div className="pointer-events-none absolute bottom-[14%] right-[11%] h-40 w-40 rounded-full border-2 border-black bg-[#f36f56]/25" />

      <h1 className="relative z-10 text-center font-display text-[clamp(48px,5vw,78px)] font-semibold leading-[1.08]">
        {trLines(tr, "1. Omat\nydinvahvuudet")}
      </h1>
    </div>
  );
}

// ----- S12: Ydinvahvuuksien karkkikauppa (PDF p16–17) -----

const PICK = 5;

const DATA = [
  [
    "luovuus",
    "Saan usein kuulla toisilta, että keksin omaperäisiä ideoita.",
    "Luovuus",
    "Viisaus ja tieto",
  ],
  [
    "uteliaisuus",
    "Haluan jatkuvasti oppia uutta ja olen laajalti kiinnostunut asioista, ihmisistä, ilmiöistä.",
    "Uteliaisuus",
    "Viisaus ja tieto",
  ],
  [
    "arviointikyky",
    "Teen päätöksiä vasta kun tiedän asiasta kaiken.",
    "Arviointikyky",
    "Viisaus ja tieto",
  ],
  [
    "oppimisen_ilo",
    "Olen kiinnostunut lukuisista asioista ja haluan jatkuvasti oppia uutta.",
    "Oppimisen ilo",
    "Viisaus ja tieto",
  ],
  [
    "nakokulmanottokyky",
    "Minulta pyydetään usein neuvoja ja koen, että mielipiteitäni arvostetaan.",
    "Näkökulmanottokyky",
    "Viisaus ja tieto",
  ],
  [
    "rohkeus",
    "Puolustan mielipidettäni ja uskallan kertoa, mitä ajattelen, vaikka kohtaisin jyrkkääkin vastustusta.",
    "Rohkeus",
    "Rohkeus",
  ],
  [
    "sinnikkyys",
    "Jos päätän jotain, teen sen, vaikka haasteita ja vastoinkäymisiä ilmenisi.",
    "Sinnikkyys",
    "Rohkeus",
  ],
  [
    "rehellisyys",
    "Puhun kaunistelematta sen puolesta, mikä on mielestäni oikein ja totta.",
    "Rehellisyys",
    "Rohkeus",
  ],
  [
    "innokkuus",
    "Ystäväni kuvailisivat minua energiseksi, tarmokkaaksi ja hyväntuuliseksi.",
    "Innokkuus",
    "Rohkeus",
  ],
  ["sisukkuus", "Teen mitä tehdä pitää, vaikka vastoinkäymisiä ilmenisi.", "Sisukkuus", "Rohkeus"],
  [
    "myotatunto",
    "Yksi elämääni eniten merkitystä tuovista asioista on muiden ihmisten auttaminen.",
    "Myötätunto",
    "Inhimillisyys",
  ],
  [
    "rakkaus",
    "Osoitan läheisilleni välittämistäni sanoin, teoin ja viettämällä paljon aikaa heidän kanssaan.",
    "Rakkaus",
    "Inhimillisyys",
  ],
  ["ystavallisyys", "Olen mielelläni avuksi tai hyödyksi.", "Ystävällisyys", "Inhimillisyys"],
  [
    "sosiaalinen_alykkyys",
    "Pärjään hyvin erilaisissa sosiaalisissa tilanteissa ja uusien ihmisten parissa.",
    "Sosiaalinen älykkyys",
    "Inhimillisyys",
  ],
  [
    "ryhmatyotaito",
    "Parhaat puoleni pääsevät käyttöön ryhmässä, ja minua motivoi ryhmän onnistuminen.",
    "Ryhmätyötaito",
    "Oikeudenmukaisuus",
  ],
  [
    "reiluus",
    "Minulle on tärkeää kohdella kaikkia tasapuolisesti.",
    "Reiluus",
    "Oikeudenmukaisuus",
  ],
  [
    "johtajuus",
    "Minua voisi kuvailla vahvaksi ja reiluksi johtajaksi.",
    "Johtajuus",
    "Oikeudenmukaisuus",
  ],
  [
    "anteeksiantavuus",
    "En kaivele menneitä, vaan minun on helppo irrottautua niistä ja mennä elämässä eteenpäin.",
    "Anteeksiantavuus",
    "Kohtuullisuus",
  ],
  [
    "vaatimattomuus",
    "En tee itsestäni numeroa missään tilanteissa ja pitäydyn mielelläni taustalla.",
    "Vaatimattomuus",
    "Kohtuullisuus",
  ],
  ["harkitsevuus", "Teen aina harkittuja päätöksiä.", "Harkitsevuus", "Kohtuullisuus"],
  [
    "itsesaately",
    "Pystyn säätelemään tunteitani ja käytöstäni tilanteisiin sopivaksi.",
    "Itsesäätely",
    "Kohtuullisuus",
  ],
  [
    "kauneuden_arvostaminen",
    "Huomaan kauniita yksityiskohtia ja pysähdyn usein niiden äärelle.",
    "Kauneuden ja erinomaisuuden arvostaminen",
    "Henkisyys",
  ],
  [
    "kiitollisuus",
    "Perheeni kertoisi, että kiitän usein ja olen vilpittömästi kiitollinen.",
    "Kiitollisuus",
    "Henkisyys",
  ],
  [
    "toiveikkuus",
    "Minun on helppoa nähdä asioissa niiden hyvät puolet ja näen tulevaisuuden myönteisenä.",
    "Toiveikkuus",
    "Henkisyys",
  ],
  [
    "huumorintaju",
    "Löydän vaikeistakin elämäntilanteista huumoria ja pieniä ilon pilkahduksia.",
    "Huumorintaju",
    "Henkisyys",
  ],
  [
    "hengellisyys",
    "Ajattelen, että elämällä on jokin syvempi tarkoitus.",
    "Hengellisyys",
    "Henkisyys",
  ],
].map(([id, statement, strength, virtue], i) => ({
  id,
  statement,
  strength,
  virtue,
  kind: i % 12,
  hue: i % 9,
  tall: statement.length > 88 ? 2 : statement.length > 54 ? 1 : 0,
}));

const HUES = [
  ["#F49BB0", "#D9718C"],
  ["#E8736B", "#C4544D"],
  ["#F0954E", "#CE7434"],
  ["#F4C84A", "#D3A527"],
  ["#A9D9D2", "#7FB8B0"],
  ["#7FC9C0", "#57A79D"],
  ["#B58BD6", "#8F66B2"],
  ["#7A5442", "#5A3B2D"],
  ["#FFF3E6", "#DCC9B4"],
];

const PROMPTS = [
  "Ajattele itseäsi tekemässä tavanomaisia ja arkisia asioita. Miten olet näissä tekemisissä käyttänyt ydinvahvuuksiasi? Kirjoita muutama esimerkki.",
  "Missä onnistuit omia vahvuuksia hyödyntämällä?",
  "Miten omien ydinvahvuuksien hyödyntäminen vaikutti itseesi tai toisiin?",
];

/* ── karkit ────────────────────────────────────────────────── */
function Candy({ kind, hue, size = 30 }) {
  const [a, b] = HUES[((hue % 9) + 9) % 9];
  const p = { fill: a, stroke: b, strokeWidth: 1.6, strokeLinejoin: "round" };
  const S = (c) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{ display: "block", overflow: "visible" }}
    >
      {c}
    </svg>
  );
  switch (((kind % 12) + 12) % 12) {
    case 0:
      return S(
        <g {...p}>
          <circle cx="12" cy="11" r="6" />
          <circle cx="28" cy="11" r="6" />
          <rect x="7" y="13" width="26" height="24" rx="12" />
          <circle cx="15" cy="22" r="1.7" fill={b} stroke="none" />
          <circle cx="25" cy="22" r="1.7" fill={b} stroke="none" />
        </g>,
      );
    case 1:
      return S(
        <g fill="none" stroke={a} strokeWidth="5.5" strokeLinecap="round">
          <path d="M20 20 m-13 0 a13 13 0 1 1 26 0 a9 9 0 1 1 -18 0 a5 5 0 1 1 10 0" />
        </g>,
      );
    case 2:
      return S(
        <g {...p}>
          <ellipse cx="20" cy="20" rx="15" ry="11" />
          <ellipse cx="14" cy="16" rx="4" ry="2.6" fill="#fff" opacity=".45" stroke="none" />
        </g>,
      );
    case 3:
      return S(
        <g {...p}>
          <path d="M6 12 q14 24 28 12 q-6 12 -20 10 Q4 30 6 12Z" />
        </g>,
      );
    case 4:
      return S(
        <g>
          <rect
            x="5"
            y="12"
            width="30"
            height="16"
            rx="8"
            fill="#FFF3E6"
            stroke={b}
            strokeWidth="1.6"
          />
          <path
            d="M11 12 q5 8 0 16M20 12 q5 8 0 16M29 12 q5 8 0 16"
            fill="none"
            stroke={a}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </g>,
      );
    case 5:
      return S(
        <g {...p}>
          <circle cx="20" cy="20" r="14" />
          <ellipse cx="14" cy="14" rx="4.5" ry="3" fill="#fff" opacity=".5" stroke="none" />
        </g>,
      );
    case 6:
      return S(
        <g fill="none" stroke={a} strokeWidth="7" strokeLinecap="round">
          <path d="M5 26 q7 -14 14 0 t 16 -2" />
        </g>,
      );
    case 7:
      return S(
        <g {...p}>
          <path d="M4 20 q10 -12 22 0 q-12 12 -22 0Z" />
          <path d="M26 20 l10 -7 v14Z" />
        </g>,
      );
    case 8:
      return S(
        <g {...p}>
          <rect x="9" y="13" width="22" height="14" rx="4" />
          <path d="M9 20 l-7 -6 v12Z" />
          <path d="M31 20 l7 -6 v12Z" />
        </g>,
      );
    case 9:
      return S(
        <g>
          <path
            d="M20 34 C6 24 6 12 13 10 c4-1.4 7 1 7 4 0-3 3-5.4 7-4 7 2 7 14-7 24Z"
            fill={a}
            stroke={b}
            strokeWidth="1.6"
          />
        </g>,
      );
    case 10:
      return S(
        <g {...p}>
          <circle cx="20" cy="20" r="13" />
          <circle cx="20" cy="20" r="7" fill={b} stroke="none" opacity=".35" />
        </g>,
      );
    default:
      return S(
        <g {...p}>
          <rect x="4" y="14" width="32" height="13" rx="6.5" />
          <path d="M13 14v13M22 14v13M31 14v13" stroke={b} strokeWidth="1.2" opacity=".55" />
        </g>,
      );
  }
}

function Tongs() {
  return (
    <svg className="tongs" viewBox="0 0 34 104" fill="none" aria-hidden="true">
      <path
        d="M11 100 C11 62 6 44 6 26 A5 5 0 0 1 16 26 C16 46 17 64 17 100"
        stroke="#E9E4F2"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M23 100 C23 62 28 44 28 26 A5 5 0 0 0 18 26 C18 46 17 64 17 100"
        stroke="#E9E4F2"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="17" cy="22" r="5" fill="#2FA86A" />
    </svg>
  );
}

function BagArt({ items, size = 1 }) {
  return (
    <>
      <div className="heldrow">
        {items.map((d, i) => (
          <span key={d.id} style={{ transform: `rotate(${i * 16 - 32}deg)` }}>
            <Candy kind={d.kind} hue={d.hue} size={26 * size} />
          </span>
        ))}
      </div>
      <div className="bagbody" />
      <div className="bagfold" />
    </>
  );
}

function Fly({ x0, y0, x1, y1, kind, hue }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setGo(true)));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <div
      className="fly"
      style={{
        left: x0 - 17,
        top: y0 - 17,
        opacity: go ? 0.2 : 1,
        transform: go
          ? `translate(${x1 - x0}px, ${y1 - y0}px) rotate(540deg) scale(.65)`
          : "translate(0,0) rotate(0deg) scale(1.3)",
      }}
    >
      <Candy kind={kind} hue={hue} size={34} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function Karkkikauppa() {
  const tr = useTr();
  const [phase, setPhase] = useState("kauppa"); // kauppa | kaanto | kuitti
  const [picked, setPicked] = useState([]);
  const [turned, setTurned] = useState(false);
  const [settled, setSettled] = useState(false);
  const [flying, setFlying] = useState([]);
  const [bump, setBump] = useState(0);
  const [answers, setAnswers] = useState(["", "", ""]);
  const bagRef = useRef(null);
  const flyId = useRef(0);

  const full = picked.length === PICK;
  const chosen = picked.map((id) => DATA.find((d) => d.id === id));
  const tilt = useMemo(() => DATA.map((_, i) => ((i * 53) % 7) - 3), []);

  useEffect(() => {
    if (phase !== "kaanto") return;
    const t1 = setTimeout(() => setTurned(true), 420);
    const t2 = setTimeout(() => setSettled(true), 420 + 26 * 42 + 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  const toggle = useCallback(
    (d, el) => {
      if (picked.includes(d.id)) {
        setPicked((p) => p.filter((x) => x !== d.id));
        return;
      }
      if (picked.length >= PICK) return;
      const a = el.getBoundingClientRect();
      const b = bagRef.current?.getBoundingClientRect();
      if (b) {
        const fid = ++flyId.current;
        setFlying((f) => [
          ...f,
          {
            fid,
            kind: d.kind,
            hue: d.hue,
            x0: a.left + a.width / 2,
            y0: a.top + a.height - 30,
            x1: b.left + b.width / 2,
            y1: b.top + 20,
          },
        ]);
        setTimeout(() => setFlying((f) => f.filter((x) => x.fid !== fid)), 640);
        setTimeout(() => setBump((n) => n + 1), 470);
      }
      setPicked((p) => [...p, d.id]);
    },
    [picked],
  );

  const restart = () => {
    setPicked([]);
    setTurned(false);
    setSettled(false);
    setAnswers(["", "", ""]);
    setPhase("kauppa");
  };

  const rows = [DATA.slice(0, 7), DATA.slice(7, 14), DATA.slice(14, 20), DATA.slice(20, 26)];
  const shopping = phase === "kauppa";
  const revealing = phase === "kaanto";

  return (
    <div className="ns">
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');

.ns{--pu:#6C4F9C;--pud:#4E3A78;--ye:#F4C84A;--co:#E8736B;--ink:#2B2342;--wood:#B99444;
 position:relative;display:flex;flex-direction:column;width:100%;height:100%;min-height:0;overflow:hidden;
 padding:18px 20px 0;font-family:var(--font-display),'Fredoka',system-ui,sans-serif;background:#7654ad;color:#fff}
.shopscroll{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding-bottom:32px}
.ns *{box-sizing:border-box}
.fd{font-family:var(--font-display),'Fredoka',system-ui,sans-serif;font-weight:600}

.deco{display:none}
.d1{top:-100px;left:-76px;width:272px;height:272px;border-radius:50%;background:#EE8C93}
.d2{top:88px;right:-56px;width:0;height:0;border-left:96px solid transparent;border-right:96px solid transparent;border-bottom:132px solid var(--ye);transform:rotate(20deg)}
.d3{bottom:170px;left:-58px;width:190px;height:190px;border-radius:50%;background:#8FB6D9;opacity:.55}
.counter{display:none}

.hd{position:relative;z-index:2;max-width:1310px;margin:0 auto 14px;display:flex;
 justify-content:space-between;align-items:flex-start;gap:26px;flex-wrap:wrap}
.h1{font-size:clamp(30px,3.5vw,52px);line-height:1.04;letter-spacing:0;max-width:18ch;margin:0;
 color:#fff;text-shadow:0 3px 0 rgba(43,35,66,.22)}
.h1 small{display:block;font-family:var(--font-display),'Fredoka',system-ui,sans-serif;font-weight:500;
 font-size:clamp(15px,1.35vw,19px);line-height:1.35;color:#fff;opacity:1;margin-top:14px;
 max-width:42ch;letter-spacing:0;text-shadow:0 2px 0 rgba(43,35,66,.18)}
.namu{position:relative;flex:0 0 auto;padding:13px 38px;border:3px solid var(--ye);border-radius:11px;
 font-family:var(--font-display),'Fredoka',system-ui,sans-serif;font-size:25px;color:var(--ye);
 letter-spacing:1px;transform:rotate(-3deg);white-space:nowrap;background:rgba(78,58,120,.72);
 box-shadow:0 4px 0 rgba(43,35,66,.28)}
.namu::before,.namu::after{content:"";position:absolute;top:50%;margin-top:-18px;width:0;height:0;
 border-top:18px solid transparent;border-bottom:18px solid transparent}
.namu::before{left:-24px;border-right:21px solid var(--ye)}
.namu::after{right:-24px;border-left:21px solid var(--ye)}

/* ── hylly ────────────────────────────────── */
.wall{position:relative;z-index:2;max-width:1310px;margin:0 auto}
.shelf{position:relative;margin-bottom:30px}
.bins{display:flex;gap:10px;align-items:flex-end;justify-content:center;flex-wrap:wrap}
.plank{height:11px;border-radius:3px;background:#3D2E60;margin-top:-2px;
 box-shadow:0 8px 15px rgba(0,0,0,.32),inset 0 2px 0 rgba(255,255,255,.1)}
.tongs{width:32px;height:104px;align-self:flex-end;margin:0 2px 4px;opacity:.9;flex:0 0 auto}

/* ── purkki ───────────────────────────────── */
.bin{position:relative;width:170px;border:0;padding:0;background:none;
 transition:transform .18s cubic-bezier(.34,1.56,.64,1),filter .3s,opacity .3s}
.shop .bin{cursor:pointer}
.shop .bin:hover:not(:disabled){transform:translateY(-10px) rotate(0deg) scale(1.04)!important;z-index:9}
.shop .bin:active:not(:disabled){transform:translateY(-2px) scale(.985)!important}
.bin:focus-visible{outline:none}
.bin:focus-visible .tub{box-shadow:0 0 0 3px #fff,0 0 0 8px rgba(244,200,74,.55),inset 0 -14px 20px rgba(0,0,0,.14)}
.bin:disabled{cursor:not-allowed}
.shop .bin:disabled{filter:grayscale(.6) brightness(.68);opacity:.45}

.flipper{position:relative;transform-style:preserve-3d;transition:transform .72s cubic-bezier(.55,-0.28,.3,1.25)}
.turn .flipper{transform:rotateY(180deg)}
.side{backface-visibility:hidden;-webkit-backface-visibility:hidden}
.side.back{position:absolute;inset:0;transform:rotateY(180deg)}
.lid{height:13px;border-radius:10px 10px 3px 3px;background:rgba(255,255,255,.30);
 border:1.5px solid rgba(255,255,255,.44);margin:0 -2px;box-shadow:0 3px 6px rgba(0,0,0,.2)}
.tub{position:relative;border-radius:12px 12px 8px 8px;overflow:hidden;display:flex;flex-direction:column;
 background:linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,.14) 42%,rgba(255,255,255,.20));
 border:1.5px solid rgba(255,255,255,.58);border-top:0;transition:box-shadow .2s,background .3s;
 box-shadow:inset 0 -16px 22px rgba(0,0,0,.15),0 5px 0 rgba(43,35,66,.3)}
.h0 .tub{height:146px}.h1 .tub{height:170px}.h2 .tub{height:194px}
.txt{flex:1 1 auto;padding:12px 11px 2px;font-size:10px;line-height:1.34;letter-spacing:.35px;
 text-transform:uppercase;font-weight:700;text-align:center;color:#fff;
 text-shadow:0 1px 2px rgba(24,17,42,.72),0 0 10px rgba(24,17,42,.34)}
.pile{flex:0 0 auto;height:44px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:7px}
.pile>span{margin:0 -5px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.3))}
.sticker{position:absolute;left:8px;bottom:8px;width:22px;height:15px;border-radius:2px;
 background:#fff;opacity:.9;box-shadow:0 1px 2px rgba(0,0,0,.3)}
.chk{position:absolute;top:-10px;right:-8px;width:30px;height:30px;border-radius:50%;background:var(--ye);
 color:var(--ink);display:grid;place-items:center;font-family:var(--font-display),'Fredoka',system-ui,sans-serif;font-size:16px;border:3px solid var(--pu);
 box-shadow:0 2px 0 rgba(43,35,66,.45);animation:pop .3s cubic-bezier(.34,1.8,.64,1);z-index:6}
@keyframes pop{0%{transform:scale(0) rotate(-45deg)}100%{transform:scale(1) rotate(0)}}

/* takapuoli: vahvuus + sitä vastaava karkki */
.rev{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;
 gap:8px;padding:12px 9px;text-align:center}
.rev .nm{font-family:var(--font-display),'Fredoka',system-ui,sans-serif;line-height:1.12;font-size:15px}
.rev .nm.long{font-size:11.5px}
.rev .vt{font-size:7.6px;letter-spacing:1.3px;text-transform:uppercase;opacity:.6}
.rev .cd{filter:drop-shadow(0 3px 3px rgba(0,0,0,.35))}

/* voittajapurkit vs. muut */
.reveal .bin{opacity:.34;filter:saturate(.35)}
.reveal .bin.won{opacity:1;filter:none;z-index:8}
.settled .bin.won{transform:translateY(-14px) scale(1.07)!important;animation:hover 3s ease-in-out infinite}
@keyframes hover{0%,100%{transform:translateY(-14px) scale(1.07)}50%{transform:translateY(-20px) scale(1.07)}}
.reveal .bin.won .tub{background:linear-gradient(180deg,#FFF6E2,#FFE8B8);
 border-color:var(--ye);box-shadow:0 0 0 3px var(--ye),0 0 34px rgba(244,200,74,.6),0 6px 0 #B98F1C}
.reveal .bin.won .lid{background:var(--ye);border-color:#FFF0C4}
.reveal .bin.won .rev{color:var(--ink)}
.reveal .bin.won .vt{opacity:.5}

.fly{position:fixed;z-index:60;pointer-events:none;
 transition:transform .62s cubic-bezier(.38,-0.25,.5,1),opacity .62s ease-in}

/* ── pussi + palkki ───────────────────────── */
.bar{position:relative;z-index:30;display:flex;flex:0 0 100px;height:100px;
 align-items:center;justify-content:center;gap:24px;flex-wrap:nowrap;margin:0 -20px;padding:0 22px;
 background:linear-gradient(180deg,var(--wood),#9A7A33);
 box-shadow:inset 0 7px 0 rgba(255,255,255,.18),0 -3px 16px rgba(0,0,0,.3)}
.bag{position:relative;width:104px;height:86px;flex:0 0 auto}
.bagbody{position:absolute;inset:14px 0 0;border-radius:5px 5px 10px 10px;
 background:linear-gradient(180deg,#F7E6C8,#E0C89E);
 box-shadow:inset -13px 0 18px rgba(0,0,0,.11),0 4px 0 rgba(43,35,66,.32)}
.bagfold{position:absolute;top:8px;left:-4px;right:-4px;height:15px;border-radius:4px;background:#FFF3DE;
 box-shadow:0 2px 3px rgba(0,0,0,.18)}
.heldrow{position:absolute;top:-8px;left:0;right:0;display:flex;justify-content:center;z-index:2}
.heldrow>span{margin:0 -6px;filter:drop-shadow(0 3px 2px rgba(0,0,0,.32))}
.bag.bump{animation:bb .36s cubic-bezier(.34,1.7,.64,1)}
@keyframes bb{0%{transform:scale(1)}32%{transform:scale(1.15,.86)}66%{transform:scale(.95,1.07)}100%{transform:scale(1)}}

.cnt{font-family:var(--font-display),'Fredoka',system-ui,sans-serif;font-size:14px;color:#3B2C10;line-height:1.2;flex:0 0 auto}
.cnt b{display:block;font-size:34px;line-height:1;color:#241A06}
.slots{display:flex;gap:6px;margin-top:8px}
.slot{width:13px;height:13px;border-radius:50%;background:rgba(59,44,16,.25);
 transition:.24s cubic-bezier(.34,1.6,.64,1)}
.slot.on{background:var(--ye);box-shadow:0 0 0 2px rgba(255,255,255,.65);transform:scale(1.2)}

.won5{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;min-width:0}
.pill{display:flex;align-items:center;gap:7px;background:#FFF6E8;color:var(--ink);
 border-radius:999px;padding:6px 15px 6px 7px;font-family:var(--font-display),'Fredoka',system-ui,sans-serif;font-size:13px;white-space:nowrap;
 box-shadow:0 3px 0 rgba(43,35,66,.32);animation:rise .4s backwards cubic-bezier(.34,1.6,.64,1)}
@keyframes rise{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}

.btn{font-family:var(--font-display),'Fredoka',system-ui,sans-serif;font-size:17px;border:0;border-radius:999px;padding:15px 30px;cursor:pointer;
 background:var(--co);color:#fff;box-shadow:0 5px 0 #A8463F;transition:.12s;white-space:nowrap;flex:0 0 auto}
.btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 7px 0 #A8463F}
.btn:active:not(:disabled){transform:translateY(3px);box-shadow:0 2px 0 #A8463F}
.btn:disabled{background:#6F5D3B;color:#CBBA95;box-shadow:0 5px 0 #4E4126;cursor:not-allowed}
.btn.go{background:var(--ye);color:var(--ink);box-shadow:0 5px 0 #C39C22;animation:br 1.5s ease-in-out infinite}
.btn.go:hover{box-shadow:0 7px 0 #C39C22}
@keyframes br{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
.link{background:none;border:0;color:inherit;opacity:.72;text-decoration:underline;cursor:pointer;
 font-size:13px;font-family:var(--font-display),'Fredoka',system-ui,sans-serif;padding:6px}

/* ── kuitti ───────────────────────────────── */
.receipt{position:relative;z-index:2;max-width:740px;margin:24px auto 0;background:#FFF9EF;color:var(--ink);
 padding:32px 34px 28px;box-shadow:0 10px 0 rgba(43,35,66,.38)}
.receipt::before,.receipt::after{content:"";position:absolute;left:0;right:0;height:12px;
 background:repeating-linear-gradient(135deg,#FFF9EF 0 9px,transparent 9px 18px)}
.receipt::before{top:-11px;transform:scaleY(-1)}
.receipt::after{bottom:-11px}
.rhead{text-align:center;border-bottom:2px dashed #D8C9AE;padding-bottom:15px;margin-bottom:8px}
.rhead .fd{font-size:23px}
.rhead p{font-size:10px;letter-spacing:2.6px;text-transform:uppercase;opacity:.5;margin:7px 0 0}
.line{display:flex;align-items:center;gap:13px;padding:9px 2px;border-bottom:1px dotted #DCCEB6}
.line .fd{flex:1;font-size:16px;text-align:left}
.line em{font-style:normal;font-size:9px;letter-spacing:1.3px;text-transform:uppercase;opacity:.48}
.q{font-weight:500;font-size:13px;margin:20px 0 8px;line-height:1.5}
.ta{width:100%;min-height:80px;border:2px solid #E6DAC2;border-radius:12px;padding:11px 13px;background:#fff;
 font-family:var(--font-display),'Fredoka',system-ui,sans-serif;font-size:13px;color:var(--ink);resize:vertical}
.ta:focus{outline:0;border-color:var(--pu)}
.acts{display:flex;gap:16px;align-items:center;margin-top:22px;flex-wrap:wrap}

@media (max-width:820px){
 .hd{gap:16px}
 .h1{font-size:32px;max-width:100%}
 .h1 small{font-size:15px}
 .namu{font-size:18px;padding:10px 24px}
 .bin{width:150px}.h0 .tub{height:150px}.h1 .tub{height:176px}.h2 .tub{height:202px}
 .txt{font-size:9.5px}
}
@media (prefers-reduced-motion:reduce){.ns *{animation:none!important;transition:none!important}}
      `}</style>

      <div className="deco d1" />
      <div className="deco d2" />
      <div className="deco d3" />

      {/* ═════ HYLLY (kauppa + kääntö jakavat saman seinän) ═════ */}
      {(shopping || revealing) && (
        <>
          <div className="shopscroll">
            <div className="hd">
              <h1 className="fd h1">
                {shopping
                  ? tr("Ydinvahvuuksien karkkikauppa")
                  : settled
                    ? tr("Nämä ovat ydinvahvuutesi")
                    : tr("Hylly kääntyy…")}
                <small>
                  {shopping
                    ? tr(
                        "Poimi hyllystä viisi väittämäkarkkia, jotka kuulostavat sinulta. Älä mieti liikaa — mene fiiliksellä.",
                      )
                    : settled
                      ? tr(
                          "Jokaisen purkin takana oli luonteenvahvuus ja sitä vastaava karkki. Sinun viisi loistavat.",
                        )
                      : tr("Katso, mitkä vahvuudet väittämien takaa paljastuvat.")}
                </small>
              </h1>
              <div className="namu fd">{settled ? tr("OOT NAMU!") : tr("OOT NAMU")}</div>
            </div>

            <div className={`wall ${shopping ? "shop" : "reveal"}${settled ? " settled" : ""}`}>
              {rows.map((row, ri) => (
                <div className="shelf" key={ri}>
                  <div className="bins">
                    {ri % 2 === 1 && <Tongs />}
                    {row.map((d) => {
                      const i = DATA.indexOf(d);
                      const on = picked.includes(d.id);
                      const longName = d.strength.length > 22;
                      return (
                        <button
                          key={d.id}
                          className={`bin h${d.tall}${turned ? " turn" : ""}${on ? " won" : ""}`}
                          style={{
                            transform: `rotate(${tilt[i]}deg)`,
                            transitionDelay: revealing && !settled ? `${i * 42}ms` : "0ms",
                          }}
                          disabled={revealing || (full && !on)}
                          onClick={(e) => shopping && toggle(d, e.currentTarget)}
                          aria-pressed={on}
                          aria-label={
                            revealing
                              ? `${tr(d.strength)} — ${tr(d.virtue)}${on ? `, ${tr("sinun vahvuutesi")}` : ""}`
                              : `${tr(d.statement)}${on ? ` — ${tr("pussissa")}` : ""}`
                          }
                        >
                          <div
                            className="flipper"
                            style={{ transitionDelay: revealing ? `${i * 42}ms` : "0ms" }}
                          >
                            {/* etupuoli — väittämä */}
                            <div className="side front">
                              <div className="lid" />
                              <div className="tub">
                                <div className="txt">{tr(d.statement)}</div>
                                <div className="pile">
                                  {!on &&
                                    [0, 1, 2, 3].map((k) => (
                                      <span
                                        key={k}
                                        style={{
                                          transform: `rotate(${((k * 37) % 50) - 25}deg) translateY(${k % 2 ? 3 : 0}px)`,
                                        }}
                                      >
                                        <Candy kind={d.kind + k} hue={d.hue + (k % 2)} size={27} />
                                      </span>
                                    ))}
                                </div>
                                <span className="sticker" />
                              </div>
                            </div>

                            {/* takapuoli — vahvuus + vastaava karkki */}
                            <div className="side back">
                              <div className="lid" />
                              <div className="tub">
                                <div className="rev">
                                  <span className="cd">
                                    <Candy kind={d.kind} hue={d.hue} size={on ? 52 : 38} />
                                  </span>
                                  <span className={`nm${longName ? " nm long" : ""}`}>
                                    {tr(d.strength)}
                                  </span>
                                  <span className="vt">{tr(d.virtue)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {on && shopping && <span className="chk">✓</span>}
                        </button>
                      );
                    })}
                    {ri % 2 === 0 && <Tongs />}
                  </div>
                  <div className="plank" />
                </div>
              ))}
            </div>
          </div>

          <div className="bar">
            {shopping ? (
              <>
                <div ref={bagRef} className={`bag${bump ? " bump" : ""}`} key={bump}>
                  <BagArt items={chosen} />
                </div>
                <div className="cnt">
                  <b>{picked.length}/5</b>
                  {tr("karkkia pussissa")}
                  <div className="slots">
                    {Array.from({ length: PICK }).map((_, i) => (
                      <span key={i} className={`slot${picked[i] ? " on" : ""}`} />
                    ))}
                  </div>
                </div>
                <button
                  className={`btn${full ? " go" : ""}`}
                  disabled={!full}
                  onClick={() => setPhase("kaanto")}
                >
                  {full
                    ? tr("Käännä hylly →")
                    : tr("Valitse vielä {n}", { n: PICK - picked.length })}
                </button>
              </>
            ) : settled ? (
              <>
                <div className="won5">
                  {chosen.map((d, i) => (
                    <span className="pill" key={d.id} style={{ animationDelay: `${i * 90}ms` }}>
                      <Candy kind={d.kind} hue={d.hue} size={24} />
                      {tr(d.strength)}
                    </span>
                  ))}
                </div>
                <button className="btn go" onClick={() => setPhase("kuitti")}>
                  {tr("Ota kuitti →")}
                </button>
              </>
            ) : (
              <div className="cnt" style={{ textAlign: "center" }}>
                <b>26</b>
                {tr("purkkia kääntyy…")}
              </div>
            )}
          </div>

          {flying.map((f) => (
            <Fly key={f.fid} {...f} />
          ))}
        </>
      )}

      {/* ═════ KUITTI (s. 19) ═════ */}
      {phase === "kuitti" && (
        <div className="shopscroll">
          <div className="receipt">
            <div className="rhead">
              <div className="fd">{tr("Vahvuuskarkkini – Merkkaa tähän vahvuuskarkkisi!")}</div>
              <p>{tr("YDINVAHVUUKSIEN KARKKIKAUPPA")}</p>
            </div>
            {chosen.map((d) => (
              <div className="line" key={d.id}>
                <Candy kind={d.kind} hue={d.hue} size={30} />
                <span className="fd">{tr(d.strength)}</span>
                <em>{tr(d.virtue)}</em>
              </div>
            ))}
            {PROMPTS.map((q, i) => (
              <div key={i}>
                <p className="q">{tr(q)}</p>
                <textarea
                  className="ta"
                  value={answers[i]}
                  placeholder={tr("Kirjoita tähän…")}
                  onChange={(e) =>
                    setAnswers((a) => a.map((v, j) => (j === i ? e.target.value : v)))
                  }
                />
              </div>
            ))}
            <div className="acts">
              <button className="btn">{tr("Tallenna ja jatka")}</button>
              <button className="link" onClick={restart}>
                {tr("Valitse karkit uudelleen")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----- S13: Vahvuuskarkkini ----- (FIX: heading, subtitle, placeholder, và 3 label giờ đều qua tr())
// ----- S13 (PDF p18): Vahvuuskarkkini -----
function S13({ onSaveStateChange }: Props) {
  const tr = useTr();
  const { language: lang } = useLanguage();
  const [selectedCandies, setSelectedCandies] = useState<Record<number, string>>({});

  const selectedValues = Object.values(selectedCandies).filter(Boolean);

  const updateCandy = useCallback((index: number, value: string) => {
    setSelectedCandies((current) => {
      if (current[index] === value) return current;
      return {
        ...current,
        [index]: value,
      };
    });
  }, []);

  return (
    <div className="relative h-full min-h-0 w-full overflow-x-hidden overflow-y-auto px-[6%] pb-16 pt-10 text-white [font-family:var(--font-display)] [scrollbar-gutter:stable] [&_*]:[font-family:var(--font-display)] [&_label]:!text-white">
      <div className="mx-auto grid w-full max-w-[1280px] gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)]">
        <div className="space-y-4">
          <div className="pb-2 text-white">
            <h1 className="mb-3 text-[clamp(36px,4vw,62px)] font-bold leading-[1.05] text-white">
              {tr("Vahvuuskarkkini")}
            </h1>
            <p className="text-[clamp(20px,1.9vw,30px)] font-semibold leading-tight text-white">
              {tr("Pohdi omia vahvuuksia ja vastaa:")}
            </p>
          </div>

          <ReflectionTextarea
            fieldKey="screen_13_examples"
            label={tr(
              "Ajattele itseäsi tekemässä tavanomaisia ja arkisia asioita tai tehtäviä. Miten olet näissä tekemisissä käyttänyt ydinvahvuuksiasi? Kirjoita muutama esimerkki tilanteista.",
            )}
            rows={4}
            onSaveStateChange={onSaveStateChange}
          />

          <ReflectionTextarea
            fieldKey="screen_13_success"
            label={tr("Missä onnistuit omia vahvuuksia hyödyntämällä?")}
            rows={3}
            onSaveStateChange={onSaveStateChange}
          />

          <ReflectionTextarea
            fieldKey="screen_13_effect"
            label={tr("Miten omien ydinvahvuuksien hyödyntäminen vaikutti itseesi tai toisiin?")}
            rows={3}
            onSaveStateChange={onSaveStateChange}
          />
        </div>

        <StickyNote tone="coral" seed="s13-candies" className="self-start">
          <div className="mb-4 text-center font-display text-xl font-bold leading-tight text-[color:var(--purple-dark)]">
            {tr("Merkkaa tähän 5 vahvuuskarkkiasi!")}
          </div>

          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <StrengthCandySelect
                key={index}
                index={index}
                language={lang}
                selectedValues={selectedValues}
                onValueChange={updateCandy}
                onSaveStateChange={onSaveStateChange}
              />
            ))}
          </div>
        </StickyNote>
      </div>
    </div>
  );
}

function StrengthCandySelect({
  index,
  language,
  selectedValues,
  onValueChange,
  onSaveStateChange,
}: {
  index: number;
  language: "fi" | "sv" | "en";
  selectedValues: string[];
  onValueChange: (index: number, value: string) => void;
  onSaveStateChange?: (s: SaveState) => void;
}) {
  const tr = useTr();
  const fieldKey = `screen_13_karkki_${index + 1}`;
  const [value, setValue] = useState("");
  const [loaded, setLoaded] = useState(false);
  const report = useReportCompletion();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const saved = await loadResponse<string>(fieldKey);
      if (cancelled) return;

      if (typeof saved === "string") {
        setValue(saved);
        onValueChange(index, saved);
      }
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [fieldKey, index, onValueChange]);

  const state = useAutosave(fieldKey, value, { enabled: loaded });

  useEffect(() => {
    onSaveStateChange?.(state);
  }, [state, onSaveStateChange]);

  useEffect(() => {
    if (!loaded) return;
    report(fieldKey, value.trim().length > 0);
  }, [fieldKey, loaded, report, value]);

  function handleChange(nextValue: string) {
    setValue(nextValue);
    onValueChange(index, nextValue);
  }

  const selectedStrengthNumber = Number(value);
  const hasSelectedStrength =
    Number.isInteger(selectedStrengthNumber) && selectedStrengthNumber >= 1;

  return (
    <div className="relative">
      {hasSelectedStrength && (
        <span
          className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 rounded-full border border-black/20"
          style={{ backgroundColor: getStrengthColor(selectedStrengthNumber) }}
        />
      )}

      <select
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        className={cn(
          "h-12 w-full appearance-none rounded-2xl border-2 border-white/70 bg-white px-4 pr-10 font-display text-sm font-bold text-[color:var(--ink)] shadow-sm outline-none transition focus:border-[color:var(--purple-dark)]",
          hasSelectedStrength && "pl-10",
        )}
      >
        <option value="">{tr("Valitse vahvuus")}</option>

        {Array.from({ length: 26 }).map((_, strengthIndex) => {
          const strengthNumber = strengthIndex + 1;
          const optionValue = String(strengthNumber);
          const alreadyUsed = selectedValues.includes(optionValue) && optionValue !== value;

          return (
            <option key={strengthNumber} value={optionValue} disabled={alreadyUsed}>
              {getStrengthName(strengthNumber, language)}
            </option>
          );
        })}
      </select>

      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[color:var(--purple-dark)]">
        ▼
      </span>
    </div>
  );
}

// ----- S14 (PDF p19): Ydinvahvuuksien tiekartta -----
function S14({ onSaveStateChange }: Props) {
  const tr = useTr();
  const questions = [
    {
      id: 1,
      text: "Mistä innostut?",
      position: "left-[1%] top-[25%] h-[180px] w-[22%]",
    },
    {
      id: 2,
      text: "Minkä tekeminen tuntuu kevyeltä?",
      position: "left-[3%] bottom-[1%] h-[170px] w-[22%]",
    },
    {
      id: 3,
      text: "Mistä luonteenvahvuuksista saat kiitosta ja palautetta toisilta?",
      position: "left-[28%] bottom-[4%] h-[175px] w-[23%]",
    },
    {
      id: 4,
      text: "Mitä rakastat tehdä vapaa-ajalla?",
      position: "left-[31%] top-[39%] h-[180px] w-[23%]",
    },
    {
      id: 5,
      text: "Minkä alkamista odotat eniten päivässäsi?",
      position: "left-[48%] top-[0%] h-[175px] w-[23%]",
    },
    {
      id: 6,
      text: "Mitä tehdessä aika ja paikka unohtuvat ja pääset flow-tilaan?",
      position: "left-[55%] bottom-[1%] h-[175px] w-[23%]",
    },
    {
      id: 7,
      text: "Mitkä vahvuudet vahvistavat sinua vapaa-ajalla?",
      position: "right-[6%] top-[41%] h-[180px] w-[22%]",
    },
    {
      id: 8,
      text: "Mitkä vahvuudet tulevat lukioon, kun sinä tulet paikalle?",
      position: "right-[3%] top-[2%] h-[175px] w-[22%]",
    },
    {
      id: 9,
      text: "Mitä vahvuuksia arvostat eniten itsessäsi?",
      position: "right-[0%] bottom-[4%] h-[175px] w-[21%]",
    },
  ];

  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto
        px-[2%]
        pb-12
        pt-5
        text-black
      "
    >
      <div className="relative mx-auto h-[610px] w-full max-w-[1280px]">
        <div className="absolute left-[1%] top-[3%] z-30">{tr("Ydinvahvuuksien tiekartta")}</div>

        <svg
          aria-hidden="true"
          viewBox="0 0 1280 610"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        >
          <path
            d="
              M -30 390
              C 100 455, 225 470, 330 390
              C 425 315, 430 175, 575 170
              C 740 165, 805 280, 985 275
              C 1125 270, 1190 225, 1225 135
              C 1260 45, 1250 5, 1285 -45
            "
            fill="none"
            stroke="white"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M 140 430 C 110 505, 130 555, 195 585"
            fill="none"
            stroke="white"
            strokeWidth="15"
            strokeLinecap="round"
          />

          <path
            d="M 320 405 C 405 395, 455 430, 455 565"
            fill="none"
            stroke="white"
            strokeWidth="15"
            strokeLinecap="round"
          />

          <path
            d="M 470 275 C 445 345, 480 390, 545 410"
            fill="none"
            stroke="white"
            strokeWidth="15"
            strokeLinecap="round"
          />

          <path
            d="M 640 175 L 640 85 C 640 55, 660 45, 685 45"
            fill="none"
            stroke="white"
            strokeWidth="15"
            strokeLinecap="round"
          />

          <path
            d="M 790 260 C 755 350, 850 380, 805 570"
            fill="none"
            stroke="white"
            strokeWidth="15"
            strokeLinecap="round"
          />

          <path
            d="M 1000 275 L 1000 430"
            fill="none"
            stroke="white"
            strokeWidth="15"
            strokeLinecap="round"
          />

          <path
            d="M 1100 270 L 1100 90"
            fill="none"
            stroke="white"
            strokeWidth="15"
            strokeLinecap="round"
          />

          <path
            d="M 1220 255 C 1270 350, 1205 410, 1205 565"
            fill="none"
            stroke="white"
            strokeWidth="15"
            strokeLinecap="round"
          />
        </svg>

        {questions.map((question) => (
          <div
            key={question.id}
            className={`
              absolute
              z-20
              flex
              flex-col
              overflow-hidden
              rounded-[26px]
              border-2
              border-black
              bg-[#fffefa]
              px-5
              pb-4
              pt-4
              shadow-[0_7px_0_rgba(68,42,105,0.22)]
              transition-all
              duration-200

              hover:-translate-y-1
              hover:shadow-[0_9px_0_rgba(68,42,105,0.22)]

              focus-within:ring-[3px]
              focus-within:ring-[#ffd143]/70

              [&_label]:hidden

              [&_div]:min-h-0
              [&_div]:border-0
              [&_div]:bg-transparent
              [&_div]:p-0
              [&_div]:shadow-none

              [&_textarea]:h-full
              [&_textarea]:min-h-0
              [&_textarea]:w-full
              [&_textarea]:resize-none
              [&_textarea]:rounded-none
              [&_textarea]:border-0
              [&_textarea]:bg-transparent
              [&_textarea]:px-2
              [&_textarea]:py-2
              [&_textarea]:text-[15px]
              [&_textarea]:font-normal
              [&_textarea]:leading-[30px]
              [&_textarea]:text-[#241b3f]
              [&_textarea]:outline-none
              [&_textarea]:shadow-none
              [&_textarea]:ring-0

              [&_textarea:focus]:border-0
              [&_textarea:focus]:outline-none
              [&_textarea:focus]:ring-0

              [&_textarea]:placeholder:text-[#aaa1b5]

              ${question.position}
            `}
          >
            <p className="relative z-10 shrink-0 text-center font-display text-[16px] font-semibold leading-[1.18] text-[#7654ad]">
              {question.id}. {tr(question.text)}
            </p>

            <div className="relative mt-3 min-h-0 flex-1 [&>div]:h-full">
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  opacity-60
                  [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_29px,#ddd4ea_30px,#ddd4ea_31px)]
                "
              />

              <div className="relative z-10 h-full">
                <ReflectionTextarea
                  fieldKey={`screen_14_tiekartta_${question.id}`}
                  label=""
                  rows={4}
                  onSaveStateChange={onSaveStateChange}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- S15 (PDF p20): Voimavarani opiskelijana 1/2 — informational -----
// FIX: bulletItems giờ là string thuần (không còn JSX fragment), qua tr(); heading cũng qua tr()
function S15() {
  const tr = useTr();
  const bulletItems = [
    "Mieti voimavarojasi, jotka auttavat sinua selviytymään hankalissa ja stressaavissa elämäntilanteissa, palautumaan vastoinkäymisistä ja olemaan toiveikas tulevaisuuden suhteen.",
    "Näitä tekijöitä voivat olla omat vahvuutesi, sosiaaliset suhteet, läheiset ihmiset, tunnetaidot, unelmasi tulevaisuuden suhteen, ajatuksesi, asenteesi, myötätuntoinen suhtautuminen itseesi ja aikaisemmat onnistumisen kokemukset.",
    "Listaa voimavarasi seuraavan sivun taulukkoon. Merkkaa sydämiin, miten tärkeiksi voimavarasi koet.",
  ];

  return (
    <div className="relative min-h-[620px] w-full overflow-hidden  px-[8%] pb-10 pt-14 text-white">
      <div className="relative z-20 max-w-[920px]">
        <h1 className="font-display text-[42px] font-semibold leading-[1.08]">
          {tr("Voimavarani opiskelijana")} <span className="text-white">1/2</span>
        </h1>

        <h2 className="mt-9 font-display text-[24px] font-semibold leading-[1.2] text-white">
          {tr("Pohdi ja täydennä omien voimavarojesi sydämet")}
        </h2>

        <div className="mt-3 flex max-w-[900px] flex-col gap-7">
          {bulletItems.map((item, index) => (
            <div key={index} className="grid grid-cols-[12px_minmax(0,1fr)] items-start gap-5">
              <span className="mt-[12px] h-[8px] w-[8px] rounded-full " />

              <p className="font-display text-[23px] font-medium leading-[1.42]">{tr(item)}</p>
            </div>
          ))}
        </div>
      </div>

      <img
        src="/illustrations/voimavarani-hand.png"
        alt=""
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
           right-[-1%]
          top-[1%]
          z-10
          h-[430px]
          w-auto
          object-contain
        "
      />
    </div>
  );
}

// ----- S16 (PDF p21): Voimavarani opiskelijana 2/2 -----
// FIX: heading "Voimavarani opiskelijana 2/2" và "Merkitse vahvuutesi" giờ qua tr()
export function S16({ onSaveStateChange }: Props) {
  const tr = useTr();
  const [scores, setScores] = useState<Record<string, number | null>>({});

  const groups = [
    {
      label: "KOULUSSA",
      fieldKey: "screen_16_koulussa",
      frameClass: "bg-[#ef706e]",
      tabClass: "bg-[#acd8b1] text-black",
      rotateClass: "-rotate-[0.6deg]",
    },
    {
      label: "VAPAA-AJALLA",
      fieldKey: "screen_16_vapaa_ajalla",
      frameClass: "bg-[#f5c8ce]",
      tabClass: "bg-[#ffd95d] text-black",
      rotateClass: "rotate-[0.6deg]",
    },
    {
      label: "KOTONA",
      fieldKey: "screen_16_kotona",
      frameClass: "bg-[#ffd75b]",
      tabClass: "bg-[#ef706e] text-white",
      rotateClass: "rotate-[-0.4deg]",
    },
    {
      label: "KAVERISUHTEISSA",
      fieldKey: "screen_16_kaverisuhteissa",
      frameClass: "bg-[#afd9b4]",
      tabClass: "bg-[#f3cbd1] text-black",
      rotateClass: "rotate-[0.5deg]",
    },
  ];

  const selectScore = (fieldKey: string, score: number) => {
    setScores((current) => ({
      ...current,
      [fieldKey]: current[fieldKey] === score ? null : score,
    }));
  };

  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto
        px-8
        pb-16
        pr-6
        pt-8
        text-white
        [scrollbar-gutter:stable]
      "
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <h1 className="font-display text-[42px] font-semibold leading-[1.08] text-white">
          {tr("Voimavarani opiskelijana")} <span className="text-[#f1f1ef]">2/2</span>
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
          {groups.map((group) => {
            const selectedScore = scores[group.fieldKey] ?? null;

            return (
              <div
                key={group.fieldKey}
                className={`
                  relative
                  min-h-[245px]
                  w-full
                  transition-transform
                  duration-200
                  hover:-translate-y-1
                  ${group.rotateClass}
                `}
              >
                <div
                  className={`
                    absolute
                    left-[-31px]
                    top-1/2
                    z-20
                    flex
                    h-[126px]
                    w-[34px]
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-l-[12px]
                    text-[11px]
                    font-semibold
                    shadow-[0_4px_10px_rgba(0,0,0,0.12)]
                    ${group.tabClass}
                  `}
                >
                  <span className="rotate-180 whitespace-nowrap [writing-mode:vertical-rl] tracking-[0.5px]">
                    {tr(group.label)}
                  </span>
                </div>

                <div
                  className={`
                    h-full
                    w-full
                    border-2
                    border-black
                    rounded-[26px]
                    p-[10px]
                    shadow-[0_8px_0_rgba(62,36,112,0.28)]
                    ${group.frameClass}
                  `}
                >
                  <div
                    className="
                      grid
                      h-full
                      min-h-[225px]
                      w-full
                      grid-cols-[minmax(0,1fr)_150px]
                      gap-3
                    "
                  >
                    <div
                      className="
                        min-h-[225px]
                        overflow-hidden
                        border-2
                        border-black
                        rounded-[18px]
                        bg-white

                        [&_label]:hidden
                        [&>div]:h-full
                        [&>div]:min-h-0

                        [&_div]:border-0
                        [&_div]:bg-transparent
                        [&_div]:p-0
                        [&_div]:shadow-none

                        [&_textarea]:h-full
                        [&_textarea]:min-h-[225px]
                        [&_textarea]:w-full
                        [&_textarea]:resize-none
                        [&_textarea]:rounded-[18px]
                        [&_textarea]:border-0
                        [&_textarea]:bg-transparent
                        [&_textarea]:px-4
                        [&_textarea]:py-4
                        [&_textarea]:text-[15px]
                        [&_textarea]:leading-[1.55]
                        [&_textarea]:text-[#241b3f]
                        [&_textarea]:outline-none
                        [&_textarea]:shadow-none
                        [&_textarea]:ring-0
                        [&_textarea]:placeholder:text-[#9b93a8]

                        [&_textarea:focus]:outline-none
                        [&_textarea:focus]:ring-0
                      "
                    >
                      <ReflectionTextarea
                        fieldKey={group.fieldKey}
                        label=""
                        rows={7}
                        onSaveStateChange={onSaveStateChange}
                      />
                    </div>

                    <div
                      className="
                        flex
                        min-h-[225px]
                        flex-col
                        items-center
                        justify-center
                        border-2
                        border-black
                        rounded-[18px]
                        bg-white
                        px-4
                        py-5
                      "
                    >
                      <p
                        className="
                          mb-4
                          text-center
                          text-[12px]
                          font-semibold
                          leading-[1.25]
                          text-[#4b3a66]
                        "
                      >
                        {trLines(tr, "Merkitse\nvahvuutesi")}
                      </p>

                      <div
                        className="
                          grid
                          grid-cols-2
                          gap-4
                        "
                      >
                        {[1, 2, 3, 4].map((score) => {
                          const isSelected = selectedScore === score;

                          return (
                            <button
                              key={score}
                              type="button"
                              aria-label={`${tr(group.label)}: ${tr("valitse taso {n}", { n: score })}`}
                              aria-pressed={isSelected}
                              onClick={() => selectScore(group.fieldKey, score)}
                              className={`
                                flex
                                h-[48px]
                                w-[48px]
                                cursor-pointer
                                items-center
                                justify-center
                                rounded-[8px]
                                border-[3px]
                                text-[31px]
                                font-semibold
                                leading-[1.12]
                                transition-all
                                duration-150

                                ${
                                  isSelected
                                    ? "border-black bg-[#eee8f8] text-[#241b3f] shadow-[0_3px_0_rgba(68,42,105,0.18)]"
                                    : "border-black bg-white text-transparent hover:bg-[#f7f3fb]"
                                }

                                focus-visible:outline-none
                                focus-visible:ring-4
                                focus-visible:ring-[#d9ccec]
                              `}
                            >
                              {isSelected ? "✓" : ""}
                            </button>
                          );
                        })}
                      </div>

                      <div
                        className="
                          mt-2
                          grid
                          grid-cols-4
                          gap-[25px]
                          text-center
                          text-[11px]
                          font-semibold
                          text-[#7654ad]
                        "
                      >
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function S17({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto

        text-white
        [scrollbar-gutter:stable]
      "
    >
      <div
        className="
          relative
          mx-auto
          min-h-[760px]
          w-full
          max-w-[1500px]
          overflow-hidden
          px-[9%]
          pb-20
          pt-16
        "
      >
        <img
          src="/illustrations/s17-chain.png"
          alt=""
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            right-[-12px]
            top-[-15px]
            z-10
            h-[310px]
            w-auto
            max-w-[32%]
            object-contain
          "
        />

        <div className="relative z-20 max-w-[1050px]">
          {tr("Haasteet ja vahvuudet – Pohdi ja kirjoita vastaukset.")}
        </div>

        <div
          className="
            relative
            z-20
            mt-6
            grid
            grid-cols-1
            gap-x-20
            gap-y-10
            pr-[16%]
            md:grid-cols-2
          "
        >
          <div className="flex min-h-[245px] min-w-0 flex-col">
            <h2
              className="
                min-h-[72px]
                font-display
                text-[clamp(20px,1.8vw,27px)]
                font-semibold
                leading-[1.28]
                text-white
              "
            >
              {tr("Mitä vaikeudet ovat opettaneet sinulle vahvuuksistasi?")}
            </h2>

            <div
              className="
                relative
                mt-4
                min-h-[155px]
                flex-1
                overflow-hidden
                border-2
                border-black
                rounded-[18px]
                bg-[#fcfbfe]
                shadow-[0_5px_0_#e2d8ed]

                focus-within:bg-white

                [&_label]:hidden

                [&>div]:h-full
                [&>div]:min-h-0

                [&_div]:border-0
                [&_div]:bg-transparent
                [&_div]:p-0
                [&_div]:shadow-none

                [&_textarea]:h-full
                [&_textarea]:min-h-[155px]
                [&_textarea]:w-full
                [&_textarea]:resize-none
                [&_textarea]:rounded-[18px]
                [&_textarea]:border-0
                [&_textarea]:bg-transparent
                [&_textarea]:px-5
                [&_textarea]:py-4
                [&_textarea]:text-[17px]
                [&_textarea]:leading-[1.55]
                [&_textarea]:text-[#241b3f]
                [&_textarea]:outline-none
                [&_textarea]:shadow-none
                [&_textarea]:ring-0
                [&_textarea]:placeholder:text-[#aaa1b5]

                [&_textarea:focus]:outline-none
                [&_textarea:focus]:ring-0
              "
            >
              <ReflectionTextarea
                fieldKey="screen_17_opetukset"
                label=""
                rows={6}
                onSaveStateChange={onSaveStateChange}
              />
            </div>
          </div>

          <div className="flex min-h-[245px] min-w-0 flex-col">
            <h2
              className="
                min-h-[72px]
                font-display
                text-[clamp(20px,1.8vw,27px)]
                font-semibold
                leading-[1.28]
                text-white
              "
            >
              {tr("Miten olet kasvanut ja muuttunut ihmisenä vastoinkäymisten seurauksena?")}
            </h2>

            <div
              className="
                relative
                mt-4
                min-h-[155px]
                flex-1
                overflow-hidden
                border-2
                border-black
                rounded-[18px]
                bg-[#fcfbfe]
                shadow-[0_5px_0_#e2d8ed]

                focus-within:bg-white

                [&_label]:hidden

                [&>div]:h-full
                [&>div]:min-h-0

                [&_div]:border-0
                [&_div]:bg-transparent
                [&_div]:p-0
                [&_div]:shadow-none

                [&_textarea]:h-full
                [&_textarea]:min-h-[155px]
                [&_textarea]:w-full
                [&_textarea]:resize-none
                [&_textarea]:rounded-[18px]
                [&_textarea]:border-0
                [&_textarea]:bg-transparent
                [&_textarea]:px-5
                [&_textarea]:py-4
                [&_textarea]:text-[17px]
                [&_textarea]:leading-[1.55]
                [&_textarea]:text-[#241b3f]
                [&_textarea]:outline-none
                [&_textarea]:shadow-none
                [&_textarea]:ring-0
                [&_textarea]:placeholder:text-[#aaa1b5]

                [&_textarea:focus]:outline-none
                [&_textarea:focus]:ring-0
              "
            >
              <ReflectionTextarea
                fieldKey="screen_17_kasvu"
                label=""
                rows={6}
                onSaveStateChange={onSaveStateChange}
              />
            </div>
          </div>
        </div>

        <div
          className="
            relative
            z-20
            mt-14
            max-w-[1120px]
          "
        >
          <h2
            className="
              font-display
              text-[clamp(20px,1.8vw,27px)]
              font-semibold
              leading-[1.38]
              text-white
            "
          >
            {tr(
              "Mitä sinulle läheinen ihminen, joka tuntee sinut hyvin, sanoisi vahvuuksistasi ja resursseistasi, joilla pärjäät tulevissa haasteissa?",
            )}
          </h2>

          <div
            className="
              relative
              mt-5
              min-h-[150px]
              w-full
              overflow-hidden
              border-2
              border-black
              rounded-[18px]
              bg-[#fcfbfe]
              shadow-[0_5px_0_#e2d8ed]

              focus-within:bg-white

              [&_label]:hidden

              [&>div]:h-full
              [&>div]:min-h-0

              [&_div]:border-0
              [&_div]:bg-transparent
              [&_div]:p-0
              [&_div]:shadow-none

              [&_textarea]:h-full
              [&_textarea]:min-h-[150px]
              [&_textarea]:w-full
              [&_textarea]:resize-none
              [&_textarea]:rounded-[18px]
              [&_textarea]:border-0
              [&_textarea]:bg-transparent
              [&_textarea]:px-5
              [&_textarea]:py-4
              [&_textarea]:text-[17px]
              [&_textarea]:leading-[1.55]
              [&_textarea]:text-[#241b3f]
              [&_textarea]:outline-none
              [&_textarea]:shadow-none
              [&_textarea]:ring-0
              [&_textarea]:placeholder:text-[#aaa1b5]

              [&_textarea:focus]:outline-none
              [&_textarea:focus]:ring-0
            "
          >
            <ReflectionTextarea
              fieldKey="screen_17_laheinen"
              label=""
              rows={5}
              onSaveStateChange={onSaveStateChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- S18 (PDF p23): Vahvuuksien käyttökielto -----
// FIX: title và heading câu hỏi 2 (đổi <br/> thành trLines) giờ đều qua tr()
function S18({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto
        text-white
        [scrollbar-gutter:stable]
      "
    >
      <div
        className="
          relative
          mx-auto
          min-h-[760px]
          w-full
          max-w-[1500px]
          overflow-hidden
          px-[9%]
          pb-20
          pt-16
        "
      >
        <img
          src="/illustrations/s18-can.png"
          alt=""
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            right-[2%]
            top-[28px]
            z-10
            h-[305px]
            w-auto
            max-w-[23%]
            object-contain
          "
        />

        <div className="relative z-20 max-w-[1100px]">
          <h1
            className="
              font-display
              text-[clamp(38px,3.4vw,54px)]
              font-semibold
              leading-[1.08]
              text-white
            "
          >
            {tr("Vahvuuksien käyttökielto")}
          </h1>

          <p
            className="
              mt-12
              max-w-[1050px]
              font-display
              text-[clamp(20px,1.65vw,27px)]
              font-semibold
              leading-[1.35]
              text-white
            "
          >
            {tr("Kuvittele tilanne, jossa ydinvahvuutesi on kielletty seuraavaksi kuukaudeksi.")}
          </p>
        </div>

        <div
          className="
            relative
            z-20
            mt-7
            grid
            grid-cols-1
            gap-x-12
            gap-y-12
            pr-[6%]
            md:grid-cols-2
          "
        >
          <div className="flex min-h-[450px] min-w-0 flex-col">
            <h2
              className="
                min-h-[52px]
                font-display
                text-[clamp(21px,1.8vw,28px)]
                font-semibold
                leading-[1.3]
                text-white
              "
            >
              {tr("Miltä se tuntuisi? Miten se vaikuttaisi arkeesi – ja opiskeluusi?")}
            </h2>

            <div
              className="
                relative
                mt-5
                min-h-[350px]
                flex-1
                overflow-hidden
                border-2
                border-black
                rounded-[18px]
                bg-[#fcfbfe]
                shadow-[0_5px_0_#e2d8ed]

                focus-within:bg-white

                [&_label]:hidden

                [&>div]:h-full
                [&>div]:min-h-0

                [&_div]:border-0
                [&_div]:bg-transparent
                [&_div]:p-0
                [&_div]:shadow-none

                [&_textarea]:h-full
                [&_textarea]:min-h-[350px]
                [&_textarea]:w-full
                [&_textarea]:resize-none
                [&_textarea]:rounded-[18px]
                [&_textarea]:border-0
                [&_textarea]:bg-transparent
                [&_textarea]:px-5
                [&_textarea]:py-4
                [&_textarea]:text-[17px]
                [&_textarea]:leading-[1.55]
                [&_textarea]:text-[#241b3f]
                [&_textarea]:outline-none
                [&_textarea]:shadow-none
                [&_textarea]:ring-0
                [&_textarea]:placeholder:text-[#aaa1b5]

                [&_textarea:focus]:outline-none
                [&_textarea:focus]:ring-0
              "
            >
              <ReflectionTextarea
                fieldKey="screen_18_tunne"
                label=""
                rows={12}
                onSaveStateChange={onSaveStateChange}
              />
            </div>
          </div>

          <div className="flex min-h-[300px] min-w-0 flex-col">
            <h2
              className="
                min-h-[72px]
                font-display
                text-[clamp(21px,1.8vw,28px)]
                font-semibold
                leading-[1.3]
                text-white
              "
            >
              {trLines(tr, "Miten tämä vaikuttaisi arkeesi,\nentä opintoihin?")}
            </h2>

            <div
              className="
                relative
                mt-5
                min-h-[350px]
                flex-1
                overflow-hidden
                border-2
                border-black
                rounded-[18px]
                bg-[#fcfbfe]
                shadow-[0_5px_0_#e2d8ed]

                focus-within:bg-white

                [&_label]:hidden

                [&>div]:h-full
                [&>div]:min-h-0

                [&_div]:border-0
                [&_div]:bg-transparent
                [&_div]:p-0
                [&_div]:shadow-none

                [&_textarea]:h-full
                [&_textarea]:min-h-[350px]
                [&_textarea]:w-full
                [&_textarea]:resize-none
                [&_textarea]:rounded-[18px]
                [&_textarea]:border-0
                [&_textarea]:bg-transparent
                [&_textarea]:px-5
                [&_textarea]:py-4
                [&_textarea]:text-[17px]
                [&_textarea]:leading-[1.55]
                [&_textarea]:text-[#241b3f]
                [&_textarea]:outline-none
                [&_textarea]:shadow-none
                [&_textarea]:ring-0
                [&_textarea]:placeholder:text-[#aaa1b5]

                [&_textarea:focus]:outline-none
                [&_textarea:focus]:ring-0
              "
            >
              <ReflectionTextarea
                fieldKey="screen_18_vaikutus"
                label=""
                rows={12}
                onSaveStateChange={onSaveStateChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- S19 (PDF p24): Idea: Vahvuusjulisteet — informational, no required input -----
// FIX: 3 đoạn <p> giờ qua tr()
function S19() {
  const tr = useTr();
  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-hidden
        text-white
      "
    >
      <div
        className="
          relative
          mx-auto
          h-full
          min-h-0
          w-full
          max-w-[1500px]
          overflow-hidden
          px-[7.5%]
          pb-8
          pt-8
        "
      >
        <div
          className="
            relative
            z-20
            grid
            h-full
            min-h-0
            grid-cols-1
            gap-x-10
            gap-y-10
            lg:grid-cols-[46%_54%]
          "
        >
          <div className="min-w-0 pt-10 lg:pr-6">
            <h1
              className="
                max-w-[600px]
                font-display
                text-[clamp(36px,2.8vw,48px)]
                font-medium
                leading-[1.08]
                tracking-[-0.015em]
                text-white
              "
            >
              {tr(
                "Idé: Vahvuusjulisteet – Jokainen opiskelija tekee julisteen itsestään ja ydinvahvuuksistaan – omalla valokuvalla ja viidellä ydinvahvuudella.",
              )}
            </h1>

            <div
              className="
                mt-9
                max-w-[565px]
                space-y-8
                font-display
                text-[clamp(18px,1.35vw,23px)]
                font-semibold
                leading-[1.42]
                text-white
              "
            >
              <p>
                {tr(
                  "Jokainen opiskelija tekee itsestään ja ydinvahvuuksistaan julisteen, jossa on oma kuva ja viisi ydinvahvuutta.",
                )}
              </p>

              <p>
                {tr(
                  "Millä tavoin voisit tehdä ydinvahvuutesi näkyväksi muille hauskalla ja luovalla tavalla?",
                )}
              </p>

              <p>
                {tr(
                  "Miten haluat visualisoida omat vahvuutesi? Ne parhaat puolesi, jotka tulevat mukanasi päivittäin lukioon.",
                )}
              </p>
            </div>
          </div>

          <div
            className="
              relative
              min-h-0
              min-w-0
              overflow-hidden
            "
          >
            <img
              src="/illustrations/s19-karin-poster.png"
              alt={tr("Esimerkki Karin vahvuusjulisteesta")}
              className="
    pointer-events-none
    absolute
    bottom-[12px]
    right-[3%]
    z-20
    block
    h-[560px]
    w-auto
    max-w-[88%]
    object-contain
    object-bottom
  "
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- S20 (PDF p25): Muistele onnistumista -----
// FIX: title + 4 câu hỏi (kể cả phần có <strong>) giờ đều qua tr(), tách phần in đậm thành tr() riêng
function S20({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto
        px-[5.5%]
        pb-16
        pt-10
        [scrollbar-gutter:stable]
      "
    >
      <div
        className="
          relative
          mx-auto
          min-h-[720px]
          w-full
          max-w-[1420px]
          border-2
          border-black
          rounded-[36px]
          bg-white
          px-[6%]
          pb-16
          pt-12
          text-[#241b3f]
          shadow-[0_8px_24px_rgba(44,27,78,0.08)]
        "
      >
        <h1
          className="
            font-display
            text-[clamp(36px,3vw,52px)]
            font-semibold
            leading-[1.08]
            text-black
          "
        >
          {tr("Muistele onnistumista")}
        </h1>

        <div className="mt-10 space-y-8">
          <section className="grid grid-cols-[16px_1fr] gap-x-4">
            <span
              aria-hidden="true"
              className="
                mt-[12px]
                h-[9px]
                w-[9px]
                rounded-full
                bg-[#ffc936]
              "
            />

            <div className="min-w-0">
              <p
                className="
                  max-w-[1200px]
                  text-[clamp(18px,1.45vw,25px)]
                  font-normal
                  leading-[1.5]
                  text-[#241b3f]
                "
              >
                {tr(
                  "Mieti jotain tilannetta opinnoissa tai vapaa-ajalla, joka sujui hyvin, josta olet ylpeä ja jossa huomasit onnistuvasi sinulle tärkeissä asioissa.",
                )}{" "}
                <strong className="font-semibold">
                  {tr(
                    "Mitä silloin tapahtui? Mikä siinä meni hyvin? Minkälaista palautetta sait toisilta? Mikä siinä oli sinulle tärkeää?",
                  )}
                </strong>
              </p>

              <div
                className="
                  mt-3
                  min-h-[88px]
                  w-full
                  overflow-hidden
                  border-2
                  border-black
                  rounded-[14px]
                  bg-transparent

                  focus-within:bg-[#fbf9fe]

                  [&_label]:hidden

                  [&>div]:h-full
                  [&>div]:min-h-0

                  [&_div]:border-0
                  [&_div]:bg-transparent
                  [&_div]:p-0
                  [&_div]:shadow-none

                  [&_textarea]:h-full
                  [&_textarea]:min-h-[88px]
                  [&_textarea]:w-full
                  [&_textarea]:resize-none
                  [&_textarea]:rounded-[12px]
                  [&_textarea]:border-0
                  [&_textarea]:bg-transparent
                  [&_textarea]:px-4
                  [&_textarea]:py-3
                  [&_textarea]:text-[17px]
                  [&_textarea]:leading-[1.55]
                  [&_textarea]:text-[#241b3f]
                  [&_textarea]:outline-none
                  [&_textarea]:shadow-none
                  [&_textarea]:ring-0
                  [&_textarea]:placeholder:text-[#aaa1b5]

                  [&_textarea:focus]:outline-none
                  [&_textarea:focus]:ring-0
                "
              >
                <ReflectionTextarea
                  fieldKey="screen_20_onnistuminen"
                  label=""
                  rows={4}
                  onSaveStateChange={onSaveStateChange}
                />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-[16px_1fr] gap-x-4">
            <span
              aria-hidden="true"
              className="
                mt-[12px]
                h-[9px]
                w-[9px]
                rounded-full
                bg-[#ffc936]
              "
            />

            <div className="min-w-0">
              <p
                className="
                  max-w-[1180px]
                  text-[clamp(18px,1.45vw,25px)]
                  font-normal
                  leading-[1.4]
                  text-[#171717]
                "
              >
                {tr("Mitä tämä onnistuminen kertoo")}{" "}
                <strong className="font-semibold">{tr("ydinvahvuuksistasi:")}</strong>{" "}
                {tr("mitä omia ydinvahvuuksia käyttämällä onnistuit?")}
              </p>

              <div
                className="
                  mt-3
                  min-h-[78px]
                  w-full
                  overflow-hidden
                  border-2
                  border-black
                  rounded-[14px]
                  bg-transparent

                  focus-within:bg-[#fbf9fe]

                  [&_label]:hidden

                  [&>div]:h-full
                  [&>div]:min-h-0

                  [&_div]:border-0
                  [&_div]:bg-transparent
                  [&_div]:p-0
                  [&_div]:shadow-none

                  [&_textarea]:h-full
                  [&_textarea]:min-h-[78px]
                  [&_textarea]:w-full
                  [&_textarea]:resize-none
                  [&_textarea]:rounded-[12px]
                  [&_textarea]:border-0
                  [&_textarea]:bg-transparent
                  [&_textarea]:px-4
                  [&_textarea]:py-3
                  [&_textarea]:text-[17px]
                  [&_textarea]:leading-[1.55]
                  [&_textarea]:text-[#241b3f]
                  [&_textarea]:outline-none
                  [&_textarea]:shadow-none
                  [&_textarea]:ring-0

                  [&_textarea:focus]:outline-none
                  [&_textarea:focus]:ring-0
                "
              >
                <ReflectionTextarea
                  fieldKey="screen_20_ydinvahvuudet"
                  label=""
                  rows={3}
                  onSaveStateChange={onSaveStateChange}
                />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-[16px_1fr] gap-x-4">
            <span
              aria-hidden="true"
              className="
                mt-[12px]
                h-[9px]
                w-[9px]
                rounded-full
                bg-[#ffc936]
              "
            />

            <div className="min-w-0">
              <p
                className="
                  max-w-[1200px]
                  text-[clamp(18px,1.45vw,25px)]
                  font-normal
                  leading-[1.4]
                  text-[#171717]
                "
              >
                {tr(
                  "Mieti onnistumista, jossa pystyit tukemaan ja auttamaan toisia omia vahvuuksiasi hyödyntämällä? Mitä teit ja kenen kanssa olit? Kerro esimerkki.",
                )}
              </p>

              <div
                className="
                  mt-3
                  min-h-[78px]
                  w-full
                  overflow-hidden
                  border-2
                  border-black
                  rounded-[14px]
                  bg-transparent

                  focus-within:bg-[#fbf9fe]

                  [&_label]:hidden

                  [&>div]:h-full
                  [&>div]:min-h-0

                  [&_div]:border-0
                  [&_div]:bg-transparent
                  [&_div]:p-0
                  [&_div]:shadow-none

                  [&_textarea]:h-full
                  [&_textarea]:min-h-[78px]
                  [&_textarea]:w-full
                  [&_textarea]:resize-none
                  [&_textarea]:rounded-[12px]
                  [&_textarea]:border-0
                  [&_textarea]:bg-transparent
                  [&_textarea]:px-4
                  [&_textarea]:py-3
                  [&_textarea]:text-[17px]
                  [&_textarea]:leading-[1.55]
                  [&_textarea]:text-[#241b3f]
                  [&_textarea]:outline-none
                  [&_textarea]:shadow-none
                  [&_textarea]:ring-0

                  [&_textarea:focus]:outline-none
                  [&_textarea:focus]:ring-0
                "
              >
                <ReflectionTextarea
                  fieldKey="screen_20_tuki"
                  label=""
                  rows={3}
                  onSaveStateChange={onSaveStateChange}
                />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-[16px_1fr] gap-x-4">
            <span
              aria-hidden="true"
              className="
                mt-[12px]
                h-[9px]
                w-[9px]
                rounded-full
                bg-[#ffc936]
              "
            />

            <div className="min-w-0">
              <p
                className="
                  max-w-[1100px]
                  text-[clamp(18px,1.45vw,25px)]
                  font-normal
                  leading-[1.4]
                  text-[#171717]
                "
              >
                {tr("Mitä yhteistä hyvää vahvuutesi edistivät, miten?")}
              </p>

              <div
                className="
                  mt-3
                  min-h-[68px]
                  w-full
                  overflow-hidden
                  border-2
                  border-black
                  rounded-[14px]
                  bg-transparent

                  focus-within:bg-[#fbf9fe]

                  [&_label]:hidden

                  [&>div]:h-full
                  [&>div]:min-h-0

                  [&_div]:border-0
                  [&_div]:bg-transparent
                  [&_div]:p-0
                  [&_div]:shadow-none

                  [&_textarea]:h-full
                  [&_textarea]:min-h-[68px]
                  [&_textarea]:w-full
                  [&_textarea]:resize-none
                  [&_textarea]:rounded-[12px]
                  [&_textarea]:border-0
                  [&_textarea]:bg-transparent
                  [&_textarea]:px-4
                  [&_textarea]:py-3
                  [&_textarea]:text-[17px]
                  [&_textarea]:leading-[1.55]
                  [&_textarea]:text-[#241b3f]
                  [&_textarea]:outline-none
                  [&_textarea]:shadow-none
                  [&_textarea]:ring-0

                  [&_textarea:focus]:outline-none
                  [&_textarea:focus]:ring-0
                "
              >
                <ReflectionTextarea
                  fieldKey="screen_20_yhteinen"
                  label=""
                  rows={3}
                  onSaveStateChange={onSaveStateChange}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ----- S21 (PDF p26): Pohdi onnistumisia ja täydennä! -----
const PAGE_PURPLE = "#7654ad";
const PAGE_CORAL = "#ef6f70";
const PAGE_YELLOW = "#ffd85d";
const PAGE_MINT = "#acd9dc";
const PAPER_SHADOW = "rgba(48, 27, 74, 0.55)";

function WorkbookLogo({ dark = true }: { dark?: boolean }) {
  return (
    <img
      src="/illustrations/huomaa-hyva-logo.png"
      alt="Huomaa hyvä"
      className={cn(
        "pointer-events-none absolute bottom-[24px] right-[28px] z-40 h-auto w-[118px] object-contain",
        !dark && "brightness-0 invert",
      )}
    />
  );
}

function WorkbookCornerShapes({
  top = "coral",
  right = "yellow",
  bottomLeft = "mint",
  bottomRight = "mint",
}: {
  top?: "coral" | "mint" | "none";
  right?: "yellow" | "mint" | "none";
  bottomLeft?: "mint" | "yellow" | "none";
  bottomRight?: "mint" | "yellow" | "none";
}) {
  const color = {
    coral: PAGE_CORAL,
    yellow: PAGE_YELLOW,
    mint: PAGE_MINT,
    none: "transparent",
  } as const;

  return (
    <>
      {top !== "none" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[5%] top-[-92px] z-0 h-[142px] w-[190px] rounded-b-full"
          style={{ backgroundColor: color[top] }}
        />
      )}

      {right !== "none" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-72px] top-[145px] z-0 h-[185px] w-[170px] rotate-[14deg] rounded-[28px]"
          style={{ backgroundColor: color[right] }}
        />
      )}

      {bottomLeft !== "none" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-96px] left-[-62px] z-0 h-[185px] w-[290px] rotate-[15deg] rounded-[38px]"
          style={{ backgroundColor: color[bottomLeft] }}
        />
      )}

      {bottomRight !== "none" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-104px] right-[-48px] z-0 h-[195px] w-[270px] -rotate-[8deg] rounded-[38px]"
          style={{ backgroundColor: color[bottomRight] }}
        />
      )}
    </>
  );
}

function FlatReflectionTextarea({
  fieldKey,
  rows = 4,
  onSaveStateChange,
  minHeight = 130,
  textClass = "text-[16px]",
}: {
  fieldKey: string;
  rows?: number;
  onSaveStateChange?: (s: SaveState) => void;
  minHeight?: number;
  textClass?: string;
}) {
  return (
    <div
      className={cn(
        "h-full min-h-0 w-full",
        "[&_label]:hidden [&>div]:h-full [&>div]:min-h-0",
        "[&_div]:border-0 [&_div]:bg-transparent [&_div]:p-0 [&_div]:shadow-none",
        "[&_textarea]:h-full [&_textarea]:w-full [&_textarea]:resize-none",
        "[&_textarea]:rounded-none [&_textarea]:border-0 [&_textarea]:bg-transparent",
        "[&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:leading-[1.45]",
        "[&_textarea]:text-[#241b3f] [&_textarea]:outline-none [&_textarea]:shadow-none [&_textarea]:ring-0",
        "[&_textarea:focus]:outline-none [&_textarea:focus]:ring-0",
        textClass,
      )}
      style={{ minHeight }}
    >
      <ReflectionTextarea
        fieldKey={fieldKey}
        label=""
        rows={rows}
        onSaveStateChange={onSaveStateChange}
      />
    </div>
  );
}

function IrregularPaper({
  children,
  className,
  rotate = 0,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[#fffefe]",
        "border-2 border-black",
        "shadow-[0_10px_0_var(--paper-shadow)]",
        className,
      )}
      style={
        {
          "--paper-shadow": PAPER_SHADOW,
          transform: `rotate(${rotate}deg)`,
          borderRadius: "12% 4% 11% 5% / 8% 6% 10% 6%",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

// ============================================================
// S21 — PDF page 27: Pohdi onnistumisia ja täydennä!
// ============================================================
function S21({ onSaveStateChange }: Props) {
  const tr = useTr();
  const notes = [
    {
      fieldKey: "screen_21_ylpea",
      label: "Tästä onnistumisesta olen ylpeä",
      rotate: -2.2,
      gridClass: "lg:col-start-2 lg:row-start-1",
    },
    {
      fieldKey: "screen_21_sinnikas",
      label: "Olin sinnikäs kun",
      rotate: -0.8,
      gridClass: "lg:col-start-3 lg:row-start-1",
    },
    {
      fieldKey: "screen_21_kehut",
      label: "Sain kehuja ja kannustusta seuraavista asioista",
      rotate: 1.2,
      gridClass: "lg:col-start-4 lg:row-start-1",
    },
    {
      fieldKey: "screen_21_rohkea",
      label: "Olin rohkea kohdatessani tämän uuden haasteen",
      rotate: -1.3,
      gridClass: "lg:col-start-2 lg:row-start-2",
    },
    {
      fieldKey: "screen_21_tavoite",
      label: "Saavutin tämän tärkeän tavoitteen",
      rotate: 0.8,
      gridClass: "lg:col-start-3 lg:row-start-2",
    },
    {
      fieldKey: "screen_21_tunne",
      label: "Minusta tuntuu tällä hetkellä tältä, kun muistelen kokemaani",
      rotate: -1.1,
      gridClass: "lg:col-start-4 lg:row-start-2",
    },
    {
      fieldKey: "screen_21_vahvuudet",
      label: "Tunnistin nämä vahvuudet, jotka mahdollistivat onnistumisen",
      rotate: -0.5,
      gridClass: "lg:col-start-2 lg:row-start-3",
    },
    {
      fieldKey: "screen_21_uudet",
      label: "Löysin itsestäni tilanteessa uusia tai yllättäviä puolia",
      rotate: 0.9,
      gridClass: "lg:col-start-3 lg:row-start-3",
    },
  ];

  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto
        text-white
        [scrollbar-gutter:stable]
      "
    >
      <div
        className="
          relative
          mx-auto
          min-h-[1180px]
          w-full
          max-w-[1500px]
          overflow-hidden
          px-[5%]
          pb-28
          pt-16
        "
      >
        <div
          className="
            relative
            z-20
            grid
            grid-cols-1
            gap-x-12
            gap-y-16

            md:grid-cols-2

            lg:grid-cols-[25%_1fr_1fr_1fr]
            lg:grid-rows-[270px_270px_270px]
            lg:gap-x-10
            lg:gap-y-20
          "
        >
          <div
            className="
              relative
              z-30
              min-w-0
              pt-8

              md:col-span-2

              lg:col-span-1
              lg:col-start-1
              lg:row-span-2
              lg:row-start-1
              lg:pr-8
              lg:pt-12
            "
          >
            {tr("Pohdi onnistumisia ja täytä!")}
          </div>

          {notes.map((note) => (
            <IrregularPaper
              key={note.fieldKey}
              rotate={note.rotate}
              className={cn(
                `
                  relative
                  z-20
                  flex
                  h-[250px]
                  min-w-0
                  flex-col
                  overflow-hidden
                  px-4
                  pb-4
                  pt-3
                  text-black
                  shadow-[0_10px_0_rgba(59,35,82,0.72)]

                  md:h-[260px]

                  lg:h-full
                  lg:min-h-[270px]
                `,
                note.gridClass,
              )}
            >
              <p
                className="
                  relative
                  z-20
                  mx-auto
                  flex
                  min-h-[44px]
                  max-w-[95%]
                  shrink-0
                  items-start
                  justify-center
                  text-center
                  font-display
                  text-[14px]
                  font-semibold
                  leading-[1.25]
                  text-black
                "
              >
                {tr(note.label)}
              </p>

              <div
                className="
                  relative
                  z-10
                  mt-2
                  min-h-0
                  flex-1
                  overflow-hidden
                  rounded-[16px]

                  [&_label]:hidden

                  [&>div]:h-full
                  [&>div]:min-h-0

                  [&_div]:border-0
                  [&_div]:bg-transparent
                  [&_div]:p-0
                  [&_div]:shadow-none

                  [&_textarea]:h-full
                  [&_textarea]:min-h-0
                  [&_textarea]:w-full
                  [&_textarea]:resize-none
                  [&_textarea]:rounded-[16px]
                  [&_textarea]:border-0
                  [&_textarea]:bg-transparent
                  [&_textarea]:px-3
                  [&_textarea]:py-2
                  [&_textarea]:text-[15px]
                  [&_textarea]:leading-[30px]
                  [&_textarea]:text-[#241b3f]
                  [&_textarea]:outline-none
                  [&_textarea]:shadow-none
                  [&_textarea]:ring-0
                  [&_textarea]:placeholder:text-[#aaa1b5]

                  [&_textarea:focus]:outline-none
                  [&_textarea:focus]:ring-0
                "
              >
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-x-3
                    inset-y-2
                    opacity-65
                    [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_29px,#ddd4ea_30px,#ddd4ea_31px)]
                  "
                />

                <div className="relative z-10 h-full">
                  <FlatReflectionTextarea
                    fieldKey={note.fieldKey}
                    rows={6}
                    minHeight={155}
                    textClass="text-[15px]"
                    onSaveStateChange={onSaveStateChange}
                  />
                </div>
              </div>
            </IrregularPaper>
          ))}

          <div
            aria-hidden="true"
            className="
              hidden
              lg:col-start-4
              lg:row-start-3
              lg:block
            "
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// S22 — PDF page 28: Tulevaisuuden muistelu
// ============================================================
// FIX: tách 2 đoạn <p> có <strong> thành các tr() riêng
function S22({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto
     
        [scrollbar-gutter:stable]
      "
    >
      <div
        className="
          relative
          mx-auto
          min-h-[900px]
          w-full
          max-w-[1500px]
          overflow-hidden
          px-[5.5%]
          pb-20
          pt-16
        "
      >
        <div
          className="
            relative
            z-10
            min-h-[790px]
            rounded-[62px]
            
            px-[5.5%]
            pb-16
            pt-12
            text-white
          "
        >
          <h1
            className="
              max-w-[800px]
              font-display
              text-[clamp(34px,2.6vw,48px)]
              font-semibold
              leading-[1.05]
              text-[#ffd95d]
            "
          >
            {tr(
              "Tulevaisuusmuisto – Mieti opiskelussasi tai vapaa-ajalla tilannetta, jossa voit lähitulevaisuudessa käyttää vahvuuksiasi.",
            )}
          </h1>

          <div className="mt-10 space-y-16">
            <section
              className="
                grid
                grid-cols-[12px_minmax(0,1fr)]
                items-start
                gap-x-4
              "
            >
              <span
                aria-hidden="true"
                className="
                  mt-[10px]
                  h-[8px]
                  w-[8px]
                  rounded-full
                  bg-[#ffc936]
                "
              />

              <div className="min-w-0">
                <div className="pr-[28%]">
                  <p
                    className="
                      max-w-[820px]
                      text-[clamp(17px,1.25vw,22px)]
                      leading-[1.42]
                      text-white
                    "
                  >
                    {tr(
                      "Mieti jotain tilannetta opinnoissa tai vapaa-ajalla, jossa voit lähitulevaisuudessa hyödyntää vahvuuksiasi?",
                    )}{" "}
                    <strong>
                      {tr(
                        "Mikä tulee menemään hyvin? Mistä voit huomata, että olet hyödyntänyt vahvuuksiasi tietoisemmin?",
                      )}
                    </strong>
                  </p>
                </div>

                <div
                  className="
                    relative
                    mt-6
                    min-h-[190px]
                    w-full
                    overflow-hidden
                    border-2
                    border-black
                    rounded-[18px]
                    bg-[#fffefa]
                    shadow-[0_6px_0_#4f267d]

                    focus-within:bg-white
                  "
                >
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      inset-x-5
                      inset-y-4
                      z-0
                      opacity-65
                      [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_29px,#ddd4ea_30px,#ddd4ea_31px)]
                    "
                  />

                  <div
                    className="
                      relative
                      z-10
                      h-full
                      min-h-[190px]

                      [&_label]:hidden

                      [&>div]:h-full
                      [&>div]:min-h-0
                      [&>div]:border-0
                      [&>div]:bg-transparent
                      [&>div]:p-0
                      [&>div]:shadow-none

                      [&_textarea]:h-full
                      [&_textarea]:min-h-[190px]
                      [&_textarea]:w-full
                      [&_textarea]:resize-none
                      [&_textarea]:rounded-[16px]
                      [&_textarea]:border-0
                      [&_textarea]:bg-transparent
                      [&_textarea]:px-5
                      [&_textarea]:py-4
                      [&_textarea]:text-[16px]
                      [&_textarea]:leading-[30px]
                      [&_textarea]:text-[#241b3f]
                      [&_textarea]:outline-none
                      [&_textarea]:shadow-none
                      [&_textarea]:ring-0
                      [&_textarea]:placeholder:text-[#aaa1b5]

                      [&_textarea:focus]:outline-none
                      [&_textarea:focus]:ring-0
                    "
                  >
                    <FlatReflectionTextarea
                      fieldKey="screen_22_tulevaisuus"
                      rows={6}
                      minHeight={190}
                      onSaveStateChange={onSaveStateChange}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section
              className="
                grid
                grid-cols-[12px_minmax(0,1fr)]
                items-start
                gap-x-4
              "
            >
              <span
                aria-hidden="true"
                className="
                  mt-[10px]
                  h-[8px]
                  w-[8px]
                  rounded-full
                  bg-[#ffc936]
                "
              />

              <div className="min-w-0">
                <p
                  className="
                    max-w-[980px]
                    text-[clamp(17px,1.25vw,22px)]
                    leading-[1.42]
                    text-white
                  "
                >
                  {tr(
                    "Mieti jotain tilannetta, jossa et onnistunut hyödyntämään vahvuuksiasi, tai käytit niitä liikaa?",
                  )}{" "}
                  <strong>{tr("Mitä tämä tilanne opetti sinulle?")}</strong>
                </p>

                <div
                  className="
                    relative
                    mt-6
                    min-h-[170px]
                    w-full
                    overflow-hidden
                    border-2
                    border-black
                    rounded-[18px]
                    bg-[#fffefa]
                    shadow-[0_6px_0_#4f267d]

                    focus-within:bg-white
                  "
                >
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      inset-x-5
                      inset-y-4
                      z-0
                      opacity-65
                      [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_29px,#ddd4ea_30px,#ddd4ea_31px)]
                    "
                  />

                  <div
                    className="
                      relative
                      z-10
                      h-full
                      min-h-[170px]

                      [&_label]:hidden

                      [&>div]:h-full
                      [&>div]:min-h-0
                      [&>div]:border-0
                      [&>div]:bg-transparent
                      [&>div]:p-0
                      [&>div]:shadow-none

                      [&_textarea]:h-full
                      [&_textarea]:min-h-[170px]
                      [&_textarea]:w-full
                      [&_textarea]:resize-none
                      [&_textarea]:rounded-[16px]
                      [&_textarea]:border-0
                      [&_textarea]:bg-transparent
                      [&_textarea]:px-5
                      [&_textarea]:py-4
                      [&_textarea]:text-[16px]
                      [&_textarea]:leading-[30px]
                      [&_textarea]:text-[#241b3f]
                      [&_textarea]:outline-none
                      [&_textarea]:shadow-none
                      [&_textarea]:ring-0
                      [&_textarea]:placeholder:text-[#aaa1b5]

                      [&_textarea:focus]:outline-none
                      [&_textarea:focus]:ring-0
                    "
                  >
                    <FlatReflectionTextarea
                      fieldKey="screen_22_oppi"
                      rows={5}
                      minHeight={170}
                      onSaveStateChange={onSaveStateChange}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <img
          src="/illustrations/s22-future-book.png"
          alt={tr("Back to the Future -kirja")}
          className="
            pointer-events-none
            absolute
            right-[2.5%]
            top-[18px]
            z-20
            h-[305px]
            w-auto
            max-w-[23%]
            object-contain
          "
        />
      </div>
    </div>
  );
}

// ============================================================
// S23 — PDF page 29: Ydinvahvuudet parin kanssa
// ============================================================
// FIX: đoạn intro giờ qua tr()
function S23({ onSaveStateChange }: Props) {
  const tr = useTr();
  const questions = [
    {
      fieldKey: "screen_23_innostus",
      text: "Mistä innostut?",
    },
    {
      fieldKey: "screen_23_kevyelta",
      text: "Minkä tekeminen tuntuu kevyeltä?",
    },
    {
      fieldKey: "screen_23_palaute",
      text: "Mistä luonteenvahvuuksista saat kiitosta ja palautetta toisilta?",
    },
    {
      fieldKey: "screen_23_parasta_opinnoissa",
      text: "Mikä on parasta opinnoissa?",
    },
    {
      fieldKey: "screen_23_love_to_do",
      text: "Mitkä asiat päätyvät love-to-do -listalle?",
    },
    {
      fieldKey: "screen_23_flow",
      text: "Mitä tehdessä aika ja paikka unohtuvat ja pääset flow-tilaan?",
    },
    {
      fieldKey: "screen_23_lukioon",
      text: "Mitkä vahvuudet tulevat lukioon, kun sinä tulet paikalle?",
    },
    {
      fieldKey: "screen_23_arvostat",
      text: "Mitä vahvuuksia arvostat eniten itsessäsi?",
    },
    {
      fieldKey: "screen_23_lapsena",
      text: "Mitä samoja vahvuuksia sinussa oli jo lapsena?",
    },
    {
      fieldKey: "screen_23_vapaalla",
      text: "Mitä luonteenvahvuuksia hyödynnät eniten vapaalla?",
    },
  ];

  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto
      
        text-white
        [scrollbar-gutter:stable]
      "
    >
      <div
        className="
          relative
          mx-auto
          min-h-[2350px]
          w-full
          max-w-[1500px]
          overflow-hidden
          px-[8%]
          pb-28
          pt-16
        "
      >
        <div className="relative z-20">
          <div className="pr-[18%]">
            <h1
              className="
                font-display
                text-[clamp(36px,3vw,52px)]
                font-semibold
                leading-[1.05]
                text-[#ffd95d]
              "
            >
              {tr(
                "Ydinvahvuudet pareittain – Keskustele parin kanssa. Vastatkaa kysymyksiin. Käyttäkää vahvuuskarkkejanne tukena.",
              )}
            </h1>

            <p
              className="
                mt-7
                max-w-[1050px]
                text-[clamp(17px,1.35vw,23px)]
                font-semibold
                leading-[1.45]
                text-white
              "
            >
              {tr(
                "Keskustele parin kanssa. Vastaa kysymyksiin. Käyttäkää omia vahvuuskarkkeja apuna keskustelussa.",
              )}
            </p>
          </div>

          <img
            src="/illustrations/s23-candy-banana-shoe.png"
            alt=""
            aria-hidden="true"
            className="
    pointer-events-none
    absolute
    right-[1%]
    top-[-30px]
    z-20
    h-[230px]
    w-auto
    max-w-none
    object-contain
  "
          />

          <div
            className="
              mt-12
              grid
              grid-cols-1
              gap-x-12
              gap-y-10
              lg:grid-cols-2
            "
          >
            {questions.map((question, index) => (
              <section
                key={question.fieldKey}
                className="
                  min-w-0
                "
              >
                <div
                  className="
                    grid
                    min-h-[64px]
                    grid-cols-[10px_minmax(0,1fr)]
                    items-start
                    gap-x-5
                  "
                >
                  <span
                    aria-hidden="true"
                    className="
                      mt-[11px]
                      h-[8px]
                      w-[8px]
                      rounded-full
                      bg-[#ffc936]
                    "
                  />

                  <h2
                    className="
                      text-[clamp(18px,1.4vw,24px)]
                      font-medium
                      leading-[1.35]
                      text-white
                    "
                  >
                    {index + 1}. {tr(question.text)}
                  </h2>
                </div>

                <div
                  className="
                    relative
                    mt-4
                    min-h-[205px]
                    w-full
                    overflow-hidden
                    border-2
                    border-black
                    rounded-[18px]
                    bg-[#fffefa]
                    shadow-[0_6px_0_rgba(68,42,105,0.18)]

                    focus-within:bg-white
                  "
                >
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      inset-x-5
                      inset-y-4
                      z-0
                      opacity-65
                      [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_29px,#ddd4ea_30px,#ddd4ea_31px)]
                    "
                  />

                  <div
                    className="
                      relative
                      z-10
                      h-full
                      min-h-[205px]

                      [&_label]:hidden

                      [&>div]:h-full
                      [&>div]:min-h-0

                      [&_div]:border-0
                      [&_div]:bg-transparent
                      [&_div]:p-0
                      [&_div]:shadow-none

                      [&_textarea]:h-full
                      [&_textarea]:min-h-[205px]
                      [&_textarea]:w-full
                      [&_textarea]:resize-none
                      [&_textarea]:rounded-[16px]
                      [&_textarea]:border-0
                      [&_textarea]:bg-transparent
                      [&_textarea]:px-5
                      [&_textarea]:py-4
                      [&_textarea]:text-[16px]
                      [&_textarea]:leading-[30px]
                      [&_textarea]:text-[#241b3f]
                      [&_textarea]:outline-none
                      [&_textarea]:shadow-none
                      [&_textarea]:ring-0
                      [&_textarea]:placeholder:text-[#aaa1b5]

                      [&_textarea:focus]:outline-none
                      [&_textarea:focus]:ring-0
                    "
                  >
                    <ReflectionTextarea
                      fieldKey={question.fieldKey}
                      label=""
                      rows={6}
                      onSaveStateChange={onSaveStateChange}
                    />
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// S24 — PDF page 30: Anna palautetta ja kehuja
// ============================================================
// FIX: title (đổi <br/> thành trLines) giờ qua tr()
function S24({ onSaveStateChange }: Props) {
  const tr = useTr();
  const bubbles = [
    {
      key: "screen_24_palaute_1",
      label: "KERRO LISÄÄ!",
      rotateClass: "-rotate-[2deg]",
    },
    {
      key: "screen_24_palaute_2",
      label: "TARKOITATKO ETTÄ…",
      rotateClass: "rotate-[1.5deg]",
    },
    {
      key: "screen_24_palaute_3",
      label: "OLEN YLPEÄ SINUSTA, KOSKA…",
      rotateClass: "-rotate-[1deg]",
    },
    {
      key: "screen_24_palaute_4",
      label: "SINUN VAHVUUKSIASI OVAT AINAKIN…",
      rotateClass: "rotate-[1.5deg]",
    },
    {
      key: "screen_24_palaute_5",
      label: "WAU, OPIN ETTÄ…",
      rotateClass: "-rotate-[1.5deg]",
    },
    {
      key: "screen_24_palaute_6",
      label: "TÄMÄ OLI TÄRKEÄÄ KUULLA, KOSKA…",
      rotateClass: "rotate-[1deg]",
    },
  ];

  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto
       
        text-white
        [scrollbar-gutter:stable]
      "
    >
      <div
        className="
          relative
          mx-auto
          min-h-[1120px]
          w-full
          max-w-[1500px]
          overflow-hidden
          px-[7%]
          pb-28
          pt-14
        "
      >
        <h1
          className="
            relative
            z-20
            max-w-[1050px]
            font-display
            text-[clamp(36px,3vw,52px)]
            font-semibold
            leading-[1.12]
            text-[#ffd95d]
          "
        >
          {trLines(tr, "Anna palautetta ja kehuja täydentämällä\nseuraavia lauseenalkuja:")}
        </h1>

        <div
          className="
            relative
            z-20
            mt-14
            grid
            grid-cols-1
            gap-x-14
            gap-y-20

            md:grid-cols-2

            xl:grid-cols-3
            xl:gap-x-16
            xl:gap-y-24
          "
        >
          {bubbles.map((bubble) => (
            <div
              key={bubble.key}
              className={`
                relative
                flex
                min-h-[320px]
                min-w-0
                flex-col
                overflow-hidden
                border-2
                border-black
                bg-white
                px-5
                pb-5
                pt-5
                shadow-[0_9px_0_rgba(68,42,105,0.22)]
                transition-transform
                duration-200
                hover:-translate-y-1

                ${bubble.rotateClass}
              `}
              style={{
                borderRadius: "48% 52% 46% 54% / 48% 44% 56% 52%",
              }}
            >
              <p
                className="
                  relative
                  z-20
                  mx-auto
                  flex
                  min-h-[52px]
                  max-w-[92%]
                  shrink-0
                  items-start
                  justify-center
                  text-center
                  font-display
                  text-[17px]
                  font-semibold
                  leading-[1.25]
                  text-[#241b3f]
                "
              >
                {tr(bubble.label)}
              </p>

              <div
                className="
                  relative
                  z-10
                  mt-3
                  min-h-[210px]
                  flex-1
                  overflow-hidden
                  border-2
                  border-black
                  rounded-[22px]
                  bg-[#fffefa]

                  focus-within:bg-white
                "
              >
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-x-5
                    inset-y-4
                    z-0
                    opacity-70
                    [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_29px,#ddd4ea_30px,#ddd4ea_31px)]
                  "
                />

                <div
                  className="
                    relative
                    z-10
                    h-full
                    min-h-[210px]

                    [&_label]:hidden

                    [&>div]:h-full
                    [&>div]:min-h-0
                    [&>div]:border-0
                    [&>div]:bg-transparent
                    [&>div]:p-0
                    [&>div]:shadow-none

                    [&_textarea]:h-full
                    [&_textarea]:min-h-[210px]
                    [&_textarea]:w-full
                    [&_textarea]:resize-none
                    [&_textarea]:rounded-[20px]
                    [&_textarea]:border-0
                    [&_textarea]:bg-transparent
                    [&_textarea]:px-5
                    [&_textarea]:py-4
                    [&_textarea]:text-[15px]
                    [&_textarea]:leading-[30px]
                    [&_textarea]:text-[#241b3f]
                    [&_textarea]:outline-none
                    [&_textarea]:shadow-none
                    [&_textarea]:ring-0
                    [&_textarea]:placeholder:text-[#aaa1b5]

                    [&_textarea:focus]:outline-none
                    [&_textarea:focus]:ring-0
                  "
                >
                  <FlatReflectionTextarea
                    fieldKey={bubble.key}
                    rows={6}
                    minHeight={210}
                    textClass="text-[15px]"
                    onSaveStateChange={onSaveStateChange}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// S25 — PDF page 32: Tässä olen minä
// ============================================================
function S25({ onSaveStateChange }: Props) {
  const tr = useTr();
  const notes = [
    {
      key: "screen_25_tassa_1",
      label: "Minulle tärkeää on",
      className: "left-[28%] top-[5%] h-[195px] w-[18%]",
      rotate: -1,
    },
    {
      key: "screen_25_tassa_2",
      label: "Tulen iloiseksi, kun",
      className: "left-[47%] top-[7%] h-[205px] w-[19%]",
      rotate: 1,
    },
    {
      key: "screen_25_tassa_3",
      label: "Läheisissäni parasta on",
      className: "right-[4%] top-[7%] h-[200px] w-[19%]",
      rotate: 2,
    },
    {
      key: "screen_25_tassa_4",
      label: "Osaan hyvin ja tykkään tehdä",
      className: "left-[6%] top-[27%] h-[205px] w-[19%]",
      rotate: -4,
    },
    {
      key: "screen_25_tassa_5",
      label: "Parasta ryhmässäni on",
      className: "left-[29%] top-[31%] h-[190px] w-[18%]",
      rotate: 2,
    },
    {
      key: "screen_25_tassa_6",
      label: "Opinnoissa lempiaineita ovat",
      className: "left-[49%] top-[34%] h-[195px] w-[20%]",
      rotate: -2,
    },
    {
      key: "screen_25_tassa_7",
      label: "Minulle on vaikeaa",
      className: "right-[3%] top-[35%] h-[200px] w-[19%]",
      rotate: 2,
    },
    {
      key: "screen_25_tassa_8",
      label: "Lempitekemistä",
      className: "left-[8%] top-[57%] h-[185px] w-[19%]",
      rotate: 1,
    },
    {
      key: "screen_25_tassa_9",
      label: "Vapaa-ajalla tykkään",
      className: "left-[31%] top-[67%] h-[190px] w-[19%]",
      rotate: -1,
    },
    {
      key: "screen_25_tassa_10",
      label: "Lukiossa haluaisin oppia",
      className: "left-[51%] top-[64%] h-[190px] w-[19%]",
      rotate: 1,
    },
    {
      key: "screen_25_tassa_11",
      label: "Lukiossa minua innostaa",
      className: "right-[2%] top-[67%] h-[190px] w-[19%]",
      rotate: -1,
    },
  ];

  return (
    <div className="relative h-full min-h-0 w-full overflow-x-hidden overflow-y-auto text-white [scrollbar-gutter:stable]">
      <div className="relative mx-auto min-h-[850px] w-full max-w-[1500px] overflow-hidden px-[7%] pb-20 pt-12">
        <h1 className="absolute left-[7%] top-[8%] z-20 w-[17%] font-display text-[clamp(40px,3.5vw,58px)] font-medium leading-[1.08]">
          {tr("Täällä olen minä:")}
        </h1>

        {notes.map((note) => (
          <IrregularPaper
            key={note.key}
            rotate={note.rotate}
            className={cn("absolute z-20 p-3 text-black", note.className)}
          >
            <p className="min-h-[34px] text-center font-display text-[14px] font-semibold leading-[1.2]">
              {tr(note.label)}
            </p>
            <div className="h-[calc(100%-36px)]">
              <FlatReflectionTextarea
                fieldKey={note.key}
                rows={4}
                minHeight={100}
                textClass="text-[14px]"
                onSaveStateChange={onSaveStateChange}
              />
            </div>
          </IrregularPaper>
        ))}
      </div>
    </div>
  );
}

const LIKERT_STATEMENTS = [
  "Pystyn yleensä tekemään sitä, mitä teen parhaiten",
  "Hyödynnän aina vahvuuksiani",
  "Pyrin aina käyttämään vahvuuksiani",
  "Saavutan haluamani käyttämällä vahvuuksiani",
  "Käytän vahvuuksiani päivittäin",
  "Käytän vahvuuksiani saadakseni elämässä sen, mitä haluan",
  "Opinnoissani minulla on paljon mahdollisuuksia käyttää vahvuuksiani",
  "Elämä tarjoilee minulle monia eri tapoja käyttää vahvuuksiani",
  "Vahvuuksien käyttäminen on minulle luontaista",
  "Vahvuuksien käyttäminen tekemissäni asioissa on minusta helppoa",
  "Pystyn käyttämään vahvuuksiani monissa eri tilanteissa",
  "Suurimman osan ajastani teen asioita, joissa olen hyvä",
  "Vahvuuksien käyttäminen on minulle tuttua",
  "Pystyn käyttämään vahvuuksiani monin eri tavoin",
] as const;

// ============================================================
// Likert helper restyled for S26
// ============================================================
function LikertRow({
  fieldKey,
  index,
  label,
  onSaveStateChange,
  onValue,
}: {
  fieldKey: string;
  index: number;
  label: string;
  onSaveStateChange?: (s: SaveState) => void;
  onValue?: (n: number) => void;
}) {
  const tr = useTr();
  const [value, setValue] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const report = useReportCompletion();

  useEffect(() => {
    (async () => {
      const savedValue = await loadResponse<number>(fieldKey);

      if (typeof savedValue === "number") {
        setValue(savedValue);
      }

      setLoaded(true);
    })();
  }, [fieldKey]);

  const state = useAutosave(fieldKey, value, {
    enabled: loaded && value !== null,
  });

  useEffect(() => {
    onSaveStateChange?.(state);
  }, [state, onSaveStateChange]);

  useEffect(() => {
    if (!loaded) return;

    report(fieldKey, value !== null);

    if (value !== null) {
      onValue?.(value);
    }
  }, [value, loaded, fieldKey, report, onValue]);

  return (
    <div
      className="
        grid
        min-h-[52px]
        grid-cols-[minmax(0,1fr)_auto]
        items-center
        gap-x-8
        rounded-[14px]
        px-3
        py-2
        text-[clamp(15px,1.15vw,19px)]
        leading-[1.35]
        transition-colors
        hover:bg-white/5
      "
    >
      <div className="min-w-0 pr-4 text-white">
        <span className="mr-1 font-medium">{index + 1}.</span>
        <span>{tr(label)}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setValue(n)}
            className={cn(
              `
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                border-0
                text-[13px]
                font-semibold
                transition
                duration-150
              `,
              value === n
                ? "bg-white text-[#7654ad] shadow-[0_3px_0_rgba(42,24,74,0.32)]"
                : "bg-white/15 text-white hover:bg-white/25",
            )}
            aria-label={`${n}/5`}
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// S26 — PDF page 33: Omien vahvuuksien käyttö
// ============================================================
// FIX: đoạn giải thích, chú thích thang điểm, "Vastaa kyselyyn.", "Laske yhteen pisteesi:" giờ qua tr()
function S26({ onSaveStateChange }: Props) {
  const tr = useTr();
  const [scores, setScores] = useState<Record<number, number>>({});

  const sum = Object.values(scores).reduce((total, currentValue) => total + currentValue, 0);

  return (
    <div
      className="
        relative
        h-full
        min-h-0
        w-full
        overflow-x-hidden
        overflow-y-auto
        text-white
        [scrollbar-gutter:stable]
      "
    >
      <div
        className="
          relative
          mx-auto
          min-h-[1220px]
          w-full
          max-w-[1500px]
          px-[7%]
          pb-28
          pt-14
        "
      >
        <div
          className="
            relative
            z-10
            mx-auto
            w-full
            max-w-[1320px]
            pb-12
          "
        >
          <h1
            className="
              font-display
              text-[clamp(38px,3vw,54px)]
              font-semibold
              leading-[1.05]
              text-[#ffd95d]
            "
          >
            {tr(
              "Omien vahvuuksien käyttäminen – asteikko (Govindji & Linley, 2007) – Vastaa seuraavaan asteikolla 1 (täysin eri mieltä) – 5 (täysin samaa mieltä).",
            )}
          </h1>

          <p className="mt-3 text-[16px] text-white/85">Govindji and Linley (2007)</p>

          <p
            className="
              mt-6
              max-w-[1120px]
              text-[clamp(16px,1.3vw,21px)]
              leading-[1.45]
              text-white
            "
          >
            {tr(
              "Asteikolla 1 täysin eri mieltä, 2.. 3.. 4.. ja 5 täysin samaa mieltä, vastaa seuraavaan mittariin vahvuuksien käytöstä.",
            )}
          </p>

          <div
            className="
              mt-7
              flex
              flex-wrap
              items-center
              gap-x-8
              gap-y-3
              border-2
              border-black
              rounded-[16px]
              bg-white/10
              px-5
              py-4
              text-[14px]
              text-white
            "
          >
            <span>
              <strong>1</strong> = {tr("täysin eri mieltä")}
            </span>

            <span>
              <strong>2</strong> = {tr("eri mieltä")}
            </span>

            <span>
              <strong>3</strong> = {tr("ei samaa eikä eri mieltä")}
            </span>

            <span>
              <strong>4</strong> = {tr("samaa mieltä")}
            </span>

            <span>
              <strong>5</strong> = {tr("täysin samaa mieltä")}
            </span>
          </div>

          <div
            className="
              mt-8
              grid
              gap-y-3
            "
          >
            {LIKERT_STATEMENTS.map((statement, index) => (
              <LikertRow
                key={tr(statement)}
                fieldKey={`screen_26_likert_${index + 1}`}
                index={index}
                label={tr(statement)}
                onSaveStateChange={onSaveStateChange}
                onValue={(value) =>
                  setScores((current) => ({
                    ...current,
                    [index]: value,
                  }))
                }
              />
            ))}
          </div>

          <div
            className="
              mt-12
              ml-auto
              flex
              w-fit
              max-w-full
              items-center
              gap-5
              border-2
              border-black
              rounded-[20px]
              bg-white/10
              px-7
              py-5
              text-white
            "
          >
            <span
              aria-hidden="true"
              className="
                font-display
                text-[64px]
                font-semibold
                leading-[1.12]
                text-[#ffd95d]
              "
            >
              ›
            </span>

            <div
              className="
                text-[clamp(18px,1.4vw,24px)]
                font-semibold
                leading-[1.4]
              "
            >
              <p>{tr("Vastaa kyselyyn.")}</p>

              <p className="mt-1">
                {tr("Laske yhteen pisteesi:")}{" "}
                <span
                  className="
                    ml-2
                    inline-flex
                    min-w-[88px]
                    items-center
                    justify-center
                    border-b-2
                    border-[#ffd95d]
                    px-3
                    text-[#ffd95d]
                  "
                >
                  {sum || ""}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// M2Intro — Module 2 title card
// ============================================================
// FIX: "Tasot  2" và h1 (đổi <br/> thành trLines) giờ qua tr()
function M2Intro() {
  const tr = useTr();
  return (
    <div className="relative h-full min-h-[620px] w-full overflow-hidden  text-white">
      <div className="absolute right-[4%] top-0 rounded-b-[12px] border-2 border-t-0 border-black bg-[#7654ad] px-5 py-3 text-white">
        <span className="font-display text-[20px] font-semibold">{tr("Tasot 2")}</span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-8">
        <h1 className="text-center font-display text-[clamp(48px,5vw,78px)] font-semibold leading-[1.08] tracking-[-0.02em]">
          {trLines(tr, "2. Omat vahvuudet\nlukiossa")}
        </h1>
      </div>
    </div>
  );
}

// ============================================================
// S28 — Omat vahvuuteni lukiossa
// ============================================================
// FIX: 3 đoạn <p> giờ qua tr()
function S28() {
  const tr = useTr();
  return (
    <div className="relative h-full min-h-0 w-full overflow-x-hidden overflow-y-auto  text-white [scrollbar-gutter:stable]">
      <div className="relative mx-auto min-h-[720px] w-full max-w-[1500px] overflow-hidden px-[8%] pb-20 pt-16">
        <div className="relative z-20 max-w-[1150px]">
          <h1 className="font-display text-[clamp(38px,3vw,54px)] font-semibold leading-[1.12] text-[#ffd95d]">
            {tr("Mina styrkor i gymnasiet")}
          </h1>

          <div className="mt-10 space-y-8 text-[clamp(18px,1.5vw,25px)] leading-[1.42]">
            <p>
              {tr(
                "Tässä kokonaisuudessa pääset tutustumaan ja työstämään omia vahvuuksiasi lukiolaisena.",
              )}
            </p>

            <p>
              {tr(
                "Koulukulttuurissa ja opinnoissa virheiden ja puutteiden tunnistaminen tapahtuu kuin itsestään, mutta sen vastavoima, eli vahvuudet ja onnistumiset, eivät tavallisesti pääsekään esiin arvolleen kuuluvalla tavalla. Opiskelussa huomio saattaa kiinnittyä kaikkeen siihen, mitä ei vielä osaa, missä ei ole onnistunut ja mitä kaikkea pitäisi vielä kehittää ja oppia.",
              )}
            </p>

            <p>
              {tr(
                "Kasvamme ja kehitymme ihmisenä läpi opintojen ja koko elämän. On hyvä muistaa, että luonteenvahvuudet eivät ole syntymässä fiksattuja ominaisuuksia, vaan niitä voi tavoitteellisesti kehittää. Lähtökohta on, että opit tunnistamaan omat vahvuutesi opiskelijana jotta voit hyödyntää niitä osana opintoja.",
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Reusable Vahvuuskarkkini worksheet — design used by S29
// ============================================================
// FIX: "Valitse 1–2 vahvuuskarkkia ja" / "Kirjoita vahvuudet tähän" / "Pohdi, mitä teit, koit ja opit."
// / "Täydennä oheinen tehtävä." giờ đều qua tr()
function VahvuuskarkkiSheet({
  title,
  context,
  fieldPrefix,
  onSaveStateChange,
}: {
  title: string;
  context: string;
  fieldPrefix: string;
  onSaveStateChange?: (s: SaveState) => void;
}) {
  const tr = useTr();
  const fields = [
    {
      key: `${fieldPrefix}_opit`,
      label: "3. Mitä opit?",
      className: "left-[50%] top-[9%] h-[145px] w-[30%]",
    },
    {
      key: `${fieldPrefix}_seuraavaksi`,
      label: "2. Mitä tapahtui seuraavaksi?",
      className: "left-[44%] top-[38%] h-[145px] w-[22%]",
    },
    {
      key: `${fieldPrefix}_hyodynnat`,
      label: "4. Miten hyödynnät oppimaasi?",
      className: "left-[68%] top-[38%] h-[145px] w-[22%]",
    },
    {
      key: `${fieldPrefix}_teit`,
      label: "1. Mitä teit?",
      className: "left-[50%] top-[69%] h-[145px] w-[30%]",
    },
  ];

  return (
    <div className="relative h-full min-h-0 w-full overflow-x-hidden overflow-y-auto  text-white [scrollbar-gutter:stable]">
      <div className="relative mx-auto min-h-[760px] w-full max-w-[1500px] overflow-hidden px-[8%] pb-20 pt-14">
        <div className="relative z-20 w-[34%] pt-8">
          <h1 className="font-display text-[clamp(38px,3.1vw,54px)] font-semibold leading-[1.12]">
            {tr(title)}
          </h1>
          <p className="mt-10 max-w-[420px] text-[clamp(21px,1.8vw,30px)] font-semibold leading-[1.28] text-white">
            {tr("Valitse 1–2 vahvuuskarkkia ja")}{" "}
            <span className="bg-[#c9e2ff] px-1">{tr("hyödynnä")}</span> {tr(context)}.
            <br />
            {tr("Kirjoita vahvuudet tähän")}
          </p>

          <div className="mt-7 max-w-[390px] [&_label]:hidden [&_input]:border-0 [&_input]:border-b-2 [&_input]:border-black [&_input]:bg-transparent [&_input]:text-[18px] [&_input]:outline-none">
            <ReflectionInput
              fieldKey={`${fieldPrefix}_karkit`}
              prefix=""
              placeholder=""
              onSaveStateChange={onSaveStateChange}
            />
          </div>

          <p className="mt-24 text-[clamp(19px,1.6vw,26px)] font-semibold leading-[1.35] text-white">
            {tr("Pohdi, mitä teit, koit ja opit.")}
          </p>
          <div className="mt-8 grid grid-cols-[10px_minmax(0,1fr)] gap-x-4">
            <span className="mt-[10px] h-[8px] w-[8px] rounded-full bg-[#ffc936]" />
            <p className="text-[clamp(18px,1.45vw,24px)]">{tr("Täydennä oheinen tehtävä.")}</p>
          </div>

          <img
            src="/illustrations/s29-candy-collage.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-40px] left-[-10%] h-[250px] w-auto object-contain"
          />
        </div>

        <div className="absolute right-[8%] top-[11%] z-20 h-[650px] w-[47%] rounded-[34px] border-2 border-black bg-[#ef6f70] shadow-[0_8px_18px_rgba(0,0,0,0.22)]">
          <div className="absolute left-[28%] top-[-38px] rounded-t-[14px] border-2 border-b-0 border-black bg-[#acd9b1] px-16 py-2 font-display text-[16px] font-semibold uppercase text-black">
            {tr(context)}
          </div>

          {fields.map((field) => (
            <div key={field.key} className={cn("absolute", field.className)}>
              <div className="h-full overflow-hidden rounded-[18px] border-2 border-black bg-white">
                <FlatReflectionTextarea
                  fieldKey={field.key}
                  rows={4}
                  minHeight={115}
                  onSaveStateChange={onSaveStateChange}
                />
              </div>
              <p className="mt-2 text-center font-display text-[18px] font-semibold leading-[1.2] text-white">
                {tr(field.label)}
              </p>
            </div>
          ))}

          <div className="pointer-events-none absolute inset-0 text-white">
            <span className="absolute bottom-[13%] left-[8%] text-[70px]">↖</span>
            <span className="absolute right-[7%] top-[27%] text-[70px]">↘</span>
            <span className="absolute bottom-[15%] right-[8%] text-[70px]">↙</span>
          </div>
        </div>

        <img
          src="/illustrations/s29-side-candies.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[48px] right-[1%] z-10 h-[210px] w-auto object-contain"
        />
      </div>
    </div>
  );
}

// FIX: title trước đây bị tr() 2 lần (1 lần ở đây, 1 lần bên trong VahvuuskarkkiSheet).
// Nay truyền chuỗi Phần Lan gốc, để VahvuuskarkkiSheet tự tr() một lần duy nhất.
function S29(p: Props) {
  return (
    <VahvuuskarkkiSheet
      title="Vahvuuskarkkini – Merkkaa tähän vahvuuskarkkisi!"
      context="lukiossa"
      fieldPrefix="screen_29"
      onSaveStateChange={p.onSaveStateChange}
    />
  );
}

// ============================================================
// S30 — Osaamisen osa-alueiden palapeli
// ============================================================
// FIX: đoạn <p> phụ (trùng h1) giờ qua tr()
function S30({ onSaveStateChange }: Props) {
  const tr = useTr();
  const pieces = [
    {
      key: "screen_30_lahjakkuudet",
      tab: "LAHJAKKUUDET",
      question: "MISSÄ OLET HYVÄ?",
      className: "left-[35%] top-[4%] h-[315px] w-[31%]",
      clip: "polygon(0 3%, 100% 0, 92% 42%, 100% 58%, 92% 100%, 55% 96%, 48% 100%, 0 96%)",
    },
    {
      key: "screen_30_taidot",
      tab: "TAIDOT",
      question: "MITÄ TAITOJA SINULLA JO ON, JOITA HYÖDYNNÄT OPINNOISSA?",
      className: "right-[3%] top-[1%] h-[325px] w-[31%]",
      clip: "polygon(5% 0, 100% 0, 100% 100%, 55% 96%, 47% 100%, 0 96%, 8% 58%, 0 43%)",
    },
    {
      key: "screen_30_kiinnostukset",
      tab: "KIINNOSTUKSEN KOHTEET",
      question: "MITÄ HARRASTAT? MITKÄ OVAT INNOSTUKSEN JA INTOHIMON KOHTEITA VAPAA-AJALLASI?",
      className: "left-[36%] top-[50%] h-[315px] w-[31%]",
      clip: "polygon(0 3%, 48% 0, 55% 5%, 100% 2%, 92% 43%, 100% 58%, 92% 100%, 0 96%, 8% 58%, 0 42%)",
    },
    {
      key: "screen_30_resurssit",
      tab: "RESURSSIT",
      question:
        "MITKÄ ASIAT TAI HENKILÖT OVAT VOIMAVAROJASI? MIKÄ AUTTAA SINUA PYSYMÄÄN VAHVANA VAIKEINA AIKOINA? MIKÄ TUO ELÄMÄÄSI MERKITYSTÄ?",
      className: "right-[4%] top-[49%] h-[315px] w-[31%]",
      clip: "polygon(5% 0, 100% 3%, 100% 96%, 55% 100%, 48% 95%, 0 100%, 8% 58%, 0 42%)",
    },
  ];

  return (
    <div className="relative h-full min-h-0 w-full overflow-x-hidden overflow-y-auto bg-[#7654ad] text-white [scrollbar-gutter:stable]">
      <div className="relative mx-auto min-h-[820px] w-full max-w-[1500px] overflow-hidden px-[7%] pb-20 pt-12">
        <WorkbookCornerShapes top="coral" right="yellow" bottomLeft="mint" bottomRight="mint" />

        <div className="absolute left-[7%] top-[8%] z-20 w-[24%]">
          <h1 className="font-display text-[clamp(38px,3.4vw,56px)] font-medium leading-[1.08]">
            {tr(
              "Osaamispalojen palapeli: Meillä kaikilla on osaamista ja voimavaroja elämässämme. Ne voidaan jakaa neljään alueeseen: lahjakkuuteen, taitoihin, kiinnostuksenkohteisiin ja resursseihin.",
            )}
          </h1>
          <p className="mt-8 text-[clamp(19px,1.55vw,26px)] leading-[1.35]">
            {tr(
              "Meillä kaikilla on osaamisia ja tukipilareita elämässämme. Nämä voidaan jakaa neljään osa-alueeseen:",
            )}{" "}
            <strong>
              {tr("lahjakkuuksiin, taitoihin, kiinnostuksen kohteisiin ja resursseihin.")}
            </strong>
          </p>
          <p className="mt-16 text-[17px]">(Niemiec, 2018)</p>

          <img
            src="/illustrations/s30-puzzle-person.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-330px] left-[-45%] h-[470px] w-auto object-contain"
          />
        </div>

        {pieces.map((piece) => (
          <div key={piece.key} className={cn("absolute z-20", piece.className)}>
            <div className="absolute left-1/2 top-[-28px] -translate-x-1/2 rounded-t-[12px] border-2 border-b-0 border-black bg-[#65bdc5] px-5 py-2 text-center font-display text-[12px] font-semibold">
              {tr(piece.tab)}
            </div>
            <div
              className="h-full border-2 border-black bg-white p-5 text-black shadow-[0_9px_0_rgba(48,27,74,0.55)]"
              style={{ clipPath: piece.clip }}
            >
              <p className="mx-auto max-w-[85%] text-center font-display text-[13px] font-semibold leading-[1.2]">
                {tr(piece.question)}
              </p>
              <div className="mt-3 h-[calc(100%-50px)]">
                <FlatReflectionTextarea
                  fieldKey={piece.key}
                  rows={8}
                  minHeight={210}
                  textClass="text-[15px]"
                  onSaveStateChange={onSaveStateChange}
                />
              </div>
            </div>
          </div>
        ))}

        <WorkbookLogo />
      </div>
    </div>
  );
}

// ----- S31 (PDF p37): Unelmien tiekartta opinnoissa -----
// FIX: h1 và mảng qs giờ qua tr()
function S31({ onSaveStateChange }: Props) {
  const tr = useTr();
  const qs = [
    "Keneltä saan tukea ja opastusta?",
    "Mitä vahvuuksiani voin hyödyntää?",
    "Mitä minun kannattaisi vielä oppia?",
    "Mitä jo osaan hyvin?",
    "Unelmieni ammatti",
  ];
  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-[1280px] overflow-x-hidden overflow-y-auto px-[6%] pb-14 pt-8 text-white space-y-6">
      <StickyNote tone="coral" seed="s31-h">
        <h1 className="font-display text-[clamp(28px,2.6vw,42px)] font-semibold leading-[1.15] tracking-[-0.02em]">
          {tr("Unelmien tiekartta opinnoissa")}
        </h1>
      </StickyNote>
      <div className="grid gap-5">
        {qs.map((q, i) => (
          <ReflectionTextarea
            key={i}
            fieldKey={`screen_31_tiekartta_${i + 1}`}
            label={`${i + 1}. ${tr(q)}`}
            rows={2}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// ----- S32 (PDF p38): Minä opiskelijana -----
function S32({ onSaveStateChange }: Props) {
  const tr = useTr();
  const qs = [
    "Mikä saa sinut innostumaan opinnoissa?",
    "Minkä tekemiseen uppoudut?",
    "Minkä parissa jaksat olla sinnikäs ja ylittää esteitä?",
    "Mistä olet saanut kannustavaa palautetta opettajilta tai opiskelutovereilta?",
    "Mistä olet erityisen kiinnostunut opinnoissa?",
    "Mitä vahvuuksia tavallisesti hyödynnät opintojen aikana?",
  ];
  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-[1280px] overflow-x-hidden overflow-y-auto px-[6%] pb-14 pt-8 text-white space-y-6">
      <StickyNote tone="yellow" seed="s32-h">
        <h1 className="font-display text-[clamp(28px,2.6vw,42px)] font-semibold leading-[1.15] tracking-[-0.02em] mb-1">
          {tr(
            "Minä opiskelijana – Listaa seuraavalle sivulle kaikki vahvuutesi opiskelijana – myös sellaiset, jotka voivat tuntua sinusta itsestäänselvyyksiltä.",
          )}
        </h1>
        <p className="text-[clamp(16px,1.2vw,19px)] font-normal leading-[1.55] opacity-95">
          {tr(
            "Listaa seuraavalle sivulle aivan kaikki vahvuutesi opiskelijana, myös sellaiset, jotka saattavat tuntua sinulle itsestään selvyydeltä. Oletko hyvä kielissä, keksitkö luovia ratkaisuja ongelmiin, autatko mielelläsi toisia, keksitkö parhaat vitsit, kiitätkö toisia, oletko ryhmähengen luoja?",
          )}
        </p>
        <p className="text-[clamp(16px,1.2vw,19px)] font-normal leading-[1.55] opacity-95 mt-2">
          {tr(
            "Pohdi ensin seuraavia kysymyksiä ja selvitä, mitä oikeasti rakastat tehdä ja missä olet erityisen hyvä. Mieti, millä uudella tavalla voit hyödyntää vahvuuksiasi lukiossa.",
          )}
        </p>
      </StickyNote>
      <div className="grid gap-5">
        {qs.map((q, i) => (
          <ReflectionTextarea
            key={i}
            fieldKey={`screen_32_minaopisk_${i + 1}`}
            label={tr(q)}
            rows={2}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// ----- S33 (PDF p39): Listaa erityistaidot — 10 slots -----
// FIX: placeholder giờ qua tr()
function S33({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-[1280px] overflow-x-hidden overflow-y-auto px-[6%] pb-14 pt-8 text-white space-y-6">
      <StickyNote tone="mint" seed="s33-h">
        {tr("Täytä kaikki erityisosaamisesi tähän listaan. (Täytettävät kohdat 1–10)")}
      </StickyNote>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <ReflectionInput
            key={i}
            fieldKey={`screen_33_erityistaito_${i + 1}`}
            prefix={`${i + 1}.`}
            placeholder={tr("Erityistaito…")}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// ----- S34 (PDF p40): Koulu-kokemuksia -----
function S34({ onSaveStateChange }: Props) {
  const tr = useTr();
  const qs: Array<{ k: string; q: string }> = [
    { k: "screen_34_oppi", q: "Minkälaisia asioita opit nopeasti ja helposti?" },
    {
      k: "screen_34_palaute",
      q: "Mistä sait rohkaisevaa palautetta peruskoulussa opettajilta entä luokkakavereilta?",
    },
    { k: "screen_34_aiheet", q: "Mistä tykkäsit koulussa ala-asteella, entä yläasteella?" },
    {
      k: "screen_34_onnistuminen",
      q: "Mikä onnistuminen sinulle on jäänyt mieleen peruskoulusta?",
    },
  ];
  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-[1280px] overflow-x-hidden overflow-y-auto px-[6%] pb-14 pt-8 text-white space-y-6">
      <StickyNote tone="coral" seed="s34-h">
        <h1 className="font-display text-[clamp(28px,2.6vw,42px)] font-semibold leading-[1.15] tracking-[-0.02em] mb-1">
          {tr(
            "Koulumuistot – Katso taaksepäin omia aiempia opiskelukokemuksiasi ja huomaa, mitä vahvuuksia sinulla on.",
          )}
        </h1>
        <p className="text-[clamp(16px,1.2vw,19px)] font-normal leading-[1.55] opacity-95">
          {tr(
            "Tarkastele omia aiempia kokemuksiasi opinnoissa ja huomaa, millaisia vahvuuksia sinulla on.",
          )}
        </p>
      </StickyNote>
      <div className="grid gap-5 md:grid-cols-2">
        {qs.map((x) => (
          <ReflectionTextarea
            key={x.k}
            fieldKey={x.k}
            label={tr(x.q)}
            rows={3}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// ----- S35 (PDF p41): Tavoitteeni opiskelijana 1/2 — informational -----
// FIX: đoạn <p>, danh sách <ol><li>, và dòng chú thích cuối giờ qua tr()
function S35() {
  const tr = useTr();
  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-[1280px] overflow-x-hidden overflow-y-auto px-[6%] pb-14 pt-8 text-white space-y-6">
      <StickyNote tone="yellow" seed="s35-h">
        {tr(
          "Tavoitteeni opiskelijana 1/2 – Tässä tehtävässä selkiytät tavoitteesi opiskelijana – tavoitteen, jonka haluat saavuttaa.",
        )}
      </StickyNote>
      <StickyNote tone="white" seed="s35-b">
        <p className="text-[clamp(16px,1.2vw,19px)] font-normal leading-[1.6] mb-2">
          {tr(
            "Tässä tehtävässä pääset kirkastamaan tavoitteesi opiskelijana, ne joita haluaisit saavuttaa. Pääset lisäksi pohtimaan, mitä kaikkea tämä tulee vaatimaan. Pohdi ja täydennä, mitä vahvuuksia sinulla jo on, joita aiot hyödyntää tavoitteen saavuttamisessa.",
          )}
        </p>
        <p className="text-sm font-medium">
          {tr("Mikä on sinulle se iso tavoite, jonka haluat elämässäsi saavuttaa?")}
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm mt-2">
          <li>{tr("Kirjoita tavoitteesi jäävuoren pinnan päällä näkyvään osaan.")}</li>
          <li>
            {tr(
              "Pohdi ja kirjaa jäävuoren pinnan alapuolelle kaikki vahvuudet, joiden käyttäminen ja kehittäminen tukee tavoitteen saavuttamista.",
            )}
          </li>
          <li>
            {tr(
              "Pohdi ja konkretisoi, miten voit hyödyntää kyseisiä vahvuuksia tavoitteen saavuttamisessa.",
            )}
          </li>
          <li>
            {tr(
              "Kirjoita myös, mitä muita taitoja tulet tarvitsemaan ja kehittämään tavoitteen saavuttamisessa.",
            )}
          </li>
        </ol>
        <p className="text-xs italic opacity-70 mt-2">{tr("→ Jäävuori seuraavalla sivulla.")}</p>
      </StickyNote>
    </div>
  );
}

// ----- S36 (PDF p42): Tavoitteeni opiskelijana 2/2 — iceberg quadrants -----
// FIX: h1 và dòng chú thích cuối giờ qua tr()
function S36({ onSaveStateChange }: Props) {
  const tr = useTr();
  const boxes: Array<{ k: string; label: string }> = [
    { k: "screen_36_tavoite", label: "1. Tavoitteeni ja miksi se on minulle tärkeä" },
    { k: "screen_36_vahvuudet", label: "2. Vaaditut vahvuudet" },
    { k: "screen_36_hyodynnan", label: "3. Miten hyödynnän vahvuuksia" },
    { k: "screen_36_taidot", label: "4. Mitä muita taitoja tarvitsen" },
  ];
  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-[1280px] overflow-x-hidden overflow-y-auto px-[6%] pb-14 pt-8 text-white space-y-6">
      <StickyNote tone="mint" seed="s36-h">
        <h1 className="font-display text-[clamp(28px,2.6vw,42px)] font-semibold leading-[1.15] tracking-[-0.02em]">
          {tr("Tavoitteeni opiskelijana 2/2")}
        </h1>
      </StickyNote>
      <div className="grid gap-5 md:grid-cols-2">
        {boxes.map((b) => (
          <StickyNote key={b.k} tone="white" seed={b.k}>
            <ReflectionTextarea
              fieldKey={b.k}
              label={tr(b.label)}
              rows={4}
              onSaveStateChange={onSaveStateChange}
            />
          </StickyNote>
        ))}
      </div>
      <p className="text-center text-xs opacity-60">
        {tr(
          "Visuaalinen jäävuori on tilapäisesti korvattu nelikenttänä, kunnes alkuperäinen kuva saadaan käyttöön.",
        )}
      </p>
    </div>
  );
}

// ----- S37 (PDF p43): Vahvuuteni opiskelijana — 3 columns -----
// FIX: 3 label của ReflectionTextarea giờ qua tr()
function S37({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-[1280px] overflow-x-hidden overflow-y-auto px-[6%] pb-14 pt-8 text-white space-y-6">
      <StickyNote tone="coral" seed="s37-h">
        <h1 className="font-display text-[clamp(28px,2.6vw,42px)] font-semibold leading-[1.15] tracking-[-0.02em] mb-1">
          {tr(
            "Vahvuuteni opiskelijana – Tunnista vahvuutesi. Arvosta ja ole ylpeä vahvuuksistasi. Kirjoita parhaat puolesi opiskelijana!",
          )}
        </h1>
        <p className="text-[clamp(16px,1.2vw,19px)] font-normal leading-[1.55] opacity-95">
          {tr(
            "Tunnista omia vahvuuksiasi. Arvosta ja ole ylpeä omista vahvuuksistasi. Kirjoita itsellesi muistiin omia parhaita puoliasi opiskelijana!",
          )}
        </p>
      </StickyNote>
      <div className="grid gap-5 lg:grid-cols-3">
        <ReflectionTextarea
          fieldKey="screen_37_arvostan"
          label={tr("Mukavia asioita — Arvostan itsessäni")}
          rows={5}
          onSaveStateChange={onSaveStateChange}
        />
        <ReflectionTextarea
          fieldKey="screen_37_vahvuuksiani"
          label={tr("Omia vahvuuksia — Vahvuuksiani ovat mielestäni")}
          rows={5}
          onSaveStateChange={onSaveStateChange}
        />
        <ReflectionTextarea
          fieldKey="screen_37_paikkoja"
          label={tr("Paikkoja — Näissä paikoissa viihdyn ja pääsen käyttämään vahvuuksiani")}
          rows={5}
          onSaveStateChange={onSaveStateChange}
        />
      </div>
    </div>
  );
}

// ----- S38 (PDF p44): Vahvuuspalaute opiskelukavereilta -----
// FIX: label "Mitä hyvää vahvuuteni tuovat yhteisööni?" giờ qua tr() (thiếu, không đồng bộ với 3 label kia)
function S38({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-[1280px] overflow-x-hidden overflow-y-auto px-[6%] pb-14 pt-8 text-white space-y-6">
      <StickyNote tone="yellow" seed="s38-h">
        <h1 className="font-display text-[clamp(28px,2.6vw,42px)] font-semibold leading-[1.15] tracking-[-0.02em] mb-1">
          {tr(
            "Vahvuuspalaute opiskelukavereilla – Kirjoita palautetta ja kehuja ryhmässä 2–4 opiskelukaverin kanssa. Nimeä vahvuuksia, joita arvostat toisissanne.",
          )}
        </h1>
        <p className="text-[clamp(16px,1.2vw,19px)] font-normal leading-[1.55] opacity-95">
          {tr(
            "Kirjoita palautetta ja kehuja ryhmässä 2–4 opiskelukaverin kanssa. Käytä sivua 10 pohjana. Nimetkää ne vahvuudet, joita toisissanne arvostatte. Kertokaa myös, missä vahvuudet näkyvät ja miten ne vaikuttavat kanssaihmisiin.",
          )}
        </p>
      </StickyNote>
      <div className="grid gap-5 md:grid-cols-2">
        <ReflectionTextarea
          fieldKey="screen_38_uutta"
          label={tr("Mitä uutta opin palautteista?")}
          rows={3}
          onSaveStateChange={onSaveStateChange}
        />
        <ReflectionTextarea
          fieldKey="screen_38_tarkeaa"
          label={tr("Mikä palautteessa on minulle tärkeää?")}
          rows={3}
          onSaveStateChange={onSaveStateChange}
        />
        <ReflectionTextarea
          fieldKey="screen_38_muistetaan"
          label={tr("Millaisista asioista minut muistetaan / tunnistetaan parhaiten?")}
          rows={3}
          onSaveStateChange={onSaveStateChange}
        />
        <ReflectionTextarea
          fieldKey="screen_38_yhteisoon"
          label={tr("Mitä hyvää vahvuuteni tuovat yhteisööni?")}
          rows={3}
          onSaveStateChange={onSaveStateChange}
        />
      </div>
    </div>
  );
}

// ----- S39 (PDF p45): Minä olen (M2) -----
function S39({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-[1280px] overflow-x-hidden overflow-y-auto px-[6%] pb-14 pt-8 text-white space-y-6">
      <StickyNote tone="mint" seed="s39-h">
        <h1 className="font-display text-[clamp(28px,2.6vw,42px)] font-semibold leading-[1.15] tracking-[-0.02em] mb-1">
          {tr("Minä olen")}
        </h1>
        <p className="text-[clamp(16px,1.2vw,19px)] font-normal leading-[1.55] opacity-95">
          {tr("Muuta muilta saamasi palaute lauseiksi minä muotoon:")}
          <span className="font-semibold"> {tr('"Olet sinnikäs" → "Minä olen sinnikäs."')}</span>
        </p>
      </StickyNote>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <ReflectionInput
            key={i}
            fieldKey={`screen_39_mina_olen_${i + 1}`}
            prefix={tr("Minä olen")}
            placeholder="…"
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// ----- S40 (PDF p46): Moduuli 3 title card -----
// FIX: trước đây component này KHÔNG có tr() nào. Nay bọc "Moduuli 3" và h1.
function M3Intro() {
  const tr = useTr();
  return (
    <StickyNote tone="mint" seed="s40-h" className="text-center">
      <div className="text-sm font-medium uppercase tracking-[0.12em] opacity-80 mb-2">
        {tr("Moduuli 3")}
      </div>
      <h1 className="font-display text-[clamp(40px,4.5vw,68px)] font-medium leading-[1.1] tracking-[-0.025em]">
        {tr("3. Omat vahvuudet kotona")}
      </h1>
    </StickyNote>
  );
}
// ----- S41 (PDF p47): Vahvuuskarkkini kotona -----
function S41(p: Props) {
  return (
    <VahvuuskarkkiSheet
      title="Vahvuuskarkkini"
      context="kotona"
      fieldPrefix="screen_41"
      onSaveStateChange={p.onSaveStateChange}
    />
  );
}

// Note: S41 worksheet stores under screen_41_* but REQUIREMENTS is keyed off
// screen_42_*. The actual mapping below uses S42 for kotona-karkkini to keep
// REQUIREMENTS keys aligned with the screen number. The dual numbering above
// happened because PDF "Vahvuudet perheessä" is on the next page (p48 → S42).
// The registry below assigns S41 = M3 title, S42 = kotona-karkkini, etc.

// ----- S42 (PDF p48): Vahvuudet perheessä -----
function S42_perhe({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s42-h">
        <h1 className="font-display text-2xl mb-1">{tr("Vahvuudet perheessä")}</h1>
        <p className="text-sm opacity-90">{tr("Täydennä laput.")}</p>
      </StickyNote>
      <div className="grid gap-3 sm:grid-cols-2">
        <ReflectionTextarea
          fieldKey="screen_43_vahvuudet"
          label={tr("Minkälaisia vahvuuksia sinulla on perheenjäsenenä? Miten ne näkyvät?")}
          rows={4}
          onSaveStateChange={onSaveStateChange}
        />
        <ReflectionTextarea
          fieldKey="screen_43_parasta"
          label={tr("Mikä on parasta perheessäsi? Miten erilaiset vahvuudet näkyvät perheessänne?")}
          rows={4}
          onSaveStateChange={onSaveStateChange}
        />
        <ReflectionTextarea
          fieldKey="screen_43_kiitollinen"
          label={tr("Mistä olet kiitollinen perheessäsi?")}
          rows={4}
          onSaveStateChange={onSaveStateChange}
        />
        <ReflectionTextarea
          fieldKey="screen_43_yhdessa"
          label={tr("Mitä tykkäätte tehdä yhdessä?")}
          rows={4}
          onSaveStateChange={onSaveStateChange}
        />
      </div>
    </div>
  );
}

// ----- S43 (PDF p49): Minä perheenjäsenenä -----
function S43_perheenjasen({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s43-h">
        <h1 className="font-display text-2xl">{tr("Minä perheenjäsenenä")}</h1>
      </StickyNote>
      <ReflectionTextarea
        fieldKey="screen_44_perheenjasenena"
        label={tr(
          "Kirjoita itsellesi muistiin, millainen olet perheenjäsenenä ja millaisia vahvuuksia tuot perheeseesi.",
        )}
        rows={8}
        onSaveStateChange={onSaveStateChange}
      />
      <p className="text-center text-xs opacity-60">
        {tr(
          "Alkuperäisen sivun kahta saraketta ei ollut mahdollista poimia PDF:stä; kenttä on tilapäisesti yhtenä laajana tekstialueena.",
        )}
      </p>
    </div>
  );
}

// ----- S44 (PDF p50): Muistele ja kysy vanhemmilta -----
function S44_kysy({ onSaveStateChange }: Props) {
  const tr = useTr();
  const qs = [
    "Millainen lapsi olin?",
    "Mitkä olivat lempileikkejäni?",
    "Mistä innostuin?",
    "Missä olin lapsena hyvä?",
    "Mistä sain kannustusta ja kehuja?",
    "Mitä vahvuuksia minussa huomattiin jo lapsena?",
    "Mitä toivoit minusta tulevan?",
    "Mitä haluat vielä sanoa minulle vahvuuksistani?",
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="mint" seed="s44-h">
        <h1 className="font-display text-2xl mb-1">{tr("Muistele ja kysy vanhemmilta")}</h1>
        <p className="text-sm opacity-90">
          {tr("Pyydä vanhempaasi muistelemaan ja kerro lapsuusaikaisista vahvuuksistasi.")}
        </p>
      </StickyNote>
      <div className="grid gap-3">
        {qs.map((q, i) => (
          <ReflectionTextarea
            key={i}
            fieldKey={`screen_45_vanhemmat_${i + 1}`}
            label={tr(q)}
            rows={2}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
      <p className="text-center text-xs opacity-60">
        {tr(
          "Kysymykset ovat osittain rekonstruoitu PDF-sivun rakenteesta — alkuperäinen sivu on käsinkirjoitusta varten varattu, ja muutamat kysymyssanat eivät olleet poimittavissa OCR:llä.",
        )}
      </p>
    </div>
  );
}

// ----- S45 (PDF p51): Vahvuuskirje vanhemmalta — informational -----
function S45_kirje() {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s45-h">
        <h1 className="font-display text-2xl mb-1">{tr("Pyydä vanhempaasi täydentämään!")}</h1>
        <p className="text-sm opacity-90">
          {tr(
            "Tämä sivu on vahvuuskirjeen pohja, jonka vanhempi voi täydentää nuorelleen. Voitte tulostaa sen tai kirjoittaa puhtaaksi yhdessä.",
          )}
        </p>
      </StickyNote>
      <StickyNote tone="white" seed="s45-letter">
        <h2 className="font-display text-lg mb-2">{tr("Kirjoita vahvuuskirje nuorellesi")}</h2>
        <p className="text-sm leading-relaxed whitespace-pre-line">
          {tr(`Hän kun . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

Sinun vahvuuksiasi ovat . . . . . . . . , . . . . . . . . ja . . . . . . . .

Olen huomannut, että käytät niitä, kun . . . . . . . . . . ja . . . . . . . . .

Arvostan sinussa erityisesti . . . . . . . . . . . . . . . . . ja . . . . . . . . . . .

Kun käytät vahvuuksiasi kotona, se vaikuttaa . . . . . . . . . . . . . . . . . . . .

Olet opettanut minulle erityisesti . . . . . . . . . . . . . . . . käytöstä.

Kun käytät vahvuuksiasi, näen sinut tulevaisuudessa . . . . . . . . . . . . . . . .

Anna vahvuuksiesi loistaa.

Rakkain terveisin, . . . . . . . . . .`)}
        </p>
      </StickyNote>
      <p className="text-center text-xs opacity-60">
        {tr("Sivun visuaalinen ilme on tilapäisesti korvattu yksinkertaisella tekstipohjalla.")}
      </p>
    </div>
  );
}

// ----- S46 (PDF p52): Moduuli 4 title card -----
function M4Intro() {
  const tr = useTr();
  return (
    <StickyNote tone="coral" seed="s46-h" className="text-center">
      <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
        {tr("Taso 4")}
      </div>
      <h1 className="font-display text-4xl leading-tight">
        {tr("4. Omat vahvuudet vapaa-ajalla ja harrastuksissa")}
      </h1>
    </StickyNote>
  );
}

// ----- S47 (PDF p53): Vahvuuskarkkini vapaa-ajalla -----
function S47(p: Props) {
  return (
    <VahvuuskarkkiSheet
      title="Vahvuuskarkkini"
      context="vapaa-ajalla"
      fieldPrefix="screen_48"
      onSaveStateChange={p.onSaveStateChange}
    />
  );
}

// ----- S48 (PDF p54): Minä vapaa-ajalla -----
function S48_vapaa({ onSaveStateChange }: Props) {
  const tr = useTr();
  const cols = [
    { k: "screen_49_tykkaat", q: "Mitä tykkäät tehdä vapaa-ajalla?" },
    { k: "screen_49_harrastukset", q: "Mitä harrastuksia sinulla on?" },
    {
      k: "screen_49_vahvuudet",
      q: "Mitä vahvuuksia tunnistat itsessäsi vapaa-ajalla ja harrastuksissa?",
    },
    { k: "screen_49_enemman", q: "Mitä vahvuuksiasi haluaisit hyödyntää enemmän vapaa-ajallasi?" },
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s48-h">
        <h1 className="font-display text-2xl mb-1">{tr("Minä vapaa-ajalla")}</h1>
        <p className="text-sm opacity-90">
          {tr(
            "Kirjoita itsellesi muistiin mitä teet vapaa-ajallasi ja millaisia vahvuuksia hyödynnät.",
          )}
        </p>
      </StickyNote>
      <div className="grid gap-3 sm:grid-cols-2">
        {cols.map((c) => (
          <ReflectionTextarea
            key={c.k}
            fieldKey={c.k}
            label={tr(c.q)}
            rows={4}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// ----- S49 (PDF p55): Love to-do -lista 1/3 — informational -----
// FIX: h1 "Love to-do -lista 1/3" giờ qua tr()
function S49_loveinfo() {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="mint" seed="s49-h">
        <h1 className="font-display text-2xl">{tr("Love to-do -lista 1/3")}</h1>
      </StickyNote>
      <StickyNote tone="white" seed="s49-b">
        <p className="text-sm leading-relaxed mb-2">
          {tr(
            "Mitkä asiat päätyvät sinun love-to-do listalle? Tee lista viidestä asiasta, joita rakastat tehdä vapaa-ajalla.",
          )}
        </p>
        <p className="text-sm leading-relaxed">
          {tr("Mieti seuraavaksi, kuinka vahvuutesi liittyvät näihin tekemisiin.")}
        </p>
        <p className="text-xs italic opacity-70 mt-2">
          {tr(
            "Ps. Todennäköisesti harrastukset ja tekemiset, joista pidät eniten, ovat myös tyydyttäviä, koska ne tarjoavat sinulle mahdollisuuden hyödyntää vahvuuksiasi.",
          )}
        </p>
        <p className="text-xs italic opacity-70 mt-2">
          {tr("→ Love to-do -lista seuraavalla sivulla.")}
        </p>
      </StickyNote>
    </div>
  );
}

// ----- S50 (PDF p56): Love to-do -lista 2/3 — 5 inputs -----
// FIX: h1 "Love to-do -lista" giờ qua tr()
function S50_love({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s50-h">
        <h1 className="font-display text-2xl mb-1">{tr("Love to-do -lista")}</h1>
        <p className="text-sm opacity-90">
          {tr(
            "Kirjoita viisi asiaa, joita rakastat tehdä vapaa-ajallasi. Merkkaa sydämiin miten paljon teet kyseistä asiaa.",
          )}
        </p>
      </StickyNote>
      <div className="grid gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ReflectionInput
            key={i}
            fieldKey={`screen_51_love_${i + 1}`}
            prefix={`${i + 1}.`}
            placeholder={tr("Asia, jota rakastan tehdä…")}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// ----- S51 (PDF p57): Love to-do -lista 3/3 -----
// FIX: h1 "Love to-do -lista" giờ qua tr()
function S51_loveB({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="mint" seed="s51-h">
        <h1 className="font-display text-2xl">{tr("Love to-do -lista")}</h1>
      </StickyNote>
      <ReflectionTextarea
        fieldKey="screen_52_konkreettisesti"
        label={tr(
          "Kuvittele, että voisit tehdä eniten rakastamaasi asiaa enemmän — miltä se konkreettisesti tuntuisi? Mihin haluaisit käyttää enemmän aikaa?",
        )}
        rows={5}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_52_vahvuudet"
        label={tr(
          "Kirjoita mitä vahvuuksiasi hyödynnät tehdessäsi rakastamiasi asioita vapaa-ajalla!",
        )}
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
    </div>
  );
}

// ----- S52 (PDF p58): Kuvakollaasi 1/2 — informational -----
// FIX: h1 "Kuvakollaasi 1/2" giờ qua tr()
function S52_kollaasiInfo() {
  const tr = useTr();
  const bullets = [
    "Kerää kollaasi asioista / tavaroista, jotka ovat sinulle tärkeitä, joista olet kiinnostunut ja joissa voit hyödyntää vahvuuksiasi. Esimerkiksi koripallo, kirja, tietokone ja kissa.",
    "Teenäistä kollaasi ja ota siitä kuva.",
    "Esitelkää kuvat ryhmässä. Tutustukaa toistenne vahvuuksiin.",
    "Mitkä tavarat tai tekemiset valitsit kuvaasi? Miksi?",
    "Kirjoita, mitä vahvuuksiasi kiinnostuksen kohteesi ovat kehittäneet? Miten?",
    "Mitä uusia taitoja olet oppinut kiinnostuksen kohteiden parissa?",
    "Käykää ystävän kanssa syvempi keskustelu vahvuuksien ja kiinnostuksen kohteiden välisestä yhteydestä vapaa-ajalla.",
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s52-h">
        <h1 className="font-display text-2xl mb-1">{tr("Kuvakollaasi 1/2")}</h1>
        <p className="text-sm font-medium">
          {tr("Mitkä asiat sinua kiinnostavat vapaa-ajalla? Miksi?")}
        </p>
      </StickyNote>
      <StickyNote tone="white" seed="s52-b">
        <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
          {bullets.map((b) => (
            <li key={b}>{tr(b)}</li>
          ))}
        </ul>
      </StickyNote>
    </div>
  );
}

// ----- S53 (PDF p59): Kuvakollaasi 2/2 -----
// FIX: h1 "Kuvakollaasi 2/2" giờ qua tr()
function S53_kollaasi({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s53-h">
        <h1 className="font-display text-2xl mb-1">{tr("Kuvakollaasi 2/2")}</h1>
        <p className="text-sm opacity-90">
          {tr("Jutelkaa ystävien kanssa vahvuuksistanne ja kiinnostuksen kohteistanne!")}
        </p>
      </StickyNote>
      <ReflectionTextarea
        fieldKey="screen_54_valitsin"
        label={tr("Mitä valitsin")}
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_54_kehittaneet"
        label={tr("Mitä vahvuuksia kiinnostuksen kohteeni ovat kehittäneet?")}
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_54_uudet"
        label={tr("Mitä uusia taitoja olet oppinut kiinnostuksen kohteiden parissa?")}
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
    </div>
  );
}

// ----- S54 (PDF p60): Moduuli 5 title card -----
function M5Intro() {
  const tr = useTr();
  return (
    <StickyNote tone="coral" seed="s54-h" className="text-center">
      <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
        {tr("Taso 5")}
      </div>
      <h1 className="font-display text-4xl leading-tight">
        {tr("5. Omat vahvuudet ystävyyssuhteissa")}
      </h1>
    </StickyNote>
  );
}

// ----- S55 (PDF p61): Vahvuuskarkkini ystävyyssuhteissa -----
function S55(p: Props) {
  return (
    <VahvuuskarkkiSheet
      title="Vahvuuskarkkini"
      context="ystävyyssuhteissa"
      fieldPrefix="screen_56"
      onSaveStateChange={p.onSaveStateChange}
    />
  );
}

// ----- S56 (PDF p62): Minä ystävänä -----
// FIX: h1 "Minä ystävänä" giờ qua tr()
function S56_ystava({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="mint" seed="s56-h">
        <h1 className="font-display text-2xl mb-1">{tr("Minä ystävänä")}</h1>
        <p className="text-sm opacity-90">
          {tr(
            "Haastattele ystäviäsi. Pyydä heitä kertomaan tai lähettämään viesti. Täydennä lauseet:",
          )}
        </p>
      </StickyNote>
      <ReflectionTextarea
        fieldKey="screen_57_ystavien"
        label={tr("Ystävieni mielestä vahvuuksiani ovat")}
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_57_parasta"
        label={tr("Parasta ystävissäni on")}
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
    </div>
  );
}

// ----- S57 (PDF p63): Vahvuuspalaute ystäviltä -----
// FIX: h1 "Vahvuuspalaute ystäviltä" giờ qua tr()
function S57_palaute({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s57-h">
        <h1 className="font-display text-2xl mb-1">{tr("Vahvuuspalaute ystäviltä")}</h1>
        <p className="text-sm opacity-90">
          {tr(
            "Kirjoita palautetta ja kehuja ystäviesi kesken. Kerätkää yhdessä 2–4 ystävältä palautetta vahvuuksistanne. Käytä sivua 11 pohjana. Nimetkää ne vahvuudet, joita toisissanne arvostatte. Kertokaa myös, missä toisen vahvuudet erityisesti näkyvät ja miten positiivisesti ne vaikuttavat ystävyyssuhteissa.",
          )}
        </p>
      </StickyNote>
      <div className="grid gap-3 sm:grid-cols-2">
        <ReflectionTextarea
          fieldKey="screen_58_uutta"
          label={tr("Mitä uutta opin palautteista?")}
          rows={3}
          onSaveStateChange={onSaveStateChange}
        />
        <ReflectionTextarea
          fieldKey="screen_58_tarkeaa"
          label={tr("Mikä palautteessa on minulle tärkeää?")}
          rows={3}
          onSaveStateChange={onSaveStateChange}
        />
        <ReflectionTextarea
          fieldKey="screen_58_muistavat"
          label={tr("Millaisista asioista ystäväni muistavat minut parhaiten?")}
          rows={3}
          onSaveStateChange={onSaveStateChange}
        />
        <ReflectionTextarea
          fieldKey="screen_58_parasta"
          label={tr("Mikä on parasta ystävissäni?")}
          rows={3}
          onSaveStateChange={onSaveStateChange}
        />
      </div>
    </div>
  );
}

// ----- S58 (PDF p64): Moduuli 6 title card -----
function M6Intro() {
  const tr = useTr();
  return (
    <StickyNote tone="yellow" seed="s58-h" className="text-center">
      <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
        {tr("Taso 6")}
      </div>
      <h1 className="font-display text-4xl leading-tight">
        {tr("6. Vahvuusportfolion kokoaminen")}
      </h1>
    </StickyNote>
  );
}

// ----- S59 (PDF p65): Vahvuuksien yhteenveto -----
// FIX: h1 "Vahvuuksien yhteenveto" giờ qua tr()
function S59_yhteenveto({ onSaveStateChange }: Props) {
  const tr = useTr();
  const cols = [
    { k: "screen_60_koulusta", label: "Koulusta" },
    { k: "screen_60_perheelta", label: "Perheeltä" },
    { k: "screen_60_vapaa_ajalta", label: "Vapaa-ajalta" },
    { k: "screen_60_ystavilta", label: "Ystäviltä" },
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s59-h">
        <h1 className="font-display text-2xl mb-1">{tr("Vahvuuksien yhteenveto")}</h1>
        <p className="text-sm opacity-90">
          {tr(
            "Kokoa saamasi palautteet. Kirjoita ylös vahvuudet joita sinussa on huomattu eri ympäristöissä.",
          )}
        </p>
      </StickyNote>
      <div className="grid gap-3 sm:grid-cols-2">
        {cols.map((c) => (
          <ReflectionTextarea
            key={c.k}
            fieldKey={c.k}
            label={tr(c.label)}
            rows={5}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// ----- S60 (PDF p66): Pohdi ja hyödynnä saamaasi palautetta -----
// FIX: h1 giờ qua tr()
function S60_pohdi({ onSaveStateChange }: Props) {
  const tr = useTr();
  const qs = [
    { k: "screen_61_samaa", q: "Mitä samaa niissä on?" },
    { k: "screen_61_eroavat", q: "Miten ne eroavat?" },
    { k: "screen_61_huomataan", q: "Mitä vahvuuksia sinussa huomataan?" },
    { k: "screen_61_yllatti", q: "Mikä palautteissa yllätti?" },
    { k: "screen_61_muistaa", q: "Mitä haluat muistaa palautteista?" },
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="mint" seed="s60-h">
        <h1 className="font-display text-2xl mb-1">
          {tr("Pohdi ja hyödynnä saamaasi palautetta")}
        </h1>
        <p className="text-sm opacity-90">{tr("Tutustu muilta saamiisi palautteisiin.")}</p>
      </StickyNote>
      <div className="grid gap-3">
        {qs.map((x) => (
          <ReflectionTextarea
            key={x.k}
            fieldKey={x.k}
            label={tr(x.q)}
            rows={3}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// ----- S61 (PDF p67): Visioni ja tavoitteeni -----
// FIX: h1 "Visioni ja tavoitteeni" giờ qua tr()
function S61_visio({ onSaveStateChange }: Props) {
  const tr = useTr();
  const qs = [
    "Millainen ihminen haluat olla?",
    "Mitä vahvuuksia ja taitoja haluaisit kehittää itsessäsi ja miksi?",
    "Onko sinulla joku esikuva, jolla on näitä ominaisuuksia? Kuka ja mitä?",
    "Miten voit kompensoida omia heikkouksiasi vahvuuksiesi avulla?",
    "Mitä toivoisit, että ystäväsi ja perheesi kertoisivat sinusta, kun et ole paikalla? Millaisena haluat tulla muistetuksi?",
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s61-h">
        <h1 className="font-display text-2xl mb-1">{tr("Visioni ja tavoitteeni")}</h1>
        <p className="text-sm opacity-90">{tr("Pohdi lopuksi:")}</p>
      </StickyNote>
      <div className="grid gap-3">
        {qs.map((q, i) => (
          <ReflectionTextarea
            key={i}
            fieldKey={`screen_62_visioni_${i + 1}`}
            label={tr(q)}
            rows={3}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// ----- S62 (PDF p68): Kerro vahvuuksistasi videon tai esityksen avulla -----
function S62_video({ onSaveStateChange }: Props) {
  const tr = useTr();
  const qs = [
    "Mitkä ovat ydinvahvuuksiasi? Mitä rakastat tehdä? Milloin olet aidoimmillasi? Mistä saat energiaa? Mitkä vahvuuksia voisit nostaa esiin videolla entä työhaastattelussa?",
    "Missä ammateissa tai työtehtävissä vahvuutesi pääsisivät oikeuksiinsa?",
    "Miten hyödynnät vahvuuksiasi eri ihmisten kanssa?",
    "Missä ympäristöissä vahvuutesi pääsevät esiin parhaiten?",
    "Mistä saat usein positiivista palautetta toisilta?",
    "Miten käytät vahvuuksiasi ryhmässä? Mihin se vaikuttaa?",
    "Mitä haluat sanoa videolla tai esityksessä? Mitä haluat jättää katsojan mieleen?",
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s62-h">
        <h1 className="font-display text-2xl">
          {tr("Kerro vahvuuksistasi videon tai esityksen avulla")}
        </h1>
      </StickyNote>
      <div className="grid gap-3">
        {qs.map((q, i) => (
          <ReflectionTextarea
            key={i}
            fieldKey={`screen_63_kerro_${i + 1}`}
            label={tr(q)}
            rows={3}
            onSaveStateChange={onSaveStateChange}
          />
        ))}
      </div>
    </div>
  );
}

// ----- S63 (PDF p69): Muistiinpanoja — stems -----
// FIX: h1 "Muistiinpanoja" giờ qua tr()
function S63_notes({ onSaveStateChange }: Props) {
  const tr = useTr();
  const stems = [
    { k: "screen_64_havainnot", q: "Omat havainnot vahvuuksistani…" },
    { k: "screen_64_muistaa", q: "Tämän haluan muistaa ainakin…" },
    { k: "screen_64_tarkeaa", q: "Minulle on tärkeää…" },
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="mint" seed="s63-h">
        <h1 className="font-display text-2xl">{tr("Muistiinpanoja")}</h1>
      </StickyNote>
      {stems.map((s) => (
        <ReflectionTextarea
          key={s.k}
          fieldKey={s.k}
          label={tr(s.q)}
          rows={4}
          onSaveStateChange={onSaveStateChange}
        />
      ))}
    </div>
  );
}

// ----- S64 (PDF p70): Muistiinpanoja — free notes -----
// FIX: h1 "Muistiinpanoja" giờ qua tr()
function S64_notesB({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s64-h">
        <h1 className="font-display text-2xl">{tr("Muistiinpanoja")}</h1>
      </StickyNote>
      <ReflectionTextarea
        fieldKey="screen_65_notes"
        label={tr("Vapaita muistiinpanoja")}
        rows={10}
        onSaveStateChange={onSaveStateChange}
      />
    </div>
  );
}

// ----- S65 (PDF p71): Muistiinpanoja — free notes -----
// FIX: h1 "Muistiinpanoja" giờ qua tr()
function S65_notesC({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s65-h">
        <h1 className="font-display text-2xl">{tr("Muistiinpanoja")}</h1>
      </StickyNote>
      <ReflectionTextarea
        fieldKey="screen_66_notes"
        label={tr("Vapaita muistiinpanoja")}
        rows={10}
        onSaveStateChange={onSaveStateChange}
      />
    </div>
  );
}

// ----- S66 (PDF p72): Anna itsellesi ja toisille palautetta — informational -----
function S66_palauteInfo() {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="mint" seed="s66-h">
        <h1 className="font-display text-2xl mb-1">
          {tr("Anna itsellesi ja toisille palautetta!")}
        </h1>
      </StickyNote>
      <div className="grid gap-3 sm:grid-cols-2">
        <StickyNote tone="white" seed="s66-a">
          <div className="font-display text-sm mb-1">{tr("MITÄ VAHVUUKSIA SINUSSA NÄHTIIN")}</div>
          <p className="text-xs opacity-80">
            {tr(
              "Tämä sivu kannustaa kokoamaan toisilta saadut vahvuushavainnot näkyväksi — esimerkiksi luokassa, perheessä tai ystäväpiirissä.",
            )}
          </p>
        </StickyNote>
        <StickyNote tone="white" seed="s66-b">
          <div className="font-display text-sm mb-1">{tr("SINUN VAHVUUKSIASI")}</div>
          <p className="text-xs opacity-80">
            {tr(
              "Anna itse itsellesi vahvuuspalautetta. Mitä vahvuuksia olet bongannut itsestäsi erityisesti?",
            )}
          </p>
        </StickyNote>
      </div>
      <p className="text-center text-xs opacity-60">
        {tr(
          "Alkuperäisen sivun käsinkirjoitettua ulkoasua ei voitu poimia PDF:stä; sivu on tilapäisesti esitetty kahtena ohjeistuslappuna.",
        )}
      </p>
    </div>
  );
}

// ----- S67 (PDF p73): 5 vinkkiä sinulle — informational -----
// FIX: h1 "5 vinkkiä sinulle" giờ qua tr()
function S67_vinkit() {
  const tr = useTr();
  const tips = [
    "Huomaa hyvä itsessäsi ja ole siitä ylpeä siitä, mitä jo osaat.",
    "Tunnista ja hyödynnä omia vahvuuksiasi.",
    "Kannusta ja kehu toisia.",
    "Ole ystävällinen myös itseäsi kohtaan.",
    "Uskalla näyttää innostuksesi. Se tarttuu!",
  ];
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s67-h">
        <h1 className="font-display text-2xl">{tr("5 vinkkiä sinulle")}</h1>
      </StickyNote>
      <ol className="grid gap-2">
        {tips.map((t, i) => (
          <StickyNote key={i} tone="white" seed={`s67-${i}`}>
            <div className="flex items-start gap-3">
              <span className="font-display text-2xl text-[color:var(--coral)]">{i + 1}.</span>
              <span className="text-sm leading-relaxed pt-1">{tr(t)}</span>
            </div>
          </StickyNote>
        ))}
      </ol>
    </div>
  );
}

// ----- S68 (PDF p74): Reflektoi tuloksia -----
// FIX: h1 "Reflektoi tuloksia" giờ qua tr()
function S68_reflekto({ onSaveStateChange }: Props) {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="coral" seed="s68-h">
        <h1 className="font-display text-2xl">{tr("Reflektoi tuloksia")}</h1>
      </StickyNote>
      <ReflectionTextarea
        fieldKey="screen_69_kertovat"
        label={tr("Mitä vahvuutesi kertovat sinusta?")}
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_69_kehittamisesta"
        label={tr("Minkä vahvuuksien kehittämisestä olisi sinulle eniten iloa?")}
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_69_tilanteissa"
        label={tr("Missä tilanteissa ja ympäristöissä pääset käyttämään vahvuuksiasi päivittäin?")}
        rows={4}
        onSaveStateChange={onSaveStateChange}
      />
      <ReflectionTextarea
        fieldKey="screen_69_toimia"
        label={tr(
          "Miten sinun kannattaisi toimia, jos haluaisit hyödyntää vahvuuksiasi enemmän — opinnoissa, vapaa-ajalla ja ystävyyssuhteissa?",
        )}
        rows={5}
        onSaveStateChange={onSaveStateChange}
      />
    </div>
  );
}

// ----- S69 (PDF p75): Täydennä vahvuusmittari — finale -----
function S69_finale() {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="yellow" seed="s69-h" className="text-center">
        <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
          {tr("Vahvuusseikkailu päättyy")}
        </div>
        <h1 className="font-display text-3xl leading-tight mb-2">
          {tr("Täydennä vahvuusmittari ja vertaa tuloksia itse valitsemiisi vahvuuskarkkeihin.")}
        </h1>
        <p className="text-sm">{tr("Mitä huomaat?")}</p>
      </StickyNote>
      <StickyNote tone="white" seed="s69-b">
        <p className="text-sm leading-relaxed">
          {tr(
            "Suurin osa meistä ihmisistä pystyy tunnistamaan helposti ainakin osan omista ydinvahvuuksistaan. Tämä on osa itsetuntemusta, joka on yhteydessä hyvinvointiin.",
          )}
        </p>
      </StickyNote>
      <StickyNote tone="coral" seed="s69-end" className="text-center">
        <div className="font-display text-2xl mb-1">{tr("Onneksi olkoon! 🎉")}</div>
        <p className="text-sm">
          {tr(
            "Olet käynyt läpi koko Vahvuusportfolion. Voit aina palata aiempiin sivuihin ja täydentää vastauksiasi — tallennukset säilyvät.",
          )}
        </p>
      </StickyNote>
    </div>
  );
}

// ----- S70: Loppuyhteenveto -----
function S70_end() {
  const tr = useTr();
  return (
    <div className="space-y-4">
      <StickyNote tone="mint" seed="s70-h" className="text-center">
        <h1 className="font-display text-3xl mb-2">{tr("Kiitos seikkailusta! 🌟")}</h1>
        <p className="text-sm leading-relaxed">
          {tr(
            "Vahvuusportfoliosi on nyt koossa. Käytä sitä esimerkiksi kesätyönhaussa, jatko-opintoihin hakeutuessa tai aina kun haluat muistuttaa itseäsi siitä, millainen olet parhaimmillasi.",
          )}
        </p>
      </StickyNote>
    </div>
  );
}

const REGISTRY: Record<number, (p: Props) => ReactNode> = {
  // =========================================================
  // Prologue
  // =========================================================

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

  // =========================================================
  // Newly restored screens 11–13
  // =========================================================

  11: () => <S11KehuJaKannusta />,
  12: () => <S12VahvuuksiaEnemman />,
  13: (p) => <S13HyvatKysymykset {...p} />,

  // =========================================================
  // Module 1
  // Old screens 11–26 are shifted forward by 3
  // =========================================================

  14: () => <M1Intro />,
  15: (p) => <Karkkikauppa {...p} />,
  16: (p) => <S13 {...p} />,
  17: (p) => <S14 {...p} />,
  18: () => <S15 />,
  19: (p) => <S16 {...p} />,
  20: (p) => <S17 {...p} />,
  21: (p) => <S18 {...p} />,
  22: () => <S19 />,
  23: (p) => <S20 {...p} />,
  24: (p) => <S21 {...p} />,
  25: (p) => <S22 {...p} />,
  26: (p) => <S23 {...p} />,
  27: (p) => <S24 {...p} />,
  28: (p) => <S25 {...p} />,
  29: (p) => <S26 {...p} />,

  // =========================================================
  // Module 2
  // =========================================================

  30: () => <M2Intro />,
  31: () => <S28 />,
  32: (p) => <S29 {...p} />,
  33: (p) => <S30 {...p} />,
  34: (p) => <S31 {...p} />,
  35: (p) => <S32 {...p} />,
  36: (p) => <S33 {...p} />,
  37: (p) => <S34 {...p} />,
  38: () => <S35 />,
  39: (p) => <S36 {...p} />,
  40: (p) => <S37 {...p} />,
  41: (p) => <S38 {...p} />,
  42: (p) => <S39 {...p} />,

  // =========================================================
  // Module 3
  // =========================================================

  43: () => <M3Intro />,

  44: (p) => (
    <VahvuuskarkkiSheet
      title="Vahvuuskarkkini"
      context="kotona"
      fieldPrefix="screen_42"
      onSaveStateChange={p.onSaveStateChange}
    />
  ),

  45: (p) => <S42_perhe {...p} />,
  46: (p) => <S43_perheenjasen {...p} />,
  47: (p) => <S44_kysy {...p} />,
  48: () => <S45_kirje />,

  // =========================================================
  // Module 4
  // =========================================================

  49: () => <M4Intro />,
  50: (p) => <S47 {...p} />,
  51: (p) => <S48_vapaa {...p} />,
  52: () => <S49_loveinfo />,
  53: (p) => <S50_love {...p} />,
  54: (p) => <S51_loveB {...p} />,
  55: () => <S52_kollaasiInfo />,
  56: (p) => <S53_kollaasi {...p} />,

  // =========================================================
  // Module 5
  // =========================================================

  57: () => <M5Intro />,
  58: (p) => <S55 {...p} />,
  59: (p) => <S56_ystava {...p} />,
  60: (p) => <S57_palaute {...p} />,

  // =========================================================
  // Module 6
  // =========================================================

  61: () => <M6Intro />,
  62: (p) => <S59_yhteenveto {...p} />,
  63: (p) => <S60_pohdi {...p} />,
  64: (p) => <S61_visio {...p} />,
  65: (p) => <S62_video {...p} />,
  66: (p) => <S63_notes {...p} />,
  67: (p) => <S64_notesB {...p} />,
  68: (p) => <S65_notesC {...p} />,
  69: () => <S66_palauteInfo />,
  70: () => <S67_vinkit />,
  71: (p) => <S68_reflekto {...p} />,
  72: () => <S69_finale />,
  73: () => <S70_end />,
};

export function hasContent(n: number): boolean {
  if (REGISTRY[n]) {
    return true;
  }

  if (n >= METER_FIRST_SCREEN && n <= METER_TOP) {
    return true;
  }

  return false;
}

export function ScreenContent({
  n,
  onSaveStateChange,
}: {
  n: number;
} & Props): ReactNode {
  /*
   * REGISTRY phải được kiểm tra trước.
   *
   * Điều này bảo đảm screen 71–73 vẫn hiển thị nội dung portfolio
   * nếu cấu hình Strength Meter cũ chưa được cập nhật.
   */
  const screenComponent = REGISTRY[n];

  if (screenComponent) {
    return screenComponent({
      onSaveStateChange,
    });
  }

  if (n >= METER_FIRST_SCREEN && n <= METER_TOP) {
    return meterContentFor(n, {
      onSaveStateChange,
    });
  }

  return null;
}
