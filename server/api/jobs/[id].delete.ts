import { db } from "../../db";
import { jobs } from "../../db/schema";
import { eq } from "drizzle-orm";
export default defineEventHandler( async (event) => {
    const id = Number(getRouterParam(event, "id"));
    await db.delete(jobs).where(eq(jobs.id, id));

    return { message: `Job ${id} deleted` };
});