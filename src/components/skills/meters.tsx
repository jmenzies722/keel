import { DIMENSION_LABELS, type DimensionScore, type SkillDimension } from "@/lib/skills/types";
import { Progress } from "@/components/ui/progress";
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
      <Progress value={pct} aria-label={label ?? "Skill progress"} className="[&_[data-slot=progress-track]]:h-1.5" />
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
