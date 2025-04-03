/*
Assignments:
getAssignment [ID]
getAllAssignments [paging needed]
createAssignment
updateAssignment [ID]
deleteAssignment [ID]
*/

import { publicProcedure, createTRPCRouter } from "src/server/api/trpc";
import { db } from "src/server/db";
import { assignments } from "src/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const assignmentRouter = createTRPCRouter({

  //create assignment
  createAssignment: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        due_date: z.date()
      })
    )
    .mutation(async ({ input }) => {
        const formattedDueDate = input.due_date.toISOString().split('T')[0]; // Converts to 'YYYY-MM-DD'
    
        const newAssignment = await db.insert(assignments).values({
          ...input,
          due_date: formattedDueDate 
        }).returning();
    
        return newAssignment[0];
    }),

    //get all Assignments
    getAssignments: publicProcedure
    .input(z.object({ page: z.number().optional() }).optional())
    .query(async ({ input }) => {
        const page = input?.page || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        return await db.select().from(assignments).limit(limit).offset(offset);
    }),

    //get one assignment by id
    getAssignmentByID: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
        const assignment = await db.select().from(assignments).where(eq(assignments.id, input.id));

        if (assignment.length === 0) throw new Error("Error: Assignment Not Found");

        return assignment[0];
    }),

    //update Assignment
    updateAssignment: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),  
        due_date: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {

      const updateData: any = {};
  
      if (input.title) updateData.title = input.title;
      if (input.description) updateData.description = input.description;
      if (input.due_date) updateData.due_date = input.due_date.toISOString().split('T')[0];  
  

      const updatedAssignment = await db.update(assignments)
        .set(updateData)  
        .where(eq(assignments.id, input.id))
        .returning();
  
      if (updatedAssignment.length === 0) throw new Error("Error: Assignment Not Found");
  
      return updatedAssignment[0];
    }),

  //delete assignment
  deleteAssignment: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const deletedAssignment = await db.delete(assignments).where(eq(assignments.id, input.id)).returning();

      if (deletedAssignment.length === 0) throw new Error("Error: Assignment Not Found");

      return { message: "Assignment Deleted Successfully", assignment : deletedAssignment[0] };
    }),
});