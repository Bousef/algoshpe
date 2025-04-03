/*
Comments:
getComment [ID]
getAllComments
createComment
updateComment [ID]
deleteComment [ID]
*/

import { publicProcedure, createTRPCRouter } from "src/server/api/trpc";
import { db } from "src/server/db";
import { comments } from "src/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const commentRouter = createTRPCRouter({

    //create comment
    createComment: publicProcedure
        .input(
            z.object({
                studentId: z.number(),
                assignmentId: z.number(),
                admin_id: z.number().nullable().optional(),
                is_private: z.boolean(),
                message: z.string(),
            })
        )
        .mutation(async ({ input }) => {
        const newComment = await db.insert(comments).values({
            studentId: input.studentId,
            assignmentId: input.assignmentId,
            is_private: input.is_private,
            message: input.message,
            ...(input.admin_id !== undefined ? { admin_id: input.admin_id } : {}),
        }).returning();

        return newComment[0]; 
   }),

    //get all comments
    getComments: publicProcedure
        .input(z.object({ page: z.number().optional() }).optional())
        .query(async ({ input }) => {
        const page = input?.page || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        return await db.select().from(comments).limit(limit).offset(offset);
    }),

    //get one comment by student ID
    getCommentById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
        const comment = await db.select().from(comments).where(eq(comments.id, input.id));

        if (comment.length === 0) throw new Error("Error: Comment Not Found");

        return comment[0];
    }),

    //update comment 
    updateComment: publicProcedure
        .input(
        z.object({
            id: z.number(),
            admin_id: z.number().nullable().optional(),
            is_private: z.boolean().optional(),
            message: z.string().optional()
        })
        )
        .mutation(async ({ input }) => {
        const updatedComment = await db.update(comments)
            .set(input)
            .where(eq(comments.id, input.id))
            .returning();

        if (updatedComment.length === 0) throw new Error("Error: Comment Not Found");

        return updatedComment[0];
    }),

    //delete comment
    deleteComment: publicProcedure
        .input(z.object({id: z.number()}))
        .mutation(async ({ input }) => {
        const deletedComment = await db.delete(comments).where(eq(comments.id, input.id)).returning();

        if (deletedComment.length === 0) throw new Error("Error: Comment Not Found");

        return { message: "Comment Deleted Successfully", submission: deletedComment[0] };
    }),
});