import { db } from "../../db";
import { jobs } from "../../db/schema";
export default defineEventHandler( async (event) => {
    
    const body = await readBody(event);
    const result = await db.insert(jobs).values({
        company: body.company,
        role: body.role,
        status: body.status ?? "Applied",
        dateApplied: body.dateApplied,
        url: body.url ?? null,
        description: body.descritpion ?? null,
        notes: body.notes ?? null,
    }).returning();
    
    return result[0];
});