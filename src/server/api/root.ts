import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { studentRouter } from "~/trpc/student";
import { auth } from "../auth";
import { authRouter } from "~/trpc/auth";
import { adminRouter } from "~/trpc/admin";
import { assignmentRouter } from "~/trpc/assignment";
import { pythonRouter } from "~/trpc/python";
import { submissionRouter } from "~/trpc/submission";


/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  student: studentRouter,
  auth: authRouter,
  admin: adminRouter,
  assignment: assignmentRouter,
  python: pythonRouter,
  submission: submissionRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
