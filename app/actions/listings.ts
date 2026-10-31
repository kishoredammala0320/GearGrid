"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { ListingType, ListingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createListing(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 1. Try to fetch user from Neon PostgreSQL
  let user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  // 2. JIT Fallback: If missing from DB, auto-create from Clerk profile on the fly
  if (!user) {
    const clerkUser = await currentUser();
    const primaryEmail = clerkUser?.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      throw new Error("No primary email found on user account.");
    }

    const rollNumber = primaryEmail.split("@")[0].toUpperCase();

    user = await db.user.create({
      data: {
        clerkId: userId,
        email: primaryEmail,
        rollNumber: rollNumber,
      },
    });
  }

  // 3. Extract listing data from form
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const type = formData.get("type") as ListingType; // RENT or SELL
  const microLocation = formData.get("microLocation") as string;
  const imageUrl = (formData.get("imageUrl") as string) || null;
  const price = parseFloat(formData.get("price") as string);
  const securityDeposit = formData.get("securityDeposit")
    ? parseFloat(formData.get("securityDeposit") as string)
    : null;

  // 4. Save listing into Neon
  await db.listing.create({
    data: {
      title,
      category,
      type,
      microLocation,
      imageUrl,
      ownerId: user.id,
      status: ListingStatus.ACTIVE,
      pricePerDay: type === ListingType.RENT ? price : null,
      sellPrice: type === ListingType.SELL ? price : null,
      securityDeposit: type === ListingType.RENT ? securityDeposit : null,
    },
  });

  // 5. Refresh the home feed and redirect the user there
  revalidatePath("/");
  redirect("/");
}

export async function getActiveListings(searchQuery?: string, categoryFilter?: string) {
  const whereClause: any = { status: ListingStatus.ACTIVE };

  if (searchQuery) {
    whereClause.title = { contains: searchQuery, mode: "insensitive" };
  }

  if (categoryFilter && categoryFilter !== "All") {
    whereClause.category = categoryFilter;
  }

  return await db.listing.findMany({
    where: whereClause,
    include: {
      owner: {
        select: { id: true, rollNumber: true, email: true, clerkId: true }, // Added id: true
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getListingById(id: string) {
  return await db.listing.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, rollNumber: true, email: true, clerkId: true }, // Added id: true
      },
    },
  });
}

export async function getMyListings() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await db.listing.findMany({
    where: { owner: { clerkId: userId } },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteListing(listingId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    include: { owner: true },
  });

  if (listing?.owner.clerkId !== userId) {
    throw new Error("Not authorized to delete this listing");
  }

  await db.listing.delete({
    where: { id: listingId },
  });

  revalidatePath("/");
  revalidatePath("/my-listings");
}