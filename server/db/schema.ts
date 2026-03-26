import { desc } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";


export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  status: text("status").notNull().default("Applied"),
  dateApplied: text("date_applied").notNull(),
  url: text("url"),
  description: text("description"),
  notes: text("notes"),
});