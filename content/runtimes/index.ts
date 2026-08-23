import type { TerminalRuntimeSpec } from "@/lib/simulator/types";
import { checkoutRuntime } from "./checkout-api";
import { dnsRuntime } from "./dns";
import { inferenceRuntime } from "./inference";
import { k8sRuntime } from "./k8s";
import { linuxExploreRuntime, linuxLabRuntime } from "./linux-processes";

export const RUNTIMES: Record<string, TerminalRuntimeSpec> = {
  [linuxExploreRuntime.id]: linuxExploreRuntime,
  [linuxLabRuntime.id]: linuxLabRuntime,
  [checkoutRuntime.id]: checkoutRuntime,
  [inferenceRuntime.id]: inferenceRuntime,
  [dnsRuntime.id]: dnsRuntime,
  [k8sRuntime.id]: k8sRuntime,
};

export function getRuntime(id: string): TerminalRuntimeSpec {
  const runtime = RUNTIMES[id];
  if (!runtime) throw new Error(`Unknown terminal runtime: ${id}`);
  return runtime;
}
