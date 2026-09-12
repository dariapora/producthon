import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { BrandLogo } from "@/components/layout/BrandLogo";

export function TopNav() {
  const location = useRouterState({ select: (state) => state.location });
  const search = location.search as Record<string, unknown>;
  const hasActiveChoice = location.pathname !== "/" || search.journey === "school";

  return (
    <header className="sticky top-0 z-20 border-b-2 border-line bg-card/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-[1320px] items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <BrandLogo />
        {hasActiveChoice ? (
          <Link
            to="/"
            search={{}}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border-2 border-brand bg-card px-3 py-2 text-sm font-semibold text-brand sm:px-4 sm:text-base"
          >
            <ArrowLeft size={21} aria-hidden />
            <span className="hidden sm:inline">Revino la meniul principal</span>
            <span className="sm:hidden">Meniu</span>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
