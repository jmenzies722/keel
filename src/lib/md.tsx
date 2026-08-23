import type { ReactNode } from "react";

/** Constrained markdown: paragraphs, **bold**, `code`, lists, ## headings. */
export function Markdown({ md, className }: { md: string; className?: string }) {
  const blocks = md.trim().split(/\n{2,}/);
  return (
    <div className={className ?? "prose-lesson"}>
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return <h2 key={i}>{inline(block.slice(3))}</h2>;
        }
        if (block.startsWith("- ")) {
          const items = block.split("\n").filter((l) => l.startsWith("- "));
          return (
            <ul key={i}>
              {items.map((item, j) => (
                <li key={j}>{inline(item.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(block)}</p>;
      })}
    </div>
  );
}

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    return <span key={i}>{part}</span>;
  });
}
