// src/lib/schemas.ts
import { z } from "zod";

export const signupSchema = z.object({
  mobileNumber: z.string().min(10).max(10),
  username: z.string().min(3),
  fullName: z.string().min(3),
  password: z.string().min(6),
  otp: z.string().min(4).max(4),
});
