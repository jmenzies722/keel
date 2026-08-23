import { z } from "zod";

export const ReferenceSchema = z.object({
  title: z.string(),
  href: z.string().optional(),
  kind: z.enum(["standard", "man", "vendor", "cncf", "book"]),
  note: z.string().optional(),
});

export const LessonIdentitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  phaseSlug: z.string(),
  moduleSlug: z.string(),
  title: z.string(),
  objectives: z.array(z.string()).min(1),
  skillIds: z.array(z.string()).min(1),
  sections: z.array(z.object({ id: z.string(), kind: z.string(), title: z.string() })).min(4),
});

export const IncidentIdentitySchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: z.enum(["SEV-1", "SEV-2", "SEV-3", "SEV-4"]),
  requiredSkills: z.array(z.string()).min(1),
  rootCause: z.object({ id: z.string(), summary: z.string(), detail: z.string() }),
  resolution: z.object({
    requiredDiscoveries: z.array(z.string()).min(1),
    requiredState: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    successMessage: z.string(),
  }),
});
