/*
Submissions:
getSubmission [ID]
getAllSubmissions [paging needed]
getSubmissionsByStudent [ID]
createSubmission
updateSubmission [ID]
deleteSubmission [ID]
*/

import { publicProcedure, createTRPCRouter } from "src/server/api/trpc";
import { db } from "src/server/db";
import { submissions } from "src/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const submissionRouter = createTRPCRouter({

    //create submission
    createSubmission: publicProcedure
        .input(
            z.object({
                studentId: z.number(),
                assignmentId: z.number(),
                code: z.string(),
                output: z.string(),
                status: z.string(),
            })
        )
        .mutation(async ({ input }) => {
        const newSubmission = await db.insert(submissions).values({
            studentId: input.studentId,
            assignmentId: input.assignmentId,
            code: input.code,
            output: input.output,
            status: input.status,
        }).returning();

        return newSubmission[0]; 
   }),

    //get all submissions
    getSubmissions: publicProcedure
        .input(z.object({ page: z.number().optional() }).optional())
        .query(async ({ input }) => {
        const page = input?.page || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        return await db.select().from(submissions).limit(limit).offset(offset);
    }),

    //get submission by submission ID
    getSubmissionById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
        const submission = await db.select().from(submissions).where(eq(submissions.id, input.id));

        if (submission.length === 0) throw new Error("Error: Submission Not Found");

        return submission[0];
    }),
    
    //get submissions by student id 
    getSubmissionByStudentId: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
        const submissionsList = await db.select().from(submissions).where(eq(submissions.id, input.id));

        if (submissionsList.length === 0) throw new Error("Error: Submissions Not Found");

        return submissionsList;
    }),

    //update submission 
    updateSubmission: publicProcedure
        .input(
        z.object({
            id: z.number(),
            code: z.string().optional(),
            output: z.string().optional(),
            status: z.string().optional(),
        })
        )
        .mutation(async ({ input }) => {
        const updatedSubmission = await db.update(submissions)
            .set(input)
            .where(eq(submissions.id, input.id))
            .returning();

        if (updatedSubmission.length === 0) throw new Error("Error: Submission Not Found");

        return updatedSubmission[0];
    }),

    //delete submission
    deleteSubmission: publicProcedure
        .input(z.object({id: z.number()}))
        .mutation(async ({ input }) => {
        const deletedSubmission = await db.delete(submissions).where(eq(submissions.id, input.id)).returning();

        if (deletedSubmission.length === 0) throw new Error("Error: Submission Not Found");

        return { message: "Submission Deleted Successfully", submission: deletedSubmission[0] };
    }),
});