import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout } from "@/components/SiteLayout";
import { createSession, listSessions } from "@/lib/api";

type AskSearch = { view?: "answer" | "then-now" | undefined; ask?: string | undefined };

export const Route = createFileRoute("/ask/")({
  validateSearch: (s: Record<string, unknown>): AskSearch => ({
    view: s["view"] === "then-now" ? "then-now" : s["view"] === "answer" ? "answer" : undefined,
    ask: typeof s["ask"] === "string" ? (s["ask"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Ask the Navigator · Social Media Research Navigator" },
      {
        name: "description",
        content: "Ask questions and get answers grounded in cited conference archive documents.",
      },
      { property: "og:title", content: "Ask the Navigator" },
      {
        property: "og:description",
        content:
          "Answers with numbered citations to original SMTCW sources, plus Then & Now comparisons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AskIndex,
});

function AskIndex() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  useEffect(() => {
    let cancel = false;
    (async () => {
      const latest = (await listSessions())[0];
      const s = search.ask || !latest ? await createSession() : latest;
      if (!cancel)
        navigate({ to: "/ask/$sessionId", params: { sessionId: s.id }, search, replace: true });
    })();
    return () => {
      cancel = true;
    };
  }, [navigate, search]);
  return (
    <SiteLayout>
      <Skeleton className="h-96 w-full" />
    </SiteLayout>
  );
}
