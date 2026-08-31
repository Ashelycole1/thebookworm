export type Format = "Ebook" | "PDF" | "Audiobook";

export type Genre = "Fiction" | "Essays" | "Poetry" | "Nonfiction" | "Design";

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: Genre;
  price: number; // USD base price
  rating: number;
  blurb: string;
  formats: Format[];
}

export interface CartLine {
  id: number; // Book.id
  qty: number;
  checked: boolean;
}

export interface CurrencyConfig {
  code: string;    // "KES", "USD", "GHS", etc.
  symbol: string;  // "KSh", "$", "GH₵", etc.
  rate: number;    // multiplier from USD
}
