import { NextResponse } from "next/server";
import { createNylonPay } from "@nile-squad/nylonpay-ts";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Missing transaction reference" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NYLON_PAY_API_KEY;
    const apiSecret = process.env.NYLON_PAY_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("Missing Nylon Pay credentials in environment variables.");
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    const nylonpay = createNylonPay({ apiKey, apiSecret });

    const result = await nylonpay.getStatus({ reference });
    
    // Result is a Result type from Nylon Pay SDK
    if (!result.isOk) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch status" },
        { status: 400 }
      );
    }

    const currentStatus = result.value.status;
    
    // Update Order in DB
    try {
      await connectDB();
      // Ensure we only update to SUCCESSFUL or FAILED, if it's currently PENDING
      // or just trust NylonPay's status.
      const normalizedStatus = currentStatus.toUpperCase() === "SUCCESSFUL" || currentStatus.toUpperCase() === "SUCCESS" ? "SUCCESSFUL" 
                             : currentStatus.toUpperCase() === "FAILED" ? "FAILED" 
                             : "PENDING";
                             
      await Order.findOneAndUpdate(
        { transactionId: reference },
        { status: normalizedStatus }
      );
    } catch (dbErr) {
      console.error("Failed to update order status in DB", dbErr);
    }

    return NextResponse.json({ status: currentStatus });
  } catch (error: unknown) {
    console.error("Nylon Pay Status Error:", error);
    const message = error instanceof Error ? error.message : "Failed to check status";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
