import { z } from "zod";

const passwordRule = z.string().min(8);

export const bootstrapSchema = z.object({
  username: z.string().min(3),
  password: passwordRule
});

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(1)
});

export const changeUsernameSchema = z.object({
  username: z.string().min(3)
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordRule
});

export const spaceSchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  iconPath: z.string().nullable().optional(),
  iconUrl: z.string().nullable().optional()
});

export const categorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  iconPath: z.string().nullable().optional(),
  iconUrl: z.string().nullable().optional(),
  sortBy: z.string().optional(),
  numRows: z.number().min(1).max(10).optional(),
  spaceId: z.string().min(1)
});

export const bookmarkSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  iconPath: z.string().nullable().optional(),
  iconUrl: z.string().nullable().optional(),
  iconIsUploaded: z.boolean().optional(),
  serviceUrl: z.string().url(),
  openingMethod: z.enum(["same-tab", "new-tab", "iframe"]).optional(),
  spaceId: z.string().min(1),
  categoryId: z.string().min(1)
});

export const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number()
    })

  )
});

export const settingsSchema = z.object({
  theme: z.object({
    mode: z.enum(["light", "dark", "custom"]),
    primary: z.string(),
    accent: z.string(),
    font: z.string()
  }),
  layout: z.object({
    layoutMode: z.enum(["auto", "vertical", "horizontal"]),
    itemSize: z.enum(["small", "medium", "large"]),
    fitBoxMode: z.enum(["auto", "fit"]).optional()
  }),
  customCss: z.string().optional()
});

export const adminSettingsSchema = z.object({
  allowRegistration: z.boolean()
});

export const createUserSchema = z.object({
  username: z.string().min(3),
  password: passwordRule,
  role: z.enum(["admin", "user"])
});
