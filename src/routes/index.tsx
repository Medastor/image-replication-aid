import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Plus, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { Screen, Header } from "@/components/shell";
import { Button, ColorPicker, ConfirmDelete, Modal, TextField } from "@/components/controls";
import { colorValue, DEFAULT_COLOR, type ColorId } from "@/lib/colors";
import { byOrder, useStore, type Folder } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Folders — GestionAdri" },
      {
        name: "description",
        content: "Your folders, projects and items in one quiet, dark, personal structure.",
      },
      { property: "og:title", content: "Folders — GestionAdri" },
      {
        property: "og:description",
        content: "Your folders, projects and items in one quiet, dark, personal structure.",
      },
    ],
  }),
  component: FoldersScreen,
});

function FoldersScreen() {
  const { data, ready, addFolder, updateFolder, deleteFolder, moveFolder } = useStore();
  const [editing, setEditing] = useState<Folder | "new" | null>(null);
  const [reorder, setReorder] = useState(false);
  const [deleting, setDeleting] = useState<Folder | null>(null);

  const folders = [...data.folders].sort(byOrder);

  return (
    <Screen>
      <Header
        title="Folders"
        action={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setReorder((r) => !r)}
              aria-pressed={reorder}
              className={`min-h-10 rounded-md px-3 text-[0.7rem] uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                reorder ? "bg-elevated text-foreground" : "text-muted-foreground"
              }`}
            >
              {reorder ? "Done" : "Reorder"}
            </button>
            <button
              type="button"
              aria-label="New folder"
              onClick={() => setEditing("new")}
              className="grid h-10 w-10 place-items-center rounded-md border border-border text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {ready && folders.length === 0 ? (
        <EmptyState
          title="No folders"
          description="Create your first folder to start organizing."
          actionLabel="Add folder"
          onAction={() => setEditing("new")}
        />
      ) : null}

      <ul className="px-1 pt-2">
        {folders.map((f, i) => (
          <li key={f.id} className="border-b border-border/40 last:border-b-0">
            <div className="flex items-center">
              <Link
                to="/f/$folderId"
                params={{ folderId: f.id }}
                className="flex min-w-0 flex-1 items-center gap-3 px-3 py-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colorValue(f.color) }}
                />
                <span className="truncate text-[0.98rem] tracking-[0.02em] text-foreground">{f.name}</span>
                <span className="ml-auto shrink-0 text-[0.75rem] tabular-nums text-subtle-foreground">
                  {data.projects.filter((p) => p.folderId === f.id).length +
                    data.items.filter((it) => it.folderId === f.id).length}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-subtle-foreground" aria-hidden />
              </Link>
              {reorder ? (
                <div className="flex shrink-0 items-center pr-2">
                  <IconButton label={`Move ${f.name} up`} onClick={() => moveFolder(f.id, -1)} disabled={i === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    label={`Move ${f.name} down`}
                    onClick={() => moveFolder(f.id, 1)}
                    disabled={i === folders.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </IconButton>
                </div>
              ) : (
                <IconButton label={`Edit ${f.name}`} onClick={() => setEditing(f)}>
                  <Pencil className="h-4 w-4" />
                </IconButton>
              )}
            </div>
          </li>
        ))}
      </ul>

      <FolderForm
        key={editing === "new" ? "new" : (editing?.id ?? "none")}
        target={editing}
        onClose={() => setEditing(null)}
        onCreate={(name, color) => addFolder(name, color)}
        onSave={(id, name, color) => updateFolder(id, { name, color })}
        onDelete={(f) => {
          setEditing(null);
          setDeleting(f);
        }}
      />

      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteFolder(deleting.id);
          setDeleting(null);
        }}
        title={`Delete "${deleting?.name ?? ""}"?`}
        description="This will permanently delete the folder and every project and item inside it."
      />
    </Screen>
  );
}

export function IconButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-subtle-foreground transition-colors hover:text-foreground disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
    >
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="px-5 py-12">
      <p className="font-display text-[0.8rem] uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <p className="mt-2 text-[0.9rem] text-subtle-foreground">{description}</p>
      <div className="mt-5">
        <Button variant="ghost" onClick={onAction}>
          + {actionLabel}
        </Button>
      </div>
    </div>
  );
}

function FolderForm({
  target,
  onClose,
  onCreate,
  onSave,
  onDelete,
}: {
  target: Folder | "new" | null;
  onClose: () => void;
  onCreate: (name: string, color: ColorId) => void;
  onSave: (id: string, name: string, color: ColorId) => void;
  onDelete: (f: Folder) => void;
}) {
  const isNew = target === "new";
  const folder = target && target !== "new" ? target : null;
  const [name, setName] = useState(folder?.name ?? "");
  const [color, setColor] = useState<ColorId>(folder?.color ?? DEFAULT_COLOR);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (isNew) onCreate(trimmed, color);
    else if (folder) onSave(folder.id, trimmed, color);
    onClose();
  };

  return (
    <Modal open={target !== null} onClose={onClose} title={isNew ? "New folder" : "Edit folder"}>
      <TextField label="Name" value={name} onChange={setName} placeholder="3D Printing" onSubmit={submit} />
      <ColorPicker value={color} onChange={setColor} />
      <div className="mt-6 flex items-center justify-end gap-2">
        {folder ? (
          <div className="mr-auto">
            <Button variant="danger" onClick={() => onDelete(folder)}>
              Delete
            </Button>
          </div>
        ) : null}
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!name.trim()}>
          {isNew ? "Create" : "Save"}
        </Button>
      </div>
    </Modal>
  );
}
