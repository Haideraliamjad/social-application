import * as z from "zod";

export const signUpValidationSchema = z.object({
  name: z.string().min(2, "too short"),
  username: z.string().min(2, "too short"),
  email: z.string().email(),
  password: z.string().min(8, "password must be atleast 8 characters"),
});

export const signInValidationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "password is required"),
});

export const postValidationSchema = z.object({
  caption: z.string().min(5).max(2200),
  file: z.custom<File[]>(),
  location: z.string().min(2).max(100),
  tags: z.string(),
});
