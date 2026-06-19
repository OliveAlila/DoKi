import { PrismaClient } from "@prisma/client";
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../dev.db");
const adapter = new PrismaBunSqlite({ url: dbPath });

const prisma = new PrismaClient({ adapter });
export default prisma;
