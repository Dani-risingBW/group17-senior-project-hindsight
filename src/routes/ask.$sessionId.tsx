import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { History, Pencil, Plus, Send, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteLayout, PageTitle } from "@/components/SiteLayout";
import { BookmarkButton } from "@/components/BookmarkButton";
import { ThenAndNowPanel } from "@/components/ThenAndNowPanel";
import { RecentTopics } from "@/components/RecentTopics";
import {
  askNavigator,
  createSession,
  deleteSession,
  getSession,
  listSessions,
  matchThenNowTopic,
  renameSession,
  saveTurns,
  THEN_NOW_TOPICS,
  type ChatTurn,
  type Citation,
} from "@/lib/api";

type AskSearch = { view?: "answer" | "then-now" | undefined; ask?: string | undefined };

export const Route = createFileRoute("/ask/$sessionId")({
  validateSearch: (s: Record<string, unknown>): AskSearch => ({
    view: s["view"] === "then-now" ? "then-now" : s["view"] === "answer" ? "answer" : undefined,
    ask: typeof s["ask"] === "string" ? (s["ask"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Chat · Ask the Navigator" },
      {
        name: "description",
        content: "A saved Navigator conversation with cited archive sources.",
      },
      { property: "og:title", content: "Ask the Navigator · Saved chat" },
      {
        property: "og:description",
        content: "Grounded answers and Then & Now comparisons from the SMTCW archive.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AskPage,
});

const starters = [
  "How did predictions about Twitter feed algorithms hold up?",
  "What does the archive say about Black Twitter?",
  "How effective were misinformation labels?",
  "How do HBCU students use social media?",
];

function AskPage() {
  const { sessionId } = Route.useParams();
  const { view = "answer", ask: pendingAsk } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [turns, setTurns] = useState<ChatTurn[] | null>(null);
  const [tnCitations, setTnCitations] = useState<Citation[]>([]);
  const [busy, setBusy] = useState(false);
  const turnsRef = useRef<ChatTurn[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sessions = useQuery({ queryKey: ["sessions"], queryFn: listSessions });

  // Load the session from storage after hydration.
  useEffect(() => {
    let cancel = false;
    getSession(sessionId).then((s) => {
      if (cancel) return;
      turnsRef.current = s?.turns ?? [];
      setTurns(turnsRef.current);
      if (!s) navigate({ to: "/ask", replace: true });
    });
    return () => {
      cancel = true;
    };
  }, [sessionId, navigate]);

  const commit = (next: ChatTurn[]) => {
    turnsRef.current = next;
    setTurns(next);
    void saveTurns(sessionId, next).then(() => qc.invalidateQueries({ queryKey: ["sessions"] }));
  };

  const ask = async (question: string) => {
    if (!question.trim() || busy) return;
    setQ("");
    setBusy(true);
    const idx = turnsRef.current.length;
    commit([...turnsRef.current, { question }]);
    if (view !== "answer") navigate({ to: ".", search: { view: "answer" }, replace: true });
    try {
      const result = await askNavigator(question);
      commit(turnsRef.current.map((x, i) => (i === idx ? { ...x, result } : x)));
    } catch {
      commit(turnsRef.current.map((x, i) => (i === idx ? { ...x, error: true } : x)));
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  // Run a question passed in from Recent Topics / Search.
  const ranPending = useRef(false);
  useEffect(() => {
    if (turns && pendingAsk && !ranPending.current) {
      ranPending.current = true;
      navigate({ to: ".", search: { view: "answer" }, replace: true });
      void ask(pendingAsk);
    }
  });

  const newChat = async () => {
    const s = await createSession();
    await qc.invalidateQueries({ queryKey: ["sessions"] });
    navigate({ to: "/ask/$sessionId", params: { sessionId: s.id } });
  };
  const remove = async (id: string) => {
    await deleteSession(id);
    await qc.invalidateQueries({ queryKey: ["sessions"] });
    if (id === sessionId) navigate({ to: "/ask", replace: true });
  };

  const latest = [...(turns ?? [])].reverse().find((t) => t.result)?.result;
  const sources = view === "then-now" ? tnCitations : (latest?.citations ?? []);
  const setView = (v: string) =>
    navigate({
      to: ".",
      search: { view: v === "then-now" ? "then-now" : "answer" },
      replace: true,
    });

  return (
    <SiteLayout>
      <PageTitle
        title="Ask the Navigator"
        subtitle="Answers come only from archive documents, and every claim has a numbered citation. Use Then & Now to compare early predictions with later evidence."
      />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr_300px]">
        <aside aria-label="Saved chats" className="space-y-2">
          <Button onClick={newChat} className="w-full">
            <Plus className="mr-1 h-4 w-4" />
            New chat
          </Button>
          <p className="flex items-center gap-1 pt-2 text-xs font-semibold uppercase text-muted-foreground">
            <History className="h-3.5 w-3.5" />
            Saved chats
          </p>
          {sessions.data?.map((s) => (
            <SessionRow
              key={s.id}
              id={s.id}
              title={s.title}
              date={s.updatedAt}
              active={s.id === sessionId}
              onDelete={() => remove(s.id)}
              onRename={async (t) => {
                await renameSession(s.id, t);
                qc.invalidateQueries({ queryKey: ["sessions"] });
              }}
            />
          ))}
        </aside>

        <section className="min-w-0">
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="mb-4">
              <TabsTrigger value="answer">Answer</TabsTrigger>
              <TabsTrigger value="then-now">Then &amp; Now</TabsTrigger>
            </TabsList>
            <TabsContent value="answer" className="space-y-4" aria-live="polite">
              {turns === null && <Skeleton className="h-24 w-full" />}
              {turns?.length === 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {starters.map((s) => (
                    <Button
                      key={s}
                      variant="outline"
                      className="h-auto whitespace-normal py-3 text-left"
                      onClick={() => ask(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              )}
              {turns?.map((t, i) => (
                <div key={i} className="space-y-3">
                  <div className="ml-auto max-w-[85%] rounded-lg bg-primary px-4 py-3 text-primary-foreground">
                    {t.question}
                  </div>
                  <Card>
                    <CardContent className="p-4">
                      {!t.result && !t.error && (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-4/5" />
                        </div>
                      )}
                      {t.error && (
                        <p className="text-destructive">Something went wrong. Please try again.</p>
                      )}
                      {t.result && (
                        <>
                          <p className="leading-relaxed">
                            {t.result.answer.split(/(\[\d+\])/).map((part, j) => {
                              const n = part.match(/^\[(\d+)\]$/);
                              const c = n && t.result!.citations[Number(n[1]) - 1];
                              return c ? (
                                <Link
                                  key={j}
                                  to="/document/$submissionId"
                                  params={{ submissionId: c.submission_id }}
                                  search={{ highlight: c.excerpt }}
                                  className="mx-0.5 font-semibold text-accent underline"
                                  aria-label={`Citation ${n![1]}: ${c.title}, page ${c.page ?? 1}`}
                                >
                                  {part}
                                </Link>
                              ) : (
                                <span key={j}>{part}</span>
                              );
                            })}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {t.result.citations.length > 0 && (
                              <span className="flex items-center gap-1 text-sm font-medium text-success">
                                <ShieldCheck className="h-4 w-4" />
                                Verified against source
                              </span>
                            )}
                            <span className="flex-1" />
                            {matchThenNowTopic(t.question) && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setView("then-now")}
                              >
                                See Then &amp; Now
                              </Button>
                            )}
                            {t.result.citations.length > 0 && (
                              <BookmarkButton
                                type="answer"
                                refId={`${sessionId}#${i}`}
                                title={t.question}
                                citation={t.result.citations
                                  .map((c) => `${c.title} (${c.year}), p. ${c.page ?? 1}`)
                                  .join("; ")}
                              />
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void ask(q);
                }}
                className="flex gap-2"
              >
                <label htmlFor="question" className="sr-only">
                  Your question
                </label>
                <Textarea
                  ref={inputRef}
                  autoFocus
                  id="question"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ask about the archive…"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void ask(q);
                    }
                  }}
                />
                <Button type="submit" disabled={busy} aria-label="Send question">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="then-now">
              <ThenAndNowPanel topic={THEN_NOW_TOPICS[0]} onCitations={setTnCitations} />
            </TabsContent>
          </Tabs>
        </section>

        <aside aria-label="Sources and recent topics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-primary">Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {sources.length === 0 && (
                <p className="text-muted-foreground">Cited documents will appear here.</p>
              )}
              {sources.map((c, i) => (
                <Link
                  key={`${c.submission_id}-${i}`}
                  to="/document/$submissionId"
                  params={{ submissionId: c.submission_id }}
                  search={{ highlight: c.excerpt }}
                  className="block rounded-md border p-3 hover:bg-muted"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Badge className="bg-accent text-accent-foreground">[{i + 1}]</Badge>
                    <span className="text-xs text-muted-foreground">
                      {c.year} · p. {c.page ?? 1}
                    </span>
                  </div>
                  <p className="font-semibold text-primary">{c.title}</p>
                  <p className="mt-1 italic text-muted-foreground">“{c.excerpt}”</p>
                </Link>
              ))}
            </CardContent>
          </Card>
          <RecentTopics
            compact
            onAsk={(t) => void ask(`What does the archive say about ${t}?`)}
            onSearch={(t) => navigate({ to: "/", search: { q: t } })}
          />
        </aside>
      </div>
    </SiteLayout>
  );
}

function SessionRow({
  id,
  title,
  date,
  active,
  onDelete,
  onRename,
}: {
  id: string;
  title: string;
  date: number;
  active: boolean;
  onDelete: () => void;
  onRename: (t: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(title);
  return (
    <div
      className={`group flex items-center gap-1 rounded-md border p-2 text-sm ${active ? "border-primary bg-muted" : ""}`}
    >
      {editing ? (
        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            onRename(val.trim() || title);
            setEditing(false);
          }}
        >
          <Input
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => {
              onRename(val.trim() || title);
              setEditing(false);
            }}
            aria-label="Chat name"
            className="h-7"
          />
        </form>
      ) : (
        <Link to="/ask/$sessionId" params={{ sessionId: id }} className="min-w-0 flex-1">
          <span className="block truncate font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(date).toLocaleDateString()}
          </span>
        </Link>
      )}
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={() => {
          setVal(title);
          setEditing(true);
        }}
        aria-label={`Rename ${title}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={onDelete}
        aria-label={`Delete ${title}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
