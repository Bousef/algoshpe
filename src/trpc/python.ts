import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "~/server/api/trpc";
import { exec } from "child_process";

export const pythonRouter = createTRPCRouter({
  run: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(({ input }) => {
      return new Promise<{ output: string }>((resolve) => {
        // Escape double quotes and backslashes
        const safeCode = input.code.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

        exec(`python3 -c "${safeCode}"`, (error, stdout, stderr) => {
          if (error || stderr) {
            resolve({ output: stderr || error?.message || "Unknown error" });
          } else {
            resolve({ output: stdout || "No output" });
          }
        });
      });
    }),
});