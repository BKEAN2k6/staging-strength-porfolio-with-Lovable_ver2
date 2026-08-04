/**
 * @lovable-new 2026-08-04
 * Super admin "Teaching Materials" tab — register Canva decks, keep the
 * FI/EN/SV titles, publish/unpublish, reorder and delete.
 *
 * Canva MCP is not connected to this project, so importing works by pasting a
 * Canva design ID (or share link) plus optional exported slide image URLs.
 * The stored shape already matches a future MCP-driven auto-import.
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, useTr } from "@/lib/i18n";
import {
  fetchPresentations,
  titleOf,
  canvaEmbedUrl,
  LEVEL_TAGS,
  LEVEL_TAG_LABEL,
  type TeachingPresentation,
} from "@/components/teach/MaterialsGrid";

/** Accepts a raw design id or any canva.com/design/<id>/… link. */
function parseDesignId(input: string): string {
  const m = input.match(/design\/([A-Za-z0-9_-]+)/);
  return (m?.[1] ?? input).trim();
}

function splitUrls(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function TeachingMaterialsTab() {
  const tr = useTr();
  const { language } = useLanguage();
  const [items, setItems] = useState<TeachingPresentation[]>([]);
  const [editing, setEditing] = useState<TeachingPresentation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const [designId, setDesignId] = useState("");
  const [titleFi, setTitleFi] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleSv, setTitleSv] = useState("");
  const [descFi, setDescFi] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descSv, setDescSv] = useState("");
  const [thumb, setThumb] = useState("");
  const [slides, setSlides] = useState("");
  const [levelTag, setLevelTag] = useState<string>("general");
  const [published, setPublished] = useState(true);

  const load = useCallback(async () => {
    try {
      setItems(await fetchPresentations({ includeUnpublished: true }));
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setEditing(null);
    setDesignId("");
    setTitleFi("");
    setTitleEn("");
    setTitleSv("");
    setDescFi("");
    setDescEn("");
    setDescSv("");
    setThumb("");
    setSlides("");
    setLevelTag("general");
    setPublished(true);
  }

  function startEdit(p: TeachingPresentation) {
    setEditing(p);
    setShowForm(true);
    setDesignId(p.canva_design_id);
    setTitleFi(p.title_fi);
    setTitleEn(p.title_en);
    setTitleSv(p.title_sv);
    setDescFi(p.description_fi ?? "");
    setDescEn(p.description_en ?? "");
    setDescSv(p.description_sv ?? "");
    setThumb(p.thumbnail_url ?? "");
    setSlides(p.slide_urls.join("\n"));
    setLevelTag(p.level_tag);
    setPublished(p.is_published);
  }

  async function save() {
    const id = parseDesignId(designId);
    if (!id || !titleFi.trim()) {
      toast.error(tr("Täytä pakolliset kentät"));
      return;
    }
    const slideUrls = splitUrls(slides);
    const payload = {
      canva_design_id: id,
      title_fi: titleFi.trim(),
      title_en: (titleEn || titleFi).trim(),
      title_sv: (titleSv || titleFi).trim(),
      description_fi: descFi || null,
      description_en: descEn || null,
      description_sv: descSv || null,
      thumbnail_url: thumb || slideUrls[0] || null,
      slide_urls: slideUrls,
      slide_count: slideUrls.length,
      level_tag: levelTag,
      is_published: published,
    };
    setBusy(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("teaching_presentations")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("teaching_presentations")
          .insert({ ...payload, sort_order: items.length });
        if (error) throw error;
      }
      toast.success(tr("Tallennettu!"));
      resetForm();
      setShowForm(false);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(p: TeachingPresentation) {
    await supabase
      .from("teaching_presentations")
      .update({ is_published: !p.is_published })
      .eq("id", p.id);
    await load();
  }

  async function remove(p: TeachingPresentation) {
    if (!window.confirm(tr("Poista"))) return;
    await supabase.from("teaching_presentations").delete().eq("id", p.id);
    await load();
  }

  async function move(p: TeachingPresentation, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === p.id);
    const other = items[idx + dir];
    if (!other) return;
    await supabase
      .from("teaching_presentations")
      .update({ sort_order: other.sort_order })
      .eq("id", p.id);
    await supabase
      .from("teaching_presentations")
      .update({ sort_order: p.sort_order })
      .eq("id", other.id);
    await load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">{tr("Opetusmateriaalit")}</h2>
        <Button
          className="rounded-full bg-[color:var(--purple)] font-bold text-white"
          onClick={() => {
            resetForm();
            setShowForm((v) => !v);
          }}
        >
          {tr("Tuo Canvasta")}
        </Button>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-3xl bg-white/85 p-4 shadow">
          <div className="space-y-1">
            <Label htmlFor="tp-design">{tr("Canva-esitykset")}</Label>
            <Input
              id="tp-design"
              value={designId}
              onChange={(e) => setDesignId(e.target.value)}
              placeholder="https://www.canva.com/design/DAF…/view"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="tp-fi">{tr("Esityksen nimi")} (FI)</Label>
              <Input id="tp-fi" value={titleFi} onChange={(e) => setTitleFi(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tp-en">{tr("Esityksen nimi")} (EN)</Label>
              <Input id="tp-en" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tp-sv">{tr("Esityksen nimi")} (SV)</Label>
              <Input id="tp-sv" value={titleSv} onChange={(e) => setTitleSv(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Textarea
              aria-label="FI"
              rows={2}
              value={descFi}
              onChange={(e) => setDescFi(e.target.value)}
              placeholder="FI"
            />
            <Textarea
              aria-label="EN"
              rows={2}
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              placeholder="EN"
            />
            <Textarea
              aria-label="SV"
              rows={2}
              value={descSv}
              onChange={(e) => setDescSv(e.target.value)}
              placeholder="SV"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="tp-thumb">{tr("Kuva")}</Label>
              <Input id="tp-thumb" value={thumb} onChange={(e) => setThumb(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tp-level">{tr("Taso")}</Label>
              <select
                id="tp-level"
                className="w-full rounded-2xl border bg-white px-3 py-2 text-slate-900"
                value={levelTag}
                onChange={(e) => setLevelTag(e.target.value)}
              >
                {LEVEL_TAGS.map((t) => (
                  <option key={t} value={t}>
                    {tr(LEVEL_TAG_LABEL[t])}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="tp-slides">{tr("Diat")}</Label>
            <Textarea
              id="tp-slides"
              rows={3}
              value={slides}
              onChange={(e) => setSlides(e.target.value)}
              placeholder="https://…/slide-1.png"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            {tr("Julkaistu")}
          </label>
          <div className="flex gap-2">
            <Button
              className="rounded-full bg-[color:var(--yellow)] font-bold text-slate-900"
              disabled={busy}
              onClick={() => void save()}
            >
              {tr("Tallenna")}
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              {tr("Peruuta")}
            </Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="opacity-70">{tr("Ei esityksiä vielä.")}</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white/85 shadow">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b">
                <th className="p-3">{tr("Kuva")}</th>
                <th className="p-3">{tr("Esityksen nimi")}</th>
                <th className="p-3">{tr("Taso")}</th>
                <th className="p-3">{tr("Diat")}</th>
                <th className="p-3">{tr("Julkaistu")}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3">
                    {p.thumbnail_url ? (
                      <img
                        src={p.thumbnail_url}
                        alt=""
                        className="h-10 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-16 rounded bg-[color:var(--purple)]/15" />
                    )}
                  </td>
                  <td className="p-3 font-semibold">{titleOf(p, language)}</td>
                  <td className="p-3">{tr(LEVEL_TAG_LABEL[p.level_tag] ?? "Yleinen")}</td>
                  <td className="p-3 tabular-nums">{p.slide_count}</td>
                  <td className="p-3">{p.is_published ? "✓" : "—"}</td>
                  <td className="space-x-2 p-3 text-right whitespace-nowrap">
                    <button type="button" className="underline" onClick={() => startEdit(p)}>
                      {tr("Muokkaa")}
                    </button>
                    <a
                      href={canvaEmbedUrl(p)}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Canva
                    </a>
                    <button
                      type="button"
                      className="underline"
                      onClick={() => void togglePublished(p)}
                    >
                      {p.is_published ? tr("Piilota") : tr("Julkaise")}
                    </button>
                    <button type="button" className="underline" onClick={() => void move(p, -1)}>
                      ↑
                    </button>
                    <button type="button" className="underline" onClick={() => void move(p, 1)}>
                      ↓
                    </button>
                    <button
                      type="button"
                      className="underline text-[color:var(--coral)]"
                      onClick={() => void remove(p)}
                    >
                      {tr("Poista")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
