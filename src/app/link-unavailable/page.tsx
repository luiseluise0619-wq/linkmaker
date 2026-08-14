import Link from "next/link";
import { AlertTriangle, Ban, Clock, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export const dynamic = "force-dynamic";

const REASONS: Record<
  string,
  { icon: React.ElementType; title: string; body: string }
> = {
  notfound: {
    icon: SearchX,
    title: "Link not found",
    body: "This short link doesn't exist. It may have been deleted or the URL was mistyped.",
  },
  disabled: {
    icon: Ban,
    title: "Link disabled",
    body: "The owner has temporarily disabled this link. Please check back later.",
  },
  expired: {
    icon: Clock,
    title: "Link expired",
    body: "This link has passed its expiration date and no longer redirects.",
  },
};

export default function LinkUnavailablePage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const reason = searchParams.reason ?? "notfound";
  const info = REASONS[reason] ?? {
    icon: AlertTriangle,
    title: "Link unavailable",
    body: "This link can't be opened right now.",
  };
  const Icon = info.icon;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main className="container flex flex-1 items-center justify-center py-20">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            {info.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{info.body}</p>
          <Button asChild className="mt-6">
            <Link href="/">Go to homepage</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
