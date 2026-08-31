import { NextResponse } from "next/server";
import { createNylonPay } from "@nile-squad/nylonpay-ts";

export async function POST(request: Request) {
  try {
    const { amount, currency, phoneNumber } = await request.json();

    if (!amount || !currency || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    const payment = await nylonpay.collectPayment({
      amount,
      currency,
      customer: {
        name: "Customer", // You could collect this in the frontend if needed
        phoneNumber,
      },
      description: "Book Purchase",
    });

    return NextResponse.json({ reference: payment.reference });
  } catch (error: unknown) {
    console.error("Nylon Pay Initiate Error:", error);
    const message = error instanceof Error ? error.message : "Failed to initiate payment";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
