import { createFileRoute, redirect } from "@tanstack/react-router";

// Then & Now now lives inside Ask the Navigator; keep the old link working.
export const Route = createFileRoute("/then-and-now")({
  beforeLoad: () => {
    throw redirect({ to: "/ask", search: { view: "then-now" }, statusCode: 301 });
  },
});
