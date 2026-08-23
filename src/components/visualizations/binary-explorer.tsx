"use client";

import { useMemo, useState } from "react";

export function BinaryExplorer() {
  const [value, setValue] = useState(75);

  const bits = useMemo(() => {
    const out: number[] = [];
    for (let i = 7; i >= 0; i--) out.push((value >> i) & 1);
    return out;
  }, [value]);

  function toggle(index: number) {
    const shift = 7 - index;
    setValue((v) => v ^ (1 << shift));
  }

  return (
    <div className="rounded-lg p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <label className="text-sm">
          <span className="block text-xs uppercase tracking-wide text-muted-foreground">Decimal</span>
          <input
            type="number"
            min={0}
            max={255}
            value={value}
            onChange={(e) => setValue(Math.max(0, Math.min(255, Number(e.target.value) || 0)))}
            className="mt-1 w-28 rounded-md border bg-background px-2 py-1 font-mono"
          />
        </label>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Hex</p>
          <p className="font-mono text-2xl">0x{value.toString(16).padStart(2, "0")}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">ASCII (if printable)</p>
          <p className="font-mono text-2xl">{value >= 32 && value < 127 ? String.fromCharCode(value) : "·"}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-8 gap-2">
        {bits.map((bit, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`rounded-md py-3 font-mono text-lg ring-1 ring-foreground/10 ${bit ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            aria-pressed={bit === 1}
            aria-label={`Bit ${7 - i}`}
          >
            {bit}
            <span className="mt-1 block text-[10px] opacity-70">{2 ** (7 - i)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
