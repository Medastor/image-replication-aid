export const PALETTE = [
  { id: "red", label: "Red", value: "oklch(0.62 0.10 25)" },
  { id: "orange", label: "Orange", value: "oklch(0.68 0.09 55)" },
  { id: "yellow", label: "Yellow", value: "oklch(0.76 0.08 95)" },
  { id: "green", label: "Green", value: "oklch(0.68 0.08 150)" },
  { id: "teal", label: "Teal", value: "oklch(0.68 0.07 190)" },
  { id: "blue", label: "Blue", value: "oklch(0.66 0.08 240)" },
  { id: "indigo", label: "Indigo", value: "oklch(0.60 0.08 275)" },
  { id: "violet", label: "Violet", value: "oklch(0.64 0.08 300)" },
  { id: "pink", label: "Pink", value: "oklch(0.68 0.08 350)" },
  { id: "neutral", label: "Neutral", value: "oklch(0.72 0.01 250)" },
] as const;

export type ColorId = (typeof PALETTE)[number]["id"];

export const DEFAULT_COLOR: ColorId = "neutral";

export function colorValue(id: string): string {
  return PALETTE.find((c) => c.id === id)?.value ?? PALETTE[PALETTE.length - 1].value;
}

export function colorLabel(id: string): string {
  return PALETTE.find((c) => c.id === id)?.label ?? "Neutral";
}
