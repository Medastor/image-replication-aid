import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { PALETTE, colorValue, type ColorId } from "@/lib/colors";

export function CheckControl({
  checked,
  onChange,
  label,
  color,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span
        aria-hidden
        className="grid h-[18px] w-[18px] place-items-center rounded-full border transition-colors duration-150"
        style={{
          borderColor: color ?? "var(--check-border)",
          backgroundColor: checked ? (color ?? "var(--check-fill)") : "transparent",
        }}
      >
        {checked ? <Check className="h-3 w-3 text-background" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLElement>("input,button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-0 sm:items-center sm:px-4">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[600px] rounded-t-xl border-t border-border bg-surface px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-5 sm:rounded-xl sm:border"
      >
        <h2 className="font-display text-sm uppercase tracking-[0.18em] text-muted-foreground">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  onSubmit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}) {
  return (
    <label className="block">
      <span className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) onSubmit();
        }}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-3 text-[0.95rem] text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
    </label>
  );
}

export function ColorPicker({ value, onChange }: { value: ColorId; onChange: (c: ColorId) => void }) {
  return (
    <fieldset className="mt-5">
      <legend className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">Color</legend>
      <div className="mt-3 flex flex-wrap gap-1">
        {PALETTE.map((c) => {
          const selected = c.id === value;
          return (
            <button
              key={c.id}
              type="button"
              aria-label={c.label}
              aria-pressed={selected}
              onClick={() => onChange(c.id)}
              className="grid h-11 w-11 place-items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span
                aria-hidden
                className="grid h-5 w-5 place-items-center rounded-full"
                style={{ backgroundColor: colorValue(c.id) }}
              >
                {selected ? <Check className="h-3 w-3 text-background" strokeWidth={3} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-foreground/90 text-background hover:bg-foreground",
    ghost: "border border-border text-foreground hover:bg-elevated",
    danger: "border border-destructive/60 text-destructive hover:bg-destructive/10",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`min-h-11 rounded-md px-4 text-[0.85rem] uppercase tracking-[0.12em] transition-colors disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${styles}`}
    >
      {children}
    </button>
  );
}

export function ConfirmDelete({
  open,
  onClose,
  onConfirm,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-[0.9rem] leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

export function useDialog<T = true>() {
  const [state, setState] = useState<T | null>(null);
  return {
    state,
    open: (v: T) => setState(v),
    close: () => setState(null),
    isOpen: state !== null,
  };
}
