import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil } from "lucide-react";
import { Button, CheckControl, Modal, TextField } from "./controls";
import { IconButton } from "@/routes/index";
import type { Item } from "@/lib/store";

export function ItemRow({
  item,
  indent,
  reorder,
  first,
  last,
  onToggle,
  onMove,
  onEdit,
}: {
  item: Item;
  indent?: boolean;
  reorder: boolean;
  first: boolean;
  last: boolean;
  onToggle: () => void;
  onMove: (dir: -1 | 1) => void;
  onEdit: () => void;
}) {
  return (
    <li className={`flex items-center ${indent ? "pl-6" : ""}`}>
      <CheckControl
        checked={item.done}
        onChange={onToggle}
        label={`${item.done ? "Mark incomplete" : "Mark complete"}: ${item.name}`}
      />
      <button
        type="button"
        onClick={onEdit}
        className="min-w-0 flex-1 py-2.5 pr-2 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
      >
        <span
          className={`block truncate text-[0.95rem] transition-colors duration-150 ${
            item.done ? "text-subtle-foreground line-through" : "text-foreground"
          }`}
        >
          {item.name}
        </span>
      </button>
      {reorder ? (
        <div className="flex shrink-0 items-center pr-1">
          <IconButton label={`Move ${item.name} up`} onClick={() => onMove(-1)} disabled={first}>
            <ArrowUp className="h-4 w-4" />
          </IconButton>
          <IconButton label={`Move ${item.name} down`} onClick={() => onMove(1)} disabled={last}>
            <ArrowDown className="h-4 w-4" />
          </IconButton>
        </div>
      ) : (
        <IconButton label={`Edit ${item.name}`} onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </IconButton>
      )}
    </li>
  );
}

export function ItemForm({
  open,
  initialName,
  mode,
  onClose,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  initialName: string;
  mode: "new" | "edit";
  onClose: () => void;
  onSubmit: (name: string) => void;
  onDelete?: (() => void) | undefined;
}) {
  const [name, setName] = useState(initialName);
  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={mode === "new" ? "New item" : "Edit item"}>
      <TextField label="Name" value={name} onChange={setName} placeholder="Print prototype" onSubmit={submit} />
      <div className="mt-6 flex items-center justify-end gap-2">
        {onDelete ? (
          <div className="mr-auto">
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          </div>
        ) : null}
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!name.trim()}>
          {mode === "new" ? "Create" : "Save"}
        </Button>
      </div>
    </Modal>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-4 pb-1 pt-6 font-display text-[0.7rem] uppercase tracking-[0.22em] text-subtle-foreground">
      {children}
    </h2>
  );
}
