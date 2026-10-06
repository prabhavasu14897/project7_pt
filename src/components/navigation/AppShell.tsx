import type { ReactNode } from "react";

interface AppShellProps {
  header: ReactNode;
  bottomNav?: ReactNode;
  skipLabel: string;
  children: ReactNode;
}

export function AppShell({ header, bottomNav, skipLabel, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary-dark px-4 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {skipLabel}
      </a>
      {header}
      {/* Bottom padding keeps content clear of the fixed mobile nav. */}
      <main id="main" tabIndex={-1} className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] focus:outline-none lg:pb-0">
        {children}
      </main>
      {bottomNav}
    </div>
  );
}
