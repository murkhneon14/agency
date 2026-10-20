import { z } from "zod";

const safeText = (max) => z.string().trim().min(1).max(max);

export const projectRequestSchema = z.object({
  name: safeText(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(120).optional().default(""),
  service: safeText(80),
  budget: z.enum(["under-50k", "50k-2l", "2l-5l", "5l-plus", "not-sure"]),
  timeline: z.enum(["asap", "1-2-months", "3-6-months", "flexible"]),
  description: safeText(5000),
});

export const contactMessageSchema = z.object({
  name: safeText(120),
  email: z.string().trim().email().max(254),
  subject: safeText(180),
  message: safeText(5000),
  website: z.string().max(300).optional().default(""),
});

export const adminRequestStatusSchema = z.object({
  status: z.enum(["new", "reviewing", "proposal_sent", "accepted", "declined", "archived"]),
});

export const projectCreateSchema = z.object({
  clientId: z.string().uuid(),
  requestId: z.string().uuid().optional().nullable(),
  name: safeText(160),
  description: z.string().trim().max(5000).optional().default(""),
  totalPricePaise: z.number().int().nonnegative().max(100_000_000_00),
  startDate: z.string().date().optional().nullable(),
  expectedCompletionDate: z.string().date().optional().nullable(),
  milestones: z.array(z.object({
    title: safeText(160),
    description: z.string().trim().max(2000).optional().default(""),
    pricePaise: z.number().int().nonnegative().max(100_000_000_00),
    dueDate: z.string().date().optional().nullable(),
  })).min(1).max(40),
}).refine((value) => value.milestones.reduce((total, item) => total + item.pricePaise, 0) === value.totalPricePaise, {
  message: "Milestone prices must add up to the total project price.",
  path: ["milestones"],
});

export const clientPaymentSchema = z.object({
  projectId: z.string().uuid(),
  amountPaise: z.number().int().positive().max(100_000_000_00),
  method: z.enum(["bank_transfer", "upi", "cash", "other"]).default("bank_transfer"),
  reference: z.string().trim().max(180).optional().default(""),
  note: z.string().trim().max(1000).optional().default(""),
});

export const paymentReviewSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  adminNote: z.string().trim().max(1000).optional().default(""),
});

export const proposalCreateSchema = z.object({
  requestId: z.string().uuid(),
  title: safeText(160),
  description: z.string().trim().max(5000).optional().default(""),
  expiresAt: z.string().date().optional().nullable(),
  milestones: z.array(z.object({
    title: safeText(160),
    description: z.string().trim().max(2000).optional().default(""),
    pricePaise: z.number().int().nonnegative().max(100_000_000_00),
    dueDate: z.string().date().optional().nullable(),
  })).min(1).max(40),
});
export const proposalRevisionSchema = proposalCreateSchema.omit({ requestId: true });

export const invoiceCreateSchema = z.object({
  projectId: z.string().uuid(),
  dueDate: z.string().date().optional().nullable(),
  milestoneIds: z.array(z.string().uuid()).max(40).optional().default([]),
});

export const portfolioProjectSchema = z.object({
  title: safeText(160),
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: safeText(5000),
  category: safeText(80),
  technologies: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  demoUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  isDemo: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(10000).default(0),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const signupSchema = z.object({
  fullName: safeText(120),
  email: z.string().trim().email("Enter a valid email address").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(254),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

