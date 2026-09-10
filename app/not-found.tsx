import Link from "next/link";
import type { Metadata } from "next";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="site-container pb-20 pt-36 text-center">
      <p className="font-mono text-sm text-primary">404 / PAGE NOT FOUND</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
        Let’s get you back on track.
      </h1>
      <p className="my-3 text-muted-foreground">
        The page you requested does not exist or has been moved.
      </p>
      <Button asChild className="mt-4">
        <Link href={ROUTES.home}>Back to home</Link>
      </Button>
    </main>
  );
}
