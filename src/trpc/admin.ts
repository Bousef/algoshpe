/*
Admin:
createAdmin
updateAdmin [ID]
deleteAdmin [ID]
*/

import { publicProcedure, createTRPCRouter } from "src/server/api/trpc";
import { db } from "src/server/db";
import { admins } from "src/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const adminRouter = createTRPCRouter({

  //create admin
  createAdmin: publicProcedure
    .input(
      z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const newAdmin = await db.insert(admins).values({
        ...input
      }).returning();

      return newAdmin[0];
    }),

  //update admin 
  updateAdmin: publicProcedure
    .input(
      z.object({
        id: z.number(),
        username: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updatedAdmin = await db.update(admins)
        .set(input)
        .where(eq(admins.id, input.id))
        .returning();

      if (updatedAdmin.length === 0) throw new Error("Error: Admin Not Found");

      return updatedAdmin[0];
    }),

  //delete admin
  deleteAdmin: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const deletedAdmin = await db.delete(admins).where(eq(admins.id, input.id)).returning();

      if (deletedAdmin.length === 0) throw new Error("Error: Admin not found");

      return { message: "Admin deleted successfully", admin: deletedAdmin[0] };
    }),
});