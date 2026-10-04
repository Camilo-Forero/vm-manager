import initSqlJs from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import * as schema from "./schema.js";
import fs from "fs";
import path from "path";
// Locate root DB directory
let dbDir = path.resolve(process.cwd(), "../DB");
if (!fs.existsSync(dbDir)) {
    dbDir = path.resolve(process.cwd(), "DB");
}
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, "database.sqlite");
let sqlJsInstance = null;
let sqliteDb = null;
let dbInstance = null;
export async function getDb() {
    if (dbInstance)
        return dbInstance;
    if (!sqlJsInstance) {
        sqlJsInstance = await initSqlJs();
    }
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        sqliteDb = new sqlJsInstance.Database(fileBuffer);
    }
    else {
        sqliteDb = new sqlJsInstance.Database();
    }
    dbInstance = drizzle(sqliteDb, { schema });
    return dbInstance;
}
export function saveDb() {
    if (sqliteDb && dbDir) {
        const data = sqliteDb.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(path.join(dbDir, "database.sqlite"), buffer);
    }
}
