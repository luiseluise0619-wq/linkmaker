import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main className="container flex flex-1 items-center justify-center py-20">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="mt-2 text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Back to homepage</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
