"use client";

import { useState } from "react";
import { createListing } from "@/app/actions/listings";
import { UploadDropzone } from "@/lib/uploadthing";

export default function CreateListingPage() {
  const [imageUrl, setImageUrl] = useState<string>("");

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">List Gear on GearGrid</h1>
      <form action={createListing} className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Hidden input to send imageUrl to the Server Action */}
        <input type="hidden" name="imageUrl" value={imageUrl} />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Item Title</label>
          <input
            name="title"
            required
            placeholder="e.g. Casio Scientific Calculator / Arduino Uno Kit"
            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Photo</label>
          {imageUrl ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
              <img src={imageUrl} alt="Uploaded item preview" className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded shadow hover:bg-red-700"
              >
                Remove Photo
              </button>
            </div>
          ) : (
            <UploadDropzone
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setImageUrl(res[0].url);
                }
              }}
              onUploadError={(error: Error) => {
                alert(`Upload failed: ${error.message}`);
              }}
              className="ut-button:bg-blue-600 ut-button:ut-readying:bg-blue-500 border-dashed border-2 border-slate-300 rounded-xl py-6"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select name="category" required className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none">
              <option value="Electronics">Electronics</option>
              <option value="Lab Equipment">Lab Equipment</option>
              <option value="Books">Books & Notes</option>
              <option value="Components">Arduino / IoT Kits</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Listing Type</label>
            <select name="type" required className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none">
              <option value="RENT">Rent per Day</option>
              <option value="SELL">Sell Outright</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              required
              placeholder="100"
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Security Deposit (₹, for Rents)</label>
            <input
              name="securityDeposit"
              type="number"
              step="0.01"
              placeholder="500 (Optional)"
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Campus Location</label>
          <input
            name="microLocation"
            required
            placeholder="e.g. Mechanical Block / Central Library / Boys Hostel 2"
            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Publish Listing
        </button>
      </form>
    </div>
  );
}