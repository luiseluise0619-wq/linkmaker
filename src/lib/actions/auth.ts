"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations";

export interface AuthState {
  error?: string;
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }
  const { name, email, password } = parsed.data;
  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
      select: { id: true, email: true, name: true },
    });
    await createSession(user);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "An account with that email already exists." };
    }
    return { error: "Could not create your account. Please try again." };
  }
  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  // Constant-ish work regardless of user existence to avoid trivial enumeration.
  const ok = user
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, "$2a$12$invalidinvalidinvalidinvalidinva");
  if (!user || !ok) {
    return { error: "Invalid email or password." };
  }
  await createSession({ id: user.id, email: user.email, name: user.name });
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
