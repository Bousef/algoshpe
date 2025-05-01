import { publicProcedure, createTRPCRouter } from "src/server/api/trpc";
import { db } from "src/server/db";
import { assignments, students } from "src/server/db/schema";
import { z } from "zod";
import { eq, sql, inArray } from "drizzle-orm";

export const assignmentRouter = createTRPCRouter({

  //create assignment
  createAssignment: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        due_date: z.date(),
        submission_ids: z.array(z.number()).optional(),
        level: z.string()
      })
    )
    .mutation(async ({ input }) => {
      const formattedDueDate = input.due_date.toISOString().split('T')[0];
      const newAssignment = await db.insert(assignments).values({
        ...input,
        due_date: formattedDueDate 
      }).returning();
      return newAssignment[0];
    }),

  // Assign assignment to ALL students
  assignToAllStudents: publicProcedure
  .input(z.object({ assignmentId: z.number() }))
  .mutation(async ({ input }) => {
    const allStudents = await db.select({ id: students.id }).from(students);

    for (const student of allStudents) {
      await db.update(students)
        .set({
          currentAssignments: sql`array_append(coalesce("currentAssignments", '{}'), ${input.assignmentId})`
        })
        .where(eq(students.id, student.id));
    }

    return { message: "Assigned to all students." };
  }),


  // Assign assignment to SELECTED students
  assignToSpecificStudents: publicProcedure
  .input(z.object({ assignmentId: z.number(), studentIds: z.array(z.number()) }))
  .mutation(async ({ input }) => {
    for (const studentId of input.studentIds) {
      await db.update(students)
        .set({
          currentAssignments: sql`array_append(coalesce("currentAssignments", '{}'), ${input.assignmentId})`
        })
        .where(eq(students.id, studentId));
    }

    return { message: "Assigned to selected students." };
  }),


  // Remove assignment from all students
  removeAssignmentFromAllStudents: publicProcedure
    .input(z.object({ assignmentId: z.number() }))
    .mutation(async ({ input }) => {
      await db.execute(sql`
        UPDATE ${students}
        SET currentAssignments = array_remove(currentAssignments, ${input.assignmentId})
        WHERE ${students.currentAssignments} @> ARRAY[${input.assignmentId}]
      `);

      return { message: "Assignment removed from all students." };
    }),

  //get current assignments (due today or in the future - or not submitted)
  getCurrAssignments: publicProcedure
    .input(z.object({ studentId: z.number(), page: z.number().optional() }))
    .query(async ({ input }) => {
      const page = input.page || 1;
      const limit = 10;
      const offset = (page - 1) * limit;
      return await db.select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        due_date: assignments.due_date,
        level: assignments.level
      })
      .from(assignments)
      .where(
        sql`due_date >= CURRENT_DATE AND NOT (${input.studentId} = ANY (assignments.submission_ids))`
      )
      .limit(limit)
      .offset(offset);
    }),

  //get past assignments (due date before today or submitted)
  getPastAssignments: publicProcedure
    .input(z.object({ studentId: z.number(), page: z.number().optional() }))
    .query(async ({ input }) => {
      const page = input.page || 1;
      const limit = 10;
      const offset = (page - 1) * limit;
      return await db.select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        due_date: assignments.due_date,
        level: assignments.level
      })
      .from(assignments)
      .where(
        sql`due_date < CURRENT_DATE OR EXISTS (
          SELECT 1 FROM submission
          WHERE submission.assignment_id = assignment.id
          AND submission.student_id = ${input.studentId}
        )`
      )
      .limit(limit)
      .offset(offset);
    }),

  // add submission to assignment submission ids array
  addSubmissionToAssignment: publicProcedure
    .input(z.object({ assignmentId: z.number(), submissionId: z.number() }))
    .mutation(async ({ input }) => {
      const updatedAssignment = await db.update(assignments)
        .set({
          submission_ids: sql`array_append(coalesce(submission_ids, '{}'), ${input.submissionId})`
        })
        .where(eq(assignments.id, input.assignmentId))
        .returning();

      if (updatedAssignment.length === 0) {
        throw new Error("Error: Assignment Not Found");
      }
      return updatedAssignment[0];
    }),

  //get all submission ids or none from assignment
  getSubmissionIds: publicProcedure
    .input(z.object({ assignmentId: z.number() }))
    .query(async ({ input }) => {
      const result = await db.select({ submissionIds: assignments.submission_ids })
        .from(assignments)
        .where(eq(assignments.id, input.assignmentId))
        .limit(1);

      const submissionIds = result[0]?.submissionIds;
      return Array.isArray(submissionIds) ? submissionIds : [];
    }),

  //get all Assignments
  getAssignments: publicProcedure
    .query(async () => {
      const assignmentsResult = await db.select().from(assignments);
      if (!assignmentsResult || assignmentsResult.length === 0) {
        throw new Error("No assignments found.");
      }
      return assignmentsResult;
    }),

  //get one assignment by id
  getAssignmentByID: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const assignment = await db.select().from(assignments).where(eq(assignments.id, input.id));
      if (assignment.length === 0) throw new Error("Error: Assignment Not Found");
      return assignment[0];
    }),

  //get assignments by array of ids
  getAssignmentsByArrayIds: publicProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .query(async ({ input }) => {
      return await db.select().from(assignments).where(inArray(assignments.id, input.ids));
    }),

  //get the count of all assignments in the db
  getTotalAssignmentCount: publicProcedure
    .query(async () => {
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(assignments);
      return countResult[0]?.count ?? 0;
    }),

  //update Assignment
  updateAssignment: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      due_date: z.date().optional(),
      level: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const updateData: any = {};
      if (input.title) updateData.title = input.title;
      if (input.description) updateData.description = input.description;
      if (input.due_date) updateData.due_date = input.due_date.toISOString().split('T')[0];
      if (input.level) updateData.level = input.level;

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
      await db.execute(sql`
        UPDATE ${students}
        SET currentAssignments = array_remove(currentAssignments, ${input.id})
        WHERE ${students.currentAssignments} @> ARRAY[${input.id}]
      `);

      const deletedAssignment = await db.delete(assignments).where(eq(assignments.id, input.id)).returning();

      if (deletedAssignment.length === 0) throw new Error("Error: Assignment Not Found");

      return { message: "Assignment Deleted Successfully", assignment: deletedAssignment[0] };
    }),

});
