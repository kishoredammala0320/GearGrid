"use server";

import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function createRazorpayOrder(amountInRupees: number, listingId: string) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay API keys missing in .env file. Did you restart 'npm run dev'?");
    }

    if (!amountInRupees || amountInRupees < 1) {
      throw new Error("Item price must be at least ₹1 to process online payment.");
    }

    const options = {
      amount: Math.round(amountInRupees * 100), // Convert ₹ to paise
      currency: "INR",
      receipt: `rcpt_${listingId.slice(-8)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error?.message || error);
    return { success: false, error: error?.message || "Failed to create payment order." };
  }
}

export async function verifyRazorpayPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return { success: true };
    } else {
      return { success: false, error: "Invalid payment signature." };
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return { success: false, error: "Payment verification failed." };
  }
}