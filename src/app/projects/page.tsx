import Link from "next/link";

export default function ProjectsPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-medium tracking-tight">Projects</h1>
      <p className="text-muted-foreground">
        Projects are larger than a quiz. The first authored artifact is a conversion library — it only appears in your portfolio if the tests pass.
      </p>
      <ul className="space-y-3">
        <li className="rounded-lg p-4 ring-1 ring-foreground/10">
          <Link href="/learn/computing-foundations/representation" className="font-medium hover:underline">
            Binary inspector
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            Implement toBinary, toHex, and fromBinary. Lives inside Data representation.
          </p>
        </li>
        <li className="rounded-lg p-4 text-sm text-muted-foreground ring-1 ring-foreground/10">
          Later catalog: CLI, REST API, Terraform module, Helm package, inference platform. Not listed as complete until they exist.
        </li>
      </ul>
    </div>
  );
}
