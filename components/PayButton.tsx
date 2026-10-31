"use client";

import { useState } from "react";
import Script from "next/script";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/app/actions/payment";

interface PayButtonProps {
  amount: number;
  listingId: string;
  title: string;
  userEmail: string;
  rollNumber: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PayButton({ amount, listingId, title, userEmail, rollNumber }: PayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const orderRes = await createRazorpayOrder(amount, listingId);

      if (!orderRes.success || !orderRes.orderId) {
        alert(`Payment Error: ${orderRes.error}`);
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "GearGrid Marketplace",
        description: `Payment for ${title}`,
        order_id: orderRes.orderId,
        handler: async function (response: any) {
          const verifyRes = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes.success) {
            alert("Payment Successful! Contact owner to collect item.");
          } else {
            alert("Payment Verification Failed.");
          }
          setLoading(false);
        },
        prefill: {
          email: userEmail,
        },
        notes: {
          roll_number: rollNumber,
          listing_id: listingId,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong initializing Razorpay.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? "Processing..." : `Pay ₹${amount} with Razorpay`}
      </button>
    </>
  );
}