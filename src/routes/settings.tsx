import { createFileRoute } from "@tanstack/react-router";
import { Header, Screen } from "@/components/shell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — GestionAdri" },
      { name: "description", content: "Appearance and version information for GestionAdri." },
      { property: "og:title", content: "Settings — GestionAdri" },
      { property: "og:description", content: "Appearance and version information for GestionAdri." },
    ],
  }),
  component: SettingsScreen,
});

function SettingsScreen() {
  return (
    <Screen>
      <Header title="Settings" />
      <section className="px-4">
        <h2 className="pb-1 pt-6 font-display text-[0.7rem] uppercase tracking-[0.22em] text-subtle-foreground">
          Appearance
        </h2>
        <p className="border-b border-border/40 py-3 text-[0.92rem] text-muted-foreground">
          Dark mode permanently enabled.
        </p>
        <h2 className="pb-1 pt-6 font-display text-[0.7rem] uppercase tracking-[0.22em] text-subtle-foreground">
          Data
        </h2>
        <p className="border-b border-border/40 py-3 text-[0.92rem] text-muted-foreground">
          Stored locally on this device.
        </p>
        <h2 className="pb-1 pt-6 font-display text-[0.7rem] uppercase tracking-[0.22em] text-subtle-foreground">
          About
        </h2>
        <p className="py-3 text-[0.92rem] text-muted-foreground">GestionAdri — version 1.0.0</p>
      </section>
    </Screen>
  );
}
