/**
 * The ONLY data access layer for the UI.
 * Backed by mock data today. Set VITE_API_BASE_URL to call a real backend;
 * each function documents the request/response shape the backend must match.
 */
import { mockRecords, type ArchiveRecord, type DocumentType } from "@/data/mockRecords";

const API_BASE = import.meta.env["VITE_API_BASE_URL"] as string | undefined;
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
}

/* ---------- Communities (derived from track + keywords) ---------- */
export const COMMUNITIES = [
  "HBCU students",
  "Black Twitter",
  "Rural users",
  "Older adults",
] as const;
export type Community = (typeof COMMUNITIES)[number];

export function getCommunities(r: ArchiveRecord): Community[] {
  const k = r.keywords.map((x) => x.toLowerCase());
  const out: Community[] = [];
  if (k.some((x) => x.includes("hbcu")) || r.full_text_content.includes("HBCU"))
    out.push("HBCU students");
  if (k.includes("black twitter")) out.push("Black Twitter");
  if (k.some((x) => x.includes("rural")) || /rural/i.test(r.full_text_content))
    out.push("Rural users");
  if (
    k.some((x) => x.includes("older")) ||
    /older (adults|voters|audiences)/i.test(r.full_text_content)
  )
    out.push("Older adults");
  return out;
}

/* ---------- searchArchive ---------- */
export interface SearchParams {
  query: string;
  years: number[];
  tracks: string[];
  communities: string[];
  documentTypes: DocumentType[];
  sort: "relevance" | "year-desc" | "year-asc";
}
export interface SearchResult {
  record: ArchiveRecord;
  score: number;
  communities: Community[];
}

function score(r: ArchiveRecord, terms: string[]) {
  if (!terms.length) return 1;
  let s = 0;
  for (const t of terms) {
    if (r.title.toLowerCase().includes(t)) s += 5;
    if (r.keywords.some((k) => k.toLowerCase().includes(t))) s += 3;
    if (r.abstract.toLowerCase().includes(t)) s += 2;
    if (r.full_text_content.toLowerCase().includes(t)) s += 1;
  }
  return s;
}
const tokenize = (q: string) =>
  q
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2);

/** POST /search  body: SearchParams  -> { results: SearchResult[], total: number } */
export async function searchArchive(
  p: SearchParams,
): Promise<{ results: SearchResult[]; total: number }> {
  if (API_BASE) return http("/search", { method: "POST", body: JSON.stringify(p) });
  await delay();
  const terms = tokenize(p.query);
  let results = mockRecords
    .map((record) => ({ record, score: score(record, terms), communities: getCommunities(record) }))
    .filter((x) => x.score > 0)
    .filter((x) => !p.years.length || p.years.includes(x.record.year))
    .filter((x) => !p.tracks.length || p.tracks.includes(x.record.track))
    .filter((x) => !p.documentTypes.length || p.documentTypes.includes(x.record.document_type))
    .filter((x) => !p.communities.length || x.communities.some((c) => p.communities.includes(c)));
  results = results.sort((a, b) =>
    p.sort === "year-asc"
      ? a.record.year - b.record.year
      : p.sort === "year-desc"
        ? b.record.year - a.record.year
        : b.score - a.score,
  );
  return { results, total: results.length };
}

/** GET /documents/:submission_id -> ArchiveRecord (404 if missing) */
export async function getDocument(id: string): Promise<ArchiveRecord | null> {
  if (API_BASE) return http(`/documents/${encodeURIComponent(id)}`);
  await delay(200);
  return mockRecords.find((r) => r.submission_id === id) ?? null;
}

/* ---------- askNavigator ---------- */
export interface Citation {
  submission_id: string;
  title: string;
  year: number;
  excerpt: string;
  relevance: number;
  /** Page (paragraph/slide) of the original document where the excerpt appears. */
  page?: number;
}

export const UNSUPPORTED_TOPIC =
  "The requested topic is not covered in the available conference records.";

function pageOf(r: ArchiveRecord, excerpt: string) {
  const i = r.full_text_content.split("\n\n").findIndex((p) => p.includes(excerpt));
  return i < 0 ? 1 : i + 1;
}
export interface NavigatorAnswer {
  answer: string;
  citations: Citation[];
}

function bestSentence(text: string, terms: string[]) {
  const sentences = text.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/);
  let best = sentences[0] ?? "";
  let bestScore = -1;
  for (const s of sentences) {
    const sc = terms.filter((t) => s.toLowerCase().includes(t)).length;
    if (sc > bestScore) {
      best = s;
      bestScore = sc;
    }
  }
  return best.replace(/^[A-Z0-9 ]+:\s*/, "");
}

/** POST /ask  body: { question: string } -> NavigatorAnswer. Answers must cite only archive docs. */
export async function askNavigator(question: string): Promise<NavigatorAnswer> {
  if (API_BASE) return http("/ask", { method: "POST", body: JSON.stringify({ question }) });
  await delay(900);
  const terms = tokenize(question);
  const ranked = mockRecords
    .map((r) => ({ r, s: score(r, terms) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);
  if (!ranked.length)
    return {
      answer: UNSUPPORTED_TOPIC,
      citations: [],
    };
  const max = ranked[0]?.s ?? 1;
  const citations = ranked.map(({ r, s }) => ({
    submission_id: r.submission_id,
    title: r.title,
    year: r.year,
    excerpt: bestSentence(r.full_text_content, terms),
    relevance: Math.round((s / max) * 100) / 100,
    page: pageOf(r, bestSentence(r.full_text_content, terms)),
  }));
  const answer =
    "Based on the archive: " +
    citations.map((c, i) => `In ${c.year}, researchers wrote: "${c.excerpt}" [${i + 1}]`).join(" ");
  return { answer, citations };
}

/** GET /trends -> { year, [theme]: count }[] and community counts per year */
export async function getThemeTrends(): Promise<{
  themes: string[];
  byYear: Record<string, number>[];
  communitiesByYear: Record<string, number>[];
}> {
  if (API_BASE) return http("/trends");
  await delay();
  const { CONFERENCE_YEARS } = await import("@/data/mockRecords");
  const themes = [
    "Twitter",
    "feed algorithms",
    "misinformation",
    "platform adoption",
    "research ethics",
    "journalism",
  ];
  const byYear = CONFERENCE_YEARS.map((year) => {
    const row: Record<string, number> = { year };
    for (const t of themes)
      row[t] = mockRecords.filter((r) => r.year === year && r.keywords.includes(t)).length;
    return row;
  });
  const communitiesByYear = CONFERENCE_YEARS.map((year) => {
    const row: Record<string, number> = { year };
    for (const c of COMMUNITIES)
      row[c] = mockRecords.filter((r) => r.year === year && getCommunities(r).includes(c)).length;
    return row;
  });
  return { themes, byYear, communitiesByYear };
}

/* ---------- getThenAndNow ---------- */
export const THEN_NOW_TOPICS = ["Twitter feed algorithms"] as const;
export type Verdict = "Confirmed" | "Partly confirmed" | "Not confirmed";
export interface Milestone {
  year: number;
  kind: "Prediction" | "Evidence" | "Shift";
  claim: string;
  verdict?: Verdict;
  verdictSource?: Citation;
  source: Citation;
}
export interface ThenAndNow {
  topic: string;
  milestones: Milestone[];
  aiShift: { text: string; source: Citation }[];
  metric: { label: string; year: number; value: number; source: Citation }[];
  summary: { sentence: string; source: Citation }[];
}
const cite = (id: string, excerpt: string): Citation => {
  const r = mockRecords.find((x) => x.submission_id === id)!;
  return {
    submission_id: id,
    title: r.title,
    year: r.year,
    excerpt,
    relevance: 1,
    page: pageOf(r, excerpt),
  };
};

const FEED_KEYWORDS = [
  "feed",
  "algorithm",
  "ranking",
  "ranked",
  "timeline",
  "recommendation",
  "for you",
];
/** Returns the Then & Now topic a question relates to, or null. */
export function matchThenNowTopic(question: string): string | null {
  const q = question.toLowerCase();
  return FEED_KEYWORDS.some((k) => q.includes(k)) ? "Twitter feed algorithms" : null;
}

/** GET /then-and-now?topic=... -> ThenAndNow (null if topic unsupported) */
export async function getThenAndNow(topic: string): Promise<ThenAndNow | null> {
  if (API_BASE) return http(`/then-and-now?topic=${encodeURIComponent(topic)}`);
  await delay(400);
  if (topic !== "Twitter feed algorithms") return null;
  const c2012 = cite(
    "SMTCW-2012-007",
    "We expect that this openness will persist as adoption grows",
  );
  const c2015 = cite(
    "SMTCW-2015-042",
    "concentrating visibility among accounts that already have large followings",
  );
  const c2016 = cite(
    "SMTCW-2016-027",
    "We predict that community hashtags such as those used by Black Twitter will lose reach unless they generate high early engagement.",
  );
  const c2019 = cite(
    "SMTCW-2019-024",
    "the top 10 percent of accounts received 62 percent of impressions",
  );
  const c2021 = cite(
    "SMTCW-2021-025",
    "the top 10 percent of accounts received 71 percent of impressions in ranked timelines",
  );
  const c2021b = cite(
    "SMTCW-2021-025",
    "Black Twitter hashtags still trended when they gathered strong early engagement",
  );
  const c2021c = cite(
    "SMTCW-2021-025",
    "Recommended content from outside the follow graph began to appear in timelines",
  );
  const c2024 = cite("SMTCW-2024-004", "54 percent of impressions came from unfollowed accounts");
  const c2024b = cite(
    "SMTCW-2024-004",
    "This goes further than 2015 predictions, which anticipated ranking within the follow graph rather than replacement of it.",
  );
  return {
    topic,
    milestones: [
      {
        year: 2012,
        kind: "Prediction",
        claim:
          "Chronological feeds give every voice equal visibility, and that openness will last as Twitter grows.",
        verdict: "Not confirmed",
        verdictSource: c2019,
        source: c2012,
      },
      {
        year: 2015,
        kind: "Prediction",
        claim: "Ranked feeds will concentrate attention among accounts that are already popular.",
        verdict: "Confirmed",
        verdictSource: c2019,
        source: c2015,
      },
      {
        year: 2016,
        kind: "Prediction",
        claim:
          "Community hashtags like Black Twitter's will lose reach unless they get fast early engagement.",
        verdict: "Partly confirmed",
        verdictSource: c2021b,
        source: c2016,
      },
      {
        year: 2019,
        kind: "Evidence",
        claim:
          "The top 10% of accounts got 62% of impressions in ranked feeds, versus 41% in chronological feeds.",
        source: c2019,
      },
      {
        year: 2021,
        kind: "Evidence",
        claim: "Concentration kept rising: the top 10% of accounts got 71% of impressions.",
        source: c2021,
      },
      {
        year: 2024,
        kind: "Shift",
        claim:
          "AI recommendation took over: 54% of impressions came from accounts users do not follow.",
        source: c2024,
      },
    ],
    aiShift: [
      {
        text: "Early researchers expected ranking inside the follow graph; modern AI feeds replace the follow graph.",
        source: c2024b,
      },
      {
        text: "The first signs of out-of-network recommendations appeared in 2021 audits.",
        source: c2021c,
      },
    ],
    metric: [
      { label: "2019 chronological", year: 2019, value: 41, source: c2019 },
      { label: "2019 ranked", year: 2019, value: 62, source: c2019 },
      { label: "2021 ranked", year: 2021, value: 71, source: c2021 },
    ],
    summary: [
      { sentence: "In 2012, researchers expected chronological openness to last.", source: c2012 },
      {
        sentence:
          "By 2015 they predicted ranking would concentrate visibility, which 2019 and 2021 audits confirmed.",
        source: c2019,
      },
      {
        sentence: "The 2016 worry about community hashtags was only partly borne out.",
        source: c2021b,
      },
      {
        sentence:
          "By 2024, AI recommendation went further than anyone predicted, replacing the follow graph itself.",
        source: c2024b,
      },
    ],
  };
}

/* ---------- getRecentTopics ---------- */
export interface RecentTopic {
  name: string;
  count: number;
  trend: "up" | "down" | "flat";
}
/** GET /topics/recent?year= -> { year, topics }. year "all" = whole archive. */
export async function getRecentTopics(
  year: number | "all" = 2024,
): Promise<{ year: number | "all"; topics: RecentTopic[] }> {
  if (API_BASE) return http(`/topics/recent?year=${year}`);
  await delay(250);
  const { CONFERENCE_YEARS } = await import("@/data/mockRecords");
  const valid = CONFERENCE_YEARS as readonly number[];
  const inYear = mockRecords.filter(
    (r) => valid.includes(r.year) && (year === "all" || r.year === year),
  );
  const earlier = year === "all" ? [] : mockRecords.filter((r) => r.year < year);
  const counts = new Map<string, number>();
  for (const r of inYear) for (const k of r.keywords) counts.set(k, (counts.get(k) ?? 0) + 1);
  const earlierYears = new Set(earlier.map((r) => r.year)).size || 1;
  const topics = [...counts.entries()]
    .map(([name, count]) => {
      if (year === "all") return { name, count, trend: "flat" as const };
      const avg = earlier.filter((r) => r.keywords.includes(name)).length / earlierYears;
      return {
        name,
        count,
        trend: (count > avg ? "up" : count < avg ? "down" : "flat") as RecentTopic["trend"],
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8);
  return { year, topics };
}

/* ---------- Browser storage (until accounts + backend exist) ---------- */
function readStore<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}
function writeStore<T>(key: string, v: T[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(v));
}
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/* ---------- Saved items (bookmarks) ---------- */
export type SavedType = "document" | "answer" | "trend";
export interface SavedItem {
  id: string;
  type: SavedType;
  refId: string;
  title: string;
  year?: number | undefined;
  note?: string | undefined;
  citation?: string | undefined;
  savedAt: number;
}
const SAVED_KEY = "hindsight.saved";
/** GET /saved */
export async function getSavedItems(): Promise<SavedItem[]> {
  if (API_BASE) return http("/saved");
  return readStore<SavedItem>(SAVED_KEY).sort((a, b) => b.savedAt - a.savedAt);
}
/** POST /saved */
export async function saveItem(i: Omit<SavedItem, "id" | "savedAt">): Promise<SavedItem> {
  if (API_BASE) return http("/saved", { method: "POST", body: JSON.stringify(i) });
  const all = readStore<SavedItem>(SAVED_KEY);
  const existing = all.find((x) => x.type === i.type && x.refId === i.refId);
  if (existing) return existing;
  const item = { ...i, id: uid(), savedAt: Date.now() };
  writeStore(SAVED_KEY, [...all, item]);
  return item;
}
/** PATCH /saved/:id */
export async function updateSavedNote(id: string, note: string): Promise<void> {
  if (API_BASE) return http(`/saved/${id}`, { method: "PATCH", body: JSON.stringify({ note }) });
  writeStore(
    SAVED_KEY,
    readStore<SavedItem>(SAVED_KEY).map((x) => (x.id === id ? { ...x, note } : x)),
  );
}
/** DELETE /saved/:id */
export async function removeSavedItem(id: string): Promise<void> {
  if (API_BASE) return http(`/saved/${id}`, { method: "DELETE" });
  writeStore(
    SAVED_KEY,
    readStore<SavedItem>(SAVED_KEY).filter((x) => x.id !== id),
  );
}

/* ---------- Chat sessions ---------- */
export interface ChatTurn {
  question: string;
  result?: NavigatorAnswer;
  error?: boolean;
}
export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  turns: ChatTurn[];
}
const SESS_KEY = "hindsight.sessions";
/** GET /sessions */
export async function listSessions(): Promise<ChatSession[]> {
  if (API_BASE) return http("/sessions");
  return readStore<ChatSession>(SESS_KEY).sort((a, b) => b.updatedAt - a.updatedAt);
}
/** GET /sessions/:id */
export async function getSession(id: string): Promise<ChatSession | null> {
  if (API_BASE) return http(`/sessions/${id}`);
  return readStore<ChatSession>(SESS_KEY).find((s) => s.id === id) ?? null;
}
/** POST /sessions. Reuses an existing empty session so reloads never pile up blank chats. */
export async function createSession(): Promise<ChatSession> {
  if (API_BASE) return http("/sessions", { method: "POST" });
  const all = readStore<ChatSession>(SESS_KEY);
  const blank = all.find((s) => s.turns.length === 0);
  if (blank) return blank;
  const now = Date.now();
  const s: ChatSession = {
    id: uid(),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    turns: [],
  };
  writeStore(SESS_KEY, [...all, s]);
  return s;
}
/** PUT /sessions/:id/turns  body: ChatTurn[] */
export async function saveTurns(id: string, turns: ChatTurn[]): Promise<void> {
  if (API_BASE)
    return http(`/sessions/${id}/turns`, { method: "PUT", body: JSON.stringify(turns) });
  writeStore(
    SESS_KEY,
    readStore<ChatSession>(SESS_KEY).map((s) =>
      s.id === id
        ? {
            ...s,
            turns,
            updatedAt: Date.now(),
            title: s.title === "New chat" && turns[0] ? turns[0].question.slice(0, 60) : s.title,
          }
        : s,
    ),
  );
}
/** PATCH /sessions/:id */
export async function renameSession(id: string, title: string): Promise<void> {
  if (API_BASE)
    return http(`/sessions/${id}`, { method: "PATCH", body: JSON.stringify({ title }) });
  writeStore(
    SESS_KEY,
    readStore<ChatSession>(SESS_KEY).map((s) => (s.id === id ? { ...s, title } : s)),
  );
}
/** DELETE /sessions/:id */
export async function deleteSession(id: string): Promise<void> {
  if (API_BASE) return http(`/sessions/${id}`, { method: "DELETE" });
  writeStore(
    SESS_KEY,
    readStore<ChatSession>(SESS_KEY).filter((s) => s.id !== id),
  );
}

export function formatCitation(r: ArchiveRecord) {
  const authors = r.authors.map((a) => a.name).join(", ");
  return `${authors} (${r.year}). ${r.title} [${r.document_type}]. Social Media Technology Conference and Workshop, Cathy Hughes School of Communications, Howard University. ${r.submission_id}.`;
}
