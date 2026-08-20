"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { resetMetricsAction } from "@/lib/actions/workspace";

export function ResetMetricsButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function reset() {
    setPending(true);
    const res = await resetMetricsAction();
    setPending(false);
    setOpen(false);
    if (res.ok) {
      const n = (res.data as { deleted: number } | undefined)?.deleted ?? 0;
      toast(`Analytics reset — ${n} events cleared`, "success");
      router.refresh();
    } else {
      toast(res.error ?? "Could not reset analytics", "error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <RotateCcw />
          Reset all analytics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reset all analytics?</DialogTitle>
          <DialogDescription>
            This permanently deletes every recorded click event for all of your
            links, setting all numbers back to zero. Your links keep working —
            only the analytics are cleared. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={reset} disabled={pending}>
            {pending ? "Resetting…" : "Reset analytics"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
