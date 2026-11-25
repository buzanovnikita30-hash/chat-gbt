import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(3, "Введите email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export const registerSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Введите корректный email"),
});

export const newPasswordSchema = z.object({
  password: z.string().min(8, "Минимум 8 символов"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export const checkoutStep2Schema = z.object({
  accountEmail: z.string().email("Введите email аккаунта ChatGPT"),
});

export const profileUpdateSchema = z.object({
  username: z.string().min(2, "Минимум 2 символа").optional(),
  telegram_username: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
export type CheckoutStep2Input = z.infer<typeof checkoutStep2Schema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
