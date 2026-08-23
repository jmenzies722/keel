import { notFound } from "next/navigation";
import { INCIDENTS, getIncident } from "@content/incidents";
import { IncidentWorkspace } from "@/components/company/incident-workspace";

export function generateStaticParams() {
  return INCIDENTS.map((incident) => ({ id: incident.id }));
}

export default async function IncidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scenario = getIncident(id);
  if (!scenario) notFound();
  return <IncidentWorkspace scenario={scenario} />;
}
