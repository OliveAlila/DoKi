import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../dev.db");
const adapter = new PrismaBunSqlite({ url: dbPath });

const prisma = new PrismaClient({ adapter });
export default prisma;
