/**
 * Brand tokens live in one place so the product can be renamed
 * without invasive code changes.
 */
export const brand = {
  productName: "Keel",
  productShortName: "Keel",
  descriptor: "Engineering Learning OS",
  tagline: "Learn the systems. Operate the company.",
  description:
    "Keel is an engineering learning OS. Study the path from computing foundations to staff-level AI platform engineering, then prove the same skills inside a simulated production company.",
} as const;

export const companyBrand = {
  name: "Northstar Systems",
  shortName: "Northstar",
  domain: "northstar.internal",
} as const;

export type Brand = typeof brand;
export type CompanyBrand = typeof companyBrand;
