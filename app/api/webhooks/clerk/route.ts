// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/server";
import { users } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env file");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error: Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error verifying webhook", { status: 400 });
  }

  // Handle the different webhook events
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, name, image } = evt.data;

    // Insert the new user into the database
    await db.insert(users).values({
      clerkId: id,
      email: email_addresses[0].email_address,
      name,
      image,
    });
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, name, image } = evt.data;

    // Update the user in the database
    await db
      .update(users)
      .set({
        email: email_addresses[0].email_address,
        name,
        image,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, id));
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    // Delete the user from the database
    await db.delete(users).where(eq(users.clerkId, id));
  }

  return new NextResponse("Webhook received", { status: 200 });
}
