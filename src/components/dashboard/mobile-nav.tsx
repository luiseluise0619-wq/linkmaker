"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useT } from "@/lib/i18n/client";
import { DashboardNav } from "./nav";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={t("nav.openMenu")}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="left-0 top-0 h-full max-w-[16rem] translate-x-0 translate-y-0 rounded-none border-r p-0 sm:rounded-none">
        <DialogTitle className="sr-only">{t("nav.navigation")}</DialogTitle>
        <div className="flex h-16 items-center border-b px-4">
          <Logo href="/dashboard" />
        </div>
        <div className="p-3">
          <DashboardNav onNavigate={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
