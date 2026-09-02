import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  transactionId: string;
  phoneNumber: string;
  status: "PENDING" | "SUCCESSFUL" | "FAILED";
  totalAmount: number;
  currency: string;
  books: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    transactionId: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    status: { 
      type: String, 
      required: true,
      enum: ["PENDING", "SUCCESSFUL", "FAILED"],
      default: "PENDING"
    },
    totalAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    books: [{ type: Schema.Types.ObjectId, ref: "Book" }],
  },
  { timestamps: true }
);

// Prevent Next.js HMR from creating duplicate models
const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
