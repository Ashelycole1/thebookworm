import type { MetadataRoute } from "next";
import connectDB from "@/lib/db";
import BookModel from "@/models/Book";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://the-book-worm.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let books: Array<{ _id: string; updatedAt?: Date }> = [];
  
  try {
    await connectDB();
    books = await BookModel.find({ isAvailable: { $ne: false } }, "_id updatedAt").lean();
  } catch (error) {
    console.error("Failed to fetch books for sitemap:", error);
  }

  const bookEntries: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${SITE_URL}/?book=${book._id.toString()}`,
    lastModified: book.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    // We can add other static pages here if they exist, e.g., /about, /lookup
  ];

  return [...staticEntries, ...bookEntries];
}
