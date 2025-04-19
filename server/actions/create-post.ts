"use server";

import { db } from "@/server";
import { posts } from "@/server/schema";
import { revalidatePath } from "next/cache";

export default async function createPost(formData: FormData) {
  const title = formData.get("title")?.toString();

  if (!title) {
    throw new Error("Title is required");
  }

  await db.insert(posts).values({ title });

  revalidatePath("/");
}
