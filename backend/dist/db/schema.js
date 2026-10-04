import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const usersTable = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    name: text("name").notNull(),
    role: text("role", { enum: ["admin", "client"] }).notNull().default("client"),
    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});
export const vmsTable = sqliteTable("vms", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    cores: integer("cores").notNull(),
    ram: integer("ram").notNull(), // in GB
    disk: integer("disk").notNull(), // in GB
    os: text("os").notNull(),
    status: text("status", { enum: ["active", "inactive"] }).notNull().default("inactive"),
    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
    updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});
