import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SiteLayout, PageTitle } from "@/components/SiteLayout";
import {
  getSavedItems,
  listSessions,
  removeSavedItem,
  updateSavedNote,
  type SavedItem,
} from "@/lib/api";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved · Social Media Research Navigator" },
      {
        name: "description",
        content: "Your bookmarked documents, answers, trends and chats from the SMTCW archive.",
      },
      { property: "og:title", content: "Saved research · Social Media Research Navigator" },
      {
        property: "og:description",
        content: "Bookmarks and saved chats for your archive research.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavedPage,
});

const GROUPS: { type: SavedItem["type"]; label: string }[] = [
  { type: "document", label: "Documents" },
  { type: "answer", label: "Answers" },
  { type: "trend", label: "Trends" },
];

function ItemLink({ i }: { i: SavedItem }) {
  const cls = "font-semibold text-primary hover:underline";
  if (i.type === "document")
    return (
      <Link to="/document/$submissionId" params={{ submissionId: i.refId }} className={cls}>
        {i.title}
      </Link>
    );
  if (i.type === "answer")
    return (
      <Link
        to="/ask/$sessionId"
        params={{ sessionId: i.refId.split("#")[0] ?? "" }}
        className={cls}
      >
        {i.title}
      </Link>
    );
  if (i.refId.startsWith("timeline:"))
    return (
      <Link to="/timeline" className={cls}>
        {i.title}
      </Link>
    );
  if (i.refId.startsWith("then-now:"))
    return (
      <Link to="/ask" search={{ view: "then-now" }} className={cls}>
        {i.title}
      </Link>
    );
  return (
    <Link to="/" search={{ q: i.refId.replace(/^recent:/, "") }} className={cls}>
      {i.title}
    </Link>
  );
}

function SavedPage() {
  const qc = useQueryClient();
  const saved = useQuery({ queryKey: ["saved"], queryFn: getSavedItems });
  const sessions = useQuery({ queryKey: ["sessions"], queryFn: listSessions });
  const items = saved.data ?? [];
  const chats = (sessions.data ?? []).filter((s) => s.turns.length > 0);
  const refresh = () => qc.invalidateQueries({ queryKey: ["saved"] });

  const copyAll = () => {
    const text = items
      .filter((i) => i.citation)
      .map((i) => i.citation)
      .join("\n");
    if (!text) {
      toast.info("No citations saved yet.");
      return;
    }
    void navigator.clipboard.writeText(text);
    toast.success("All saved citations copied");
  };

  return (
    <SiteLayout>
      <PageTitle
        title="Saved"
        subtitle="Bookmarks and chats are stored in this browser until accounts are added."
      />
      <Button variant="outline" onClick={copyAll} className="mb-6">
        <Copy className="mr-1 h-4 w-4" />
        Copy all citations
      </Button>
      <div className="grid gap-6 md:grid-cols-2">
        {GROUPS.map((g) => {
          const list = items.filter((i) => i.type === g.type);
          return (
            <Card key={g.type}>
              <CardHeader>
                <CardTitle className="font-serif text-primary">{g.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {list.length === 0 && <p className="text-muted-foreground">Nothing saved yet.</p>}
                {list.map((i) => (
                  <div key={i.id} className="rounded-md border p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <ItemLink i={i} />
                        {i.year && (
                          <span className="ml-2 text-xs text-muted-foreground">{i.year}</span>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        aria-label={`Remove ${i.title}`}
                        onClick={async () => {
                          await removeSavedItem(i.id);
                          refresh();
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Input
                      defaultValue={i.note ?? ""}
                      placeholder="Add a note…"
                      aria-label={`Note for ${i.title}`}
                      className="mt-2 h-8"
                      onBlur={async (e) => {
                        await updateSavedNote(i.id, e.target.value);
                        refresh();
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-primary">Chats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {chats.length === 0 && <p className="text-muted-foreground">No saved chats yet.</p>}
            {chats.map((s) => (
              <Link
                key={s.id}
                to="/ask/$sessionId"
                params={{ sessionId: s.id }}
                className="block rounded-md border p-3 hover:bg-muted"
              >
                <span className="font-semibold text-primary">{s.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {s.turns.length} question{s.turns.length === 1 ? "" : "s"} ·{" "}
                  {new Date(s.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
