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
import bcrypt from "bcryptjs";  

export const adminRouter = createTRPCRouter({

  createAdmin: publicProcedure
  .input(
    z.object({
      username: z.string(),
      email: z.string().email(),
      password: z.string(),
      auth_id: z.string()
    })
  )
  .mutation(async ({ input }) => {
    // Check if the username already exists
    const existingAdminByUsername = await db
      .select()
      .from(admins)
      .where(eq(admins.username, input.username));

    if (existingAdminByUsername.length > 0) {
      throw new Error("Error: Username already exists");
    }

    // Check if the email already exists
    const existingAdminByEmail = await db
      .select()
      .from(admins)
      .where(eq(admins.email, input.email));

    if (existingAdminByEmail.length > 0) {
      throw new Error("Error: Email already in use");
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Insert new admin with the hashed password
    const newAdmin = await db
      .insert(admins)
      .values({
        username: input.username,
        email: input.email,
        password: hashedPassword,
        auth_id: input.auth_id
      })
      .returning();

    // Return the newly created admin
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
