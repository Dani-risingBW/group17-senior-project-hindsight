import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { RecentTopics } from "@/components/RecentTopics";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, X, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteLayout, Highlight, PageTitle } from "@/components/SiteLayout";
import { searchArchive, COMMUNITIES, type SearchParams } from "@/lib/api";
import { CONFERENCE_YEARS, TRACKS, DOCUMENT_TYPES } from "@/data/mockRecords";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({
    q: typeof s["q"] === "string" ? (s["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search the Archive · Social Media Research Navigator" },
      {
        name: "description",
        content:
          "Search a decade of Howard University Social Media Technology Conference materials with source-traceable results.",
      },
      { property: "og:title", content: "Search the Archive · Social Media Research Navigator" },
      {
        property: "og:description",
        content: "Search SMTCW conference papers, transcripts and programs from 2012-2024.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

type Filters = Omit<SearchParams, "query">;
const empty: Filters = {
  years: [],
  tracks: [],
  communities: [],
  documentTypes: [],
  sort: "relevance",
};

function toggle<T>(arr: T[], v: T) {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [input, setInput] = useState(q ?? "");
  const [query, setQuery] = useState(q ?? "");
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    setInput(q ?? "");
    setQuery(q ?? "");
  }
  const [f, setF] = useState<Filters>(empty);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["search", query, f],
    queryFn: () => searchArchive({ query, ...f }),
  });

  const chips = [
    ...f.years.map((v) => ({
      label: String(v),
      remove: () => setF({ ...f, years: toggle(f.years, v) }),
    })),
    ...f.tracks.map((v) => ({
      label: v,
      remove: () => setF({ ...f, tracks: toggle(f.tracks, v) }),
    })),
    ...f.communities.map((v) => ({
      label: v,
      remove: () => setF({ ...f, communities: toggle(f.communities, v) }),
    })),
    ...f.documentTypes.map((v) => ({
      label: v,
      remove: () => setF({ ...f, documentTypes: toggle(f.documentTypes, v) }),
    })),
  ];

  return (
    <SiteLayout>
      <PageTitle
        title="Search the archive"
        subtitle="A decade of Social Media Technology Conference and Workshop materials (2012-2019, 2021, 2024). Every result links to its original source."
      />
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(input);
        }}
        className="mb-6 flex gap-2"
      >
        <Label htmlFor="q" className="sr-only">
          Search query
        </Label>
        <Input
          id="q"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. feed algorithms, Black Twitter, misinformation"
          className="h-12 text-base"
        />
        <Button type="submit" size="lg" className="h-12">
          <Search className="mr-1 h-4 w-4" />
          Search
        </Button>
      </form>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <aside aria-label="Filters" className="space-y-5 rounded-lg border bg-card p-4 text-sm">
          <FilterGroup
            title="Conference year"
            items={CONFERENCE_YEARS.map(String)}
            selected={f.years.map(String)}
            onToggle={(v) => setF({ ...f, years: toggle(f.years, Number(v)) })}
          />
          <FilterGroup
            title="Track"
            items={[...TRACKS]}
            selected={f.tracks}
            onToggle={(v) => setF({ ...f, tracks: toggle(f.tracks, v) })}
          />
          <FilterGroup
            title="Community"
            items={[...COMMUNITIES]}
            selected={f.communities}
            onToggle={(v) => setF({ ...f, communities: toggle(f.communities, v) })}
          />
          <FilterGroup
            title="Document type"
            items={DOCUMENT_TYPES}
            selected={f.documentTypes}
            onToggle={(v) => setF({ ...f, documentTypes: toggle(f.documentTypes, v as never) })}
          />
          <div className="-mx-4 -mb-4 pt-2">
            <RecentTopics
              compact
              onAsk={(t) =>
                navigate({ to: "/ask", search: { ask: `What does the archive say about ${t}?` } })
              }
              onSearch={(t) => navigate({ to: "/", search: { q: t } })}
            />
          </div>
        </aside>

        <section aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {data ? `${data.total} result${data.total === 1 ? "" : "s"}` : "Searching…"}
            </p>
            <Select
              value={f.sort}
              onValueChange={(v) => setF({ ...f, sort: v as Filters["sort"] })}
            >
              <SelectTrigger className="w-44" aria-label="Sort results">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Sort: Relevance</SelectItem>
                <SelectItem value="year-desc">Sort: Newest first</SelectItem>
                <SelectItem value="year-asc">Sort: Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {chips.map((c) => (
                <Button
                  key={c.label}
                  variant="secondary"
                  size="sm"
                  onClick={c.remove}
                  aria-label={`Remove filter ${c.label}`}
                >
                  {c.label}
                  <X className="ml-1 h-3 w-3" />
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setF({ ...empty, sort: f.sort })}>
                Clear all
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          )}
          {isError && (
            <Card>
              <CardContent className="p-6">
                Search failed.{" "}
                <Button variant="link" onClick={() => refetch()}>
                  Try again
                </Button>
              </CardContent>
            </Card>
          )}
          {data && data.total === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No documents match. Try fewer filters or different keywords.
              </CardContent>
            </Card>
          )}
          <div className="space-y-4">
            {data?.results.map(({ record: r, communities }) => (
              <Card key={r.submission_id}>
                <CardContent className="p-5">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                    <Badge className="bg-primary text-primary-foreground">{r.year}</Badge>
                    <span className="text-muted-foreground">
                      {r.track} · {r.document_type}
                    </span>
                  </div>
                  <h2 className="font-serif text-lg font-bold text-primary">
                    <Highlight text={r.title} query={query} />
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {r.authors.map((a) => a.name).join(", ")}
                  </p>
                  <p className="mt-2 text-sm">
                    <Highlight text={r.abstract} query={query} />
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {r.keywords.map((k) => (
                      <Badge key={k} variant="outline">
                        {k}
                      </Badge>
                    ))}
                    {communities.map((c) => (
                      <Badge key={c} variant="secondary">
                        {c}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link to="/document/$submissionId" params={{ submissionId: r.submission_id }}>
                      <FileText className="mr-1 h-4 w-4" />
                      View source
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

function FilterGroup({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold text-primary">{title}</legend>
      <div className="space-y-1.5">
        {items.map((v) => {
          const id = `${title}-${v}`.replace(/\W/g, "-");
          return (
            <div key={v} className="flex items-center gap-2">
              <Checkbox
                id={id}
                checked={selected.includes(v)}
                onCheckedChange={() => onToggle(v)}
              />
              <Label htmlFor={id} className="font-normal">
                {v}
              </Label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
