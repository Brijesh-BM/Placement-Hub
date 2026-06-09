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
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const recruiterSignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
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

export const attemptStartSchema = z.object({
  testId: z.string().uuid('Invalid test ID'),
});

export const recruiterInviteSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  jobId: z.string().uuid('Invalid job ID'),
  testId: z.string().uuid('Invalid test ID'),
});

export const roadmapProgressSchema = z.object({
  roadmapId: z.string().uuid('Invalid roadmap ID'),
  stepId: z.string().uuid('Invalid step ID'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
  collegeId: z.string().uuid('Invalid college ID').optional().nullable(),
  branch: z.string().optional().nullable(),
  gradYear: z.string().or(z.number()).optional().nullable(),
  cgpa: z.string().or(z.number()).optional().nullable(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().nullable().or(z.literal('')).or(z.string().regex(/^https?:\/\//, 'Must be a valid URL')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().nullable().or(z.literal('')).or(z.string().regex(/^https?:\/\//, 'Must be a valid URL')),
  skills: z.array(z.string()).optional(),
  targetRole: z.string().optional(),
});
