import { db } from "../../db";
import { jobs } from "../../db/schema";
import { eq } from "drizzle-orm";
export default defineEventHandler( async (event) => {
    const id = Number(getRouterParam(event, "id"));
    const body = await readBody(event);
    const result = await db.update(jobs).set({
        company: body.company,
        role: body.role,
        status: body.status,
        dateApplied: body.dateApplied,
        url: body.url ?? null,
        description: body.descritpion ?? null,
        notes: body.notes ?? null,
    })
    .where(eq(jobs.id, id))
    .returning();

    return result[0];
});