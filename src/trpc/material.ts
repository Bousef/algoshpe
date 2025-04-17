/*
Materials:
getMaterial [ID]
getAllMaterials
uploadMaterial 
deleteMaterial [ID]
*/

import { publicProcedure, createTRPCRouter } from "src/server/api/trpc";
import { db } from "src/server/db";
import { materials } from "src/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const materialRouter = createTRPCRouter({

    /*
    //upload material
    createMaterial: publicProcedure
        .input(
            z.object({
                title: z.string(),
                file_url: z.number()
            })
        )
        .mutation(async ({ input }) => {
        const newMaterial= await db.insert(materials).values({
            title: input.title,
            file_url: input.file_url
        }).returning();

        return newMaterial[0]; 
   }),

    //get all materials
    getMaterials: publicProcedure
        .input(z.object({ page: z.number().optional() }).optional())
        .query(async ({ input }) => {
        const page = input?.page || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        return await db.select().from(materials).limit(limit).offset(offset);
    }),

    //get one material by student ID
    getMaterialByID: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
        const material = await db.select().from(materials).where(eq(materials.id, input.id));

        if (material.length === 0) throw new Error("Error: Material Not Found");

        return material[0];
    }),

    //update material 
    updateMaterial: publicProcedure
        .input(
        z.object({
            id : z.number(),
            title: z.string().optional(),
            file_url: z.number().optional()
        })
        )
        .mutation(async ({ input }) => {
        const updatedMaterial = await db.update(materials)
            .set(input)
            .where(eq(materials.id, input.id))
            .returning();

        if (updatedMaterial.length === 0) throw new Error("Error: Material Not Found");

        return updatedMaterial[0];
    }),

    //delete material
    deleteMaterial: publicProcedure
        .input(z.object({id: z.number()}))
        .mutation(async ({ input }) => {
        const deletedMaterial = await db.delete(materials).where(eq(materials.id, input.id)).returning();

        if (deletedMaterial.length === 0) throw new Error("Error: Material Not Found");

        return { message: "Material Deleted Successfully", material: deletedMaterial[0] };
    }),*/
});