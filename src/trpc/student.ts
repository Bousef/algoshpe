/*
Students:
getStudent [ID]
getAllStudents [paging needed]
createStudent
updateStudent [ID]
deleteStudent [ID]
*/

import { publicProcedure, createTRPCRouter } from "src/server/api/trpc";
import { db } from "src/server/db";
import { students } from "src/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";  

export const studentRouter = createTRPCRouter({

  //create student
  createStudent: publicProcedure
    .input(
      z.object({
        ucf_id: z.number(),
        first_name: z.string(),
        last_name: z.string().optional(),
        username: z.string(),
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const existingStudent = await db
      .select()
      .from(students)
      .where(eq(students.username, input.username));

      if (existingStudent.length > 0) {
        throw new Error("Error: Username already exists");
      }

      const hashedPassword = await bcrypt.hash(input.password.slice(0, 50), 10);
      
      const existingEmail = await db
        .select()
        .from(students)
        .where(eq(students.email, input.email));

      if (existingEmail.length > 0) {
        throw new Error("Error: Email already in use");
      }

      // Insert new student with the hashed password
      const newStudent = await db
      .insert(students)
      .values({
        ...input,
        password: hashedPassword,
        attendance: 0,
        algoshpe_points: 0,
      })
      .returning();

      return newStudent[0];
    }),

  //get all students
  getStudents: publicProcedure
    .input(z.object({ page: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      return await db.select().from(students).limit(limit).offset(offset);
    }),

  //get one student by id
  getStudentById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const student = await db.select().from(students).where(eq(students.id, input.id));

      if (student.length === 0) throw new Error("Error: Student Not Found");

      return student[0];
    }),

  //update student 
  updateStudent: publicProcedure
    .input(
      z.object({
        id: z.number(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        username: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().optional(),
        attendance: z.number().optional(),
        algoshpe_points: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updatedStudent = await db.update(students)
        .set(input)
        .where(eq(students.id, input.id))
        .returning();

      if (updatedStudent.length === 0) throw new Error("Error: Student Not Found");

      return updatedStudent[0];
    }),

  //delete student
  deleteStudent: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const deletedStudent = await db.delete(students).where(eq(students.id, input.id)).returning();

      if (deletedStudent.length === 0) throw new Error("Error: Student Not Found");

      return { message: "Student deleted successfully", student: deletedStudent[0] };
    }),

    //get all assignments
  getStudentAssignments: publicProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const student = await db.query.students.findFirst({
        where: (s, { eq }) => eq(s.id, input.studentId),
      });

      if (!student) throw new Error("Student not found");

      return {
        current: student.currentAssignments ?? [],
        past: student.pastAssignments ?? [],
      };
  }),

  //should update assignment status
  updateAssignmentStatus: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        assignmentId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const student = await db.query.students.findFirst({
        where: (s, { eq }) => eq(s.id, input.studentId),
      });

      if (!student) throw new Error("Student not found");

      const current = student.currentAssignments ?? [];
      const past = student.pastAssignments ?? [];

      const updatedCurrent = current.filter(id => id !== input.assignmentId);
      const updatedPast = past.includes(input.assignmentId)
        ? past
        : [...past, input.assignmentId];

      await db.update(students)
        .set({
          currentAssignments: updatedCurrent,
          pastAssignments: updatedPast,
        })
        .where(eq(students.id, input.studentId));

      return { success: true };
  }),
});