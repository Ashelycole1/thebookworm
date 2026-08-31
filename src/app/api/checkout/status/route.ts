import { NextResponse } from "next/server";
import { createNylonPay } from "@nile-squad/nylonpay-ts";

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

    return NextResponse.json({ status: result.value.status });
  } catch (error: any) {
    console.error("Nylon Pay Status Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check status" },
      { status: 500 }
    );
  }
}
