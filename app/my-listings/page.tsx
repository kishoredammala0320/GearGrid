import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMyListings, deleteListing } from "@/app/actions/listings";

export default async function MyListingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const listings = await getMyListings();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600 hover:opacity-80">
          GearGrid
        </Link>
        <Link href="/" className="text-sm font-medium text-slate-600 hover:underline">
          &larr; Back to Feed
        </Link>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
          <Link
            href="/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition"
          >
            + Post New Gear
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
            <p className="text-slate-500 mb-4">You haven't posted any items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((item) => {
              // Bind the listing ID to the delete action
              const deleteAction = deleteListing.bind(null, item.id);

              return (
                <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.type} &bull; ₹{item.type === "RENT" ? item.pricePerDay : item.sellPrice}</p>
                  </div>
                  
                  <form action={deleteAction}>
                    <button 
                      type="submit"
                      className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}