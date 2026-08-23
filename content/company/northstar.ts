import { companyBrand } from "@/lib/brand";
import type { Company } from "@/lib/simulator/types";

export const NORTHSTAR: Company = {
  id: "northstar",
  name: companyBrand.name,
  domain: companyBrand.domain,
  about:
    "A B2B commerce platform that grew from a single VM to an AI-assisted product suite. You are on the engineering staff. The infrastructure evolves as your demonstrated competence does.",
  defaultStage: "startup",
  stages: [
    {
      id: "startup",
      order: 1,
      title: "Startup",
      role: "Junior Engineer",
      summary: "One API, one VM, PostgreSQL, DNS, a thin CI pipeline.",
      infrastructure: ["api-01 (VM)", "checkout-api.service", "PostgreSQL 16", "DNS · northstar.internal", "GitHub Actions"],
    },
    {
      id: "saas",
      order: 2,
      title: "Growing SaaS",
      role: "DevOps Engineer",
      summary: "Load balancer, multiple services, Redis, AWS, Terraform, Docker.",
      infrastructure: ["ALB", "checkout + catalog + identity", "Redis", "RDS", "Terraform", "ECR"],
    },
    {
      id: "cloud-native",
      order: 3,
      title: "Cloud-native",
      role: "Platform / SRE Engineer",
      summary: "EKS, Argo CD, Prometheus, Grafana, OpenTelemetry.",
      infrastructure: ["EKS", "Argo CD", "Prometheus", "Grafana", "OTel Collector"],
    },
    {
      id: "internal-platform",
      order: 4,
      title: "Internal platform",
      role: "Platform Engineer",
      summary: "Developer portal, catalog, templates, platform API.",
      infrastructure: ["Portal", "Software catalog", "Golden-path templates", "Platform API"],
    },
    {
      id: "ai-company",
      order: 5,
      title: "AI company",
      role: "AI Platform Engineer",
      summary: "Gateway, registry, GPU nodes, vLLM, KServe.",
      infrastructure: ["AI Gateway", "Model registry", "vLLM", "KServe", "H100 pool", "DCGM"],
    },
    {
      id: "ai-scale",
      order: 6,
      title: "AI at scale",
      role: "Senior AI Platform Engineer",
      summary: "Multi-region control plane, tenant GPU pools, several serving stacks.",
      infrastructure: ["Multi-region AWS", "Control plane", "GPU pools", "Shared + dedicated serving"],
    },
    {
      id: "agentic",
      order: 7,
      title: "Agentic enterprise",
      role: "Staff AI Platform Engineer",
      summary: "Humans, product services, and agents on governed interfaces.",
      infrastructure: ["MCP gateway", "Agent identity", "Tool permissions", "Audit + cost"],
    },
  ],
};
