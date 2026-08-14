import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/nav";
import { UserMenu } from "@/components/dashboard/user-menu";
import { MobileNav } from "@/components/dashboard/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Logo href="/dashboard" />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <DashboardNav />
        </div>
        <div className="border-t p-3">
          <Button asChild className="w-full">
            <Link href="/dashboard/links/new">
              <Plus />
              New link
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-col md:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-2">
            <MobileNav />
            <span className="text-sm font-medium text-muted-foreground md:hidden">
              LinkMaker
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu name={user.name} email={user.email} />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
