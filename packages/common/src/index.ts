import { z } from "zod";

export const SignupSchema = z.object({
  email: z.string().min(1).max(100).email(),
  password: z.string().min(1).max(50),
  name: z.string().min(1).max(50),
});

export const SigninSchema = z.object({
  email: z.string().min(1).max(100).email(),
  password: z.string().min(1).max(50),
});

export const RoomSchema = z.object({
  room_name: z.string(),
});
