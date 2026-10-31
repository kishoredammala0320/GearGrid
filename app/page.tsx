import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getActiveListings } from "@/app/actions/listings";
import { getUnreadCount } from "@/app/actions/messages";

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Await Next.js 16 dynamic searchParams
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const category = resolvedParams.category || "All";

  // Fetch listings and unread message count
  const listings = await getActiveListings(query, category);
  const unreadCount = await getUnreadCount();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">GearGrid</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/inbox"
            className="relative text-sm font-medium text-slate-600 hover:text-blue-600 transition flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            💬 Inbox
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link href="/my-listings" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">
            My Listings
          </Link>
          <Link
            href="/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition"
          >
            + Post Gear
          </Link>
          <UserButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        
        {/* Search and Filter Bar */}
        <form action="/" method="GET" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Search Gear</label>
            <input
              name="q"
              defaultValue={query}
              placeholder="e.g., Arduino, Lab Coat, Calculator..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
            <select
              name="category"
              defaultValue={category}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Lab Equipment">Lab Equipment</option>
              <option value="Books">Books & Notes</option>
              <option value="Components">Arduino / IoT Kits</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition h-[42px] text-sm"
          >
            Search
          </button>
          
          {(query || category !== "All") && (
            <Link href="/" className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 underline h-[42px] flex items-center">
              Clear
            </Link>
          )}
        </form>

        <h2 className="text-xl font-semibold mb-6 text-slate-900">Campus Marketplace Feed</h2>

        {listings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 mb-4">No items found matching your search.</p>
            <Link href="/" className="text-blue-600 font-semibold hover:underline">
              Clear filters &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {listings.map((item) => (
              <Link 
                href={`/item/${item.id}`} 
                key={item.id} 
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition cursor-pointer overflow-hidden"
              >
                <div>
                  {item.imageUrl && (
                    <div className="w-full h-40 mb-3 rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                      <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-500">{item.microLocation}</span>
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 mb-3">{item.category}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-slate-900">
                      ₹{item.type === "RENT" ? item.pricePerDay : item.sellPrice}
                    </span>
                    {item.type === "RENT" && <span className="text-xs text-slate-500"> /day</span>}
                  </div>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                    {item.owner.rollNumber}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}