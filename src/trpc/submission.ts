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
import { eq, sql } from "drizzle-orm";

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
    getAllSubmissions: publicProcedure
        .query(async () => {
        return await db
            .select({
            studentId: submissions.studentId,
            assignmentId: submissions.assignmentId,
            })
            .from(submissions);
    }),

    //get submission by submission ID
    getSubmissionById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
        const submission = await db.select().from(submissions).where(eq(submissions.id, input.id));

        if (submission.length === 0) throw new Error("Error: Submission Not Found");

        return submission[0];
    }),

    //get the submission count of the student id
    getStudentSubmissionCount: publicProcedure
        .input(z.object({ studentId: z.number() }))
        .query(async ({ input }) => {
            const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(submissions)
            .where(eq(submissions.studentId, input.studentId));

        return countResult[0]?.count ?? 0;
    }),

    //get all of that student's submissions
    getAllStudentSubmissions: publicProcedure
        .input(z.object({ studentId: z.number() }))
        .query(async ({ input }) => {
            return await db
            .select({ studentId: submissions.studentId, assignmentId: submissions.assignmentId })
            .from(submissions)
            .where(eq(submissions.studentId, input.studentId));
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