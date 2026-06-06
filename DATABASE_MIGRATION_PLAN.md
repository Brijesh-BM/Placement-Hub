# Database Migration Plan: SQLite to PostgreSQL

This document provides a roadmap to transition PlacementHub's database from the local SQLite development setup to a production-ready PostgreSQL environment (e.g., Neon or Supabase).

---

## 1. Current SQLite Development Setup
- **Provider**: SQLite (`file:./dev.db`)
- **Data Arrays**: Stored using database-level `Json` columns with a default of `'[]'` (via Prisma's `dbgenerated("'[]'")` mapping) to ensure compatibility with SQLite's lack of native array type support.
- **Ternary Parsing**: Handled safely in TypeScript via the `asStringArray` utility in [json.ts](file:///C:/Users/Brijesh%20M/.gemini/antigravity/scratch/placementhub/src/lib/json.ts) to avoid runtime crashes from mismatched or malformed data formats.

---

## 2. PostgreSQL Schema Upgrades
When migrating to PostgreSQL, the schema should be upgraded to use native PostgreSQL features rather than SQLite-compatible JSON arrays.

### Fields to Convert from `Json` to `String[]`
The following columns should be changed back to native PostgreSQL text array types (`String[]`):
1. **`OnboardingProfile.targetCompanies`**: `Json` ➔ `String[]`
2. **`RoadmapStep.topics`**: `Json` ➔ `String[]`
3. **`RecruiterJob.requiredSkills`**: `Json` ➔ `String[]`
4. **`CodingQuestion.companyTags`**: `Json` ➔ `String[]`
5. **`StudyPlan.targetCompanies`**: `Json` ➔ `String[]`
6. **`CollegePlacementReport.topRecruiters`**: `Json` ➔ `String[]`
7. **`PracticeSession.topicsRevised`**: `Json` ➔ `String[]`

---

## 3. Recommended Schema Normalizations (Relational Tables)
For higher scalability, instead of storing primitive arrays, you should consider normalize-refactoring these list fields into standalone relational tables:

1. **Company Tags / Target Companies**:
   - Create a `Company` table and link it via a many-to-many relationship (using join tables like `OnboardingTargetCompany` or `JobRequiredSkill`) rather than string lists.
2. **Job Skills**:
   - Create a standalone `Skill` model and link it via a many-to-many relationship to `RecruiterJob`. This allows index-optimized lookups and direct job recommendation matchmaking based on student skills.

---

## 4. Production Database Configuration
- **Recommended Host**: **Neon PostgreSQL** (serverless, scale-to-zero, instant branching) or **Supabase**.
- **Datasource Settings**:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```

---

## 5. Migration Execution Steps
Before launching the application publicly, execute the following steps in sequence:

1. **Schema Refactor**:
   - Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`.
   - Update the 7 fields listed in Section 2 from `Json` to `String[]` (remove any SQLite `dbgenerated` defaults).
2. **Environment Configuration**:
   - Update `DATABASE_URL` in your production `.env` file with the PostgreSQL connection string.
3. **Validate & Generate**:
   - Run `npx prisma validate` to confirm the PostgreSQL schema is valid.
   - Run `npx prisma generate` to rebuild types.
4. **Run Migrations**:
   - Run `npx prisma migrate dev --name init_postgresql` to create database tables and push the schema.
5. **Re-Seed**:
   - Run `npx prisma db seed` to populate the production tables with initial mock records.
6. **Deploy**:
   - Build and deploy the Next.js compilation (`npm run build`).
