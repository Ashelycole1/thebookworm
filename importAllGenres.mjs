import { execSync } from 'child_process';

const genres = [
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
  "Nonfiction",
  "Essays",
  "Design"
];

for (const genre of genres) {
  console.log(`\nStarting import for: ${genre}`);
  try {
    // Import 5 books per genre so it doesn't take forever
    execSync(`node importGutendex.mjs --count 5 --topic "${genre}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed importing ${genre}`);
  }
}
