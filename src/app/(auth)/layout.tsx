import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSessionUser } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  // Full accounts skip auth pages; guests may visit /register to upgrade.
  if (user && !user.isGuest) redirect("/dashboard");
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
      </header>
      <main className="container flex flex-1 items-center justify-center py-12">
        {children}
      </main>
    </div>
  );
}
