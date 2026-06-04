import { z } from "zod";

const namePattern = /^[a-zA-Z0-9_\-一-龥]+$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;

export const emailSchema = z
  .string()
  .trim()
  .min(1, "请输入邮箱")
  .max(120, "邮箱过长")
  .email("邮箱格式不正确");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "昵称至少 2 个字符")
  .max(24, "昵称最多 24 个字符")
  .regex(namePattern, "昵称仅支持中英文、数字、下划线、连字符");

export const passwordSchema = z
  .string()
  .min(8, "密码至少 8 位")
  .max(64, "密码最多 64 位")
  .regex(passwordPattern, "密码需同时包含字母和数字");

export const tokenSchema = z.string().min(16, "令牌无效").max(128, "令牌无效");

export const registerSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "请输入密码").max(64, "密码过长"),
});

export const forgotSchema = z.object({
  email: emailSchema,
});

export const resetSchema = z.object({
  token: tokenSchema,
  password: passwordSchema,
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "请输入当前密码").max(64),
    newPassword: passwordSchema,
  })
  .refine((v) => v.oldPassword !== v.newPassword, {
    message: "新密码不能与当前密码相同",
    path: ["newPassword"],
  });

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotInput = z.infer<typeof forgotSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
