import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  college: z.string().optional(),
  branch: z.string().optional(),
  gradYear: z.string().or(z.number()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(1, 'Password is required').optional(),
  isGoogle: z.boolean().optional(),
  googleEmail: z.string().email('Invalid email address').optional(),
  googleName: z.string().optional(),
});

export const onboardingSchema = z.object({
  targetRole: z.string(),
  academicStage: z.string(),
  timeline: z.string(),
  objective: z.string(),
  targetCompanies: z.array(z.string()),
  confidence: z.record(z.string(), z.number()),
});

export const attemptSubmitSchema = z.object({
  attemptId: z.string().uuid('Invalid attempt ID'),
  answers: z.array(
    z.object({
      questionId: z.string().uuid('Invalid question ID'),
      selectedOption: z.number().nullable(),
      markedForReview: z.boolean().optional(),
    })
  ),
});

export const jobCreateSchema = z.object({
  title: z.string().min(2),
  company: z.string().min(2),
  description: z.string().min(10),
  location: z.string().min(2),
  salary: z.string().nullable().optional(),
  jobType: z.string(),
  applicationDeadline: z.string().nullable().optional(),
  requiredSkills: z.string().or(z.array(z.string())),
  experienceLevel: z.string(),
  collegeId: z.string().nullable().optional(),
  cgpaCutoff: z.string().or(z.number()).nullable().optional(),
  readinessCutoff: z.string().or(z.number()).nullable().optional(),
  testId: z.string().nullable().optional(),
});

export const questionCreateSchema = z.object({
  text: z.string().min(5),
  options: z.array(z.string()).min(2),
  correctAnswer: z.number().min(0).max(3),
  explanation: z.string().nullable().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  subCategoryId: z.string().uuid(),
  companyTags: z.array(z.string()).optional(),
});
