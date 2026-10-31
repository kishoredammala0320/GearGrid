import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getListingById } from "@/app/actions/listings";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const resolvedParams = await params;
  const listing = await getListingById(resolvedParams.id);

  if (!listing) {
    notFound();
  }

  const isOwner = listing.owner.clerkId === userId;
  const price = listing.type === "RENT" ? listing.pricePerDay : listing.sellPrice;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Clean Navigation Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
        >
          &larr; Back to Feed
        </Link>
        <UserButton />
      </header>

      {/* Main Details Card */}
      <main className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          {/* Gear Image */}
          {listing.imageUrl ? (
            <div className="w-full h-72 md:h-96 rounded-xl bg-slate-100 overflow-hidden mb-6 flex items-center justify-center">
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-full h-48 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-sm font-mono mb-6">
              No Image Available
            </div>
          )}

          {/* Title & Price Header */}
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                {listing.type}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
                {listing.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {listing.category} &bull; {listing.microLocation}
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">₹{price}</div>
              {listing.type === "RENT" && (
                <div className="text-xs text-slate-500">per day</div>
              )}
            </div>
          </div>

          {/* Security Deposit callout for rentals */}
          {listing.type === "RENT" && listing.securityDeposit && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 mb-6">
              <span className="font-semibold text-slate-800">Security Deposit:</span> ₹
              {listing.securityDeposit} (refundable upon gear return)
            </div>
          )}

          {/* Seller Info & Primary Action CTA */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Posted By Student
              </p>
              <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                {listing.owner.rollNumber}
              </p>
            </div>

            {isOwner ? (
              <div className="text-xs text-slate-500 bg-slate-100 px-4 py-2.5 rounded-xl font-medium text-center">
                This is your active listing
              </div>
            ) : (
              <Link
                href={`/chat/${listing.id}?recipientId=${listing.owner.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition text-center shadow-sm"
              >
                💬 Chat In-App with Owner
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}