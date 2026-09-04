import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/orders
 * Returns all orders, newest first, with book titles populated.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("books", "title author coverImageUrl priceUGX")
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[Admin] Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}
