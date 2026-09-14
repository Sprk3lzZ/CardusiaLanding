"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, clearSessionCookie, isAdmin, setSessionCookie } from "@/lib/auth";
import { deleteSubscriber } from "@/lib/db";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!process.env.ADMIN_PASSWORD) {
    return { error: "ADMIN_PASSWORD n'est pas défini dans .env." };
  }
  if (!checkPassword(password)) {
    return { error: "Mot de passe incorrect." };
  }
  await setSessionCookie();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin");
}

export async function removeSubscriber(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin");
  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) deleteSubscriber(id);
  revalidatePath("/admin");
}
