import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/#features" className="hover:text-foreground">
              Features
            </Link>
            <Link href="/#analytics" className="hover:text-foreground">
              Analytics
            </Link>
            <Link href="/#privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href="/#create">Create a link</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} LinkMaker. Built for the web.</p>
          <div className="flex gap-4">
            <Link href="/methodology" className="hover:text-foreground">
              How it works
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/#create" className="hover:text-foreground">
              Create a link
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
