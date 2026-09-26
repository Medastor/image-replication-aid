import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Header, Screen } from "@/components/shell";
import { CheckControl, ConfirmDelete } from "@/components/controls";
import { ItemForm, ItemRow, SectionLabel } from "@/components/rows";
import { EmptyState } from "@/routes/index";
import { ProjectForm } from "@/routes/f.$folderId";
import { colorValue } from "@/lib/colors";
import { byOrder, useStore, type Item } from "@/lib/store";

export const Route = createFileRoute("/f/$folderId/p/$projectId")({
  head: () => ({
    meta: [
      { title: "Project — Hierarchy" },
      { name: "description", content: "Items inside this project." },
      { property: "og:title", content: "Project — Hierarchy" },
      { property: "og:description", content: "Items inside this project." },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { folderId, projectId } = Route.useParams();
  const navigate = useNavigate();
  const store = useStore();
  const project = store.data.projects.find((p) => p.id === projectId);

  const [reorder, setReorder] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingProject, setEditingProject] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!project) {
    return (
      <Screen>
        <Header title="Not found" back />
        <p className="px-4 py-8 text-sm text-muted-foreground">This project no longer exists.</p>
      </Screen>
    );
  }

  const items = store.data.items.filter((i) => i.projectId === project.id).sort(byOrder);

  return (
    <Screen>
      <Header
        title={project.name}
        back
        color={colorValue(project.color)}
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
              aria-label="New item"
              onClick={() => setCreating(true)}
              className="grid h-10 w-10 place-items-center rounded-md border border-border text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="flex items-center border-b border-border/40 px-1 py-1">
        <CheckControl
          checked={project.done}
          onChange={() => store.toggleProject(project.id)}
          color={colorValue(project.color)}
          label={`${project.done ? "Mark project incomplete" : "Mark project complete"}: ${project.name}`}
        />
        <span
          className={`min-w-0 flex-1 truncate text-[0.9rem] uppercase tracking-[0.1em] ${
            project.done ? "text-subtle-foreground line-through" : "text-muted-foreground"
          }`}
        >
          {project.done ? "Project complete" : "Project in progress"}
        </span>
        <button
          type="button"
          onClick={() => setEditingProject(true)}
          className="min-h-11 rounded-md px-3 text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Edit
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No items"
          description="This project doesn't contain any items yet."
          actionLabel="Add item"
          onAction={() => setCreating(true)}
        />
      ) : (
        <>
          <SectionLabel>Items</SectionLabel>
          <ul className="px-1">
            {items.map((it, i) => (
              <ItemRow
                key={it.id}
                item={it}
                reorder={reorder}
                first={i === 0}
                last={i === items.length - 1}
                onToggle={() => store.toggleItem(it.id)}
                onMove={(dir) => store.moveItem(it.id, dir)}
                onEdit={() => setEditingItem(it)}
              />
            ))}
          </ul>
        </>
      )}

      <ItemForm
        key={editingItem?.id ?? "new-item"}
        open={creating || editingItem !== null}
        mode={editingItem ? "edit" : "new"}
        initialName={editingItem?.name ?? ""}
        onClose={() => {
          setCreating(false);
          setEditingItem(null);
        }}
        onSubmit={(name) => {
          if (editingItem) store.updateItem(editingItem.id, { name });
          else store.addItem(folderId, project.id, name);
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

      <ProjectForm
        key={project.id}
        open={editingProject}
        project={project}
        onClose={() => setEditingProject(false)}
        onSubmit={(name, color) => store.updateProject(project.id, { name, color })}
        onDelete={() => {
          setEditingProject(false);
          setDeleting(true);
        }}
      />

      <ConfirmDelete
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={() => {
          store.deleteProject(project.id);
          setDeleting(false);
          navigate({ to: "/f/$folderId", params: { folderId } });
        }}
        title={`Delete "${project.name}"?`}
        description="This will permanently delete the project and every item inside it."
      />
    </Screen>
  );
}
