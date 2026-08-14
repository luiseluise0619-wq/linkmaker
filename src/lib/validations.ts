import { z } from "zod";
import { SLUG_MAX, SLUG_MIN, SLUG_PATTERN } from "./slug";

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === "" ? undefined : v));

const utmField = optionalTrimmedString(255);

export const slugSchema = z
  .string()
  .trim()
  .min(SLUG_MIN, `Slug must be at least ${SLUG_MIN} characters.`)
  .max(SLUG_MAX, `Slug must be at most ${SLUG_MAX} characters.`)
  .regex(SLUG_PATTERN, "Slug may only contain letters, numbers, - and _.");

export const createLinkSchema = z.object({
  destinationUrl: z.string().trim().min(1, "Destination URL is required."),
  slug: slugSchema.optional().or(z.literal("").transform(() => undefined)),
  title: optionalTrimmedString(200),
  description: optionalTrimmedString(1000),
  campaignId: z.string().trim().optional().transform((v) => (v ? v : undefined)),
  expiresAt: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .refine(
      (v) => v === undefined || !Number.isNaN(Date.parse(v)),
      "Invalid expiration date.",
    ),
  utmSource: utmField,
  utmMedium: utmField,
  utmCampaign: utmField,
  utmTerm: utmField,
  utmContent: utmField,
});

export const updateLinkSchema = z.object({
  destinationUrl: z.string().trim().min(1).optional(),
  slug: slugSchema.optional(),
  title: optionalTrimmedString(200),
  description: optionalTrimmedString(1000),
  campaignId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  expiresAt: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v))
    .refine(
      (v) => v === undefined || v === null || !Number.isNaN(Date.parse(v)),
      "Invalid expiration date.",
    ),
  utmSource: utmField.nullable(),
  utmMedium: utmField.nullable(),
  utmCampaign: utmField.nullable(),
  utmTerm: utmField.nullable(),
  utmContent: utmField.nullable(),
});

export const createCampaignSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  description: optionalTrimmedString(500),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
