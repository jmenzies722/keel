import Link from "next/link";

const LABS = [
  { href: "/learn/computing-foundations/representation", title: "Binary inspector", where: "Data representation" },
  { href: "/learn/linux-os/processes", title: "Stop the runaway worker", where: "Linux Processes" },
  { href: "/learn/networking/dns", title: "Remove the hosts override", where: "DNS" },
  { href: "/learn/kubernetes/workloads", title: "Restore checkout-db secret", where: "Kubernetes workloads" },
  { href: "/company/incidents/inference-kv-cache", title: "Diagnose KV-cache admission", where: "vLLM preview mission" },
];

export default function LabsPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-medium tracking-tight">Labs</h1>
      <p className="text-muted-foreground">
        Scored environments. Completing them writes implementation or debugging evidence — not a page view.
      </p>
      <ul className="space-y-3">
        {LABS.map((lab) => (
          <li key={lab.href} className="rounded-lg p-4 ring-1 ring-foreground/10">
            <Link href={lab.href} className="font-medium hover:underline">
              {lab.title}
            </Link>
            <p className="text-sm text-muted-foreground">{lab.where}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
