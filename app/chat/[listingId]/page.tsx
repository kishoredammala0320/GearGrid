import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getListingById } from "@/app/actions/listings";
import { getListingMessages } from "@/app/actions/messages";
import ChatBox from "@/components/ChatBox";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<{ recipientId?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const listing = await getListingById(resolvedParams.listingId);
  if (!listing) redirect("/");

  const targetUserId = resolvedSearchParams.recipientId || listing.owner.id;

  const { currentUser, messages } = await getListingMessages(
    resolvedParams.listingId,
    targetUserId
  );

  if (!currentUser) redirect("/");

  const isOwner = listing.owner.clerkId === userId;
  const otherRollNumber = isOwner ? "Buyer" : listing.owner.rollNumber;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <Link href={`/item/${listing.id}`} className="text-blue-600 hover:underline font-medium text-sm">
          &larr; Back to Gear Details
        </Link>
        <span className="font-semibold text-slate-800 text-sm truncate max-w-xs">
          Gear: {listing.title}
        </span>
      </header>

      <main className="max-w-2xl mx-auto py-8 px-4">
        <ChatBox
          listingId={listing.id}
          receiverId={targetUserId}
          currentUserId={currentUser.id}
          initialMessages={messages}
          otherRollNumber={otherRollNumber}
        />
      </main>
    </div>
  );
}