import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout } from "@/components/SiteLayout";
import { BookmarkButton } from "@/components/BookmarkButton";
import { getDocument, formatCitation } from "@/lib/api";

export const Route = createFileRoute("/document/$submissionId")({
  validateSearch: (s: Record<string, unknown>): { highlight?: string | undefined } => ({
    highlight: typeof s["highlight"] === "string" ? (s["highlight"] as string) : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.submissionId} · Social Media Research Navigator` },
      {
        name: "description",
        content: `Source document ${params.submissionId} from the SMTCW archive.`,
      },
      { property: "og:title", content: `${params.submissionId} · Source document` },
      {
        property: "og:description",
        content: "Original conference source with metadata and full text.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocumentPage,
});

function DocumentPage() {
  const { submissionId } = Route.useParams();
  const { highlight } = Route.useSearch();
  const router = useRouter();
  const { data: r, isLoading } = useQuery({
    queryKey: ["doc", submissionId],
    queryFn: () => getDocument(submissionId),
  });

  return (
    <SiteLayout>
      <Button variant="ghost" onClick={() => router.history.back()} className="mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to results
      </Button>
      {isLoading && <Skeleton className="h-96 w-full" />}
      {!isLoading && !r && (
        <p>
          Document not found.{" "}
          <Link to="/" className="text-accent underline">
            Return to search
          </Link>
        </p>
      )}
      {r && (
        <article className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary">{r.title}</h1>
            <p className="mt-2 text-muted-foreground">
              {r.authors.map((a) => `${a.name} (${a.affiliation})`).join("; ")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(formatCitation(r));
                  toast.success("Citation copied");
                }}
              >
                <Copy className="mr-1 h-4 w-4" />
                Copy citation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info("Downloads will be available once the archive backend is connected.")
                }
              >
                <Download className="mr-1 h-4 w-4" />
                Download source
              </Button>
              <BookmarkButton
                type="document"
                refId={r.submission_id}
                title={r.title}
                year={r.year}
                citation={formatCitation(r)}
              />
            </div>
            <h2 className="mt-8 font-serif text-xl font-bold text-primary">Abstract</h2>
            <p className="mt-2">{r.abstract}</p>
            <h2 className="mt-8 font-serif text-xl font-bold text-primary">Full text</h2>
            <div className="mt-2 space-y-4 leading-relaxed">
              {r.full_text_content.split("\n\n").map((p, i) => (
                <div key={i} id={`page-${i + 1}`}>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Page {i + 1}
                  </p>
                  <p>
                    <Passage text={p} highlight={highlight} />
                  </p>
                </div>
              ))}
            </div>
          </div>
          <Card className="h-fit">
            <CardContent className="space-y-3 p-5 text-sm">
              <Meta k="Submission ID" v={r.submission_id} />
              <Meta k="Year" v={String(r.year)} />
              <Meta k="Track" v={r.track} />
              <Meta k="Document type" v={r.document_type} />
              <div>
                <dt className="font-semibold text-primary">Keywords</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {r.keywords.map((k) => (
                    <Badge key={k} variant="outline">
                      {k}
                    </Badge>
                  ))}
                </dd>
              </div>
            </CardContent>
          </Card>
        </article>
      )}
    </SiteLayout>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-semibold text-primary">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function Passage({ text, highlight }: { text: string; highlight?: string | undefined }) {
  if (!highlight) return <>{text}</>;
  const i = text.indexOf(highlight);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-highlight px-0.5 text-foreground">{highlight}</mark>
      {text.slice(i + highlight.length)}
    </>
  );
}
