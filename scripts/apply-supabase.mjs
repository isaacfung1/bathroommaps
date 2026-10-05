import { readFileSync } from "node:fs";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const connectionString = databaseUrl.replace(/^postgresql\+asyncpg/, "postgresql");
const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const sql = readFileSync(
  new URL("../supabase/migrations/20261005120000_queens_bathrooms.sql", import.meta.url),
  "utf8",
);

await client.connect();
try {
  await client.query(sql);
  const result = await client.query(
    "select count(*)::int as bathrooms from public.bathrooms where campus = 'queens'",
  );
  console.log(`queens bathrooms: ${result.rows[0].bathrooms}`);
} finally {
  await client.end();
}
