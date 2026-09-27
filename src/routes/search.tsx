import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Header, Screen } from "@/components/shell";
import { colorValue } from "@/lib/colors";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — GestionAdri" },
      { name: "description", content: "Search across folders, projects and items." },
      { property: "og:title", content: "Search — GestionAdri" },
      { property: "og:description", content: "Search across folders, projects and items." },
    ],
  }),
  component: SearchScreen,
});

type Result = {
  id: string;
  kind: "Folder" | "Project" | "Item";
  name: string;
  path: string;
  color: string;
  done?: boolean;
  go: () => void;
};

function SearchScreen() {
  const { data } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const folderById = new Map(data.folders.map((f) => [f.id, f]));
    const projectById = new Map(data.projects.map((p) => [p.id, p]));
    const out: Result[] = [];

    for (const f of data.folders) {
      if (f.name.toLowerCase().includes(term)) {
        out.push({
          id: f.id,
          kind: "Folder",
          name: f.name,
          path: "",
          color: colorValue(f.color),
          go: () => navigate({ to: "/f/$folderId", params: { folderId: f.id } }),
        });
      }
    }
    for (const p of data.projects) {
      if (p.name.toLowerCase().includes(term)) {
        out.push({
          id: p.id,
          kind: "Project",
          name: p.name,
          path: folderById.get(p.folderId)?.name ?? "",
          color: colorValue(p.color),
          done: p.done,
          go: () =>
            navigate({
              to: "/f/$folderId/p/$projectId",
              params: { folderId: p.folderId, projectId: p.id },
            }),
        });
      }
    }
    for (const it of data.items) {
      if (it.name.toLowerCase().includes(term)) {
        const folder = folderById.get(it.folderId);
        const project = it.projectId ? projectById.get(it.projectId) : null;
        out.push({
          id: it.id,
          kind: "Item",
          name: it.name,
          path: [folder?.name, project?.name].filter(Boolean).join("  ›  "),
          color: colorValue(project?.color ?? folder?.color ?? "neutral"),
          done: it.done,
          go: () =>
            project
              ? navigate({
                  to: "/f/$folderId/p/$projectId",
                  params: { folderId: it.folderId, projectId: project.id },
                })
              : navigate({ to: "/f/$folderId", params: { folderId: it.folderId } }),
        });
      }
    }
    return out;
  }, [q, data, navigate]);

  return (
    <Screen>
      <Header title="Search" />
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-subtle-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search folders, projects or items"
            placeholder="Search folders, projects or items…"
            className="min-w-0 flex-1 bg-transparent py-3 text-[0.95rem] text-foreground placeholder:text-subtle-foreground focus:outline-none"
          />
        </div>
      </div>

      {q.trim() && results.length === 0 ? (
        <p className="px-4 py-10 text-[0.9rem] text-subtle-foreground">No results for “{q.trim()}”.</p>
      ) : null}

      <ul className="px-1 pt-3">
        {results.map((r) => (
          <li key={`${r.kind}-${r.id}`} className="border-b border-border/40 last:border-b-0">
            <button
              type="button"
              onClick={r.go}
              className="flex w-full min-w-0 items-center gap-3 px-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
            >
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="min-w-0 flex-1">
                <span className="block text-[0.7rem] uppercase tracking-[0.18em] text-subtle-foreground">
                  {r.kind}
                  {r.path ? ` · ${r.path}` : ""}
                </span>
                <span
                  className={`mt-0.5 block truncate text-[0.95rem] ${
                    r.done ? "text-subtle-foreground line-through" : "text-foreground"
                  }`}
                >
                  {r.name}
                  {r.done ? <span className="sr-only"> (completed)</span> : null}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
