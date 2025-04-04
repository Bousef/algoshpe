import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import { parse } from "pg-connection-string";

dotenv.config();

const config = parse(process.env.DATABASE_URL!);

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: config.host!,
    port: parseInt(config.port!),
    user: config.user!,
    password: config.password!,
    database: config.database!,
    ssl: {
      rejectUnauthorized: false, // Required for Supabase connections
    },
  },
  tablesFilter: ["algoshpe_*"],
} satisfies Config;
