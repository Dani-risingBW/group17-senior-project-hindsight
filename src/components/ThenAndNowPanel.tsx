import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkButton } from "@/components/BookmarkButton";
import { getThenAndNow, UNSUPPORTED_TOPIC, type Citation, type Verdict } from "@/lib/api";

export function CiteLink({ c, n }: { c: Citation; n?: number }) {
  return (
    <Link
      to="/document/$submissionId"
      params={{ submissionId: c.submission_id }}
      search={{ highlight: c.excerpt }}
      className="text-xs text-accent underline"
    >
      {n !== undefined ? `[${n}] ` : ""}
      {c.title}, {c.year}, p. {c.page ?? 1}
    </Link>
  );
}

const verdictClass: Record<Verdict, string> = {
  Confirmed: "bg-success text-primary-foreground",
  "Partly confirmed": "bg-secondary text-secondary-foreground",
  "Not confirmed": "bg-destructive text-destructive-foreground",
};

export function ThenAndNowPanel({
  topic,
  onCitations,
}: {
  topic: string;
  onCitations?: (c: Citation[]) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["thenNow", topic],
    queryFn: async () => {
      const d = await getThenAndNow(topic);
      if (d && onCitations) onCitations(d.summary.map((s) => s.source));
      return d;
    },
  });
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!data) return <p>{UNSUPPORTED_TOPIC}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-2xl font-bold text-primary">
          {data.topic}: predictions vs. evidence
        </h2>
        <BookmarkButton
          type="trend"
          refId={`then-now:${data.topic}`}
          title={`Then & Now: ${data.topic}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-primary">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-5 border-l-2 border-primary/30 pl-6">
            {data.milestones.map((m, i) => (
              <li key={i}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">{m.year}</Badge>
                  <Badge variant="outline">{m.kind}</Badge>
                  {m.verdict && <Badge className={verdictClass[m.verdict]}>{m.verdict}</Badge>}
                </div>
                <p className="mt-1">{m.claim}</p>
                <div className="mt-1 flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    Source: <CiteLink c={m.source} />
                  </span>
                  {m.verdictSource && (
                    <span className="text-xs text-muted-foreground">
                      Decided by: <CiteLink c={m.verdictSource} />
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-primary">
              Share of impressions to the top 10% of accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={data.metric}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis unit="%" domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" name="Share" fill="var(--chart-1)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-0.5">
              {[...new Map(data.metric.map((m) => [m.source.excerpt, m.source])).values()].map(
                (c) => (
                  <div key={c.excerpt}>
                    <CiteLink c={c} />
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-accent">What modern AI changed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.aiShift.map((a, i) => (
              <div key={i} className="border-l-4 border-accent pl-3">
                <p>{a.text}</p>
                <CiteLink c={a.source} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted">
        <CardContent className="p-5">
          <h3 className="mb-2 font-serif font-bold text-primary">Summary</h3>
          <p className="leading-relaxed">
            {data.summary.map((s, i) => (
              <span key={i}>
                {s.sentence}{" "}
                <Link
                  to="/document/$submissionId"
                  params={{ submissionId: s.source.submission_id }}
                  search={{ highlight: s.source.excerpt }}
                  className="font-semibold text-accent underline"
                  aria-label={`Citation ${i + 1}: ${s.source.title}`}
                >
                  [{i + 1}]
                </Link>{" "}
              </span>
            ))}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
