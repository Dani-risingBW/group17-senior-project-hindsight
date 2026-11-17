import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout, PageTitle } from "@/components/SiteLayout";
import { getThemeTrends } from "@/lib/api";
import { BookmarkButton } from "@/components/BookmarkButton";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Archive Timeline · Social Media Research Navigator" },
      {
        name: "description",
        content: "Research themes and overlooked communities across SMTCW conference years.",
      },
      { property: "og:title", content: "Archive Timeline" },
      { property: "og:description", content: "How research themes shifted from 2012 to 2024." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TimelinePage,
});

const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--accent)",
];

function TimelinePage() {
  const { data, isLoading } = useQuery({ queryKey: ["trends"], queryFn: getThemeTrends });
  const communities = data
    ? Object.keys(data.communitiesByYear[0] ?? {}).filter((k) => k !== "year")
    : [];
  return (
    <SiteLayout>
      <PageTitle
        title="Archive Timeline"
        subtitle="Conference years shown: 2012-2019, 2021 and 2024. There were no conferences in 2020, 2022 or 2023."
      />
      {isLoading && <Skeleton className="h-96 w-full" />}
      {data && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="font-serif text-primary">Research themes by year</CardTitle>
              <BookmarkButton
                type="trend"
                refId="timeline:themes"
                title="Research themes by year"
              />
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer>
                <LineChart data={data.byYear}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" type="category" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  {data.themes.map((t, i) => (
                    <Line key={t} dataKey={t} stroke={colors[i]} strokeWidth={2} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="font-serif text-primary">Overlooked communities</CardTitle>
              <BookmarkButton
                type="trend"
                refId="timeline:communities"
                title="Overlooked communities by year"
              />
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer>
                <BarChart data={data.communitiesByYear}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" type="category" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  {communities.map((c, i) => (
                    <Bar key={c} dataKey={c} stackId="a" fill={colors[i]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </SiteLayout>
  );
}
