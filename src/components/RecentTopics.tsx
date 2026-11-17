import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkButton } from "@/components/BookmarkButton";
import { getRecentTopics } from "@/lib/api";

const YEARS = [2024, 2021, "all"] as const;

export function RecentTopics({ onAsk, onSearch, compact }: { onAsk: (topic: string) => void; onSearch: (topic: string) => void; compact?: boolean }) {
  const [year, setYear] = useState<(typeof YEARS)[number]>(2024);
  const { data, isLoading } = useQuery({ queryKey: ["recent", year], queryFn: () => getRecentTopics(year) });
  const topics = compact ? data?.topics.slice(0, 5) : data?.topics;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-primary">Recent topics</CardTitle>
        <div role="group" aria-label="Choose year" className="flex gap-1">
          {YEARS.map((y) => (
            <Button key={y} size="sm" variant={y === year ? "default" : "outline"} aria-pressed={y === year} onClick={() => setYear(y)}>
              {y === "all" ? "All years" : y}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isLoading && <Skeleton className="h-32 w-full" />}
        {topics?.map((t) => {
          const Trend = t.trend === "up" ? ArrowUp : t.trend === "down" ? ArrowDown : ArrowRight;
          return (
            <div key={t.name} className="flex items-center gap-2 rounded-md border p-2">
              <Trend className={`h-4 w-4 shrink-0 ${t.trend === "up" ? "text-success" : t.trend === "down" ? "text-destructive" : "text-muted-foreground"}`} aria-label={`Trend ${t.trend}`} />
              <span className="flex-1 font-medium">{t.name} <span className="text-muted-foreground">({t.count})</span></span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onAsk(t.name)} aria-label={`Ask about ${t.name}`}><MessageSquare className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onSearch(t.name)} aria-label={`Search for ${t.name}`}><Search className="h-4 w-4" /></Button>
              {!compact && <BookmarkButton size="icon" className="h-7 w-7" type="trend" refId={`recent:${t.name}`} title={`Recent topic: ${t.name}`} year={typeof year === "number" ? year : undefined} />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
