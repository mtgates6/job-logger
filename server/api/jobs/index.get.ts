import { db } from "../../db";
import { jobs } from "../../db/schema";
export default defineEventHandler( async () => {
    return await db.select().from(jobs);
});