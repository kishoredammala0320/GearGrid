"use server";

import { auth, currentUser as getClerkUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getOrCreateCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  let user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    const clerkUser = await getClerkUser();
    const primaryEmail = clerkUser?.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) return null;

    const rollNumber = primaryEmail.split("@")[0].toUpperCase();

    user = await db.user.create({
      data: {
        clerkId: userId,
        email: primaryEmail,
        rollNumber: rollNumber,
      },
    });
  }

  return user;
}

export async function sendMessage(listingId: string, receiverId: string, text: string) {
  const sender = await getOrCreateCurrentUser();
  if (!sender) throw new Error("Unauthorized or User record not found");

  if (!text || text.trim() === "") {
    throw new Error("Message cannot be empty.");
  }

  const message = await db.message.create({
    data: {
      text: text.trim(),
      listingId,
      senderId: sender.id,
      receiverId,
      isRead: false,
    },
  });

  revalidatePath(`/chat/${listingId}`);
  revalidatePath(`/inbox`);
  revalidatePath(`/`);
  return message;
}

export async function getListingMessages(listingId: string, otherUserId: string) {
  const currentUser = await getOrCreateCurrentUser();

  if (!currentUser) return { currentUser: null, messages: [] };

  // Mark all incoming unread messages in this thread as READ
  await db.message.updateMany({
    where: {
      listingId,
      senderId: otherUserId,
      receiverId: currentUser.id,
      isRead: false,
    },
    data: { isRead: true },
  });

  const messages = await db.message.findMany({
    where: {
      listingId,
      OR: [
        { senderId: currentUser.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUser.id },
      ],
    },
    include: {
      sender: { select: { id: true, rollNumber: true, email: true } },
      receiver: { select: { id: true, rollNumber: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return { currentUser, messages };
}

export async function getInboxThreads() {
  await smartCleanupMessages();

  const currentUser = await getOrCreateCurrentUser();
  if (!currentUser) return [];

  const messages = await db.message.findMany({
    where: {
      OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }],
    },
    include: {
      listing: true,
      sender: { select: { id: true, rollNumber: true } },
      receiver: { select: { id: true, rollNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const threadsMap = new Map();

  for (const msg of messages) {
    const otherUser = msg.senderId === currentUser.id ? msg.receiver : msg.sender;
    const threadKey = `${msg.listingId}_${otherUser.id}`;

    if (!threadsMap.has(threadKey)) {
      threadsMap.set(threadKey, {
        listing: msg.listing,
        otherUser,
        lastMessage: msg,
        unreadCount: 0,
      });
    }

    // Count unread messages sent TO currentUser
    if (msg.receiverId === currentUser.id && !msg.isRead) {
      const thread = threadsMap.get(threadKey);
      thread.unreadCount += 1;
    }
  }

  return Array.from(threadsMap.values());
}

export async function getUnreadCount() {
  const currentUser = await getOrCreateCurrentUser();
  if (!currentUser) return 0;

  return await db.message.count({
    where: {
      receiverId: currentUser.id,
      isRead: false,
    },
  });
}

export async function smartCleanupMessages() {
  const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const FOURTEEN_DAYS_AGO = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  await db.message.deleteMany({
    where: {
      createdAt: { lt: THIRTY_DAYS_AGO },
      listing: { status: "ACTIVE" },
    },
  });

  await db.message.deleteMany({
    where: {
      createdAt: { lt: FOURTEEN_DAYS_AGO },
      listing: { status: "RENTED_SOLD" },
    },
  });
}