import { publicProcedure, createTRPCRouter } from "src/server/api/trpc";
import { db } from "src/server/db";
import { students, admins } from "src/server/db/schema"; 
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";  
import jwt from "jsonwebtoken"; 

const JWT_SECRET = "ALGOSHPE2526";  

//generates jwt token - 5 hours
const generateToken = (user: any) => {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: '5h',
  });
};

export const authRouter = createTRPCRouter({
 
    //login for both admin and student
    login: publicProcedure
        .input(
            z.object({
                username: z.string(),
                password: z.string(),
            })
        )
        .mutation(async ({ input }) => {
    
        const admin = await db.select().from(admins).where(eq(admins.username, input.username));

        if (admin.length > 0) {
            const adminPassword = admin[0]?.password;
            if (!adminPassword) throw new Error("Error: Admin password not found");
        
            
            const isPasswordValid = await bcrypt.compare(input.password, adminPassword);
            if (!isPasswordValid) throw new Error("Error: Invalid Password");
        
            
            const token = generateToken(admin[0]);
            return { token, user: admin[0], role: 'Admin', error: ' ' };
        }

        const student = await db.select().from(students).where(eq(students.username, input.username));

        if (student.length > 0) {
            const studentPassword = student[0]?.password;
            if (!studentPassword) throw new Error("Error: Student password Not Found");

            const isPasswordValid = await bcrypt.compare(input.password, studentPassword);
            if (!isPasswordValid) throw new Error("Error: Invalid password");

            const token = generateToken(student[0]);
            return { token, user: student[0], role: 'Student', error : ' '};
        }

        throw new Error("Error: User Not Found"); //dne!
        }),
});