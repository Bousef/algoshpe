import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `algoshpe_${name}`);


//--------------------  Tables --------------------

//student table
export const students = createTable(
  "student",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    ucf_id: d.integer().unique().notNull(),
    first_name: d.varchar({ length: 100 }),
    last_name: d.varchar({ length: 100 }),
    username: d.varchar({ length: 100 }).unique().notNull(),
    email: d.varchar({ length: 100 }).unique().notNull(),
    password: d.varchar({ length: 100 }).notNull(),
    attendance: d.integer(),
    algoshpe_points: d.integer(),
  })
);

//admin table
export const admins = createTable(
  "admin",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    username: d.varchar({ length: 100 }).unique().notNull(),
    email: d.varchar({ length: 100 }).unique().notNull(),
    password: d.varchar({ length: 100 }).notNull(),
  })
);
//assignments table
export const assignments = createTable(
  "assignment",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    title: d.varchar({ length: 100 }).notNull(),
    description: d.text(),
    due_date: d.date(),
  })
);


//submissions table
export const submissions = createTable(
  "submission",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

    studentId: d.integer("student_id")
      .references(() => students.id),

    assignmentId: d.integer("assignment_id")
      .notNull()
      .references(() => assignments.id),

    code: text("code").notNull(),
    output: text("output").notNull(),
    status: text("status").notNull(),
    submittedAt: timestamp("submitted_at").defaultNow(),
  })
);


//comments table
export const comments = createTable(
  "comment",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

    studentId: d.integer("student_id")
      .notNull()
      .references(() => students.id),

    assignmentId: d.integer("assignment_id")
      .notNull()
      .references(() => assignments.id),

    adminId: d.integer("admin_id")
      .references(() => admins.id), // optional

    is_private: d.boolean(),
    message: d.text(),
    created_at: d.timestamp(),
  })
);

//notes table  - shpe tech committee task!
// export const notes = createTable(
//   "note",
//   (d) => ({
//     id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
//     title: d.varchar({ length: 100 }).notNull(),
//     content: d.text().notNull(), 
//     adminId: d.integer("admin_id").notNull().references(() => admins.id),
//     created_at: d.timestamp("created_at").defaultNow(),
//   })
// );


//materials table 
export const materials = createTable(
  "material",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    title: d.varchar({length: 100}).notNull(),
    file_url: d.varchar({ length: 255 }), // Column for storing file URL
    uploaded: d.timestamp()
  })
);

// --------------------  Relations --------------------

//Admin Relations - assingments, comments, upload material
export const adminsRelations = relations(admins, ({ many }) => ({
  assignments: many(assignments),
  comments: many(comments),
  materials: many(materials)
}));

//Student Relations - submissions, comments, notes
export const studentRelations = relations(students, ({ many }) => ({
  submissions: many(submissions),
  comments: many(comments)
 // notes: many(notes)
}));

//Submissions - single submission is related to a single student, single submission is related to a single assignment
export const submissionsRelations = relations(submissions, ({ one }) => ({
  student: one(students, {
    fields: [submissions.studentId], 
    references: [students.id]
  }),
  assignment: one(assignments, {
    fields: [submissions.assignmentId], 
    references: [assignments.id]
  })
}));

//Assignment - submission, comments
export const assignmentsRelations = relations(assignments, ({ many }) => ({
  submissions: many(submissions),
  comments: many(comments),
}));

//Comments - 1 student, 1 assignment, 1 admin
export const commentsRelations = relations(comments, ({ one }) => ({
  student: one(students, {
    fields: [comments.studentId],
    references: [students.id],
  }),
  assignment: one(assignments, {
    fields: [comments.assignmentId],
    references: [assignments.id],
  }),
  admin: one(admins, {
    fields: [comments.adminId],
    references: [admins.id],
  }),
}));

// //Notes -
// export const notesRelations = relations(notes, ({ one }) => ({
//   admin: one(admins, {
//     fields: [notes.adminId],
//     references: [admins.id],
//   }),
// }));



