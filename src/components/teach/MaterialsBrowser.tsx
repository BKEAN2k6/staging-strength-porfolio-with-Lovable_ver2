/**
 * @lovable-new 2026-08-04
 * Teaching Materials browser used by teachers and school admins.
 * Four levels: strength categories → sub-categories → articles → Google Slides.
 */
import { useMemo, useState } from "react";
import { StickyNote } from "@/components/StickyNote";
import { ArrowLeftIcon, BookIcon } from "@/components/icons/AppIcons";
import { useLanguage, useTr } from "@/lib/i18n";
import { getStrengthColor, getStrengthName } from "@/lib/strengths-i18n";
import { slidesEmbedUrl, slidesPresentUrl } from "@/lib/google-slides";
import { pickLang, useTeachingMaterials } from "@/hooks/useTeachingMaterials";
import type { TeachingArticle } from "@/lib/teaching.functions";

export function MaterialsBrowser() {
  const tr = useTr();
  const { language } = useLanguage();
  const lang = language === "sv" ? "sv" : language === "en" ? "en" : "fi";
  const { categories, subcategories, articles, loading } = useTeachingMaterials();

  const [catId, setCatId] = useState<string | null>(null);
  const [subId, setSubId] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<string | null>(null);

  const category = categories.find((c) => c.id === catId) ?? null;
  const subcategory = subcategories.find((s) => s.id === subId) ?? null;
  const article = articles.find((a) => a.id === articleId) ?? null;

  const subsOf = useMemo(
    () => subcategories.filter((s) => s.category_id === catId),
    [subcategories, catId],
  );
  const articlesOf = useMemo(
    () => articles.filter((a) => a.subcategory_id === subId),
    [articles, subId],
  );

  /** Categories that actually have at least one article. */
  const visibleCategories = useMemo(() => {
    const subByCat = new Map<string, string[]>();
    for (const s of subcategories) {
      subByCat.set(s.category_id, [...(subByCat.get(s.category_id) ?? []), s.id]);
    }
    return categories
      .map((c) => {
        const ids = new Set(subByCat.get(c.id) ?? []);
        const count = articles.filter((a) => ids.has(a.subcategory_id)).length;
        return { c, count };
      })
      .filter((x) => x.count > 0);
  }, [categories, subcategories, articles]);

  const strengthName = category ? getStrengthName(Number(category.strength_id), lang) : "";

  const crumbs: { label: string; onClick?: () => void }[] = [
    {
      label: tr("Opetusmateriaalit"),
      onClick: () => {
        setCatId(null);
        setSubId(null);
        setArticleId(null);
      },
    },
  ];
  if (category)
    crumbs.push({
      label: strengthName,
      onClick: () => {
        setSubId(null);
        setArticleId(null);
      },
    });
  if (subcategory)
    crumbs.push({
      label: pickLang(subcategory as never, "name", lang),
      onClick: () => setArticleId(null),
    });
  if (article) crumbs.push({ label: pickLang(article as never, "title", lang) });

  if (loading) return <p className="opacity-70">…</p>;

  return (
    <div className="space-y-4">
      {crumbs.length > 1 && (
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={crumbs[crumbs.length - 2].onClick}
            className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 font-bold text-slate-900"
          >
            <ArrowLeftIcon size={16} />
            {tr("Takaisin")}
          </button>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-2 opacity-80">
              {i > 0 && <span aria-hidden>›</span>}
              {c.onClick && i < crumbs.length - 1 ? (
                <button type="button" onClick={c.onClick} className="underline">
                  {c.label}
                </button>
              ) : (
                <span className="font-bold">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Level 1 — strength categories */}
      {!category && (
        <StickyNote seed="materials-cats" className="space-y-3">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <BookIcon size={20} /> {tr("Opetusmateriaalit")}
          </h3>
          {visibleCategories.length === 0 ? (
            <p className="opacity-70">{tr("Ei materiaaleja vielä.")}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCategories.map(({ c, count }) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCatId(c.id)}
                  className="rounded-2xl p-4 text-left text-white shadow transition-transform hover:-translate-y-0.5"
                  style={{ background: getStrengthColor(Number(c.strength_id)) }}
                >
                  <span className="block text-lg font-bold">
                    {getStrengthName(Number(c.strength_id), lang)}
                  </span>
                  <span className="block text-sm opacity-90">
                    {count} {tr("Artikkeleita")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </StickyNote>
      )}

      {/* Level 2 — sub-categories */}
      {category && !subcategory && (
        <StickyNote seed="materials-subs" className="space-y-3">
          <h3 className="text-xl font-bold">{strengthName}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {subsOf.map((s) => {
              const count = articles.filter((a) => a.subcategory_id === s.id).length;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSubId(s.id)}
                  className="rounded-2xl bg-white/85 p-4 text-left text-slate-900 shadow transition-transform hover:-translate-y-0.5"
                >
                  <span className="block font-bold">{pickLang(s as never, "name", lang)}</span>
                  <span className="block text-sm opacity-70">
                    {count} {tr("Artikkeleita")}
                  </span>
                </button>
              );
            })}
          </div>
        </StickyNote>
      )}

      {/* Level 3 — articles */}
      {subcategory && !article && (
        <StickyNote seed="materials-articles" className="space-y-3">
          <h3 className="text-xl font-bold">{pickLang(subcategory as never, "name", lang)}</h3>
          {articlesOf.length === 0 ? (
            <p className="opacity-70">{tr("Ei materiaaleja vielä.")}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {articlesOf.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setArticleId(a.id)}
                  className="space-y-2 rounded-2xl bg-white/85 p-3 text-left text-slate-900 shadow transition-transform hover:-translate-y-0.5"
                >
                  {a.thumbnail_url && (
                    <img
                      src={a.thumbnail_url}
                      alt={pickLang(a as never, "title", lang)}
                      loading="lazy"
                      className="h-28 w-full rounded-xl object-cover"
                    />
                  )}
                  <span className="block font-bold">{pickLang(a as never, "title", lang)}</span>
                  <span className="block text-sm opacity-70">
                    {pickLang(a as never, "description", lang)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </StickyNote>
      )}

      {/* Level 4 — Google Slides viewer */}
      {article && <ArticleViewer article={article} lang={lang} />}
    </div>
  );
}

function ArticleViewer({
  article,
  lang,
}: {
  article: TeachingArticle;
  lang: "fi" | "en" | "sv";
}) {
  const tr = useTr();
  const raw =
    (article as unknown as Record<string, string | null>)[`google_slides_url_${lang}`] ||
    article.google_slides_url_fi;
  const embed = slidesEmbedUrl(raw);
  const present = slidesPresentUrl(raw);
  const title = pickLang(article as never, "title", lang);

  return (
    <StickyNote seed={`article-${article.id}`} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-bold">{title}</h3>
        {present && (
          <a
            href={present}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[color:var(--purple)] px-4 py-2 text-sm font-bold text-white shadow"
          >
            {tr("Näytä luokalle")}
          </a>
        )}
      </div>
      {embed ? (
        <iframe
          src={embed}
          title={title}
          className="h-[600px] w-full rounded-2xl bg-white"
          allowFullScreen
        />
      ) : (
        <p className="opacity-70">{tr("Ei materiaaleja vielä.")}</p>
      )}
      <p className="text-sm opacity-80">{pickLang(article as never, "description", lang)}</p>
    </StickyNote>
  );
}
