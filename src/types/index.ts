export type Format = "Ebook" | "PDF" | "Audiobook";

export type Genre =
  | "Programming"
  | "Engineering"
  | "Data Science"
  | "Mathematics"
  | "Science"
  | "Medicine & Health"
  | "Law"
  | "Business"
  | "Finance"
  | "Education"
  | "Self-Help"
  | "Technology"
  | "Fiction"
  | "Nonfiction"
  | "Essays"
  | "Design"
  | "Other";

export interface Book {
  id: string | number;
  title: string;
  author: string;
  genre: Genre[];
  courses?: string[];
  price: number; // USD base price
  rating: number;
  blurb: string;
  formats: Format[];
  coverImageUrl?: string;
}

export interface CartLine {
  id: string | number; // Book.id
  qty: number;
  checked: boolean;
}

export interface CurrencyConfig {
  code: string;    // "KES", "USD", "GHS", etc.
  symbol: string;  // "KSh", "$", "GH₵", etc.
  rate: number;    // multiplier from USD
}
