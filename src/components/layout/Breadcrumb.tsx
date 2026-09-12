import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const NAV_LABELS = {
  home: "Acasă",
  national: "Situația națională",
  findSchool: "Caut ajutor pentru școala mea",
  ngoSupport: "Reprezint un ONG",
  recommendations: "Organizații potrivite",
} as const;

export type Crumb =
  | { label: string; to?: undefined; params?: undefined }
  | { label: string; to: "/"; params?: undefined }
  | { label: string; to: "/national"; params?: undefined }
  | { label: string; to: "/find-school"; params?: undefined }
  | {
      label: string;
      to: "/support";
      params?: undefined;
      search?: { ngoId?: string; scope?: "county" | "national" };
    }
  | { label: string; to: "/county/$county"; params: { county: string } }
  | {
      label: string;
      to: "/school/$schoolId";
      params: { schoolId: string };
      search?: { ngoId?: string; scope?: "county" | "national" };
    }
  | {
      label: string;
      to: "/school/$schoolId/support";
      params: { schoolId: string };
    };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Navigare ierarhică"
      className="flex flex-wrap items-center gap-2 text-sm font-semibold text-sub"
    >
      {items.map((item, i) => (
        <span className="inline-flex items-center gap-1" key={`${item.label}-${i}`}>
          {i > 0 && <ChevronLeft className="rotate-180" size={16} aria-hidden />}
          {item.to === "/" ? (
            <Link to="/" className="inline-flex min-h-12 items-center hover:text-ink">
              {item.label}
            </Link>
          ) : item.to === "/national" ? (
            <Link to="/national" className="inline-flex min-h-12 items-center hover:text-ink">
              {item.label}
            </Link>
          ) : item.to === "/find-school" ? (
            <Link to="/find-school" className="inline-flex min-h-12 items-center hover:text-ink">
              {item.label}
            </Link>
          ) : item.to === "/support" ? (
            <Link to="/support" search={item.search} className="hover:text-ink">
              {item.label}
            </Link>
          ) : item.to === "/county/$county" ? (
            <Link
              to="/county/$county"
              params={item.params}
              className="inline-flex min-h-12 items-center hover:text-ink"
            >
              {item.label}
            </Link>
          ) : item.to === "/school/$schoolId" ? (
            <Link
              to="/school/$schoolId"
              params={item.params}
              search={item.search}
              className="inline-flex min-h-12 items-center hover:text-ink"
            >
              {item.label}
            </Link>
          ) : item.to === "/school/$schoolId/support" ? (
            <Link
              to="/school/$schoolId/support"
              params={item.params}
              className="inline-flex min-h-12 items-center hover:text-ink"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
