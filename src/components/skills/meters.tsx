import { DIMENSION_LABELS, type DimensionScore, type SkillDimension } from "@/lib/skills/types";
import { cn } from "@/lib/utils";

export function Bar({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={cn("space-y-1", className)}>
      {label ? (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
      ) : null}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const ORDER: SkillDimension[] = ["conceptual", "implementation", "debugging", "operational"];

export function DimensionStack({ dimensions }: { dimensions: DimensionScore[] }) {
  const map = Object.fromEntries(dimensions.map((d) => [d.dimension, d]));
  return (
    <div className="space-y-2.5">
      {ORDER.map((id) => (
        <Bar key={id} label={DIMENSION_LABELS[id]} value={map[id]?.score ?? 0} />
      ))}
    </div>
  );
}
