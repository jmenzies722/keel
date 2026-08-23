import type { Lesson } from "@/lib/curriculum/types";

export const representationLesson: Lesson = {
  id: "computing-foundations/representation",
  slug: "representation",
  phaseSlug: "computing-foundations",
  moduleSlug: "representation",
  order: 1,
  title: "Data representation",
  description:
    "Bits, bytes, binary, and hex — the notation every later system (memory, packets, tokens) is written in.",
  durationMin: 30,
  objectives: [
    "Convert between decimal, binary, and hexadecimal without a calculator.",
    "Explain a byte as eight bits and why powers of two dominate sizing.",
    "Read a hex dump well enough to see a length prefix or an ASCII string.",
    "Say what overflow and two’s complement are pointing at, even if you do not implement an ALU.",
  ],
  skillIds: ["cs.representation"],
  relatedIncidentIds: [],
  mentorContext:
    "Learner is on data representation. Stay concrete: bits, bytes, hex. Do not jump to LLMs.",
  sections: [
    {
      id: "objective",
      kind: "objective",
      title: "Objective",
      blocks: [
        {
          kind: "text",
          md: "Software is a story humans tell. Hardware stores **bits**. This lesson is the translation layer. You will not become a CPU designer. You will stop being surprised when a limit is 255, 4096, or 64KiB.",
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
          md: "A **bit** is a distinction: 0 or 1. *n* bits distinguish 2ⁿ states. Eight bits is a **byte** — 256 states, historically enough for a character set and still the addressable unit on most machines.\n\n**Hexadecimal** is binary grouped by fours. `0x4A` is `0100 1010`. Engineers use hex because a byte is two hex digits, and a memory address is readable.",
        },
        {
          kind: "callout",
          variant: "insight",
          title: "Why platform engineers still need this",
          md: "Page size (4KiB), CIDR masks, JWT length, GPU VRAM, KV-cache blocks — all of them are “how many bits do we have, and what did we decide they mean?”",
        },
      ],
    },
    {
      id: "visualization",
      kind: "visualization",
      title: "Binary explorer",
      blocks: [
        {
          kind: "text",
          md: "Toggle bits. Watch decimal and hex move together. This is the same object in three notations.",
        },
        {
          kind: "visualization",
          visualization: "binary-explorer",
          caption: "One byte. Three notations.",
        },
      ],
    },
    {
      id: "explanation",
      kind: "explanation",
      title: "Width, overflow, encoding",
      blocks: [
        {
          kind: "text",
          md: "An unsigned 8-bit integer cannot hold 256. That is **overflow**, not a mystery. Two’s complement reuses the high bit as sign so the same width can represent negatives — which is why `255` and `-1` are the same bit pattern in 8 bits.\n\nText is an encoding on top of bytes. ASCII `K` is `0x4B`. UTF-8 is ASCII for English letters and a multi-byte scheme beyond that. When a log shows `c3 a9`, that is UTF-8 for `é`, not corruption.",
        },
      ],
    },
    {
      id: "example",
      kind: "example",
      title: "Worked example",
      blocks: [
        {
          kind: "example",
          title: "Reading a tiny header",
          language: "text",
          code: "00 04 4b 65 65 6c",
          md: "Four-byte big-endian length `0x0004` then ASCII `Keel`. Length prefixes show up in protobuf, DNS labels, and almost every binary protocol.",
        },
      ],
    },
    {
      id: "exercise",
      kind: "exercise",
      title: "Try it",
      blocks: [
        {
          kind: "code-exercise",
          id: "binary-inspector",
          title: "Implement the conversions",
          brief: "Fill in `toBinary`, `toHex`, and `fromBinary` for non-negative integers. Width is the minimum number of bits, but at least 1.",
          language: "javascript",
          starterCode: `export function toBinary(n) {
  // return a string of 0/1 with no leading zeroes except for 0 itself
  return "";
}

export function toHex(n) {
  // lowercase, no 0x prefix
  return "";
}

export function fromBinary(bits) {
  // parse a 0/1 string
  return 0;
}
`,
          tests: [
            { name: "toBinary(0)", call: "toBinary(0)", expected: "0" },
            { name: "toBinary(13)", call: "toBinary(13)", expected: "1101" },
            { name: "toHex(74)", call: "toHex(74)", expected: "4a" },
            { name: "fromBinary('1001010')", call: "fromBinary('1001010')", expected: 74 },
          ],
          skillIds: ["cs.representation"],
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
          md: "When a config says `max-model-len 32768`, that is a **width** decision: how many token positions we reserve KV-cache blocks for. When a security group is `/32`, that is a **mask**. Representation is not trivia. It is how limits get into systems.",
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
          title: "Silent wrap",
          md: "An 8-bit replica count, a 16-bit port, a signed timeout that goes negative. Overflow that is not checked becomes an incident that looks like “random” behavior.",
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
          id: "representation-quiz",
          title: "Representation",
          skillIds: ["cs.representation"],
          questions: [
            {
              id: "q1",
              prompt: "How many distinct values can 12 bits represent?",
              options: [
                { id: "a", text: "12", explanation: "That is the width, not the state count." },
                { id: "b", text: "24", explanation: "Not 2×12." },
                { id: "c", text: "4096", explanation: "2¹² = 4096." },
                { id: "d", text: "2048", explanation: "That is 2¹¹." },
              ],
              correctOptionId: "c",
            },
            {
              id: "q2",
              prompt: "Why do engineers write bytes in hex?",
              options: [
                { id: "a", text: "Hex is required by the CPU.", explanation: "The CPU sees bits. Hex is for humans." },
                { id: "b", text: "One byte is exactly two hex digits, so dumps stay aligned.", explanation: "Correct." },
                { id: "c", text: "Hex uses fewer symbols than binary but the same number of digits.", explanation: "Hex uses fewer digits, not the same." },
                { id: "d", text: "ASCII cannot represent binary.", explanation: "ASCII can represent anything as text; hex is convenience." },
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
          kind: "text",
          md: "The conversion functions above *are* the lab. Submit them until the tests pass. That is implementation evidence for `cs.representation`.",
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
            { kind: "standard", title: "CS2023 — Software Development Fundamentals / Data representation", note: "ACM / IEEE-CS / AAAI" },
            { kind: "book", title: "Computer Systems: A Programmer’s Perspective — Ch. 2", note: "Bryant & O’Hallaron" },
          ],
        },
      ],
    },
  ],
};
