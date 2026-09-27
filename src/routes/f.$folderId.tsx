import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Pencil, Plus } from "lucide-react";
import { Header, Screen } from "@/components/shell";
import { Button, CheckControl, ColorPicker, ConfirmDelete, Modal, TextField } from "@/components/controls";
import { ItemForm, ItemRow, SectionLabel } from "@/components/rows";
import { EmptyState, IconButton } from "@/routes/index";
import { colorValue, DEFAULT_COLOR, type ColorId } from "@/lib/colors";
import { byOrder, useStore, type Item, type Project } from "@/lib/store";

export const Route = createFileRoute("/f/$folderId")({
  head: () => ({
    meta: [
      { title: "Folder — Hierarchy" },
      { name: "description", content: "Projects and items inside this folder." },
      { property: "og:title", content: "Folder — Hierarchy" },
      { property: "og:description", content: "Projects and items inside this folder." },
    ],
  }),
  component: FolderDetail,
});

function FolderDetail() {
  const { folderId } = Route.useParams();
  const navigate = useNavigate();
  const store = useStore();
  const { data } = store;

  const folder = data.folders.find((f) => f.id === folderId);
  const [reorder, setReorder] = useState(false);
  const [creating, setCreating] = useState<null | "menu" | "project" | "item">(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  // Which parent a new item should be created under: null = direct in the folder,
  // otherwise the id of a specific project. Only meaningful while creating (not editing).
  const [itemProjectId, setItemProjectId] = useState<string | null>(null);

  if (!folder) {
    return (
      <Screen>
        <Header title="Not found" back />
        <p className="px-4 py-8 text-sm text-muted-foreground">This folder no longer exists.</p>
      </Screen>
    );
  }

  const projects = data.projects.filter((p) => p.folderId === folder.id).sort(byOrder);
  const directItems = data.items.filter((i) => i.folderId === folder.id && i.projectId === null).sort(byOrder);

  return (
    <Screen>
      <Header
        title={folder.name}
        back
        color={colorValue(folder.color)}
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
              aria-label="Create"
              onClick={() => setCreating("menu")}
              className="grid h-10 w-10 place-items-center rounded-md border border-border text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {projects.length === 0 && directItems.length === 0 ? (
        <EmptyState
          title="Empty folder"
          description="This folder doesn't contain any projects or items yet."
          actionLabel="Add project or item"
          onAction={() => setCreating("menu")}
        />
      ) : null}

      {projects.length > 0 ? (
        <>
          <SectionLabel>Projects</SectionLabel>
          <ul className="px-1">
            {projects.map((p, pi) => {
              const items = data.items.filter((i) => i.projectId === p.id).sort(byOrder);
              return (
                <li key={p.id} className="border-b border-border/40 last:border-b-0">
                  <div className="flex items-center">
                    <CheckControl
                      checked={p.done}
                      onChange={() => store.toggleProject(p.id)}
                      color={colorValue(p.color)}
                      label={`${p.done ? "Mark project incomplete" : "Mark project complete"}: ${p.name}`}
                    />
                    <Link
                      to="/f/$folderId/p/$projectId"
                      params={{ folderId: folder.id, projectId: p.id }}
                      className="min-w-0 flex-1 py-3 pr-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                    >
                      <span
                        className={`block truncate text-[0.95rem] uppercase tracking-[0.08em] transition-colors ${
                          p.done ? "text-subtle-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {p.name}
                      </span>
                    </Link>
                    {reorder ? (
                      <div className="flex shrink-0 items-center pr-1">
                        <IconButton label={`Move ${p.name} up`} onClick={() => store.moveProject(p.id, -1)} disabled={pi === 0}>
                          <ArrowUp className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          label={`Move ${p.name} down`}
                          onClick={() => store.moveProject(p.id, 1)}
                          disabled={pi === projects.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </IconButton>
                      </div>
                    ) : (
                      <>
                        <IconButton label={`Edit ${p.name}`} onClick={() => setEditingProject(p)}>
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        {items.length > 0 ? (
                          <IconButton
                            label={`${p.collapsed ? "Expand" : "Collapse"} ${p.name}`}
                            onClick={() => store.toggleCollapsed(p.id)}
                          >
                            {p.collapsed ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </IconButton>
                        ) : (
                          <span className="w-11" aria-hidden />
                        )}
                      </>
                    )}
                  </div>

                  {!p.collapsed ? (
                    <ul className="pb-2">
                      {items.map((it, ii) => (
                        <ItemRow
                          key={it.id}
                          item={it}
                          indent
                          reorder={reorder}
                          first={ii === 0}
                          last={ii === items.length - 1}
                          onToggle={() => store.toggleItem(it.id)}
                          onMove={(dir) => store.moveItem(it.id, dir)}
                          onEdit={() => setEditingItem(it)}
                        />
                      ))}
                      {!reorder ? (
                        <li className="pl-6">
                          <button
                            type="button"
                            onClick={() => {
                              setItemProjectId(p.id);
                              setCreating("item");
                            }}
                            className="flex min-h-10 items-center gap-1.5 py-2 text-[0.85rem] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add item
                          </button>
                        </li>
                      ) : null}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {directItems.length > 0 ? (
        <>
          <SectionLabel>Items</SectionLabel>
          <ul className="px-1">
            {directItems.map((it, i) => (
              <ItemRow
                key={it.id}
                item={it}
                reorder={reorder}
                first={i === 0}
                last={i === directItems.length - 1}
                onToggle={() => store.toggleItem(it.id)}
                onMove={(dir) => store.moveItem(it.id, dir)}
                onEdit={() => setEditingItem(it)}
              />
            ))}
          </ul>
        </>
      ) : null}

      <Modal open={creating === "menu"} onClose={() => setCreating(null)} title="Create">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" onClick={() => setCreating("project")}>
            + New project
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setItemProjectId(null);
              setCreating("item");
            }}
          >
            + New item
          </Button>
        </div>
      </Modal>

      <ProjectForm
        key={editingProject?.id ?? "new-project"}
        open={creating === "project" || editingProject !== null}
        project={editingProject}
        onClose={() => {
          setCreating(null);
          setEditingProject(null);
        }}
        onSubmit={(name, color) => {
          if (editingProject) store.updateProject(editingProject.id, { name, color });
          else store.addProject(folder.id, name, color);
        }}
        onDelete={
          editingProject
            ? () => {
                const p = editingProject;
                setEditingProject(null);
                setDeletingProject(p);
              }
            : undefined
        }
      />

      <ItemForm
        key={editingItem?.id ?? "new-item"}
        open={creating === "item" || editingItem !== null}
        mode={editingItem ? "edit" : "new"}
        initialName={editingItem?.name ?? ""}
        onClose={() => {
          setCreating(null);
          setEditingItem(null);
          setItemProjectId(null);
        }}
        onSubmit={(name) => {
          if (editingItem) store.updateItem(editingItem.id, { name });
          else store.addItem(folder.id, itemProjectId, name);
        }}
        onDelete={
          editingItem
            ? () => {
                store.deleteItem(editingItem.id);
                setEditingItem(null);
              }
            : undefined
        }
      />

      <ConfirmDelete
        open={deletingProject !== null}
        onClose={() => setDeletingProject(null)}
        onConfirm={() => {
          if (deletingProject) store.deleteProject(deletingProject.id);
          setDeletingProject(null);
          navigate({ to: "/f/$folderId", params: { folderId: folder.id } });
        }}
        title={`Delete "${deletingProject?.name ?? ""}"?`}
        description="This will permanently delete the project and every item inside it."
      />
    </Screen>
  );
}

export function ProjectForm({
  open,
  project,
  onClose,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSubmit: (name: string, color: ColorId) => void;
  onDelete?: (() => void) | undefined;
}) {
  const [name, setName] = useState(project?.name ?? "");
  const [color, setColor] = useState<ColorId>(project?.color ?? DEFAULT_COLOR);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed, color);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={project ? "Edit project" : "New project"}>
      <TextField label="Name" value={name} onChange={setName} placeholder="MTG Deckbox" onSubmit={submit} />
      <ColorPicker value={color} onChange={setColor} />
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
          {project ? "Save" : "Create"}
        </Button>
      </div>
    </Modal>
  );
}
