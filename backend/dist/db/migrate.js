import { getDb, saveDb } from "./database.js";
import fs from "fs";
import path from "path";
export async function runMigrations() {
    const db = await getDb();
    const migrationsFolder = path.resolve(process.cwd(), "DB/Migrations");
    console.log(`Running migrations from ${migrationsFolder}...`);
    try {
        const initSqlPath = path.join(migrationsFolder, "0000_initial.sql");
        if (fs.existsSync(initSqlPath)) {
            const sql = fs.readFileSync(initSqlPath, "utf8");
            const statements = sql.split(";").map(s => s.trim()).filter(Boolean);
            for (const stmt of statements) {
                const client = db.session.client;
                client.run(stmt);
            }
            saveDb();
            console.log("Migrations executed successfully.");
        }
    }
    catch (error) {
        console.error("Migration execution error:", error);
    }
}
