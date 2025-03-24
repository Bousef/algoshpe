import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `algoshpe_${name}`);

/*
export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ]
);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));*/

//--------------------  Tables --------------------

//student table
export const students = createTable(
  "student",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    ucf_id: d.integer().unique().notNull(),
    first_name: d.varchar({ length: 50 }),
    last_name: d.varchar({length: 50}),
    username: d.varchar({length: 50}).unique().notNull(),
    email: d.varchar({length: 50}).unique().notNull(),
    password: d.varchar({length: 50}).notNull(),
    attendance: d.integer(), 
    algoshpe_points: d.integer(),
    // assignments_completed: d.integer() 
  }
));

//admin table
export const admins = createTable(
  "admin",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    username: d.varchar({length: 50}).unique().notNull(),
    email: d.varchar({length: 50}).unique().notNull(),
    password: d.varchar({length: 50}).notNull(),
  }
));

//assignments table
export const assignments = createTable(
  "assignment",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    title: d.varchar({length: 100}).notNull(),
    description: d.text(), // long strings
    due_date: d.date()
  })
);

//submissions table
export const submissions = createTable(
    "submission",
    (d) => ({
        id: uuid("id").primaryKey().defaultRandom(),

        studentId: uuid("student_id")
        .notNull()
        .references(() => students.id),
    
        assignmentId: uuid("assignment_id")
        .notNull()
        .references(() => assignments.id),
    
        code: text("code").notNull(),
        output: text("output").notNull(),
    
        status: text("status").notNull(), 
    
        submittedAt: timestamp("submitted_at").defaultNow(),
        
    })
)

//comments table
export const comments = createTable(
  "comment",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),

    studentId: d.uuid("student_id")
    .notNull()
    .references(() => students.id),

    assignmentId: d.uuid("assignment_id")
        .notNull()
        .references(() => assignments.id),
    
    adminId: d.integer().references(() => admins.id),

    is_private: d.boolean(), //true or false based on if student wants to communicate only to admins
    meessage: d.text(),
    created_at: d.timestamp()
  })
);

//notes table 
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



