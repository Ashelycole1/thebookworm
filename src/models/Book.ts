import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Interface representing the public-facing Book document shape.
 * Note: `fileStorageKey` is intentionally omitted here — it is
 * hidden from default queries via `select: false` on the schema field.
 */
export interface IBook extends Document {
  title: string;
  author: string;
  description: string;
  priceUGX: number;
  coverImageUrl: string;
  fileStorageKey: string; // Private: excluded by default in queries
  genre: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, "Book title is required."],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author name is required."],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    priceUGX: {
      type: Number,
      required: [true, "Price in UGX is required."],
      min: [0, "Price cannot be negative."],
    },
    coverImageUrl: {
      type: String,
      required: [true, "Public cover image URL is required."],
    },
    genre: {
      type: [String],
      default: ["Fiction"],
    },
    fileStorageKey: {
      type: String,
      required: [true, "Private R2 storage file key is required."],
      select: false, // Prevents raw key exposure in generic book listing queries
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model re-compilation on hot reloads (Next.js dev server)
const Book: Model<IBook> =
  (mongoose.models.Book as Model<IBook>) ||
  mongoose.model<IBook>("Book", BookSchema);

export default Book;
