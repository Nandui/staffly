import { z } from "zod";

// Auth-only validation (the first-run admin bootstrap). All other domain
// validation lives in src/lib/staffly/validation.ts.
const passwordField = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(100, "That password is too long");

export const firstAdminSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(160),
  password: passwordField,
});
export type FirstAdminInput = z.infer<typeof firstAdminSchema>;
