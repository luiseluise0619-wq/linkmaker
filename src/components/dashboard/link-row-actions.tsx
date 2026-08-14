"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Power,
  QrCode,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteLinkAction, setStatusAction } from "@/lib/actions/links";

interface Props {
  id: string;
  slug: string;
  shortUrl: string;
  disabled: boolean;
}

export function LinkRowActions({ id, slug, shortUrl, disabled }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [qrOpen, setQrOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast("Short URL copied", "success");
    } catch {
      toast("Could not copy", "error");
    }
  }

  async function toggleStatus() {
    setPending(true);
    const res = await setStatusAction(id, !disabled);
    setPending(false);
    if (res.ok) {
      toast(disabled ? "Link enabled" : "Link disabled", "success");
      router.refresh();
    } else {
      toast(res.error ?? "Could not update", "error");
    }
  }

  async function remove() {
    setPending(true);
    const res = await deleteLinkAction(id);
    setPending(false);
    setConfirmOpen(false);
    if (res.ok) {
      toast("Link deleted", "success");
      router.refresh();
    } else {
      toast(res.error ?? "Could not delete", "error");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => router.push(`/dashboard/links/${slug}`)}>
            <BarChart3 />
            Analytics
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => router.push(`/dashboard/links/${slug}/edit`)}
          >
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={copy}>
            <Copy />
            Copy URL
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setQrOpen(true)}>
            <QrCode />
            QR code
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              Open
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={toggleStatus} disabled={pending}>
            <Power />
            {disabled ? "Enable" : "Disable"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setConfirmOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden QR dialog controlled from the menu */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR code</DialogTitle>
            <DialogDescription>
              Encodes the short URL. Changing the destination never breaks it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/links/${id}/qr`}
              alt="QR code"
              width={220}
              height={220}
              className="rounded-lg border bg-white p-2"
            />
            <div className="flex w-full gap-2">
              <Button asChild variant="outline" className="flex-1">
                <a href={`/api/links/${id}/qr?download=1`} download>
                  Download PNG
                </a>
              </Button>
              <Button variant="outline" className="flex-1" onClick={copy}>
                Copy URL
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this link?</DialogTitle>
            <DialogDescription>
              This permanently deletes the link and all of its analytics. The
              short URL will stop working. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={remove} disabled={pending}>
              {pending ? "Deleting…" : "Delete link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
