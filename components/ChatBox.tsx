"use client";

import { useState, useEffect, useRef } from "react";
import { sendMessage } from "@/app/actions/messages";

interface Message {
  id: string;
  text: string;
  createdAt: Date;
  senderId: string;
  sender: { rollNumber: string };
}

interface ChatBoxProps {
  listingId: string;
  receiverId: string;
  currentUserId: string;
  initialMessages: Message[];
  otherRollNumber: string;
}

export default function ChatBox({
  listingId,
  receiverId,
  currentUserId,
  initialMessages,
  otherRollNumber,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;

    setIsSending(true);
    const content = text.trim();
    setText("");

    try {
      const newMsg = await sendMessage(listingId, receiverId, content);
      setMessages((prev) => [
        ...prev,
        {
          id: newMsg.id,
          text: newMsg.text,
          createdAt: newMsg.createdAt,
          senderId: currentUserId,
          sender: { rollNumber: "You" },
        },
      ]);
    } catch {
      alert("Failed to send message. Try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
      <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex justify-between items-center">
        <div>
          <h2 className="font-bold text-slate-900">Chat with {otherRollNumber}</h2>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Pragati Verified Student
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {messages.length === 0 ? (
          <p className="text-center text-slate-400 text-sm my-auto">
            No messages yet. Send a inquiry to start discussing terms!
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[75%] ${
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                  {isMe ? "You" : msg.sender.rollNumber}
                </span>
                <div
                  className={`p-3 rounded-2xl text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-100 text-slate-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${otherRollNumber}...`}
          className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isSending || !text.trim()}
          className="bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}