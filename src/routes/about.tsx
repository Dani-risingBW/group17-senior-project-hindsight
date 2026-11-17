import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { SiteLayout, PageTitle } from "@/components/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Social Media Research Navigator" },
      { name: "description", content: "Purpose, team HindSight, and the ethics behind grounded, verifiable answers." },
      { property: "og:title", content: "About the Social Media Research Navigator" },
      { property: "og:description", content: "Built by Team HindSight for the Cathy Hughes School of Communications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageTitle title="About the Navigator" />
      <div className="grid max-w-3xl gap-6">
        <section>
          <h2 className="font-serif text-xl font-bold text-primary">Purpose</h2>
          <p className="mt-2">The Social Media Research Navigator makes a decade of Social Media Technology Conference and Workshop materials from the Cathy Hughes School of Communications searchable and explainable. It preserves institutional knowledge and helps scholars trace how ideas about social media have evolved.</p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-bold text-primary">The team</h2>
          <p className="mt-2">Built by <strong>Team HindSight</strong>. Product owner: <strong>Dr. Ingrid Sturgis</strong>.</p>
        </section>
        <Card className="border-accent">
          <CardContent className="p-5">
            <h2 className="font-serif text-xl font-bold text-accent">Ethics: grounded, verifiable answers</h2>
            <p className="mt-2">Every AI answer must point to the original document and passage it came from. When the archive does not contain an answer, the Navigator says so rather than guessing. Research on communities such as HBCU students and Black Twitter is presented with context and respect for the people behind the data.</p>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
