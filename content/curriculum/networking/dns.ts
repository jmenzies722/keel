import type { Lesson } from "@/lib/curriculum/types";

export const dnsLesson: Lesson = {
  id: "networking/dns",
  slug: "dns",
  phaseSlug: "networking",
  moduleSlug: "application",
  order: 1,
  title: "DNS",
  description:
    "How a name becomes an address — resolvers, records, caches, and the files that quietly override all of them.",
  durationMin: 35,
  objectives: [
    "Describe stub → recursive resolver → authoritative server.",
    "Read A, AAAA, CNAME, and NXDOMAIN as different outcomes.",
    "Use dig to ask a specific resolver, not “the internet.”",
    "Check /etc/hosts before accusing the zone.",
  ],
  skillIds: ["net.dns", "net.tcpip"],
  relatedIncidentIds: ["broken-dns"],
  mentorContext:
    "Learner is on DNS. Ask which resolver they queried. Do not reveal the hosts-file incident.",
  sections: [
    {
      id: "objective",
      kind: "objective",
      title: "Objective",
      blocks: [
        {
          kind: "text",
          md: "A process binds a port. A **name** is how humans and configs find that process. When checkout “is down,” a surprising fraction of the time the process is healthy and the **lookup** is wrong.",
        },
      ],
    },
    {
      id: "mental-model",
      kind: "mental-model",
      title: "Mental model",
      blocks: [
        {
          kind: "text",
          md: "DNS is a distributed database with a caching front-end.\n\n1. The **stub** (your libc, your browser) asks a recursive resolver.\n2. The **recursive resolver** walks from the root if it has no cache: root → TLD → authoritative.\n3. The **authoritative** server owns the zone and returns a record — or NXDOMAIN.\n\nTTL is how long a cache is allowed to lie. `/etc/hosts` is a local override that **skips DNS entirely**.",
        },
      ],
    },
    {
      id: "visualization",
      kind: "visualization",
      title: "Resolution path",
      blocks: [
        { kind: "visualization", visualization: "dns-resolution", caption: "One query, four possible answers." },
      ],
    },
    {
      id: "explanation",
      kind: "explanation",
      title: "Records and tools",
      blocks: [
        {
          kind: "text",
          md: "- **A / AAAA** — name → IPv4 / IPv6\n- **CNAME** — name → another name (then look again)\n- **NXDOMAIN** — this name does not exist in the zone\n- **SERVFAIL** — the resolver had a problem; not the same as NXDOMAIN\n\n`dig checkout.northstar.internal` uses the configured resolver. `dig @10.0.0.53 checkout.northstar.internal` asks a specific one. The difference between those two answers *is* the incident.",
        },
        {
          kind: "example",
          title: "Ask a named resolver",
          language: "bash",
          code: "dig +short @10.0.0.53 checkout.northstar.internal A",
          md: "If this disagrees with `getent hosts` or `ping`, something on the box is overriding the zone — often `/etc/hosts`.",
        },
      ],
    },
    {
      id: "exercise",
      kind: "exercise",
      title: "Try it",
      blocks: [
        {
          kind: "terminal",
          runtimeId: "dns-lab",
          title: "Compare stub and authority",
          brief: "On lab-dns, resolve checkout.northstar.internal with getent and with dig @10.0.0.53. Note whether they agree.",
          successDiscoveries: ["hosts-override", "auth-record"],
        },
      ],
    },
    {
      id: "production",
      kind: "production",
      title: "Why this matters in production",
      blocks: [
        {
          kind: "text",
          md: "Kubernetes DNS, Consul, Route 53, and an AI gateway’s model hostname are the same object. Split-horizon DNS (different answers inside vs outside) is normal. Debugging without naming **which resolver** you asked is superstition.",
        },
      ],
    },
    {
      id: "failure-mode",
      kind: "failure-mode",
      title: "Failure mode",
      blocks: [
        {
          kind: "callout",
          variant: "failure",
          title: "The laptop fix",
          md: "An engineer adds a line to `/etc/hosts` to “unblock” themselves. It works. Six months later a cutover updates the zone and one production box still has the override. Symptoms: “DNS is fine, I just dig’d it.” They dig’d the resolver, not the stub.",
        },
      ],
    },
    {
      id: "knowledge-check",
      kind: "knowledge-check",
      title: "Knowledge check",
      blocks: [
        {
          kind: "quiz",
          id: "dns-quiz",
          title: "DNS",
          skillIds: ["net.dns"],
          questions: [
            {
              id: "q1",
              prompt: "dig @8.8.8.8 returns the new A record. getent hosts on the server returns the old IP. Most likely?",
              options: [
                { id: "a", text: "The zone is wrong.", explanation: "The named resolver has the new record." },
                { id: "b", text: "A local override (hosts file or nsswitch) is winning on the server.", explanation: "Correct." },
                { id: "c", text: "TCP is blocked.", explanation: "You already got an IP from getent." },
                { id: "d", text: "The process is down.", explanation: "You have not reached the process yet." },
              ],
              correctOptionId: "b",
            },
            {
              id: "q2",
              prompt: "NXDOMAIN means:",
              options: [
                { id: "a", text: "The resolver timed out.", explanation: "That is more like SERVFAIL / timeout." },
                { id: "b", text: "The name does not exist at the authoritative zone.", explanation: "Correct." },
                { id: "c", text: "The port is closed.", explanation: "DNS has not become a TCP connect yet." },
                { id: "d", text: "TLS failed.", explanation: "Wrong layer." },
              ],
              correctOptionId: "b",
            },
          ],
        },
      ],
    },
    {
      id: "lab",
      kind: "lab",
      title: "Lab",
      blocks: [
        {
          kind: "lab",
          id: "dns-hosts-lab",
          title: "Remove the override",
          brief: "Identify the /etc/hosts line that disagrees with the authoritative A record. Remove it. Confirm getent and dig @10.0.0.53 agree.",
          runtimeId: "dns-lab",
          successDiscoveries: ["hosts-cleared", "resolution-agrees"],
          skillIds: ["net.dns"],
        },
      ],
    },
    {
      id: "related-mission",
      kind: "related-mission",
      title: "Related company mission",
      blocks: [
        {
          kind: "related-mission",
          incidentId: "broken-dns",
          title: "Northstar · checkout.northstar.internal",
          md: "A cutover updated the zone. One production resolver path still disagrees. Customers see failures. The API process is not the first instrument.",
        },
      ],
    },
    {
      id: "references",
      kind: "references",
      title: "References",
      blocks: [
        {
          kind: "references",
          items: [
            { kind: "standard", title: "RFC 1034 / 1035 — Domain names", note: "IETF" },
            { kind: "man", title: "dig(1), hosts(5), nsswitch.conf(5)", note: "Linux man-pages" },
          ],
        },
      ],
    },
  ],
};
