import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Book from "@/models/Book";
import { getR2 } from "@/lib/r2";

const PRESIGNED_URL_TTL_SECONDS = 900; // 15 mins

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, transactionId } = await req.json();

    if (!phoneNumber || !transactionId) {
      return NextResponse.json(
        { error: "Phone number and Transaction ID are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Find the order securely matching both fields
    const order = await Order.findOne({
      phoneNumber: phoneNumber.trim(),
      transactionId: transactionId.trim(),
    });

    if (!order) {
      return NextResponse.json(
        { error: "No matching order found. Please check your details." },
        { status: 404 }
      );
    }

    if (order.status !== "SUCCESSFUL") {
      return NextResponse.json(
        { error: `This order is currently marked as ${order.status}.` },
        { status: 400 }
      );
    }

    // 2. Fetch the books in this order
    const books = await Book.find({ _id: { $in: order.books } }).select("+fileStorageKey");

    if (!books.length) {
      return NextResponse.json(
        { error: "No digital assets found for this order." },
        { status: 404 }
      );
    }

    // 3. Generate presigned URLs for each book
    const downloads = [];
    for (const book of books) {
      if (!book.fileStorageKey || !book.isAvailable) continue;

      const sanitizedTitle = book.title.replace(/[^a-zA-Z0-9 \-_]/g, '').trim();
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: book.fileStorageKey,
        ResponseContentDisposition: `attachment; filename="${sanitizedTitle}.pdf"`,
      });

      try {
        const client = getR2();
        if (!client) throw new Error("R2 not configured");
        const url = await getSignedUrl(client, command, { expiresIn: PRESIGNED_URL_TTL_SECONDS });
        downloads.push({
          title: book.title,
          author: book.author,
          url,
        });
      } catch (e) {
        console.error("Failed to generate presigned URL for", book.title, e);
      }
    }

    return NextResponse.json({ downloads });
  } catch (error) {
    console.error("Order lookup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
