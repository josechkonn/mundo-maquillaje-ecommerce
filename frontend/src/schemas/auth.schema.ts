import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es requerido")
    .email("Ingresa un correo válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "Mínimo 6 caracteres"),
});

export type LoginData = z.infer<typeof loginSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es requerido")
      .min(2, "Mínimo 2 caracteres"),
    email: z
      .string()
      .min(1, "El correo es requerido")
      .email("Ingresa un correo válido"),
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterData = z.infer<typeof registerSchema>;


// ─────────────────────────────────────────────────────────────────────────────
// FORGOT & UPDATE PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "El correo es requerido").email("Ingresa un correo válido"),
});
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;


export const updatePasswordSchema = z.object({
  password: z.string().min(1, "La nueva contraseña es requerida").min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
export type UpdatePasswordData = z.infer<typeof updatePasswordSchema>;

