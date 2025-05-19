import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Required for Neon Serverless
neonConfig.webSocketConstructor = ws;

// Read the database URL from the environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Error: DATABASE_URL is not set");
  process.exit(1);
}

// Create connection pool
const pool = new Pool({ connectionString: DATABASE_URL });

// Create database client
const db = drizzle(pool);

// Run migrations
async function main() {
  console.log("Migration started...");
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();