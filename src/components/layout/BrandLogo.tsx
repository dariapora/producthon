import { Link } from "@tanstack/react-router";

type BrandLogoProps = {
  className?: string;
  variant?: "dark" | "light";
};

export function BrandLogo({ className = "", variant = "dark" }: BrandLogoProps) {
  return (
    <Link
      to="/"
      search={{}}
      aria-label="EDUconnect, pagina principală"
      className={`inline-flex shrink-0 items-baseline font-display text-[22px] font-bold leading-none tracking-[-0.04em] sm:text-[26px] ${className}`}
    >
      <span aria-hidden="true" className="text-[#2563EB]">
        E
      </span>
      <span aria-hidden="true" className="text-[#EAB308]">
        D
      </span>
      <span aria-hidden="true" className="text-[#DC2626]">
        U
      </span>
      <span aria-hidden="true" className={variant === "light" ? "text-white" : "text-ink"}>
        connect
      </span>
    </Link>
  );
}
