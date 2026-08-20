"use server";

import { redirect } from "next/navigation";
import { destroySession } from "@/lib/auth";

/**
 * There is no login in LinkMaker — every workspace is anonymous and reachable
 * via its dashboard link. "Sign out" simply clears the current session; the
 * workspace itself stays reachable through its saved dashboard link.
 */
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
