import * as z from "zod";

export const signUpValidationSchema = z.object({
  name: z.string().min(2, "too short"),
  username: z.string().min(2, "too short"),
  email: z.string().email(),
  password: z.string().min(8, "password must be atleast 8 characters"),
});
