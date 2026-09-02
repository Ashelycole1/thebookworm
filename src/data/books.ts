import { Book, Genre } from "@/types";

export const COVER_PALETTES = [
  { bg: "#E8B930", text: "#241C05" }, // mustard
  { bg: "#2E3F70", text: "#EEF2FF" }, // navy
  { bg: "#8C5B4A", text: "#FFF1EA" }, // clay
  { bg: "#5F8B72", text: "#F2FFF8" }, // sage
  { bg: "#B85C6B", text: "#FFF1F3" }, // dusty rose
  { bg: "#2C2C29", text: "#F7F6F1" }, // charcoal
] as const;

export const GENRES: ("All" | Genre)[] = [
  "All",
  "Programming",
  "Engineering",
  "Data Science",
  "Mathematics",
  "Science",
  "Medicine & Health",
  "Law",
  "Business",
  "Finance",
  "Education",
  "Self-Help",
  "Technology",
  "Fiction",
  "Nonfiction",
  "Essays",
  "Design",
  "Other",
];

export const BOOKS: Book[] = [
  {
    id: 1,
    title: "The Salt Line",
    author: "Nadia Okafor",
    genre: ["Fiction"],
    price: 14,
    rating: 4.0,
    blurb:
      "A coastal town keeps rebuilding after every storm, until one family decides not to.",
    formats: ["Ebook", "PDF", "Audiobook"],
  },
  {
    id: 2,
    title: "Marginalia",
    author: "Peter Voss",
    genre: ["Essays"],
    price: 12,
    rating: 4.1,
    blurb:
      "Twenty essays on reading, written in the margins of other people's books.",
    formats: ["Ebook", "PDF"],
  },
  {
    id: 3,
    title: "Low Tide Almanac",
    author: "Ren Kessler",
    genre: ["Essays"],
    price: 10,
    rating: 4.9,
    blurb: "A year of tide charts turned into quiet, exact poems.",
    formats: ["Ebook", "PDF"],
  },
  {
    id: 4,
    title: "The Weight of Rooms",
    author: "Ines Calder",
    genre: ["Fiction"],
    price: 15,
    rating: 4.2,
    blurb: "Three siblings inherit a house and everything it never told them.",
    formats: ["Ebook", "PDF", "Audiobook"],
  },
  {
    id: 5,
    title: "How Cities Forget",
    author: "Marcus Adeyemi",
    genre: ["Nonfiction"],
    price: 18,
    rating: 4.3,
    blurb:
      "A study of the buildings that outlive the reasons they were built.",
    formats: ["Ebook", "PDF"],
  },
  {
    id: 6,
    title: "Grid & Grain",
    author: "Tomas Lindqvist",
    genre: ["Design"],
    price: 22,
    rating: 4.7,
    blurb:
      "A working designer's notebook on typography, restraint, and getting it wrong first.",
    formats: ["PDF"],
  },
  {
    id: 7,
    title: "Nightshift",
    author: "Priya Balan",
    genre: ["Fiction"],
    price: 13,
    rating: 4.4,
    blurb:
      "A hospital cleaner, a stray cat, and the hours nobody else wants.",
    formats: ["Ebook", "PDF", "Audiobook"],
  },
  {
    id: 8,
    title: "Small Weather",
    author: "June Torres",
    genre: ["Essays"],
    price: 9,
    rating: 5.0,
    blurb: "Short poems about the parts of a day too small to mention.",
    formats: ["Ebook", "PDF"],
  },
  {
    id: 9,
    title: "The Last Good Map",
    author: "Owen Bratt",
    genre: ["Nonfiction"],
    price: 19,
    rating: 4.5,
    blurb:
      "Cartographers who kept drawing coastlines after the coastlines moved.",
    formats: ["Ebook", "PDF"],
  },
  {
    id: 10,
    title: "Correspondence",
    author: "Elin Marsh",
    genre: ["Essays"],
    price: 12,
    rating: 4.6,
    blurb:
      "Letters never sent, annotated decades later by the person who wrote them.",
    formats: ["Ebook", "PDF"],
  },
  {
    id: 11,
    title: "Concrete Gardens",
    author: "Yusuf Demir",
    genre: ["Design"],
    price: 20,
    rating: 4.8,
    blurb:
      "How postwar housing blocks accidentally became some of the greenest places in Europe.",
    formats: ["PDF"],
  },
  {
    id: 12,
    title: "The Understory",
    author: "Alba Reyes",
    genre: ["Fiction"],
    price: 16,
    rating: 4.1,
    blurb:
      "A forester's daughter learns to read a forest the way her mother taught her.",
    formats: ["Ebook", "PDF", "Audiobook"],
  },
];

export function palette(id: number) {
  return COVER_PALETTES[id % COVER_PALETTES.length];
}
