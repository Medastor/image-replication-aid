import { Link, useRouter } from "@tanstack/react-router";
import { FolderClosed, Search, Settings, ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[600px] flex-col bg-background">
      <div className="flex-1 pb-28">{children}</div>
      <BottomNav />
    </div>
  );
}

export function Header({
  title,
  back,
  color,
  action,
}: {
  title: string;
  back?: boolean;
  color?: string;
  action?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.9rem)] backdrop-blur">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {back ? (
            <button
              type="button"
              aria-label="Go back"
              onClick={() => router.history.back()}
              className="-ml-2 grid h-10 w-10 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : null}
          {color ? (
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
          ) : null}
          <h1 className="truncate font-display text-[1.05rem] font-medium uppercase tracking-[0.14em] text-foreground">
            {title}
          </h1>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

const NAV = [
  { to: "/", label: "Folders", icon: FolderClosed },
  { to: "/search", label: "Search", icon: Search },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[600px] border-t border-border/60 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="grid grid-cols-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group flex flex-col items-center gap-1 py-2.5 text-muted-foreground transition-colors data-[status=active]:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="text-[0.68rem] uppercase tracking-[0.14em]">{label}</span>
              <span
                aria-hidden
                className="h-px w-6 bg-transparent group-data-[status=active]:bg-foreground/70"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
