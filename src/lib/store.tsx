import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_COLOR, type ColorId } from "./colors";

export type Folder = {
  id: string;
  name: string;
  color: ColorId;
  order: number;
};

export type Project = {
  id: string;
  folderId: string;
  name: string;
  color: ColorId;
  done: boolean;
  collapsed: boolean;
  order: number;
};

export type Item = {
  id: string;
  folderId: string;
  projectId: string | null;
  name: string;
  done: boolean;
  order: number;
};

export type Data = {
  version: 1;
  folders: Folder[];
  projects: Project[];
  items: Item[];
};

const STORAGE_KEY = "hierarchy.v1";

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function seed(): Data {
  const folders: Folder[] = [
    { id: "f-3d", name: "3D Printing", color: "teal", order: 0 },
    { id: "f-bg", name: "Board Games", color: "orange", order: 1 },
    { id: "f-cm", name: "Commissions", color: "violet", order: 2 },
  ];
  const projects: Project[] = [
    {
      id: "p-mtg",
      folderId: "f-3d",
      name: "MTG Deckbox",
      color: "blue",
      done: false,
      collapsed: false,
      order: 0,
    },
    {
      id: "p-a1",
      folderId: "f-3d",
      name: "Bambu A1 Maintenance",
      color: "green",
      done: false,
      collapsed: true,
      order: 1,
    },
    {
      id: "p-fg",
      folderId: "f-bg",
      name: "Final Girl",
      color: "red",
      done: false,
      collapsed: false,
      order: 0,
    },
    {
      id: "p-ch",
      folderId: "f-cm",
      name: "Charmander",
      color: "yellow",
      done: false,
      collapsed: false,
      order: 0,
    },
  ];
  const mk = (folderId: string, projectId: string | null, names: string[], doneIdx: number[] = []) =>
    names.map((name, i) => ({
      id: uid(),
      folderId,
      projectId,
      name,
      done: doneIdx.includes(i),
      order: i,
    }));

  const items: Item[] = [
    ...mk("f-3d", "p-mtg", ["Design rails", "Print prototype", "Test tolerances", "Modify tolerances"], [1]),
    ...mk("f-3d", "p-a1", ["Clean bed", "Clean nozzle", "Check belts"]),
    ...mk("f-3d", null, ["Buy black PLA", "Order magnets"]),
    ...mk("f-bg", "p-fg", ["Print shelves", "Organize boxes", "Paint miniatures"], [0]),
    ...mk("f-cm", "p-ch", ["Prepare model", "Print", "Clean", "Paint", "Photograph"]),
  ];

  return { version: 1, folders, projects, items };
}

type Ctx = {
  data: Data;
  ready: boolean;
  addFolder: (name: string, color: ColorId) => string;
  updateFolder: (id: string, patch: Partial<Pick<Folder, "name" | "color">>) => void;
  deleteFolder: (id: string) => void;
  moveFolder: (id: string, dir: -1 | 1) => void;

  addProject: (folderId: string, name: string, color: ColorId) => string;
  updateProject: (id: string, patch: Partial<Pick<Project, "name" | "color">>) => void;
  deleteProject: (id: string) => void;
  toggleProject: (id: string) => void;
  toggleCollapsed: (id: string) => void;
  moveProject: (id: string, dir: -1 | 1) => void;

  addItem: (folderId: string, projectId: string | null, name: string) => string;
  updateItem: (id: string, patch: Partial<Pick<Item, "name">>) => void;
  deleteItem: (id: string) => void;
  toggleItem: (id: string) => void;
  moveItem: (id: string, dir: -1 | 1) => void;
};

// Keep a single context instance across hot reloads / duplicate module URLs.
const g = globalThis as unknown as { __hierarchyStoreCtx?: React.Context<Ctx | null> };
const StoreContext = (g.__hierarchyStoreCtx ??= createContext<Ctx | null>(null));

function reindex<T extends { order: number }>(list: T[]): T[] {
  return list.map((x, i) => ({ ...x, order: i }));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(() => ({ version: 1, folders: [], projects: [], items: [] }));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setData(raw ? (JSON.parse(raw) as Data) : seed());
    } catch {
      setData(seed());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable */
    }
  }, [data, ready]);

  const move = useCallback(
    <T extends { id: string; order: number }>(list: T[], id: string, dir: -1 | 1, sameGroup: (a: T) => boolean) => {
      const group = list.filter(sameGroup).sort((a, b) => a.order - b.order);
      const idx = group.findIndex((x) => x.id === id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= group.length) return list;
      const next = [...group];
      const a = next[idx] as T;
      const b = next[target] as T;
      next[idx] = b;
      next[target] = a;
      const ordered = reindex(next);
      return list.map((x) => ordered.find((o) => o.id === x.id) ?? x);
    },
    [],
  );

  const value = useMemo<Ctx>(() => {
    const api: Ctx = {
      data,
      ready,
      addFolder: (name, color) => {
        const id = uid();
        setData((d) => ({
          ...d,
          folders: [...d.folders, { id, name, color, order: d.folders.length }],
        }));
        return id;
      },
      updateFolder: (id, patch) =>
        setData((d) => ({ ...d, folders: d.folders.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),
      deleteFolder: (id) =>
        setData((d) => ({
          ...d,
          folders: reindex(d.folders.filter((f) => f.id !== id).sort((a, b) => a.order - b.order)),
          projects: d.projects.filter((p) => p.folderId !== id),
          items: d.items.filter((i) => i.folderId !== id),
        })),
      moveFolder: (id, dir) => setData((d) => ({ ...d, folders: move(d.folders, id, dir, () => true) })),

      addProject: (folderId, name, color) => {
        const id = uid();
        setData((d) => ({
          ...d,
          projects: [
            ...d.projects,
            {
              id,
              folderId,
              name,
              color,
              done: false,
              collapsed: false,
              order: d.projects.filter((p) => p.folderId === folderId).length,
            },
          ],
        }));
        return id;
      },
      updateProject: (id, patch) =>
        setData((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      deleteProject: (id) =>
        setData((d) => {
          const p = d.projects.find((x) => x.id === id);
          const rest = d.projects.filter((x) => x.id !== id);
          return {
            ...d,
            projects: p
              ? rest.map((x) =>
                  x.folderId === p.folderId
                    ? { ...x, order: rest.filter((y) => y.folderId === p.folderId).sort((a, b) => a.order - b.order).findIndex((y) => y.id === x.id) }
                    : x,
                )
              : rest,
            items: d.items.filter((i) => i.projectId !== id),
          };
        }),
      toggleProject: (id) =>
        setData((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, done: !p.done } : p)) })),
      toggleCollapsed: (id) =>
        setData((d) => ({
          ...d,
          projects: d.projects.map((p) => (p.id === id ? { ...p, collapsed: !p.collapsed } : p)),
        })),
      moveProject: (id, dir) =>
        setData((d) => {
          const p = d.projects.find((x) => x.id === id);
          if (!p) return d;
          return { ...d, projects: move(d.projects, id, dir, (x) => x.folderId === p.folderId) };
        }),

      addItem: (folderId, projectId, name) => {
        const id = uid();
        setData((d) => ({
          ...d,
          items: [
            ...d.items,
            {
              id,
              folderId,
              projectId,
              name,
              done: false,
              order: d.items.filter((i) => i.folderId === folderId && i.projectId === projectId).length,
            },
          ],
        }));
        return id;
      },
      updateItem: (id, patch) =>
        setData((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      deleteItem: (id) => setData((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) })),
      toggleItem: (id) =>
        setData((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)) })),
      moveItem: (id, dir) =>
        setData((d) => {
          const it = d.items.find((x) => x.id === id);
          if (!it) return d;
          return {
            ...d,
            items: move(d.items, id, dir, (x) => x.folderId === it.folderId && x.projectId === it.projectId),
          };
        }),
    };
    return api;
  }, [data, ready, move]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;
export { DEFAULT_COLOR };
