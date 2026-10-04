import { getDb, saveDb } from "../db/database.js";
import { vmsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
const vmSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    cores: z.number().int().min(1, "At least 1 core required").max(128),
    ram: z.number().min(0.5, "RAM must be at least 0.5 GB").max(1024),
    disk: z.number().min(5, "Disk must be at least 5 GB").max(100000),
    os: z.string().min(1, "OS is required"),
    status: z.enum(["active", "inactive"]).default("inactive"),
});
const vmUpdateSchema = vmSchema.partial();
export async function getVMs(req, res) {
    try {
        const db = await getDb();
        const vms = db.select().from(vmsTable).all();
        return res.json({ vms });
    }
    catch (error) {
        console.error("Get VMs error:", error);
        return res.status(500).json({ error: "Failed to fetch VMs" });
    }
}
export async function createVM(req, res) {
    try {
        const result = vmSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: "Invalid VM data", details: result.error.errors });
        }
        const newVm = result.data;
        const now = new Date().toISOString();
        const db = await getDb();
        db.insert(vmsTable).values({
            name: newVm.name,
            cores: newVm.cores,
            ram: newVm.ram,
            disk: newVm.disk,
            os: newVm.os,
            status: newVm.status,
            createdAt: now,
            updatedAt: now,
        }).run();
        saveDb();
        const vm = db.select().from(vmsTable).orderBy(vmsTable.id).all().pop();
        const io = req.app.get("io");
        if (io) {
            io.emit("vm:created", vm);
        }
        return res.status(201).json({ message: "VM created successfully", vm });
    }
    catch (error) {
        console.error("Create VM error:", error);
        return res.status(500).json({ error: "Failed to create VM" });
    }
}
export async function updateVM(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid VM ID" });
        }
        const result = vmUpdateSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: "Invalid update data", details: result.error.errors });
        }
        const db = await getDb();
        const existing = db.select().from(vmsTable).where(eq(vmsTable.id, id)).get();
        if (!existing) {
            return res.status(404).json({ error: "VM not found" });
        }
        const updateData = {
            ...result.data,
            updatedAt: new Date().toISOString(),
        };
        db.update(vmsTable)
            .set(updateData)
            .where(eq(vmsTable.id, id))
            .run();
        saveDb();
        const updated = db.select().from(vmsTable).where(eq(vmsTable.id, id)).get();
        const io = req.app.get("io");
        if (io) {
            io.emit("vm:updated", updated);
        }
        return res.json({ message: "VM updated successfully", vm: updated });
    }
    catch (error) {
        console.error("Update VM error:", error);
        return res.status(500).json({ error: "Failed to update VM" });
    }
}
export async function deleteVM(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid VM ID" });
        }
        const db = await getDb();
        const existing = db.select().from(vmsTable).where(eq(vmsTable.id, id)).get();
        if (!existing) {
            return res.status(404).json({ error: "VM not found" });
        }
        db.delete(vmsTable).where(eq(vmsTable.id, id)).run();
        saveDb();
        const io = req.app.get("io");
        if (io) {
            io.emit("vm:deleted", { id });
        }
        return res.json({ message: "VM deleted successfully", id });
    }
    catch (error) {
        console.error("Delete VM error:", error);
        return res.status(500).json({ error: "Failed to delete VM" });
    }
}
