import { getDb, saveDb } from "./database.js";
import { usersTable, vmsTable } from "./schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { runMigrations } from "./migrate.js";
async function seed() {
    await runMigrations();
    const db = await getDb();
    console.log("Seeding database...");
    const adminEmail = "admin@mail.com";
    const clientEmail = "client@mail.com";
    const hashedPassword = await bcrypt.hash("123", 10);
    const existingAdmin = db.select().from(usersTable).where(eq(usersTable.email, adminEmail)).get();
    if (!existingAdmin) {
        db.insert(usersTable).values({
            email: adminEmail,
            password: hashedPassword,
            name: "System Admin",
            role: "admin",
        }).run();
        console.log("Created admin user: admin@mail.com / 123");
    }
    const existingClient = db.select().from(usersTable).where(eq(usersTable.email, clientEmail)).get();
    if (!existingClient) {
        db.insert(usersTable).values({
            email: clientEmail,
            password: hashedPassword,
            name: "Demo Client",
            role: "client",
        }).run();
        console.log("Created client user: client@mail.com / 123");
    }
    const vmsCount = db.select().from(vmsTable).all().length;
    if (vmsCount === 0) {
        const sampleVMs = [
            { name: "prod-web-01", cores: 4, ram: 16, disk: 100, os: "Ubuntu 22.04 LTS", status: "active" },
            { name: "prod-db-postgres", cores: 8, ram: 32, disk: 500, os: "Debian 12", status: "active" },
            { name: "redis-cache-cluster", cores: 2, ram: 8, disk: 40, os: "Alpine Linux", status: "active" },
            { name: "staging-api-server", cores: 2, ram: 4, disk: 80, os: "Ubuntu 24.04 LTS", status: "inactive" },
            { name: "k8s-worker-node-01", cores: 6, ram: 24, disk: 250, os: "CentOS Stream 9", status: "active" },
            { name: "legacy-app-backup", cores: 1, ram: 2, disk: 120, os: "Windows Server 2022", status: "inactive" },
        ];
        for (const vm of sampleVMs) {
            db.insert(vmsTable).values(vm).run();
        }
        console.log("Seeded 6 sample VMs.");
    }
    saveDb();
    console.log("Seeding complete.");
}
seed().catch(console.error);
