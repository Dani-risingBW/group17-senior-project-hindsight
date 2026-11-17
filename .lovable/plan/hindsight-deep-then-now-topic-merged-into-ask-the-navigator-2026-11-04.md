# HindSight: Deep "Then & Now" topic, merged into Ask the Navigator, plus a Recent Topics tool

## Goals (refined)

1. **Develop one Then & Now topic in depth** instead of three thin ones. Topic: **Twitter feed algorithms** (it already has the strongest prediction-to-evidence chain: 2012 chronological feeds, 2015 ranking forecast, 2019 measured concentration, 2024 AI recommendation).
2. **Merge Then & Now into Ask the Navigator** so one page answers questions and, when a question touches a comparison topic, shows the Then & Now view alongside the answer. The standalone Then & Now page goes away.
3. **Add a "Recent Topics" tool** that shows what the most recent conference years (2024, then 2021) focused on, so users can start from current themes.

## 1. Deep Then & Now topic: Twitter feed algorithms

- Structured timeline of milestones, one per archive year that has evidence (only 2012–2019, 2021, 2024; never 2020, 2022, 2023).
- Each milestone: year, type (Prediction / Evidence / Shift), one-sentence claim, cited source (title, year, page) linking to the document with the quote highlighted.
- Verdict per prediction: Confirmed / Partly confirmed / Not confirmed, with the evidence citation that decides it.
- "What modern AI changed" section: how 2024 recommendation systems differ from what 2012–2015 researchers expected.
- Small chart: share of impressions to top accounts over time (only years with cited numbers).
- Summary paragraph where every sentence has an inline citation.
- Add 2–3 more synthetic records (e.g. 2016, 2017, 2021) so the timeline has enough points; mark them synthetic.

## 2. Merge into Ask the Navigator

- Ask page gets two modes via tabs: **Answer** (current chat) and **Then & Now**.
- When a question matches a comparison topic (e.g. mentions "feed", "algorithm", "ranking"), the answer card shows a "See Then & Now" button that switches to the tab for that topic.
- Starter prompt added: "How did predictions about Twitter feed algorithms hold up?"
- Sources panel stays on the right and lists citations from whichever tab is active.
- Remove "Then & Now" from the top navigation; `/then-and-now` redirects to `/ask?view=then-now`.
- Unsupported topics still return exactly: "The requested topic is not covered in the available conference records."

## 3. Recent Topics tool

- A panel on the Ask page (and a compact version on the Search home page) titled "Recent topics".
- Lists the top themes from the latest archive year (2024), then 2021, with document counts and a trend arrow versus earlier years.
- Clicking a topic either runs an Ask question about it or opens Search filtered to it (user picks via two small buttons).
- Option to choose year: 2024 / 2021 / All years.

## Out of scope

- Real AI model, real archive data, user accounts (saved items stay in this browser until logins are added).

## 4. Saved items (bookmarks)

- Bookmark button on documents, Ask answers, Then & Now topics, Recent Topics, and Timeline charts.
- New "Saved" page in the top navigation that lists bookmarks grouped by Documents, Answers, and Trends, each with title, year, and a link back to it.
- Remove a bookmark, add a short personal note, and copy all saved citations at once.
- Technical: `getSavedItems`, `saveItem({type, refId, title, year, note?})`, `removeSavedItem(id)` in `src/lib/api.ts` (browser storage now, `GET/POST/DELETE /saved` later); new route `src/routes/saved.tsx`; shared `BookmarkButton` component.

## 5. Saved chat sessions

- Every Ask conversation is saved automatically as its own session and survives page reloads.
- Session list on the left of the Ask page: title (from the first question), date, rename, delete, and a "New chat" button.
- Each session has its own link, so reopening or sharing the link restores that exact conversation and its citations.
- Saved sessions also appear in the "Saved" page under a Chats group.
- Technical: `listSessions`, `getSession(id)`, `createSession`, `appendTurn(id, turn)`, `renameSession`, `deleteSession` in `src/lib/api.ts` (browser storage now, `/sessions` endpoints later); new route `src/routes/ask.$sessionId.tsx`; `/ask` opens the latest session or creates one; no duplicate empty sessions on load.

## Technical details

- Keep all data access in `src/lib/api.ts`. New/changed functions:
  - `getThenAndNow(topic)` returns `{ topic, milestones: {year, kind, claim, verdict?, source: Citation & {page}}[], aiShift: {text, source}[], metric: {year, value, source}[], summary: {sentence, source}[] }`. Endpoint `GET /then-and-now?topic=`.
  - `matchThenNowTopic(question): string | null` for the "See Then & Now" link.
  - `getRecentTopics(year?: number)` returns `{ year, topics: {name, count, trend: "up"|"down"|"flat"}[] }`. Endpoint `GET /topics/recent?year=`.
- Add `page` to `Citation` and records so citations show title, year, page.
- `src/routes/ask.tsx`: add `validateSearch` for `view` (`answer` | `then-now`) and `topic`; shadcn Tabs; move Then & Now UI into `src/components/ThenAndNowPanel.tsx`; add `src/components/RecentTopics.tsx`.
- `src/routes/then-and-now.tsx`: replace with a `beforeLoad` redirect to `/ask`.
- `SiteLayout.tsx`: remove the nav item.
- Add a small test for `matchThenNowTopic` and that `getRecentTopics` never returns 2020/2022/2023.
