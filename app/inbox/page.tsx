import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getInboxThreads } from "@/app/actions/messages";

export default async function InboxPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const threads = await getInboxThreads();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-blue-600 hover:underline font-medium text-sm">
          &larr; Back to Feed
        </Link>
        <h1 className="font-bold text-slate-900">Campus Inbox</h1>
      </header>

      <main className="max-w-3xl mx-auto py-8 px-4">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Active Gear Conversations</h2>

        {threads.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
            No active chats yet. Visit any gear listing to message an owner!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {threads.map((thread: any) => {
              const hasUnread = thread.unreadCount > 0;
              return (
                <Link
                  key={`${thread.listing.id}_${thread.otherUser.id}`}
                  href={`/chat/${thread.listing.id}?recipientId=${thread.otherUser.id}`}
                  className={`p-5 rounded-xl border shadow-sm transition flex justify-between items-center ${
                    hasUnread
                      ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-200"
                      : "bg-white border-slate-200 hover:border-blue-400"
                  }`}
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{thread.listing.title}</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        {thread.otherUser.rollNumber}
                      </span>
                      {hasUnread && (
                        <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                          {thread.unreadCount} NEW
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm line-clamp-1 ${
                        hasUnread ? "font-semibold text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {thread.lastMessage.text}
                    </p>
                  </div>

                  <span className="text-xs text-blue-600 font-semibold hover:underline shrink-0">
                    Open Chat &rarr;
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}