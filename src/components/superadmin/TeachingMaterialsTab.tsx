/**
 * @lovable-new 2026-08-04
 * Super admin "Teaching Materials" tab — manage the three-level library:
 * strength categories → sub-categories (Start / Speak / Act / Assess) →
 * articles that embed a Google Slides deck per language.
 */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote } from "@/components/StickyNote";
import { useLanguage, useTr } from "@/lib/i18n";
import { STRENGTHS, getStrengthColor, getStrengthName } from "@/lib/strengths-i18n";
import { pickLang, useTeachingMaterials } from "@/hooks/useTeachingMaterials";
import { slidesId } from "@/lib/google-slides";
import {
  createTeachingCategory,
  createTeachingSubcategory,
  deleteTeachingArticle,
  deleteTeachingCategory,
  deleteTeachingSubcategory,
  saveTeachingArticle,
  setTeachingCategoryPublished,
  setTeachingSubcategoryPublished,
  type TeachingArticle,
} from "@/lib/teaching.functions";

/** Small "hidden from users" pill shown next to unpublished rows. */
function HiddenBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-900/10 px-2 py-0.5 text-xs font-bold text-slate-700">
      {label}
    </span>
  );
}

/** Checkbox that flips the published flag for a folder or category. */
function PublishToggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold">
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}


export function TeachingMaterialsTab() {
  const tr = useTr();
  const { language } = useLanguage();
  const lang = language === "sv" ? "sv" : language === "en" ? "en" : "fi";
  const { categories, subcategories, articles, refresh } = useTeachingMaterials();

  const addCategory = useServerFn(createTeachingCategory);
  const delCategory = useServerFn(deleteTeachingCategory);
  const addSub = useServerFn(createTeachingSubcategory);
  const delSub = useServerFn(deleteTeachingSubcategory);
  const saveArticle = useServerFn(saveTeachingArticle);
  const delArticle = useServerFn(deleteTeachingArticle);

  const [newStrength, setNewStrength] = useState<string>("");
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ subId: string; article: TeachingArticle | null } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const usedStrengths = useMemo(
    () => new Set(categories.map((c) => c.strength_id)),
    [categories],
  );

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      await refresh();
      toast.success(tr("Tallennettu!"));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <StickyNote seed="tm-add-cat" className="space-y-3">
        <h3 className="text-xl font-bold">{tr("Lisää kategoria")}</h3>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="tm-strength">{tr("Vahvuus")}</Label>
            <select
              id="tm-strength"
              className="rounded-2xl border bg-white px-3 py-2 text-slate-900"
              value={newStrength}
              onChange={(e) => setNewStrength(e.target.value)}
            >
              <option value="">{tr("Valitse")}</option>
              {STRENGTHS.map((s) => s.nr)
                .filter((id: number) => !usedStrengths.has(String(id)))
                .map((id: number) => (
                <option key={id} value={String(id)}>
                  {getStrengthName(id, lang)}
                </option>
              ))}
            </select>
          </div>
          <Button
            disabled={!newStrength || busy}
            onClick={() =>
              void run(async () => {
                await addCategory({ data: { strengthId: newStrength } });
                setNewStrength("");
              })
            }
          >
            {tr("Lisää")}
          </Button>
        </div>
        <p className="text-xs opacity-70">
          {tr("Aloita")} · {tr("Puhu")} · {tr("Toimi")} · {tr("Arvioi")}
        </p>
      </StickyNote>

      {categories.map((c) => {
        const subs = subcategories.filter((s) => s.category_id === c.id);
        const open = openCat === c.id;
        return (
          <StickyNote key={c.id} seed={`tm-${c.id}`} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setOpenCat(open ? null : c.id)}
                className="flex items-center gap-2 text-xl font-bold"
              >
                <span
                  className="h-5 w-5 rounded-full"
                  style={{ background: getStrengthColor(Number(c.strength_id)) }}
                  aria-hidden
                />
                {getStrengthName(Number(c.strength_id), lang)}
              </button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => void run(() => delCategory({ data: { id: c.id } }))}
              >
                {tr("Poista")}
              </Button>
            </div>

            {open && (
              <div className="space-y-3">
                {subs.map((s) => {
                  const rows = articles.filter((a) => a.subcategory_id === s.id);
                  return (
                    <div key={s.id} className="rounded-2xl bg-white/70 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold">{pickLang(s as never, "name", lang)}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() => setEditing({ subId: s.id, article: null })}
                          >
                            {tr("Lisää artikkeli")}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busy}
                            onClick={() => void run(() => delSub({ data: { id: s.id } }))}
                          >
                            {tr("Poista")}
                          </Button>
                        </div>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {rows.map((a) => (
                          <li
                            key={a.id}
                            className="flex flex-wrap items-center justify-between gap-2 text-sm"
                          >
                            <span className="min-w-0 break-words">
                              {pickLang(a as never, "title", lang)}
                              {!a.is_published && (
                                <span className="ml-2 opacity-60">({tr("Ei julkaistu")})</span>
                              )}
                            </span>
                            <span className="flex gap-2">
                              <button
                                type="button"
                                className="underline"
                                onClick={() => setEditing({ subId: s.id, article: a })}
                              >
                                {tr("Muokkaa")}
                              </button>
                              <button
                                type="button"
                                className="underline"
                                onClick={() => void run(() => delArticle({ data: { id: a.id } }))}
                              >
                                {tr("Poista")}
                              </button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                <AddSubcategory
                  disabled={busy}
                  onAdd={(names) =>
                    void run(() => addSub({ data: { categoryId: c.id, ...names } }))
                  }
                />
              </div>
            )}
          </StickyNote>
        );
      })}

      {editing && (
        <ArticleForm
          subId={editing.subId}
          article={editing.article}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={(input) =>
            void run(async () => {
              await saveArticle({ data: input });
              setEditing(null);
            })
          }
        />
      )}
    </div>
  );
}

function AddSubcategory({
  disabled,
  onAdd,
}: {
  disabled: boolean;
  onAdd: (n: { nameFi: string; nameEn: string; nameSv: string }) => void;
}) {
  const tr = useTr();
  const [fi, setFi] = useState("");
  const [en, setEn] = useState("");
  const [sv, setSv] = useState("");
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1">
        <Label>{tr("Alakategoria")} (FI)</Label>
        <Input value={fi} onChange={(e) => setFi(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>EN</Label>
        <Input value={en} onChange={(e) => setEn(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>SV</Label>
        <Input value={sv} onChange={(e) => setSv(e.target.value)} />
      </div>
      <Button
        disabled={disabled || !fi.trim()}
        onClick={() => {
          onAdd({ nameFi: fi.trim(), nameEn: (en || fi).trim(), nameSv: (sv || fi).trim() });
          setFi("");
          setEn("");
          setSv("");
        }}
      >
        {tr("Lisää")}
      </Button>
    </div>
  );
}

function ArticleForm({
  subId,
  article,
  busy,
  onCancel,
  onSave,
}: {
  subId: string;
  article: TeachingArticle | null;
  busy: boolean;
  onCancel: () => void;
  onSave: (input: {
    id?: string;
    subcategoryId: string;
    titleFi: string;
    titleEn: string;
    titleSv: string;
    descriptionFi?: string;
    descriptionEn?: string;
    descriptionSv?: string;
    slidesFi?: string;
    slidesEn?: string;
    slidesSv?: string;
    thumbnailUrl?: string;
    isPublished: boolean;
  }) => void;
}) {
  const tr = useTr();
  const [titleFi, setTitleFi] = useState(article?.title_fi ?? "");
  const [titleEn, setTitleEn] = useState(article?.title_en ?? "");
  const [titleSv, setTitleSv] = useState(article?.title_sv ?? "");
  const [descFi, setDescFi] = useState(article?.description_fi ?? "");
  const [descEn, setDescEn] = useState(article?.description_en ?? "");
  const [descSv, setDescSv] = useState(article?.description_sv ?? "");
  const [slidesFi, setSlidesFi] = useState(article?.google_slides_url_fi ?? "");
  const [slidesEn, setSlidesEn] = useState(article?.google_slides_url_en ?? "");
  const [slidesSv, setSlidesSv] = useState(article?.google_slides_url_sv ?? "");
  const [thumb, setThumb] = useState(article?.thumbnail_url ?? "");
  const [published, setPublished] = useState(article?.is_published ?? true);

  const badLink = [slidesFi, slidesEn, slidesSv].some((u) => u.trim() && !slidesId(u));

  return (
    <StickyNote seed="tm-article-form" className="space-y-3">
      <h3 className="text-xl font-bold">
        {article ? tr("Muokkaa") : tr("Lisää artikkeli")}
      </h3>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label={`${tr("Otsikko")} (FI)`} value={titleFi} onChange={setTitleFi} />
        <Field label={`${tr("Otsikko")} (EN)`} value={titleEn} onChange={setTitleEn} />
        <Field label={`${tr("Otsikko")} (SV)`} value={titleSv} onChange={setTitleSv} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Area label={`${tr("Kuvaus")} (FI)`} value={descFi} onChange={setDescFi} />
        <Area label={`${tr("Kuvaus")} (EN)`} value={descEn} onChange={setDescEn} />
        <Area label={`${tr("Kuvaus")} (SV)`} value={descSv} onChange={setDescSv} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Google Slides (FI)" value={slidesFi} onChange={setSlidesFi} />
        <Field label="Google Slides (EN)" value={slidesEn} onChange={setSlidesEn} />
        <Field label="Google Slides (SV)" value={slidesSv} onChange={setSlidesSv} />
      </div>
      {badLink && (
        <p className="text-sm font-bold text-[color:var(--coral)]">
          {tr("Tarkista Google Slides -linkki")}
        </p>
      )}
      <Field label={tr("Kuva")} value={thumb} onChange={setThumb} />
      <label className="flex items-center gap-2 text-sm font-bold">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        {tr("Julkaistu")}
      </label>
      <div className="flex gap-2">
        <Button
          disabled={busy || !titleFi.trim() || badLink}
          onClick={() =>
            onSave({
              id: article?.id,
              subcategoryId: subId,
              titleFi: titleFi.trim(),
              titleEn: (titleEn || titleFi).trim(),
              titleSv: (titleSv || titleFi).trim(),
              descriptionFi: descFi,
              descriptionEn: descEn,
              descriptionSv: descSv,
              slidesFi,
              slidesEn,
              slidesSv,
              thumbnailUrl: thumb,
              isPublished: published,
            })
          }
        >
          {tr("Tallenna")}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          {tr("Peruuta")}
        </Button>
      </div>
    </StickyNote>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} />
    </div>
  );
}
